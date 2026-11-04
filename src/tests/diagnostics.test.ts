import test from 'node:test';
import assert from 'node:assert/strict';
import { isPublicIpAddress, lookupDnsRecords, lookupDomainRdap, normalizeDomain, normalizeWebsiteUrl, parseDnsAnswer } from '../engines/diagnostics/browser';

test('domain normalization canonicalizes case, trailing dots, and IDNs', () => {
  assert.equal(normalizeDomain('ExAmPlE.com.'), 'example.com');
  assert.equal(normalizeDomain('münich.de'), 'xn--mnich-kva.de');
});

test('domain validation rejects URLs, paths, IP literals, and local names', () => {
  for (const value of ['https://example.com', 'example.com/path', '127.0.0.1', 'localhost', 'printer.local', 'bad host', 'example.com:443']) {
    assert.throws(() => normalizeDomain(value));
  }
});

test('website URL normalization permits standard HTTP(S) origins only', () => {
  assert.equal(normalizeWebsiteUrl('example.com'), 'https://example.com/');
  assert.equal(normalizeWebsiteUrl('http://example.com/path'), 'http://example.com/path');
  for (const value of [
    'ftp://example.com', 'https://user:pass@example.com', 'http://127.0.0.1',
    'http://localhost', 'https://example.com:8443', 'https://example.com/path with spaces',
  ]) {
    assert.throws(() => normalizeWebsiteUrl(value));
  }
});

test('public IPv4 filtering blocks private, loopback, link-local, shared and documentation ranges', () => {
  for (const value of [
    '0.0.0.0', '10.1.2.3', '100.64.0.1', '127.0.0.1', '169.254.10.2',
    '172.16.0.1', '172.31.255.254', '192.168.1.1', '192.0.2.1',
    '198.18.0.1', '198.51.100.2', '203.0.113.7', '224.0.0.1', '255.255.255.255',
  ]) assert.equal(isPublicIpAddress(value), false, value);

  assert.equal(isPublicIpAddress('1.1.1.1'), true);
  assert.equal(isPublicIpAddress('93.184.216.34'), true);
});

test('IPv6 filtering only allows global unicast outside special-purpose ranges', () => {
  for (const value of ['::', '::1', 'fc00::1', 'fd12:3456::1', 'fe80::1', 'ff02::1', '2001:db8::1', '2002::1']) {
    assert.equal(isPublicIpAddress(value), false, value);
  }
  assert.equal(isPublicIpAddress('2606:4700:4700::1111'), true);
});

test('DNS answer parsing normalizes MX priorities, TXT quoting, names and TTL', () => {
  assert.deepEqual(parseDnsAnswer({
    name: 'example.com.', type: 15, TTL: 3600, data: '10 mail.example.com.',
  }), {
    name: 'example.com', type: 'MX', value: 'mail.example.com.', ttl: 3600, priority: 10,
  });
  assert.deepEqual(parseDnsAnswer({
    name: 'example.com.', type: 16, TTL: 300, data: '"v=spf1 -all"',
  }), {
    name: 'example.com', type: 'TXT', value: 'v=spf1 -all', ttl: 300,
  });
  assert.equal(parseDnsAnswer({ name: 'example.com.', type: 99, TTL: 1, data: 'unknown' }), null);
});

test('RDAP client uses the same-origin endpoint and parses real registry events', async () => {
  const previousFetch = globalThis.fetch;
  let requestedUrl = '';
  globalThis.fetch = (async (input) => {
    requestedUrl = String(input);
    return new Response(JSON.stringify({
      handle: 'EXAMPLE.COM',
      events: [{ eventAction: 'registration', eventDate: '2010-01-02T00:00:00Z' }],
      entities: [],
      nameservers: [],
    }), { status: 200, headers: { 'content-type': 'application/json' } });
  }) as typeof fetch;
  try {
    const result = await lookupDomainRdap('Example.com');
    assert.equal(requestedUrl, '/api/rdap?domain=example.com');
    assert.equal(result.domain, 'example.com');
    assert.equal(result.createdAt, '2010-01-02T00:00:00.000Z');
    assert.ok((result.ageDays ?? 0) > 0);
  } finally {
    globalThis.fetch = previousFetch;
  }
});

test('DNS lookup keeps successful record types when another query fails', async () => {
  const previousFetch = globalThis.fetch;
  const requestedTypes: string[] = [];
  globalThis.fetch = (async (input) => {
    const url = new URL(String(input), 'https://utilora.test');
    const type = url.searchParams.get('type') || '';
    requestedTypes.push(type);
    if (type === '16') return new Response(JSON.stringify({ message: 'temporary TXT resolver failure' }), { status: 502 });
    return new Response(JSON.stringify({
      Status: 0,
      Answer: [{ name: 'example.com.', type: 1, TTL: 300, data: '93.184.216.34' }],
    }), { status: 200, headers: { 'content-type': 'application/json' } });
  }) as typeof fetch;
  try {
    const result = await lookupDnsRecords('example.com', ['A', 'TXT']);
    assert.deepEqual(requestedTypes.sort(), ['1', '16']);
    assert.equal(result.records.length, 1);
    assert.equal(result.records[0].value, '93.184.216.34');
    assert.deepEqual(result.errors, [{ type: 'TXT', message: 'temporary TXT resolver failure' }]);
  } finally {
    globalThis.fetch = previousFetch;
  }
});

test('DNS lookup still fails clearly when every selected record type fails', async () => {
  const previousFetch = globalThis.fetch;
  globalThis.fetch = (async () => new Response(JSON.stringify({ message: 'resolver unavailable' }), { status: 502 })) as typeof fetch;
  try {
    await assert.rejects(lookupDnsRecords('example.com', ['A', 'AAAA']), /resolver unavailable/);
  } finally {
    globalThis.fetch = previousFetch;
  }
});

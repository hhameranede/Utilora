import test from 'node:test';
import assert from 'node:assert/strict';
import { isPublicIpAddress, normalizeDomain, normalizeWebsiteUrl, parseDnsAnswer } from '../engines/diagnostics/browser';

test('domain normalization canonicalizes case, trailing dots, and IDNs', () => {
  assert.equal(normalizeDomain('ExAmPlE.com.'), 'example.com');
  assert.equal(normalizeDomain('münich.de'), 'xn--mnich-kva.de');
});

test('domain validation rejects URLs, paths, IP literals, and local names', () => {
  for (const value of ['https://example.com', 'example.com/path', '127.0.0.1', 'localhost', 'printer.local', 'bad host', 'example.com:443']) {
    assert.throws(() => normalizeDomain(value), undefined, value);
  }
});

test('website URL normalization permits standard HTTP(S) origins only', () => {
  assert.equal(normalizeWebsiteUrl('example.com'), 'https://example.com/');
  assert.equal(normalizeWebsiteUrl('http://example.com/path'), 'http://example.com/path');
  for (const value of [
    'ftp://example.com', 'https://user:pass@example.com', 'http://127.0.0.1',
    'http://localhost', 'https://example.com:8443', 'https://example.com/path with spaces',
  ]) {
    assert.throws(() => normalizeWebsiteUrl(value), undefined, value);
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

import test from 'node:test';
import assert from 'node:assert/strict';
import { onRequestGet as rdapGet } from '../../functions/api/rdap';
import { onRequestGet as dnsGet } from '../../functions/api/dns';

const makeRequest = (path: string) => new Request('https://utilora.test' + path);
const originalFetch = globalThis.fetch;

test('RDAP endpoint rejects URL and local-hostname injection without contacting an upstream', async () => {
  let called = false;
  globalThis.fetch = (async () => {
    called = true;
    return new Response('{}');
  }) as typeof fetch;
  try {
    for (const value of ['https://example.com', '127.0.0.1', 'localhost', 'example.com:443', 'example.com/path']) {
      const response = await rdapGet({ request: makeRequest('/api/rdap?domain=' + encodeURIComponent(value)) });
      assert.equal(response.status, 400, value);
    }
    assert.equal(called, false);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('RDAP endpoint calls only the fixed RDAP provider and returns registry JSON', async () => {
  let calledUrl = '';
  let calledInit: RequestInit | undefined;
  const fixture = { objectClassName: 'domain', handle: 'EXAMPLE.COM', events: [] };
  globalThis.fetch = (async (input, init) => {
    calledUrl = String(input);
    calledInit = init;
    return new Response(JSON.stringify(fixture), { status: 200, headers: { 'content-type': 'application/rdap+json' } });
  }) as typeof fetch;
  try {
    const response = await rdapGet({ request: makeRequest('/api/rdap?domain=ExAmPlE.com.') });
    assert.equal(response.status, 200);
    assert.equal(response.headers.get('cache-control'), 'public, max-age=300, s-maxage=600');
    assert.deepEqual(await response.json(), fixture);
    const upstream = new URL(calledUrl);
    assert.equal(upstream.origin, 'https://rdap.org');
    assert.equal(upstream.pathname, '/domain/example.com');
    assert.equal(calledInit?.method, 'GET');
    assert.equal(calledInit?.credentials, 'omit');
    assert.equal(calledInit?.redirect, 'follow');
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('DNS endpoint enforces the hostname and record-type allow-list', async () => {
  let called = false;
  globalThis.fetch = (async () => {
    called = true;
    return new Response('{}');
  }) as typeof fetch;
  try {
    const unsafeDomain = await dnsGet({ request: makeRequest('/api/dns?name=127.0.0.1&type=A') });
    const unsafeType = await dnsGet({ request: makeRequest('/api/dns?name=example.com&type=ANY') });
    assert.equal(unsafeDomain.status, 400);
    assert.equal(unsafeType.status, 400);
    assert.equal(called, false);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('DNS endpoint calls the fixed Cloudflare DoH endpoint with allow-listed inputs', async () => {
  let calledUrl = '';
  let calledInit: RequestInit | undefined;
  const fixture = { Status: 0, Answer: [{ name: 'example.com.', type: 15, TTL: 300, data: '10 mail.example.com.' }] };
  globalThis.fetch = (async (input, init) => {
    calledUrl = String(input);
    calledInit = init;
    return new Response(JSON.stringify(fixture), { status: 200, headers: { 'content-type': 'application/dns-json' } });
  }) as typeof fetch;
  try {
    const response = await dnsGet({ request: makeRequest('/api/dns?name=example.com&type=mx') });
    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), fixture);
    const upstream = new URL(calledUrl);
    assert.equal(upstream.origin, 'https://cloudflare-dns.com');
    assert.equal(upstream.pathname, '/dns-query');
    assert.equal(upstream.searchParams.get('name'), 'example.com');
    assert.equal(upstream.searchParams.get('type'), 'MX');
    assert.equal(calledInit?.credentials, 'omit');
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('diagnostic proxy returns a bounded error when the upstream does not return JSON', async () => {
  globalThis.fetch = (async () => new Response('<html>upstream error</html>', { status: 200 })) as typeof fetch;
  try {
    const response = await dnsGet({ request: makeRequest('/api/dns?name=example.com&type=A') });
    assert.equal(response.status, 502);
    assert.match(String((await response.json() as { message: string }).message), /invalid JSON/i);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

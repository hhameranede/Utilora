import test from 'node:test';
import assert from 'node:assert/strict';
import { onRequestGet as rdapGet } from '../../functions/api/rdap';
import { onRequestGet as dnsGet } from '../../functions/api/dns';

const makeRequest = (path: string) => new Request('https://utilora.test' + path);
const originalFetch = globalThis.fetch;

const rdapFixture = { objectClassName: 'domain', handle: 'EXAMPLE.COM', events: [] };
const bootstrap = (services: unknown[]) => ({ description: 'RDAP bootstrap fixture', services });

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

test('RDAP endpoint resolves the authoritative .com server from IANA and returns registry JSON', async () => {
  const calledUrls: string[] = [];
  let providerInit: RequestInit | undefined;
  globalThis.fetch = (async (input, init) => {
    const url = String(input);
    calledUrls.push(url);
    if (url === 'https://data.iana.org/rdap/dns.json') {
      return new Response(JSON.stringify(bootstrap([
        [['com'], ['https://rdap.verisign.com/com/v1/']],
      ])), { status: 200, headers: { 'content-type': 'application/json' } });
    }
    providerInit = init;
    return new Response(JSON.stringify(rdapFixture), { status: 200, headers: { 'content-type': 'application/rdap+json' } });
  }) as typeof fetch;
  try {
    const response = await rdapGet({ request: makeRequest('/api/rdap?domain=ExAmPlE.com.') });
    assert.equal(response.status, 200);
    assert.equal(response.headers.get('cache-control'), 'public, max-age=300, s-maxage=600');
    assert.deepEqual(await response.json(), rdapFixture);
    assert.deepEqual(calledUrls, [
      'https://data.iana.org/rdap/dns.json',
      'https://rdap.verisign.com/com/v1/domain/example.com',
    ]);
    assert.equal(providerInit?.method, 'GET');
    assert.equal(providerInit?.credentials, 'omit');
    assert.equal(providerInit?.redirect, 'follow');
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('RDAP bootstrap prefers the longest matching suffix', async () => {
  const calledUrls: string[] = [];
  globalThis.fetch = (async (input) => {
    const url = String(input);
    calledUrls.push(url);
    if (url === 'https://data.iana.org/rdap/dns.json') {
      return new Response(JSON.stringify(bootstrap([
        [['com'], ['https://rdap.verisign.com/com/v1/']],
        [['example.com'], ['https://rdap.example-registry.test/v1/']],
      ])), { status: 200 });
    }
    return new Response(JSON.stringify(rdapFixture), { status: 200 });
  }) as typeof fetch;
  try {
    const response = await rdapGet({ request: makeRequest('/api/rdap?domain=www.example.com') });
    assert.equal(response.status, 200);
    assert.equal(calledUrls[1], 'https://rdap.example-registry.test/v1/domain/www.example.com');
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('RDAP endpoint tries the next IANA-listed server when one provider returns 403', async () => {
  const calledUrls: string[] = [];
  globalThis.fetch = (async (input) => {
    const url = String(input);
    calledUrls.push(url);
    if (url === 'https://data.iana.org/rdap/dns.json') {
      return new Response(JSON.stringify(bootstrap([
        [['com'], ['https://blocked.example-registry.com/rdap/', 'https://rdap.verisign.com/com/v1/']],
      ])), { status: 200 });
    }
    if (url.startsWith('https://blocked.example-registry.com/')) {
      return new Response('forbidden', { status: 403 });
    }
    return new Response(JSON.stringify(rdapFixture), { status: 200 });
  }) as typeof fetch;
  try {
    const response = await rdapGet({ request: makeRequest('/api/rdap?domain=example.com') });
    assert.equal(response.status, 200);
    assert.equal(calledUrls.length, 3);
    assert.equal(calledUrls[2], 'https://rdap.verisign.com/com/v1/domain/example.com');
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('RDAP endpoint returns a clear error when IANA has no service for the domain suffix', async () => {
  globalThis.fetch = (async () => new Response(JSON.stringify(bootstrap([
    [['org'], ['https://rdap.publicinterestregistry.org/rdap/']],
  ])), { status: 200 })) as typeof fetch;
  try {
    const response = await rdapGet({ request: makeRequest('/api/rdap?domain=example.com') });
    assert.equal(response.status, 404);
    assert.match(String((await response.json() as { message: string }).message), /does not list a public RDAP service/i);
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

test('diagnostic proxy preserves useful 404 and 429 provider errors even with plain-text bodies', async () => {
  const previousFetch = globalThis.fetch;
  try {
    globalThis.fetch = (async () => new Response('not found', { status: 404 })) as typeof fetch;
    const missing = await dnsGet({ request: makeRequest('/api/dns?name=example.com&type=A') });
    assert.equal(missing.status, 404);
    assert.match(String((await missing.json() as { message: string }).message), /No public registry data/i);

    globalThis.fetch = (async () => new Response('rate limit', { status: 429 })) as typeof fetch;
    const limited = await dnsGet({ request: makeRequest('/api/dns?name=example.com&type=A') });
    assert.equal(limited.status, 429);
    assert.match(String((await limited.json() as { message: string }).message), /rate-limiting/i);
  } finally {
    globalThis.fetch = previousFetch;
  }
});

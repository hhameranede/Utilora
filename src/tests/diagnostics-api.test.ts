import test from 'node:test';
import assert from 'node:assert/strict';
import { onRequestGet as rdapGet, resolveRdapBaseUrls } from '../../functions/api/rdap';
import { onRequestGet as dnsGet } from '../../functions/api/dns';

const makeRequest = (path: string) => new Request('https://utilora.test' + path);
const originalFetch = globalThis.fetch;
const rdapBootstrap = (urls = ['https://registry.example.net/rdap/']) => ({
  version: '1.0',
  services: [
    [['com'], ['https://registry.example.net/com/']],
    [['example.com'], urls],
  ],
});
const rdapFixture = { objectClassName: 'domain', handle: 'EXAMPLE.COM', events: [] };

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

test('RDAP bootstrap selects the label-wise longest HTTPS suffix match', () => {
  const urls = resolveRdapBaseUrls('shop.example.com', {
    services: [
      [['com'], ['https://registry.example.net/com/']],
      [['example.com'], ['https://registry.example.net/example/']],
      [['shop.example.com'], ['https://registry.example.net/shop/']],
    ],
  });
  assert.deepEqual(urls.map((url) => url.href), ['https://registry.example.net/shop/']);
});

test('RDAP bootstrap rejects insecure and private registry URLs', () => {
  const urls = resolveRdapBaseUrls('example.com', {
    services: [
      [['com'], [
        'http://registry.example.net/rdap/',
        'https://localhost/rdap/',
        'https://127.0.0.1/rdap/',
      ]],
    ],
  });
  assert.deepEqual(urls, []);
});

test('RDAP endpoint uses IANA bootstrap and returns authoritative registry JSON', async () => {
  const calls: Array<{ url: string; init?: RequestInit }> = [];
  globalThis.fetch = (async (input, init) => {
    const url = String(input);
    calls.push({ url, init });
    if (url === 'https://data.iana.org/rdap/dns.json') {
      return new Response(JSON.stringify(rdapBootstrap()), { status: 200, headers: { 'content-type': 'application/json' } });
    }
    return new Response(JSON.stringify(rdapFixture), { status: 200, headers: { 'content-type': 'application/rdap+json' } });
  }) as typeof fetch;
  try {
    const response = await rdapGet({ request: makeRequest('/api/rdap?domain=ExAmPlE.com.') });
    assert.equal(response.status, 200);
    assert.equal(response.headers.get('cache-control'), 'public, max-age=300, s-maxage=600');
    assert.deepEqual(await response.json(), rdapFixture);
    assert.equal(calls.length, 2);
    assert.equal(calls[0].url, 'https://data.iana.org/rdap/dns.json');
    assert.equal(new URL(calls[1].url).origin, 'https://registry.example.net');
    assert.equal(new URL(calls[1].url).pathname, '/rdap/domain/example.com');
    assert.equal(calls[0].init?.method, 'GET');
    assert.equal(calls[0].init?.credentials, 'omit');
    assert.equal((calls[0].init?.headers as Record<string, string>).Accept, 'application/json');
    assert.equal(calls[1].init?.method, 'GET');
    assert.equal(calls[1].init?.credentials, 'omit');
    assert.equal(calls[1].init?.redirect, 'follow');
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('RDAP endpoint refuses insecure-only IANA entries instead of downgrading to HTTP', async () => {
  let calls = 0;
  globalThis.fetch = (async () => {
    calls += 1;
    return new Response(JSON.stringify({
      services: [[['foo'], ['http://registry.example.net/rdap/']]],
    }), { status: 200, headers: { 'content-type': 'application/json' } });
  }) as typeof fetch;
  try {
    const response = await rdapGet({ request: makeRequest('/api/rdap?domain=example.foo') });
    assert.equal(response.status, 503);
    assert.equal(calls, 1);
    assert.match(String((await response.json() as { message: string }).message), /secure HTTPS RDAP service/i);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('RDAP endpoint tries a second IANA-listed HTTPS server when the first returns 403', async () => {
  const requested: string[] = [];
  globalThis.fetch = (async (input) => {
    const url = String(input);
    requested.push(url);
    if (url === 'https://data.iana.org/rdap/dns.json') {
      return new Response(JSON.stringify(rdapBootstrap([
        'https://blocked.example.net/rdap/',
        'https://backup.example.net/rdap/',
      ])), { status: 200, headers: { 'content-type': 'application/json' } });
    }
    if (url.startsWith('https://blocked.example.net/')) {
      return new Response('forbidden', { status: 403 });
    }
    return new Response(JSON.stringify(rdapFixture), { status: 200, headers: { 'content-type': 'application/rdap+json' } });
  }) as typeof fetch;
  try {
    const response = await rdapGet({ request: makeRequest('/api/rdap?domain=example.com') });
    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), rdapFixture);
    assert.equal(requested.length, 3);
    assert.match(requested[1], /^https:\/\/blocked\.example\.net\//);
    assert.match(requested[2], /^https:\/\/backup\.example\.net\//);
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

test('diagnostic proxy preserves useful RDAP 404 and DNS 429 provider errors', async () => {
  const previousFetch = globalThis.fetch;
  try {
    globalThis.fetch = (async (input) => {
      if (String(input) === 'https://data.iana.org/rdap/dns.json') {
        return new Response(JSON.stringify(rdapBootstrap()), { status: 200, headers: { 'content-type': 'application/json' } });
      }
      return new Response('not found', { status: 404 });
    }) as typeof fetch;
    const missing = await rdapGet({ request: makeRequest('/api/rdap?domain=example.com') });
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

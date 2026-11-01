import { expect, test, type Page } from '@playwright/test';

const rdapFixture = {
  objectClassName: 'domain',
  handle: 'EXAMPLE.COM',
  status: ['active'],
  events: [
    { eventAction: 'registration', eventDate: '2010-01-02T00:00:00Z' },
    { eventAction: 'expiration', eventDate: '2030-01-02T00:00:00Z' },
    { eventAction: 'last changed', eventDate: '2025-03-04T00:00:00Z' },
  ],
  entities: [{
    objectClassName: 'entity',
    roles: ['registrar'],
    vcardArray: ['vcard', [['version', {}, 'text', '4.0'], ['fn', {}, 'text', 'Example Registrar']]],
  }],
  nameservers: [{ ldhName: 'a.iana-servers.net' }, { ldhName: 'b.iana-servers.net' }],
};

async function mockRdap(page: Page) {
  await page.route('https://rdap.org/domain/**', (route) => route.fulfill({
    status: 200,
    headers: { 'access-control-allow-origin': '*', 'content-type': 'application/rdap+json' },
    body: JSON.stringify(rdapFixture),
  }));
}

async function mockPublicDns(page: Page) {
  await page.route('https://cloudflare-dns.com/dns-query**', async (route) => {
    const requestUrl = new URL(route.request().url());
    const type = requestUrl.searchParams.get('type');
    let Answer: Array<{ name: string; type: number; TTL: number; data: string }> = [];
    if (type === '1') Answer = [{ name: 'example.com.', type: 1, TTL: 300, data: '93.184.216.34' }];
    if (type === '16') Answer = [{ name: 'example.com.', type: 16, TTL: 300, data: '"v=spf1 -all"' }];
    if (type === '15') Answer = [{ name: 'example.com.', type: 15, TTL: 3600, data: '10 mail.example.com.' }];
    await route.fulfill({
      status: 200,
      headers: { 'access-control-allow-origin': '*', 'content-type': 'application/dns-json' },
      body: JSON.stringify({ Status: 0, Answer }),
    });
  });
}

const diagnosticHeaders = {
  'access-control-allow-origin': '*',
  'access-control-expose-headers': 'strict-transport-security, content-security-policy, x-content-type-options, x-frame-options, server',
  'strict-transport-security': 'max-age=31536000; includeSubDomains',
  'content-security-policy': "default-src 'self'",
  'x-content-type-options': 'nosniff',
  'x-frame-options': 'DENY',
  'server': 'test-edge',
};

async function mockWebsiteHead(page: Page, status = 200) {
  await page.route('https://example.com/**', async (route) => {
    expect(route.request().method()).toBe('HEAD');
    await route.fulfill({ status, headers: diagnosticHeaders, body: '' });
  });
}

test('domain age checker displays actual RDAP registration and expiry events', async ({ page }) => {
  await mockRdap(page);
  await page.goto('/en/tools/domain-age-checker');
  await page.getByRole('button', { name: 'Check domain age' }).click();

  await expect(page.getByRole('status')).toContainText('Live registry result');
  await expect(page.getByText('Example Registrar')).toBeVisible();
  await expect(page.getByText(/2010/)).toBeVisible();
  await expect(page.getByText(/2030/)).toBeVisible();
});

test('RDAP lookup displays registry status, entities, and nameservers', async ({ page }) => {
  await mockRdap(page);
  await page.goto('/en/tools/rdap-lookup');
  await page.getByRole('button', { name: 'Query RDAP' }).click();

  await expect(page.getByRole('status')).toContainText('Live registry result');
  await expect(page.getByText('active', { exact: true })).toBeVisible();
  await expect(page.getByText('a.iana-servers.net')).toBeVisible();
  await expect(page.getByText('Example Registrar')).toBeVisible();
});

test('DNS lookup displays returned A, MX and TXT answers instead of sample records', async ({ page }) => {
  await mockPublicDns(page);
  await page.goto('/en/tools/dns-lookup');
  await page.getByRole('button', { name: 'Look up records' }).click();

  await expect(page.getByRole('status')).toContainText('DNS results');
  await expect(page.getByText('93.184.216.34')).toBeVisible();
  await expect(page.getByText('mail.example.com.')).toBeVisible();
  await expect(page.getByText('v=spf1 -all')).toBeVisible();
});

test('website status checker uses a safe public-DNS preflight and credential-free HEAD request', async ({ page }) => {
  await mockPublicDns(page);
  await mockWebsiteHead(page);
  await page.goto('/en/tools/website-status-checker');
  await page.getByRole('button', { name: 'Check website' }).click();

  await expect(page.getByRole('status')).toContainText('Website response');
  await expect(page.getByText('HTTP 200')).toBeVisible();
  await expect(page.getByText('93.184.216.34')).toBeVisible();
});

test('HTTP headers checker shows exposed response headers and CORS visibility limits', async ({ page }) => {
  await mockPublicDns(page);
  await mockWebsiteHead(page);
  await page.goto('/en/tools/http-headers-checker');
  await page.getByRole('button', { name: 'Inspect headers' }).click();

  await expect(page.getByRole('status')).toContainText('Observed HTTP response');
  await expect(page.getByText('strict-transport-security').first()).toBeVisible();
  await expect(page.getByText('content-security-policy').first()).toBeVisible();
  await expect(page.getByText('Seen', { exact: true })).toHaveCount(4);
});

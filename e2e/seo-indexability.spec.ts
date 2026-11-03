import { expect, test } from '@playwright/test';

test('functional tool pages are indexable while unfinished previews remain noindex', async ({ page, request }) => {
  const sitemapResponse = await request.get('/sitemap.xml');
  expect(sitemapResponse.ok()).toBeTruthy();
  const sitemap = await sitemapResponse.text();

  for (const locale of ['en', 'ar', 'fr', 'es', 'pt', 'hi', 'zh', 'bn']) {
    expect(sitemap).toContain('/' + locale + '/tools/json-formatter');
  }
  for (const locale of ['en', 'ar', 'fr', 'es', 'pt', 'hi', 'zh', 'bn']) {
    expect(sitemap).toContain('/' + locale + '/workflows');
    expect(sitemap).toContain('/' + locale + '/workflows/prepare-images-for-web');
  }
  expect(sitemap).toContain('/en/tools/video-compressor');
  expect(sitemap).toContain('/en/tools/video-compressor/how-to');
  expect(sitemap).not.toContain('/en/tools/video-downloader/how-to');

  await page.goto('/en/tools/json-formatter');
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'index, follow');
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    'href',
    'https://utilora.invalid/en/tools/json-formatter',
  );
  await expect(page.locator('link[rel="alternate"][hreflang="ar"]')).toHaveAttribute(
    'href',
    'https://utilora.invalid/ar/tools/json-formatter',
  );
  await expect(page.locator('meta[property="og:url"]')).toHaveAttribute(
    'content',
    'https://utilora.invalid/en/tools/json-formatter',
  );

  await page.goto('/en/tools/video-compressor');
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'index, follow');

  await page.goto('/en/tools/video-compressor/how-to');
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'index, follow');

  await page.goto('/en/tools/video-downloader/how-to');
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex, nofollow');
});

test('the production sitemap is complete, canonical, and XML-structured', async ({ request }) => {
  const sitemapResponse = await request.get('/sitemap.xml');
  expect(sitemapResponse.ok()).toBeTruthy();
  expect(sitemapResponse.headers()['content-type']).toMatch(/(?:application|text)\/xml/);

  const sitemap = await sitemapResponse.text();
  expect(sitemap).toContain('xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"');
  expect(sitemap).toContain('xmlns:xhtml="http://www.w3.org/1999/xhtml"');

  const urlBlocks = [...sitemap.matchAll(/<url>([\s\S]*?)<\/url>/g)].map((match) => match[1]);
  // 8 locales × (home, two directory indexes, 6 categories, 35 tools,
  // 35 guides, 7 workflow routes, and 6 informational/legal pages) = 736 URLs.
  expect(urlBlocks).toHaveLength(736);

  const locations = urlBlocks.map((block) => {
    const match = block.match(/<loc>([^<]+)<\/loc>/);
    expect(match).not.toBeNull();
    return match![1];
  });

  expect(new Set(locations).size).toBe(locations.length);
  expect(locations.every((url) => url.startsWith('https://utilora.invalid/'))).toBeTruthy();
  expect(sitemap).not.toContain('pages.dev');
  expect(sitemap).not.toContain('video-downloader');
  expect(sitemap).not.toContain('/articles');
  expect(sitemap).toContain('/en/workflows/inspect-a-domain');
  expect(sitemap).not.toContain('/dev/');

  const expectedLanguages = ['en', 'ar', 'fr', 'es', 'pt', 'hi', 'zh', 'bn', 'x-default'];
  for (const block of urlBlocks) {
    const location = (block.match(/<loc>([^<]+)<\/loc>/) || [])[1];
    const alternates = [...block.matchAll(/<xhtml:link\b[^>]*hreflang="([^"]+)"[^>]*href="([^"]+)"[^>]*\/>/g)];
    const languageCodes = alternates.map((match) => match[1]);

    expect(alternates).toHaveLength(9);
    expect(new Set(languageCodes).size).toBe(9);
    expect(expectedLanguages.every((language) => languageCodes.includes(language))).toBeTruthy();
    expect(alternates.some((match) => match[2] === location)).toBeTruthy();
  }

  const robotsResponse = await request.get('/robots.txt');
  expect(robotsResponse.ok()).toBeTruthy();
  const robots = await robotsResponse.text();
  expect(robots).toContain('User-agent: *');
  expect(robots).toContain('Disallow: /dev/');
  expect(robots).toContain('Sitemap: https://utilora.invalid/sitemap.xml');
});

test('not-found pages do not canonicalize to the localized homepage', async ({ page }) => {
  await page.goto('/en/this-page-does-not-exist');
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex, nofollow');
  await expect(page.locator('link[rel="canonical"]')).toHaveCount(0);
  await expect(page.locator('link[rel="alternate"][hreflang]')).toHaveCount(0);
  await expect(page.locator('meta[property="og:url"]')).toHaveCount(0);
  await expect(page.locator('script#utilora-schema-jsonld')).toHaveCount(0);
});


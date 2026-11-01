import { expect, test } from '@playwright/test';

test('functional tool pages are indexable while unfinished previews remain noindex', async ({ page, request }) => {
  const sitemapResponse = await request.get('/sitemap.xml');
  expect(sitemapResponse.ok()).toBeTruthy();
  const sitemap = await sitemapResponse.text();

  for (const locale of ['en', 'ar', 'fr', 'es', 'pt', 'hi', 'zh', 'bn']) {
    expect(sitemap).toContain('/' + locale + '/tools/json-formatter');
  }
  expect(sitemap).not.toContain('/en/tools/video-compressor');

  await page.goto('/en/tools/json-formatter');
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'index, follow');
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', /\/en\/tools\/json-formatter$/);

  await page.goto('/en/tools/video-compressor');
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex, nofollow');
});

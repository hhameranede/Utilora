import { expect, test } from '@playwright/test';

test('workflow hub and detail pages are localized, connected, and indexable', async ({ page, request }) => {
  const sitemapResponse = await request.get('/sitemap.xml');
  expect(sitemapResponse.ok()).toBeTruthy();
  const sitemap = await sitemapResponse.text();

  for (const locale of ['en', 'ar', 'fr', 'es', 'pt', 'hi', 'zh', 'bn']) {
    expect(sitemap).toContain('/' + locale + '/workflows');
    expect(sitemap).toContain('/' + locale + '/workflows/prepare-images-for-web');
  }

  await page.goto('/en/workflows');
  await expect(page.getByRole('heading', { level: 1, name: 'Complete the task, not just one step' })).toBeVisible();
  await expect(page.getByRole('link', { name: /Prepare images for the web/ })).toHaveAttribute('href', '/en/workflows/prepare-images-for-web');

  await page.goto('/en/workflows/prepare-images-for-web');
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'index, follow');
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', 'https://utilora.invalid/en/workflows/prepare-images-for-web');
  const schema = await page.locator('script#utilora-schema-jsonld').textContent();
  expect(schema).toContain('"@type":"HowTo"');
  expect(schema).toContain('"@type":"HowToStep"');
  await expect(page.getByRole('link', { name: 'Open tool' })).toHaveCount(3);
  await expect(page.getByRole('link', { name: 'Open tool' }).first()).toHaveAttribute('href', '/en/tools/image-resizer');

  await page.goto('/ar/workflows/prepare-images-for-web');
  await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
  await expect(page.getByRole('heading', { level: 1, name: 'جهّز الصور للنشر على الويب' })).toBeVisible();
});

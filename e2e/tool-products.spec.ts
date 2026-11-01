import { expect, test } from '@playwright/test';

const toolSlugs = [
  'image-converter',
  'image-compressor',
  'image-resizer',
  'image-cropper',
  'image-rotator',
  'image-metadata-viewer',
  'merge-pdf',
  'split-pdf',
  'rotate-pdf',
  'jpg-to-pdf',
  'pdf-to-jpg',
  'pdf-page-counter',
  'word-counter',
  'character-counter',
  'case-converter',
  'duplicate-lines-remover',
  'sort-text-lines',
  'text-diff-checker',
  'json-formatter',
  'json-validator',
  'json-minifier',
  'base64-encoder-decoder',
  'url-encoder-decoder',
  'uuid-generator',
  'hash-generator',
  'domain-age-checker',
  'rdap-lookup',
  'dns-lookup',
  'website-status-checker',
  'http-headers-checker',
  'video-compressor',
  'video-to-audio',
  'video-metadata-viewer',
  'video-downloader',
  'video-trimmer',
  'thumbnail-extractor',
];

test('all 36 tool routes render their own complete product page structure', async ({ page }) => {
  for (const slug of toolSlugs) {
    await page.goto(`/en/tools/${slug}`);
    await expect(page.locator('h1').first(), slug).toBeVisible();
    await expect(page.locator('#tool-workspace'), slug).toBeVisible();
    await expect(page.locator('#tool-features'), slug).toBeVisible();
    await expect(page.locator('#how-it-works'), slug).toBeVisible();
    await expect(page.locator('#tool-faq'), slug).toBeVisible();

    await expect(page.locator('#tool-features .grid > div'), slug).toHaveCount(3);
    await expect(page.locator('#how-it-works ol li'), slug).toHaveCount(3);
    await expect(page.locator('meta[name="description"]'), slug).toHaveAttribute('content', /.+/);
    await expect(page.locator('link[rel="canonical"]'), slug).toHaveAttribute('href', new RegExp(`/en/tools/${slug}$`));

    const robots = await page.locator('meta[name="robots"]').getAttribute('content');
    expect(robots, slug).toBe(slug === 'video-downloader' ? 'noindex, nofollow' : 'index, follow');
  }
});

test('Arabic product pages preserve RTL and localized metadata', async ({ page }) => {
  await page.goto('/ar/tools/merge-pdf');
  await expect(page.locator('html')).toHaveAttribute('lang', 'ar');
  await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
  await expect(page.locator('h1').first()).toContainText('PDF');
  await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', /.+/);
  await expect(page.locator('#tool-features')).toBeVisible();
});

test('product page stays usable at a narrow mobile viewport', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 800 });
  await page.goto('/en/tools/image-compressor');
  await expect(page.locator('#tool-workspace')).toBeVisible();
  await expect(page.getByRole('link', { name: /Open the tool/i })).toBeVisible();
  const dimensions = await page.evaluate(() => ({
    viewport: document.documentElement.clientWidth,
    content: document.documentElement.scrollWidth,
  }));
  expect(dimensions.content).toBeLessThanOrEqual(dimensions.viewport + 1);
});

test('preview-only downloader never advertises enabled processing', async ({ page }) => {
  await page.goto('/en/tools/video-downloader');
  await expect(page.locator('body')).toContainText('Free preview');
  await expect(page.locator('body')).toContainText('Preview only');
  await expect(page.locator('body')).toContainText('Not available yet');
  await expect(page.locator('body')).not.toContainText('Browser-based processing');
});

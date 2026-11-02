import { expect, test } from '@playwright/test';

test('home, catalogue, and tool pages do not create page-level horizontal scrolling on narrow phones', async ({ page }) => {
  const cases = [
    { route: '/en', width: 320 },
    { route: '/ar', width: 320 },
    { route: '/en/tools', width: 320 },
    { route: '/en/categories', width: 320 },
    { route: '/en/tools/merge-pdf', width: 320 },
    { route: '/en', width: 360 },
    { route: '/ar', width: 360 },
  ];

  for (const item of cases) {
    await page.setViewportSize({ width: item.width, height: 720 });
    await page.goto(item.route);
    await expect(page.locator('h1').first()).toBeVisible();
    const widths = await page.evaluate(() => ({
      viewport: window.innerWidth,
      document: document.documentElement.scrollWidth,
      body: document.body.scrollWidth,
    }));
    expect(
      Math.max(widths.document, widths.body),
      item.route + ' overflowed at ' + item.width + 'px: ' + JSON.stringify(widths),
    ).toBeLessThanOrEqual(item.width + 1);
  }
});

test('tool cards open the selected workspace instead of leaving users at the top of a long detail page', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 800 });
  await page.goto('/en/tools');

  const firstCard = page.locator('a.group').filter({ hasText: 'Open Tool' }).first();
  const destination = await firstCard.getAttribute('href');
  await firstCard.click();
  await expect(page).toHaveURL(new RegExp(destination!.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '$'));
  const workspace = page.locator('#tool-workspace');
  await expect(workspace).toBeVisible();
  await expect.poll(async () => (await workspace.boundingBox())?.y ?? 9999).toBeLessThan(120);
});

test('video downloader preview no longer presents a misleading general file uploader', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/en/tools/video-downloader');
  await page.locator('a[href="#tool-workspace"]').first().click();

  const workspace = page.locator('#tool-workspace');
  await expect(workspace).toContainText('Preview only');
  await expect(workspace.locator('input[type="file"]')).toHaveCount(0);
  await expect(workspace.getByRole('button', { name: /process file/i })).toHaveCount(0);
  await expect(workspace).toContainText(/direct MP4\/WebM/i);
});

test('PDF file reorder and remove controls meet a 40px touch target and have accessible names', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/en/tools/merge-pdf');
  await page.locator('a[href="#tool-workspace"]').first().click();
  await page.locator('#tool-workspace input[type="file"]').setInputFiles([
    { name: 'first.pdf', mimeType: 'application/pdf', buffer: Buffer.from('%PDF-1.4') },
    { name: 'second.pdf', mimeType: 'application/pdf', buffer: Buffer.from('%PDF-1.4') },
  ]);

  for (const label of ['Move file up', 'Move file down', 'Remove file']) {
    const button = page.locator('#tool-workspace button[aria-label="' + label + '"]').first();
    await expect(button).toBeVisible();
    const box = await button.boundingBox();
    expect(box?.width ?? 0).toBeGreaterThanOrEqual(40);
    expect(box?.height ?? 0).toBeGreaterThanOrEqual(40);
  }
});

test('technical guides contain topic-specific copy instead of repeated generic compression text', async ({ page }) => {
  const articles = [
    { slug: 'png-vs-webp-compression-performance', terms: ['lossless', 'transparency', 'quality settings'] },
    { slug: 'understanding-pdf-linearization-and-page-trees', terms: ['page tree', 'linearized PDF', 'cross-reference'] },
    { slug: 'rfc-8259-json-strict-parsing-and-validation', terms: ['RFC 8259', 'safe-integer', 'schema validation'] },
    { slug: 'dns-records-propagation-doh-inspection', terms: ['DNS', 'TTL', 'DNS over HTTPS'] },
  ];

  for (const article of articles) {
    await page.goto('/en/articles/' + article.slug);
    const body = (await page.locator('main').innerText()).toLowerCase();
    expect(body).not.toContain('modern digital workflows require formats');
    expect(body).not.toContain('alpha transparency in 32-bit raster formats');
    for (const term of article.terms) {
      expect(body, article.slug + ' should explain ' + term).toContain(term.toLowerCase());
    }
  }
});

test('Arabic technical guide headings and body are localized instead of mixing English section titles', async ({ page }) => {
  const articles = [
    { slug: 'png-vs-webp-compression-performance', firstHeading: 'تطور الرسومات النقطية' },
    { slug: 'understanding-pdf-linearization-and-page-trees', firstHeading: 'بنية فهرس مستند PDF' },
    { slug: 'rfc-8259-json-strict-parsing-and-validation', firstHeading: 'صياغة JSON وفق RFC 8259' },
    { slug: 'dns-records-propagation-doh-inspection', firstHeading: 'التسلسل الهرمي' },
  ];

  for (const article of articles) {
    await page.goto('/ar/articles/' + article.slug);
    await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
    await expect(page.locator('main h2').first()).toContainText(article.firstHeading);
  }
});

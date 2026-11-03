import { expect, test } from '@playwright/test';

const toolRoutes = [
  ['image-converter', 'functional'], ['image-compressor', 'functional'],
  ['image-resizer', 'functional'], ['image-cropper', 'functional'],
  ['image-rotator', 'functional'], ['image-metadata-viewer', 'functional'],
  ['merge-pdf', 'functional'], ['split-pdf', 'functional'], ['rotate-pdf', 'functional'],
  ['jpg-to-pdf', 'functional'], ['pdf-to-jpg', 'functional'], ['pdf-page-counter', 'functional'],
  ['word-counter', 'functional'], ['character-counter', 'functional'], ['case-converter', 'functional'],
  ['duplicate-lines-remover', 'functional'], ['sort-text-lines', 'functional'], ['text-diff-checker', 'functional'],
  ['json-formatter', 'functional'], ['json-validator', 'functional'], ['json-minifier', 'functional'],
  ['base64-encoder-decoder', 'functional'], ['url-encoder-decoder', 'functional'],
  ['uuid-generator', 'functional'], ['hash-generator', 'functional'],
  ['domain-age-checker', 'functional'], ['rdap-lookup', 'functional'], ['dns-lookup', 'functional'],
  ['website-status-checker', 'functional'], ['http-headers-checker', 'functional'],
  ['video-compressor', 'functional'], ['video-to-audio', 'functional'],
  ['video-metadata-viewer', 'functional'], ['video-downloader', 'preview'],
  ['video-trimmer', 'functional'], ['thumbnail-extractor', 'functional'],
] as const;

const viewports = [
  { name: 'mobile', width: 360, height: 800 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'desktop', width: 1280, height: 900 },
];

async function expectNoHorizontalOverflow(page: import('@playwright/test').Page, route: string, viewport: number) {
  const measurements = await page.evaluate(() => ({
    viewportWidth: window.innerWidth,
    documentWidth: document.documentElement.scrollWidth,
    bodyWidth: document.body.scrollWidth,
    overflowCandidates: Array.from(document.querySelectorAll('body *'))
      .map((element) => {
        const rect = element.getBoundingClientRect();
        const style = getComputedStyle(element);
        return {
          tag: element.tagName.toLowerCase(),
          className: typeof element.className === 'string' ? element.className.slice(0, 140) : '',
          left: Math.round(rect.left),
          right: Math.round(rect.right),
          width: Math.round(rect.width),
          scrollWidth: element.scrollWidth,
          clientWidth: element.clientWidth,
          overflowX: style.overflowX,
        };
      })
      .filter((item) => item.width > 0 && (item.right > window.innerWidth + 1 || item.left < -1))
      .sort((a, b) => b.right - a.right)
      .slice(0, 12),
  }));

  // Allow a single CSS pixel for fractional layout rounding at breakpoint boundaries.
  // Any larger page-level overflow still fails the responsive audit.
  expect(
    Math.max(measurements.documentWidth, measurements.bodyWidth),
    route + ' overflowed at ' + viewport + 'px: ' + JSON.stringify(measurements),
  ).toBeLessThanOrEqual(measurements.viewportWidth + 1);
}

test('all 36 tool pages fit mobile, tablet and desktop without page-level horizontal scrolling', async ({ page }) => {
  test.setTimeout(240_000);

  for (const viewport of viewports) {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    for (const [slug, status] of toolRoutes) {
      const route = '/en/tools/' + slug;
      await page.goto(route, { waitUntil: 'domcontentloaded' });
      await expect(page.getByRole('heading', { level: 1 }), route + ' should render its heading').toBeVisible();
      await expect(page.locator('body')).toContainText(status === 'functional' ? 'Ready to use' : 'Preview only');
      await expectNoHorizontalOverflow(page, route, viewport.width);
    }
  }
});

test('all eight locales keep a tool workspace readable on a narrow mobile viewport', async ({ page }) => {
  test.setTimeout(90_000);
  await page.setViewportSize({ width: 360, height: 800 });

  const localeRoutes = [
    { locale: 'en', slug: 'image-converter', direction: 'ltr' },
    { locale: 'ar', slug: 'merge-pdf', direction: 'rtl' },
    { locale: 'fr', slug: 'word-counter', direction: 'ltr' },
    { locale: 'es', slug: 'json-formatter', direction: 'ltr' },
    { locale: 'pt', slug: 'base64-encoder-decoder', direction: 'ltr' },
    { locale: 'hi', slug: 'uuid-generator', direction: 'ltr' },
    { locale: 'zh', slug: 'domain-age-checker', direction: 'ltr' },
    { locale: 'bn', slug: 'dns-lookup', direction: 'ltr' },
  ];

  for (const item of localeRoutes) {
    const route = '/' + item.locale + '/tools/' + item.slug;
    await page.goto(route, { waitUntil: 'domcontentloaded' });
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await expect(page.locator('html')).toHaveAttribute('lang', item.locale);
    await expect(page.locator('html')).toHaveAttribute('dir', item.direction);
    await expectNoHorizontalOverflow(page, route, 360);
  }
});


test('shared page templates remain aligned across mobile, tablet and desktop', async ({ page }) => {
  test.setTimeout(120_000);
  const routes = [
    '/ar', '/en', '/fr', '/es', '/pt', '/hi', '/zh', '/bn',
    '/en/tools', '/ar/tools',
    '/en/categories/image', '/ar/categories/image',
    '/en/tools/image-cropper', '/ar/tools/image-cropper',
    '/en/tools/image-cropper/how-to', '/ar/tools/image-cropper/how-to',
    '/en/articles', '/ar/articles',
    '/en/articles/png-vs-webp-compression-performance',
    '/en/privacy', '/ar/privacy',
  ];
  const sizes = [
    { width: 360, height: 800 },
    { width: 768, height: 1024 },
    { width: 1440, height: 1000 },
  ];

  for (const size of sizes) {
    await page.setViewportSize(size);
    for (const route of routes) {
      await page.goto(route, { waitUntil: 'domcontentloaded' });
      await expect(page.locator('main')).toBeVisible();
      await expectNoHorizontalOverflow(page, route, size.width);

      const brokenIcons = await page.locator('svg').evaluateAll((icons) =>
        icons.filter((icon) => {
          const rect = icon.getBoundingClientRect();
          const style = getComputedStyle(icon);
          return icon.getClientRects().length > 0 && style.display !== 'none' && style.visibility !== 'hidden' && (rect.width < 1 || rect.height < 1);
        }).length,
      );
      expect(brokenIcons, route + ' has SVG icons with zero-sized boxes at ' + size.width + 'px').toBe(0);
    }
  }
});


test('homepage popular tool names are readable on narrow mobile screens in every locale', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 800 });
  for (const locale of ['ar', 'en', 'fr', 'es', 'pt', 'hi', 'zh', 'bn']) {
    await page.goto('/' + locale, { waitUntil: 'domcontentloaded' });
    const cards = page.locator('#quick-tools .ul-tool-card');
    await expect(cards).toHaveCount(6);
    const titleMetrics = await page.locator('#quick-tools .ul-tool-card h4').evaluateAll((titles) =>
      titles.map((node) => {
        const element = node as HTMLElement;
        const style = getComputedStyle(element);
        return {
          text: element.textContent?.trim() || '',
          clientWidth: element.clientWidth,
          scrollWidth: element.scrollWidth,
          whiteSpace: style.whiteSpace,
          textOverflow: style.textOverflow,
          lineHeight: parseFloat(style.lineHeight) || 0,
          height: element.getBoundingClientRect().height,
        };
      }),
    );
    for (const metric of titleMetrics) {
      expect(metric.text, locale + ' tool title must not be empty').not.toBe('');
      expect(metric.clientWidth, locale + ' title must have usable width').toBeGreaterThan(90);
      expect(metric.whiteSpace, locale + ' title must wrap instead of staying on one line').not.toBe('nowrap');
      expect(metric.textOverflow, locale + ' title must not use an ellipsis').not.toBe('ellipsis');
      expect(metric.scrollWidth, locale + ' title width must fit its content box').toBeLessThanOrEqual(metric.clientWidth + 1);
    }
    await expectNoHorizontalOverflow(page, '/' + locale, 360);
  }
});

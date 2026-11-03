import { expect, test } from '@playwright/test';

async function expectNoHorizontalOverflow(page: import('@playwright/test').Page, route: string, width: number) {
  const measurement = await page.evaluate(() => ({
    viewport: window.innerWidth,
    document: document.documentElement.scrollWidth,
    body: document.body.scrollWidth,
  }));
  expect(
    Math.max(measurement.document, measurement.body),
    route + ' exceeded the viewport at ' + width + 'px: ' + JSON.stringify(measurement),
  ).toBeLessThanOrEqual(measurement.viewport + 1);
}

test('mobile homepage keeps the hero compact and popular tools immediately reachable', async ({ page }) => {
  test.setTimeout(60_000);
  for (const width of [320, 360, 390, 430]) {
    await page.setViewportSize({ width, height: 720 });
    await page.goto('/ar', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('[data-testid="utilora-home-hero"]')).toBeVisible();
    await expect(page.locator('#quick-tools .ul-tool-card')).toHaveCount(6);
    const metrics = await page.evaluate(() => {
      const hero = document.querySelector('[data-testid="utilora-home-hero"]')!.getBoundingClientRect();
      const cards = Array.from(document.querySelectorAll('#quick-tools .ul-tool-card')).slice(0, 2)
        .map((card) => card.getBoundingClientRect().bottom);
      return {
        heroHeight: hero.height,
        firstCardsBottom: cards,
        artworkHeight: document.querySelector('.ul-hero-visual')?.getBoundingClientRect().height || 0,
      };
    });
    expect(metrics.heroHeight, 'hero should not dominate a small viewport at ' + width + 'px').toBeLessThan(360);
    expect(metrics.artworkHeight).toBeGreaterThanOrEqual(90);
    expect(metrics.artworkHeight).toBeLessThanOrEqual(120);
    expect(metrics.firstCardsBottom.every((bottom) => bottom <= 720), 'popular tool cards should be reachable without scrolling at ' + width + 'px').toBeTruthy();
    await expectNoHorizontalOverflow(page, '/ar', width);
  }
});

test('catalog uses touch-friendly filters and two readable columns through tablet widths', async ({ page }) => {
  test.setTimeout(60_000);
  for (const width of [320, 360, 390, 430, 768, 1023, 1024]) {
    await page.setViewportSize({ width, height: 844 });
    await page.goto('/ar/tools', { waitUntil: 'domcontentloaded' });
    const select = page.locator('#tools-category-mobile');
    const desktopTabs = page.locator('[role="group"][aria-label]');
    if (width < 1024) {
      await expect(select).toBeVisible();
      await expect(desktopTabs).toBeHidden();
    } else {
      await expect(select).toBeHidden();
      await expect(desktopTabs).toBeVisible();
    }
    const count = await page.locator('.ul-tools-catalog-grid .ul-tool-card').count();
    expect(count).toBe(36);
    const columns = await page.locator('.ul-tools-catalog-grid').evaluate((node) =>
      getComputedStyle(node).gridTemplateColumns.split(' ').filter(Boolean).length,
    );
    if (width < 1024) expect(columns).toBe(2);
    if (width >= 1024) expect(columns).toBeGreaterThanOrEqual(3);

    const titleMetrics = await page.locator('.ul-tools-catalog-grid .ul-tool-card-title').evaluateAll((nodes) =>
      nodes.map((node) => {
        const element = node as HTMLElement;
        return { client: element.clientWidth, scroll: element.scrollWidth, text: element.textContent?.trim() || '' };
      }),
    );
    expect(titleMetrics.length).toBe(36);
    for (const metric of titleMetrics) {
      expect(metric.text).not.toBe('');
      expect(metric.client).toBeGreaterThan(40);
      expect(metric.scroll).toBeLessThanOrEqual(metric.client + 2);
    }
    await expectNoHorizontalOverflow(page, '/ar/tools', width);
  }

  await page.setViewportSize({ width: 320, height: 844 });
  await page.goto('/ar/tools', { waitUntil: 'domcontentloaded' });
  await page.locator('#tools-category-mobile').selectOption('image');
  await expect(page.locator('.ul-tools-catalog-grid .ul-tool-card')).toHaveCount(6);
});

test('tool guides use the live workspace on phones and tablets, not a hidden desktop capture', async ({ page }) => {
  test.setTimeout(60_000);
  for (const width of [320, 360, 390, 430, 768, 1023]) {
    await page.setViewportSize({ width, height: 844 });
    await page.goto('/ar/tools/image-cropper/how-to', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('.ul-guide-live-workspace')).toBeVisible();
    await expect(page.locator('.ul-guide-desktop-capture')).toHaveCount(0);
    const workspace = await page.locator('.ul-guide-live-workspace').boundingBox();
    expect(workspace?.width || 0).toBeLessThanOrEqual(width);
    expect(workspace?.width || 0).toBeGreaterThan(width * 0.8);
    await expectNoHorizontalOverflow(page, '/ar/tools/image-cropper/how-to', width);
  }
});

test('tool detail controls remain inside narrow mobile viewports', async ({ page }) => {
  test.setTimeout(60_000);
  for (const width of [320, 360, 390, 430, 768, 1023]) {
    await page.setViewportSize({ width, height: 844 });
    await page.goto('/ar/tools/image-cropper', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('.ul-tool-page-header')).toBeVisible();
    await expect(page.locator('#tool-workspace')).toBeVisible();
    const controls = await page.locator('#tool-workspace input:not([type="file"]), #tool-workspace select, #tool-workspace textarea, #tool-workspace button').evaluateAll((nodes) =>
      nodes.map((node) => {
        const rect = node.getBoundingClientRect();
        return { left: rect.left, right: rect.right, width: rect.width };
      }).filter((rect) => rect.width > 0),
    );
    for (const control of controls) {
      expect(control.left).toBeGreaterThanOrEqual(-1);
      expect(control.right).toBeLessThanOrEqual(width + 1);
    }
    await expectNoHorizontalOverflow(page, '/ar/tools/image-cropper', width);
  }
});

test('mobile navigation drawer stays within the viewport and can be opened', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 720 });
  await page.goto('/ar', { waitUntil: 'domcontentloaded' });
  const toggle = page.locator('button[aria-controls="utilora-mobile-navigation"]');
  await expect(toggle).toBeVisible();
  await toggle.click();
  const drawer = page.locator('#utilora-mobile-navigation');
  await expect(drawer).toBeVisible();
  const bounds = await drawer.boundingBox();
  expect(bounds?.x || 0).toBeGreaterThanOrEqual(0);
  expect((bounds?.x || 0) + (bounds?.width || 0)).toBeLessThanOrEqual(321);
  expect((bounds?.y || 0) + (bounds?.height || 0)).toBeLessThanOrEqual(721);
});

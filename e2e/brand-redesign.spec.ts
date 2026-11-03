import { expect, test } from '@playwright/test';

test('Arabic homepage renders the new UTILORA brand system and split hero', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 960 });
  await page.goto('/ar');

  await expect(page.locator('[data-testid="utilora-home-hero"]')).toBeVisible();
  await expect(page.locator('[data-testid="utilora-brand-mark"]')).toBeVisible();
  await expect(page.locator('[data-testid="utilora-hero-art"]')).toBeVisible();
  await expect(page.locator('[data-testid="utilora-home-hero"] h1')).toBeVisible();
  await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
});

test('redesigned mobile homepage keeps its hero and category shortcuts within the viewport', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 720 });
  await page.goto('/ar');

  await expect(page.locator('[data-testid="utilora-home-hero"]')).toBeVisible();
  await expect(page.locator('[data-testid="utilora-hero-art"]')).toBeVisible();
  const dimensions = await page.evaluate(() => ({
    documentWidth: document.documentElement.scrollWidth,
    viewportWidth: window.innerWidth,
  }));
  expect(dimensions.documentWidth).toBeLessThanOrEqual(dimensions.viewportWidth);
});

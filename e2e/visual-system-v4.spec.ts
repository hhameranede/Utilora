import { expect, test } from '@playwright/test';

test('V4 visual system is active and keeps the homepage inside mobile viewports', async ({ page }) => {
  for (const width of [320, 360, 390, 768, 1440]) {
    await page.setViewportSize({ width, height: 820 });
    await page.goto('/en');
    await expect(page.locator('[data-testid="utilora-home-hero"]')).toBeVisible();
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();

    const metrics = await page.evaluate(() => ({
      viewport: window.innerWidth,
      document: document.documentElement.scrollWidth,
      body: document.body.scrollWidth,
      accent: getComputedStyle(document.querySelector('.ulx-site-shell')!).getPropertyValue('--ul-v4-primary').trim(),
    }));

    expect(metrics.accent).toBe('#4658d8');
    expect(Math.max(metrics.document, metrics.body)).toBeLessThanOrEqual(metrics.viewport + 1);
  }
});

test('V4 homepage remains RTL-aware and searchable in Arabic', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 800 });
  await page.goto('/ar');

  await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  await expect(page.getByRole('searchbox')).toBeVisible();
  await expect(page.locator('#quick-tools')).toBeVisible();
});

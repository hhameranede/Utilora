import { expect, test } from '@playwright/test';
import { TOOLS_LIST } from '../src/registry/tools.registry';

test('every tool guide captures its real rendered workspace and shows annotated instructions', async ({ page }) => {
  test.setTimeout(180_000);

  for (const tool of TOOLS_LIST) {
    await page.goto('/en/tools/' + tool.slug + '/how-to');
    await expect(page.getByRole('heading', { name: 'How to use ' + tool.localizedName.en })).toBeVisible();

    const screenshot = page.locator('[data-guide-screenshot]');
    await expect(screenshot, tool.slug + ' guide screenshot should be captured').toBeVisible({ timeout: 15_000 });
    const source = await screenshot.getAttribute('src');
    expect(source, tool.slug + ' screenshot should be a generated PNG data URL').toMatch(/^data:image\/png;base64,/);
    expect(await screenshot.evaluate((image: HTMLImageElement) => image.naturalWidth)).toBeGreaterThan(1000);
    await expect(page.locator('svg[data-guide-annotations]')).toBeVisible();
    await expect(page.getByRole('link', { name: /Open tool/ })).toHaveAttribute('href', '/en/tools/' + tool.slug);
  }
});

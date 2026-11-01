import { expect, test } from '@playwright/test';

test('global search exposes dialog semantics, traps focus, and restores its trigger', async ({ page }) => {
  await page.goto('/en');

  const trigger = page.getByRole('button', { name: 'Search', exact: true });
  await trigger.click();

  const dialog = page.getByRole('dialog', { name: 'Search' });
  const input = dialog.getByRole('textbox', { name: 'Search' });
  await expect(dialog).toBeVisible();
  await expect(input).toBeFocused();
  await expect(dialog).toHaveAttribute('aria-modal', 'true');

  await input.fill('json');
  const options = dialog.getByRole('option');
  await expect(options).toHaveCount(4);
  const clearButton = dialog.getByRole('button', { name: 'Clear query' });

  await page.keyboard.press('Shift+Tab');
  await expect(clearButton).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(input).toBeFocused();

  await page.keyboard.press('Escape');
  await expect(dialog).toHaveCount(0);
  await expect(trigger).toBeFocused();
});

test('global search keyboard selection opens the selected tool', async ({ page }) => {
  await page.goto('/en');

  await page.getByRole('button', { name: 'Search', exact: true }).click();
  const input = page.getByRole('dialog').getByRole('textbox', { name: 'Search' });
  await input.fill('json');
  await expect(page.getByRole('option')).toHaveCount(4);

  await input.press('ArrowDown');
  await input.press('Enter');
  await page.waitForURL('**/en/tools/json-validator');
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
});

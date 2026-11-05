import { expect, test } from '@playwright/test';

test('mobile navigation behaves like an accessible modal drawer', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/en');

  const trigger = page.getByRole('button', { name: 'Toggle navigation menu' });
  await trigger.click();

  const dialog = page.getByRole('dialog', { name: 'Toggle navigation menu' });
  await expect(dialog).toBeVisible();
  await expect(dialog).toHaveAttribute('aria-modal', 'true');
  await expect(dialog.getByRole('button', { name: 'Close' })).toBeFocused();
  await expect(dialog.getByText('⌘K')).toHaveCount(0);

  await page.keyboard.press('Shift+Tab');
  await expect.poll(() => dialog.evaluate((element) => element.contains(document.activeElement))).toBe(true);

  await page.keyboard.press('Escape');
  await expect(dialog).toHaveCount(0);
  await expect(trigger).toBeFocused();
});

test('tool catalogue gives users a reset action when filters return no results', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/en/tools');

  const search = page.getByRole('textbox', { name: /search/i });
  await search.fill('this-tool-does-not-exist');
  const emptyState = page.getByRole('status');
  await expect(emptyState).toContainText('No tools or content match your query');
  await expect(emptyState.getByRole('button', { name: 'All Tools' })).toBeVisible();

  await emptyState.getByRole('button', { name: 'All Tools' }).click();
  await expect(page.locator('a.group').filter({ hasText: 'Open Tool' }).first()).toBeVisible();
});

test('image workspace upload formats match the tool catalogue and reject unsupported extensions', async ({ page }) => {
  await page.goto('/en/tools/image-compressor');

  const fileInput = page.locator('input[type="file"]');
  await expect(fileInput).toHaveAttribute('accept', '.png,.jpg,.jpeg,.webp');
  await fileInput.setInputFiles({
    name: 'animated.gif',
    mimeType: 'image/gif',
    buffer: Buffer.from('GIF89a'),
  });

  await expect(page.getByRole('alert')).toContainText('Supported formats: PNG, JPG, JPEG, WEBP');
});

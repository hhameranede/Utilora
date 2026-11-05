import { expect, test } from '@playwright/test';

test('image upload is visible without scrolling on a phone', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/en/tools/image-compressor');
  const upload = page.getByRole('button', { name: 'Select an image to begin' });
  await expect(upload).toBeVisible();
  const box = await upload.boundingBox();
  expect(box).not.toBeNull();
  expect(box!.y).toBeLessThan(620);
  expect(box!.y + box!.height).toBeLessThan(844);
  const style = await upload.evaluate((element) => {
    const computed = getComputedStyle(element);
    return { borderStyle: computed.borderTopStyle, borderWidth: parseFloat(computed.borderTopWidth), shadow: computed.boxShadow };
  });
  expect(style.borderStyle).toBe('dashed');
  expect(style.borderWidth).toBeGreaterThanOrEqual(2);
  expect(style.shadow).not.toBe('none');
});

test('text editor is the first main interaction on a phone', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/en/tools/word-counter');
  const editor = page.locator('#tool-workspace textarea').first();
  await expect(editor).toBeVisible();
  const box = await editor.boundingBox();
  expect(box).not.toBeNull();
  expect(box!.y).toBeLessThan(650);
  expect(box!.y + Math.min(box!.height, 176)).toBeLessThan(844);
  const borderWidth = await editor.evaluate((element) => parseFloat(getComputedStyle(element).borderTopWidth));
  expect(borderWidth).toBeGreaterThanOrEqual(1);
});

test('PDF upload and action controls are visually distinct', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/en/tools/merge-pdf');
  const uploadLabel = page.getByText('Choose PDF files to merge', { exact: false }).first();
  await expect(uploadLabel).toBeVisible();
  const process = page.getByRole('button', { name: /Merge PDFs/i });
  await expect(process).toBeAttached();
  const buttonStyle = await process.evaluate((element) => {
    const computed = getComputedStyle(element);
    return { background: computed.backgroundColor, shadow: computed.boxShadow, minHeight: parseFloat(computed.minHeight) };
  });
  expect(buttonStyle.background).toBe('rgb(223, 101, 11)');
  expect(buttonStyle.shadow).not.toBe('none');
  expect(buttonStyle.minHeight).toBeGreaterThanOrEqual(48);
});
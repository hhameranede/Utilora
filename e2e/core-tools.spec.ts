import { expect, test } from '@playwright/test';
import { PDFDocument } from 'pdf-lib';

const onePixelPng = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/pL8AAAAASUVORK5CYII=',
  'base64',
);

async function makePdf(name: string): Promise<{ name: string; mimeType: string; buffer: Buffer }> {
  const pdf = await PDFDocument.create();
  const page = pdf.addPage([300, 400]);
  page.drawText(name, { x: 24, y: 350, size: 16 });
  return {
    name,
    mimeType: 'application/pdf',
    buffer: Buffer.from(await pdf.save()),
  };
}

test('image converter accepts a local image and exposes an actual downloadable result', async ({ page }) => {
  await page.goto('/en/tools/image-converter');

  await page.locator('input[type="file"]').setInputFiles({
    name: 'pixel.png',
    mimeType: 'image/png',
    buffer: onePixelPng,
  });

  await expect(page.getByAltText('Original image preview')).toBeVisible();
  await page.getByRole('button', { name: 'Process image' }).click();
  await expect(page.getByRole('status').filter({ hasText: 'Done:' })).toBeVisible();
  await expect(page.getByRole('button', { name: /Download pixel-image-converter/ })).toBeVisible();
});

test('PDF merge orders files and creates a real PDF output', async ({ page }) => {
  await page.goto('/en/tools/merge-pdf');

  const first = await makePdf('first.pdf');
  const second = await makePdf('second.pdf');
  await page.locator('input[type="file"]').setInputFiles([first, second]);

  await expect(page.getByText('Selected files (2)')).toBeVisible();
  await page.getByRole('button', { name: 'Merge PDFs' }).click();
  await expect(page.getByText('merged-document.pdf')).toBeVisible();
  await expect(page.getByText('3 pages', { exact: false })).toBeVisible();
});

test('JSON formatter formats valid input and reports invalid JSON without false success', async ({ page }) => {
  await page.goto('/en/tools/json-formatter');

  const editor = page.locator('textarea').first();
  await editor.fill('{"hello":"world","count":2}');
  await page.getByRole('button', { name: 'Format JSON' }).click();
  const formattedJson = ['{', '  "hello": "world",', '  "count": 2', '}'].join('\n');
  await expect(editor).toHaveValue(formattedJson);

  await editor.fill('{broken}');
  await page.getByRole('button', { name: 'Format JSON' }).click();
  await expect(page.getByRole('status')).toContainText(/JSON|position|property/i);
  await expect(page.getByRole('status')).not.toContainText('formatted successfully');
});

test('text case converter transforms punctuation-separated words', async ({ page }) => {
  await page.goto('/en/tools/case-converter');

  const editor = page.locator('textarea').first();
  await editor.fill('hello-world / utilora');
  await page.getByRole('button', { name: 'Title Case' }).click();
  await page.getByRole('button', { name: 'Transform Text' }).click();
  await expect(editor).toHaveValue('Hello-World / Utilora');
});

test('Arabic tool page stays within a mobile viewport and keeps RTL direction', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/ar/tools/image-cropper');

  await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  const documentWidth = await page.evaluate(() => document.documentElement.scrollWidth);
  expect(documentWidth).toBeLessThanOrEqual(390);
});

import { expect, test } from '@playwright/test';
import { PDFDocument } from 'pdf-lib';

const onePixelPng = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/pL8AAAAASUVORK5CYII=',
  'base64',
);

async function makePng(page: import('@playwright/test').Page, width = 8, height = 4): Promise<Buffer> {
  const bytes = await page.evaluate(async ({ width, height }) => {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Canvas is unavailable for the PNG fixture.');
    context.fillStyle = '#f59e0b';
    context.fillRect(0, 0, width, height);
    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob((value) => value ? resolve(value) : reject(new Error('PNG fixture export failed.')), 'image/png');
    });
    return Array.from(new Uint8Array(await blob.arrayBuffer()));
  }, { width, height });
  return Buffer.from(bytes);
}

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
    buffer: await makePng(page, 4, 2),
  });

  const sourcePreview = page.getByAltText('Original image preview');
  await expect(sourcePreview).toBeVisible();
  await expect(sourcePreview).toHaveJSProperty('naturalWidth', 1);
  const processButton = page.getByRole('button', { name: 'Process image' });
  await expect(processButton).toBeEnabled();
  await processButton.click();
  await expect.poll(async () => (
    await page.getByRole('status').count() + await page.getByRole('alert').count()
  )).toBeGreaterThan(0);
  const statusText = (await page.getByRole('status').allTextContents()).join(' ');
  const errorText = (await page.getByRole('alert').allTextContents()).join(' ');
  expect(statusText, `Image conversion did not complete. Status: ${statusText}. Error: ${errorText}`).toContain('Done:');
  const downloadButton = page.getByRole('button', { name: /Download pixel-image-converter/ });
  await expect(downloadButton).toBeVisible();
  const downloadPromise = page.waitForEvent('download');
  await downloadButton.click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toBe('pixel-image-converter.webp');
  expect(await download.failure()).toBeNull();
});

test('PDF merge orders files and creates a real PDF output', async ({ page }) => {
  await page.goto('/en/tools/merge-pdf');

  const first = await makePdf('first.pdf');
  const second = await makePdf('second.pdf');
  await page.locator('input[type="file"]').setInputFiles([first, second]);

  await expect(page.getByText('Selected files (2)')).toBeVisible();
  await page.getByRole('button', { name: 'Merge PDFs' }).click();
  await expect(page.getByText('merged-document.pdf')).toBeVisible();
  await expect(page.getByText('2 pages', { exact: false })).toBeVisible();
  const pdfDownloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Download merged-document.pdf' }).click();
  const pdfDownload = await pdfDownloadPromise;
  expect(pdfDownload.suggestedFilename()).toBe('merged-document.pdf');
  expect(await pdfDownload.failure()).toBeNull();
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

test('image cropper maps pointer dragging to source pixel coordinates', async ({ page }) => {
  await page.goto('/en/tools/image-cropper');
  await page.locator('input[type="file"]').setInputFiles({
    name: 'crop-source.png',
    mimeType: 'image/png',
    buffer: await makePng(page, 800, 400),
  });

  const preview = page.getByAltText('Original image preview');
  await expect(preview).toBeVisible();
  await expect(preview).toHaveJSProperty('naturalWidth', 800);
  const processButton = page.getByRole('button', { name: 'Process image' });
  await expect(processButton).toBeEnabled();

  const bounds = await preview.boundingBox();
  expect(bounds).not.toBeNull();
  if (!bounds) throw new Error('Image preview has no measurable bounds.');

  await page.mouse.move(bounds.x + bounds.width * 0.25, bounds.y + bounds.height * 0.25);
  await page.mouse.down();
  await page.mouse.move(bounds.x + bounds.width * 0.75, bounds.y + bounds.height * 0.75, { steps: 5 });
  await page.mouse.up();

  await expect(page.getByLabel('X')).toHaveValue('200');
  await expect(page.getByLabel('Y')).toHaveValue('100');
  await expect(page.getByLabel('Width')).toHaveValue('400');
  await expect(page.getByLabel('Height')).toHaveValue('200');

  await processButton.click();
  await expect(page.getByRole('status')).toContainText('Done: 400 × 200px');
});

test('Arabic tool page stays within a mobile viewport and keeps RTL direction', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/ar/tools/image-cropper');

  await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  const documentWidth = await page.evaluate(() => document.documentElement.scrollWidth);
  expect(documentWidth).toBeLessThanOrEqual(390);
});

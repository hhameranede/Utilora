import { expect, test, type Page } from '@playwright/test';
import { readFile } from 'node:fs/promises';
import { PDFDocument } from 'pdf-lib';

async function makePng(page: Page, width = 8, height = 4): Promise<Buffer> {
  const bytes = await page.evaluate(async ({ width, height }) => {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Canvas is unavailable for the PNG fixture.');
    context.fillStyle = '#d6a84b';
    context.fillRect(0, 0, width, height);
    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob((value) => value ? resolve(value) : reject(new Error('PNG fixture export failed.')), 'image/png');
    });
    return Array.from(new Uint8Array(await blob.arrayBuffer()));
  }, { width, height });
  return Buffer.from(bytes);
}

async function loadImage(page: Page, slug: string, width = 8, height = 4): Promise<void> {
  await page.goto('/en/tools/' + slug);
  await page.locator('input[type="file"]').setInputFiles({
    name: 'fixture.png',
    mimeType: 'image/png',
    buffer: await makePng(page, width, height),
  });
  const preview = page.getByAltText('Original image preview');
  await expect(preview).toBeVisible();
  await expect(preview).toHaveJSProperty('naturalWidth', width);
  await expect(preview).toHaveJSProperty('naturalHeight', height);
}

async function makePdf(name: string, pageCount = 1): Promise<{ name: string; mimeType: string; buffer: Buffer }> {
  const pdf = await PDFDocument.create();
  for (let index = 0; index < pageCount; index += 1) {
    const page = pdf.addPage([300, 400]);
    page.drawText(name + ' page ' + (index + 1), { x: 24, y: 350, size: 16 });
  }
  return { name, mimeType: 'application/pdf', buffer: Buffer.from(await pdf.save()) };
}

async function downloadPdfAndRead(page: Page): Promise<PDFDocument> {
  const button = page.locator('button[aria-label^="Download "]').first();
  await expect(button).toBeVisible();
  const downloadPromise = page.waitForEvent('download');
  await button.click();
  const download = await downloadPromise;
  expect(await download.failure()).toBeNull();
  const path = await download.path();
  expect(path).not.toBeNull();
  return PDFDocument.load(await readFile(path!));
}

test('image compressor produces a valid WebP file', async ({ page }) => {
  await loadImage(page, 'image-compressor');
  await page.getByRole('button', { name: 'Process image' }).click();
  await expect(page.getByRole('status')).toContainText('Done:');
  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: /Download .*image-compressor/ }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toBe('fixture-image-compressor.webp');
  const path = await download.path();
  expect(path).not.toBeNull();
  const bytes = await readFile(path!);
  expect(bytes.toString('ascii', 0, 4)).toBe('RIFF');
  expect(bytes.toString('ascii', 8, 12)).toBe('WEBP');
});

test('image resizer applies exact dimensions and exports the resized image', async ({ page }) => {
  await loadImage(page, 'image-resizer', 8, 4);
  await page.getByLabel('Width (px)').fill('4');
  await expect(page.getByLabel('Height (px)')).toHaveValue('2');
  await page.getByRole('button', { name: 'Process image' }).click();
  await expect(page.getByRole('status')).toContainText('Done: 4 × 2px');
  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: /Download .*image-resizer/ }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toBe('fixture-image-resizer.png');
  expect(await download.failure()).toBeNull();
});

test('image rotator rotates the image and changes its output dimensions', async ({ page }) => {
  await loadImage(page, 'image-rotator', 8, 4);
  await page.getByRole('button', { name: '90°', exact: true }).click();
  await page.getByRole('button', { name: 'Process image' }).click();
  await expect(page.getByRole('status')).toContainText('Done: 4 × 8px');
  await expect(page.getByAltText('Processed result preview')).toBeVisible();
});

test('image metadata viewer inspects a local image without uploading it', async ({ page }) => {
  await loadImage(page, 'image-metadata-viewer', 8, 4);
  await page.getByRole('button', { name: 'Inspect image' }).click();
  await expect(page.getByRole('status')).toContainText('Image properties inspected successfully.');
  await expect(page.getByText('8 × 4', { exact: true })).toBeVisible();
});

test('PDF split extracts the requested pages into a real PDF', async ({ page }) => {
  await page.goto('/en/tools/split-pdf');
  await page.locator('input[type="file"]').setInputFiles(await makePdf('split-source.pdf', 2));
  await expect(page.getByText('Selected files (1)')).toBeVisible();
  await page.getByLabel('Pages to extract').fill('1-2');
  await page.getByRole('button', { name: 'Extract selected pages' }).click();
  await expect(page.getByRole('status')).toContainText('Created 1 PDF output file(s).');
  const result = await downloadPdfAndRead(page);
  expect(result.getPageCount()).toBe(2);
});

test('PDF rotation changes the selected page rotation and exports a PDF', async ({ page }) => {
  await page.goto('/en/tools/rotate-pdf');
  await page.locator('input[type="file"]').setInputFiles(await makePdf('rotate-source.pdf'));
  await page.getByLabel('Pages to rotate').fill('1');
  await page.getByLabel('Rotation').selectOption('90');
  await page.getByRole('button', { name: 'Rotate pages' }).click();
  await expect(page.getByRole('status')).toContainText('PDF page rotation saved.');
  const result = await downloadPdfAndRead(page);
  expect(result.getPageCount()).toBe(1);
  expect(result.getPage(0).getRotation().angle).toBe(90);
});

test('JPG and PNG to PDF creates a valid one-page PDF', async ({ page }) => {
  await page.goto('/en/tools/jpg-to-pdf');
  await page.locator('input[type="file"]').setInputFiles({
    name: 'source.png',
    mimeType: 'image/png',
    buffer: await makePng(page, 12, 6),
  });
  await expect(page.getByText('Selected files (1)')).toBeVisible();
  await page.getByRole('button', { name: 'Create PDF' }).click();
  await expect(page.getByRole('status')).toContainText('Images converted to PDF successfully.');
  const result = await downloadPdfAndRead(page);
  expect(result.getPageCount()).toBe(1);
});

test('PDF page counter reads the actual page count', async ({ page }) => {
  await page.goto('/en/tools/pdf-page-counter');
  await page.locator('input[type="file"]').setInputFiles(await makePdf('counter.pdf', 3));
  await page.getByRole('button', { name: 'Count PDF pages' }).click();
  await expect(page.getByRole('status')).toContainText('3 page(s)');
});

test('word counter updates word statistics while typing', async ({ page }) => {
  await page.goto('/en/tools/word-counter');
  await page.locator('textarea').first().fill('one two three');
  const metric = page.getByText('Words', { exact: true }).locator('xpath=..');
  await expect(metric.locator('span').nth(1)).toHaveText('3');
});

test('character counter distinguishes characters with and without spaces', async ({ page }) => {
  await page.goto('/en/tools/character-counter');
  await page.locator('textarea').first().fill('abc de');
  const withSpaces = page.getByText('Characters', { exact: true }).locator('xpath=..');
  const withoutSpaces = page.getByText('No Spaces', { exact: true }).locator('xpath=..');
  await expect(withSpaces.locator('span').nth(1)).toHaveText('6');
  await expect(withoutSpaces.locator('span').nth(1)).toHaveText('5');
});

test('duplicate lines remover removes repeated lines after trimming whitespace', async ({ page }) => {
  await page.goto('/en/tools/duplicate-lines-remover');
  const editor = page.locator('textarea').first();
  await editor.fill('alpha\nbeta\n alpha ');
  await page.getByRole('button', { name: 'Transform Text' }).click();
  await expect(editor).toHaveValue('alpha\nbeta');
  await expect(page.getByRole('status')).toContainText('Removed 1 duplicate lines.');
});

test('sort text lines orders lines alphabetically', async ({ page }) => {
  await page.goto('/en/tools/sort-text-lines');
  const editor = page.locator('textarea').first();
  await editor.fill('zebra\napple\nmango');
  await page.locator('#utilora-sort-mode').selectOption('alphabetical-asc');
  await page.getByRole('button', { name: 'Transform Text' }).click();
  await expect(editor).toHaveValue('apple\nmango\nzebra');
});

test('text diff reports additions and removals between two inputs', async ({ page }) => {
  await page.goto('/en/tools/text-diff-checker');
  await page.getByPlaceholder('Paste the original text here...').fill('one\nold');
  await page.getByPlaceholder('Paste the modified text here...').fill('one\nnew');
  await page.getByRole('button', { name: 'Compare text' }).click();
  await expect(page.getByText('+1 added')).toBeVisible();
  await expect(page.getByText('-1 removed')).toBeVisible();
});

test('JSON validator accepts valid JSON and reports invalid JSON', async ({ page }) => {
  await page.goto('/en/tools/json-validator');
  const editor = page.locator('textarea').first();
  await editor.fill('{"name":"UTILORA","active":true}');
  await page.getByRole('button', { name: 'Validate JSON' }).click();
  await expect(page.getByRole('status')).toContainText('Valid JSON. No syntax errors were found.');
  await editor.fill('{broken}');
  await page.getByRole('button', { name: 'Validate JSON' }).click();
  await expect(page.getByRole('status')).toContainText(/Unexpected|JSON|property|position/i);
});

test('JSON minifier removes unnecessary whitespace from valid JSON', async ({ page }) => {
  await page.goto('/en/tools/json-minifier');
  const editor = page.locator('textarea').first();
  await editor.fill('{\n  "name": "UTILORA",\n  "count": 2\n}');
  await page.getByRole('button', { name: 'Minify JSON' }).click();
  await expect(editor).toHaveValue('{"name":"UTILORA","count":2}');
  await expect(page.getByRole('status')).toContainText('JSON minified successfully.');
});

test('Base64 encoder and decoder round-trip UTF-8 text', async ({ page }) => {
  await page.goto('/en/tools/base64-encoder-decoder');
  const input = page.locator('textarea').nth(0);
  const output = page.locator('textarea').nth(1);
  const original = 'Utilora — أدوات';
  await input.fill(original);
  await page.getByRole('button', { name: 'Encode Base64' }).click();
  const encoded = Buffer.from(original, 'utf8').toString('base64');
  await expect(output).toHaveValue(encoded);
  await page.getByRole('button', { name: 'Decode', exact: true }).click();
  await input.fill(encoded);
  await page.getByRole('button', { name: 'Decode Base64' }).click();
  await expect(output).toHaveValue(original);
});

test('URL encoder and decoder round-trip reserved characters', async ({ page }) => {
  await page.goto('/en/tools/url-encoder-decoder');
  const input = page.locator('textarea').nth(0);
  const output = page.locator('textarea').nth(1);
  const original = 'a b&c=1';
  await input.fill(original);
  await page.getByRole('button', { name: 'Encode URL' }).click();
  await expect(output).toHaveValue('a%20b%26c%3D1');
  await page.getByRole('button', { name: 'Decode', exact: true }).click();
  await input.fill('a%20b%26c%3D1');
  await page.getByRole('button', { name: 'Decode URL' }).click();
  await expect(output).toHaveValue(original);
});

test('UUID generator creates the requested batch of valid UUIDs', async ({ page }) => {
  await page.goto('/en/tools/uuid-generator');
  await page.getByRole('button', { name: 'Generate UUIDs' }).click();
  const values = page.locator('.break-all.select-all');
  await expect(values).toHaveCount(5);
  for (let index = 0; index < 5; index += 1) {
    await expect(values.nth(index)).toHaveText(/^[0-9a-f]{8}-[0-9a-f]{4}-[47][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
  }
  await expect(page.getByRole('status')).toContainText('Generated 5 cryptographically random UUID');
});

test('hash generator creates a SHA-256 digest locally', async ({ page }) => {
  await page.goto('/en/tools/hash-generator');
  await page.locator('#utilora-hash-input').fill('hello');
  await page.getByRole('button', { name: 'Generate Hash' }).click();
  await expect(page.locator('.break-all.select-all').first()).toHaveText(/^SHA-256: [a-f0-9]{64}$/i);
  await expect(page.getByRole('status')).toContainText('SHA-256 digest generated locally.');
});

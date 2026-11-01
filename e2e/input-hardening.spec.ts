import { expect, test } from '@playwright/test';
import { PDFDocument } from 'pdf-lib';

async function makePng(page: import('@playwright/test').Page): Promise<Buffer> {
  const bytes = await page.evaluate(async () => {
    const canvas = document.createElement('canvas');
    canvas.width = 8;
    canvas.height = 4;
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Canvas is unavailable for the image fixture.');
    context.fillStyle = '#c99a37';
    context.fillRect(0, 0, 8, 4);
    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob((value) => value ? resolve(value) : reject(new Error('PNG fixture export failed.')), 'image/png');
    });
    return Array.from(new Uint8Array(await blob.arrayBuffer()));
  });
  return Buffer.from(bytes);
}

async function makePdf(): Promise<Buffer> {
  const pdf = await PDFDocument.create();
  pdf.addPage([300, 400]);
  return Buffer.from(await pdf.save());
}

test('image workspace rejects a corrupt image clearly and recovers when a valid image is selected', async ({ page }) => {
  await page.goto('/en/tools/image-converter');
  const input = page.locator('input[type="file"]');

  await input.setInputFiles({
    name: 'broken.png',
    mimeType: 'image/png',
    buffer: Buffer.from('this is not a PNG image'),
  });
  await expect(page.getByRole('alert')).toContainText('could not be decoded');

  await input.setInputFiles({
    name: 'valid.png',
    mimeType: 'image/png',
    buffer: await makePng(page),
  });
  await expect(page.getByAltText('Original image preview')).toBeVisible();
  await expect(page.getByRole('alert')).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Process image' })).toBeEnabled();
});

test('PDF workspace reports a damaged PDF and accepts a valid replacement', async ({ page }) => {
  await page.goto('/en/tools/split-pdf');
  const input = page.locator('input[type="file"]');

  await input.setInputFiles({
    name: 'damaged.pdf',
    mimeType: 'application/pdf',
    buffer: Buffer.from('%PDF-this-file-is-incomplete'),
  });
  await expect(page.getByText('Selected files (1)')).toBeVisible();
  await page.getByRole('button', { name: 'Extract selected pages' }).click();
  await expect(page.getByRole('alert')).toContainText(/damaged|password-protected/i);

  await input.setInputFiles({
    name: 'valid.pdf',
    mimeType: 'application/pdf',
    buffer: await makePdf(),
  });
  await page.getByPlaceholder('1-3, 5, 8-10').fill('1');
  await page.getByRole('button', { name: 'Extract selected pages' }).click();
  await expect(page.getByText('valid-page-1.pdf')).toBeVisible();
  await expect(page.getByRole('alert')).toHaveCount(0);
});

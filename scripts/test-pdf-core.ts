import assert from 'node:assert/strict';
import { PDFDocument } from 'pdf-lib';
import { countPdfPages, imagesToPdf, mergePdfFiles, rotatePdfFile, splitPdfFile } from '../src/engines/pdf/browser';

function asArrayBuffer(bytes: Uint8Array): ArrayBuffer {
  const copy = new Uint8Array(bytes.byteLength);
  copy.set(bytes);
  return copy.buffer;
}

async function makePdf(name: string, pageCount: number): Promise<File> {
  const pdf = await PDFDocument.create();
  for (let index = 0; index < pageCount; index += 1) {
    const page = pdf.addPage([300, 400]);
    page.drawText(`Generated test page ${index + 1}`, { x: 30, y: 350, size: 14 });
  }
  return new File([asArrayBuffer(await pdf.save())], name, { type: 'application/pdf' });
}

async function main() {
  const first = await makePdf('first.pdf', 2);
  const second = await makePdf('second.pdf', 1);

  const details = await countPdfPages(first);
  assert.equal(details.pageCount, 2);
  assert.equal(details.title, 'first.pdf');
  assert.equal(details.hasFormFields, false);

  const merged = await mergePdfFiles([first, second]);
  assert.equal(merged.pageCount, 3);
  const mergedFile = new File([asArrayBuffer(new Uint8Array(await merged.blob.arrayBuffer()))], 'merged.pdf', { type: 'application/pdf' });

  const extracted = await splitPdfFile(mergedFile, '1, 3');
  assert.equal(extracted.length, 1);
  assert.equal(extracted[0].pageCount, 2);

  const burst = await splitPdfFile(mergedFile, '', true);
  assert.equal(burst.length, 3);
  assert.deepEqual(burst.map((item) => item.pageCount), [1, 1, 1]);

  await assert.rejects(
    rotatePdfFile(first, 45 as unknown as 90, [0]),
    /Rotation must be 90, 180, or 270/,
  );

  const rotated = await rotatePdfFile(first, 90, [0]);
  assert.equal(rotated.rotatedPageCount, 1);
  const rotatedDoc = await PDFDocument.load(await rotated.blob.arrayBuffer());
  assert.equal(rotatedDoc.getPages()[0].getRotation().angle, 90);

  const png = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/pL8AAAAASUVORK5CYII=', 'base64');
  const pngFile = new File([png.buffer.slice(png.byteOffset, png.byteOffset + png.byteLength)], 'pixel.png', { type: 'image/png' });
  await assert.rejects(
    imagesToPdf([pngFile], 'a4', Number.NaN),
    /margin must be a finite number/,
  );

  const converted = await imagesToPdf([pngFile], 'a4', 10);
  assert.equal(converted.pageCount, 1);
  const convertedDoc = await PDFDocument.load(await converted.blob.arrayBuffer());
  assert.equal(convertedDoc.getPageCount(), 1);

  const portrait = await imagesToPdf([pngFile], 'a4', 10, 'portrait');
  const portraitDoc = await PDFDocument.load(await portrait.blob.arrayBuffer());
  const portraitSize = portraitDoc.getPage(0).getSize();
  assert.ok(portraitSize.height > portraitSize.width);

  const landscape = await imagesToPdf([pngFile], 'a4', 10, 'landscape');
  const landscapeDoc = await PDFDocument.load(await landscape.blob.arrayBuffer());
  const landscapeSize = landscapeDoc.getPage(0).getSize();
  assert.ok(landscapeSize.width > landscapeSize.height);

  console.log('PDF engine smoke tests passed: page count, merge, range split, burst split, rotate, image-to-PDF, portrait and landscape orientation.');
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

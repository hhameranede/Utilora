import { PDFDocument, degrees } from 'pdf-lib';

const MAX_PDF_SIZE = 100 * 1024 * 1024;
const MAX_PDF_PAGES = 250;

function bytesToPdfBlob(bytes: Uint8Array): Blob {
  const buffer = new ArrayBuffer(bytes.byteLength);
  new Uint8Array(buffer).set(bytes);
  return new Blob([buffer], { type: 'application/pdf' });
}

function validatePdfFiles(files: File[]): void {
  if (!files.length) throw new Error('Select at least one PDF file.');
  for (const file of files) {
    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      throw new Error(`${file.name} is not a PDF file.`);
    }
    if (file.size > MAX_PDF_SIZE) throw new Error(`${file.name} exceeds the 100 MB per-file limit.`);
  }
}

async function loadPdf(file: File): Promise<PDFDocument> {
  validatePdfFiles([file]);
  try {
    const pdf = await PDFDocument.load(await file.arrayBuffer());
    if (pdf.getPageCount() > MAX_PDF_PAGES) throw new Error('This PDF exceeds the 250-page safety limit.');
    return pdf;
  } catch (error) {
    if (error instanceof Error && (error.message.includes('safety limit') || error.message.includes('100 MB'))) throw error;
    throw new Error(`Could not open ${file.name}. The PDF may be damaged or password-protected.`);
  }
}

export async function mergePdfFiles(files: File[]): Promise<{ blob: Blob; pageCount: number; size: number }> {
  validatePdfFiles(files);
  if (files.length < 2) throw new Error('Choose at least two PDF files to merge.');
  const output = await PDFDocument.create();
  let totalPages = 0;
  for (const file of files) {
    const source = await loadPdf(file);
    const pages = await output.copyPages(source, source.getPageIndices());
    pages.forEach((page) => output.addPage(page));
    totalPages += pages.length;
    if (totalPages > MAX_PDF_PAGES) throw new Error('The merged document would exceed 250 pages.');
  }
  const bytes = await output.save();
  return { blob: bytesToPdfBlob(bytes), pageCount: totalPages, size: bytes.length };
}

function parsePageRanges(input: string, totalPages: number): number[] {
  if (!input.trim()) throw new Error('Enter page numbers, for example 1-3, 5, 8-10.');
  const selected = new Set<number>();
  for (const raw of input.split(',')) {
    const token = raw.trim();
    if (!token) continue;
    const match = token.match(/^(\d+)(?:\s*-\s*(\d+))?$/);
    if (!match) throw new Error(`Invalid page range: "${token}". Use numbers and ranges separated by commas.`);
    const start = Number(match[1]);
    const end = Number(match[2] ?? match[1]);
    if (start < 1 || end < start || end > totalPages) throw new Error(`Page range "${token}" is outside this PDF (1–${totalPages}).`);
    for (let page = start; page <= end; page += 1) selected.add(page - 1);
  }
  return [...selected].sort((a, b) => a - b);
}

export async function splitPdfFile(file: File, ranges: string, burst = false): Promise<Array<{ filename: string; blob: Blob; pageCount: number }>> {
  const source = await loadPdf(file);
  const total = source.getPageCount();
  const indices = burst ? source.getPageIndices() : parsePageRanges(ranges, total);
  if (burst && total > 100) throw new Error('Burst mode is limited to 100 output files.');
  if (!indices.length) throw new Error('No pages were selected.');
  if (burst) {
    const results = [];
    for (const pageIndex of indices) {
      const part = await PDFDocument.create();
      const [page] = await part.copyPages(source, [pageIndex]);
      part.addPage(page);
      const bytes = await part.save();
      results.push({ filename: `${file.name.replace(/\.pdf$/i, '')}-page-${pageIndex + 1}.pdf`, blob: bytesToPdfBlob(bytes), pageCount: 1 });
    }
    return results;
  }
  const part = await PDFDocument.create();
  const pages = await part.copyPages(source, indices);
  pages.forEach((page) => part.addPage(page));
  const bytes = await part.save();
  return [{ filename: `${file.name.replace(/\.pdf$/i, '')}-extracted.pdf`, blob: bytesToPdfBlob(bytes), pageCount: pages.length }];
}

export async function rotatePdfFile(file: File, rotation: 90 | 180 | 270, targetPages: number[] | 'all'): Promise<{ blob: Blob; rotatedPageCount: number }> {
  if (![90, 180, 270].includes(rotation)) throw new Error('Rotation must be 90, 180, or 270 degrees.');
  const pdf = await loadPdf(file);
  const pages = pdf.getPages();
  const targets = targetPages === 'all' ? pages.map((_, index) => index) : [...new Set(targetPages)];
  if (!targets.length) throw new Error('Choose at least one page to rotate.');
  targets.forEach((index) => {
    if (!Number.isInteger(index) || index < 0 || index >= pages.length) throw new Error(`Page ${index + 1} is outside this PDF.`);
    const page = pages[index];
    page.setRotation(degrees((page.getRotation().angle + rotation) % 360));
  });
  const bytes = await pdf.save();
  return { blob: bytesToPdfBlob(bytes), rotatedPageCount: targets.length };
}

export async function imagesToPdf(files: File[], pageSize: 'fit' | 'a4' | 'letter' = 'fit', marginMm = 10, orientation: 'auto' | 'portrait' | 'landscape' = 'auto'): Promise<{ blob: Blob; pageCount: number }> {
  if (!files.length) throw new Error('Choose at least one JPG or PNG image.');
  if (files.length > 100) throw new Error('Choose no more than 100 images at a time.');
  if (!Number.isFinite(marginMm)) throw new Error('Image-to-PDF margin must be a finite number.');
  const pdf = await PDFDocument.create();
  const margin = Math.max(0, Math.min(30, marginMm)) * 72 / 25.4;
  for (const file of files) {
    if (!['image/jpeg', 'image/png'].includes(file.type)) throw new Error(`${file.name}: choose JPG or PNG images.`);
    if (file.size > 30 * 1024 * 1024) throw new Error(`${file.name} exceeds the 30 MB per-image limit.`);
    const bytes = new Uint8Array(await file.arrayBuffer());
    const image = file.type === 'image/png' ? await pdf.embedPng(bytes) : await pdf.embedJpg(bytes);
    const imageDims = image.scale(1);
    let pageWidth = imageDims.width + margin * 2;
    let pageHeight = imageDims.height + margin * 2;
    if (pageSize === 'a4') { pageWidth = 595.28; pageHeight = 841.89; }
    if (pageSize === 'letter') { pageWidth = 612; pageHeight = 792; }
    const landscape = orientation === 'landscape' || (orientation === 'auto' && imageDims.width > imageDims.height);
    if (landscape !== (pageWidth > pageHeight)) [pageWidth, pageHeight] = [pageHeight, pageWidth];
    const availableWidth = Math.max(1, pageWidth - margin * 2);
    const availableHeight = Math.max(1, pageHeight - margin * 2);
    const scale = Math.min(availableWidth / imageDims.width, availableHeight / imageDims.height, 1);
    const width = imageDims.width * scale;
    const height = imageDims.height * scale;
    const page = pdf.addPage([pageWidth, pageHeight]);
    page.drawImage(image, { x: (pageWidth - width) / 2, y: (pageHeight - height) / 2, width, height });
  }
  const bytes = await pdf.save();
  return { blob: bytesToPdfBlob(bytes), pageCount: files.length };
}

export async function countPdfPages(file: File): Promise<{ pageCount: number; title: string; size: number; hasFormFields: boolean }> {
  const pdf = await loadPdf(file);
  return { pageCount: pdf.getPageCount(), title: pdf.getTitle() || file.name, size: file.size, hasFormFields: pdf.getForm().getFields().length > 0 };
}

export async function renderPdfToImages(
  file: File,
  dpi: 150 | 300 = 150,
  format: 'jpg' | 'png' = 'jpg',
  selectedPages?: number[],
): Promise<Array<{ filename: string; blob: Blob; pageNumber: number }>> {
  validatePdfFiles([file]);
  const [pdfjs, pdfWorker] = await Promise.all([
    import('pdfjs-dist'),
    import('pdfjs-dist/build/pdf.worker.min.mjs?url'),
  ]);
  pdfjs.GlobalWorkerOptions.workerSrc = pdfWorker.default;
  const bytes = new Uint8Array(await file.arrayBuffer());
  const loadingTask = pdfjs.getDocument({ data: bytes });
  let pdfDocument: Awaited<typeof loadingTask.promise> | undefined;
  const outputs: Array<{ filename: string; blob: Blob; pageNumber: number }> = [];
  try {
    pdfDocument = await loadingTask.promise;
    if (pdfDocument.numPages > MAX_PDF_PAGES) throw new Error('This PDF exceeds the 250-page safety limit.');
    const pages = selectedPages?.length ? [...new Set(selectedPages)] : Array.from({ length: pdfDocument.numPages }, (_, index) => index + 1);
    if (pages.length > 40) throw new Error('Export is limited to 40 pages at a time to protect device memory.');
    for (const pageNumber of pages) {
      if (!Number.isInteger(pageNumber) || pageNumber < 1 || pageNumber > pdfDocument.numPages) throw new Error(`Page ${pageNumber} is outside this PDF.`);
      const page = await pdfDocument.getPage(pageNumber);
      const viewport = page.getViewport({ scale: dpi / 72 });
      if (viewport.width * viewport.height > 45_000_000) throw new Error(`Page ${pageNumber} is too large at ${dpi} DPI. Try 150 DPI.`);
      const canvas = globalThis.document.createElement('canvas');
      canvas.width = Math.ceil(viewport.width);
      canvas.height = Math.ceil(viewport.height);
      const context = canvas.getContext('2d');
      if (!context) throw new Error('Canvas rendering is unavailable in this browser.');
      await page.render({ canvas, canvasContext: context, viewport }).promise;
      const mime = format === 'png' ? 'image/png' : 'image/jpeg';
      const blob = await new Promise<Blob>((resolve, reject) => canvas.toBlob((result) => result ? resolve(result) : reject(new Error('Unable to export rendered PDF page.')), mime, 0.92));
      outputs.push({ filename: `${file.name.replace(/\.pdf$/i, '')}-page-${pageNumber}.${format}`, blob, pageNumber });
      canvas.width = 0;
      canvas.height = 0;
      page.cleanup();
    }
    return outputs;
  } finally {
    try {
      pdfDocument?.cleanup();
    } finally {
      await loadingTask.destroy();
    }
  }
}

import { ToolAdapter } from '../types';
import { countPdfPages, imagesToPdf, mergePdfFiles, renderPdfToImages, rotatePdfFile, splitPdfFile } from './browser';

function failure<T>(error: unknown) {
  return {
    success: false,
    error: { code: 'PDF_PROCESSING_ERROR', message: error instanceof Error ? error.message : 'Unable to process this PDF.' },
  } as const;
}

export interface MergePdfInput { files: File[]; pageOrdering?: { fileIndex: number; pageNumber: number }[]; }
export interface MergePdfOutput { blob: Blob; totalPages: number; totalSize: number; }
export const MergePdfAdapter: ToolAdapter<MergePdfInput, Record<string, never>, MergePdfOutput> = {
  id: 'merge-pdf', name: 'Merge PDF Adapter', isConnected: true,
  async execute(input) {
    const started = performance.now();
    try {
      const result = await mergePdfFiles(input.files);
      return { success: true, data: { blob: result.blob, totalPages: result.pageCount, totalSize: result.size }, durationMs: performance.now() - started };
    } catch (error) { return failure<MergePdfOutput>(error); }
  },
};

export interface SplitPdfInput { file: File; }
export interface SplitPdfOptions { mode: 'range' | 'burst'; ranges?: string; }
export interface SplitPdfOutput { files: Array<{ filename: string; blob: Blob; pageCount: number }>; }
export const SplitPdfAdapter: ToolAdapter<SplitPdfInput, SplitPdfOptions, SplitPdfOutput> = {
  id: 'split-pdf', name: 'Split PDF Adapter', isConnected: true,
  async execute(input, options = { mode: 'range', ranges: '1' }) {
    const started = performance.now();
    try {
      const files = await splitPdfFile(input.file, options.ranges ?? '', options.mode === 'burst');
      return { success: true, data: { files }, durationMs: performance.now() - started };
    } catch (error) { return failure<SplitPdfOutput>(error); }
  },
};

export interface RotatePdfInput { file: File; }
export interface RotatePdfOptions { degrees: 90 | 180 | 270; targetPages: 'all' | number[]; }
export interface RotatePdfOutput { blob: Blob; rotatedPageCount: number; }
export const RotatePdfAdapter: ToolAdapter<RotatePdfInput, RotatePdfOptions, RotatePdfOutput> = {
  id: 'rotate-pdf', name: 'Rotate PDF Adapter', isConnected: true,
  async execute(input, options = { degrees: 90, targetPages: 'all' }) {
    const started = performance.now();
    try {
      const pages = options.targetPages === 'all' ? 'all' : options.targetPages.map((number) => number - 1);
      const result = await rotatePdfFile(input.file, options.degrees, pages);
      return { success: true, data: result, durationMs: performance.now() - started };
    } catch (error) { return failure<RotatePdfOutput>(error); }
  },
};

export interface JpgToPdfInput { files: File[]; }
export interface JpgToPdfOptions { pageSize: 'fit' | 'a4' | 'letter'; orientation: 'auto' | 'portrait' | 'landscape'; marginMm: number; }
export interface JpgToPdfOutput { blob: Blob; pageCount: number; }
export const JpgToPdfAdapter: ToolAdapter<JpgToPdfInput, JpgToPdfOptions, JpgToPdfOutput> = {
  id: 'jpg-to-pdf', name: 'JPG to PDF Adapter', isConnected: true,
  async execute(input, options = { pageSize: 'fit', orientation: 'auto', marginMm: 10 }) {
    const started = performance.now();
    try {
      const result = await imagesToPdf(input.files, options.pageSize, options.marginMm);
      return { success: true, data: result, durationMs: performance.now() - started };
    } catch (error) { return failure<JpgToPdfOutput>(error); }
  },
};

export interface PdfToJpgInput { file: File; }
export interface PdfToJpgOptions { dpi: 150 | 300; pages?: number[]; format: 'jpg' | 'png'; }
export interface PdfToJpgOutput { images: Array<{ pageNumber: number; blob: Blob; filename: string }>; }
export const PdfToJpgAdapter: ToolAdapter<PdfToJpgInput, PdfToJpgOptions, PdfToJpgOutput> = {
  id: 'pdf-to-jpg', name: 'PDF to JPG Adapter', isConnected: true,
  async execute(input, options = { dpi: 150, format: 'jpg' }) {
    const started = performance.now();
    try {
      const images = await renderPdfToImages(input.file, options.dpi, options.format, options.pages);
      return { success: true, data: { images }, durationMs: performance.now() - started };
    } catch (error) { return failure<PdfToJpgOutput>(error); }
  },
};

export interface PdfPageCounterInput { file: File; }
export interface PdfPageCounterOutput { pageCount: number; pdfVersion: string; hasFormFields: boolean; isEncrypted: boolean; }
export const PdfPageCounterAdapter: ToolAdapter<PdfPageCounterInput, Record<string, never>, PdfPageCounterOutput> = {
  id: 'pdf-page-counter', name: 'PDF Page Counter Adapter', isConnected: true,
  async execute(input) {
    const started = performance.now();
    try {
      const result = await countPdfPages(input.file);
      const header = new TextDecoder().decode((await input.file.slice(0, 16).arrayBuffer()));
      const version = header.match(/%PDF-(\d\.\d)/)?.[1] ?? 'unknown';
      return { success: true, data: { pageCount: result.pageCount, pdfVersion: version, hasFormFields: result.hasFormFields, isEncrypted: false }, durationMs: performance.now() - started };
    } catch (error) { return failure<PdfPageCounterOutput>(error); }
  },
};

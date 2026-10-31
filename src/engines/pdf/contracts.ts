import { ToolAdapter } from '../types';

// ==========================================
// 7. Merge PDF
// ==========================================
export interface MergePdfInput {
  files: File[];
  pageOrdering?: { fileIndex: number; pageNumber: number }[];
}
export interface MergePdfOutput {
  blob: Blob;
  totalPages: number;
  totalSize: number;
}

export const MergePdfAdapter: ToolAdapter<MergePdfInput, Record<string, never>, MergePdfOutput> = {
  id: 'merge-pdf',
  name: 'Merge PDF Adapter',
  isConnected: false,
  async execute() {
    // TODO: Connect pdf-lib / MuPDF in Phase 2
    throw new Error('Engine not connected.');
  },
};

// ==========================================
// 8. Split PDF
// ==========================================
export interface SplitPdfInput {
  file: File;
}
export interface SplitPdfOptions {
  mode: 'range' | 'burst';
  ranges?: string; // e.g. "1-3, 5, 8-10"
}
export interface SplitPdfOutput {
  files: Array<{ filename: string; blob: Blob; pageCount: number }>;
}

export const SplitPdfAdapter: ToolAdapter<SplitPdfInput, SplitPdfOptions, SplitPdfOutput> = {
  id: 'split-pdf',
  name: 'Split PDF Adapter',
  isConnected: false,
  async execute() {
    // TODO: Connect pdf-lib in Phase 2
    throw new Error('Engine not connected.');
  },
};

// ==========================================
// 9. Rotate PDF
// ==========================================
export interface RotatePdfInput {
  file: File;
}
export interface RotatePdfOptions {
  degrees: 90 | 180 | 270;
  targetPages: 'all' | number[];
}
export interface RotatePdfOutput {
  blob: Blob;
  rotatedPageCount: number;
}

export const RotatePdfAdapter: ToolAdapter<RotatePdfInput, RotatePdfOptions, RotatePdfOutput> = {
  id: 'rotate-pdf',
  name: 'Rotate PDF Adapter',
  isConnected: false,
  async execute() {
    // TODO: Connect pdf-lib page rotation in Phase 2
    throw new Error('Engine not connected.');
  },
};

// ==========================================
// 10. JPG to PDF
// ==========================================
export interface JpgToPdfInput {
  files: File[];
}
export interface JpgToPdfOptions {
  pageSize: 'fit' | 'a4' | 'letter';
  orientation: 'auto' | 'portrait' | 'landscape';
  marginMm: number;
}
export interface JpgToPdfOutput {
  blob: Blob;
  pageCount: number;
}

export const JpgToPdfAdapter: ToolAdapter<JpgToPdfInput, JpgToPdfOptions, JpgToPdfOutput> = {
  id: 'jpg-to-pdf',
  name: 'JPG to PDF Adapter',
  isConnected: false,
  async execute() {
    // TODO: Connect pdf-lib image embedding in Phase 2
    throw new Error('Engine not connected.');
  },
};

// ==========================================
// 11. PDF to JPG
// ==========================================
export interface PdfToJpgInput {
  file: File;
}
export interface PdfToJpgOptions {
  dpi: 150 | 300;
  pages?: number[];
  format: 'jpg' | 'png';
}
export interface PdfToJpgOutput {
  images: Array<{ pageNumber: number; blob: Blob; filename: string }>;
}

export const PdfToJpgAdapter: ToolAdapter<PdfToJpgInput, PdfToJpgOptions, PdfToJpgOutput> = {
  id: 'pdf-to-jpg',
  name: 'PDF to JPG Adapter',
  isConnected: false,
  async execute() {
    // TODO: Connect PDF.js rasterizer in Phase 2
    throw new Error('Engine not connected.');
  },
};

// ==========================================
// 12. PDF Page Counter
// ==========================================
export interface PdfPageCounterInput {
  file: File;
}
export interface PdfPageCounterOutput {
  pageCount: number;
  pdfVersion: string;
  hasFormFields: boolean;
  isEncrypted: boolean;
}

export const PdfPageCounterAdapter: ToolAdapter<PdfPageCounterInput, Record<string, never>, PdfPageCounterOutput> = {
  id: 'pdf-page-counter',
  name: 'PDF Page Counter Adapter',
  isConnected: false,
  async execute() {
    // TODO: Connect fast PDF header/trailer byte parser in Phase 2
    throw new Error('Engine not connected.');
  },
};

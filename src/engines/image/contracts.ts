import { ToolAdapter, EngineExecutionResult } from '../types';

// ==========================================
// 1. Image Converter
// ==========================================
export interface ImageConverterInput {
  file: File;
}
export interface ImageConverterOptions {
  targetFormat: 'png' | 'jpg' | 'webp' | 'avif';
  quality: number; // 1 - 100
  preserveMetadata?: boolean;
}
export interface ImageConverterOutput {
  blob: Blob;
  filename: string;
  originalSize: number;
  newSize: number;
  format: string;
}

export const ImageConverterAdapter: ToolAdapter<ImageConverterInput, ImageConverterOptions, ImageConverterOutput> = {
  id: 'image-converter',
  name: 'PNG/JPG/WebP Converter Adapter',
  isConnected: false,
  async execute() {
    // TODO: Connect WebAssembly / Canvas / OffscreenCanvas engine in Phase 2
    throw new Error('Engine not connected. UTILORA is currently in UI Preview Mode.');
  },
};

// ==========================================
// 2. Image Compressor
// ==========================================
export interface ImageCompressorInput {
  file: File;
}
export interface ImageCompressorOptions {
  quality: number; // 1 - 100
  maxDimension?: number;
  lossless?: boolean;
}
export interface ImageCompressorOutput {
  blob: Blob;
  filename: string;
  originalSize: number;
  compressedSize: number;
  savingsPercent: number;
}

export const ImageCompressorAdapter: ToolAdapter<ImageCompressorInput, ImageCompressorOptions, ImageCompressorOutput> = {
  id: 'image-compressor',
  name: 'Image Compressor Adapter',
  isConnected: false,
  async execute() {
    // TODO: Connect mozjpeg/oxipng/libwebp WASM in Phase 2
    throw new Error('Engine not connected. UTILORA is currently in UI Preview Mode.');
  },
};

// ==========================================
// 3. Image Resizer
// ==========================================
export interface ImageResizerInput {
  file: File;
}
export interface ImageResizerOptions {
  mode: 'pixels' | 'percentage';
  targetWidth?: number;
  targetHeight?: number;
  percentage?: number;
  maintainAspectRatio: boolean;
  resampleFilter?: 'bicubic' | 'bilinear' | 'lanczos';
}
export interface ImageResizerOutput {
  blob: Blob;
  width: number;
  height: number;
  newSize: number;
}

export const ImageResizerAdapter: ToolAdapter<ImageResizerInput, ImageResizerOptions, ImageResizerOutput> = {
  id: 'image-resizer',
  name: 'Image Resizer Adapter',
  isConnected: false,
  async execute() {
    // TODO: Connect Pica or WebGL Lanczos shader resizer in Phase 2
    throw new Error('Engine not connected.');
  },
};

// ==========================================
// 4. Image Cropper
// ==========================================
export interface ImageCropperInput {
  file: File;
}
export interface ImageCropperOptions {
  cropBox: { x: number; y: number; width: number; height: number };
  aspectRatioPreset?: 'free' | '1:1' | '16:9' | '4:3' | 'circle';
}
export interface ImageCropperOutput {
  blob: Blob;
  croppedWidth: number;
  croppedHeight: number;
}

export const ImageCropperAdapter: ToolAdapter<ImageCropperInput, ImageCropperOptions, ImageCropperOutput> = {
  id: 'image-cropper',
  name: 'Image Cropper Adapter',
  isConnected: false,
  async execute() {
    // TODO: Connect client canvas cropper in Phase 2
    throw new Error('Engine not connected.');
  },
};

// ==========================================
// 5. Image Rotator
// ==========================================
export interface ImageRotatorInput {
  file: File;
}
export interface ImageRotatorOptions {
  degrees: 90 | 180 | 270;
  flipHorizontal?: boolean;
  flipVertical?: boolean;
}
export interface ImageRotatorOutput {
  blob: Blob;
  orientation: string;
}

export const ImageRotatorAdapter: ToolAdapter<ImageRotatorInput, ImageRotatorOptions, ImageRotatorOutput> = {
  id: 'image-rotator',
  name: 'Image Rotator Adapter',
  isConnected: false,
  async execute() {
    // TODO: Connect lossless JPEG transform / canvas rotation in Phase 2
    throw new Error('Engine not connected.');
  },
};

// ==========================================
// 6. Image Metadata Viewer (EXIF)
// ==========================================
export interface ImageMetadataViewerInput {
  file: File;
}
export interface ImageMetadataViewerOutput {
  dimensions: { width: number; height: number };
  colorSpace: string;
  hasAlpha: boolean;
  exifTags?: {
    cameraMake?: string;
    cameraModel?: string;
    focalLength?: string;
    aperture?: string;
    iso?: number;
    shutterSpeed?: string;
    dateTaken?: string;
    gpsCoordinates?: { lat: number; lng: number };
  };
}

export const ImageMetadataViewerAdapter: ToolAdapter<ImageMetadataViewerInput, Record<string, never>, ImageMetadataViewerOutput> = {
  id: 'image-metadata-viewer',
  name: 'Image Metadata Viewer Adapter',
  isConnected: false,
  async execute() {
    // TODO: Connect exifr / exiv2 WebAssembly in Phase 2
    throw new Error('Engine not connected.');
  },
};

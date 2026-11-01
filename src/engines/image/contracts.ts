import { ToolAdapter } from '../types';
import { getBrowserImageDimensions, readBrowserImageMetadata, transformBrowserImage } from './browser';

function failure<T>(error: unknown) {
  return {
    success: false,
    error: { code: 'IMAGE_PROCESSING_ERROR', message: error instanceof Error ? error.message : 'Unable to process this image.' },
  } as const;
}

export interface ImageConverterInput { file: File; }
export interface ImageConverterOptions { targetFormat: 'png' | 'jpg' | 'webp'; quality: number; }
export interface ImageConverterOutput { blob: Blob; filename: string; originalSize: number; newSize: number; format: string; }

export const ImageConverterAdapter: ToolAdapter<ImageConverterInput, ImageConverterOptions, ImageConverterOutput> = {
  id: 'image-converter', name: 'PNG/JPG/WebP Converter Adapter', isConnected: true,
  async execute(input, options = { targetFormat: 'webp', quality: 85 }) {
    const started = performance.now();
    try {
      const targetFormat = options.targetFormat === 'jpg' ? 'jpeg' : options.targetFormat;
      const result = await transformBrowserImage(input.file, { format: targetFormat, quality: options.quality });
      const extension = targetFormat === 'jpeg' ? 'jpg' : targetFormat;
      return { success: true, data: { blob: result.blob, filename: input.file.name.replace(/\.[^.]+$/, '') + '.' + extension, originalSize: input.file.size, newSize: result.blob.size, format: targetFormat }, durationMs: performance.now() - started };
    } catch (error) { return failure<ImageConverterOutput>(error); }
  },
};

export interface ImageCompressorInput { file: File; }
export interface ImageCompressorOptions { quality: number; maxDimension?: number; }
export interface ImageCompressorOutput { blob: Blob; filename: string; originalSize: number; compressedSize: number; savingsPercent: number; }

export const ImageCompressorAdapter: ToolAdapter<ImageCompressorInput, ImageCompressorOptions, ImageCompressorOutput> = {
  id: 'image-compressor', name: 'Image Compressor Adapter', isConnected: true,
  async execute(input, options = { quality: 75 }) {
    const started = performance.now();
    try {
      const dimensions = await getBrowserImageDimensions(input.file);
      const limit = Math.max(1, Math.min(12000, options.maxDimension ?? 12000));
      const scale = Math.min(1, limit / Math.max(dimensions.width, dimensions.height));
      const width = Math.max(1, Math.round(dimensions.width * scale));
      const height = Math.max(1, Math.round(dimensions.height * scale));
      const result = await transformBrowserImage(input.file, { format: 'webp', quality: options.quality, width, height });
      return { success: true, data: {
        blob: result.blob,
        filename: input.file.name.replace(/\.[^.]+$/, '') + '.webp',
        originalSize: input.file.size,
        compressedSize: result.blob.size,
        savingsPercent: Math.round((1 - result.blob.size / Math.max(1, input.file.size)) * 100),
      }, durationMs: performance.now() - started };
    } catch (error) { return failure<ImageCompressorOutput>(error); }
  },
};

export interface ImageResizerInput { file: File; }
export interface ImageResizerOptions { mode: 'pixels' | 'percentage'; targetWidth?: number; targetHeight?: number; percentage?: number; maintainAspectRatio: boolean; }
export interface ImageResizerOutput { blob: Blob; width: number; height: number; newSize: number; }

export const ImageResizerAdapter: ToolAdapter<ImageResizerInput, ImageResizerOptions, ImageResizerOutput> = {
  id: 'image-resizer', name: 'Image Resizer Adapter', isConnected: true,
  async execute(input, options = { mode: 'pixels', maintainAspectRatio: true }) {
    const started = performance.now();
    try {
      const { width: sourceWidth, height: sourceHeight } = await getBrowserImageDimensions(input.file);
      const width = options.mode === 'percentage' ? Math.round(sourceWidth * (options.percentage ?? 100) / 100) : (options.targetWidth ?? sourceWidth);
      const height = options.maintainAspectRatio ? Math.round(width * sourceHeight / sourceWidth) : (options.mode === 'percentage' ? Math.round(sourceHeight * (options.percentage ?? 100) / 100) : (options.targetHeight ?? sourceHeight));
      const result = await transformBrowserImage(input.file, { format: 'png', width, height });
      return { success: true, data: { blob: result.blob, width: result.width, height: result.height, newSize: result.blob.size }, durationMs: performance.now() - started };
    } catch (error) { return failure<ImageResizerOutput>(error); }
  },
};

export interface ImageCropperInput { file: File; }
export interface ImageCropperOptions { cropBox?: { x: number; y: number; width: number; height: number }; }
export interface ImageCropperOutput { blob: Blob; croppedWidth: number; croppedHeight: number; }

export const ImageCropperAdapter: ToolAdapter<ImageCropperInput, ImageCropperOptions, ImageCropperOutput> = {
  id: 'image-cropper', name: 'Image Cropper Adapter', isConnected: true,
  async execute(input, options) {
    const started = performance.now();
    try {
      const result = await transformBrowserImage(input.file, {
        format: 'png',
        ...(options?.cropBox ? { crop: options.cropBox } : {}),
      });
      return { success: true, data: { blob: result.blob, croppedWidth: result.width, croppedHeight: result.height }, durationMs: performance.now() - started };
    } catch (error) { return failure<ImageCropperOutput>(error); }
  },
};

export interface ImageRotatorInput { file: File; }
export interface ImageRotatorOptions { degrees: 90 | 180 | 270; flipHorizontal?: boolean; flipVertical?: boolean; }
export interface ImageRotatorOutput { blob: Blob; orientation: string; }

export const ImageRotatorAdapter: ToolAdapter<ImageRotatorInput, ImageRotatorOptions, ImageRotatorOutput> = {
  id: 'image-rotator', name: 'Image Rotator Adapter', isConnected: true,
  async execute(input, options = { degrees: 90 }) {
    const started = performance.now();
    try {
      const result = await transformBrowserImage(input.file, { format: 'png', rotation: options.degrees, flipHorizontal: options.flipHorizontal, flipVertical: options.flipVertical });
      return { success: true, data: { blob: result.blob, orientation: `${options.degrees}° clockwise${options.flipHorizontal ? ', flipped horizontally' : ''}${options.flipVertical ? ', flipped vertically' : ''}` }, durationMs: performance.now() - started };
    } catch (error) { return failure<ImageRotatorOutput>(error); }
  },
};

export interface ImageMetadataViewerInput { file: File; }
export interface ImageMetadataViewerOutput {
  dimensions: { width: number; height: number };
  mimeType: string;
  hasAlpha: boolean;
  exifTags?: { cameraMake?: string; cameraModel?: string; focalLength?: string; aperture?: string; iso?: number; shutterSpeed?: string; dateTaken?: string; gpsCoordinates?: { lat: number; lng: number } };
}

export const ImageMetadataViewerAdapter: ToolAdapter<ImageMetadataViewerInput, Record<string, never>, ImageMetadataViewerOutput> = {
  id: 'image-metadata-viewer', name: 'Image Metadata Viewer Adapter', isConnected: true,
  async execute(input) {
    const started = performance.now();
    try {
      const metadata = await readBrowserImageMetadata(input.file);
      return { success: true, data: { dimensions: { width: metadata.width, height: metadata.height }, mimeType: metadata.mimeType, hasAlpha: metadata.hasTransparency }, durationMs: performance.now() - started };
    } catch (error) { return failure<ImageMetadataViewerOutput>(error); }
  },
};

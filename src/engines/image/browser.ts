export type ImageOutputFormat = 'png' | 'jpeg' | 'webp';

export interface BrowserImageOptions {
  format?: ImageOutputFormat;
  quality?: number;
  width?: number;
  height?: number;
  crop?: { x: number; y: number; width: number; height: number };
  rotation?: 0 | 90 | 180 | 270;
  flipHorizontal?: boolean;
  flipVertical?: boolean;
}

export interface BrowserImageResult {
  blob: Blob;
  width: number;
  height: number;
  originalWidth: number;
  originalHeight: number;
  originalSize: number;
}

function assertImageFile(file: File): void {
  if (!file.type.startsWith('image/')) throw new Error('Choose a valid image file.');
  if (file.size > 50 * 1024 * 1024) throw new Error('Image is larger than the 50 MB limit.');
}

async function decodeImage(file: File): Promise<ImageBitmap> {
  assertImageFile(file);
  try {
    return await createImageBitmap(file);
  } catch {
    throw new Error('This image format could not be decoded by your browser. Try PNG, JPG, or WebP.');
  }
}

function canvasToBlob(canvas: HTMLCanvasElement, mime: string, quality: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) reject(new Error('Your browser could not export this image format.'));
      else if (blob.type !== mime) reject(new Error(`This browser does not support ${mime.replace('image/', '').toUpperCase()} export. Choose PNG, JPG, or WebP.`));
      else resolve(blob);
    }, mime, quality);
  });
}

export async function transformBrowserImage(file: File, options: BrowserImageOptions = {}): Promise<BrowserImageResult> {
  const bitmap = await decodeImage(file);
  try {
    const crop = options.crop ?? { x: 0, y: 0, width: bitmap.width, height: bitmap.height };
    if (![crop.x, crop.y, crop.width, crop.height].every(Number.isFinite) ||
        crop.x < 0 || crop.y < 0 || crop.width < 1 || crop.height < 1 ||
        crop.x >= bitmap.width || crop.y >= bitmap.height) {
      throw new Error('Crop coordinates must start inside the image and use positive width and height.');
    }
    const sx = Math.floor(crop.x);
    const sy = Math.floor(crop.y);
    const sw = Math.max(1, Math.min(bitmap.width - sx, Math.floor(crop.width)));
    const sh = Math.max(1, Math.min(bitmap.height - sy, Math.floor(crop.height)));
    const scale = Math.min(1, 12000 / Math.max(sw, sh));
    const drawWidth = Math.max(1, Math.round(options.width ?? sw * scale));
    const drawHeight = Math.max(1, Math.round(options.height ?? sh * scale));
    if (drawWidth > 12000 || drawHeight > 12000 || drawWidth * drawHeight > 80_000_000) {
      throw new Error('The requested output dimensions are too large for a safe browser canvas.');
    }

    const rotation = ((options.rotation ?? 0) % 360 + 360) % 360;
    const swapsSides = rotation === 90 || rotation === 270;
    const canvas = document.createElement('canvas');
    canvas.width = swapsSides ? drawHeight : drawWidth;
    canvas.height = swapsSides ? drawWidth : drawHeight;
    const context = canvas.getContext('2d', { alpha: options.format !== 'jpeg' });
    if (!context) throw new Error('Canvas processing is unavailable in this browser.');

    if (options.format === 'jpeg') {
      context.fillStyle = '#ffffff';
      context.fillRect(0, 0, canvas.width, canvas.height);
    }
    context.imageSmoothingEnabled = true;
    context.imageSmoothingQuality = 'high';
    context.translate(canvas.width / 2, canvas.height / 2);
    context.scale(options.flipHorizontal ? -1 : 1, options.flipVertical ? -1 : 1);
    context.rotate((rotation * Math.PI) / 180);
    context.drawImage(bitmap, sx, sy, sw, sh, -drawWidth / 2, -drawHeight / 2, drawWidth, drawHeight);

    const format = options.format ?? 'webp';
    const mime = format === 'jpeg' ? 'image/jpeg' : `image/${format}`;
    const blob = await canvasToBlob(canvas, mime, Math.max(0.1, Math.min(1, (options.quality ?? 85) / 100)));
    return {
      blob,
      width: canvas.width,
      height: canvas.height,
      originalWidth: bitmap.width,
      originalHeight: bitmap.height,
      originalSize: file.size,
    };
  } finally {
    bitmap.close();
  }
}

export interface BrowserImageMetadata {
  name: string;
  mimeType: string;
  sizeBytes: number;
  width: number;
  height: number;
  aspectRatio: string;
  hasTransparency: boolean;
  lastModified: string;
  metadataNote: string;
}

export async function readBrowserImageMetadata(file: File): Promise<BrowserImageMetadata> {
  const bitmap = await decodeImage(file);
  try {
    const canvas = document.createElement('canvas');
    canvas.width = Math.min(96, bitmap.width);
    canvas.height = Math.min(96, bitmap.height);
    const context = canvas.getContext('2d', { willReadFrequently: true });
    if (!context) throw new Error('Canvas inspection is unavailable in this browser.');
    context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    const pixels = context.getImageData(0, 0, canvas.width, canvas.height).data;
    let hasTransparency = false;
    for (let index = 3; index < pixels.length; index += 4) {
      if (pixels[index] < 255) { hasTransparency = true; break; }
    }
    const divisor = gcd(bitmap.width, bitmap.height);
    return {
      name: file.name,
      mimeType: file.type || 'Unknown',
      sizeBytes: file.size,
      width: bitmap.width,
      height: bitmap.height,
      aspectRatio: `${bitmap.width / divisor}:${bitmap.height / divisor}`,
      hasTransparency,
      lastModified: file.lastModified ? new Date(file.lastModified).toLocaleString() : 'Unknown',
      metadataNote: 'Canvas inspection reports file and pixel properties. EXIF camera/GPS metadata is not read.',
    };
  } finally {
    bitmap.close();
  }
}

function gcd(a: number, b: number): number {
  while (b) [a, b] = [b, a % b];
  return a || 1;
}

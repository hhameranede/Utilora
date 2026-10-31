import assert from 'node:assert/strict';
import { readBrowserImageMetadata, transformBrowserImage } from '../src/engines/image/browser';

type HarnessOptions = {
  width?: number;
  height?: number;
  alpha?: number;
  decodeError?: Error;
  exportedMime?: string | null;
};

function installBrowserMocks(options: HarnessOptions = {}) {
  const originalDocument = Object.getOwnPropertyDescriptor(globalThis, 'document');
  const originalCreateImageBitmap = Object.getOwnPropertyDescriptor(globalThis, 'createImageBitmap');
  const draws: unknown[][] = [];
  const scales: number[][] = [];
  const rotations: number[] = [];
  const translations: number[][] = [];
  const fills: Array<{ color: string; args: number[] }> = [];
  const bitmaps: Array<{ closed: boolean }> = [];
  const canvases: Array<{ width: number; height: number; mime: string | null; quality?: number }> = [];
  let getContextOptions: unknown;
  let alphaPixels: number[] = [];

  const context = {
    fillStyle: '#000000',
    imageSmoothingEnabled: false,
    imageSmoothingQuality: 'low',
    fillRect(...args: number[]) {
      fills.push({ color: String(this.fillStyle), args });
    },
    translate(...args: number[]) { translations.push(args); },
    scale(...args: number[]) { scales.push(args); },
    rotate(value: number) { rotations.push(value); },
    drawImage(...args: unknown[]) { draws.push(args); },
    getImageData() { return { data: new Uint8ClampedArray(alphaPixels) }; },
  } as unknown as CanvasRenderingContext2D;

  const fakeDocument = {
    createElement(tagName: string) {
      assert.equal(tagName, 'canvas');
      const canvas = {
        width: 0,
        height: 0,
        getContext(_kind: string, contextOptions?: unknown) {
          getContextOptions = contextOptions;
          return context;
        },
        toBlob(callback: BlobCallback, mime?: string, quality?: number) {
          const actualMime = options.exportedMime === undefined ? (mime ?? null) : options.exportedMime;
          canvases.push({ width: canvas.width, height: canvas.height, mime: actualMime, quality });
          callback(actualMime ? new Blob(['rendered-image'], { type: actualMime }) : null);
        },
      };
      return canvas;
    },
  } as unknown as Document;

  Object.defineProperty(globalThis, 'document', { configurable: true, value: fakeDocument });
  Object.defineProperty(globalThis, 'createImageBitmap', {
    configurable: true,
    value: async () => {
      if (options.decodeError) throw options.decodeError;
      const bitmapState = { closed: false };
      bitmaps.push(bitmapState);
      return {
        width: options.width ?? 4,
        height: options.height ?? 2,
        close() { bitmapState.closed = true; },
      } as unknown as ImageBitmap;
    },
  });

  const width = options.width ?? 4;
  const height = options.height ?? 2;
  alphaPixels = new Array(width * height * 4).fill(0);
  for (let index = 3; index < alphaPixels.length; index += 4) alphaPixels[index] = 255;
  if (options.alpha !== undefined && alphaPixels.length >= 4) alphaPixels[3] = options.alpha;

  return {
    draws,
    scales,
    rotations,
    translations,
    fills,
    bitmaps,
    canvases,
    getContextOptions: () => getContextOptions,
    restore() {
      if (originalDocument) Object.defineProperty(globalThis, 'document', originalDocument);
      else Reflect.deleteProperty(globalThis, 'document');
      if (originalCreateImageBitmap) Object.defineProperty(globalThis, 'createImageBitmap', originalCreateImageBitmap);
      else Reflect.deleteProperty(globalThis, 'createImageBitmap');
    },
  };
}

function makeImageFile(type = 'image/png'): File {
  return new File([new Uint8Array([1, 2, 3, 4])], 'sample.png', {
    type,
    lastModified: 1_700_000_000_000,
  });
}

async function run(name: string, operation: () => void | Promise<void>) {
  await operation();
  process.stdout.write(\`✓ \${name}\n\`);
}

await run('transforms an image to WebP and preserves source dimensions by default', async () => {
  const mock = installBrowserMocks();
  try {
    const result = await transformBrowserImage(makeImageFile());
    assert.equal(result.width, 4);
    assert.equal(result.height, 2);
    assert.equal(result.originalWidth, 4);
    assert.equal(result.originalHeight, 2);
    assert.equal(result.blob.type, 'image/webp');
    assert.equal(result.blob.size > 0, true);
    assert.deepEqual(mock.draws[0].slice(1, 5), [0, 0, 4, 2]);
    assert.equal(mock.canvases[0].mime, 'image/webp');
    assert.equal(mock.bitmaps[0].closed, true);
  } finally {
    mock.restore();
  }
});

await run('applies source-pixel crop, resize, quarter-turn rotation, and flips', async () => {
  const mock = installBrowserMocks();
  try {
    const result = await transformBrowserImage(makeImageFile(), {
      format: 'png',
      crop: { x: 1, y: 0, width: 2, height: 2 },
      width: 8,
      height: 4,
      rotation: 90,
      flipHorizontal: true,
      flipVertical: true,
    });
    assert.equal(result.width, 4);
    assert.equal(result.height, 8);
    assert.deepEqual(mock.draws[0], [
      mock.draws[0][0], 1, 0, 2, 2, -4, -2, 8, 4,
    ]);
    assert.deepEqual(mock.scales[0], [-1, -1]);
    assert.equal(mock.rotations[0], Math.PI / 2);
    assert.deepEqual(mock.translations[0], [2, 4]);
    assert.equal(mock.bitmaps[0].closed, true);
  } finally {
    mock.restore();
  }
});

await run('fills JPEG output with white and clamps valid quality values', async () => {
  const mock = installBrowserMocks();
  try {
    await transformBrowserImage(makeImageFile(), { format: 'jpeg', quality: 150 });
    assert.deepEqual(mock.fills, [{ color: '#ffffff', args: [0, 0, 4, 2] }]);
    assert.equal(mock.canvases[0].mime, 'image/jpeg');
    assert.equal(mock.canvases[0].quality, 1);
    assert.deepEqual(mock.getContextOptions(), { alpha: false });
  } finally {
    mock.restore();
  }
});

await run('rejects malformed crop rectangles and still releases decoded bitmap resources', async () => {
  for (const crop of [
    { x: -1, y: 0, width: 1, height: 1 },
    { x: 0, y: 0, width: 0, height: 1 },
    { x: 0, y: 0, width: Number.NaN, height: 1 },
    { x: 4, y: 0, width: 1, height: 1 },
  ]) {
    const mock = installBrowserMocks();
    try {
      await assert.rejects(
        transformBrowserImage(makeImageFile(), { crop }),
        /Crop coordinates/,
      );
      assert.equal(mock.bitmaps[0].closed, true);
    } finally {
      mock.restore();
    }
  }
});

await run('rejects non-image files, oversized files, and unsupported image decoding', async () => {
  const invalidType = installBrowserMocks();
  try {
    await assert.rejects(transformBrowserImage(makeImageFile('application/pdf')), /valid image file/);
    assert.equal(invalidType.bitmaps.length, 0);
  } finally {
    invalidType.restore();
  }

  const tooLarge = installBrowserMocks();
  try {
    const hugeFile = { name: 'huge.png', type: 'image/png', size: 50 * 1024 * 1024 + 1 } as File;
    await assert.rejects(transformBrowserImage(hugeFile), /50 MB limit/);
    assert.equal(tooLarge.bitmaps.length, 0);
  } finally {
    tooLarge.restore();
  }

  const decodeFailure = installBrowserMocks({ decodeError: new Error('decoder failed') });
  try {
    await assert.rejects(transformBrowserImage(makeImageFile()), /could not be decoded/);
  } finally {
    decodeFailure.restore();
  }
});

await run('rejects unsafe output dimensions and releases the source bitmap', async () => {
  const mock = installBrowserMocks();
  try {
    await assert.rejects(
      transformBrowserImage(makeImageFile(), { width: 12_001 }),
      /dimensions are too large/,
    );
    assert.equal(mock.bitmaps[0].closed, true);
  } finally {
    mock.restore();
  }
});

await run('rejects a browser that cannot export the requested MIME type', async () => {
  const mock = installBrowserMocks({ exportedMime: 'image/png' });
  try {
    await assert.rejects(
      transformBrowserImage(makeImageFile(), { format: 'webp' }),
      /does not support WEBP export/,
    );
    assert.equal(mock.bitmaps[0].closed, true);
  } finally {
    mock.restore();
  }
});

await run('reads pixel metadata, aspect ratio, transparency, and honest EXIF limitations', async () => {
  const mock = installBrowserMocks({ width: 4, height: 2, alpha: 120 });
  try {
    const metadata = await readBrowserImageMetadata(makeImageFile());
    assert.equal(metadata.name, 'sample.png');
    assert.equal(metadata.mimeType, 'image/png');
    assert.equal(metadata.width, 4);
    assert.equal(metadata.height, 2);
    assert.equal(metadata.aspectRatio, '2:1');
    assert.equal(metadata.hasTransparency, true);
    assert.equal(metadata.sizeBytes, 4);
    assert.match(metadata.metadataNote, /EXIF camera\/GPS metadata is not read/);
    assert.equal(mock.bitmaps[0].closed, true);
  } finally {
    mock.restore();
  }
});

process.stdout.write('All image engine smoke tests passed.\n');

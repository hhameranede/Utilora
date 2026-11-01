import type { ToolAdapter } from '../types';
import type {
  VideoMetadataViewerInput,
  VideoMetadataViewerOutput,
  ThumbnailExtractorInput,
  ThumbnailExtractorOptions,
  ThumbnailExtractorOutput,
} from './contracts';

const MAX_VIDEO_BYTES = 500 * 1024 * 1024;
const SUPPORTED_EXTENSIONS = new Set(['mp4', 'webm', 'mov']);
const MAX_THUMBNAIL_PIXELS = 12_000_000;
const VIDEO_LOAD_TIMEOUT_MS = 20_000;

interface LoadedVideo {
  video: HTMLVideoElement;
  dispose: () => void;
}

function getExtension(file: File): string {
  const dot = file.name.lastIndexOf('.');
  return dot >= 0 ? file.name.slice(dot + 1).toLowerCase() : '';
}

export function validateVideoFile(file: File): { valid: boolean; reason?: string } {
  if (!(file instanceof File)) return { valid: false, reason: 'Choose a video file to continue.' };
  if (file.size <= 0) return { valid: false, reason: 'The selected video file is empty.' };
  if (file.size > MAX_VIDEO_BYTES) return { valid: false, reason: 'The video exceeds the 500 MB limit.' };

  const extension = getExtension(file);
  const supportedMime = ['video/mp4', 'video/webm', 'video/quicktime'].includes(file.type);
  if (!SUPPORTED_EXTENSIONS.has(extension) && !supportedMime) {
    return { valid: false, reason: 'Use an MP4, WebM, or MOV video file.' };
  }
  return { valid: true };
}

async function loadVideo(file: File): Promise<LoadedVideo> {
  const validation = validateVideoFile(file);
  if (!validation.valid) throw new Error(validation.reason || 'This video file is not supported.');

  const objectUrl = URL.createObjectURL(file);
  const video = document.createElement('video');
  video.preload = 'auto';
  video.muted = true;
  video.playsInline = true;

  try {
    await new Promise<void>((resolve, reject) => {
      const timeout = window.setTimeout(() => {
        cleanup();
        reject(new Error('The browser took too long to read this video. Try a shorter or smaller file.'));
      }, VIDEO_LOAD_TIMEOUT_MS);

      const cleanup = () => {
        window.clearTimeout(timeout);
        video.removeEventListener('loadedmetadata', onLoaded);
        video.removeEventListener('error', onError);
      };
      const onLoaded = () => {
        cleanup();
        resolve();
      };
      const onError = () => {
        cleanup();
        reject(new Error('This browser could not decode the selected video. Try an MP4 or WebM file encoded with a browser-supported codec.'));
      };

      video.addEventListener('loadedmetadata', onLoaded, { once: true });
      video.addEventListener('error', onError, { once: true });
      video.src = objectUrl;
      video.load();
    });
  } catch (error) {
    video.removeAttribute('src');
    video.load();
    URL.revokeObjectURL(objectUrl);
    throw error;
  }

  return {
    video,
    dispose: () => {
      video.pause();
      video.removeAttribute('src');
      video.load();
      URL.revokeObjectURL(objectUrl);
    },
  };
}

export async function readFiniteDuration(video: HTMLVideoElement, restorePosition = true): Promise<number> {
  if (Number.isFinite(video.duration) && video.duration > 0) return video.duration;

  if (video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA) {
    await waitForFrameData(video);
    if (Number.isFinite(video.duration) && video.duration > 0) return video.duration;
  }

  const getSeekableEnd = () => {
    try {
      const ranges = video.seekable;
      if (!ranges.length) return null;
      const end = ranges.end(ranges.length - 1);
      return Number.isFinite(end) && end > 0 ? end : null;
    } catch {
      return null;
    }
  };

  const seekableEnd = getSeekableEnd();
  if (seekableEnd !== null) return seekableEnd;

  // MediaRecorder-generated WebM files can expose duration === Infinity.
  // Seeking beyond the final packet makes Chromium resolve the actual duration.
  return new Promise<number>((resolve, reject) => {
    let settled = false;
    const initialTime = Number.isFinite(video.currentTime) ? video.currentTime : 0;
    const timeout = window.setTimeout(() => {
      finish(new Error('The video duration is not available in this browser.'));
    }, 5_000);

    const cleanup = () => {
      window.clearTimeout(timeout);
      video.removeEventListener('durationchange', inspect);
      video.removeEventListener('timeupdate', inspect);
      video.removeEventListener('seeked', inspect);
      video.removeEventListener('progress', inspect);
      video.removeEventListener('error', onError);
    };

    const finish = (value: number | Error) => {
      if (settled) return;
      settled = true;
      cleanup();
      if (value instanceof Error) {
        reject(value);
        return;
      }
      // Interactive previews preserve their playhead. Extraction callers can
      // opt out and seek directly from the duration probe to the requested frame.
      if (restorePosition) {
        try {
          const restoreTime = Math.min(initialTime, value);
          if (Math.abs(video.currentTime - restoreTime) > 0.01) video.currentTime = restoreTime;
        } catch {
          // The caller can still perform an explicit seek before using a frame.
        }
      }
      resolve(value);
    };

    const inspect = () => {
      if (Number.isFinite(video.duration) && video.duration > 0) {
        finish(video.duration);
        return;
      }
      const end = getSeekableEnd();
      if (end !== null) finish(end);
    };
    const onError = () => finish(new Error('The browser could not determine the video duration.'));

    video.addEventListener('durationchange', inspect);
    video.addEventListener('timeupdate', inspect);
    video.addEventListener('seeked', inspect);
    video.addEventListener('progress', inspect);
    video.addEventListener('error', onError, { once: true });

    try {
      video.currentTime = 1e101;
      inspect();
    } catch {
      finish(new Error('This browser cannot resolve the duration of this video file.'));
    }
  });
}

function greatestCommonDivisor(a: number, b: number): number {
  let x = Math.round(a);
  let y = Math.round(b);
  while (y !== 0) {
    const next = x % y;
    x = y;
    y = next;
  }
  return Math.max(1, x);
}

function getContainer(file: File): string {
  const extension = getExtension(file);
  if (extension === 'mov') return 'QuickTime / MOV';
  if (extension === 'webm') return 'WebM';
  if (extension === 'mp4') return 'MP4';
  if (file.type === 'video/quicktime') return 'QuickTime / MOV';
  if (file.type === 'video/webm') return 'WebM';
  return 'MP4';
}

export async function inspectVideoMetadata(file: File): Promise<VideoMetadataViewerOutput> {
  const loaded = await loadVideo(file);
  try {
    const { video } = loaded;
    const width = video.videoWidth;
    const height = video.videoHeight;
    const durationSeconds = await readFiniteDuration(video);

    if (!width || !height || !Number.isFinite(durationSeconds) || durationSeconds <= 0) {
      throw new Error('The browser could not read valid video dimensions or duration.');
    }

    const ratioDivisor = greatestCommonDivisor(width, height);
    const bitrateKbps = Math.round((file.size * 8) / durationSeconds / 1000);

    return {
      durationSeconds,
      dimensions: { width, height },
      aspectRatio: (width / ratioDivisor) + ':' + (height / ratioDivisor),
      frameRate: null,
      videoCodec: null,
      audioCodec: null,
      bitrateKbps: Number.isFinite(bitrateKbps) ? bitrateKbps : null,
      container: getContainer(file) + ' (' + (width / ratioDivisor) + ':' + (height / ratioDivisor) + ' aspect)',
    };
  } finally {
    loaded.dispose();
  }
}

async function waitForFrameData(video: HTMLVideoElement): Promise<void> {
  if (video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) return;

  await new Promise<void>((resolve, reject) => {
    const timeout = window.setTimeout(() => {
      cleanup();
      reject(new Error('The browser could not decode a video frame.'));
    }, 10_000);
    const cleanup = () => {
      window.clearTimeout(timeout);
      video.removeEventListener('loadeddata', onLoaded);
      video.removeEventListener('error', onError);
    };
    const onLoaded = () => {
      cleanup();
      resolve();
    };
    const onError = () => {
      cleanup();
      reject(new Error('The selected video frame could not be decoded.'));
    };
    video.addEventListener('loadeddata', onLoaded, { once: true });
    video.addEventListener('error', onError, { once: true });
    if (video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) onLoaded();
  });
}

async function seekTo(video: HTMLVideoElement, seconds: number): Promise<void> {
  await new Promise<void>((resolve, reject) => {
    const timeout = window.setTimeout(() => {
      cleanup();
      reject(new Error('Seeking to this timestamp timed out. Try a nearby timestamp.'));
    }, 10_000);
    const cleanup = () => {
      window.clearTimeout(timeout);
      video.removeEventListener('seeked', onSeeked);
      video.removeEventListener('error', onError);
    };
    const onSeeked = () => {
      cleanup();
      resolve();
    };
    const onError = () => {
      cleanup();
      reject(new Error('The browser could not decode the requested frame.'));
    };

    video.addEventListener('seeked', onSeeked, { once: true });
    video.addEventListener('error', onError, { once: true });
    try {
      video.currentTime = seconds;
      if (Math.abs(video.currentTime - seconds) < 0.001 &&
          video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
        window.requestAnimationFrame(() => onSeeked());
      }
    } catch {
      cleanup();
      reject(new Error('The browser rejected this video timestamp.'));
    }
  });
}

function canvasToBlob(canvas: HTMLCanvasElement, mimeType: string, quality?: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error('The browser could not export this video frame. Try a different image format.'));
    }, mimeType, quality);
  });
}

export async function extractVideoThumbnail(
  file: File,
  options: ThumbnailExtractorOptions,
): Promise<ThumbnailExtractorOutput> {
  if (!Number.isFinite(options.timestampSeconds) || options.timestampSeconds < 0) {
    throw new Error('Enter a valid non-negative timestamp.');
  }
  if (options.format !== 'png' && options.format !== 'jpg') {
    throw new Error('Choose PNG or JPG as the output format.');
  }

  const loaded = await loadVideo(file);
  try {
    const { video } = loaded;
    const duration = await readFiniteDuration(video, false);
    const width = video.videoWidth;
    const height = video.videoHeight;
    if (!width || !height || !Number.isFinite(duration) || duration <= 0) {
      throw new Error('The browser could not read a usable video frame.');
    }

    const timestampSeconds = Math.min(options.timestampSeconds, Math.max(0, duration - 0.04));
    if (Math.abs(video.currentTime - timestampSeconds) > 0.02) {
      // A seeked event confirms that the requested frame has been decoded.
      // Do not wait for loadeddata here: that one-time event may already have fired.
      await seekTo(video, timestampSeconds);
    } else {
      await waitForFrameData(video);
    }

    const scale = Math.min(1, Math.sqrt(MAX_THUMBNAIL_PIXELS / (width * height)));
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(width * scale));
    canvas.height = Math.max(1, Math.round(height * scale));

    const context = canvas.getContext('2d');
    if (!context) throw new Error('Canvas is unavailable in this browser.');
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    const format = options.format;
    const blob = await canvasToBlob(
      canvas,
      format === 'png' ? 'image/png' : 'image/jpeg',
      format === 'jpg' ? Math.max(0.1, Math.min(1, options.quality ?? 0.92)) : undefined,
    );
    const imageUrl = URL.createObjectURL(blob);

    return { blob, imageUrl, timestampSeconds };
  } finally {
    loaded.dispose();
  }
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'Video processing failed. Try another file.';
}

export const VideoMetadataViewerAdapter: ToolAdapter<
  VideoMetadataViewerInput,
  Record<string, never>,
  VideoMetadataViewerOutput
> = {
  id: 'video-metadata-viewer',
  name: 'Video Metadata Viewer Adapter',
  isConnected: true,
  validateInput(input) {
    return validateVideoFile(input.file);
  },
  async execute(input, _options, onProgress) {
    try {
      onProgress?.({ stage: 'Reading local video metadata', percent: 20 });
      const data = await inspectVideoMetadata(input.file);
      onProgress?.({ stage: 'Metadata ready', percent: 100 });
      return { success: true, data };
    } catch (error) {
      return { success: false, error: { code: 'VIDEO_METADATA_FAILED', message: errorMessage(error) } };
    }
  },
};

export const ThumbnailExtractorAdapter: ToolAdapter<
  ThumbnailExtractorInput,
  ThumbnailExtractorOptions,
  ThumbnailExtractorOutput
> = {
  id: 'thumbnail-extractor',
  name: 'Thumbnail Extractor Adapter',
  isConnected: true,
  validateInput(input) {
    return validateVideoFile(input.file);
  },
  async execute(input, options, onProgress) {
    try {
      if (!options) throw new Error('Choose a timestamp and image format before extracting a frame.');
      onProgress?.({ stage: 'Loading local video', percent: 10 });
      const data = await extractVideoThumbnail(input.file, options);
      onProgress?.({ stage: 'Thumbnail extracted', percent: 100 });
      return { success: true, data };
    } catch (error) {
      return { success: false, error: { code: 'THUMBNAIL_EXTRACTION_FAILED', message: errorMessage(error) } };
    }
  },
};

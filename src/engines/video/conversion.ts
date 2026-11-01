import {
  AdtsOutputFormat,
  ALL_FORMATS,
  BlobSource,
  BufferTarget,
  Conversion,
  Input,
  Mp3OutputFormat,
  Output,
  Quality,
  WavOutputFormat,
  WebMOutputFormat,
  canEncodeAudio,
} from 'mediabunny';
import type {
  VideoCompressorInput,
  VideoCompressorOptions,
  VideoCompressorOutput,
  VideoToAudioInput,
  VideoToAudioOptions,
  VideoToAudioOutput,
  VideoTrimmerInput,
  VideoTrimmerOptions,
  VideoTrimmerOutput,
} from './contracts';
import type { EngineExecutionResult, EngineProgress, ToolAdapter } from '../types';

const MAX_TRANSCODE_BYTES = 250 * 1024 * 1024;
const MAX_AUDIO_EXPORT_BYTES = 500 * 1024 * 1024;
const ACCEPTED_VIDEO_EXTENSIONS = new Set(['mp4', 'webm', 'mov']);
const activeConversions = new Set<{ cancel: () => Promise<void> }>();

type ConversionSettings = Omit<Parameters<typeof Conversion.init>[0], 'input' | 'output'>;
type OutputFormatType = ConstructorParameters<typeof Output>[0]['format'];

function extensionOf(file: File): string {
  const separator = file.name.lastIndexOf('.');
  return separator >= 0 ? file.name.slice(separator + 1).toLowerCase() : '';
}

function validateFile(file: File, maxBytes: number): { valid: boolean; reason?: string } {
  if (!(file instanceof File)) return { valid: false, reason: 'Choose a video file to continue.' };
  if (file.size <= 0) return { valid: false, reason: 'The selected video file is empty.' };
  if (file.size > maxBytes) {
    return { valid: false, reason: 'The selected file exceeds the ' + Math.round(maxBytes / (1024 * 1024)) + ' MB limit.' };
  }

  const extension = extensionOf(file);
  const mimeAllowed = ['video/mp4', 'video/webm', 'video/quicktime'].includes(file.type);
  if (!ACCEPTED_VIDEO_EXTENSIONS.has(extension) && !mimeAllowed) {
    return { valid: false, reason: 'Use an MP4, WebM, or MOV video file.' };
  }
  return { valid: true };
}

function errorMessage(error: unknown): string {
  if (error instanceof Error) {
    if (/cancel/i.test(error.name) || /cancel/i.test(error.message)) return 'Processing was cancelled.';
    return error.message;
  }
  return 'The browser could not process this media file. Try another supported video.';
}

function throwIfDiscardedMediaTracks(
  conversion: Awaited<ReturnType<typeof Conversion.init>>,
  allowedUserDiscardedTracks: readonly ('video' | 'audio')[] = [],
): void {
  const unsupported = conversion.discardedTracks.filter(({ track, reason }) =>
    (track.type === 'video' || track.type === 'audio') &&
    !(reason === 'discarded_by_user' && allowedUserDiscardedTracks.includes(track.type)),
  );
  if (unsupported.length > 0) {
    const detail = unsupported
      .map(({ track, reason }) => track.type + ' track: ' + reason.replaceAll('_', ' '))
      .join('; ');
    throw new Error(
      'This browser cannot preserve every audio/video track in the requested output. ' + detail +
      '. Try a different source file or a browser with compatible media codecs.',
    );
  }
  if (!conversion.isValid) {
    throw new Error('This browser does not have a compatible decoder and encoder for this media conversion.');
  }
}

async function convertToBlob(
  file: File,
  format: OutputFormatType,
  settings: ConversionSettings,
  onProgress?: (progress: EngineProgress) => void,
  allowedUserDiscardedTracks: readonly ('video' | 'audio')[] = [],
): Promise<Blob> {
  const input = new Input({
    source: new BlobSource(file, { maxCacheSize: 32 * 1024 * 1024 }),
    formats: ALL_FORMATS,
  });
  const target = new BufferTarget();
  let conversion: Awaited<ReturnType<typeof Conversion.init>> | null = null;

  try {
    onProgress?.({ stage: 'Reading media tracks', percent: 8 });
    const output = new Output({ format, target });
    conversion = await Conversion.init({ input, output, ...settings });
    throwIfDiscardedMediaTracks(conversion, allowedUserDiscardedTracks);

    activeConversions.add(conversion);
    onProgress?.({ stage: 'Preparing browser media encoder', percent: 15 });
    conversion.onProgress = (progress: number) => {
      // Mediabunny reports a 0–1 ratio. A resolved execute() promise, not 100%,
      // is the signal that the output has been finalized.
      onProgress?.({
        stage: 'Processing media locally',
        percent: Math.max(15, Math.min(96, Math.round(15 + progress * 81))),
      });
    };

    await conversion.execute();
    const buffer = target.buffer;
    if (!buffer || buffer.byteLength === 0) {
      throw new Error('The media engine completed without producing an output file.');
    }

    onProgress?.({ stage: 'Finalizing download', percent: 99 });
    return new Blob([buffer], { type: format.mimeType });
  } finally {
    if (conversion) activeConversions.delete(conversion);
    input.dispose();
  }
}

export function cancelActiveVideoConversions(): void {
  for (const conversion of [...activeConversions]) {
    void conversion.cancel().catch(() => undefined);
  }
}

function outputBaseName(file: File): string {
  return file.name.replace(/\.[^.]+$/, '') || 'utilora-video';
}

export const VideoCompressorAdapter: ToolAdapter<
  VideoCompressorInput,
  VideoCompressorOptions,
  VideoCompressorOutput
> = {
  id: 'video-compressor',
  name: 'Video Compressor Adapter',
  isConnected: true,
  validateInput(input) {
    return validateFile(input.file, MAX_TRANSCODE_BYTES);
  },
  async execute(input, options, onProgress): Promise<EngineExecutionResult<VideoCompressorOutput>> {
    const validation = this.validateInput?.(input);
    if (!validation?.valid) {
      return { success: false, error: { code: 'VIDEO_FILE_INVALID', message: validation?.reason || 'Invalid video file.' } };
    }
    if (!options) {
      return { success: false, error: { code: 'VIDEO_SETTINGS_REQUIRED', message: 'Choose a compression quality and target resolution.' } };
    }

    const started = performance.now();
    try {
      const file = input.file;
      const videoTracksInput = new Input({
        source: new BlobSource(file),
        formats: ALL_FORMATS,
      });
      let sourceHeight = 0;
      try {
        const track = await videoTracksInput.getPrimaryVideoTrack();
        if (!track) throw new Error('No video track was found in this file.');
        if (!(await track.canDecode())) {
          throw new Error('This browser cannot decode the video codec in this file.');
        }
        sourceHeight = await track.getDisplayHeight();
      } finally {
        videoTracksInput.dispose();
      }

      const targetHeight = options.targetResolution && options.targetResolution !== 'original'
        ? Math.min(sourceHeight, Number.parseInt(options.targetResolution, 10))
        : undefined;
      const quality = options.quality === 'high'
        ? new Quality('high')
        : options.quality === 'small'
          ? new Quality('low')
          : new Quality('medium');

      const blob = await convertToBlob(
        file,
        new WebMOutputFormat(),
        {
          tracks: 'primary',
          video: {
            ...(targetHeight ? { height: targetHeight } : {}),
            quality,
            hardwareAcceleration: options.preset === 'ultrafast'
              ? 'prefer-hardware'
              : options.preset === 'medium'
                ? 'prefer-software'
                : 'no-preference',
          },
        },
        onProgress,
      );

      const data: VideoCompressorOutput = {
        blob,
        originalSize: file.size,
        compressedSize: blob.size,
        filename: outputBaseName(file) + '-compressed.webm',
      };
      onProgress?.({ stage: 'Compression complete', percent: 100 });
      return { success: true, data, durationMs: performance.now() - started };
    } catch (error) {
      return {
        success: false,
        error: {
          code: /cancel/i.test(errorMessage(error)) ? 'VIDEO_CONVERSION_CANCELLED' : 'VIDEO_COMPRESSION_FAILED',
          message: errorMessage(error),
        },
        durationMs: performance.now() - started,
      };
    }
  },
  cancel: cancelActiveVideoConversions,
};

export const VideoTrimmerAdapter: ToolAdapter<
  VideoTrimmerInput,
  VideoTrimmerOptions,
  VideoTrimmerOutput
> = {
  id: 'video-trimmer',
  name: 'Video Trimmer Adapter',
  isConnected: true,
  validateInput(input) {
    return validateFile(input.file, MAX_TRANSCODE_BYTES);
  },
  async execute(input, options, onProgress): Promise<EngineExecutionResult<VideoTrimmerOutput>> {
    const validation = this.validateInput?.(input);
    if (!validation?.valid) {
      return { success: false, error: { code: 'VIDEO_FILE_INVALID', message: validation?.reason || 'Invalid video file.' } };
    }
    if (!options || !Number.isFinite(options.startTimeSeconds) || !Number.isFinite(options.endTimeSeconds) ||
        options.startTimeSeconds < 0 || options.endTimeSeconds <= options.startTimeSeconds) {
      return { success: false, error: { code: 'VIDEO_TRIM_RANGE_INVALID', message: 'Choose a valid start and end time. The end must be after the start.' } };
    }

    const started = performance.now();
    try {
      const inputFile = input.file;
      const metadataInput = new Input({
        source: new BlobSource(inputFile),
        formats: ALL_FORMATS,
      });
      let duration = 0;
      try {
        duration = await metadataInput.computeDuration();
      } finally {
        metadataInput.dispose();
      }
      if (!Number.isFinite(duration) || duration <= 0 || options.endTimeSeconds > duration + 0.05) {
        throw new Error('The selected end time is beyond the available video duration.');
      }
      if (options.endTimeSeconds - options.startTimeSeconds < 0.1) {
        throw new Error('Select a clip that is at least 0.1 seconds long.');
      }

      const blob = await convertToBlob(
        inputFile,
        new WebMOutputFormat(),
        {
          tracks: 'primary',
          trim: {
            start: options.startTimeSeconds,
            end: Math.min(duration, options.endTimeSeconds),
          },
        },
        onProgress,
      );

      const data: VideoTrimmerOutput = {
        blob,
        durationSeconds: options.endTimeSeconds - options.startTimeSeconds,
        filename: outputBaseName(inputFile) + '-trimmed.webm',
      };
      onProgress?.({ stage: 'Trim complete', percent: 100 });
      return { success: true, data, durationMs: performance.now() - started };
    } catch (error) {
      return {
        success: false,
        error: {
          code: /cancel/i.test(errorMessage(error)) ? 'VIDEO_CONVERSION_CANCELLED' : 'VIDEO_TRIMMING_FAILED',
          message: errorMessage(error),
        },
        durationMs: performance.now() - started,
      };
    }
  },
  cancel: cancelActiveVideoConversions,
};

export const VideoToAudioAdapter: ToolAdapter<
  VideoToAudioInput,
  VideoToAudioOptions,
  VideoToAudioOutput
> = {
  id: 'video-to-audio',
  name: 'Video to Audio Adapter',
  isConnected: true,
  validateInput(input) {
    return validateFile(input.file, MAX_AUDIO_EXPORT_BYTES);
  },
  async execute(input, options, onProgress): Promise<EngineExecutionResult<VideoToAudioOutput>> {
    const validation = this.validateInput?.(input);
    if (!validation?.valid) {
      return { success: false, error: { code: 'VIDEO_FILE_INVALID', message: validation?.reason || 'Invalid video file.' } };
    }
    if (!options) {
      return { success: false, error: { code: 'AUDIO_EXPORT_SETTINGS_REQUIRED', message: 'Choose an audio format and bitrate.' } };
    }

    const started = performance.now();
    try {
      const file = input.file;
      const inputProbe = new Input({
        source: new BlobSource(file),
        formats: ALL_FORMATS,
      });
      let audioTrackCount = 0;
      try {
        const tracks = await inputProbe.getAudioTracks();
        audioTrackCount = tracks.length;
        if (audioTrackCount === 0) {
          throw new Error('No audio track was found in this video.');
        }
        if (!(await tracks[0].canDecode())) {
          throw new Error('This browser cannot decode the audio codec in this file.');
        }
      } finally {
        inputProbe.dispose();
      }

      onProgress?.({ stage: 'Preparing audio encoder', percent: 8 });
      let format: OutputFormatType;
      let codec: 'mp3' | 'aac' | undefined;
      let mimeType = 'audio/wav';
      let fileExtension = 'wav';

      if (options.targetFormat === 'mp3') {
        if (!(await canEncodeAudio('mp3'))) {
          const { registerMp3Encoder } = await import('@mediabunny/mp3-encoder');
          registerMp3Encoder();
        }
        if (!(await canEncodeAudio('mp3'))) {
          throw new Error('MP3 encoding is not available in this browser.');
        }
        format = new Mp3OutputFormat();
        codec = 'mp3';
        mimeType = 'audio/mpeg';
        fileExtension = 'mp3';
      } else if (options.targetFormat === 'aac') {
        if (!(await canEncodeAudio('aac'))) {
          const { registerAacEncoder } = await import('@mediabunny/aac-encoder');
          registerAacEncoder();
        }
        if (!(await canEncodeAudio('aac'))) {
          throw new Error('AAC encoding is not available in this browser.');
        }
        format = new AdtsOutputFormat();
        codec = 'aac';
        mimeType = 'audio/aac';
        fileExtension = 'aac';
      } else {
        format = new WavOutputFormat();
        mimeType = 'audio/wav';
        fileExtension = 'wav';
      }

      const audio: Record<string, unknown> = {
        forceTranscode: true,
        ...(codec ? {
          codec,
          quality: new Quality({ bitrate: options.bitrateKbps * 1000 }),
        } : {}),
      };
      const blob = await convertToBlob(
        file,
        format,
        {
          tracks: 'primary',
          video: { discard: true },
          audio,
        } as ConversionSettings,
        onProgress,
        ['video'],
      );

      const data: VideoToAudioOutput = {
        blob: new Blob([blob], { type: mimeType }),
        filename: outputBaseName(file) + '.' + fileExtension,
      };
      onProgress?.({ stage: 'Audio export complete', percent: 100 });
      return { success: true, data, durationMs: performance.now() - started };
    } catch (error) {
      return {
        success: false,
        error: {
          code: /cancel/i.test(errorMessage(error)) ? 'VIDEO_CONVERSION_CANCELLED' : 'VIDEO_AUDIO_EXTRACTION_FAILED',
          message: errorMessage(error),
        },
        durationMs: performance.now() - started,
      };
    }
  },
  cancel: cancelActiveVideoConversions,
};

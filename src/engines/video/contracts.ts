import { ToolAdapter } from '../types';

// ==========================================
// 31. Video Compressor
// ==========================================
export interface VideoCompressorInput {
  file: File;
}
export interface VideoCompressorOptions {
  crf: number; // 18 - 32
  preset: 'ultrafast' | 'fast' | 'medium';
  targetResolution?: 'original' | '1080p' | '720p' | '480p';
  codec?: 'h264' | 'vp9';
}
export interface VideoCompressorOutput {
  blob: Blob;
  originalSize: number;
  compressedSize: number;
}

export const VideoCompressorAdapter: ToolAdapter<VideoCompressorInput, VideoCompressorOptions, VideoCompressorOutput> = {
  id: 'video-compressor',
  name: 'Video Compressor Adapter',
  isConnected: false,
  async execute() {
    // TODO: Connect FFmpeg.wasm in Phase 2
    throw new Error('Engine not connected.');
  },
};

// ==========================================
// 32. Video to Audio
// ==========================================
export interface VideoToAudioInput {
  file: File;
}
export interface VideoToAudioOptions {
  targetFormat: 'mp3' | 'wav' | 'aac';
  bitrateKbps: 128 | 192 | 256 | 320;
}
export interface VideoToAudioOutput {
  blob: Blob;
  filename: string;
}

export const VideoToAudioAdapter: ToolAdapter<VideoToAudioInput, VideoToAudioOptions, VideoToAudioOutput> = {
  id: 'video-to-audio',
  name: 'Video to Audio Adapter',
  isConnected: false,
  async execute() {
    // TODO: Connect Web Audio API / FFmpeg demuxer in Phase 2
    throw new Error('Engine not connected.');
  },
};

// ==========================================
// 33. Video Metadata Viewer
// ==========================================
export interface VideoMetadataViewerInput {
  file: File;
}
export interface VideoMetadataViewerOutput {
  durationSeconds: number;
  dimensions: { width: number; height: number };
  aspectRatio: string;
  frameRate: number | null;
  videoCodec: string | null;
  audioCodec?: string | null;
  bitrateKbps: number | null;
  container: string;
}

// ==========================================
// 34. Video Downloader (Permitted Streams & Direct Files)
// ==========================================
export interface VideoDownloaderInput {
  streamUrl: string;
}
export interface VideoDownloaderOutput {
  blob: Blob;
  filename: string;
  size: number;
}

export const VideoDownloaderAdapter: ToolAdapter<VideoDownloaderInput, Record<string, never>, VideoDownloaderOutput> = {
  id: 'video-downloader',
  name: 'Video Downloader Adapter',
  isConnected: false,
  async execute() {
    // Note: Video Downloader is intended only for direct files and content explicitly permitted by rights holders
    // TODO: Connect authorized chunk fetcher in Phase 2
    throw new Error('Engine not connected.');
  },
};

// ==========================================
// 35. Video Trimmer
// ==========================================
export interface VideoTrimmerInput {
  file: File;
}
export interface VideoTrimmerOptions {
  startTimeSeconds: number;
  endTimeSeconds: number;
}
export interface VideoTrimmerOutput {
  blob: Blob;
  durationSeconds: number;
}

export const VideoTrimmerAdapter: ToolAdapter<VideoTrimmerInput, VideoTrimmerOptions, VideoTrimmerOutput> = {
  id: 'video-trimmer',
  name: 'Video Trimmer Adapter',
  isConnected: false,
  async execute() {
    // TODO: Connect WebCodecs / FFmpeg.wasm in Phase 2
    throw new Error('Engine not connected.');
  },
};

// ==========================================
// 36. Thumbnail Extractor
// ==========================================
export interface ThumbnailExtractorInput {
  file: File;
}
export interface ThumbnailExtractorOptions {
  timestampSeconds: number;
  format: 'png' | 'jpg';
  quality?: number;
}
export interface ThumbnailExtractorOutput {
  blob: Blob;
  imageUrl: string;
  timestampSeconds: number;
}

export const ThumbnailExtractorAdapter: ToolAdapter<ThumbnailExtractorInput, ThumbnailExtractorOptions, ThumbnailExtractorOutput> = {
  id: 'thumbnail-extractor',
  name: 'Thumbnail Extractor Adapter',
  isConnected: false,
  async execute() {
    // TODO: Connect HTMLVideoElement frame grabber in Phase 2
    throw new Error('Engine not connected.');
  },
};

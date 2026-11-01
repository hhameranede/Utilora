import React, { useEffect, useRef, useState } from 'react';
import { Download, FileVideo, LoaderCircle, Scissors, ShieldCheck, XCircle } from 'lucide-react';
import {
  VideoCompressorAdapter,
  VideoToAudioAdapter,
  VideoTrimmerAdapter,
} from '../../engines/video/conversion';
import { readFiniteDuration } from '../../engines/video/browser';
import type { EngineExecutionResult, EngineProgress } from '../../engines/types';
import type {
  VideoCompressorOutput,
  VideoToAudioOutput,
  VideoTrimmerOutput,
} from '../../engines/video/contracts';

type VideoMode = 'compress' | 'trim' | 'audio';
type VideoOutput = VideoCompressorOutput | VideoToAudioOutput | VideoTrimmerOutput;

interface TemplateVideoConversionWorkspaceProps {
  toolName: string;
  mode: VideoMode;
}

const ACCEPTED_VIDEO_TYPES = '.mp4,.webm,.mov,video/mp4,video/webm,video/quicktime';

function formatBytes(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes < 0) return '—';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
}

function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return '00:00';
  const total = Math.floor(seconds);
  return String(Math.floor(total / 60)).padStart(2, '0') + ':' + String(total % 60).padStart(2, '0');
}

export const TemplateVideoConversionWorkspace: React.FC<TemplateVideoConversionWorkspaceProps> = ({
  toolName,
  mode,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [outputUrl, setOutputUrl] = useState<string | null>(null);
  const [output, setOutput] = useState<VideoOutput | null>(null);
  const [duration, setDuration] = useState(0);
  const [startTime, setStartTime] = useState(0);
  const [endTime, setEndTime] = useState(0);
  const [quality, setQuality] = useState<'high' | 'balanced' | 'small'>('balanced');
  const [resolution, setResolution] = useState<'original' | '1080p' | '720p' | '480p'>('original');
  const [audioFormat, setAudioFormat] = useState<'mp3' | 'wav' | 'aac'>('mp3');
  const [bitrate, setBitrate] = useState<128 | 192 | 256 | 320>(192);
  const [progress, setProgress] = useState<EngineProgress>({ stage: '', percent: 0 });
  const [isProcessing, setIsProcessing] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  useEffect(() => {
    return () => {
      if (videoUrl) URL.revokeObjectURL(videoUrl);
    };
  }, [videoUrl]);

  useEffect(() => {
    return () => {
      if (outputUrl) URL.revokeObjectURL(outputUrl);
    };
  }, [outputUrl]);

  const clearOutput = () => {
    if (outputUrl) URL.revokeObjectURL(outputUrl);
    setOutputUrl(null);
    setOutput(null);
    setProgress({ stage: '', percent: 0 });
  };

  const selectFile = (nextFile: File | null) => {
    if (!nextFile) return;
    const adapter = mode === 'compress'
      ? VideoCompressorAdapter
      : mode === 'trim'
        ? VideoTrimmerAdapter
        : VideoToAudioAdapter;
    const validation = adapter.validateInput?.({ file: nextFile });
    if (!validation?.valid) {
      setError(validation?.reason || 'This video file is not supported.');
      return;
    }
    setFile(nextFile);
    setDuration(0);
    setStartTime(0);
    setEndTime(0);
    setError('');
    setNotice('');
    clearOutput();
    setVideoUrl(URL.createObjectURL(nextFile));
  };

  const handleLoadedMetadata = (video: HTMLVideoElement) => {
    void readFiniteDuration(video)
      .then((value) => {
        setDuration(value);
        setEndTime(value);
        setStartTime(0);
      })
      .catch((cause: unknown) => {
        setError(cause instanceof Error ? cause.message : 'The browser could not read this video duration.');
      });
  };

  const processVideo = async () => {
    if (!file || isProcessing) return;
    setIsProcessing(true);
    setIsCancelling(false);
    setError('');
    setNotice('');
    setProgress({ stage: 'Preparing media engine', percent: 2 });

    let result: EngineExecutionResult<VideoOutput>;
    if (mode === 'compress') {
      result = await VideoCompressorAdapter.execute(
        { file },
        { quality, preset: 'fast', targetResolution: resolution },
        setProgress,
      );
    } else if (mode === 'trim') {
      result = await VideoTrimmerAdapter.execute(
        { file },
        { startTimeSeconds: startTime, endTimeSeconds: endTime },
        setProgress,
      );
    } else {
      result = await VideoToAudioAdapter.execute(
        { file },
        { targetFormat: audioFormat, bitrateKbps: bitrate },
        setProgress,
      );
    }

    if (result.success && result.data) {
      const nextUrl = URL.createObjectURL(result.data.blob);
      setOutputUrl(nextUrl);
      setOutput(result.data);
      setNotice('Your file is ready. Download it below.');
      setProgress({ stage: 'Complete', percent: 100 });
    } else {
      setError(result.error?.message || 'The browser could not complete this conversion.');
    }

    setIsProcessing(false);
    setIsCancelling(false);
  };

  const cancelProcessing = () => {
    if (!isProcessing || isCancelling) return;
    setIsCancelling(true);
    if (mode === 'compress') VideoCompressorAdapter.cancel?.();
    else if (mode === 'trim') VideoTrimmerAdapter.cancel?.();
    else VideoToAudioAdapter.cancel?.();
  };

  const outputFilename = output ? output.filename : '';
  const compressedOutput = mode === 'compress' && output && 'originalSize' in output
    ? output
    : null;
  const compressionDelta = compressedOutput
    ? compressedOutput.originalSize - compressedOutput.compressedSize
    : 0;

  return (
    <div className="w-full space-y-5" aria-busy={isProcessing}>
      <section className="rounded-3xl border border-stone-200 bg-white p-5 shadow-xs sm:p-6 space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-orange-200 bg-orange-50 text-orange-600">
            {mode === 'trim' ? <Scissors size={21} /> : <FileVideo size={21} />}
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-sm font-semibold text-stone-900">{toolName}</h2>
            <p className="mt-1 text-xs text-stone-500">
              {mode === 'compress'
                ? 'Compress MP4, WebM, or MOV videos locally in your browser.'
                : mode === 'trim'
                  ? 'Choose precise start and end points, then export the selected clip.'
                  : 'Extract the audio track and save it as MP3, WAV, or AAC.'}
            </p>
          </div>
          <span className="rounded-lg border border-stone-200 bg-stone-50 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-stone-600">
            Browser processing
          </span>
        </div>

        <label className="block cursor-pointer rounded-2xl border border-dashed border-stone-300 bg-stone-50 p-5 transition-colors hover:border-orange-300 hover:bg-orange-50/50 sm:p-6">
          <span className="block text-sm font-semibold text-stone-800">Choose a video file</span>
          <span className="mt-1 block text-xs text-stone-500">
            MP4, WebM or MOV · {mode === 'audio' ? 'Up to 500 MB' : 'Up to 250 MB'}
          </span>
          <input
            ref={fileInputRef}
            type="file"
            accept={ACCEPTED_VIDEO_TYPES}
            aria-label="Choose a video file"
            onChange={(event) => selectFile(event.target.files?.[0] || null)}
            disabled={isProcessing}
            className="mt-4 block w-full text-xs text-stone-600 file:mr-3 file:rounded-lg file:border file:border-stone-200 file:bg-white file:px-3 file:py-2 file:text-xs file:font-semibold file:text-stone-700 hover:file:border-orange-300"
          />
        </label>

        {file && videoUrl && (
          <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-5">
            <div className="min-w-0 space-y-2 lg:col-span-3">
              <div className="flex items-center justify-between gap-3">
                <span className="truncate text-xs font-semibold text-stone-800">{file.name}</span>
                <span className="shrink-0 font-mono text-[11px] text-stone-500">
                  {duration > 0 ? formatTime(duration) : 'Reading duration…'} · {formatBytes(file.size)}
                </span>
              </div>
              <video
                src={videoUrl}
                controls
                preload="metadata"
                onLoadedMetadata={(event) => handleLoadedMetadata(event.currentTarget)}
                onError={() => setError('This browser cannot preview the selected video. Try an MP4 or WebM file encoded with a browser-supported codec.')}
                className="max-h-80 w-full rounded-2xl bg-stone-950"
              />
            </div>

            <div className="space-y-4 rounded-2xl border border-stone-200 bg-stone-50 p-4 lg:col-span-2">
              {mode === 'compress' && (
                <>
                  <div className="space-y-2">
                    <label className="block text-xs font-semibold text-stone-800" htmlFor="video-quality">Compression quality</label>
                    <select
                      id="video-quality"
                      value={quality}
                      onChange={(event) => setQuality(event.target.value as 'high' | 'balanced' | 'small')}
                      disabled={isProcessing}
                      className="w-full rounded-xl border border-stone-200 bg-white px-3 py-2 text-xs text-stone-800 focus:border-orange-500 focus:outline-none"
                    >
                      <option value="high">High quality</option>
                      <option value="balanced">Balanced</option>
                      <option value="small">Smaller file</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="block text-xs font-semibold text-stone-800" htmlFor="video-resolution">Output resolution</label>
                    <select
                      id="video-resolution"
                      value={resolution}
                      onChange={(event) => setResolution(event.target.value as 'original' | '1080p' | '720p' | '480p')}
                      disabled={isProcessing}
                      className="w-full rounded-xl border border-stone-200 bg-white px-3 py-2 text-xs text-stone-800 focus:border-orange-500 focus:outline-none"
                    >
                      <option value="original">Keep source resolution</option>
                      <option value="1080p">Up to 1080p</option>
                      <option value="720p">Up to 720p</option>
                      <option value="480p">Up to 480p</option>
                    </select>
                  </div>
                  <p className="text-[11px] leading-relaxed text-stone-500">
                    The exported file uses WebM. Compression results depend on the source and selected settings.
                  </p>
                </>
              )}

              {mode === 'trim' && (
                <>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <label htmlFor="video-trim-start" className="text-xs font-semibold text-stone-800">Start time</label>
                      <span className="font-mono text-xs text-orange-700">{startTime.toFixed(2)} s</span>
                    </div>
                    <input
                      id="video-trim-start"
                      type="range"
                      min="0"
                      max={duration || 0}
                      step="0.05"
                      value={Math.min(startTime, duration || 0)}
                      onChange={(event) => setStartTime(Math.min(Number(event.target.value), endTime - 0.1))}
                      disabled={duration <= 0 || isProcessing}
                      className="w-full accent-orange-500"
                    />
                    <input
                      type="number"
                      min="0"
                      max={Math.max(0, endTime - 0.1)}
                      step="0.05"
                      value={startTime}
                      onChange={(event) => setStartTime(Math.max(0, Math.min(Number(event.target.value), endTime - 0.1)))}
                      disabled={duration <= 0 || isProcessing}
                      className="w-full rounded-xl border border-stone-200 bg-white px-3 py-2 text-xs font-mono text-stone-800"
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <label htmlFor="video-trim-end" className="text-xs font-semibold text-stone-800">End time</label>
                      <span className="font-mono text-xs text-orange-700">{endTime.toFixed(2)} s</span>
                    </div>
                    <input
                      id="video-trim-end"
                      type="range"
                      min="0"
                      max={duration || 0}
                      step="0.05"
                      value={Math.min(endTime, duration || 0)}
                      onChange={(event) => setEndTime(Math.max(Number(event.target.value), startTime + 0.1))}
                      disabled={duration <= 0 || isProcessing}
                      className="w-full accent-orange-500"
                    />
                    <input
                      type="number"
                      min={Math.min(duration, startTime + 0.1)}
                      max={duration || undefined}
                      step="0.05"
                      value={endTime}
                      onChange={(event) => setEndTime(Math.max(startTime + 0.1, Math.min(Number(event.target.value), duration)))}
                      disabled={duration <= 0 || isProcessing}
                      className="w-full rounded-xl border border-stone-200 bg-white px-3 py-2 text-xs font-mono text-stone-800"
                    />
                  </div>
                  <p className="text-[11px] text-stone-500">
                    Selected clip: {formatTime(Math.max(0, endTime - startTime))}
                  </p>
                </>
              )}

              {mode === 'audio' && (
                <>
                  <div className="space-y-2">
                    <label htmlFor="audio-output-format" className="block text-xs font-semibold text-stone-800">Audio format</label>
                    <select
                      id="audio-output-format"
                      value={audioFormat}
                      onChange={(event) => setAudioFormat(event.target.value as 'mp3' | 'wav' | 'aac')}
                      disabled={isProcessing}
                      className="w-full rounded-xl border border-stone-200 bg-white px-3 py-2 text-xs text-stone-800 focus:border-orange-500 focus:outline-none"
                    >
                      <option value="mp3">MP3</option>
                      <option value="wav">WAV</option>
                      <option value="aac">AAC</option>
                    </select>
                  </div>
                  {audioFormat !== 'wav' && (
                    <div className="space-y-2">
                      <label htmlFor="audio-bitrate" className="block text-xs font-semibold text-stone-800">Audio bitrate</label>
                      <select
                        id="audio-bitrate"
                        value={bitrate}
                        onChange={(event) => setBitrate(Number(event.target.value) as 128 | 192 | 256 | 320)}
                        disabled={isProcessing}
                        className="w-full rounded-xl border border-stone-200 bg-white px-3 py-2 text-xs text-stone-800 focus:border-orange-500 focus:outline-none"
                      >
                        <option value="128">128 kbps</option>
                        <option value="192">192 kbps</option>
                        <option value="256">256 kbps</option>
                        <option value="320">320 kbps</option>
                      </select>
                    </div>
                  )}
                  <p className="text-[11px] leading-relaxed text-stone-500">The video track is omitted. Only the audio track is exported.</p>
                </>
              )}
            </div>
          </div>
        )}

        {error && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-700">{error}</p>}
        {notice && output && (
          <div role="status" className="rounded-2xl border border-orange-200 bg-orange-50/70 p-4 space-y-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-stone-900">
              <ShieldCheck size={16} className="text-orange-600" />
              File ready
            </div>
            <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-stone-600">
              <span className="min-w-0 truncate font-medium">{outputFilename}</span>
              <span className="font-mono">{formatBytes(output.blob.size)}</span>
            </div>
            {compressedOutput && (
              <p className="text-[11px] leading-relaxed text-stone-600">
                {compressionDelta > 0
                  ? formatBytes(compressionDelta) + ' smaller than the source (' + Math.round((compressionDelta / compressedOutput.originalSize) * 100) + '% reduction).'
                  : compressionDelta < 0
                    ? 'The exported WebM is ' + formatBytes(Math.abs(compressionDelta)) + ' larger than the source. Try a smaller quality setting or lower resolution.'
                    : 'The exported file is the same size as the source.'}
              </p>
            )}
            {outputUrl && (
              <a
                href={outputUrl}
                download={outputFilename}
                className="inline-flex items-center gap-2 rounded-xl bg-orange-500 px-4 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
              >
                <Download size={15} />
                Download {mode === 'audio' ? 'audio' : 'video'}
              </a>
            )}
          </div>
        )}

        {isProcessing && (
          <div className="space-y-3 rounded-2xl border border-stone-200 bg-white p-4" aria-live="polite">
            <div className="flex items-center justify-between gap-3 text-xs">
              <span className="flex min-w-0 items-center gap-2 font-medium text-stone-700">
                <LoaderCircle size={14} className="animate-spin text-orange-500" />
                <span className="truncate">{progress.stage || 'Processing locally'}</span>
              </span>
              <span className="shrink-0 font-mono text-orange-700">{Math.round(progress.percent)}%</span>
            </div>
            <div
              role="progressbar"
              aria-label="Video processing progress"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={Math.round(progress.percent)}
              className="h-2 overflow-hidden rounded-full bg-stone-100"
            >
              <div className="h-full rounded-full bg-orange-500 transition-all" style={{ width: Math.max(2, Math.min(100, progress.percent)) + '%' }} />
            </div>
            <button
              type="button"
              onClick={cancelProcessing}
              disabled={isCancelling}
              className="inline-flex items-center gap-2 text-xs font-semibold text-stone-500 transition-colors hover:text-red-600 disabled:opacity-50"
            >
              <XCircle size={14} />
              {isCancelling ? 'Cancelling…' : 'Cancel processing'}
            </button>
          </div>
        )}

        <div className="flex flex-col gap-3 border-t border-stone-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="flex items-start gap-2 text-[11px] leading-relaxed text-stone-500">
            <ShieldCheck size={14} className="mt-0.5 shrink-0 text-orange-500" />
            Your selected video is processed locally in this browser. Processing speed and codec support depend on your device and browser.
          </p>
          <button
            type="button"
            onClick={() => void processVideo()}
            disabled={!file || isProcessing || (mode === 'trim' && (duration <= 0 || endTime <= startTime))}
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-orange-500 px-5 py-3 text-xs font-semibold text-white shadow-xs transition-colors hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-stone-300"
          >
            {isProcessing ? <LoaderCircle size={14} className="animate-spin" /> : <FileVideo size={14} />}
            {isProcessing ? 'Processing…' : mode === 'compress' ? 'Compress video' : mode === 'trim' ? 'Export selected clip' : 'Extract audio'}
          </button>
        </div>
      </section>
    </div>
  );
};

import React, { useEffect, useRef, useState } from 'react';
import { Download, FileVideo, Image as ImageIcon, ShieldCheck } from 'lucide-react';
import { readFiniteDuration, ThumbnailExtractorAdapter } from '../../engines/video/browser';
import type { ThumbnailExtractorOutput } from '../../engines/video/contracts';

type ImageFormat = 'png' | 'jpg';

function getBaseName(filename: string): string {
  return filename.replace(/\.[^.]+$/, '') || 'video';
}

export const TemplatePThumbnailExtractor: React.FC<{ toolName: string }> = ({ toolName }) => {
  const [file, setFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [duration, setDuration] = useState(0);
  const [timestamp, setTimestamp] = useState(0);
  const [format, setFormat] = useState<ImageFormat>('png');
  const [quality, setQuality] = useState(0.92);
  const [frame, setFrame] = useState<ThumbnailExtractorOutput | null>(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const frameUrlRef = useRef<string | null>(null);

  useEffect(() => {
    return () => {
      if (videoUrl) URL.revokeObjectURL(videoUrl);
    };
  }, [videoUrl]);

  useEffect(() => {
    return () => {
      if (frameUrlRef.current) URL.revokeObjectURL(frameUrlRef.current);
    };
  }, []);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selected = event.target.files?.[0] || null;
    if (!selected) return;
    if (frameUrlRef.current) {
      URL.revokeObjectURL(frameUrlRef.current);
      frameUrlRef.current = null;
    }
    setFrame(null);
    setFile(selected);
    setVideoUrl(URL.createObjectURL(selected));
    setDuration(0);
    setTimestamp(0);
    setError('');
    setNotice('');
  };

  const extractFrame = async () => {
    if (!file || duration <= 0 || isExtracting) return;
    setIsExtracting(true);
    setError('');
    setNotice('');
    const result = await ThumbnailExtractorAdapter.execute(
      { file },
      { timestampSeconds: timestamp, format, quality },
    );
    if (result.success && result.data) {
      if (frameUrlRef.current) URL.revokeObjectURL(frameUrlRef.current);
      frameUrlRef.current = result.data.imageUrl;
      setFrame(result.data);
      setNotice('Video frame extracted successfully.');
    } else {
      setError(result.error?.message || 'Unable to extract this frame.');
    }
    setIsExtracting(false);
  };

  const outputFilename = frame && file
    ? getBaseName(file.name) + '-frame-' + frame.timestampSeconds.toFixed(2) + '.' + format
    : 'video-frame.' + format;

  return (
    <div className="w-full space-y-6" aria-busy={isExtracting}>
      <section className="rounded-3xl bg-white border border-stone-200/90 p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex items-start gap-3">
          <div className="w-11 h-11 rounded-2xl bg-orange-50 border border-orange-200/60 flex items-center justify-center text-orange-600 shrink-0">
            <FileVideo size={21} />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-stone-900">{toolName}</h2>
            <p className="text-xs text-stone-500 mt-1">Choose an exact timestamp and export a still frame. Processing stays in your browser.</p>
          </div>
        </div>

        <label className="block p-5 sm:p-7 rounded-2xl border border-dashed border-stone-300 bg-stone-50 hover:bg-orange-50/40 hover:border-orange-300 transition-colors cursor-pointer">
          <span className="block text-sm font-semibold text-stone-800">Choose a video file</span>
          <span className="block text-xs text-stone-500 mt-1">MP4, WebM or MOV · Maximum 500 MB</span>
          <input
            type="file"
            accept=".mp4,.webm,.mov,video/mp4,video/webm,video/quicktime"
            onChange={handleFileChange}
            aria-label="Choose a video file"
            className="block w-full mt-4 text-xs text-stone-600 file:mr-3 file:px-3 file:py-2 file:rounded-lg file:border file:border-stone-200 file:bg-white file:text-stone-700 file:font-medium"
          />
        </label>

        {file && videoUrl && (
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-5 items-start">
            <div className="lg:col-span-3 space-y-2 min-w-0">
              <div className="flex items-center justify-between gap-3">
                <span className="text-xs font-semibold text-stone-800 truncate">{file.name}</span>
                <span className="text-[11px] text-stone-500 shrink-0">{duration > 0 ? duration.toFixed(2) + ' s' : 'Reading duration…'}</span>
              </div>
              <video
                src={videoUrl}
                controls
                preload="metadata"
                onLoadedMetadata={(event) => {
                  const videoElement = event.currentTarget;
                  void readFiniteDuration(videoElement)
                    .then((value) => {
                      setDuration(value);
                      setTimestamp(0);
                    })
                    .catch((cause: unknown) => {
                      setError(cause instanceof Error ? cause.message : 'The browser could not read the video duration.');
                    });
                }}
                onError={() => setError('This browser cannot play the selected video. Try a browser-supported MP4 or WebM file.')}
                className="w-full max-h-80 rounded-2xl bg-stone-950"
              />
            </div>

            <div className="lg:col-span-2 rounded-2xl bg-stone-50 border border-stone-200 p-4 space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <label htmlFor="utilora-frame-timestamp" className="text-xs font-semibold text-stone-800">Frame timestamp</label>
                  <span className="font-mono text-xs text-orange-700">{timestamp.toFixed(2)} s</span>
                </div>
                <input
                  id="utilora-frame-range"
                  type="range"
                  aria-label="Frame position"
                  min="0"
                  max={Math.max(0, duration)}
                  step="0.05"
                  value={Math.min(timestamp, Math.max(0, duration))}
                  onChange={(event) => setTimestamp(Number(event.target.value))}
                  disabled={duration <= 0}
                  className="w-full accent-orange-500"
                />
                <input
                  id="utilora-frame-timestamp"
                  type="number"
                  aria-label="Timestamp (seconds)"
                  min="0"
                  max={duration || undefined}
                  step="0.05"
                  value={timestamp}
                  onChange={(event) => {
                    const next = Number(event.target.value);
                    if (Number.isFinite(next)) setTimestamp(Math.max(0, Math.min(duration || next, next)));
                  }}
                  disabled={duration <= 0}
                  className="w-full px-3 py-2 rounded-xl bg-white border border-stone-200 text-xs font-mono text-stone-900 focus:outline-none focus:border-orange-500"
                />
              </div>

              <div className="space-y-2">
                <span className="block text-xs font-semibold text-stone-800">Image format</span>
                <div className="grid grid-cols-2 gap-2">
                  {(['png', 'jpg'] as const).map((item) => (
                    <button
                      key={item}
                      type="button"
                      aria-pressed={format === item}
                      onClick={() => setFormat(item)}
                      className={'py-2 rounded-xl border text-xs font-mono uppercase font-semibold transition-colors ' + (
                        format === item
                          ? 'bg-orange-50 text-orange-700 border-orange-300'
                          : 'bg-white text-stone-600 border-stone-200 hover:border-stone-300'
                      )}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>

              {format === 'jpg' && (
                <div className="space-y-2">
                  <label htmlFor="utilora-frame-quality" className="flex justify-between text-xs text-stone-700">
                    <span>JPG quality</span>
                    <span className="font-mono">{Math.round(quality * 100)}%</span>
                  </label>
                  <input
                    id="utilora-frame-quality"
                    type="range"
                    min="0.4"
                    max="1"
                    step="0.05"
                    value={quality}
                    onChange={(event) => setQuality(Number(event.target.value))}
                    className="w-full accent-orange-500"
                  />
                </div>
              )}

              <button
                type="button"
                onClick={extractFrame}
                disabled={!file || duration <= 0 || isExtracting}
                className="w-full px-4 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white text-xs font-semibold transition-colors"
              >
                {isExtracting ? 'Extracting frame…' : 'Extract thumbnail'}
              </button>
            </div>
          </div>
        )}

        {error && <p role="alert" className="text-xs text-red-700 bg-red-50 border border-red-200 rounded-xl p-3">{error}</p>}
        {notice && <p role="status" className="text-xs text-stone-800 bg-orange-50 border border-orange-100 rounded-xl p-3">{notice}</p>}
      </section>

      {frame && (
        <section className="rounded-3xl bg-white border border-stone-200/90 p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-semibold text-stone-900">Extracted frame</h3>
              <p className="text-[11px] text-stone-500 mt-1">{frame.timestampSeconds.toFixed(2)} seconds · {format.toUpperCase()}</p>
            </div>
            <a
              href={frame.imageUrl}
              download={outputFilename}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-orange-500 hover:bg-orange-600 text-white text-xs font-semibold"
            >
              <Download size={14} /> Download image
            </a>
          </div>
          <div className="rounded-2xl bg-stone-100 border border-stone-200 p-2 flex items-center justify-center">
            <img src={frame.imageUrl} alt="Extracted video frame" className="max-w-full max-h-[520px] object-contain rounded-xl" />
          </div>
          <div className="flex items-start gap-2 text-[11px] text-stone-500">
            <ImageIcon size={14} className="text-orange-500 shrink-0" />
            <span>Only the selected frame is exported. The original video remains unchanged and is never uploaded.</span>
          </div>
          <div className="flex items-start gap-2 text-[11px] text-stone-500">
            <ShieldCheck size={14} className="text-orange-500 shrink-0" />
            <span>Frame decoding and image encoding run locally in this browser.</span>
          </div>
        </section>
      )}
    </div>
  );
};

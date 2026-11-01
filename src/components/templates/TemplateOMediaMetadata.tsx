import React, { useEffect, useRef, useState } from 'react';
import { Download, FileVideo, Info, ShieldCheck } from 'lucide-react';
import { VideoMetadataViewerAdapter } from '../../engines/video/browser';
import type { VideoMetadataViewerOutput } from '../../engines/video/contracts';

interface TemplateOMediaMetadataProps {
  toolName: string;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  return (bytes / (1024 * 1024 * 1024)).toFixed(2) + ' GB';
}

function formatDuration(totalSeconds: number): string {
  const seconds = Math.floor(totalSeconds % 60);
  const minutes = Math.floor((totalSeconds / 60) % 60);
  const hours = Math.floor(totalSeconds / 3600);
  const pad = (value: number) => String(value).padStart(2, '0');
  return hours > 0 ? pad(hours) + ':' + pad(minutes) + ':' + pad(seconds) : pad(minutes) + ':' + pad(seconds);
}

export const TemplateOMediaMetadata: React.FC<TemplateOMediaMetadataProps> = ({ toolName }) => {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [metadata, setMetadata] = useState<VideoMetadataViewerOutput | null>(null);
  const [isInspecting, setIsInspecting] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const downloadUrlRef = useRef<string | null>(null);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  useEffect(() => {
    return () => {
      if (downloadUrlRef.current) URL.revokeObjectURL(downloadUrlRef.current);
    };
  }, []);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selected = event.target.files?.[0] || null;
    if (!selected) return;
    setFile(selected);
    setMetadata(null);
    setError('');
    setNotice('');
    setPreviewUrl(URL.createObjectURL(selected));
  };

  const inspect = async () => {
    if (!file || isInspecting) return;
    setIsInspecting(true);
    setError('');
    setNotice('');
    const result = await VideoMetadataViewerAdapter.execute({ file });
    if (result.success && result.data) {
      setMetadata(result.data);
      setNotice('Video metadata extracted successfully.');
    } else {
      setMetadata(null);
      setError(result.error?.message || 'Unable to inspect this video.');
    }
    setIsInspecting(false);
  };

  const downloadJson = () => {
    if (!metadata || !file) return;
    if (downloadUrlRef.current) URL.revokeObjectURL(downloadUrlRef.current);
    const payload = {
      file: { name: file.name, sizeBytes: file.size, mimeType: file.type || null },
      metadata,
      notes: {
        bitrate: 'Estimated from total file size and duration; it is not a stream-level measurement.',
        codecsAndFrameRate: 'Not exposed by the browser playback metadata API used by this tool.',
      },
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    downloadUrlRef.current = url;
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = file.name.replace(/\.[^.]+$/, '') + '-metadata.json';
    anchor.click();
    window.setTimeout(() => {
      URL.revokeObjectURL(url);
      if (downloadUrlRef.current === url) downloadUrlRef.current = null;
    }, 1500);
  };

  const rows = metadata && file ? [
    { label: 'Container', value: metadata.container.split(' (')[0] },
    { label: 'Duration', value: formatDuration(metadata.durationSeconds) + ' (' + metadata.durationSeconds.toFixed(2) + ' seconds)' },
    { label: 'Resolution', value: metadata.dimensions.width + ' × ' + metadata.dimensions.height },
    { label: 'Aspect ratio', value: metadata.aspectRatio },
    { label: 'File size', value: formatBytes(file.size) },
    { label: 'Estimated average bitrate', value: metadata.bitrateKbps === null ? 'Unavailable' : '≈ ' + metadata.bitrateKbps.toLocaleString() + ' kbps' },
    { label: 'Frame rate', value: metadata.frameRate === null ? 'Not exposed by this browser' : metadata.frameRate + ' fps' },
    { label: 'Video codec', value: metadata.videoCodec || 'Not exposed by this browser' },
    { label: 'Audio codec', value: metadata.audioCodec || 'Not exposed by this browser' },
  ] : [];

  return (
    <div className="w-full space-y-6" aria-busy={isInspecting}>
      <section className="rounded-3xl bg-white border border-stone-200/90 p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex items-start gap-3">
          <div className="w-11 h-11 rounded-2xl bg-orange-50 border border-orange-200/60 flex items-center justify-center text-orange-600 shrink-0">
            <FileVideo size={21} />
          </div>
          <div className="min-w-0">
            <h2 className="text-sm font-semibold text-stone-900">{toolName}</h2>
            <p className="text-xs text-stone-500 mt-1">Inspect playback metadata locally in your browser. Your video is not uploaded.</p>
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

        {file && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start">
            <div className="min-w-0">
              <div className="text-xs font-semibold text-stone-800 truncate">{file.name}</div>
              <div className="text-[11px] text-stone-500 mt-1">{formatBytes(file.size)}</div>
              {previewUrl && (
                <video
                  src={previewUrl}
                  controls
                  preload="metadata"
                  className="w-full max-h-64 mt-3 rounded-xl bg-stone-950"
                />
              )}
            </div>
            <div className="rounded-2xl bg-stone-50 border border-stone-200 p-4 space-y-3">
              <div className="flex items-start gap-2 text-xs text-stone-600 leading-relaxed">
                <Info size={15} className="text-orange-500 shrink-0 mt-0.5" />
                <span>Codec and frame-rate details are only reported when the browser exposes them. The displayed bitrate is an estimate based on file size and duration.</span>
              </div>
              <button
                type="button"
                onClick={inspect}
                disabled={isInspecting}
                className="w-full px-4 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white text-xs font-semibold transition-colors"
              >
                {isInspecting ? 'Inspecting video…' : 'Inspect video metadata'}
              </button>
            </div>
          </div>
        )}

        {error && <p role="alert" className="text-xs text-red-700 bg-red-50 border border-red-200 rounded-xl p-3">{error}</p>}
        {notice && <p role="status" className="text-xs text-green-800 bg-orange-50 border border-orange-100 rounded-xl p-3">{notice}</p>}
      </section>

      {metadata && (
        <section className="rounded-3xl bg-white border border-stone-200/90 overflow-hidden shadow-xs">
          <div className="p-4 bg-stone-50 border-b border-stone-200 flex items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-semibold text-stone-900">Technical properties</h3>
              <p className="text-[11px] text-stone-500 mt-1">Values read from the selected local file</p>
            </div>
            <button type="button" onClick={downloadJson} className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-stone-200 bg-white hover:border-orange-300 text-xs font-semibold text-stone-700">
              <Download size={14} /> Export JSON
            </button>
          </div>
          <div className="divide-y divide-stone-100">
            {rows.map((row) => (
              <div key={row.label} className="px-4 sm:px-6 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                <span className="text-xs text-stone-600 font-medium">{row.label}</span>
                <span className="text-xs text-stone-900 font-mono sm:text-right break-all">{row.value}</span>
              </div>
            ))}
          </div>
          <div className="p-4 flex items-start gap-2 bg-stone-50 border-t border-stone-200 text-[11px] text-stone-500">
            <ShieldCheck size={14} className="text-orange-500 shrink-0" />
            <span>All inspection takes place in this browser. No video content is sent to UTILORA.</span>
          </div>
        </section>
      )}
    </div>
  );
};

import React, { useEffect, useRef, useState } from 'react';
import { Image as ImageIcon, Upload, Download, RotateCw, Lock, Unlock, RefreshCw, FileImage, AlertCircle } from 'lucide-react';
import { readBrowserImageMetadata, transformBrowserImage, BrowserImageMetadata } from '../../engines/image/browser';

type ImageFormat = 'webp' | 'jpeg' | 'png';

interface TemplateCImageWorkspaceProps {
  toolName: string;
  toolSlug?: string;
  defaultFormat?: ImageFormat;
  showQuality?: boolean;
  showDimensions?: boolean;
  showCropperGrid?: boolean;
}

export const TemplateCImageWorkspace: React.FC<TemplateCImageWorkspaceProps> = ({
  toolName,
  toolSlug = 'image-cropper',
  defaultFormat = 'webp',
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const previewImageRef = useRef<HTMLImageElement>(null);
  const cropDragRef = useRef<{ pointerId: number; startX: number; startY: number } | null>(null);
  const fileRevisionRef = useRef(0);
  const [file, setFile] = useState<File | null>(null);
  const [sourceUrl, setSourceUrl] = useState('');
  const [resultUrl, setResultUrl] = useState('');
  const [resultName, setResultName] = useState('');
  const [metadata, setMetadata] = useState<BrowserImageMetadata | null>(null);
  const [quality, setQuality] = useState(82);
  const [format, setFormat] = useState<ImageFormat>(defaultFormat);
  const [width, setWidth] = useState(0);
  const [height, setHeight] = useState(0);
  const [lockRatio, setLockRatio] = useState(true);
  const [resizeMode, setResizeMode] = useState<'pixels' | 'percentage'>('pixels');
  const [percentage, setPercentage] = useState(100);
  const [rotation, setRotation] = useState<0 | 90 | 180 | 270>(0);
  const [flipHorizontal, setFlipHorizontal] = useState(false);
  const [flipVertical, setFlipVertical] = useState(false);
  const [cropX, setCropX] = useState(0);
  const [cropY, setCropY] = useState(0);
  const [cropWidth, setCropWidth] = useState(0);
  const [cropHeight, setCropHeight] = useState(0);
  const [busy, setBusy] = useState(false);
  const [preparingFile, setPreparingFile] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => () => {
    if (sourceUrl) URL.revokeObjectURL(sourceUrl);
    if (resultUrl) URL.revokeObjectURL(resultUrl);
  }, [sourceUrl, resultUrl]);

  const isMetadata = toolSlug === 'image-metadata-viewer';
  const isCrop = toolSlug === 'image-cropper';
  const isRotate = toolSlug === 'image-rotator';
  const isResize = toolSlug === 'image-resizer';
  const isCompress = toolSlug === 'image-compressor';

  const handleFile = async (selected?: File) => {
    if (!selected) return;
    const fileRevision = ++fileRevisionRef.current;
    setBusy(false);
    setPreparingFile(true);
    setMetadata(null);
    setError('');
    setMessage('');
    if (!selected.type.startsWith('image/')) {
      setPreparingFile(false);
      setError('Please choose a valid image file.');
      return;
    }
    if (selected.size > 50 * 1024 * 1024) {
      setPreparingFile(false);
      setError('Image size exceeds the 50 MB limit.');
      return;
    }

    setFile(selected);
    const nextUrl = URL.createObjectURL(selected);
    setSourceUrl((previous) => {
      if (previous) URL.revokeObjectURL(previous);
      return nextUrl;
    });
    setResultUrl((previous) => {
      if (previous) URL.revokeObjectURL(previous);
      return '';
    });
    setMetadata(null);
    cropDragRef.current = null;
    setRotation(0);
    setFlipHorizontal(false);
    setFlipVertical(false);
    try {
      const details = await readBrowserImageMetadata(selected);
      if (fileRevision !== fileRevisionRef.current) return;
      setMetadata(details);
      setWidth(details.width);
      setHeight(details.height);
      setPercentage(100);
      setCropX(0);
      setCropY(0);
      setCropWidth(details.width);
      setCropHeight(details.height);
      setPreparingFile(false);
      if (isMetadata) setMessage('Image properties loaded. EXIF camera and GPS tags are not read by this tool.');
    } catch (cause) {
      if (fileRevision === fileRevisionRef.current) {
        setPreparingFile(false);
        setError(cause instanceof Error ? cause.message : 'Unable to read this image.');
      }
    }
  };

  const updateWidth = (value: number) => {
    const next = Math.max(1, Math.min(12000, value || 1));
    setWidth(next);
    if (lockRatio && metadata) setHeight(Math.max(1, Math.round(next * metadata.height / metadata.width)));
  };

  const updateHeight = (value: number) => {
    const next = Math.max(1, Math.min(12000, value || 1));
    setHeight(next);
    if (lockRatio && metadata) setWidth(Math.max(1, Math.round(next * metadata.width / metadata.height)));
  };

  const getCropPoint = (clientX: number, clientY: number) => {
    const image = previewImageRef.current;
    if (!image || !metadata) return null;
    const rect = image.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) return null;
    return {
      x: Math.min(metadata.width, Math.max(0, ((clientX - rect.left) / rect.width) * metadata.width)),
      y: Math.min(metadata.height, Math.max(0, ((clientY - rect.top) / rect.height) * metadata.height)),
    };
  };

  const handleCropPointerDown = (event: React.PointerEvent<HTMLImageElement>) => {
    if (!isCrop || !metadata) return;
    const point = getCropPoint(event.clientX, event.clientY);
    if (!point) return;
    cropDragRef.current = { pointerId: event.pointerId, startX: point.x, startY: point.y };
    event.currentTarget.setPointerCapture(event.pointerId);
    setCropX(Math.min(metadata.width - 1, Math.floor(point.x)));
    setCropY(Math.min(metadata.height - 1, Math.floor(point.y)));
    setCropWidth(1);
    setCropHeight(1);
  };

  const handleCropPointerMove = (event: React.PointerEvent<HTMLImageElement>) => {
    const drag = cropDragRef.current;
    if (!drag || drag.pointerId !== event.pointerId || !metadata) return;
    const point = getCropPoint(event.clientX, event.clientY);
    if (!point) return;
    const left = Math.min(drag.startX, point.x);
    const top = Math.min(drag.startY, point.y);
    setCropX(Math.min(metadata.width - 1, Math.floor(left)));
    setCropY(Math.min(metadata.height - 1, Math.floor(top)));
    setCropWidth(Math.max(1, Math.round(Math.abs(point.x - drag.startX))));
    setCropHeight(Math.max(1, Math.round(Math.abs(point.y - drag.startY))));
  };

  const handleCropPointerEnd = (event: React.PointerEvent<HTMLImageElement>) => {
    if (cropDragRef.current?.pointerId === event.pointerId) cropDragRef.current = null;
  };

  const processImage = async () => {
    if (!file) {
      setError('Choose an image first.');
      return;
    }
    if (!metadata || preparingFile) {
      setError('The image is still being prepared. Please try again when inspection finishes.');
      return;
    }
    const fileRevision = fileRevisionRef.current;
    setBusy(true);
    setError('');
    setMessage('');
    try {
      if (isMetadata) {
        const data = await readBrowserImageMetadata(file);
        if (fileRevision !== fileRevisionRef.current) return;
        setMetadata(data);
        setMessage('Image properties inspected successfully.');
        return;
      }

      const options = isCrop
        ? { format: 'png' as const, crop: { x: cropX, y: cropY, width: cropWidth, height: cropHeight } }
        : isRotate
          ? { format: 'png' as const, rotation, flipHorizontal, flipVertical }
          : isResize
            ? { format: 'png' as const, width: resizeMode === 'percentage' ? Math.round(metadata.width * percentage / 100) : width, height: resizeMode === 'percentage' ? Math.round(metadata.height * percentage / 100) : height }
            : { format: isCompress ? 'webp' as const : format, quality };

      const output = await transformBrowserImage(file, options);
      if (fileRevision !== fileRevisionRef.current) return;
      const extension = isCompress ? 'webp' : isCrop || isRotate || isResize ? 'png' : format === 'jpeg' ? 'jpg' : format;
      const outputName = file.name.replace(/\.[^.]+$/, '') + '-' + toolSlug + '.' + extension;
      const nextUrl = URL.createObjectURL(output.blob);
      setResultUrl((previous) => {
        if (previous) URL.revokeObjectURL(previous);
        return nextUrl;
      });
      setResultName(outputName);
      const savings = Math.round((1 - output.blob.size / Math.max(1, file.size)) * 100);
      setMessage(`Done: ${output.width} × ${output.height}px · ${formatBytes(output.blob.size)}${isCompress ? ` · ${savings}% size change` : ''}`);
    } catch (cause) {
      if (fileRevision === fileRevisionRef.current) {
        setError(cause instanceof Error ? cause.message : 'Image processing failed.');
      }
    } finally {
      if (fileRevision === fileRevisionRef.current) setBusy(false);
    }
  };

  const downloadResult = () => {
    if (!resultUrl || !resultName) return;
    const link = document.createElement('a');
    link.href = resultUrl;
    link.download = resultName;
    link.click();
  };

  return (
    <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-5">
      <section className="lg:col-span-7 space-y-4 min-w-0">
        <button type="button" onClick={() => inputRef.current?.click()} className="w-full p-7 sm:p-9 rounded-2xl border-2 border-dashed border-stone-300 hover:border-orange-400 bg-white transition-colors text-center">
          <input ref={inputRef} type="file" accept="image/png,image/jpeg,image/webp,image/gif,image/avif,image/bmp" className="hidden" onChange={(event) => handleFile(event.target.files?.[0])} />
          <span className="mx-auto w-12 h-12 rounded-xl bg-orange-50 border border-orange-100 text-orange-600 flex items-center justify-center"><Upload size={22} /></span>
          <span className="block mt-3 text-sm font-semibold text-stone-900">{file ? 'Choose another image' : 'Select an image to begin'}</span>
          <span className="block mt-1 text-xs text-stone-500">PNG, JPG, WebP, GIF, AVIF or BMP · Up to 50 MB</span>
        </button>

        <div className="rounded-2xl border border-stone-200 bg-stone-50 min-h-[260px] p-4 flex items-center justify-center">
          {(resultUrl || sourceUrl) ? (
            <div className="relative inline-block max-w-full">
              <img
                ref={previewImageRef}
                src={resultUrl || sourceUrl}
                alt={resultUrl ? "Processed result preview" : "Original image preview"}
                className={`block max-w-full max-h-[480px] object-contain rounded-lg ${isCrop && !resultUrl ? 'touch-none cursor-crosshair select-none' : ''}`}
                draggable={false}
                onPointerDown={isCrop && !resultUrl ? handleCropPointerDown : undefined}
                onPointerMove={isCrop && !resultUrl ? handleCropPointerMove : undefined}
                onPointerUp={isCrop && !resultUrl ? handleCropPointerEnd : undefined}
                onPointerCancel={isCrop && !resultUrl ? handleCropPointerEnd : undefined}
              />
              {isCrop && !resultUrl && metadata && (
                <div
                  aria-label="Selected crop area"
                  className="absolute pointer-events-none border-2 border-orange-500 bg-orange-300/10 rounded-sm"
                  style={{
                    left: `${(cropX / metadata.width) * 100}%`,
                    top: `${(cropY / metadata.height) * 100}%`,
                    width: `${(Math.min(cropWidth, metadata.width - cropX) / metadata.width) * 100}%`,
                    height: `${(Math.min(cropHeight, metadata.height - cropY) / metadata.height) * 100}%`,
                  }}
                />
              )}
            </div>
          ) : (
            <div className="text-center text-stone-400">
              <ImageIcon size={36} className="mx-auto mb-2 opacity-60" />
              <p className="text-xs">Your image preview will appear here</p>
            </div>
          )}
        </div>

        {metadata && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <Metric label="Dimensions" value={`${metadata.width} × ${metadata.height}`} />
            <Metric label="File size" value={formatBytes(metadata.sizeBytes)} />
            <Metric label="Aspect ratio" value={metadata.aspectRatio} />
            <Metric label="Alpha sample" value={metadata.hasTransparency ? 'Yes' : 'No'} />
          </div>
        )}
        {metadata && isMetadata && (
          <div className="p-4 rounded-xl bg-white border border-stone-200 text-xs text-stone-600 space-y-1">
            <p><strong className="text-stone-900">File:</strong> {metadata.name}</p>
            <p><strong className="text-stone-900">MIME type:</strong> {metadata.mimeType}</p>
            <p><strong className="text-stone-900">Last modified:</strong> {metadata.lastModified}</p>
            <p className="text-stone-500">{metadata.metadataNote}</p>
          </div>
        )}
      </section>

      <aside className="lg:col-span-5 min-w-0">
        <div className="p-5 sm:p-6 rounded-2xl bg-white border border-stone-200 shadow-xs space-y-5">
          <div className="flex items-center gap-2 pb-3 border-b border-stone-100">
            <FileImage size={17} className="text-orange-600" />
            <h2 className="text-sm font-semibold text-stone-900">{toolName} settings</h2>
          </div>

          {!isMetadata && !isCrop && !isRotate && !isResize && (
            <Field label={isCompress ? 'Output quality' : 'Output format'}>
              {isCompress ? (
                <div className="space-y-2">
                  <div className="flex justify-between text-xs text-stone-500"><span>Smaller</span><strong className="text-orange-700">{quality}%</strong><span>Sharper</span></div>
                  <input type="range" min="10" max="100" value={quality} onChange={(event) => setQuality(Number(event.target.value))} className="w-full accent-orange-600" />
                  <p className="text-[11px] text-stone-500">Exports WebP. Compression depends on the image content; a smaller file is not guaranteed.</p>
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-2">
                  {(['webp', 'jpeg', 'png'] as ImageFormat[]).map((item) => <button key={item} type="button" onClick={() => setFormat(item)} className={`py-2 rounded-lg border text-xs font-semibold uppercase ${format === item ? 'border-orange-400 bg-orange-50 text-orange-700' : 'border-stone-200 text-stone-600'}`}>{item === 'jpeg' ? 'JPG' : item}</button>)}
                </div>
              )}
            </Field>
          )}

          {isResize && (
            <>
              <div className="grid grid-cols-2 gap-2 p-1 bg-stone-100 rounded-xl">
                <button type="button" onClick={() => setResizeMode('pixels')} className={`py-2 rounded-lg text-xs font-semibold ${resizeMode === 'pixels' ? 'bg-white text-orange-700 shadow-xs' : 'text-stone-500'}`}>Exact pixels</button>
                <button type="button" onClick={() => setResizeMode('percentage')} className={`py-2 rounded-lg text-xs font-semibold ${resizeMode === 'percentage' ? 'bg-white text-orange-700 shadow-xs' : 'text-stone-500'}`}>Percentage</button>
              </div>
              {resizeMode === 'percentage' ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-between"><span className="text-xs font-semibold text-stone-700">Scale</span><strong className="text-xs text-orange-700">{percentage}%</strong></div>
                  <input type="range" min="10" max="200" step="5" value={percentage} onChange={(event) => setPercentage(Number(event.target.value))} className="w-full accent-orange-600" />
                  {metadata && <p className="text-[11px] text-stone-500">Output: {Math.round(metadata.width * percentage / 100)} × {Math.round(metadata.height * percentage / 100)}px</p>}
                </div>
              ) : (
                <>
                  <div className="flex justify-between items-center"><span className="text-xs font-semibold text-stone-700">Keep aspect ratio</span><button type="button" onClick={() => setLockRatio(!lockRatio)} className="flex items-center gap-1 text-xs text-orange-700">{lockRatio ? <Lock size={14} /> : <Unlock size={14} />}{lockRatio ? 'Locked' : 'Unlocked'}</button></div>
                  <div className="grid grid-cols-2 gap-3">
                    <NumberField label="Width (px)" value={width} onChange={updateWidth} />
                    <NumberField label="Height (px)" value={height} onChange={updateHeight} />
                  </div>
                </>
              )}
              {metadata && <p className="text-[11px] text-stone-500">Original: {metadata.width} × {metadata.height}px. Maximum output dimension: 12,000px.</p>}
            </>
          )}

          {isCrop && (
            <div className="space-y-3">
              <p className="text-xs text-stone-600">Drag across the image preview to select an area, or enter exact pixel values below. Touch dragging is supported.</p>
              <div className="grid grid-cols-2 gap-3">
                <NumberField label="X" value={cropX} onChange={setCropX} />
                <NumberField label="Y" value={cropY} onChange={setCropY} />
                <NumberField label="Width" value={cropWidth} onChange={setCropWidth} />
                <NumberField label="Height" value={cropHeight} onChange={setCropHeight} />
              </div>
              {metadata && <button type="button" onClick={() => { setCropX(0); setCropY(0); setCropWidth(metadata.width); setCropHeight(metadata.height); }} className="text-xs text-orange-700 underline">Reset crop to full image</button>}
            </div>
          )}

          {isRotate && (
            <div className="space-y-2">
              <Field label="Rotation"><div className="grid grid-cols-4 gap-2">{([0, 90, 180, 270] as const).map((angle) => <button type="button" key={angle} onClick={() => setRotation(angle)} className={`py-2 rounded-lg border text-xs font-semibold ${rotation === angle ? 'border-orange-400 bg-orange-50 text-orange-700' : 'border-stone-200 text-stone-600'}`}>{angle}°</button>)}</div></Field>
              <button type="button" onClick={() => setRotation((value) => ((value + 90) % 360) as 0 | 90 | 180 | 270)} className="w-full py-2 rounded-lg bg-stone-100 text-xs font-semibold text-stone-700 flex items-center justify-center gap-2"><RotateCw size={14} /> Rotate 90° clockwise</button>
              <label className="flex items-center justify-between gap-3 p-3 rounded-lg bg-stone-50 border border-stone-200 text-xs text-stone-700"><span>Flip horizontally</span><input type="checkbox" checked={flipHorizontal} onChange={(event) => setFlipHorizontal(event.target.checked)} /></label>
              <label className="flex items-center justify-between gap-3 p-3 rounded-lg bg-stone-50 border border-stone-200 text-xs text-stone-700"><span>Flip vertically</span><input type="checkbox" checked={flipVertical} onChange={(event) => setFlipVertical(event.target.checked)} /></label>
            </div>
          )}

          <button type="button" onClick={processImage} disabled={!file || !metadata || preparingFile || busy} className="w-full py-3 rounded-xl bg-stone-900 hover:bg-stone-800 disabled:opacity-40 text-white text-xs font-semibold flex items-center justify-center gap-2">
            <RefreshCw size={15} className={busy ? 'animate-spin' : ''} />
            {preparingFile ? 'Preparing image…' : busy ? 'Processing…' : isMetadata ? 'Inspect image' : 'Process image'}
          </button>

          {resultUrl && (
            <button type="button" onClick={downloadResult} className="w-full py-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-semibold flex items-center justify-center gap-2"><Download size={15} /> Download {resultName}</button>
          )}
          {message && <p role="status" className="text-xs text-emerald-700 break-words">{message}</p>}
          {error && <p role="alert" className="text-xs text-red-600 flex items-start gap-1.5"><AlertCircle size={14} className="shrink-0 mt-0.5" />{error}</p>}
          <p className="pt-3 border-t border-stone-100 text-[11px] leading-relaxed text-stone-500">Processing happens in this browser. Images are not uploaded. Re-encoding may remove EXIF metadata and may not preserve animation in GIF files.</p>
        </div>
      </aside>
    </div>
  );
};

function Metric({ label, value }: { label: string; value: string }) {
  return <div className="p-3 rounded-xl bg-white border border-stone-200 min-w-0"><p className="text-[10px] text-stone-500">{label}</p><p className="mt-1 text-xs font-semibold text-stone-900 break-words">{value}</p></div>;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="space-y-2"><label className="block text-xs font-semibold text-stone-700">{label}</label>{children}</div>;
}

function NumberField({ label, value, onChange }: { label: string; value: number; onChange: (value: number) => void }) {
  return <label className="block space-y-1"><span className="text-[11px] text-stone-500">{label}</span><input type="number" min={0} max={12000} value={value} onChange={(event) => onChange(Math.max(0, Number(event.target.value) || 0))} className="w-full px-3 py-2 rounded-lg border border-stone-200 bg-stone-50 text-xs text-stone-900" /></label>;
}

function formatBytes(value: number): string {
  if (value < 1024) return value + ' B';
  if (value < 1024 * 1024) return (value / 1024).toFixed(1) + ' KB';
  return (value / (1024 * 1024)).toFixed(2) + ' MB';
}

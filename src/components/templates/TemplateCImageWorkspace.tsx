import React, { useState } from 'react';
import { Image as ImageIcon, Sliders, Lock, Unlock, Download, RefreshCw, ZoomIn, ZoomOut, RotateCw } from 'lucide-react';
import { useI18n } from '../../i18n';
import { DisabledAction } from '../common/DisabledAction';

interface TemplateCImageWorkspaceProps {
  toolName: string;
  defaultFormat?: 'webp' | 'jpg' | 'png' | 'avif';
  showQuality?: boolean;
  showDimensions?: boolean;
  showCropperGrid?: boolean;
}

export const TemplateCImageWorkspace: React.FC<TemplateCImageWorkspaceProps> = ({
  toolName,
  defaultFormat = 'webp',
  showQuality = true,
  showDimensions = true,
  showCropperGrid = false,
}) => {
  const { t } = useI18n();

  // Workspace configuration state
  const [quality, setQuality] = useState<number>(82);
  const [targetFormat, setTargetFormat] = useState<string>(defaultFormat);
  const [width, setWidth] = useState<number>(1920);
  const [height, setHeight] = useState<number>(1080);
  const [lockRatio, setLockRatio] = useState<boolean>(true);
  const [rotation, setRotation] = useState<number>(0);
  const [activeTab, setActiveTab] = useState<'preview' | 'compare'>('preview');

  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  const handleWidthChange = (val: number) => {
    setWidth(val);
    if (lockRatio) {
      setHeight(Math.round(val / (16 / 9)));
    }
  };

  return (
    <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Main Visual Canvas Area (8 cols on desktop) */}
      <div className="lg:col-span-8 flex flex-col space-y-4">
        {/* Workspace Controls Header */}
        <div className="p-3 rounded-2xl bg-white border border-stone-200/90 shadow-xs flex items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 p-1 bg-stone-100 rounded-xl">
            <button
              onClick={() => setActiveTab('preview')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                activeTab === 'preview'
                  ? 'bg-white text-orange-600 shadow-xs font-semibold'
                  : 'text-stone-500 hover:text-stone-800'
              }`}
            >
              Single Preview
            </button>
            <button
              onClick={() => setActiveTab('compare')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                activeTab === 'compare'
                  ? 'bg-white text-orange-600 shadow-xs font-semibold'
                  : 'text-stone-500 hover:text-stone-800'
              }`}
            >
              Side-by-Side Comparison
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleRotate}
              className="p-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 transition-colors flex items-center gap-1.5 text-xs font-medium"
              title="Rotate 90 degrees"
            >
              <RotateCw size={14} className="text-orange-600" />
              <span className="hidden sm:inline">{rotation}°</span>
            </button>
          </div>
        </div>

        {/* Canvas Visual Display Area */}
        <div className="relative rounded-3xl bg-stone-50 border border-stone-200/90 min-h-[420px] flex items-center justify-center p-6 overflow-hidden shadow-xs">
          {/* Subtle checkered backdrop for alpha channel */}
          <div
            className="absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage: `linear-gradient(45deg, #000 25%, transparent 25%), linear-gradient(-45deg, #000 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #000 75%), linear-gradient(-45deg, transparent 75%, #000 75%)`,
              backgroundSize: '24px 24px',
              backgroundPosition: '0 0, 0 12px, 12px -12px, -12px 0px',
            }}
          />

          {activeTab === 'preview' ? (
            <div className="relative max-w-lg w-full flex flex-col items-center">
              {/* Graphic Placeholder Preview */}
              <div
                className="w-full aspect-video rounded-2xl bg-gradient-to-tr from-white to-orange-50/40 border border-stone-200 p-6 flex flex-col justify-between shadow-md relative transition-transform duration-300"
                style={{ transform: `rotate(${rotation}deg)` }}
              >
                {showCropperGrid && (
                  <div className="absolute inset-4 border border-dashed border-orange-400/50 pointer-events-none grid grid-cols-3 grid-rows-3">
                    <div className="border-r border-b border-orange-300/40" />
                    <div className="border-r border-b border-orange-300/40" />
                    <div className="border-b border-orange-300/40" />
                    <div className="border-r border-b border-orange-300/40" />
                    <div className="border-r border-b border-orange-300/40" />
                    <div className="border-b border-orange-300/40" />
                    <div className="border-r border-b border-orange-300/40" />
                    <div className="border-r border-b border-orange-300/40" />
                  </div>
                )}
                <div className="flex justify-between items-start text-xs font-mono text-stone-600">
                  <span className="font-medium">SAMPLE_ASSET_4K.PNG</span>
                  <span>{width} × {height}</span>
                </div>
                <div className="text-center text-stone-500 text-xs font-medium">
                  High-Fidelity Canvas Workspace
                </div>
                <div className="flex justify-between items-end text-xs font-mono text-stone-600">
                  <span className="text-orange-600 font-bold">Q{quality} · {targetFormat.toUpperCase()}</span>
                  <span>1.42 MB</span>
                </div>
              </div>

              <div className="mt-4 text-[11px] text-stone-500 font-mono">
                {t('common.sampleData')} · Interactive canvas state
              </div>
            </div>
          ) : (
            /* Comparison View */
            <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-white border border-stone-200 text-center space-y-2 shadow-xs">
                <span className="text-[11px] font-mono text-stone-500 uppercase tracking-wider block font-medium">
                  {t('templates.original')} (PNG)
                </span>
                <div className="aspect-video rounded-xl bg-stone-100 border border-stone-200 flex items-center justify-center text-xs font-mono text-stone-600">
                  2.84 MB · Lossless
                </div>
              </div>
              <div className="p-4 rounded-2xl bg-white border border-orange-200 text-center space-y-2 shadow-xs">
                <span className="text-[11px] font-mono text-orange-600 uppercase tracking-wider block font-bold">
                  {t('templates.preview')} ({targetFormat.toUpperCase()})
                </span>
                <div className="aspect-video rounded-xl bg-orange-50/50 border border-orange-200/80 flex items-center justify-center text-xs font-mono text-orange-600 font-semibold">
                  ~610 KB (-78% savings)
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Configuration Sidebar (4 cols on desktop) */}
      <div className="lg:col-span-4 space-y-6">
        <div className="p-6 rounded-3xl bg-white border border-stone-200/90 shadow-xs space-y-6">
          <div className="flex items-center gap-2 pb-4 border-b border-stone-100">
            <Sliders size={18} className="text-orange-600" />
            <h3 className="text-sm font-semibold text-stone-900">
              Workspace Parameters
            </h3>
          </div>

          {/* Format Selection */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-stone-700 block">
              {t('templates.targetFormat')}
            </label>
            <div className="grid grid-cols-4 gap-1.5 p-1 bg-stone-100 rounded-xl">
              {['webp', 'jpg', 'png', 'avif'].map((fmt) => (
                <button
                  key={fmt}
                  onClick={() => setTargetFormat(fmt)}
                  className={`py-1.5 text-xs font-mono font-medium rounded-lg uppercase transition-colors ${
                    targetFormat === fmt
                      ? 'bg-white text-orange-600 shadow-xs font-bold'
                      : 'text-stone-500 hover:text-stone-800'
                  }`}
                >
                  {fmt}
                </button>
              ))}
            </div>
          </div>

          {/* Quality Slider */}
          {showQuality && (
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-stone-700 font-medium">{t('templates.quality')}</span>
                <span className="font-mono text-orange-600 font-bold">{quality}%</span>
              </div>
              <input
                type="range"
                min="10"
                max="100"
                value={quality}
                onChange={(e) => setQuality(Number(e.target.value))}
                className="w-full accent-orange-500 bg-stone-200 h-1.5 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-stone-500 font-mono">
                <span>Smaller Size</span>
                <span>Balanced</span>
                <span>Maximum Clarity</span>
              </div>
            </div>
          )}

          {/* Dimensions Controls */}
          {showDimensions && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-stone-700 font-medium">{t('templates.dimensions')}</span>
                <button
                  onClick={() => setLockRatio(!lockRatio)}
                  className="flex items-center gap-1 text-[11px] text-stone-500 hover:text-stone-800"
                  title="Lock Aspect Ratio"
                >
                  {lockRatio ? <Lock size={12} className="text-orange-600" /> : <Unlock size={12} />}
                  <span className={lockRatio ? 'text-orange-600 font-semibold' : ''}>{lockRatio ? '16:9 Locked' : 'Free'}</span>
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-[10px] text-stone-500 font-mono mb-1 block">Width (px)</span>
                  <input
                    type="number"
                    value={width}
                    onChange={(e) => handleWidthChange(Number(e.target.value))}
                    className="w-full px-3 py-1.5 rounded-lg bg-stone-50 border border-stone-200 text-xs font-mono text-stone-900 focus:outline-none focus:border-orange-500 focus:bg-white"
                  />
                </div>
                <div>
                  <span className="text-[10px] text-stone-500 font-mono mb-1 block">Height (px)</span>
                  <input
                    type="number"
                    value={height}
                    onChange={(e) => setHeight(Number(e.target.value))}
                    disabled={lockRatio}
                    className="w-full px-3 py-1.5 rounded-lg bg-stone-50 border border-stone-200 text-xs font-mono text-stone-900 focus:outline-none focus:border-orange-500 focus:bg-white disabled:opacity-50"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Estimated Output Card (Marked as placeholder) */}
          <div className="p-3.5 rounded-xl bg-orange-50/60 border border-orange-200/70 space-y-1.5">
            <div className="text-[11px] uppercase font-mono text-orange-800 font-semibold tracking-wider">
              {t('templates.estimatedOutput')}
            </div>
            <div className="flex items-baseline justify-between text-xs font-mono">
              <span className="text-stone-600">Target Size:</span>
              <span className="text-orange-600 font-bold">~480 KB</span>
            </div>
            <div className="flex items-baseline justify-between text-xs font-mono">
              <span className="text-stone-600">Format:</span>
              <span className="text-stone-800 font-medium">{targetFormat.toUpperCase()}</span>
            </div>
          </div>

          {/* Action Button: Disabled until Phase 2 Engine */}
          <div className="pt-2">
            <DisabledAction
              label={t('common.download')}
              size="lg"
              hint={t('common.previewNotice')}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

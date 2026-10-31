import React, { useState } from 'react';
import { Sparkles, Film, Image as ImageIcon, Download, Sliders, Clock, Play } from 'lucide-react';
import { useI18n } from '../../i18n';
import { DisabledAction } from '../common/DisabledAction';

export const TemplatePThumbnailExtractor: React.FC<{ toolName: string }> = ({ toolName }) => {
  const { t } = useI18n();
  const [timestamp, setTimestamp] = useState<number>(8.4);
  const [format, setFormat] = useState<'png' | 'jpg'>('png');

  const frames = [
    { time: 2.0, label: '00:02.0' },
    { time: 5.5, label: '00:05.5' },
    { time: 8.4, label: '00:08.4' },
    { time: 12.0, label: '00:12.0' },
    { time: 16.2, label: '00:16.2' },
    { time: 21.0, label: '00:21.0' },
  ];

  return (
    <div className="w-full space-y-6">
      {/* Filmstrip Scrubber Container */}
      <div className="p-5 sm:p-6 rounded-3xl bg-stone-50 border border-stone-200/90 space-y-4 shadow-xs">
        <div className="flex justify-between items-center text-xs">
          <span className="font-semibold text-stone-900">Video Filmstrip Scrubber</span>
          <span className="font-mono text-orange-600 font-bold">Frame at 00:{timestamp.toFixed(1).padStart(4, '0')}</span>
        </div>

        {/* Thumbnail Cards Row */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
          {frames.map((frame, i) => {
            const isSelected = Math.abs(frame.time - timestamp) < 0.1;
            return (
              <button
                key={i}
                onClick={() => setTimestamp(frame.time)}
                className={`p-2 rounded-2xl border text-left transition-all ${
                  isSelected
                    ? 'bg-white border-orange-500 shadow-md ring-1 ring-orange-500/20'
                    : 'bg-white border-stone-200 hover:border-stone-300 opacity-70 hover:opacity-100 shadow-2xs'
                }`}
              >
                <div className="aspect-video w-full rounded-xl bg-stone-100 border border-stone-200 flex items-center justify-center text-stone-500 mb-2 font-mono text-[10px]">
                  FRAME {i + 1}
                </div>
                <div className="flex justify-between text-[10px] font-mono">
                  <span className={isSelected ? 'text-orange-600 font-bold' : 'text-stone-500'}>
                    {frame.label}
                  </span>
                  {isSelected && <span className="text-orange-600">●</span>}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Extracted Still Preview & Settings Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Extracted Frame High-Res Preview (8 cols) */}
        <div className="lg:col-span-8 rounded-3xl bg-white border border-stone-200/90 p-6 flex flex-col justify-between shadow-xs">
          <div className="flex justify-between items-center text-xs mb-4">
            <span className="font-semibold text-stone-900">Target Still Frame Preview</span>
            <span className="font-mono text-stone-400">3840 × 2160 UHD</span>
          </div>

          <div className="aspect-video w-full rounded-2xl bg-gradient-to-tr from-stone-100 to-orange-50/40 border border-stone-200 p-6 flex flex-col justify-between shadow-sm relative">
            <div className="text-[11px] font-mono text-stone-500">
              FRAME_EXACT_TIMESTAMP_00_{timestamp.toFixed(1)}
            </div>
            <div className="text-center text-stone-400 text-xs font-mono">
              [High-Resolution Extracted Still Preview Placeholder]
            </div>
            <div className="flex justify-between text-[11px] font-mono text-stone-500">
              <span className="text-orange-600 font-bold">{format.toUpperCase()} Target</span>
              <span>100% Quality Render</span>
            </div>
          </div>
        </div>

        {/* Configuration Sidebar (4 cols) */}
        <div className="lg:col-span-4 p-6 rounded-3xl bg-white border border-stone-200/90 space-y-6 flex flex-col justify-between shadow-xs">
          <div className="space-y-4">
            <h4 className="text-xs font-semibold text-stone-900 uppercase tracking-wider">
              Export Parameters
            </h4>

            {/* Format Selector */}
            <div className="space-y-1.5">
              <label className="text-xs text-stone-700 font-medium block">Format</label>
              <div className="grid grid-cols-2 gap-2">
                {(['png', 'jpg'] as const).map((fmt) => (
                  <button
                    key={fmt}
                    onClick={() => setFormat(fmt)}
                    className={`py-2 rounded-xl text-xs font-mono uppercase font-semibold transition-colors ${
                      format === fmt
                        ? 'bg-orange-50 text-orange-700 border border-orange-300 font-bold'
                        : 'bg-stone-50 text-stone-600 border border-stone-200 hover:border-stone-300'
                    }`}
                  >
                    {fmt}
                  </button>
                ))}
              </div>
            </div>

            {/* Exact Timestamp Input */}
            <div className="space-y-1.5">
              <label className="text-xs text-stone-700 font-medium block">Timestamp (Seconds)</label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="60"
                value={timestamp}
                onChange={(e) => setTimestamp(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-stone-50 border border-stone-200 font-mono text-xs text-stone-900 focus:outline-none focus:border-orange-500 focus:bg-white transition-colors"
              />
            </div>
          </div>

          <div>
            <DisabledAction label="Save Extracted Frame" size="md" />
          </div>
        </div>
      </div>
    </div>
  );
};

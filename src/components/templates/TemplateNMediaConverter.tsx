import React, { useState } from 'react';
import { Music, FileAudio, Sliders, Volume2, ArrowRight } from 'lucide-react';
import { useI18n } from '../../i18n';
import { DisabledAction } from '../common/DisabledAction';

export const TemplateNMediaConverter: React.FC<{ toolName: string }> = ({ toolName }) => {
  const { t } = useI18n();
  const [outputFormat, setOutputFormat] = useState<'mp3' | 'wav' | 'aac' | 'flac'>('mp3');
  const [bitrate, setBitrate] = useState<number>(256);

  return (
    <div className="w-full space-y-6">
      {/* Input File Summary Card */}
      <div className="p-5 sm:p-6 rounded-3xl bg-white border border-stone-200/90 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-orange-50 border border-orange-200/60 flex items-center justify-center text-orange-600 shadow-xs">
            <Music size={22} />
          </div>
          <div>
            <div className="text-sm font-semibold text-stone-900">Conference-Keynote-Audio.mp4</div>
            <div className="text-xs text-stone-500 mt-0.5 font-mono">
              Duration: 18m 42s · AAC Stereo · 48,000 Hz · 142 MB
            </div>
          </div>
        </div>

        <span className="text-[11px] font-mono text-orange-700 bg-orange-50 border border-orange-200 px-2.5 py-1 rounded-lg font-medium">
          Demux Stream Ready
        </span>
      </div>

      {/* Target Format & Quality Controls */}
      <div className="p-6 rounded-3xl bg-white border border-stone-200/90 shadow-xs space-y-6">
        <div className="flex items-center gap-2 pb-4 border-b border-stone-100">
          <Sliders size={18} className="text-orange-600" />
          <h3 className="text-sm font-semibold text-stone-900">Audio Export Configuration</h3>
        </div>

        {/* Output format picker */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-stone-700 block">Target Audio Codec</label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {(['mp3', 'wav', 'aac', 'flac'] as const).map((fmt) => (
              <button
                key={fmt}
                onClick={() => setOutputFormat(fmt)}
                className={`py-2 px-3 rounded-xl text-xs font-mono font-semibold uppercase transition-colors ${
                  outputFormat === fmt
                    ? 'bg-orange-50 text-orange-700 border border-orange-300 font-bold'
                    : 'bg-stone-50 text-stone-600 border border-stone-200 hover:border-stone-300'
                }`}
              >
                {fmt}
              </button>
            ))}
          </div>
        </div>

        {/* Bitrate Selector */}
        {outputFormat !== 'wav' && outputFormat !== 'flac' && (
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="text-stone-700 font-medium">Constant Bitrate (CBR)</span>
              <span className="font-mono text-orange-600 font-bold">{bitrate} kbps</span>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {[128, 192, 256, 320].map((b) => (
                <button
                  key={b}
                  onClick={() => setBitrate(b)}
                  className={`py-1.5 rounded-lg text-xs font-mono transition-colors ${
                    bitrate === b
                      ? 'bg-orange-50 text-orange-700 border border-orange-300 font-semibold'
                      : 'bg-stone-50 text-stone-500 hover:text-stone-800'
                  }`}
                >
                  {b}k
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Estimated Output Card */}
        <div className="p-4 rounded-2xl bg-orange-50/60 border border-orange-200/70 flex items-center justify-between text-xs font-mono">
          <span className="text-stone-600">Estimated Output Size:</span>
          <span className="text-orange-600 font-bold">~34.8 MB ({outputFormat.toUpperCase()})</span>
        </div>
      </div>

      {/* Action Footer */}
      <div className="p-6 rounded-2xl bg-white border border-stone-200/90 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-xs text-stone-600">
          Audio stream isolation will execute locally in client memory.
        </div>
        <div className="w-full sm:w-auto">
          <DisabledAction label="Extract Audio Track" size="md" />
        </div>
      </div>
    </div>
  );
};

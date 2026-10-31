import React, { useState } from 'react';
import { Fingerprint, Copy, Check, RefreshCw, Sliders, Shield } from 'lucide-react';
import { useI18n } from '../../i18n';
import { DisabledAction } from '../common/DisabledAction';

interface TemplateIGeneratorProps {
  toolName: string;
  type?: 'uuid' | 'hash';
}

export const TemplateIGenerator: React.FC<TemplateIGeneratorProps> = ({ toolName, type = 'uuid' }) => {
  const { t } = useI18n();
  const [count, setCount] = useState<number>(5);
  const [version, setVersion] = useState<'v4' | 'v7'>('v4');
  const [uppercase, setUppercase] = useState<boolean>(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [copiedAll, setCopiedAll] = useState<boolean>(false);

  // Sample preview items
  const sampleItems = [
    'f47ac10b-58cc-4372-a567-0e02b2c3d479',
    '8e38d338-9844-482f-8cb0-3942004e0e5a',
    '3d508499-e659-42b8-933e-10ff828ef050',
    'd2a3f769-1b32-4467-bc18-2831846c4f3e',
    'b291583a-4461-46f0-ba3e-9080c10a30b5',
  ].slice(0, count).map((item) => (uppercase ? item.toUpperCase() : item));

  const copyItem = (val: string, idx: number) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(val);
      setCopiedIndex(idx);
      setTimeout(() => setCopiedIndex(null), 1500);
    }
  };

  const copyAll = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(sampleItems.join('\n'));
      setCopiedAll(true);
      setTimeout(() => setCopiedAll(false), 2000);
    }
  };

  return (
    <div className="w-full space-y-6">
      {/* Configuration Bar */}
      <div className="p-5 rounded-3xl bg-white border border-stone-200/90 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-stone-100">
          <div className="flex items-center gap-2">
            <Fingerprint size={18} className="text-orange-600" />
            <h3 className="text-sm font-semibold text-stone-900">Generation Parameters</h3>
          </div>

          <button
            onClick={copyAll}
            className="px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-xs font-medium text-stone-700 hover:text-stone-900 transition-colors flex items-center gap-1.5"
          >
            {copiedAll ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
            <span>{copiedAll ? 'Copied All' : 'Copy All Results'}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          {/* Count Selector */}
          <div>
            <label className="text-stone-700 font-medium block mb-1.5">Batch Quantity</label>
            <div className="grid grid-cols-4 gap-1 p-1 bg-stone-100 rounded-xl">
              {[1, 5, 10, 20].map((num) => (
                <button
                  key={num}
                  onClick={() => setCount(num)}
                  className={`py-1 text-xs font-mono rounded-lg transition-colors ${
                    count === num ? 'bg-white text-orange-600 shadow-xs font-semibold' : 'text-stone-500 hover:text-stone-800'
                  }`}
                >
                  {num}
                </button>
              ))}
            </div>
          </div>

          {/* Version Selector */}
          <div>
            <label className="text-stone-700 font-medium block mb-1.5">Standard Spec</label>
            <div className="grid grid-cols-2 gap-1 p-1 bg-stone-100 rounded-xl">
              <button
                onClick={() => setVersion('v4')}
                className={`py-1 text-xs font-mono rounded-lg transition-colors ${
                  version === 'v4' ? 'bg-white text-orange-600 shadow-xs font-semibold' : 'text-stone-500 hover:text-stone-800'
                }`}
              >
                v4 (Random)
              </button>
              <button
                onClick={() => setVersion('v7')}
                className={`py-1 text-xs font-mono rounded-lg transition-colors ${
                  version === 'v7' ? 'bg-white text-orange-600 shadow-xs font-semibold' : 'text-stone-500 hover:text-stone-800'
                }`}
              >
                v7 (Time-based)
              </button>
            </div>
          </div>

          {/* Uppercase Toggle */}
          <div>
            <label className="text-stone-700 font-medium block mb-1.5">Formatting</label>
            <button
              onClick={() => setUppercase(!uppercase)}
              className="w-full py-2 px-3 bg-stone-50 rounded-xl border border-stone-200 text-stone-700 hover:border-stone-300 flex items-center justify-between transition-colors"
            >
              <span>Uppercase Strings</span>
              <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${uppercase ? 'bg-orange-100 text-orange-800 font-bold border border-orange-200' : 'bg-stone-200 text-stone-600'}`}>
                {uppercase ? 'ON' : 'OFF'}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Generated Results List */}
      <div className="rounded-3xl bg-stone-50 border border-stone-200/90 shadow-xs p-5 space-y-2">
        <div className="flex justify-between items-center text-xs font-mono text-stone-500 mb-3 px-1">
          <span>SAMPLE PREVIEW POOL ({sampleItems.length} ITEMS)</span>
          <span>WebCrypto CSPRNG Target</span>
        </div>

        <div className="space-y-1.5">
          {sampleItems.map((val, idx) => (
            <div
              key={idx}
              className="p-3 rounded-xl bg-white border border-stone-200/80 flex items-center justify-between gap-3 font-mono text-xs text-stone-900 hover:border-orange-300 shadow-2xs transition-colors group"
            >
              <div className="flex items-center gap-3 min-w-0">
                <span className="text-[10px] text-stone-400 select-none w-5 text-right">{idx + 1}</span>
                <span className="truncate select-all">{val}</span>
              </div>

              <button
                onClick={() => copyItem(val, idx)}
                className="p-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-500 hover:text-stone-900 transition-colors shrink-0"
                title="Copy single value"
              >
                {copiedIndex === idx ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Action Footer */}
      <div className="p-6 rounded-2xl bg-white border border-stone-200/90 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-xs text-stone-600">
          Generator pipeline ready for Phase 2 WebCrypto RNG connection.
        </div>
        <div className="w-full sm:w-auto">
          <DisabledAction label="Generate Fresh Entropy" size="md" />
        </div>
      </div>
    </div>
  );
};

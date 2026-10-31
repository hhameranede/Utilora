import React, { useState } from 'react';
import { Binary, ArrowUpDown, Copy, Check, Trash2, ArrowRight } from 'lucide-react';
import { useI18n } from '../../i18n';
import { DisabledAction } from '../common/DisabledAction';

interface TemplateHEncoderDecoderProps {
  toolName: string;
  defaultInput?: string;
  defaultMode?: 'encode' | 'decode';
}

export const TemplateHEncoderDecoder: React.FC<TemplateHEncoderDecoderProps> = ({
  toolName,
  defaultInput = 'UTILORA Global Privacy Engine 2026',
  defaultMode = 'encode',
}) => {
  const { t } = useI18n();
  const [mode, setMode] = useState<'encode' | 'decode'>(defaultMode);
  const [inputVal, setInputVal] = useState<string>(defaultInput);
  const [outputVal, setOutputVal] = useState<string>(
    'VVRJTE9SQSBHbG9iYWwgUHJpdmFjeSBFbmdpbmUgMjAyNg=='
  );
  const [copied, setCopied] = useState<boolean>(false);

  const swap = () => {
    setMode((prev) => (prev === 'encode' ? 'decode' : 'encode'));
    const temp = inputVal;
    setInputVal(outputVal);
    setOutputVal(temp);
  };

  const handleCopy = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(outputVal);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="w-full space-y-6">
      {/* Direction & Mode Bar */}
      <div className="p-4 rounded-2xl bg-white border border-stone-200/90 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Binary size={16} className="text-orange-600" />
          <span className="text-xs font-semibold text-stone-900">Mode:</span>
          <div className="flex items-center gap-1 p-1 bg-stone-100 rounded-xl">
            <button
              onClick={() => setMode('encode')}
              className={`px-3 py-1 text-xs font-medium rounded-lg capitalize transition-colors ${
                mode === 'encode'
                  ? 'bg-white text-orange-600 shadow-xs font-semibold'
                  : 'text-stone-500 hover:text-stone-800'
              }`}
            >
              Encode
            </button>
            <button
              onClick={() => setMode('decode')}
              className={`px-3 py-1 text-xs font-medium rounded-lg capitalize transition-colors ${
                mode === 'decode'
                  ? 'bg-white text-orange-600 shadow-xs font-semibold'
                  : 'text-stone-500 hover:text-stone-800'
              }`}
            >
              Decode
            </button>
          </div>
        </div>

        <button
          onClick={swap}
          className="px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-xs font-medium text-stone-700 transition-colors flex items-center gap-1.5"
        >
          <ArrowUpDown size={13} className="text-orange-600" />
          <span>Swap Direction</span>
        </button>
      </div>

      {/* Input / Output Workspace Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Input Panel */}
        <div className="rounded-3xl bg-white border border-stone-200/90 overflow-hidden flex flex-col shadow-xs">
          <div className="p-3 bg-stone-50 border-b border-stone-100 flex items-center justify-between text-xs">
            <span className="font-semibold text-stone-900">
              {mode === 'encode' ? 'Plaintext Input' : 'Encoded Input'}
            </span>
            <button
              onClick={() => setInputVal('')}
              className="text-stone-400 hover:text-stone-700 text-[11px]"
            >
              Clear
            </button>
          </div>
          <textarea
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            rows={8}
            className="w-full p-4 bg-transparent text-xs font-mono text-stone-900 placeholder-stone-400 focus:outline-none resize-none leading-relaxed"
            placeholder="Type or paste payload here..."
          />
        </div>

        {/* Output Panel (Placeholder) */}
        <div className="rounded-3xl bg-white border border-stone-200/90 overflow-hidden flex flex-col shadow-xs">
          <div className="p-3 bg-stone-50 border-b border-stone-100 flex items-center justify-between text-xs">
            <span className="font-semibold text-orange-600">
              {mode === 'encode' ? 'Encoded Output (Sample)' : 'Decoded Output (Sample)'}
            </span>
            <button
              onClick={handleCopy}
              className="px-2 py-0.5 rounded bg-white border border-stone-200 text-[11px] font-medium text-stone-700 hover:bg-stone-50 flex items-center gap-1 shadow-2xs"
            >
              {copied ? <Check size={11} className="text-emerald-600" /> : <Copy size={11} />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
          <textarea
            value={outputVal}
            readOnly
            rows={8}
            className="w-full p-4 bg-stone-50/50 text-xs font-mono text-stone-700 focus:outline-none resize-none leading-relaxed select-all"
          />
        </div>
      </div>

      {/* Action Footer */}
      <div className="p-6 rounded-2xl bg-white border border-stone-200/90 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-xs text-stone-600">
          Bidirectional transformation workspace.
        </div>
        <div className="w-full sm:w-auto">
          <DisabledAction label={mode === 'encode' ? 'Encode Payload' : 'Decode Payload'} size="md" />
        </div>
      </div>
    </div>
  );
};

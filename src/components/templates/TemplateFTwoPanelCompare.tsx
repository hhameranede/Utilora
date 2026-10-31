import React, { useState } from 'react';
import { GitCompare, ArrowLeftRight, Check, Copy } from 'lucide-react';
import { useI18n } from '../../i18n';
import { DisabledAction } from '../common/DisabledAction';

interface TemplateFTwoPanelCompareProps {
  toolName: string;
}

export const TemplateFTwoPanelCompare: React.FC<TemplateFTwoPanelCompareProps> = ({ toolName }) => {
  const { t } = useI18n();

  const [textA, setTextA] = useState<string>(
    `function calculateTax(subtotal) {
  const rate = 0.05;
  return subtotal * rate;
}`
  );

  const [textB, setTextB] = useState<string>(
    `function calculateTax(subtotal, region = 'US') {
  const rate = region === 'EU' ? 0.20 : 0.07;
  return Number((subtotal * rate).toFixed(2));
}`
  );

  const [granularity, setGranularity] = useState<'lines' | 'words' | 'chars'>('lines');

  const swapPanels = () => {
    const temp = textA;
    setTextA(textB);
    setTextB(temp);
  };

  return (
    <div className="w-full space-y-6">
      {/* Compare Controls Bar */}
      <div className="p-4 rounded-2xl bg-white border border-stone-200/90 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <GitCompare size={16} className="text-orange-600" />
          <span className="text-xs font-semibold text-stone-900">Comparison Scope:</span>
          <div className="flex items-center gap-1 p-1 bg-stone-100 rounded-xl">
            {(['lines', 'words', 'chars'] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setGranularity(mode)}
                className={`px-3 py-1 text-xs font-mono font-medium rounded-lg capitalize transition-colors ${
                  granularity === mode
                    ? 'bg-white text-orange-600 shadow-xs font-semibold'
                    : 'text-stone-500 hover:text-stone-800'
                }`}
              >
                {mode}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={swapPanels}
          className="px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-xs font-medium text-stone-700 transition-colors flex items-center gap-1.5"
        >
          <ArrowLeftRight size={13} className="text-orange-600" />
          <span>Swap Inputs</span>
        </button>
      </div>

      {/* Dual Panel Comparison View */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Panel A */}
        <div className="rounded-3xl bg-white border border-stone-200/90 overflow-hidden flex flex-col shadow-xs">
          <div className="p-3 bg-stone-50/80 border-b border-stone-100 flex items-center justify-between text-xs">
            <span className="font-semibold text-stone-900">{t('templates.compareA')}</span>
            <span className="text-[11px] font-mono text-stone-500">{textA.length} chars</span>
          </div>
          <textarea
            value={textA}
            onChange={(e) => setTextA(e.target.value)}
            rows={10}
            className="w-full p-4 bg-transparent text-xs font-mono text-stone-800 focus:outline-none resize-none leading-relaxed"
          />
        </div>

        {/* Panel B */}
        <div className="rounded-3xl bg-white border border-stone-200/90 overflow-hidden flex flex-col shadow-xs">
          <div className="p-3 bg-stone-50/80 border-b border-stone-100 flex items-center justify-between text-xs">
            <span className="font-semibold text-orange-600">{t('templates.compareB')}</span>
            <span className="text-[11px] font-mono text-stone-500">{textB.length} chars</span>
          </div>
          <textarea
            value={textB}
            onChange={(e) => setTextB(e.target.value)}
            rows={10}
            className="w-full p-4 bg-transparent text-xs font-mono text-stone-800 focus:outline-none resize-none leading-relaxed"
          />
        </div>
      </div>

      {/* Diff Visualization Output Preview (Marked as placeholder) */}
      <div className="p-6 rounded-3xl bg-stone-50 border border-stone-200/90 shadow-xs space-y-3">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-stone-800">Diff Preview Visualization (Sample State)</span>
          <div className="flex items-center gap-3 text-[11px] font-mono">
            <span className="text-emerald-700 font-semibold">+2 Additions</span>
            <span className="text-red-600 font-semibold">-1 Deletions</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-stone-200 font-mono text-xs space-y-1 shadow-2xs">
          <div className="text-stone-500">  function calculateTax(subtotal) &#123;</div>
          <div className="bg-red-50 text-red-700 px-2 py-0.5 rounded -mx-2 flex items-center border-l-2 border-red-500">
            <span className="text-red-500 w-4 select-none font-bold">-</span>
            <span>  const rate = 0.05;</span>
          </div>
          <div className="bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded -mx-2 flex items-center border-l-2 border-emerald-500">
            <span className="text-emerald-600 w-4 select-none font-bold">+</span>
            <span>  const rate = region === 'EU' ? 0.20 : 0.07;</span>
          </div>
          <div className="text-stone-500">  return subtotal * rate;</div>
          <div className="text-stone-500">&#125;</div>
        </div>
      </div>

      {/* Action Area */}
      <div className="p-6 rounded-2xl bg-white border border-stone-200/90 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-xs text-stone-600">
          Side-by-side diff comparison workspace.
        </div>
        <div className="w-full sm:w-auto">
          <DisabledAction label="Generate Unified Diff" size="md" />
        </div>
      </div>
    </div>
  );
};

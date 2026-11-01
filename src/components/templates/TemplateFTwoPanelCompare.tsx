import React, { useState } from 'react';
import { GitCompare, ArrowLeftRight } from 'lucide-react';
import { useI18n } from '../../i18n';
import { createTextDiff, DiffBlock } from '../../engines/local-core';

interface TemplateFTwoPanelCompareProps {
  toolName: string;
}

export const TemplateFTwoPanelCompare: React.FC<TemplateFTwoPanelCompareProps> = ({ toolName }) => {
  const { t } = useI18n();
  const [textA, setTextA] = useState('');
  const [textB, setTextB] = useState('');
  const [granularity, setGranularity] = useState<'lines' | 'words' | 'chars'>('lines');
  const [blocks, setBlocks] = useState<DiffBlock[] | null>(null);
  const [counts, setCounts] = useState({ additions: 0, deletions: 0 });
  const [error, setError] = useState('');

  const swapPanels = () => {
    setTextA(textB);
    setTextB(textA);
    setBlocks(null);
    setError('');
  };

  const compare = () => {
    try {
      const result = createTextDiff(textA, textB, granularity);
      setBlocks(result.blocks);
      setCounts({ additions: result.additions, deletions: result.deletions });
      setError('');
    } catch (cause) {
      setBlocks(null);
      setError(cause instanceof Error ? cause.message : 'Unable to compare these inputs.');
    }
  };

  return (
    <div className="w-full space-y-6">
      <div className="p-4 rounded-2xl bg-white border border-stone-200/90 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2 min-w-0">
          <GitCompare size={16} className="text-orange-600" />
          <span className="text-xs font-semibold text-stone-900">Comparison scope:</span>
          <div className="flex items-center gap-1 p-1 bg-stone-100 rounded-xl">
            {(['lines', 'words', 'chars'] as const).map((mode) => (
              <button key={mode} type="button" onClick={() => setGranularity(mode)} className={`px-3 py-1 text-xs font-mono font-medium rounded-lg capitalize ${granularity === mode ? 'bg-white text-orange-600 shadow-xs font-semibold' : 'text-stone-500 hover:text-stone-800'}`}>
                {mode === 'chars' ? 'characters' : mode}
              </button>
            ))}
          </div>
        </div>
        <button type="button" onClick={swapPanels} className="px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-xs font-medium text-stone-700 flex items-center gap-1.5">
          <ArrowLeftRight size={13} className="text-orange-600" />
          <span>Swap inputs</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="rounded-3xl bg-white border border-stone-200/90 overflow-hidden flex flex-col shadow-xs">
          <div className="p-3 bg-stone-50/80 border-b border-stone-100 flex items-center justify-between text-xs">
            <span className="font-semibold text-stone-900">{t('templates.compareA')}</span>
            <span className="text-[11px] font-mono text-stone-500">{Array.from(textA).length} chars</span>
          </div>
          <textarea value={textA} onChange={(e) => setTextA(e.target.value)} rows={10} className="w-full p-4 bg-transparent text-xs font-mono text-stone-800 focus:outline-none resize-y leading-relaxed" placeholder="Paste the original text here..." />
        </div>
        <div className="rounded-3xl bg-white border border-stone-200/90 overflow-hidden flex flex-col shadow-xs">
          <div className="p-3 bg-stone-50/80 border-b border-stone-100 flex items-center justify-between text-xs">
            <span className="font-semibold text-orange-600">{t('templates.compareB')}</span>
            <span className="text-[11px] font-mono text-stone-500">{Array.from(textB).length} chars</span>
          </div>
          <textarea value={textB} onChange={(e) => setTextB(e.target.value)} rows={10} className="w-full p-4 bg-transparent text-xs font-mono text-stone-800 focus:outline-none resize-y leading-relaxed" placeholder="Paste the modified text here..." />
        </div>
      </div>

      <div className="p-6 rounded-3xl bg-stone-50 border border-stone-200/90 shadow-xs space-y-3">
        <div className="flex items-center justify-between gap-3 text-xs">
          <span className="font-semibold text-stone-800">Comparison result</span>
          {blocks && <div className="flex items-center gap-3 font-mono"><span className="text-emerald-700 font-semibold">+{counts.additions} added</span><span className="text-red-600 font-semibold">-{counts.deletions} removed</span></div>}
        </div>
        {error && <p role="alert" className="text-xs text-red-600">{error}</p>}
        {!blocks && !error && <p className="text-xs text-stone-500">Run a comparison to see inserted, removed, and unchanged content.</p>}
        {blocks && (
          <pre className="p-4 rounded-2xl bg-white border border-stone-200 text-xs font-mono whitespace-pre-wrap break-words max-h-[28rem] overflow-auto">
            {blocks.map((block, index) => (
              <span key={index} className={block.type === 'added' ? 'bg-emerald-100 text-emerald-900' : block.type === 'removed' ? 'bg-red-100 text-red-900 line-through' : 'text-stone-600'}>{block.type === 'added' ? '+ ' : block.type === 'removed' ? '− ' : '  '}{block.value}</span>
            ))}
          </pre>
        )}
      </div>

      <div className="p-6 rounded-2xl bg-white border border-stone-200/90 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="flex-1 text-xs text-stone-600">{toolName} runs locally in your browser. Large comparisons are capped to keep mobile devices responsive.</p>
        <button type="button" onClick={compare} className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold shadow-sm transition-colors">
          Compare text
        </button>
      </div>
    </div>
  );
};

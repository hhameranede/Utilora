import React, { useState } from 'react';
import { Copy, Check, Trash2, Sliders, Type, AlignLeft, Hash, Clock, FileText } from 'lucide-react';
import { useI18n } from '../../i18n';
import { convertTextCase, getTextMetrics, removeDuplicateTextLines, sortTextLines } from '../../engines/local-core';

interface TemplateETextEditorProps {
  toolName: string;
  toolSlug?: string;
  defaultText?: string;
  showCaseOptions?: boolean;
  showDedupeOptions?: boolean;
  showSortOptions?: boolean;
  actionLabel?: string;
}

export const TemplateETextEditor: React.FC<TemplateETextEditorProps> = ({
  toolName,
  toolSlug = '',
  defaultText = 'UTILORA is engineered with a client-first, privacy-respecting architecture. Digital tasks are processed locally in the modern browser runtime, ensuring zero unauthorized cloud exposure and rapid execution.',
  showCaseOptions = false,
  showDedupeOptions = false,
  showSortOptions = false,
  actionLabel = 'Transform Text',
}) => {
  const { t } = useI18n();
  const [text, setText] = useState<string>(defaultText);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'editor' | 'output'>('editor');
  const [caseChoice, setCaseChoice] = useState<'upper' | 'lower' | 'title' | 'camel' | 'snake'>('title');

  // Live Unicode-aware statistics, calculated locally as the user types.
  const metrics = getTextMetrics(text);
  const stats = {
    ...metrics,
    charsWithSpaces: metrics.charactersTotal,
    charsNoSpaces: metrics.charactersWithoutSpaces,
    readTimeMin: metrics.readingTimeMinutes,
    speakTimeMin: metrics.speakingTimeMinutes,
  };
  const [sortMode, setSortMode] = useState<'alphabetical-asc' | 'alphabetical-desc' | 'numeric' | 'length' | 'reverse'>('alphabetical-asc');
  const [caseSensitive, setCaseSensitive] = useState(false);
  const [trimWhitespace, setTrimWhitespace] = useState(true);
  const [removeEmptyLines, setRemoveEmptyLines] = useState(false);
  const [resultMessage, setResultMessage] = useState('');
  const [resultError, setResultError] = useState(false);

  const handleProcess = () => {
    try {
      if (toolSlug === 'case-converter') {
        setText(convertTextCase(text, caseChoice));
        setResultMessage('Text case converted successfully.');
      } else if (toolSlug === 'duplicate-lines-remover') {
        const result = removeDuplicateTextLines(text, { caseSensitive, trimWhitespace, removeEmptyLines });
        setText(result.text);
        setResultMessage(`Removed ${result.duplicatesRemoved} duplicate lines.`);
      } else if (toolSlug === 'sort-text-lines') {
        setText(sortTextLines(text, sortMode));
        setResultMessage('Lines sorted successfully.');
      } else if (toolSlug === 'character-counter' || toolSlug === 'word-counter') {
        setResultMessage('Character statistics are live and update as you type.');
      }
      setResultError(false);
    } catch (error) {
      setResultMessage(error instanceof Error ? error.message : 'Unable to process this text.');
      setResultError(true);
    }
  };

  const handleCopy = async () => {
    if (!text) {
      setResultMessage('There is no text to copy.');
      setResultError(true);
      return;
    }
    try {
      if (!navigator.clipboard?.writeText) throw new Error('Clipboard access is unavailable in this browser.');
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setResultError(false);
      setResultMessage('Copied to clipboard.');
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
      setResultMessage('Clipboard access is blocked by this browser. Select and copy the text manually.');
      setResultError(true);
    }
  };

  const handleClear = () => {
    setText('');
  };

  return (
    <div className="w-full space-y-6">
      {/* Live Text Analytics Metrics Strip (Clean unboxed figures with subtle labels) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="p-3.5 rounded-2xl bg-white border border-stone-200/90 shadow-xs text-center">
          <span className="text-[10px] font-mono uppercase text-stone-500 tracking-wider block mb-1">
            {t('templates.words')}
          </span>
          <span className="text-xl sm:text-2xl font-bold font-mono text-orange-600">
            {stats.words.toLocaleString()}
          </span>
        </div>

        <div className="p-3.5 rounded-2xl bg-white border border-stone-200/90 shadow-xs text-center">
          <span className="text-[10px] font-mono uppercase text-stone-500 tracking-wider block mb-1">
            {t('templates.characters')}
          </span>
          <span className="text-xl sm:text-2xl font-bold font-mono text-stone-800">
            {stats.charsWithSpaces.toLocaleString()}
          </span>
        </div>

        <div className="p-3.5 rounded-2xl bg-white border border-stone-200/90 shadow-xs text-center">
          <span className="text-[10px] font-mono uppercase text-stone-500 tracking-wider block mb-1">
            No Spaces
          </span>
          <span className="text-xl sm:text-2xl font-bold font-mono text-stone-800">
            {stats.charsNoSpaces.toLocaleString()}
          </span>
        </div>

        <div className="p-3.5 rounded-2xl bg-white border border-stone-200/90 shadow-xs text-center">
          <span className="text-[10px] font-mono uppercase text-stone-500 tracking-wider block mb-1">
            {t('templates.lines')}
          </span>
          <span className="text-xl sm:text-2xl font-bold font-mono text-stone-800">
            {stats.lines.toLocaleString()}
          </span>
        </div>

        <div className="p-3.5 rounded-2xl bg-white border border-stone-200/90 shadow-xs text-center">
          <span className="text-[10px] font-mono uppercase text-stone-500 tracking-wider block mb-1">
            {t('templates.readingTime')}
          </span>
          <span className="text-xl sm:text-2xl font-bold font-mono text-stone-800">
            ~{stats.readTimeMin}m
          </span>
        </div>

        <div className="p-3.5 rounded-2xl bg-white border border-stone-200/90 shadow-xs text-center">
          <span className="text-[10px] font-mono uppercase text-stone-500 tracking-wider block mb-1">
            {t('templates.speakingTime')}
          </span>
          <span className="text-xl sm:text-2xl font-bold font-mono text-stone-800">
            ~{stats.speakTimeMin}m
          </span>
        </div>
      </div>

      {/* Optional Mode Selectors */}
      {showCaseOptions && (
        <div className="p-4 rounded-2xl bg-white border border-stone-200/90 shadow-xs flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-stone-700 mr-2">Target Case:</span>
          {(['title', 'upper', 'lower', 'camel', 'snake'] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => setCaseChoice(mode)}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono font-medium transition-colors ${
                caseChoice === mode
                  ? 'bg-orange-50 text-orange-700 border border-orange-300 font-semibold'
                  : 'text-stone-600 hover:text-stone-900 bg-stone-50 border border-stone-200 hover:border-stone-300'
              }`}
            >
              {mode === 'title' && 'Title Case'}
              {mode === 'upper' && 'UPPERCASE'}
              {mode === 'lower' && 'lowercase'}
              {mode === 'camel' && 'camelCase'}
              {mode === 'snake' && 'snake_case'}
            </button>
          ))}
        </div>
      )}

      {showDedupeOptions && (
        <div className="flex flex-wrap gap-4 p-4 rounded-2xl bg-white border border-stone-200/90 text-xs text-stone-700">
          <label className="flex items-center gap-2"><input type="checkbox" checked={caseSensitive} onChange={(e) => setCaseSensitive(e.target.checked)} /> Case-sensitive</label>
          <label className="flex items-center gap-2"><input type="checkbox" checked={trimWhitespace} onChange={(e) => setTrimWhitespace(e.target.checked)} /> Trim whitespace</label>
          <label className="flex items-center gap-2"><input type="checkbox" checked={removeEmptyLines} onChange={(e) => setRemoveEmptyLines(e.target.checked)} /> Remove empty lines</label>
        </div>
      )}

      {showSortOptions && (
        <div className="flex flex-wrap items-center gap-3 p-4 rounded-2xl bg-white border border-stone-200/90 text-xs">
          <label htmlFor="utilora-sort-mode" className="font-semibold text-stone-700">Sort mode</label>
          <select id="utilora-sort-mode" value={sortMode} onChange={(e) => setSortMode(e.target.value as typeof sortMode)} className="px-3 py-2 rounded-lg bg-stone-50 border border-stone-200 text-stone-800">
            <option value="alphabetical-asc">Alphabetical (A–Z)</option>
            <option value="alphabetical-desc">Alphabetical (Z–A)</option>
            <option value="numeric">Numeric</option>
            <option value="length">By line length</option>
            <option value="reverse">Reverse order</option>
          </select>
        </div>
      )}

      {/* Main Text Editor Surface */}
      <div className="rounded-3xl bg-white border border-stone-200/90 overflow-hidden shadow-xs">
        {/* Editor Toolbar */}
        <div className="p-3 bg-stone-50/80 border-b border-stone-100 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-stone-600">
            <AlignLeft size={15} className="text-orange-600" />
            <span className="font-semibold text-stone-900">Editor Panel</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="px-3 py-1.5 rounded-lg bg-white border border-stone-200 hover:bg-stone-50 text-xs font-medium text-stone-700 hover:text-stone-900 transition-colors flex items-center gap-1.5 shadow-2xs"
            >
              {copied ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
              <span>{copied ? t('common.copied') : t('common.copy')}</span>
            </button>

            <button
              onClick={handleClear}
              className="p-1.5 rounded-lg hover:bg-red-50 text-stone-400 hover:text-red-600 transition-colors"
              title={t('common.clear')}
            >
              <Trash2 size={15} />
            </button>
          </div>
        </div>

        {/* Textarea */}
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Paste or type your text here to analyze or transform..."
          rows={10}
          className="w-full p-5 bg-transparent text-sm sm:text-base text-stone-900 placeholder-stone-400 focus:outline-none resize-y leading-relaxed font-sans"
        />

        {/* Footer Bar */}
        <div className="p-4 bg-stone-50/60 border-t border-stone-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs text-stone-600">
            Live text analysis runs locally in your browser as you type.
          </div>
          <div className="w-full sm:w-auto flex flex-col items-end gap-2">
            {toolSlug !== 'character-counter' && toolSlug !== 'word-counter' && (
              <button type="button" onClick={handleProcess} className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold shadow-sm transition-colors">
                {actionLabel}
              </button>
            )}
            {resultMessage && <p role="status" className={`text-[11px] ${resultError ? 'text-red-600' : 'text-emerald-700'}`}>{resultMessage}</p>}
          </div>
        </div>
      </div>
    </div>
  );
};

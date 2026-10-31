import React, { useState } from 'react';
import { Code, Copy, Check, Sliders, CheckCircle2, AlertCircle, FileCode } from 'lucide-react';
import { useI18n } from '../../i18n';
import { processJson } from '../../engines/local-core';

interface TemplateGCodeEditorProps {
  toolName: string;
  toolSlug?: string;
  defaultPayload?: string;
  actionLabel?: string;
}

export const TemplateGCodeEditor: React.FC<TemplateGCodeEditorProps> = ({
  toolName,
  toolSlug = 'json-validator',
  defaultPayload = `{\n  "service": "UTILORA",\n  "version": "2.4.0",\n  "status": "operational",\n  "capabilities": [\n    "in_browser_processing",\n    "zero_cloud_storage",\n    "local_privacy"\n  ]\n}`,
  actionLabel = 'Format & Prettify JSON',
}) => {
  const { t } = useI18n();
  const [code, setCode] = useState<string>(defaultPayload);
  const [indentSize, setIndentSize] = useState<2 | 4>(2);
  const [copied, setCopied] = useState<boolean>(false);
  const [resultMessage, setResultMessage] = useState('');
  const [resultError, setResultError] = useState(false);

  const lines = code.split('\n');

  const handleProcess = () => {
    try {
      const mode = toolSlug === 'json-minifier' ? 'minify' : 'validate';
      const result = processJson(code, mode, indentSize);
      if (mode === 'minify') {
        const saved = new TextEncoder().encode(code).length - new TextEncoder().encode(result.output).length;
        setCode(result.output);
        setResultMessage(`JSON minified successfully. ${saved} bytes saved.`);
      } else {
        setResultMessage('Valid JSON. No syntax errors were found.');
      }
      setResultError(false);
    } catch (error) {
      setResultMessage(error instanceof Error ? error.message : 'Invalid JSON input.');
      setResultError(true);
    }
  };

  const handleCopy = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="w-full space-y-6">
      {/* Editor Controls Bar */}
      <div className="p-4 rounded-2xl bg-white border border-stone-200/90 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <FileCode size={16} className="text-orange-600" />
          <span className="text-xs font-semibold text-stone-900">Format Settings:</span>
          <div className="flex items-center gap-1 p-1 bg-stone-100 rounded-xl">
            <button
              onClick={() => setIndentSize(2)}
              className={`px-3 py-1 text-xs font-mono font-medium rounded-lg transition-colors ${
                indentSize === 2 ? 'bg-white text-orange-600 shadow-xs font-semibold' : 'text-stone-500 hover:text-stone-800'
              }`}
            >
              2 Spaces
            </button>
            <button
              onClick={() => setIndentSize(4)}
              className={`px-3 py-1 text-xs font-mono font-medium rounded-lg transition-colors ${
                indentSize === 4 ? 'bg-white text-orange-600 shadow-xs font-semibold' : 'text-stone-500 hover:text-stone-800'
              }`}
            >
              4 Spaces
            </button>
          </div>
        </div>

        <button
          onClick={handleCopy}
          className="px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-xs font-medium text-stone-700 transition-colors flex items-center gap-1.5"
        >
          {copied ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
          <span>{copied ? t('common.copied') : t('common.copy')}</span>
        </button>
      </div>

      {/* Editor Window with Line Numbers */}
      <div className="rounded-3xl bg-white border border-stone-200/90 overflow-hidden shadow-xs flex flex-col">
        {/* Editor Tab Bar */}
        <div className="p-3 bg-stone-50 border-b border-stone-100 flex items-center justify-between text-xs text-stone-600">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-stone-300" />
            <span className="w-2.5 h-2.5 rounded-full bg-stone-300" />
            <span className="w-2.5 h-2.5 rounded-full bg-stone-300" />
            <span className="ml-2 font-mono text-[11px] font-semibold text-stone-800">payload.json</span>
          </div>
          <span className="text-[11px] font-mono text-stone-400">{lines.length} lines</span>
        </div>

        {/* Code Canvas */}
        <div className="flex font-mono text-xs overflow-x-auto min-h-[320px] bg-white">
          {/* Line Numbers Gutter */}
          <div className="py-4 px-3 bg-stone-50/70 border-r border-stone-100 select-none text-right text-stone-400 space-y-1">
            {lines.map((_, i) => (
              <div key={i} className="h-5 leading-5 text-[11px]">
                {i + 1}
              </div>
            ))}
          </div>

          {/* Text Area */}
          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            spellCheck={false}
            className="flex-1 py-4 px-4 bg-transparent text-stone-900 focus:outline-none resize-none leading-5 text-[12px] font-mono whitespace-pre"
            rows={Math.max(12, lines.length)}
          />
        </div>

        {/* Validation / Diagnostic Bar Placeholder */}
        <div className="p-3 bg-stone-50 border-t border-stone-100 flex items-center justify-between text-[11px] text-stone-600 font-mono">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={13} className="text-orange-600" />
            <span>{resultMessage || 'Ready for local JSON validation'}</span>
          </div>
          <span className="text-stone-400">RFC 8259 Schema Target</span>
        </div>
      </div>

      {/* Action Footer */}
      <div className="p-6 rounded-2xl bg-white border border-stone-200/90 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex-1 text-xs">
          <p className="text-stone-600">Runs locally in your browser. Your JSON is not uploaded.</p>
          {resultMessage && <p role="status" className={`mt-1 ${resultError ? 'text-red-600' : 'text-emerald-700'}`}>{resultMessage}</p>}
        </div>
        <div className="w-full sm:w-auto">
          <button type="button" onClick={handleProcess} className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold shadow-sm transition-colors">
            {toolSlug === 'json-minifier' ? 'Minify JSON' : actionLabel || 'Validate JSON'}
          </button>
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { Fingerprint, Copy, Check } from 'lucide-react';
import { generateDigest, generateUuid } from '../../engines/local-core';

interface TemplateIGeneratorProps {
  toolName: string;
  type?: 'uuid' | 'hash';
}

export const TemplateIGenerator: React.FC<TemplateIGeneratorProps> = ({ toolName, type = 'uuid' }) => {
  const [count, setCount] = useState<number>(5);
  const [version, setVersion] = useState<'v4' | 'v7'>('v4');
  const [uppercase, setUppercase] = useState<boolean>(false);
  const [algorithm, setAlgorithm] = useState<'SHA-256' | 'SHA-384' | 'SHA-512'>('SHA-256');
  const [hashInput, setHashInput] = useState('');
  const [results, setResults] = useState<string[]>([]);
  const [resultMessage, setResultMessage] = useState('');
  const [resultError, setResultError] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [copiedAll, setCopiedAll] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {
    setIsGenerating(true);
    setResultMessage('');
    setResultError(false);
    try {
      if (type === 'uuid') {
        const values = Array.from({ length: count }, () => {
          const value = generateUuid(version);
          return uppercase ? value.toUpperCase() : value;
        });
        setResults(values);
        setResultMessage(`Generated ${values.length} cryptographically random UUID ${version.toUpperCase()} value(s).`);
      } else {
        const value = await generateDigest(hashInput, algorithm);
        setResults([`${algorithm}: ${uppercase ? value.toUpperCase() : value}`]);
        setResultMessage(`${algorithm} digest generated locally.`);
      }
    } catch (error) {
      setResults([]);
      setResultMessage(error instanceof Error ? error.message : 'Generation failed.');
      setResultError(true);
    } finally {
      setIsGenerating(false);
    }
  };

  const copyValue = async (value: string, index: number) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedIndex(index);
      window.setTimeout(() => setCopiedIndex(null), 1500);
    } catch {
      setResultMessage('Clipboard access is blocked by this browser. Select and copy the value manually.');
      setResultError(true);
    }
  };

  const copyAll = async () => {
    try {
      await navigator.clipboard.writeText(results.join('\n'));
      setCopiedAll(true);
      window.setTimeout(() => setCopiedAll(false), 1500);
    } catch {
      setResultMessage('Clipboard access is blocked by this browser. Select and copy the values manually.');
      setResultError(true);
    }
  };

  return (
    <div className="w-full space-y-6">
      <div className="p-5 rounded-3xl bg-white border border-stone-200/90 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-stone-100">
          <div className="flex items-center gap-2">
            <Fingerprint size={18} className="text-orange-600" />
            <h3 className="text-sm font-semibold text-stone-900">{toolName}</h3>
          </div>
          {results.length > 0 && (
            <button type="button" onClick={copyAll} className="px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-xs font-medium text-stone-700 transition-colors flex items-center gap-1.5">
              {copiedAll ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
              <span>{copiedAll ? 'Copied' : 'Copy all results'}</span>
            </button>
          )}
        </div>

        {type === 'uuid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="text-stone-700 font-medium block mb-1.5">Batch quantity</label>
              <div className="grid grid-cols-4 gap-1 p-1 bg-stone-100 rounded-xl">
                {[1, 5, 10, 20].map((num) => (
                  <button key={num} type="button" onClick={() => setCount(num)} className={`py-1 text-xs font-mono rounded-lg transition-colors ${count === num ? 'bg-white text-orange-600 shadow-xs font-semibold' : 'text-stone-500 hover:text-stone-800'}`}>
                    {num}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-stone-700 font-medium block mb-1.5">UUID standard</label>
              <div className="grid grid-cols-2 gap-1 p-1 bg-stone-100 rounded-xl">
                <button type="button" onClick={() => setVersion('v4')} className={`py-1 text-xs font-mono rounded-lg ${version === 'v4' ? 'bg-white text-orange-600 shadow-xs font-semibold' : 'text-stone-500'}`}>v4 Random</button>
                <button type="button" onClick={() => setVersion('v7')} className={`py-1 text-xs font-mono rounded-lg ${version === 'v7' ? 'bg-white text-orange-600 shadow-xs font-semibold' : 'text-stone-500'}`}>v7 Time-based</button>
              </div>
            </div>
            <div className="flex flex-col justify-end">
              <label className="flex items-center justify-between gap-2 py-2 px-3 bg-stone-50 rounded-xl border border-stone-200 text-stone-700">
                <span>Uppercase</span>
                <input type="checkbox" checked={uppercase} onChange={(e) => setUppercase(e.target.checked)} />
              </label>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <label htmlFor="utilora-hash-input" className="block text-xs font-semibold text-stone-700">Text to hash</label>
            <textarea id="utilora-hash-input" value={hashInput} onChange={(e) => setHashInput(e.target.value)} rows={5} className="w-full p-4 rounded-xl bg-stone-50 border border-stone-200 text-xs font-mono text-stone-900 focus:outline-none focus:border-orange-500" placeholder="Type or paste the text you want to hash..." />
            <div className="flex flex-wrap items-center gap-3">
              <label htmlFor="utilora-hash-algorithm" className="text-xs font-semibold text-stone-700">Algorithm</label>
              <select id="utilora-hash-algorithm" value={algorithm} onChange={(e) => setAlgorithm(e.target.value as typeof algorithm)} className="px-3 py-2 rounded-lg bg-stone-50 border border-stone-200 text-xs text-stone-800">
                <option value="SHA-256">SHA-256</option>
                <option value="SHA-384">SHA-384</option>
                <option value="SHA-512">SHA-512</option>
              </select>
              <label className="flex items-center gap-2 text-xs text-stone-700"><input type="checkbox" checked={uppercase} onChange={(e) => setUppercase(e.target.checked)} /> Uppercase output</label>
            </div>
          </div>
        )}
      </div>

      <div className="rounded-3xl bg-stone-50 border border-stone-200/90 shadow-xs p-5 space-y-3">
        <div className="flex justify-between items-center text-xs font-mono text-stone-500">
          <span>GENERATED RESULTS ({results.length})</span>
          <span>{type === 'uuid' ? 'Web Crypto random source' : 'Web Crypto digest'}</span>
        </div>
        {results.length === 0 ? (
          <p className="p-5 rounded-xl bg-white border border-dashed border-stone-300 text-center text-xs text-stone-500">Your results will appear here after generation.</p>
        ) : (
          <div className="space-y-1.5">
            {results.map((value, index) => (
              <div key={index} className="p-3 rounded-xl bg-white border border-stone-200/80 flex items-center justify-between gap-3 font-mono text-xs text-stone-900">
                <div className="flex items-center gap-3 min-w-0">
                  <span className="text-[10px] text-stone-400 w-5 text-right">{index + 1}</span>
                  <span className="break-all select-all">{value}</span>
                </div>
                <button type="button" onClick={() => copyValue(value, index)} className="p-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-500 shrink-0" title="Copy value">
                  {copiedIndex === index ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="p-6 rounded-2xl bg-white border border-stone-200/90 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex-1 text-xs">
          <p className="text-stone-600">All calculations happen locally in this browser. No input is uploaded.</p>
          {resultMessage && <p role="status" className={`mt-1 ${resultError ? 'text-red-600' : 'text-emerald-700'}`}>{resultMessage}</p>}
        </div>
        <button type="button" disabled={isGenerating} onClick={handleGenerate} className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 disabled:opacity-50 text-white text-xs font-semibold shadow-sm transition-colors">
          {isGenerating ? 'Generating…' : type === 'uuid' ? 'Generate UUIDs' : 'Generate Hash'}
        </button>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { AlertCircle, LoaderCircle, Network, RefreshCw } from 'lucide-react';
import { lookupDnsRecords, type DnsRecord, type DnsRecordType } from '../../engines/diagnostics/browser';

const RECORD_TYPES: DnsRecordType[] = ['A', 'AAAA', 'CNAME', 'MX', 'TXT', 'NS', 'SOA'];

export const TemplateKDnsLookup: React.FC<{ toolName: string }> = ({ toolName }) => {
  const [domain, setDomain] = useState('example.com');
  const [selectedTypes, setSelectedTypes] = useState<DnsRecordType[]>(RECORD_TYPES);
  const [records, setRecords] = useState<DnsRecord[]>([]);
  const [partialErrors, setPartialErrors] = useState<Array<{ type: DnsRecordType; message: string }>>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [hasRun, setHasRun] = useState(false);

  const toggleType = (type: DnsRecordType) => {
    setSelectedTypes((current) => current.includes(type)
      ? current.filter((item) => item !== type)
      : [...current, type]);
  };

  const runLookup = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setBusy(true);
    setError('');
    setRecords([]);
    setPartialErrors([]);
    setHasRun(false);
    try {
      const result = await lookupDnsRecords(domain, selectedTypes);
      setRecords(result.records);
      setPartialErrors(result.errors);
      setHasRun(true);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'The DNS lookup could not be completed.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="w-full space-y-5">
      <form onSubmit={runLookup} className="p-5 sm:p-6 rounded-2xl bg-white border border-stone-200 shadow-xs space-y-4">
        <label htmlFor="dns-domain" className="text-xs font-semibold text-stone-900 block">Domain or hostname</label>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Network size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
            <input id="dns-domain" value={domain} onChange={(event) => setDomain(event.target.value)} placeholder="example.com" spellCheck={false} className="w-full pl-10 pr-4 py-3 rounded-xl bg-stone-50 border border-stone-200 text-sm font-mono text-stone-900 focus:outline-none focus:border-amber-500" />
          </div>
          <button type="submit" disabled={busy || !domain.trim() || selectedTypes.length === 0} className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-stone-900 text-white text-xs font-semibold hover:bg-stone-800 disabled:opacity-50">
            {busy ? <LoaderCircle size={15} className="animate-spin" /> : <RefreshCw size={15} />}
            {busy ? 'Querying DNS…' : 'Look up records'}
          </button>
        </div>
        <div className="pt-3 border-t border-stone-100 space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-[11px] font-semibold text-stone-700">Record types</span>
            <button type="button" onClick={() => setSelectedTypes(selectedTypes.length === RECORD_TYPES.length ? [] : RECORD_TYPES)} className="text-[11px] text-amber-700 hover:text-amber-900">{selectedTypes.length === RECORD_TYPES.length ? 'Clear all' : 'Select all'}</button>
          </div>
          <div className="flex flex-wrap gap-2">
            {RECORD_TYPES.map((type) => {
              const active = selectedTypes.includes(type);
              return <button key={type} type="button" aria-pressed={active} onClick={() => toggleType(type)} className={'px-3 py-1.5 rounded-lg border text-[11px] font-mono font-semibold transition-colors ' + (active ? 'bg-amber-50 text-amber-800 border-amber-300' : 'bg-white text-stone-500 border-stone-200 hover:border-stone-400')}>{type}</button>;
            })}
          </div>
        </div>
        <p className="text-[11px] text-stone-500">Queries use UTILORA’s same-origin lookup endpoint backed by Cloudflare DNS-over-HTTPS. The resolver may return cached answers and TTL values.</p>
      </form>

      {error && <div role="alert" className="p-4 rounded-xl border border-red-200 bg-red-50 text-xs text-red-800 flex gap-2"><AlertCircle size={15} className="shrink-0 mt-0.5" />{error}</div>}

      {hasRun && partialErrors.length > 0 && (
        <div role="status" className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-xs text-amber-900">
          <p className="font-semibold">Some record types could not be queried. Successful results are shown below.</p>
          <ul className="mt-2 list-disc pl-5 space-y-1">
            {partialErrors.map((item) => <li key={item.type}><span className="font-mono font-semibold">{item.type}</span>: {item.message}</li>)}
          </ul>
        </div>
      )}

      {hasRun && (
        <section className="rounded-2xl bg-white border border-stone-200 shadow-xs overflow-hidden">
          <div role="status" className="p-4 bg-stone-50 border-b border-stone-100 flex flex-wrap items-center justify-between gap-2 text-xs">
            <span className="font-semibold text-stone-900">DNS results for <span className="font-mono">{domain.trim()}</span></span>
            <span className="text-stone-500">{records.length} record(s) returned</span>
          </div>
          {records.length === 0 ? (
            <div className="p-8 text-center"><Network size={22} className="mx-auto text-stone-300" /><p className="mt-3 text-sm font-semibold text-stone-800">No records returned</p><p className="mt-1 text-xs text-stone-500">The selected record types may not exist for this domain.</p></div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[620px] text-left text-xs">
                <thead className="bg-stone-50/70 text-stone-500 border-b border-stone-100 text-[10px] uppercase tracking-wide"><tr><th className="py-3 px-4">Type</th><th className="py-3 px-4">Name</th><th className="py-3 px-4">Value / target</th><th className="py-3 px-4">TTL</th><th className="py-3 px-4">Priority</th></tr></thead>
                <tbody className="divide-y divide-stone-100">
                  {records.map((record, index) => <tr key={record.type + record.name + record.value + index} className="hover:bg-stone-50/60"><td className="py-3 px-4 font-mono font-bold text-amber-700">{record.type}</td><td className="py-3 px-4 font-mono text-stone-600">{record.name}</td><td className="py-3 px-4 font-mono text-stone-900 break-all">{record.value}</td><td className="py-3 px-4 font-mono text-stone-500">{record.ttl}s</td><td className="py-3 px-4 font-mono text-stone-500">{record.priority ?? '—'}</td></tr>)}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}
    </div>
  );
};

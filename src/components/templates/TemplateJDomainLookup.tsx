import React, { useState } from 'react';
import { AlertCircle, CalendarDays, Globe2, LoaderCircle, RefreshCw, Server, ShieldCheck } from 'lucide-react';
import { lookupDomainRdap, type RdapDomainResult } from '../../engines/diagnostics/browser';

interface TemplateJDomainLookupProps {
  toolName: string;
  toolSlug: string;
}

export const TemplateJDomainLookup: React.FC<TemplateJDomainLookupProps> = ({ toolName, toolSlug }) => {
  const isAgeChecker = toolSlug === 'domain-age-checker';
  const [domain, setDomain] = useState('example.com');
  const [result, setResult] = useState<RdapDomainResult | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const runLookup = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setBusy(true);
    setError('');
    setResult(null);
    try {
      setResult(await lookupDomainRdap(domain));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'The registry lookup could not be completed.');
    } finally {
      setBusy(false);
    }
  };

  const formatDate = (value: string | null) => value
    ? new Date(value).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })
    : 'Not disclosed by registry';
  const ageText = result?.ageDays === null || result?.ageDays === undefined
    ? 'Not disclosed'
    : (result.ageYears || 0) + ' years · ' + result.ageDays.toLocaleString() + ' days';

  return (
    <div className="w-full space-y-5">
      <form onSubmit={runLookup} className="p-5 sm:p-6 rounded-2xl bg-white border border-stone-200 shadow-xs space-y-3">
        <label htmlFor="rdap-domain" className="text-xs font-semibold text-stone-900 block">Domain name</label>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Globe2 size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              id="rdap-domain"
              value={domain}
              onChange={(event) => setDomain(event.target.value)}
              placeholder="example.com"
              autoComplete="url"
              spellCheck={false}
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-stone-50 border border-stone-200 text-sm font-mono text-stone-900 focus:outline-none focus:border-amber-500"
            />
          </div>
          <button type="submit" disabled={busy || !domain.trim()} className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-stone-900 text-white text-xs font-semibold hover:bg-stone-800 disabled:opacity-50">
            {busy ? <LoaderCircle size={15} className="animate-spin" /> : <RefreshCw size={15} />}
            {busy ? 'Looking up…' : isAgeChecker ? 'Check domain age' : 'Query RDAP'}
          </button>
        </div>
        <p className="text-[11px] text-stone-500">Uses public RDAP registration data. Some registries redact dates or contact details.</p>
      </form>

      {error && <div role="alert" className="p-4 rounded-xl border border-red-200 bg-red-50 text-xs text-red-800 flex gap-2"><AlertCircle size={15} className="shrink-0 mt-0.5" />{error}</div>}

      {result && (
        <div className="space-y-4">
          <div role="status" className="flex flex-wrap items-center justify-between gap-2 px-1 text-xs">
            <span className="font-semibold text-stone-900">Live registry result for <span className="font-mono">{result.domain}</span></span>
            <span className="text-stone-500">Source: RDAP</span>
          </div>

          {isAgeChecker ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
              <Metric label="Registration date" value={formatDate(result.createdAt)} icon={<CalendarDays size={15} />} />
              <Metric label="Domain age" value={ageText} icon={<RefreshCw size={15} />} />
              <Metric label="Expiration date" value={formatDate(result.expiresAt)} icon={<CalendarDays size={15} />} />
              <Metric label="Registrar" value={result.registrar || 'Not disclosed'} icon={<ShieldCheck size={15} />} />
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
              <Metric label="Domain handle" value={result.handle || 'Not disclosed'} icon={<Globe2 size={15} />} />
              <Metric label="Registrar" value={result.registrar || 'Not disclosed'} icon={<ShieldCheck size={15} />} />
              <Metric label="Last updated" value={formatDate(result.updatedAt)} icon={<CalendarDays size={15} />} />
            </div>
          )}

          {result.status.length > 0 && (
            <section className="p-4 rounded-2xl bg-white border border-stone-200 shadow-xs space-y-2">
              <h3 className="text-xs font-semibold text-stone-900">Registry status</h3>
              <div className="flex flex-wrap gap-2">{result.status.map((item) => <span key={item} className="px-2.5 py-1 rounded-lg border border-stone-200 bg-stone-50 text-[11px] font-mono text-stone-700">{item}</span>)}</div>
            </section>
          )}

          {result.nameservers.length > 0 && (
            <section className="p-4 rounded-2xl bg-white border border-stone-200 shadow-xs space-y-3">
              <h3 className="text-xs font-semibold text-stone-900 flex items-center gap-2"><Server size={15} className="text-amber-600" />Authoritative nameservers</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">{result.nameservers.map((server) => <div key={server} className="p-3 rounded-xl bg-stone-50 border border-stone-100 text-xs font-mono text-stone-700 break-all">{server}</div>)}</div>
            </section>
          )}

          {!isAgeChecker && (
            <section className="p-4 rounded-2xl bg-white border border-stone-200 shadow-xs space-y-3">
              <h3 className="text-xs font-semibold text-stone-900">Registration events</h3>
              {result.events.length === 0 ? <p className="text-xs text-stone-500">The registry did not publish event dates.</p> : (
                <div className="divide-y divide-stone-100">
                  {result.events.map((event, index) => <div key={event.eventAction + event.eventDate + index} className="py-2.5 flex flex-wrap items-center justify-between gap-2 text-xs"><span className="text-stone-600 capitalize">{event.eventAction}</span><span className="font-mono text-stone-900">{formatDate(event.eventDate)}</span></div>)}
                </div>
              )}
            </section>
          )}

          <p className="text-[11px] text-stone-500">RDAP data depends on the domain registry and may omit privacy-protected or unavailable fields. UTILORA does not invent missing dates.</p>
        </div>
      )}
    </div>
  );
};

const Metric: React.FC<{ label: string; value: string; icon: React.ReactNode }> = ({ label, value, icon }) => (
  <div className="min-w-0 p-4 rounded-2xl bg-white border border-stone-200 shadow-xs">
    <div className="flex items-center gap-2 text-stone-500 text-[11px] mb-2">{icon}<span>{label}</span></div>
    <div className="text-sm font-semibold text-stone-900 break-words">{value}</div>
  </div>
);

import React, { useState } from 'react';
import { Activity, AlertCircle, ArrowUpRight, CheckCircle2, Clock3, Globe2, LoaderCircle, RefreshCw, ShieldCheck } from 'lucide-react';
import { checkHttpHeaders, checkWebsiteStatus, type HttpHeadersResult, type WebsiteStatusResult } from '../../engines/diagnostics/browser';

interface TemplateLWebsiteDiagnosticsProps {
  toolName: string;
  toolSlug: string;
}

export const TemplateLWebsiteDiagnostics: React.FC<TemplateLWebsiteDiagnosticsProps> = ({ toolName, toolSlug }) => {
  const isHeadersChecker = toolSlug === 'http-headers-checker';
  const [url, setUrl] = useState('https://example.com');
  const [status, setStatus] = useState<WebsiteStatusResult | null>(null);
  const [headers, setHeaders] = useState<HttpHeadersResult | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const runProbe = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setBusy(true);
    setError('');
    setStatus(null);
    setHeaders(null);
    try {
      if (isHeadersChecker) setHeaders(await checkHttpHeaders(url));
      else setStatus(await checkWebsiteStatus(url));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'The website check could not be completed.');
    } finally {
      setBusy(false);
    }
  };

  const securityItems = headers ? [
    { label: 'Strict-Transport-Security', detected: headers.securityAudit.hasHsts },
    { label: 'Content-Security-Policy', detected: headers.securityAudit.hasCsp },
    { label: 'X-Content-Type-Options', detected: headers.securityAudit.hasXContentTypeOptions },
    { label: 'X-Frame-Options', detected: headers.securityAudit.hasXFrameOptions },
  ] : [];

  return (
    <div className="w-full space-y-5">
      <form onSubmit={runProbe} className="p-5 sm:p-6 rounded-2xl bg-white border border-stone-200 shadow-xs space-y-3">
        <label htmlFor="diagnostic-url" className="text-xs font-semibold text-stone-900 block">Public website URL</label>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Globe2 size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
            <input id="diagnostic-url" value={url} onChange={(event) => setUrl(event.target.value)} placeholder="https://example.com" spellCheck={false} className="w-full pl-10 pr-4 py-3 rounded-xl bg-stone-50 border border-stone-200 text-sm font-mono text-stone-900 focus:outline-none focus:border-amber-500" />
          </div>
          <button type="submit" disabled={busy || !url.trim()} className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-stone-900 text-white text-xs font-semibold hover:bg-stone-800 disabled:opacity-50">
            {busy ? <LoaderCircle size={15} className="animate-spin" /> : <Activity size={15} />}
            {busy ? 'Checking…' : isHeadersChecker ? 'Inspect headers' : 'Check website'}
          </button>
        </div>
        <p className="text-[11px] text-stone-500">Sends a credential-free HEAD request from your browser after checking public DNS addresses. Redirects are not followed.</p>
      </form>

      {error && <div role="alert" className="p-4 rounded-xl border border-red-200 bg-red-50 text-xs text-red-800 flex gap-2"><AlertCircle size={15} className="shrink-0 mt-0.5" />{error}</div>}

      {status && (
        <section className="space-y-3">
          <div role="status" className="flex flex-wrap items-center justify-between gap-2 px-1 text-xs">
            <span className="font-semibold text-stone-900">Website response</span>
            <span className="text-stone-500 font-mono break-all">{status.url}</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Metric label="HTTP result" value={status.statusCode === null ? 'Redirect detected' : 'HTTP ' + status.statusCode} icon={<CheckCircle2 size={15} />} />
            <Metric label="Response time" value={status.responseTimeMs + ' ms'} icon={<Clock3 size={15} />} />
            <Metric label="Resolved public IP" value={status.ipAddress || 'Not available'} icon={<Globe2 size={15} />} />
          </div>
          <div className="p-4 rounded-2xl bg-white border border-stone-200 shadow-xs text-xs text-stone-700">
            <span className="font-semibold text-stone-900">{status.isUp ? 'The server responded' : 'No HTTP response'}</span>
            <span className="mx-2 text-stone-300">·</span>{status.statusText}
          </div>
          {status.redirected && <p className="text-[11px] text-amber-800 bg-amber-50 border border-amber-200 rounded-xl p-3">A redirect was detected but not followed for safety. Enter the destination URL directly to check it.</p>}
        </section>
      )}

      {headers && (
        <section className="space-y-4">
          <div role="status" className="flex flex-wrap items-center justify-between gap-2 px-1 text-xs">
            <span className="font-semibold text-stone-900">Observed HTTP response</span>
            <span className="text-stone-500 font-mono">HTTP {headers.statusCode === null ? 'redirect' : headers.statusCode} · {headers.responseTimeMs} ms</span>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-stone-200 shadow-xs space-y-3">
            <h3 className="text-xs font-semibold text-stone-900 flex items-center gap-2"><ShieldCheck size={15} className="text-amber-600" />Security headers visible to this browser</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {securityItems.map((item) => <div key={item.label} className="flex items-center justify-between gap-3 p-3 rounded-xl bg-stone-50 border border-stone-100 text-xs"><span className="font-mono text-stone-700 break-all">{item.label}</span><span className={item.detected ? 'text-amber-800 font-semibold' : 'text-stone-500'}>{item.detected ? 'Seen' : 'Not visible'}</span></div>)}
            </div>
            {headers.corsLimited && <p className="text-[11px] leading-relaxed text-amber-800 bg-amber-50 border border-amber-200 rounded-xl p-3">CORS limits which headers this browser can read. “Not visible” does not prove a security header is absent; the server may simply not expose it to cross-origin requests.</p>}
          </div>

          <div className="rounded-2xl bg-white border border-stone-200 shadow-xs overflow-hidden">
            <div className="p-4 bg-stone-50 border-b border-stone-100 flex items-center justify-between gap-2 text-xs"><span className="font-semibold text-stone-900">Readable response headers</span><span className="text-stone-500">{Object.keys(headers.headers).length} exposed</span></div>
            {Object.keys(headers.headers).length === 0 ? <p className="p-6 text-xs text-stone-500 text-center">No response headers were exposed to this browser.</p> : (
              <div className="divide-y divide-stone-100">
                {Object.entries(headers.headers).sort(([a], [b]) => a.localeCompare(b)).map(([name, value]) => <div key={name} className="p-3 sm:px-4 flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-4 text-xs"><span className="sm:w-56 shrink-0 font-mono font-semibold text-amber-800 break-all">{name}</span><span className="font-mono text-stone-700 break-all">{value}</span></div>)}
              </div>
            )}
          </div>
          {headers.redirected && <p className="text-[11px] text-amber-800 bg-amber-50 border border-amber-200 rounded-xl p-3">A redirect was detected but not followed. Header results are for the original URL only.</p>}
        </section>
      )}

      <p className="text-[11px] leading-relaxed text-stone-500">Browser security rules limit cross-origin access. If a website does not allow CORS, UTILORA reports that the result is unknown rather than incorrectly marking the site offline. Only HEAD requests are sent; no page body or cookies are collected.</p>
    </div>
  );
};

const Metric: React.FC<{ label: string; value: string; icon: React.ReactNode }> = ({ label, value, icon }) => (
  <div className="min-w-0 p-4 rounded-2xl bg-white border border-stone-200 shadow-xs">
    <div className="flex items-center gap-2 text-stone-500 text-[11px] mb-2">{icon}<span>{label}</span></div>
    <div className="text-sm font-semibold text-stone-900 break-words">{value}</div>
  </div>
);

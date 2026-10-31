import React, { useState } from 'react';
import { Activity, ShieldCheck, Lock, ArrowRight, Server, Clock, Sliders } from 'lucide-react';
import { useI18n } from '../../i18n';
import { DisabledAction } from '../common/DisabledAction';

export const TemplateLWebsiteDiagnostics: React.FC<{ toolName: string }> = ({ toolName }) => {
  const { t } = useI18n();
  const [url, setUrl] = useState<string>('https://example.com');

  const sampleHeaders = [
    { name: 'content-type', value: 'text/html; charset=UTF-8' },
    { name: 'strict-transport-security', value: 'max-age=31536000; includeSubDomains' },
    { name: 'content-security-policy', value: "default-src 'self'; script-src 'self'" },
    { name: 'x-content-type-options', value: 'nosniff' },
    { name: 'x-frame-options', value: 'DENY' },
    { name: 'server', value: 'cloudflare' },
  ];

  return (
    <div className="w-full space-y-6">
      {/* URL Input Form */}
      <div className="p-5 sm:p-6 rounded-3xl bg-white border border-stone-200/90 shadow-xs space-y-3">
        <label className="text-xs font-semibold text-stone-900 block">
          Target Web Address
        </label>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-emerald-600" />
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com"
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-xs sm:text-sm font-mono text-stone-900 placeholder-stone-400 focus:outline-none focus:border-orange-500 focus:bg-white transition-colors"
            />
          </div>
          <DisabledAction label="Send Diagnostic Probe" size="md" />
        </div>
      </div>

      {/* Metrics Cards Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-stone-200/90 shadow-xs">
          <span className="text-[10px] font-mono uppercase text-stone-500 block mb-1">Status Code</span>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span className="text-base font-bold font-mono text-stone-900">200 OK</span>
          </div>
          <span className="text-[11px] text-stone-500 mt-1 block">Live & Accessible</span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-stone-200/90 shadow-xs">
          <span className="text-[10px] font-mono uppercase text-stone-500 block mb-1">Response Latency</span>
          <div className="text-base font-bold font-mono text-orange-600">48 ms</div>
          <span className="text-[11px] text-stone-500 mt-1 block">Edge CDN Cached</span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-stone-200/90 shadow-xs">
          <span className="text-[10px] font-mono uppercase text-stone-500 block mb-1">Security Score</span>
          <div className="text-base font-bold font-mono text-emerald-700">A+ Grade</div>
          <span className="text-[11px] text-stone-500 mt-1 block">HSTS & CSP Enforced</span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-stone-200/90 shadow-xs">
          <span className="text-[10px] font-mono uppercase text-stone-500 block mb-1">Protocol</span>
          <div className="text-base font-bold font-mono text-stone-900">HTTP/3 (QUIC)</div>
          <span className="text-[11px] text-stone-500 mt-1 block">TLS 1.3 Cipher</span>
        </div>
      </div>

      {/* Redirect Chain Visualization Placeholder */}
      <div className="p-5 rounded-2xl bg-white border border-stone-200/90 shadow-xs space-y-3">
        <span className="text-xs font-semibold text-stone-900 block">Redirect Flow (Sample State)</span>
        <div className="flex items-center gap-2 text-xs font-mono flex-wrap">
          <span className="px-2.5 py-1 rounded bg-stone-50 border border-stone-200 text-stone-600">
            http://example.com (301)
          </span>
          <ArrowRight size={13} className="text-stone-400" />
          <span className="px-2.5 py-1 rounded bg-emerald-50 border border-emerald-200 text-emerald-700 font-semibold">
            https://example.com (200)
          </span>
        </div>
      </div>

      {/* Response Headers Table */}
      <div className="rounded-3xl bg-white border border-stone-200/90 overflow-hidden shadow-xs">
        <div className="p-4 bg-stone-50 border-b border-stone-100 flex items-center justify-between text-xs">
          <span className="font-semibold text-stone-900">HTTP Response Headers (Sample Schema)</span>
          <span className="text-[11px] font-mono text-stone-400">6 Headers Cached</span>
        </div>

        <div className="divide-y divide-stone-100 text-xs font-mono">
          {sampleHeaders.map((hdr, i) => (
            <div key={i} className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-stone-50/50">
              <span className="text-orange-600 font-semibold">{hdr.name}</span>
              <span className="text-stone-800 max-w-xl truncate">{hdr.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

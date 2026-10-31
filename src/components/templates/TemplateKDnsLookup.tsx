import React, { useState } from 'react';
import { Network, Search, Filter, ShieldCheck, Check } from 'lucide-react';
import { useI18n } from '../../i18n';
import { DisabledAction } from '../common/DisabledAction';

const RECORD_TYPES = ['ALL', 'A', 'AAAA', 'CNAME', 'MX', 'TXT', 'NS', 'SOA'] as const;

interface DnsRecordRow {
  type: string;
  name: string;
  value: string;
  ttl: number;
  priority?: number;
}

export const TemplateKDnsLookup: React.FC<{ toolName: string }> = ({ toolName }) => {
  const { t } = useI18n();
  const [domain, setDomain] = useState<string>('utilora.com');
  const [selectedType, setSelectedType] = useState<string>('ALL');

  // Sample structured DNS records
  const sampleRecords: DnsRecordRow[] = [
    { type: 'A', name: 'utilora.com', value: '104.21.54.89', ttl: 300 },
    { type: 'A', name: 'utilora.com', value: '172.67.182.140', ttl: 300 },
    { type: 'AAAA', name: 'utilora.com', value: '2606:4700:3033::6815:3659', ttl: 300 },
    { type: 'MX', name: 'utilora.com', value: 'mail.protection.outlook.com', ttl: 3600, priority: 10 },
    { type: 'TXT', name: 'utilora.com', value: 'v=spf1 include:spf.protection.outlook.com -all', ttl: 3600 },
    { type: 'NS', name: 'utilora.com', value: 'ns1.cloudflare.com', ttl: 86400 },
    { type: 'NS', name: 'utilora.com', value: 'ns2.cloudflare.com', ttl: 86400 },
  ];

  const filtered = selectedType === 'ALL'
    ? sampleRecords
    : sampleRecords.filter((r) => r.type === selectedType);

  return (
    <div className="w-full space-y-6">
      {/* Search Input Bar */}
      <div className="p-5 sm:p-6 rounded-3xl bg-white border border-stone-200/90 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Network size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              placeholder="Enter domain or hostname (e.g. cloudflare.com)"
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-xs sm:text-sm font-mono text-stone-900 placeholder-stone-400 focus:outline-none focus:border-orange-500 focus:bg-white transition-colors"
            />
          </div>
          <DisabledAction label="Query Authoritative DNS" size="md" />
        </div>

        {/* Record Type Filter Pills */}
        <div className="flex items-center gap-1.5 flex-wrap pt-2 border-t border-stone-100">
          <span className="text-[11px] text-stone-500 font-medium mr-1">Filter Record:</span>
          {RECORD_TYPES.map((type) => (
            <button
              key={type}
              onClick={() => setSelectedType(type)}
              className={`px-2.5 py-1 rounded-lg text-xs font-mono font-medium transition-colors ${
                selectedType === type
                  ? 'bg-orange-50 text-orange-700 border border-orange-300 font-semibold'
                  : 'text-stone-500 hover:text-stone-800 hover:bg-stone-100'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Results Table (Sample UI State) */}
      <div className="rounded-3xl bg-white border border-stone-200/90 overflow-hidden shadow-xs">
        <div className="p-4 bg-stone-50 border-b border-stone-100 flex items-center justify-between text-xs">
          <span className="font-semibold text-stone-900">
            Resolved Records (Sample UI State · {filtered.length} found)
          </span>
          <span className="text-[11px] font-mono text-orange-600 font-semibold">DoH Ready</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-stone-50/70 text-stone-500 border-b border-stone-100 text-[11px]">
              <tr>
                <th className="py-2.5 px-4">TYPE</th>
                <th className="py-2.5 px-4">NAME</th>
                <th className="py-2.5 px-4">VALUE / TARGET</th>
                <th className="py-2.5 px-4">TTL</th>
                <th className="py-2.5 px-4">PRIORITY</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 text-stone-800">
              {filtered.map((record, i) => (
                <tr key={i} className="hover:bg-stone-50/50 transition-colors">
                  <td className="py-3 px-4">
                    <span className="font-bold text-orange-600">{record.type}</span>
                  </td>
                  <td className="py-3 px-4 text-stone-600">{record.name}</td>
                  <td className="py-3 px-4 text-stone-900 max-w-md truncate font-medium">{record.value}</td>
                  <td className="py-3 px-4 text-stone-500">{record.ttl}s</td>
                  <td className="py-3 px-4 text-stone-500">{record.priority ?? '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

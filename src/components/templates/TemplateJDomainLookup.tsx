import React, { useState } from 'react';
import { Globe, Search, Calendar, Shield, Server, ExternalLink, AlertCircle } from 'lucide-react';
import { useI18n } from '../../i18n';
import { DisabledAction } from '../common/DisabledAction';

interface TemplateJDomainLookupProps {
  toolName: string;
}

export const TemplateJDomainLookup: React.FC<TemplateJDomainLookupProps> = ({ toolName }) => {
  const { t } = useI18n();
  const [domain, setDomain] = useState<string>('example.com');

  return (
    <div className="w-full space-y-6">
      {/* Search Bar Input */}
      <div className="p-5 sm:p-6 rounded-3xl bg-white border border-stone-200/90 shadow-xs space-y-3">
        <label className="text-xs font-semibold text-stone-900 block">
          Target Domain Name
        </label>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Globe size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              placeholder="example.com or sub.domain.org"
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-xs sm:text-sm font-mono text-stone-900 placeholder-stone-400 focus:outline-none focus:border-orange-500 focus:bg-white transition-colors"
            />
          </div>
          <DisabledAction label="Query RDAP Registry" size="md" />
        </div>
        <p className="text-[11px] text-stone-500">
          Enter an apex domain or subdomain without http:// or trailing slashes.
        </p>
      </div>

      {/* Result Cards Workspace (Explicitly marked as Sample/Demo UI Data) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between text-xs px-1">
          <span className="font-semibold text-stone-900">Registration Records (Sample Data)</span>
          <span className="text-[11px] font-mono text-orange-700 bg-orange-50 border border-orange-200 px-2 py-0.5 rounded font-medium">
            Preview Schema
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-white border border-stone-200/90 shadow-xs">
            <div className="flex items-center gap-2 text-stone-500 text-xs mb-1.5">
              <Calendar size={14} className="text-orange-600" />
              <span>Created</span>
            </div>
            <div className="text-sm font-mono font-semibold text-stone-900">1995-08-14</div>
            <div className="text-[11px] text-stone-500 mt-1">30+ Years Tenure</div>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-stone-200/90 shadow-xs">
            <div className="flex items-center gap-2 text-stone-500 text-xs mb-1.5">
              <Calendar size={14} className="text-orange-600" />
              <span>Expires</span>
            </div>
            <div className="text-sm font-mono font-semibold text-stone-900">2026-08-13</div>
            <div className="text-[11px] text-stone-500 mt-1">Active Registration</div>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-stone-200/90 shadow-xs">
            <div className="flex items-center gap-2 text-stone-500 text-xs mb-1.5">
              <Shield size={14} className="text-orange-600" />
              <span>Registrar</span>
            </div>
            <div className="text-sm font-mono font-semibold text-stone-900 truncate">RESERVED-Internet Assigned Numbers Authority</div>
            <div className="text-[11px] text-stone-500 mt-1">IANA ID: 376</div>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-stone-200/90 shadow-xs">
            <div className="flex items-center gap-2 text-stone-500 text-xs mb-1.5">
              <Server size={14} className="text-orange-600" />
              <span>Status</span>
            </div>
            <div className="text-sm font-mono font-semibold text-emerald-700">clientDeleteProhibited</div>
            <div className="text-[11px] text-stone-500 mt-1">Locked Registry State</div>
          </div>
        </div>

        {/* Nameservers List */}
        <div className="p-5 rounded-2xl bg-white border border-stone-200/90 shadow-xs space-y-2">
          <div className="text-xs font-semibold text-stone-900">Delegated Nameservers (Sample State)</div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono text-stone-700">
            <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-200">a.iana-servers.net</div>
            <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-200">b.iana-servers.net</div>
          </div>
        </div>
      </div>
    </div>
  );
};

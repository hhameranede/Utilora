import React from 'react';
import { LegalLayout } from './LegalLayout';
import { Shield, Zap, Lock, Cpu, Globe, CheckCircle2 } from 'lucide-react';

export const AboutPage: React.FC = () => {
  return (
    <LegalLayout
      title="About UTILORA"
      subtitle="Every Digital Task. One Place. A global utility platform engineered for speed, privacy, and zero unnecessary friction."
      routeType="about"
    >
      <div className="space-y-6">
        <h2 className="text-xl font-bold text-stone-900">Our Mission</h2>
        <p>
          UTILORA was conceived with a clear product premise: everyday digital tasks—compressing photos, merging documents, formatting JSON payloads, and inspecting network records—should be fast, beautiful, free, and respectful of user confidentiality.
        </p>
        <p>
          Too many utility websites subject visitors to invasive tracking scripts, pop-up advertising, arbitrary subscription walls, and opaque server storage. UTILORA introduces a modern, high-precision standard built on local client processing and transparent engineering.
        </p>

        <h2 className="text-xl font-bold text-stone-900 pt-4">Core Principles</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 not-prose">
          <div className="p-5 rounded-2xl bg-white border border-stone-200/90 shadow-xs space-y-2">
            <div className="flex items-center gap-2 text-orange-600 font-semibold text-xs">
              <Lock size={16} />
              <span>Client-Side Invariants</span>
            </div>
            <p className="text-xs text-stone-600 leading-relaxed">
              Whenever technologically viable, data manipulation happens in your browser runtime via WebAssembly. Your files do not live on our disks.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-stone-200/90 shadow-xs space-y-2">
            <div className="flex items-center gap-2 text-orange-600 font-semibold text-xs">
              <Zap size={16} />
              <span>Zero-Account Barrier</span>
            </div>
            <p className="text-xs text-stone-600 leading-relaxed">
              Standard utilities are freely accessible. You never have to create an account or verify an email address to format code or compress a photo.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-stone-200/90 shadow-xs space-y-2">
            <div className="flex items-center gap-2 text-orange-600 font-semibold text-xs">
              <Globe size={16} />
              <span>True Multilingual Reach</span>
            </div>
            <p className="text-xs text-stone-600 leading-relaxed">
              Engineered from the ground up for 8 international languages with complete Right-to-Left (RTL) Arabic typography and layout support.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-stone-200/90 shadow-xs space-y-2">
            <div className="flex items-center gap-2 text-orange-600 font-semibold text-xs">
              <Shield size={16} />
              <span>Ad-Free Purity</span>
            </div>
            <p className="text-xs text-stone-600 leading-relaxed">
              We reject banner bloat, telemetry trackers, and deceptive download links. The focus remains 100% on high-speed utility.
            </p>
          </div>
        </div>
      </div>
    </LegalLayout>
  );
};

import React from 'react';
import { LegalLayout } from './LegalLayout';
import { Mail, MessageSquare, Shield, Clock } from 'lucide-react';

export const ContactPage: React.FC = () => {
  return (
    <LegalLayout
      title="Contact & Technical Support"
      subtitle="Reach the UTILORA platform maintainers, submit bug reports, or discuss enterprise integration."
      routeType="contact"
    >
      <div className="space-y-6">
        <p>
          We welcome feedback from developers, designers, and webmasters worldwide. Whether you have identified an issue with a tool template or wish to propose an additional utility format, we are here to assist.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 not-prose pt-2">
          <div className="p-6 rounded-3xl bg-white border border-stone-200/90 shadow-xs space-y-3">
            <Mail size={20} className="text-orange-600" />
            <h3 className="text-sm font-semibold text-stone-900">Direct Inquiries</h3>
            <p className="text-xs text-stone-600">
              For security disclosures, partnerships, and technical questions:
            </p>
            <div className="font-mono text-xs text-orange-600 font-semibold">support@utilora.com</div>
          </div>

          <div className="p-6 rounded-3xl bg-white border border-stone-200/90 shadow-xs space-y-3">
            <MessageSquare size={20} className="text-orange-600" />
            <h3 className="text-sm font-semibold text-stone-900">Community Forum</h3>
            <p className="text-xs text-stone-600">
              Join open discussions and vote on upcoming utilities in our community section.
            </p>
            <div className="text-xs text-stone-400">Open 24/7 Globally</div>
          </div>
        </div>

        <h2 className="text-xl font-bold text-stone-900 pt-6">Security Vulnerability Disclosures</h2>
        <p>
          If you discover a potential vulnerability in our frontend sandbox or client-side parsing contracts, please email security@utilora.com with detailed reproduction steps. We will acknowledge receipt within 24 business hours.
        </p>
      </div>
    </LegalLayout>
  );
};

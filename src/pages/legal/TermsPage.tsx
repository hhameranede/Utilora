import React from 'react';
import { LegalLayout } from './LegalLayout';

export const TermsPage: React.FC = () => {
  return (
    <LegalLayout
      title="Terms of Service"
      subtitle="The terms governing the use of the UTILORA platform and its digital tool workspaces."
      routeType="terms"
    >
      <div className="space-y-6">
        <h2 className="text-xl font-bold text-stone-900">1. Acceptance of Terms</h2>
        <p>
          By accessing or using UTILORA, you acknowledge and agree to comply with these Terms of Service. If you do not agree with any part of these terms, you should discontinue use immediately.
        </p>

        <h2 className="text-xl font-bold text-stone-900 pt-4">2. Current Platform Status & Preview Mode</h2>
        <p>
          UTILORA is currently in its UI System and Frontend Foundation phase. Processing actions, engine adapters, and automated conversions are provided for visual exploration, testing, and layout demonstration. Production file processing engines are scheduled for Phase 2 integration.
        </p>

        <h2 className="text-xl font-bold text-stone-900 pt-4">3. Permitted Personal & Commercial Use</h2>
        <p>
          Subject to these terms, you are granted a non-exclusive, worldwide, royalty-free license to use the tools for personal, educational, research, and legitimate commercial workflows.
        </p>

        <h2 className="text-xl font-bold text-stone-900 pt-4">4. Disclaimer of Warranties</h2>
        <p>
          UTILORA is provided on an &ldquo;AS IS&rdquo; and &ldquo;AS AVAILABLE&rdquo; basis without warranties of any kind, whether express or implied. UTILORA disclaims all liability for data loss, system interruptions, or calculation errors arising from client-side execution.
        </p>
      </div>
    </LegalLayout>
  );
};

export const CopyrightPage: React.FC = () => {
  return (
    <LegalLayout
      title="Copyright & DMCA Policy"
      subtitle="Procedures for reporting copyright infringement and our intellectual property guidelines."
      routeType="copyright"
    >
      <div className="space-y-6">
        <h2 className="text-xl font-bold text-stone-900">1. Respect for Intellectual Property</h2>
        <p>
          UTILORA strongly respects intellectual property rights and expects its users to do the same. All platform trademarks, logo wordmarks, editorial guides, and interface code are the proprietary property of UTILORA.
        </p>

        <h2 className="text-xl font-bold text-stone-900 pt-4">2. Media Downloader Restrictions</h2>
        <p>
          Utilities such as Video Downloader are strictly engineered for direct video files and content explicitly permitted by rights holders or released under permissive public licenses. UTILORA does not circumvent technological protection measures, DRM systems, or copyright controls on platforms like YouTube or TikTok.
        </p>

        <h2 className="text-xl font-bold text-stone-900 pt-4">3. DMCA Notice Submission</h2>
        <p>
          If you believe that content hosted on our platform infringes your copyright, please forward a formal DMCA notice to dmca@utilora.com including:
        </p>
        <ul className="list-disc pl-6 space-y-2 text-xs sm:text-sm">
          <li>Identification of the copyrighted work claimed to be infringed.</li>
          <li>Identification of the material to be removed or disabled.</li>
          <li>Your contact information including legal name, address, and email.</li>
          <li>A statement of good-faith belief that use of the material is not authorized.</li>
          <li>A statement under penalty of perjury that the information in the notification is accurate.</li>
        </ul>
      </div>
    </LegalLayout>
  );
};

export const AcceptableUsePage: React.FC = () => {
  return (
    <LegalLayout
      title="Acceptable Use Policy"
      subtitle="Standards and limitations regarding legitimate, lawful interaction with our platform."
      routeType="acceptable-use"
    >
      <div className="space-y-6">
        <h2 className="text-xl font-bold text-stone-900">1. Prohibited Activities</h2>
        <p>Users of UTILORA agree not to:</p>
        <ul className="list-disc pl-6 space-y-2 text-xs sm:text-sm">
          <li>Use utilities to generate, store, or process malicious payloads, malware, or phishing schemes.</li>
          <li>Attempt denial-of-service (DoS) attacks or automated scraping of platform assets.</li>
          <li>Abuse network diagnostic tools (DNS lookup, status checker) for unauthorized network scanning or port probing.</li>
          <li>Violate any local, national, or international privacy laws or export regulations.</li>
        </ul>

        <h2 className="text-xl font-bold text-stone-900 pt-4">2. Enforcement & Termination</h2>
        <p>
          UTILORA reserves the right to rate-limit or restrict IP addresses that engage in automated abuse or violate the spirit of this policy.
        </p>
      </div>
    </LegalLayout>
  );
};

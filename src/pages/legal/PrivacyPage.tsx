import React from 'react';
import { LegalLayout } from './LegalLayout';

export const PrivacyPage: React.FC = () => {
  return (
    <LegalLayout
      title="Privacy Policy"
      subtitle="UTILORA is engineered with a strict zero-retention, client-first confidentiality model."
      routeType="privacy"
    >
      <div className="space-y-6">
        <h2 className="text-xl font-bold text-stone-900">1. Architectural Invariant: Client-Side Execution</h2>
        <p>
          Unlike conventional digital conversion portals, UTILORA is architected to perform data manipulations directly within your client browser runtime (via HTML5 Canvas, Web Audio, and WebAssembly). Your images, documents, text files, and video clips are not transmitted to or stored on our servers.
        </p>

        <h2 className="text-xl font-bold text-stone-900 pt-4">2. Zero Account Requirement</h2>
        <p>
          You are never asked to provide your name, phone number, physical address, or credit card details to use standard tools. We do not maintain user account databases for normal tool functionality.
        </p>

        <h2 className="text-xl font-bold text-stone-900 pt-4">3. Local Storage & Preferences</h2>
        <p>
          We store minimal functional state (such as your chosen language preference: English, Arabic, French, Spanish, Portuguese, Hindi, Chinese, or Bengali) inside your browser’s standard <code>localStorage</code>. This data never leaves your device.
        </p>

        <h2 className="text-xl font-bold text-stone-900 pt-4">4. No Behavioral Tracking or Third-Party Scripts</h2>
        <p>
          We do not inject third-party ad networks, cross-site trackers, or invasive telemetry cookies. Our content delivery network logs anonymous request metrics (IP addresses, user-agent strings, and requested asset paths) solely for DDoS mitigation, caching, and infrastructure stability.
        </p>
      </div>
    </LegalLayout>
  );
};

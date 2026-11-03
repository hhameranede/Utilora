import React from 'react';
import { useI18n } from '../../i18n';

interface BrandLogoProps { compact?: boolean; }

export const BrandLogo: React.FC<BrandLogoProps> = ({ compact = false }) => {
  const { t } = useI18n();
  return (
    <span className="ulx-brand-lockup" aria-label={`${t('brand.name')} — ${t('brand.slogan')}`}>
      <span className="ulx-brand-mark" aria-hidden="true">
        <svg viewBox="0 0 40 40" role="presentation">
          <rect x="1" y="1" width="38" height="38" rx="12" fill="currentColor"/>
          <path d="M12 11v11.5c0 5.1 3.1 8.5 8 8.5s8-3.4 8-8.5V11" fill="none" stroke="white" strokeWidth="4" strokeLinecap="round"/>
          <path d="m29 7 1.2 3.1 3.1 1.2-3.1 1.2L29 16l-1.2-3.5-3.1-1.2 3.1-1.2L29 7Z" fill="#fff" opacity=".92"/>
        </svg>
      </span>
      <span className="ulx-brand-type">
        <span className="ulx-brand-name">UTILORA<span>.</span></span>
        {!compact && <span className="ulx-brand-tagline">{t('brand.slogan')}</span>}
      </span>
    </span>
  );
};

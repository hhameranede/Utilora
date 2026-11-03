import React from 'react';
import { useI18n } from '../../i18n';

interface BrandLogoProps {
  compact?: boolean;
  className?: string;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({ compact = false, className = '' }) => {
  const { t } = useI18n();

  return (
    <span
      data-testid="utilora-brand-lockup"
      className={\`inline-flex items-center gap-2.5 \${className}\`}
      aria-label={\`\${t('brand.name')} — \${t('brand.slogan')}\`}
    >
      <svg
        data-testid="utilora-brand-mark"
        aria-hidden="true"
        viewBox="0 0 64 64"
        className="h-10 w-10 shrink-0 sm:h-11 sm:w-11"
      >
        <path
          d="M9 10h13v28c0 9 4.5 14 10 14s10-5 10-14V19l13-8v28C55 56 45 64 32 64S9 56 9 39V10Z"
          fill="#F47716"
        />
        <path d="M44 5 57 0 54 17 43 23Z" fill="#FF9A3D" />
      </svg>
      <span className="flex min-w-0 flex-col leading-none">
        <span className="font-[Plus_Jakarta_Sans] text-[19px] font-extrabold tracking-[0.11em] text-stone-900 sm:text-[21px]">
          UTILORA
        </span>
        {!compact && (
          <span className="mt-1 text-[9px] font-semibold tracking-[0.035em] text-stone-500 sm:text-[10px]">
            All-in-One Tools
          </span>
        )}
      </span>
    </span>
  );
};

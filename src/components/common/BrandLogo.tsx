import React from 'react';

interface BrandLogoProps {
  compact?: boolean;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({ compact = false }) => (
  <span className="inline-flex items-center gap-2.5" aria-label="UTILORA — Every Digital Task. One Place.">
    <svg aria-hidden="true" viewBox="0 0 64 64" className="h-9 w-9 sm:h-10 sm:w-10 shrink-0">
      <rect x="3" y="3" width="58" height="58" rx="17" fill="#ffffff" stroke="#e7e5e4" strokeWidth="2" />
      <rect x="10" y="10" width="44" height="44" rx="13" fill="#fafaf9" stroke="#f5f5f4" strokeWidth="1.5" />
      <path d="M21 22v13.5c0 8.1 4.8 13 11 13s11-4.9 11-13V22" fill="none" stroke="#ea580c" strokeWidth="7" strokeLinecap="square" />
      <path d="M49 9l2.2 6.1L57 17.5l-5.8 2.1L49 26l-2.1-6.4-5.9-2.1 5.9-2.4L49 9z" fill="#fb923c" />
    </svg>
    <span className="flex min-w-0 flex-col leading-none">
      <span className="text-base sm:text-lg font-extrabold tracking-[0.16em] text-stone-900">UTILORA</span>
      {!compact && <span className="mt-1 text-[9px] sm:text-[10px] font-semibold uppercase tracking-[0.13em] text-orange-700">Every Digital Task. One Place.</span>}
    </span>
  </span>
);

import React from 'react';

interface AdSlotProps {
  placementId?: string;
  enabled?: boolean; // Controlled and hidden by default
  className?: string;
}

export const AdSlot: React.FC<AdSlotProps> = ({ enabled = false, className = '' }) => {
  // Advertising is strictly disabled at this platform phase
  if (!enabled) return null;

  return (
    <div className={`p-4 rounded-xl border border-dashed border-zinc-800 bg-zinc-900/40 text-center text-[10px] text-zinc-600 ${className}`}>
      Future Ad Placement (Inactive)
    </div>
  );
};

export const AffiliateSlot: React.FC<AdSlotProps> = ({ enabled = false, className = '' }) => {
  // Affiliate scripts are strictly disabled at this platform phase
  if (!enabled) return null;

  return (
    <div className={`p-3 rounded-lg border border-dashed border-zinc-800 bg-zinc-900/30 text-center text-[10px] text-zinc-600 ${className}`}>
      Future Affiliate Placement (Inactive)
    </div>
  );
};

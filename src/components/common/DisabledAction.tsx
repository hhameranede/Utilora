import React from 'react';
import { AlertCircle, Lock, Sparkles } from 'lucide-react';
import { useI18n } from '../../i18n';

interface DisabledActionProps {
  label: string;
  icon?: React.ReactNode;
  hint?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const DisabledAction: React.FC<DisabledActionProps> = ({
  label,
  icon,
  hint,
  className = '',
  size = 'md',
}) => {
  const { t } = useI18n();

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2.5 text-xs',
    lg: 'px-6 py-3 text-sm font-semibold',
  };

  const defaultHint = t('common.previewNotice');

  return (
    <div className="flex flex-col gap-1.5">
      <button
        type="button"
        disabled
        aria-disabled="true"
        title={hint || defaultHint}
        className={`w-full flex items-center justify-center gap-2 rounded-xl bg-stone-100 border border-stone-200 text-stone-400 font-medium cursor-not-allowed select-none shadow-xs ${sizeClasses[size]} ${className}`}
      >
        {icon || <Lock size={14} className="text-orange-500/70 shrink-0" />}
        <span>{label}</span>
        <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-stone-200 border border-stone-300 text-stone-600">
          Preview
        </span>
      </button>

      <div className="flex items-center gap-1.5 text-[11px] text-stone-400 justify-center">
        <AlertCircle size={12} className="text-orange-500/80 shrink-0" />
        <span className="truncate">{hint || t('common.engineDisconnected')}</span>
      </div>
    </div>
  );
};

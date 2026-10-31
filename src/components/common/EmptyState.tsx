import React from 'react';
import { LucideIcon, Inbox, AlertTriangle, Loader2 } from 'lucide-react';

interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: LucideIcon;
  action?: React.ReactNode;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  icon: IconComponent = Inbox,
  action,
  className = '',
}) => {
  return (
    <div className={`p-8 text-center rounded-2xl border border-dashed border-stone-200 bg-white/70 ${className}`}>
      <div className="w-12 h-12 rounded-xl bg-orange-50 mx-auto mb-3 flex items-center justify-center text-orange-600">
        <IconComponent size={20} />
      </div>
      <h4 className="text-sm font-semibold text-stone-800 mb-1">{title}</h4>
      {description && <p className="text-xs text-stone-500 max-w-sm mx-auto mb-4">{description}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
};

export const LoadingState: React.FC<{ message?: string; className?: string }> = ({
  message = 'Loading...',
  className = '',
}) => {
  return (
    <div className={`flex flex-col items-center justify-center p-8 space-y-3 ${className}`}>
      <Loader2 size={24} className="animate-spin text-orange-500" />
      <span className="text-xs text-stone-500 font-medium">{message}</span>
    </div>
  );
};

export const ErrorState: React.FC<{ title: string; message?: string; onRetry?: () => void; className?: string }> = ({
  title,
  message,
  onRetry,
  className = '',
}) => {
  return (
    <div className={`p-6 rounded-2xl border border-red-200 bg-red-50/40 text-center ${className}`}>
      <AlertTriangle size={24} className="text-red-500 mx-auto mb-2" />
      <h4 className="text-sm font-semibold text-stone-900 mb-1">{title}</h4>
      {message && <p className="text-xs text-stone-600 max-w-md mx-auto mb-4">{message}</p>}
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-3 py-1.5 rounded-lg bg-stone-900 hover:bg-stone-800 text-xs font-medium text-white transition-colors"
        >
          Try Again
        </button>
      )}
    </div>
  );
};

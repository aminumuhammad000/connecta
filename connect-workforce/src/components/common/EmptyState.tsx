import React from 'react';
import { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
  secondaryActionText?: string;
  onSecondaryAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon,
  title,
  description,
  actionText,
  onAction,
  secondaryActionText,
  onSecondaryAction,
}) => {
  return (
    <div className="bg-white rounded-2xl p-12 border border-gray-200 text-center flex flex-col items-center justify-center max-w-lg mx-auto my-8">
      <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center text-gray-400 mb-4 border border-gray-200">
        <Icon className="w-8 h-8 text-primary" />
      </div>
      <h3 className="text-lg font-bold text-gray-900 mb-1">{title}</h3>
      <p className="text-xs text-gray-500 max-w-sm mb-6 leading-relaxed">{description}</p>
      <div className="flex flex-wrap items-center justify-center gap-3">
        {actionText && onAction && (
          <button
            onClick={onAction}
            className="px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-white font-bold text-xs shadow-md shadow-primary/20 transition-all"
          >
            {actionText}
          </button>
        )}
        {secondaryActionText && onSecondaryAction && (
          <button
            onClick={onSecondaryAction}
            className="px-5 py-2.5 rounded-xl border border-gray-300 hover:bg-gray-100 text-gray-700 font-semibold text-xs transition-colors"
          >
            {secondaryActionText}
          </button>
        )}
      </div>
    </div>
  );
};

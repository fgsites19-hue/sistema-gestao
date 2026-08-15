import React from 'react';
import { Save, RefreshCw } from 'lucide-react';

interface DraftIndicatorProps {
  hasDraft?: boolean;
  onClearDraft?: () => void;
  className?: string;
}

export const DraftIndicator: React.FC<DraftIndicatorProps> = ({
  hasDraft = true,
  onClearDraft,
  className = '',
}) => {
  if (!hasDraft) return null;

  return (
    <div
      className={`inline-flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400 bg-slate-100/80 dark:bg-slate-800/80 px-2 py-0.5 rounded-md border border-slate-200/60 dark:border-slate-700/60 ${className}`}
    >
      <Save className="w-3 h-3 text-indigo-500 animate-pulse" />
      <span>Rascunho salvo</span>
      {onClearDraft && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            if (confirm('Deseja limpar os dados salvos neste rascunho?')) {
              onClearDraft();
            }
          }}
          className="text-slate-400 hover:text-rose-500 ml-1 font-medium underline cursor-pointer"
          title="Limpar rascunho e resetar campos"
        >
          Limpar
        </button>
      )}
    </div>
  );
};

import React from 'react';
import { Button, ButtonProps } from './Button';
import {
  CheckSquare,
  FolderKanban,
  TrendingUp,
  Users,
  FileText,
  FileCheck,
  DollarSign,
  Repeat,
  FolderOpen,
  Search,
  Sparkles,
} from 'lucide-react';

export type EmptyStateVariant =
  | 'tasks'
  | 'projects'
  | 'leads'
  | 'clients'
  | 'proposals'
  | 'contracts'
  | 'financial'
  | 'recurring'
  | 'files'
  | 'search'
  | 'default';

interface EmptyStateProps {
  icon?: React.ReactNode;
  variant?: EmptyStateVariant;
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
  actionVariant?: ButtonProps['variant'];
  secondaryActionText?: string;
  onSecondaryAction?: () => void;
  className?: string;
}

// Vector Illustration Component tailored for Web Designers & Freelancers
const IllustrationGraphic: React.FC<{ variant: EmptyStateVariant }> = ({ variant }) => {
  switch (variant) {
    case 'tasks':
      return (
        <div className="relative w-36 h-28 mx-auto mb-4 flex items-center justify-center">
          {/* Background card backplate */}
          <div className="absolute inset-x-4 top-2 bottom-0 bg-slate-200/70 dark:bg-slate-800/80 rounded-xl transform -rotate-3 transition-transform" />
          {/* Main Card */}
          <div className="relative z-10 w-32 bg-white dark:bg-slate-900 border border-indigo-100 dark:border-indigo-900/50 rounded-xl p-3 shadow-md">
            {/* Header pill */}
            <div className="flex items-center gap-1.5 mb-2.5">
              <div className="w-4 h-4 rounded bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                <CheckSquare className="w-2.5 h-2.5" />
              </div>
              <div className="h-2 w-12 bg-slate-200 dark:bg-slate-700 rounded-full" />
            </div>
            {/* Task rows */}
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full border border-emerald-500 bg-emerald-50 dark:bg-emerald-950/50 flex items-center justify-center">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                </div>
                <div className="h-1.5 w-16 bg-slate-300 dark:bg-slate-600 rounded-full" />
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full border border-indigo-500 bg-indigo-50 dark:bg-indigo-950/50 flex items-center justify-center">
                  <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                </div>
                <div className="h-1.5 w-14 bg-slate-300 dark:bg-slate-600 rounded-full" />
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full border border-slate-300 dark:border-slate-700" />
                <div className="h-1.5 w-10 bg-slate-200 dark:bg-slate-700 rounded-full" />
              </div>
            </div>
          </div>
          {/* Floating Badge */}
          <div className="absolute -bottom-1 -right-1 z-20 bg-gradient-to-r from-indigo-600 to-violet-600 text-white p-1.5 rounded-lg shadow-md">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
        </div>
      );

    case 'projects':
      return (
        <div className="relative w-40 h-28 mx-auto mb-4 flex items-center justify-center">
          {/* Wireframe Mockup */}
          <div className="relative z-10 w-36 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 shadow-md">
            {/* Browser topbar */}
            <div className="flex items-center gap-1 mb-2 pb-1.5 border-b border-slate-100 dark:border-slate-800">
              <div className="w-1.5 h-1.5 rounded-full bg-rose-400" />
              <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <div className="h-1.5 w-14 bg-slate-100 dark:bg-slate-800 rounded-full ml-auto" />
            </div>
            {/* Website Layout Grid */}
            <div className="grid grid-cols-3 gap-1.5">
              <div className="col-span-2 h-7 bg-indigo-50 dark:bg-indigo-950/60 rounded-md border border-indigo-100 dark:border-indigo-900/40 p-1 flex flex-col justify-center gap-1">
                <div className="h-1.5 w-10 bg-indigo-300 dark:bg-indigo-700 rounded-full" />
                <div className="h-1 w-14 bg-indigo-200 dark:bg-indigo-800 rounded-full" />
              </div>
              <div className="h-7 bg-slate-100 dark:bg-slate-800 rounded-md flex items-center justify-center">
                <FolderKanban className="w-3.5 h-3.5 text-slate-400" />
              </div>
            </div>
            {/* Progress bar simulation */}
            <div className="mt-2 w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div className="bg-indigo-600 h-full w-2/3 rounded-full" />
            </div>
          </div>
          {/* Floating tag */}
          <div className="absolute -top-1 -right-1 z-20 bg-emerald-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow">
            UI / Web
          </div>
        </div>
      );

    case 'leads':
      return (
        <div className="relative w-36 h-28 mx-auto mb-4 flex items-center justify-center">
          <div className="relative z-10 w-32 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 shadow-md text-center">
            <div className="w-8 h-8 mx-auto rounded-full bg-amber-50 dark:bg-amber-950/60 text-amber-500 flex items-center justify-center mb-2">
              <TrendingUp className="w-4 h-4" />
            </div>
            <div className="h-2 w-16 bg-slate-200 dark:bg-slate-700 rounded-full mx-auto mb-1.5" />
            <div className="flex justify-center gap-1">
              <div className="w-2 h-2 rounded-full bg-amber-400" />
              <div className="w-2 h-2 rounded-full bg-amber-500" />
              <div className="w-2 h-2 rounded-full bg-emerald-500" />
            </div>
          </div>
          <div className="absolute -bottom-1 -left-1 z-20 bg-indigo-600 text-white p-1 rounded-lg shadow">
            <Users className="w-3.5 h-3.5" />
          </div>
        </div>
      );

    case 'clients':
      return (
        <div className="relative w-36 h-28 mx-auto mb-4 flex items-center justify-center">
          <div className="relative z-10 w-32 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 shadow-md">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-6 h-6 rounded-full bg-violet-100 dark:bg-violet-950 text-violet-600 dark:text-violet-400 flex items-center justify-center font-bold text-[10px]">
                <Users className="w-3.5 h-3.5" />
              </div>
              <div>
                <div className="h-2 w-12 bg-slate-300 dark:bg-slate-600 rounded-full" />
                <div className="h-1.5 w-8 bg-slate-200 dark:bg-slate-700 rounded-full mt-1" />
              </div>
            </div>
            <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full mb-1" />
            <div className="h-1.5 w-4/5 bg-slate-100 dark:bg-slate-800 rounded-full" />
          </div>
        </div>
      );

    case 'proposals':
      return (
        <div className="relative w-36 h-28 mx-auto mb-4 flex items-center justify-center">
          <div className="relative z-10 w-32 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 shadow-md">
            <div className="flex items-center justify-between mb-2">
              <FileText className="w-4 h-4 text-cyan-600" />
              <span className="text-[9px] font-bold text-cyan-600 bg-cyan-50 dark:bg-cyan-950/60 px-1 py-0.5 rounded">
                PROPOSTA
              </span>
            </div>
            <div className="h-2 w-16 bg-slate-300 dark:bg-slate-600 rounded-full mb-1.5" />
            <div className="h-1.5 w-20 bg-slate-200 dark:bg-slate-700 rounded-full mb-2" />
            <div className="pt-1.5 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
              <div className="h-1.5 w-8 bg-slate-200 dark:bg-slate-700 rounded-full" />
              <div className="h-2 w-10 bg-emerald-400 rounded-full" />
            </div>
          </div>
        </div>
      );

    case 'contracts':
      return (
        <div className="relative w-36 h-28 mx-auto mb-4 flex items-center justify-center">
          <div className="relative z-10 w-32 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 shadow-md">
            <div className="flex items-center gap-1.5 mb-2">
              <FileCheck className="w-4 h-4 text-teal-600" />
              <div className="h-2 w-14 bg-slate-300 dark:bg-slate-600 rounded-full" />
            </div>
            <div className="space-y-1 mb-2">
              <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full" />
              <div className="h-1.5 w-5/6 bg-slate-100 dark:bg-slate-800 rounded-full" />
            </div>
            <div className="flex items-center justify-end">
              <div className="h-3 w-10 border-b border-indigo-500 transform -rotate-6" />
            </div>
          </div>
        </div>
      );

    case 'financial':
      return (
        <div className="relative w-36 h-28 mx-auto mb-4 flex items-center justify-center">
          <div className="relative z-10 w-32 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 shadow-md text-center">
            <div className="w-8 h-8 mx-auto rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-2">
              <DollarSign className="w-4 h-4" />
            </div>
            <div className="h-2.5 w-16 bg-emerald-300 dark:bg-emerald-700 rounded-full mx-auto mb-1" />
            <div className="h-1.5 w-10 bg-slate-200 dark:bg-slate-700 rounded-full mx-auto" />
          </div>
        </div>
      );

    case 'recurring':
      return (
        <div className="relative w-36 h-28 mx-auto mb-4 flex items-center justify-center">
          <div className="relative z-10 w-32 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 shadow-md text-center">
            <div className="w-8 h-8 mx-auto rounded-full bg-rose-50 dark:bg-rose-950/60 text-rose-500 flex items-center justify-center mb-2">
              <Repeat className="w-4 h-4" />
            </div>
            <div className="h-2 w-14 bg-slate-300 dark:bg-slate-600 rounded-full mx-auto mb-1" />
            <div className="h-1.5 w-8 bg-slate-200 dark:bg-slate-700 rounded-full mx-auto" />
          </div>
        </div>
      );

    case 'files':
      return (
        <div className="relative w-36 h-28 mx-auto mb-4 flex items-center justify-center">
          <div className="relative z-10 w-32 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 shadow-md text-center">
            <div className="w-8 h-8 mx-auto rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-500 flex items-center justify-center mb-2">
              <FolderOpen className="w-4 h-4" />
            </div>
            <div className="h-2 w-16 bg-slate-300 dark:bg-slate-600 rounded-full mx-auto mb-1" />
            <div className="h-1.5 w-12 bg-slate-200 dark:bg-slate-700 rounded-full mx-auto" />
          </div>
        </div>
      );

    case 'search':
      return (
        <div className="relative w-36 h-28 mx-auto mb-4 flex items-center justify-center">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center">
            <Search className="w-6 h-6" />
          </div>
        </div>
      );

    default:
      return (
        <div className="relative w-36 h-24 mx-auto mb-4 flex items-center justify-center">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-500 flex items-center justify-center">
            <Sparkles className="w-6 h-6" />
          </div>
        </div>
      );
  }
};

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  variant,
  title,
  description,
  actionText,
  onAction,
  actionVariant = 'primary',
  secondaryActionText,
  onSecondaryAction,
  className = '',
}) => {
  return (
    <div
      className={`flex flex-col items-center justify-center text-center p-8 sm:p-12 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl my-4 bg-slate-50/40 dark:bg-slate-900/20 ${className}`}
    >
      {/* Either custom graphic illustration or standard icon */}
      {variant ? (
        <IllustrationGraphic variant={variant} />
      ) : icon ? (
        <div className="p-3 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-2xl mb-4 shadow-2xs">
          {icon}
        </div>
      ) : (
        <IllustrationGraphic variant="default" />
      )}

      <h3 className="text-base font-semibold text-slate-900 dark:text-white mb-1.5">
        {title}
      </h3>
      <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-sm mb-5 leading-relaxed">
        {description}
      </p>

      {/* Actions */}
      <div className="flex items-center gap-2 flex-wrap justify-center">
        {secondaryActionText && onSecondaryAction && (
          <Button variant="secondary" size="sm" onClick={onSecondaryAction}>
            {secondaryActionText}
          </Button>
        )}
        {actionText && onAction && (
          <Button variant={actionVariant} size="sm" onClick={onAction}>
            {actionText}
          </Button>
        )}
      </div>
    </div>
  );
};

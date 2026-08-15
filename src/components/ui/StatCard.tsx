import React from 'react';
import { Card } from './Card';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: {
    value: string;
    isPositive?: boolean;
  };
  icon?: React.ReactNode;
  variant?: 'default' | 'emerald' | 'amber' | 'indigo' | 'rose';
  onClick?: () => void;
  className?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  trend,
  icon,
  variant = 'default',
  onClick,
  className = '',
}) => {
  const iconBgClasses = {
    default: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300',
    emerald: 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400',
    amber: 'bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400',
    indigo: 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400',
    rose: 'bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400',
  };

  return (
    <Card
      hover={!!onClick}
      onClick={onClick}
      className={`${onClick ? 'cursor-pointer' : ''} ${className}`}
      padding="sm"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            {title}
          </p>
          <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mt-1 tracking-tight">
            {value}
          </h3>
          {(subtitle || trend) && (
            <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
              {trend && (
                <span
                  className={`text-xs font-semibold px-1.5 py-0.5 rounded-sm ${
                    trend.isPositive
                      ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                      : 'bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                  }`}
                >
                  {trend.value}
                </span>
              )}
              {subtitle && (
                <span className="text-xs text-slate-500 dark:text-slate-400">{subtitle}</span>
              )}
            </div>
          )}
        </div>
        {icon && (
          <div className={`p-2.5 rounded-xl flex items-center justify-center shrink-0 ml-3 ${iconBgClasses[variant]}`}>
            {icon}
          </div>
        )}
      </div>
    </Card>
  );
};

import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hover?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  hover = false,
  padding = 'md',
  ...props
}) => {
  const paddingClasses = {
    none: '',
    sm: 'p-3 sm:p-4',
    md: 'p-4 sm:p-6',
    lg: 'p-6 sm:p-8',
  };

  return (
    <div
      className={`bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-xl shadow-xs ${
        hover ? 'hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-200' : ''
      } ${paddingClasses[padding]} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

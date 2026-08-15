import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  helperText,
  leftIcon,
  rightIcon,
  className = '',
  id,
  ...props
}) => {
  const inputId = id || props.name || Math.random().toString(36).substring(2, 8);

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={inputId}
          className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5"
        >
          {label} {props.required && <span className="text-rose-500">*</span>}
        </label>
      )}
      <div className="relative rounded-lg shadow-2xs">
        {leftIcon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            {leftIcon}
          </div>
        )}
        <input
          id={inputId}
          className={`block w-full rounded-lg border bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-offset-0 disabled:bg-slate-50 disabled:text-slate-500 ${
            leftIcon ? 'pl-9' : 'pl-3'
          } ${rightIcon ? 'pr-9' : 'pr-3'} py-2 ${
            error
              ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-200 dark:focus:ring-rose-950'
              : 'border-slate-200 dark:border-slate-750 focus:border-indigo-500 focus:ring-indigo-100 dark:focus:ring-indigo-950/50'
          } ${className}`}
          {...props}
        />
        {rightIcon && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400">
            {rightIcon}
          </div>
        )}
      </div>
      {error && <p className="mt-1 text-xs text-rose-500">{error}</p>}
      {helperText && !error && (
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{helperText}</p>
      )}
    </div>
  );
};

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helperText?: string;
  options?: { value: string; label: string }[];
}

export const Select: React.FC<SelectProps> = ({
  label,
  error,
  helperText,
  options,
  children,
  className = '',
  id,
  ...props
}) => {
  const selectId = id || props.name || Math.random().toString(36).substring(2, 8);

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={selectId}
          className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5"
        >
          {label} {props.required && <span className="text-rose-500">*</span>}
        </label>
      )}
      <select
        id={selectId}
        className={`block w-full rounded-lg border bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm py-2 px-3 transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-offset-0 ${
          error
            ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-200'
            : 'border-slate-200 dark:border-slate-750 focus:border-indigo-500 focus:ring-indigo-100 dark:focus:ring-indigo-950/50'
        } ${className}`}
        {...props}
      >
        {options
          ? options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))
          : children}
      </select>
      {error && <p className="mt-1 text-xs text-rose-500">{error}</p>}
      {helperText && !error && (
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{helperText}</p>
      )}
    </div>
  );
};

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Textarea: React.FC<TextareaProps> = ({
  label,
  error,
  helperText,
  className = '',
  id,
  rows = 3,
  ...props
}) => {
  const areaId = id || props.name || Math.random().toString(36).substring(2, 8);

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={areaId}
          className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5"
        >
          {label} {props.required && <span className="text-rose-500">*</span>}
        </label>
      )}
      <textarea
        id={areaId}
        rows={rows}
        className={`block w-full rounded-lg border bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm py-2 px-3 transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-offset-0 ${
          error
            ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-200'
            : 'border-slate-200 dark:border-slate-750 focus:border-indigo-500 focus:ring-indigo-100 dark:focus:ring-indigo-950/50'
        } ${className}`}
        {...props}
      />
      {error && <p className="mt-1 text-xs text-rose-500">{error}</p>}
      {helperText && !error && (
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{helperText}</p>
      )}
    </div>
  );
};

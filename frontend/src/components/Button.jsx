import React from 'react';

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  className = '',
  ...props
}) {
  const baseStyles = 'font-semibold transition-all duration-200 rounded-lg inline-flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-offset-2';

  const variants = {
    primary: 'bg-forest text-white hover:bg-forest/90 focus:ring-forest/50 disabled:opacity-60',
    secondary: 'bg-slate-100 text-slate-900 hover:bg-slate-200 focus:ring-slate-300 disabled:opacity-60',
    ghost: 'text-forest hover:bg-forest/5 focus:ring-forest/20',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-600/50 disabled:opacity-60',
    outline: 'border border-slate-200 text-slate-600 hover:bg-slate-50 focus:ring-slate-300 disabled:opacity-60',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}

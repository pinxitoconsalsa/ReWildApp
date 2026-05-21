import React from 'react';

export function Card({ children, className = '', elevated = false, ...props }) {
  return (
    <div
      className={`bg-white rounded-xl ${elevated ? 'shadow-lg' : 'shadow-sm'} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className = '' }) {
  return <div className={`px-4 py-3 border-b border-slate-100 ${className}`}>{children}</div>;
}

export function CardContent({ children, className = '' }) {
  return <div className={`p-4 ${className}`}>{children}</div>;
}

export function CardFooter({ children, className = '' }) {
  return <div className={`px-4 py-3 border-t border-slate-100 flex gap-2 ${className}`}>{children}</div>;
}

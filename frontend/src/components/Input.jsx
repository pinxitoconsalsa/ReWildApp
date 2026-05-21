import React from 'react';

export function Input({ label, error, className = '', ...props }) {
  return (
    <div className="flex flex-col">
      {label && (
        <label className="text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">
          {label}
        </label>
      )}
      <input
        className={`px-3.5 py-2.5 border border-slate-200 rounded-lg text-sm font-medium placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-forest focus:border-transparent transition-all ${className}`}
        {...props}
      />
      {error && <span className="text-xs text-red-600 mt-1">{error}</span>}
    </div>
  );
}

export function Textarea({ label, error, className = '', ...props }) {
  return (
    <div className="flex flex-col">
      {label && (
        <label className="text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">
          {label}
        </label>
      )}
      <textarea
        className={`px-3.5 py-2.5 border border-slate-200 rounded-lg text-sm font-medium placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-forest focus:border-transparent resize-none transition-all ${className}`}
        {...props}
      />
      {error && <span className="text-xs text-red-600 mt-1">{error}</span>}
    </div>
  );
}

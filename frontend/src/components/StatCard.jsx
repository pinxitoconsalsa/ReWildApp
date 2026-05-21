import React from 'react';

export function StatCard({ label, value, icon, trend, info, highlighted = false }) {
  return (
    <div className={`rounded-lg p-3 overflow-hidden ${highlighted ? 'bg-forest text-white' : 'bg-slate-50 text-slate-900'}`}>
      <div className="flex items-end justify-between gap-2">
        <div className="flex-1">
          <div className={`text-xs font-semibold uppercase tracking-wide ${highlighted ? 'text-forest-100' : 'text-slate-500'} mb-1`}>
            {label}
          </div>
          <div className={`text-2xl font-bold ${highlighted ? 'text-white' : 'text-slate-900'}`}>
            {value}
          </div>
          {trend && (
            <div className={`text-[10px] mt-1 font-semibold ${highlighted ? 'text-forest-100' : 'text-slate-500'}`}>
              {trend}
            </div>
          )}
        </div>
        {icon && (
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <div className="text-3xl opacity-80">{icon}</div>
            {info && <div className={`text-xs ${highlighted ? 'text-forest-100' : 'text-slate-500'}`}>{info}</div>}
          </div>
        )}
      </div>
    </div>
  );
}

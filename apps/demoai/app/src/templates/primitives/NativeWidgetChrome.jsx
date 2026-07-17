import React from 'react';
import { X } from 'lucide-react';

export function NativeWidgetChrome({
  children,
  label = 'Sponsored',
  title,
  onClose,
  className = '',
}) {
  return (
    <section className={`overflow-hidden rounded-2xl border border-white/10 bg-slate-900 shadow-2xl ${className}`}>
      <header className="flex min-h-14 items-center justify-between gap-3 border-b border-white/10 px-4">
        <div className="min-w-0">
          <span className="block text-[10px] font-bold uppercase tracking-[0.18em] text-cyan-400">{label}</span>
          {title && <h3 className="truncate text-sm font-semibold text-white">{title}</h3>}
        </div>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="flex min-h-11 min-w-11 items-center justify-center rounded-full text-slate-400 hover:bg-white/10 hover:text-white"
            aria-label="Close ad"
          >
            <X size={20} />
          </button>
        )}
      </header>
      {children}
    </section>
  );
}

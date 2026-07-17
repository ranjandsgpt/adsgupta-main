import React, { useCallback } from 'react';
import { X } from 'lucide-react';
import { useDismissState, useReducedMotion, useViewability } from '../hooks';
import { emitTelemetry } from '../telemetry';

export function track(templateId, type, detail = {}) {
  return emitTelemetry(type, { templateId, ...detail });
}

export default function BatchTemplateFrame({ templateId, title, subtitle, children }) {
  const reducedMotion = useReducedMotion();
  const viewRef = useViewability({ templateId });
  const onDismiss = useCallback((reason) => {
    track(templateId, 'close', { reason });
  }, [templateId]);
  const { dismissed, dismiss } = useDismissState({
    key: templateId,
    scope: 'component',
    onDismiss,
  });

  if (dismissed) return null;

  return (
    <section
      ref={viewRef}
      className="mx-auto w-full max-w-xl overflow-hidden rounded-3xl border border-white/10 bg-slate-950 text-white shadow-2xl"
      aria-label={`${title} sponsored interactive ad`}
    >
      <header className="flex min-h-16 items-center justify-between gap-3 border-b border-white/10 px-4">
        <div className="min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-cyan-400">Sponsored · Interactive demo</p>
          <h2 className="truncate text-base font-black">{title}</h2>
          {subtitle && <p className="truncate text-xs text-slate-400">{subtitle}</p>}
        </div>
        <button
          type="button"
          onClick={() => dismiss('button')}
          className="flex min-h-11 min-w-11 shrink-0 items-center justify-center rounded-full text-slate-300 hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan-300"
          aria-label="Close ad"
        >
          <X size={20} />
        </button>
      </header>
      <div className="p-4 sm:p-6">
        {typeof children === 'function' ? children({ reducedMotion }) : children}
      </div>
    </section>
  );
}

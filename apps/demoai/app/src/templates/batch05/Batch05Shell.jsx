import React, { useCallback, useEffect, useState } from 'react';
import { RotateCcw } from 'lucide-react';
import { useDismissState } from '../hooks/useDismissState';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { useScrollLock } from '../hooks/useScrollLock';
import { useViewability } from '../hooks/useViewability';
import { NativeWidgetChrome } from '../primitives/NativeWidgetChrome';
import { emitTelemetry } from '../telemetry';

export const buttonClass = 'min-h-11 min-w-11 rounded-xl px-4 font-semibold outline-none focus-visible:ring-2 focus-visible:ring-cyan-300 disabled:cursor-not-allowed disabled:opacity-50';

export function Batch05Shell({
  templateId,
  title,
  children,
  className = '',
  lockScroll = false,
  onClosed,
}) {
  const viewabilityRef = useViewability({ templateId });
  const { dismissed, dismiss, reset } = useDismissState({
    key: templateId,
    onDismiss: (reason) => {
      emitTelemetry('close', { templateId, reason });
      onClosed?.(reason);
    },
  });
  useScrollLock(lockScroll && !dismissed);

  if (dismissed) {
    return (
      <button
        type="button"
        className={`${buttonClass} flex items-center gap-2 bg-slate-800 text-white`}
        onClick={() => {
          reset();
          emitTelemetry('click', { templateId, target: 'restore' });
        }}
      >
        <RotateCcw size={18} /> Restore {title}
      </button>
    );
  }

  return (
    <div ref={viewabilityRef} className={className}>
      <NativeWidgetChrome title={title} onClose={() => dismiss('button')}>
        {children}
      </NativeWidgetChrome>
    </div>
  );
}

export function useEscapeAction(action, enabled = true) {
  useEffect(() => {
    if (!enabled) return undefined;
    const onKeyDown = (event) => {
      if (event.key === 'Escape') action();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [action, enabled]);
}

export function useMorph(templateId, initial = false) {
  const [expanded, setExpanded] = useState(initial);
  const reducedMotion = useReducedMotion();
  const setMorph = useCallback((next, target = 'creative') => {
    setExpanded(next);
    emitTelemetry(next ? 'expand' : 'close', {
      templateId,
      reason: next ? undefined : 'collapse',
      target,
    });
  }, [templateId]);
  useEscapeAction(() => {
    if (expanded) setMorph(false, 'escape');
  }, expanded);
  return { expanded, setMorph, reducedMotion };
}

export function trackClick(templateId, target, detail = {}) {
  emitTelemetry('click', { templateId, target, ...detail });
}

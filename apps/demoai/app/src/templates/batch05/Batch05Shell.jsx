import React, { useCallback, useEffect, useState } from 'react';
import { RotateCcw, X } from 'lucide-react';
import { useDismissState } from '../hooks/useDismissState';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { useScrollLock } from '../hooks/useScrollLock';
import { useViewability } from '../hooks/useViewability';
import { FramePortal } from '../primitives/FramePortal';
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
    // Escape is reserved for collapsing expanded morph states (useMorph);
    // it should not remove the inline ad itself.
    escape: false,
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

/* Full-frame expanded state for morph templates: portals into the preview
   overlay root, locks only the frame scroller, and offers a consistent close. */
export function MorphOverlay({
  label,
  onClose,
  className = '',
  children,
}) {
  useScrollLock(true);
  return (
    <FramePortal>
      <div
        role="dialog"
        aria-modal="true"
        aria-label={label}
        className={`pointer-events-auto absolute inset-0 flex flex-col overflow-hidden ${className}`}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label={`Close ${label}`}
          className="absolute right-3 top-3 z-20 flex min-h-11 min-w-11 items-center justify-center rounded-full bg-black/40 text-white outline-none backdrop-blur hover:bg-black/60 focus-visible:ring-2 focus-visible:ring-cyan-300"
        >
          <X size={20} />
        </button>
        {children}
      </div>
    </FramePortal>
  );
}

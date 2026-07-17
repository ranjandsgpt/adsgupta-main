import React, { useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, Pause, X } from 'lucide-react';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { useScrollLock } from '../hooks/useScrollLock';
import { useViewability } from '../hooks/useViewability';
import { emitTelemetry } from '../telemetry';

export function StoryEngine({
  frames,
  templateId,
  onDismiss,
  frameDuration = 6000,
}) {
  const reducedMotion = useReducedMotion();
  const viewabilityRef = useViewability({ templateId });
  const [frameIndex, setFrameIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [paused, setPaused] = useState(false);
  const gestureRef = useRef(null);
  const completedRef = useRef(false);
  const frame = frames[frameIndex];
  const isFinal = frameIndex === frames.length - 1;
  useScrollLock(true);

  useEffect(() => {
    if (paused || completedRef.current) return undefined;
    const tickMs = 80;
    const timer = window.setInterval(() => {
      setProgress((current) => {
        const next = current + (tickMs / frameDuration) * 100;
        if (next < 100) return next;
        if (frameIndex < frames.length - 1) {
          setFrameIndex((index) => index + 1);
          return 0;
        }
        if (!completedRef.current) {
          completedRef.current = true;
          emitTelemetry('complete', { templateId });
        }
        return 100;
      });
    }, tickMs);
    return () => window.clearInterval(timer);
  }, [frameDuration, frameIndex, frames.length, paused, templateId]);

  const goToFrame = (nextIndex) => {
    const bounded = Math.max(0, Math.min(frames.length - 1, nextIndex));
    setFrameIndex(bounded);
    setProgress(0);
  };

  const close = (reason) => {
    emitTelemetry('close', { templateId, reason });
    onDismiss?.(reason);
  };

  const handlePointerDown = (event) => {
    gestureRef.current = {
      pointerId: event.pointerId,
      x: event.clientX,
      y: event.clientY,
      startedAt: performance.now(),
    };
    event.currentTarget.setPointerCapture(event.pointerId);
    setPaused(true);
  };

  const handlePointerUp = (event) => {
    const gesture = gestureRef.current;
    if (!gesture || gesture.pointerId !== event.pointerId) return;
    const deltaX = event.clientX - gesture.x;
    const deltaY = event.clientY - gesture.y;
    const heldFor = performance.now() - gesture.startedAt;
    gestureRef.current = null;
    setPaused(false);

    if (deltaY > 80 && Math.abs(deltaY) > Math.abs(deltaX)) {
      close('swipe');
      return;
    }
    if (heldFor < 300 && Math.abs(deltaX) < 24 && Math.abs(deltaY) < 24) {
      const rect = event.currentTarget.getBoundingClientRect();
      goToFrame(event.clientX < rect.left + rect.width / 2 ? frameIndex - 1 : frameIndex + 1);
    }
  };

  const cancelPointer = () => {
    gestureRef.current = null;
    setPaused(false);
  };

  return (
    <div
      ref={viewabilityRef}
      className={`fixed inset-0 z-[100] touch-none overflow-hidden bg-slate-950 text-white ${frame.background}`}
      role="dialog"
      aria-modal="true"
      aria-label="Vertical story ad"
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerCancel={cancelPointer}
    >
      <div className="absolute inset-0 bg-gradient-to-b from-black/35 via-transparent to-black/70" />
      <div className="absolute -left-20 top-1/4 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
      <div className="absolute -right-24 bottom-1/4 h-80 w-80 rounded-full bg-cyan-300/10 blur-3xl" />

      <div className="absolute inset-x-0 top-0 z-20 p-3 pt-[max(0.75rem,env(safe-area-inset-top))] sm:p-5">
        <div className="flex gap-1.5" aria-label={`Story ${frameIndex + 1} of ${frames.length}`}>
          {frames.map((item, index) => {
            const width = index < frameIndex ? 100 : index === frameIndex ? progress : 0;
            return (
              <div key={item.id} className="h-1 flex-1 overflow-hidden rounded-full bg-white/25">
                <div
                  className="h-full rounded-full bg-white"
                  style={{ width: `${width}%`, transition: reducedMotion ? 'none' : 'width 80ms linear' }}
                />
              </div>
            );
          })}
        </div>
        <div className="mt-3 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-[0.24em] text-white/70">Sponsored story</span>
            <p className="text-sm font-bold">{frame.eyebrow}</p>
          </div>
          <button
            type="button"
            className="flex min-h-11 min-w-11 items-center justify-center rounded-full bg-black/25 text-white hover:bg-black/45"
            onPointerDown={(event) => event.stopPropagation()}
            onPointerUp={(event) => event.stopPropagation()}
            onClick={() => close('button')}
            aria-label="Close story"
          >
            <X size={22} />
          </button>
        </div>
      </div>

      <div
        key={frame.id}
        className={`relative z-10 flex h-full flex-col items-center justify-center px-7 text-center ${reducedMotion ? '' : 'transition-opacity duration-300'}`}
      >
        <div className="mb-8 flex h-24 w-24 items-center justify-center rounded-[2rem] border border-white/25 bg-white/10 text-4xl font-black shadow-2xl backdrop-blur">
          {frame.mark}
        </div>
        <p className="mb-3 text-xs font-bold uppercase tracking-[0.28em] text-cyan-100">{frame.kicker}</p>
        <h2 className="max-w-xl text-4xl font-black leading-[0.95] tracking-tight sm:text-6xl">{frame.title}</h2>
        <p className="mt-5 max-w-md text-base leading-relaxed text-white/75 sm:text-lg">{frame.body}</p>
        {isFinal && (
          <button
            type="button"
            className="mt-8 min-h-12 rounded-full bg-white px-8 py-3 font-bold text-slate-950 shadow-xl hover:bg-cyan-100"
            onPointerDown={(event) => event.stopPropagation()}
            onPointerUp={(event) => event.stopPropagation()}
            onClick={() => emitTelemetry('click', { templateId, target: 'final-cta' })}
          >
            Build your campaign
          </button>
        )}
      </div>

      <div className="pointer-events-none absolute inset-x-4 bottom-[max(1rem,env(safe-area-inset-bottom))] z-20 flex items-center justify-between text-xs font-medium text-white/60">
        <span className="flex items-center gap-1"><ChevronLeft size={16} /> Tap left</span>
        {paused && <span className="flex items-center gap-1 text-white"><Pause size={14} /> Paused</span>}
        <span className="flex items-center gap-1">Tap right <ChevronRight size={16} /></span>
      </div>
    </div>
  );
}

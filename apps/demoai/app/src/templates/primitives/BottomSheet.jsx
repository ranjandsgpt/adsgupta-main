import React, { useEffect, useMemo, useRef, useState } from 'react';
import { GripHorizontal } from 'lucide-react';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { useScrollLock } from '../hooks/useScrollLock';
import { useViewability } from '../hooks/useViewability';
import { emitTelemetry } from '../telemetry';
import { MorphContainer } from './MorphContainer';

const DEFAULT_SNAPS = [
  { id: 'peek', ratio: 0.28 },
  { id: 'half', ratio: 0.55 },
  { id: 'full', ratio: 0.9 },
];

export function BottomSheet({
  children,
  templateId,
  onDismiss,
  snapPoints = DEFAULT_SNAPS,
  initialSnap = 'peek',
}) {
  const reducedMotion = useReducedMotion();
  const viewabilityRef = useViewability({ templateId });
  const [viewportHeight, setViewportHeight] = useState(() => window.innerHeight);
  const initialIndex = Math.max(0, snapPoints.findIndex((snap) => snap.id === initialSnap));
  const [snapIndex, setSnapIndex] = useState(initialIndex);
  const [dragTranslate, setDragTranslate] = useState(null);
  const dragRef = useRef(null);
  useScrollLock(true);

  useEffect(() => {
    const update = () => setViewportHeight(window.innerHeight);
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  const geometry = useMemo(() => {
    const maxHeight = viewportHeight * Math.max(...snapPoints.map((snap) => snap.ratio));
    const translations = snapPoints.map((snap) => maxHeight - viewportHeight * snap.ratio);
    return { maxHeight, translations };
  }, [snapPoints, viewportHeight]);

  const restingTranslate = geometry.translations[snapIndex];
  const translate = dragTranslate ?? restingTranslate;
  const openness = 1 - translate / geometry.maxHeight;

  const handlePointerDown = (event) => {
    dragRef.current = {
      pointerId: event.pointerId,
      startY: event.clientY,
      startTranslate: restingTranslate,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
    setDragTranslate(restingTranslate);
  };

  const handlePointerMove = (event) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    const raw = drag.startTranslate + event.clientY - drag.startY;
    const min = geometry.translations[geometry.translations.length - 1];
    const max = geometry.translations[0];
    const rubberBanded = raw < min
      ? min + (raw - min) * 0.22
      : raw > max
        ? max + (raw - max) * 0.22
        : raw;
    setDragTranslate(rubberBanded);
  };

  const finishDrag = (event) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    const current = dragTranslate ?? restingTranslate;
    const nextIndex = geometry.translations.reduce((closest, point, index) => (
      Math.abs(point - current) < Math.abs(geometry.translations[closest] - current) ? index : closest
    ), 0);
    if (nextIndex > snapIndex) {
      emitTelemetry('expand', { templateId, snapPoint: snapPoints[nextIndex].id });
    }
    setSnapIndex(nextIndex);
    setDragTranslate(null);
    dragRef.current = null;
  };

  return (
    <div ref={viewabilityRef} className="fixed inset-0 z-[90] pointer-events-auto" role="dialog" aria-modal="true" aria-label="Product details">
      <button
        type="button"
        className="absolute inset-0 min-h-11 min-w-11 bg-black"
        style={{ opacity: Math.max(0.16, Math.min(0.72, openness * 0.82)), transition: reducedMotion ? 'none' : 'opacity 250ms ease' }}
        onClick={() => onDismiss?.('scrim')}
        aria-label="Close bottom sheet"
      />
      <MorphContainer
        className="absolute inset-x-0 bottom-0 mx-auto w-full max-w-2xl overflow-hidden rounded-t-3xl border border-b-0 border-white/10 bg-slate-950 shadow-[0_-24px_70px_rgba(0,0,0,0.55)]"
        duration={reducedMotion || dragTranslate !== null ? 0 : 320}
        style={{
          height: `${geometry.maxHeight}px`,
          transform: `translateY(${translate}px)`,
        }}
      >
        <button
          type="button"
          className="flex min-h-14 w-full touch-none items-center justify-center text-slate-500 hover:text-white"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={finishDrag}
          onPointerCancel={finishDrag}
          aria-label={`Drag sheet, currently ${snapPoints[snapIndex].id}`}
        >
          <GripHorizontal size={30} />
        </button>
        <div className="h-[calc(100%_-_3.5rem)] overflow-y-auto overscroll-contain px-4 pb-8 sm:px-6">
          {children}
        </div>
      </MorphContainer>
    </div>
  );
}

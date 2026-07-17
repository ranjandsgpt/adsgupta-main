import React, { useCallback, useRef, useState } from 'react';
import { MoveHorizontal, Sparkles } from 'lucide-react';
import { useDismissState } from '../hooks/useDismissState';
import { useViewability } from '../hooks/useViewability';
import { emitTelemetry } from '../telemetry';
import { NativeWidgetChrome } from '../primitives/NativeWidgetChrome';

const TEMPLATE_ID = 'before-after';

function Scene({ variant }) {
  const after = variant === 'after';
  return (
    <div className={`absolute inset-0 ${after ? 'bg-gradient-to-br from-emerald-300 via-teal-400 to-cyan-600' : 'bg-gradient-to-br from-stone-500 via-stone-600 to-stone-800'}`}>
      {/* procedural "lawn": rows of blades that look patchy before, lush after */}
      <div className="absolute inset-x-0 bottom-0 flex h-1/2 items-end justify-around px-2" aria-hidden="true">
        {Array.from({ length: 24 }, (_, i) => (
          <span
            key={i}
            className={`w-1.5 rounded-t-full ${after ? 'bg-emerald-900/70' : 'bg-stone-900/60'}`}
            style={{ height: after ? `${55 + ((i * 13) % 35)}%` : `${12 + ((i * 29) % 30)}%` }}
          />
        ))}
      </div>
      <span className={`absolute top-3 rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-widest ${after ? 'right-3 bg-emerald-950/70 text-emerald-200' : 'left-3 bg-black/50 text-stone-200'}`}>
        {after ? 'After · 3 weeks' : 'Before'}
      </span>
    </div>
  );
}

export default function Template21BeforeAfterSliderAd() {
  const viewabilityRef = useViewability({ templateId: TEMPLATE_ID });
  const handleDismiss = useCallback((reason) => {
    emitTelemetry('close', { templateId: TEMPLATE_ID, reason });
  }, []);
  const { dismissed, dismiss } = useDismissState({ key: TEMPLATE_ID, onDismiss: handleDismiss });

  const [position, setPosition] = useState(50);
  const containerRef = useRef(null);
  const draggingRef = useRef(false);
  const exploredRef = useRef(false);

  const markExplored = () => {
    if (exploredRef.current) return;
    exploredRef.current = true;
    emitTelemetry('complete', { templateId: TEMPLATE_ID, action: 'slider-explored' });
  };

  const updateFromClientX = (clientX) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    setPosition(Math.max(0, Math.min(100, ((clientX - rect.left) / rect.width) * 100)));
    markExplored();
  };

  const handlePointerDown = (event) => {
    draggingRef.current = true;
    event.currentTarget.setPointerCapture(event.pointerId);
    updateFromClientX(event.clientX);
  };

  const handlePointerMove = (event) => {
    if (draggingRef.current) updateFromClientX(event.clientX);
  };

  const handleKeyDown = (event) => {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
    event.preventDefault();
    setPosition((prev) => Math.max(0, Math.min(100, prev + (event.key === 'ArrowRight' ? 4 : -4))));
    markExplored();
  };

  if (dismissed) return null;

  return (
    <div ref={viewabilityRef} className="mx-auto w-full max-w-md">
      <NativeWidgetChrome label="Sponsored · GreenThumb" title="LawnRevive treatment" onClose={() => dismiss('button')}>
        <div
          ref={containerRef}
          className="relative aspect-[4/3] touch-none select-none overflow-hidden outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
          role="slider"
          aria-label="Compare before and after"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(position)}
          tabIndex={0}
          onKeyDown={handleKeyDown}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={() => { draggingRef.current = false; }}
          onPointerCancel={() => { draggingRef.current = false; }}
        >
          <Scene variant="after" />
          <div className="absolute inset-0 overflow-hidden" style={{ clipPath: `inset(0 ${100 - position}% 0 0)` }}>
            <Scene variant="before" />
          </div>
          <div className="absolute inset-y-0" style={{ left: `${position}%` }} aria-hidden="true">
            <div className="absolute inset-y-0 -ml-px w-0.5 bg-white shadow" />
            <div className="absolute top-1/2 flex h-11 w-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white text-slate-900 shadow-xl">
              <MoveHorizontal size={20} />
            </div>
          </div>
        </div>
        <div className="flex items-center justify-between gap-3 border-t border-white/10 p-4">
          <p className="text-sm text-slate-400">
            <Sparkles className="mr-1 inline text-emerald-400" size={15} />
            One application. Three weeks. Drag the handle to compare.
          </p>
          <button
            type="button"
            onClick={() => emitTelemetry('click', { templateId: TEMPLATE_ID, target: 'cta' })}
            className="min-h-11 shrink-0 rounded-full bg-emerald-400 px-5 text-sm font-bold text-slate-950 hover:bg-emerald-300"
          >
            Shop $24
          </button>
        </div>
      </NativeWidgetChrome>
    </div>
  );
}

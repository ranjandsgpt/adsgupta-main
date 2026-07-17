import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Pause, Play, RotateCcw } from 'lucide-react';
import { useDismissState } from '../hooks/useDismissState';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { useViewability } from '../hooks/useViewability';
import { emitTelemetry } from '../telemetry';
import { NativeWidgetChrome } from '../primitives/NativeWidgetChrome';

const TEMPLATE_ID = 'spin-360';
const TAU = Math.PI * 2;

// Procedurally draws a smart speaker from a given viewing angle — no image assets.
function drawProduct(canvas, angle) {
  const ctx = canvas.getContext('2d');
  const { width, height } = canvas;
  const cx = width / 2;
  const cy = height / 2;
  ctx.clearRect(0, 0, width, height);

  const bodyW = width * 0.34;
  const bodyH = height * 0.52;
  const squish = bodyW * 0.28;

  // shadow
  ctx.fillStyle = 'rgba(0,0,0,0.45)';
  ctx.beginPath();
  ctx.ellipse(cx, cy + bodyH / 2 + 14, bodyW * 0.95, 14, 0, 0, TAU);
  ctx.fill();

  // cylinder body
  const grad = ctx.createLinearGradient(cx - bodyW, 0, cx + bodyW, 0);
  grad.addColorStop(0, '#0f172a');
  grad.addColorStop(0.5, '#334155');
  grad.addColorStop(1, '#0f172a');
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.moveTo(cx - bodyW, cy - bodyH / 2);
  ctx.lineTo(cx - bodyW, cy + bodyH / 2);
  ctx.ellipse(cx, cy + bodyH / 2, bodyW, squish, 0, Math.PI, 0, true);
  ctx.lineTo(cx + bodyW, cy - bodyH / 2);
  ctx.ellipse(cx, cy - bodyH / 2, bodyW, squish, 0, 0, Math.PI, true);
  ctx.fill();

  // top face
  ctx.fillStyle = '#1e293b';
  ctx.beginPath();
  ctx.ellipse(cx, cy - bodyH / 2, bodyW, squish, 0, 0, TAU);
  ctx.fill();
  ctx.strokeStyle = '#22d3ee';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.ellipse(cx, cy - bodyH / 2, bodyW * 0.7, squish * 0.7, 0, 0, TAU);
  ctx.stroke();

  // speaker grille dots — positions wrap with the rotation angle so the spin reads clearly
  ctx.fillStyle = 'rgba(148,163,184,0.8)';
  for (let column = 0; column < 24; column += 1) {
    const theta = (column / 24) * TAU + angle;
    const sin = Math.sin(theta);
    if (Math.cos(theta) <= 0) continue; // back side hidden
    const x = cx + sin * bodyW * 0.92;
    for (let row = 0; row < 6; row += 1) {
      const y = cy - bodyH / 2 + squish + 14 + row * ((bodyH - squish - 28) / 6);
      ctx.beginPath();
      ctx.ellipse(x, y, 2.4 * Math.cos(theta) + 0.6, 2.4, 0, 0, TAU);
      ctx.fill();
    }
  }

  // brand badge that travels around the body
  const badgeTheta = angle % TAU;
  if (Math.cos(badgeTheta) > 0.15) {
    const x = cx + Math.sin(badgeTheta) * bodyW * 0.8;
    ctx.fillStyle = '#22d3ee';
    ctx.font = `bold ${Math.round(width * 0.05)}px system-ui, sans-serif`;
    ctx.textAlign = 'center';
    ctx.globalAlpha = Math.min(1, Math.cos(badgeTheta) * 1.4);
    ctx.fillText('ORBIT', x, cy + bodyH / 4);
    ctx.globalAlpha = 1;
  }
}

export default function Template20Spin360ViewerAd() {
  const reducedMotion = useReducedMotion();
  const viewabilityRef = useViewability({ templateId: TEMPLATE_ID });
  const handleDismiss = useCallback((reason) => {
    emitTelemetry('close', { templateId: TEMPLATE_ID, reason });
  }, []);
  const { dismissed, dismiss } = useDismissState({ key: TEMPLATE_ID, onDismiss: handleDismiss });

  const canvasRef = useRef(null);
  const angleRef = useRef(0.6);
  const rafRef = useRef(null);
  const dragRef = useRef(null);
  const spunRef = useRef(false);
  const [spinning, setSpinning] = useState(!reducedMotion);
  const [degrees, setDegrees] = useState(34);

  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    drawProduct(canvas, angleRef.current);
    setDegrees(Math.round((((angleRef.current % TAU) + TAU) % TAU) * (360 / TAU)));
  }, []);

  useEffect(() => {
    render();
    if (!spinning || dismissed) return undefined;
    let last = performance.now();
    const tick = (now) => {
      angleRef.current += ((now - last) / 1000) * 0.9;
      last = now;
      render();
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [spinning, dismissed, render]);

  const markSpun = () => {
    if (spunRef.current) return;
    spunRef.current = true;
    emitTelemetry('complete', { templateId: TEMPLATE_ID, action: 'manual-spin' });
  };

  const handlePointerDown = (event) => {
    setSpinning(false);
    dragRef.current = { pointerId: event.pointerId, lastX: event.clientX };
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    angleRef.current += (event.clientX - drag.lastX) * 0.015;
    drag.lastX = event.clientX;
    markSpun();
    render();
  };

  const handlePointerUp = (event) => {
    if (dragRef.current?.pointerId === event.pointerId) dragRef.current = null;
  };

  const handleKeyDown = (event) => {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
    event.preventDefault();
    setSpinning(false);
    angleRef.current += event.key === 'ArrowRight' ? 0.2 : -0.2;
    markSpun();
    render();
  };

  if (dismissed) return null;

  return (
    <div ref={viewabilityRef} className="mx-auto w-full max-w-md">
      <NativeWidgetChrome label="Sponsored · Orbit Audio" title="Orbit smart speaker · 360° view" onClose={() => dismiss('button')}>
        <div
          role="slider"
          aria-label="Rotate product view"
          aria-valuemin={0}
          aria-valuemax={359}
          aria-valuenow={degrees}
          tabIndex={0}
          onKeyDown={handleKeyDown}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          className="relative touch-none select-none bg-gradient-to-b from-slate-900 to-slate-950 outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
        >
          <canvas ref={canvasRef} width={480} height={360} className="block h-auto w-full cursor-grab active:cursor-grabbing" />
          <p className="pointer-events-none absolute bottom-2 left-1/2 -translate-x-1/2 rounded-full bg-black/50 px-3 py-1 text-[11px] font-semibold text-slate-300 backdrop-blur">
            Drag or use ← → keys · {degrees}°
          </p>
        </div>
        <div className="flex items-center gap-2 border-t border-white/10 p-3">
          <button
            type="button"
            onClick={() => {
              setSpinning((prev) => !prev);
              emitTelemetry('click', { templateId: TEMPLATE_ID, target: spinning ? 'pause-spin' : 'play-spin' });
            }}
            className="flex min-h-11 min-w-11 items-center justify-center rounded-full border border-slate-700 text-slate-300 hover:border-slate-500"
            aria-label={spinning ? 'Pause auto-rotation' : 'Start auto-rotation'}
          >
            {spinning ? <Pause size={18} /> : <Play size={18} />}
          </button>
          <button
            type="button"
            onClick={() => { angleRef.current = 0.6; render(); }}
            className="flex min-h-11 min-w-11 items-center justify-center rounded-full border border-slate-700 text-slate-300 hover:border-slate-500"
            aria-label="Reset view"
          >
            <RotateCcw size={18} />
          </button>
          <button
            type="button"
            onClick={() => emitTelemetry('click', { templateId: TEMPLATE_ID, target: 'cta' })}
            className="ml-auto min-h-11 rounded-full bg-cyan-400 px-5 text-sm font-bold text-slate-950 hover:bg-cyan-300"
          >
            Pre-order · $179
          </button>
        </div>
      </NativeWidgetChrome>
    </div>
  );
}

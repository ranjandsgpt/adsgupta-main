import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Compass, Layers, Rotate3D, Smartphone } from 'lucide-react';
import BatchTemplateFrame, { track } from './BatchTemplateFrame';

const ID = 'tilt-parallax';
const MAX_TILT = 14;
const KEY_STEP = 4;

const clamp = (value) => Math.max(-MAX_TILT, Math.min(MAX_TILT, value));

export default function Template02TiltParallaxAd() {
  const [mode, setMode] = useState('idle'); // idle | tilt | fallback
  const [status, setStatus] = useState('Tap "Enable motion" for device tilt, or drag / use arrow keys.');
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  const rafId = useRef(null);
  const pending = useRef({ x: 0, y: 0 });
  const orientationHandler = useRef(null);
  const drag = useRef(null);
  const tiltRef = useRef(tilt);
  tiltRef.current = tilt;

  // Coalesce high-frequency sensor/pointer input into one state update per frame.
  const scheduleTilt = useCallback((x, y) => {
    pending.current = { x: clamp(x), y: clamp(y) };
    if (rafId.current == null) {
      rafId.current = window.requestAnimationFrame(() => {
        rafId.current = null;
        setTilt(pending.current);
      });
    }
  }, []);

  const stopOrientation = useCallback(() => {
    if (orientationHandler.current) {
      window.removeEventListener('deviceorientation', orientationHandler.current);
      orientationHandler.current = null;
    }
  }, []);

  useEffect(() => () => {
    stopOrientation();
    if (rafId.current != null) window.cancelAnimationFrame(rafId.current);
  }, [stopOrientation]);

  const startOrientation = (permission) => {
    const handler = (event) => {
      if (event.beta == null && event.gamma == null) return;
      scheduleTilt((event.beta ?? 0) / 4, (event.gamma ?? 0) / 3);
    };
    orientationHandler.current = handler;
    window.addEventListener('deviceorientation', handler);
    setMode('tilt');
    setStatus('Device motion active — tilt your phone to explore the layers.');
    track(ID, 'expand', { mode: 'tilt', permission });
  };

  const activateFallback = (reason) => {
    setMode('fallback');
    setStatus('Motion unavailable — drag the scene or use the arrow controls instead.');
    track(ID, 'expand', { mode: 'fallback', reason });
  };

  const enableMotion = async () => {
    track(ID, 'click', { target: 'enable-motion' });
    if (typeof window === 'undefined' || !('DeviceOrientationEvent' in window)) {
      track(ID, 'click', { target: 'motion-permission', result: 'unsupported' });
      activateFallback('unsupported');
      return;
    }
    // iOS 13+ requires an explicit permission prompt from a user gesture.
    if (typeof window.DeviceOrientationEvent.requestPermission === 'function') {
      try {
        const result = await window.DeviceOrientationEvent.requestPermission();
        track(ID, 'click', { target: 'motion-permission', result });
        if (result === 'granted') startOrientation('granted');
        else activateFallback('denied');
      } catch {
        track(ID, 'click', { target: 'motion-permission', result: 'error' });
        activateFallback('error');
      }
    } else {
      track(ID, 'click', { target: 'motion-permission', result: 'not-required' });
      startOrientation('not-required');
    }
  };

  const onPointerDown = (event) => {
    if (mode === 'tilt') return;
    event.currentTarget.setPointerCapture(event.pointerId);
    drag.current = {
      startX: event.clientX,
      startY: event.clientY,
      baseX: tiltRef.current.x,
      baseY: tiltRef.current.y,
    };
  };

  const onPointerMove = (event) => {
    if (!drag.current) return;
    scheduleTilt(
      drag.current.baseX + (event.clientY - drag.current.startY) * -0.12,
      drag.current.baseY + (event.clientX - drag.current.startX) * 0.12,
    );
  };

  const endDrag = () => {
    drag.current = null;
  };

  const nudge = (dx, dy, target) => {
    scheduleTilt(tiltRef.current.x + dx, tiltRef.current.y + dy);
    track(ID, 'click', { target });
  };

  const onStageKeyDown = (event) => {
    const keys = {
      ArrowUp: [-KEY_STEP, 0, 'key-tilt-up'],
      ArrowDown: [KEY_STEP, 0, 'key-tilt-down'],
      ArrowLeft: [0, -KEY_STEP, 'key-tilt-left'],
      ArrowRight: [0, KEY_STEP, 'key-tilt-right'],
    };
    const action = keys[event.key];
    if (!action) return;
    event.preventDefault();
    nudge(action[0], action[1], action[2]);
  };

  const layerTransform = (factor, reducedMotion) =>
    reducedMotion ? undefined : `translate3d(${tilt.y * factor}px, ${tilt.x * factor}px, 0)`;

  return (
    <BatchTemplateFrame templateId={ID} title="Tilt Parallax Ad" subtitle="Device tilt with drag and keyboard fallback">
      {({ reducedMotion }) => (
        <>
          <div
            role="application"
            aria-label="Parallax scene. Use arrow keys to tilt."
            tabIndex={0}
            onKeyDown={onStageKeyDown}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={endDrag}
            onPointerCancel={endDrag}
            className="relative h-64 touch-none select-none overflow-hidden rounded-2xl bg-slate-950 focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan-300"
            style={{ perspective: 700, cursor: mode === 'tilt' ? 'default' : 'grab' }}
          >
            {/* Depth layer 1 — far: procedural sky with glow orbs */}
            <div
              aria-hidden="true"
              className={`absolute -inset-8 bg-gradient-to-br from-indigo-950 via-blue-900 to-cyan-800 ${reducedMotion ? '' : 'transition-transform duration-100 ease-out'}`}
              style={{ transform: layerTransform(0.5, reducedMotion) }}
            >
              <div className="absolute left-[12%] top-[16%] h-24 w-24 rounded-full bg-cyan-400/25 blur-xl" />
              <div className="absolute right-[18%] top-[55%] h-32 w-32 rounded-full bg-fuchsia-500/20 blur-2xl" />
              <div className="absolute bottom-[10%] left-[45%] h-16 w-16 rounded-full bg-amber-300/25 blur-lg" />
            </div>
            {/* Depth layer 2 — mid: geometric shapes */}
            <div
              aria-hidden="true"
              className={`absolute inset-0 ${reducedMotion ? '' : 'transition-transform duration-100 ease-out'}`}
              style={{ transform: layerTransform(1.1, reducedMotion) }}
            >
              <div className="absolute left-[14%] top-[22%] h-14 w-14 rotate-12 rounded-xl border-2 border-cyan-300/60" />
              <div className="absolute right-[16%] top-[14%] h-10 w-10 rotate-45 border-2 border-white/40" />
              <div className="absolute bottom-[18%] left-[24%] h-16 w-16 rounded-full border-4 border-fuchsia-300/50" />
              <div className="absolute bottom-[26%] right-[22%] h-8 w-20 -rotate-6 rounded-full bg-white/15" />
            </div>
            {/* Depth layer 3 — near: product card */}
            <div
              className={`absolute inset-0 flex items-center justify-center ${reducedMotion ? '' : 'transition-transform duration-100 ease-out'}`}
              style={{ transform: layerTransform(1.8, reducedMotion) }}
            >
              <div className="flex flex-col items-center rounded-[2rem] border border-white/30 bg-white/15 px-8 py-5 shadow-2xl backdrop-blur">
                <Compass size={56} className="text-cyan-100" />
                <p className="mt-2 font-black">Dimension One</p>
                <button
                  type="button"
                  onClick={() => track(ID, 'click', { target: 'cta' })}
                  className="mt-3 min-h-11 rounded-xl bg-cyan-400 px-5 font-black text-slate-950"
                >
                  Explore in 3D
                </button>
              </div>
            </div>
            <Rotate3D className="absolute right-4 top-4 text-white/60" aria-hidden="true" />
            <Layers className="absolute left-4 top-4 text-white/60" aria-hidden="true" />
          </div>

          <p className="mt-3 min-h-5 text-center text-xs text-slate-400" aria-live="polite">{status}</p>

          {mode !== 'tilt' && (
            <button
              type="button"
              onClick={enableMotion}
              className="mt-3 flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-white font-black text-slate-950"
            >
              <Smartphone size={18} aria-hidden="true" /> Enable motion
            </button>
          )}

          <div className="mt-3 grid grid-cols-3 gap-2" aria-label="Tilt controls">
            <span />
            <button type="button" onClick={() => nudge(-KEY_STEP, 0, 'button-tilt-up')} className="min-h-11 rounded-xl bg-white/10 font-bold" aria-label="Tilt up">↑</button>
            <span />
            <button type="button" onClick={() => nudge(0, -KEY_STEP, 'button-tilt-left')} className="min-h-11 rounded-xl bg-white/10 font-bold" aria-label="Tilt left">←</button>
            <button
              type="button"
              onClick={() => { scheduleTilt(0, 0); track(ID, 'click', { target: 'reset-tilt' }); }}
              className="min-h-11 rounded-xl bg-cyan-400 font-bold text-slate-950"
            >
              Reset
            </button>
            <button type="button" onClick={() => nudge(0, KEY_STEP, 'button-tilt-right')} className="min-h-11 rounded-xl bg-white/10 font-bold" aria-label="Tilt right">→</button>
          </div>
        </>
      )}
    </BatchTemplateFrame>
  );
}

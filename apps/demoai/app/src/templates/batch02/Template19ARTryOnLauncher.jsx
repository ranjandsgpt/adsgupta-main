import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Camera, CameraOff, Glasses, RefreshCcw } from 'lucide-react';
import { useDismissState } from '../hooks/useDismissState';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { useViewability } from '../hooks/useViewability';
import { emitTelemetry } from '../telemetry';
import { NativeWidgetChrome } from '../primitives/NativeWidgetChrome';

const TEMPLATE_ID = 'ar-try-on';

const FRAMES = [
  { id: 'aviator', name: 'Aviator', tint: 'rgba(56,189,248,0.55)', shape: 'rounded-[45%]' },
  { id: 'wayfarer', name: 'Wayfarer', tint: 'rgba(251,191,36,0.5)', shape: 'rounded-xl' },
  { id: 'round', name: 'Round', tint: 'rgba(232,121,249,0.5)', shape: 'rounded-full' },
];

export default function Template19ARTryOnLauncher() {
  const reducedMotion = useReducedMotion();
  const viewabilityRef = useViewability({ templateId: TEMPLATE_ID });
  const [mode, setMode] = useState('idle'); // idle | requesting | camera | simulated
  const [frame, setFrame] = useState(FRAMES[0]);
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
  }, []);

  const handleDismiss = useCallback((reason) => {
    stopCamera();
    emitTelemetry('close', { templateId: TEMPLATE_ID, reason });
  }, [stopCamera]);
  const { dismissed, dismiss } = useDismissState({ key: TEMPLATE_ID, onDismiss: handleDismiss });

  useEffect(() => stopCamera, [stopCamera]);

  // Camera access is only requested from this explicit tap handler.
  const startTryOn = async () => {
    emitTelemetry('click', { templateId: TEMPLATE_ID, target: 'launch-try-on' });
    emitTelemetry('expand', { templateId: TEMPLATE_ID, surface: 'try-on-viewport' });
    setMode('requesting');
    try {
      if (!navigator.mediaDevices?.getUserMedia) throw new Error('unsupported');
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user' },
        audio: false,
      });
      streamRef.current = stream;
      setMode('camera');
    } catch {
      setMode('simulated');
      emitTelemetry('click', { templateId: TEMPLATE_ID, target: 'fallback-simulated-preview' });
    }
  };

  useEffect(() => {
    if (mode === 'camera' && videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current;
      videoRef.current.play().catch(() => {});
    }
  }, [mode]);

  const exitTryOn = () => {
    stopCamera();
    setMode('idle');
  };

  const pickFrame = (next) => {
    setFrame(next);
    emitTelemetry('click', { templateId: TEMPLATE_ID, target: `frame-${next.id}` });
  };

  if (dismissed) return null;

  const glassesOverlay = (
    <div className="pointer-events-none absolute inset-x-0 top-[38%] flex justify-center gap-2" aria-hidden="true">
      <span className={`h-12 w-16 border-4 border-slate-900/90 ${frame.shape}`} style={{ backgroundColor: frame.tint }} />
      <span className="mt-4 h-1.5 w-4 rounded bg-slate-900/90" />
      <span className={`h-12 w-16 border-4 border-slate-900/90 ${frame.shape}`} style={{ backgroundColor: frame.tint }} />
    </div>
  );

  return (
    <div ref={viewabilityRef} className="mx-auto w-full max-w-md">
      <NativeWidgetChrome label="Sponsored · Vista Optics" title="Virtual try-on" onClose={() => dismiss('button')}>
        <div className="relative aspect-[4/5] overflow-hidden bg-slate-950">
          {mode === 'camera' ? (
            <>
              <video
                ref={videoRef}
                playsInline
                muted
                className="h-full w-full scale-x-[-1] object-cover"
                aria-label="Live camera preview with virtual glasses overlay"
              />
              {glassesOverlay}
            </>
          ) : mode === 'simulated' ? (
            <div className="relative flex h-full items-center justify-center bg-gradient-to-b from-slate-700 via-slate-800 to-slate-950">
              <div className="h-56 w-44 rounded-[48%] bg-gradient-to-b from-amber-200/70 to-amber-400/50" aria-hidden="true" />
              {glassesOverlay}
              <p className="absolute bottom-3 left-1/2 w-[90%] -translate-x-1/2 rounded-full bg-black/50 px-3 py-1.5 text-center text-[11px] font-semibold text-white backdrop-blur">
                Camera unavailable &mdash; showing simulated model preview
              </p>
            </div>
          ) : (
            <div className="flex h-full flex-col items-center justify-center gap-4 p-6 text-center">
              <div className={`flex h-20 w-20 items-center justify-center rounded-full bg-cyan-400/10 text-cyan-300 ${reducedMotion ? '' : 'animate-pulse'}`}>
                <Glasses size={38} />
              </div>
              <div>
                <h2 className="text-xl font-black text-white">See them on your face</h2>
                <p className="mt-1 text-sm text-slate-400">
                  Uses your front camera, only after you tap. Nothing is recorded or uploaded.
                </p>
              </div>
              <button
                type="button"
                onClick={startTryOn}
                disabled={mode === 'requesting'}
                className="flex min-h-12 items-center gap-2 rounded-full bg-cyan-400 px-6 font-bold text-slate-950 hover:bg-cyan-300 disabled:opacity-60"
              >
                <Camera size={18} /> {mode === 'requesting' ? 'Requesting camera\u2026' : 'Tap to try on'}
              </button>
            </div>
          )}
        </div>

        {(mode === 'camera' || mode === 'simulated') && (
          <div className="border-t border-white/10 p-3">
            <div className="flex flex-wrap items-center gap-2">
              {FRAMES.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => pickFrame(item)}
                  className={`min-h-11 rounded-full border px-4 text-sm font-semibold ${
                    frame.id === item.id
                      ? 'border-cyan-400 bg-cyan-400/10 text-cyan-300'
                      : 'border-slate-700 text-slate-300 hover:border-slate-500'
                  }`}
                >
                  {item.name}
                </button>
              ))}
              <button
                type="button"
                onClick={exitTryOn}
                className="ml-auto flex min-h-11 items-center gap-1.5 rounded-full border border-slate-700 px-4 text-sm font-semibold text-slate-300 hover:border-slate-500"
              >
                {mode === 'camera' ? <CameraOff size={16} /> : <RefreshCcw size={16} />} Exit
              </button>
            </div>
            <button
              type="button"
              onClick={() => {
                emitTelemetry('click', { templateId: TEMPLATE_ID, target: 'cta', frame: frame.id });
                emitTelemetry('complete', { templateId: TEMPLATE_ID, action: 'shop-frame', frame: frame.id });
              }}
              className="mt-3 min-h-12 w-full rounded-xl bg-white font-bold text-slate-950 hover:bg-cyan-100"
            >
              Shop the {frame.name} · $148
            </button>
          </div>
        )}
      </NativeWidgetChrome>
    </div>
  );
}

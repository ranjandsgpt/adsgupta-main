import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Check, Copy, Gift, Smartphone } from 'lucide-react';
import BatchTemplateFrame, { track } from './BatchTemplateFrame';

const ID = 'shake-to-win';
const TARGET_SHAKES = 5;
const PRIZE_CODE = 'SHAKE15';
// event.acceleration excludes gravity; the includes-gravity fallback rests near 9.8 m/s².
const ACCEL_THRESHOLD = 14;
const GRAVITY_THRESHOLD = 22;
const SHAKE_DEBOUNCE_MS = 400;

const supportsMotion = () => typeof window !== 'undefined' && 'DeviceMotionEvent' in window;
const needsMotionPermission = () =>
  supportsMotion() && typeof window.DeviceMotionEvent.requestPermission === 'function';

export default function Template03ShakeToWinAd() {
  const [shakes, setShakes] = useState(0);
  // idle → needs-permission | listening | unavailable; needs-permission → listening | denied
  const [motionState, setMotionState] = useState('idle');
  const [copyStatus, setCopyStatus] = useState('idle');
  const lastShakeAt = useRef(0);
  const copyTimer = useRef(null);
  const won = shakes >= TARGET_SHAKES;

  useEffect(() => {
    if (!supportsMotion()) setMotionState('unavailable');
    else if (needsMotionPermission()) setMotionState('needs-permission');
    else setMotionState('listening');
  }, []);

  useEffect(() => () => window.clearTimeout(copyTimer.current), []);

  const registerShake = useCallback((source) => {
    setShakes((prev) => {
      if (prev >= TARGET_SHAKES) return prev;
      const next = prev + 1;
      track(ID, 'click', { target: 'shake', source, count: next });
      if (next === TARGET_SHAKES) {
        track(ID, 'complete', { prize: PRIZE_CODE, source });
      }
      return next;
    });
  }, []);

  useEffect(() => {
    if (motionState !== 'listening' || won) return undefined;

    const onMotion = (event) => {
      const accel = event.acceleration;
      const hasAccel = accel && (accel.x !== null || accel.y !== null || accel.z !== null);
      const source = hasAccel ? accel : event.accelerationIncludingGravity;
      if (!source) return;

      const magnitude = Math.hypot(source.x || 0, source.y || 0, source.z || 0);
      const threshold = hasAccel ? ACCEL_THRESHOLD : GRAVITY_THRESHOLD;
      const now = Date.now();
      if (magnitude > threshold && now - lastShakeAt.current > SHAKE_DEBOUNCE_MS) {
        lastShakeAt.current = now;
        registerShake('devicemotion');
      }
    };

    window.addEventListener('devicemotion', onMotion);
    return () => window.removeEventListener('devicemotion', onMotion);
  }, [motionState, won, registerShake]);

  const enableMotion = async () => {
    track(ID, 'click', { target: 'enable-motion' });
    try {
      const result = await window.DeviceMotionEvent.requestPermission();
      if (result === 'granted') {
        setMotionState('listening');
        track(ID, 'expand', { surface: 'motion-permission', result: 'granted' });
      } else {
        setMotionState('denied');
        track(ID, 'expand', { surface: 'motion-permission', result });
      }
    } catch {
      setMotionState('denied');
      track(ID, 'expand', { surface: 'motion-permission', result: 'error' });
    }
  };

  const setCopyResult = (status) => {
    setCopyStatus(status);
    window.clearTimeout(copyTimer.current);
    copyTimer.current = window.setTimeout(() => setCopyStatus('idle'), 2500);
  };

  const copyCode = async () => {
    track(ID, 'click', { target: 'copy-code' });
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(PRIZE_CODE);
        setCopyResult('copied');
        return;
      }
      throw new Error('clipboard-api-unavailable');
    } catch {
      try {
        const textarea = document.createElement('textarea');
        textarea.value = PRIZE_CODE;
        textarea.setAttribute('readonly', '');
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        const ok = document.execCommand('copy');
        document.body.removeChild(textarea);
        setCopyResult(ok ? 'copied' : 'failed');
      } catch {
        setCopyResult('failed');
      }
    }
  };

  const motionHint = {
    idle: '',
    listening: 'Motion detection is on — shake your phone!',
    'needs-permission': 'Enable motion access to shake for real, or just tap below.',
    denied: 'Motion access was declined — the tap button still works.',
    unavailable: 'This device has no motion sensor — tap below to shake.',
  }[motionState];

  return (
    <BatchTemplateFrame templateId={ID} title="Shake-to-Win Ad" subtitle="Real device motion with a tap fallback">
      {({ reducedMotion }) => (
        <div className="text-center">
          <div className="relative flex h-52 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-amber-400 to-rose-600">
            <div className={shakes > 0 && !won && !reducedMotion ? 'animate-bounce' : ''}>
              {won ? <Gift size={80} /> : <Smartphone size={80} />}
            </div>
            <div className="absolute bottom-4 flex gap-2" aria-label={`${shakes} of ${TARGET_SHAKES} shakes`}>
              {Array.from({ length: TARGET_SHAKES }, (_, i) => i + 1).map((step) => (
                <span key={step} className={`h-3 w-8 rounded-full ${step <= shakes ? 'bg-white' : 'bg-black/20'}`} />
              ))}
            </div>
          </div>

          <p className="mt-4 min-h-6 font-bold" aria-live="polite">
            {won ? 'You won 15% off!' : `${TARGET_SHAKES - shakes} shakes to unlock your prize`}
          </p>

          {!won && motionHint && <p className="mt-1 text-xs text-slate-400">{motionHint}</p>}

          {!won && motionState === 'needs-permission' && (
            <button
              type="button"
              onClick={enableMotion}
              className="mt-3 min-h-11 w-full rounded-xl bg-cyan-400 px-5 font-black text-slate-950 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"
            >
              Enable motion detection
            </button>
          )}

          {!won && (
            <button
              type="button"
              onClick={() => registerShake('tap')}
              className="mt-3 min-h-11 w-full rounded-xl bg-white px-5 font-black text-slate-950 focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan-300"
            >
              Tap to shake
            </button>
          )}

          {won && (
            <div className="mt-3 rounded-2xl border border-emerald-400/40 bg-emerald-400/10 p-4">
              <p className="text-xs font-bold uppercase tracking-widest text-emerald-300">Your discount code</p>
              <p className="mt-1 font-mono text-2xl font-black tracking-[0.2em]">{PRIZE_CODE}</p>
              <button
                type="button"
                onClick={copyCode}
                className="mt-3 flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-emerald-400 px-5 font-black text-slate-950 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"
              >
                {copyStatus === 'copied' ? <Check size={18} /> : <Copy size={18} />}
                {copyStatus === 'copied' ? 'Copied!' : 'Copy code'}
              </button>
              <p className="mt-2 min-h-4 text-xs text-slate-400" aria-live="polite">
                {copyStatus === 'copied' && 'Code copied to your clipboard.'}
                {copyStatus === 'failed' && `Copy failed — select the code above manually: ${PRIZE_CODE}`}
              </p>
            </div>
          )}
        </div>
      )}
    </BatchTemplateFrame>
  );
}

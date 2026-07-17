import React, { useCallback, useEffect, useState } from 'react';
import { CheckCircle2, Users, X } from 'lucide-react';
import { useDismissState, useReducedMotion, useViewability } from '../hooks';
import { emitTelemetry } from '../telemetry';

const TEMPLATE_ID = 'social-proof-counter-ad';

export default function Template39SocialProofCounterAd() {
  const [count, setCount] = useState(2847);
  const [joined, setJoined] = useState(false);
  const reducedMotion = useReducedMotion();
  const onDismiss = useCallback((reason) => emitTelemetry('close', { templateId: TEMPLATE_ID, reason }), []);
  const { dismissed, dismiss } = useDismissState({ key: TEMPLATE_ID, onDismiss });
  const viewRef = useViewability({ templateId: TEMPLATE_ID });

  useEffect(() => {
    if (reducedMotion || joined) return undefined;
    const interval = window.setInterval(() => setCount((value) => value + 1), 2400);
    return () => window.clearInterval(interval);
  }, [joined, reducedMotion]);

  const join = () => {
    if (!joined) setCount((value) => value + 1);
    setJoined(true);
    emitTelemetry('click', { templateId: TEMPLATE_ID, target: 'join-community' });
    emitTelemetry('complete', { templateId: TEMPLATE_ID, action: 'joined' });
  };

  if (dismissed) return null;

  return (
    <section ref={viewRef} className="mx-auto max-w-lg rounded-3xl bg-gradient-to-br from-indigo-950 via-violet-900 to-fuchsia-700 p-5 text-white shadow-2xl">
      <div className="flex items-start justify-between gap-3"><div><p className="text-[10px] font-bold uppercase tracking-[0.2em] text-fuchsia-200">Sponsored community</p><h3 className="mt-1 text-xl font-black">Make something every day.</h3></div><button type="button" aria-label="Close ad" onClick={() => dismiss('button')} className="flex min-h-11 min-w-11 items-center justify-center rounded-full bg-white/10 hover:bg-white/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"><X size={19} /></button></div>
      <div className="my-7 flex items-center gap-4">
        <div className={`flex h-16 w-16 items-center justify-center rounded-2xl bg-white/15 ${reducedMotion ? '' : 'transition-transform hover:rotate-3'}`}><Users size={32} /></div>
        <div><output aria-live="polite" className="block text-4xl font-black tabular-nums">{count.toLocaleString()}</output><p className="text-sm text-fuchsia-100">creators joined this month</p></div>
      </div>
      <div className="mb-5 flex -space-x-2" aria-hidden="true">{['bg-amber-300', 'bg-cyan-300', 'bg-rose-300', 'bg-lime-300'].map((color, index) => <span key={color} className={`flex h-10 w-10 items-center justify-center rounded-full border-2 border-violet-900 ${color} text-xs font-black text-slate-900`}>{String.fromCharCode(65 + index)}</span>)}</div>
      <button type="button" onClick={join} disabled={joined} className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-white px-4 font-black text-violet-950 disabled:bg-emerald-300">{joined && <CheckCircle2 size={20} />}{joined ? 'You’re in' : 'Join the challenge'}</button>
    </section>
  );
}

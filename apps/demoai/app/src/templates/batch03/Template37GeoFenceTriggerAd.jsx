import React, { useCallback, useEffect, useState } from 'react';
import { LocateFixed, MapPin, ShieldCheck, X } from 'lucide-react';
import { useDismissState, useReducedMotion, useViewability } from '../hooks';
import { emitTelemetry } from '../telemetry';

const TEMPLATE_ID = 'geo-fence-trigger-ad';

export default function Template37GeoFenceTriggerAd() {
  const [inside, setInside] = useState(false);
  const reducedMotion = useReducedMotion();
  const onDismiss = useCallback((reason) => emitTelemetry('close', { templateId: TEMPLATE_ID, reason }), []);
  const { dismissed, dismiss } = useDismissState({ key: TEMPLATE_ID, onDismiss });
  const viewRef = useViewability({ templateId: TEMPLATE_ID });

  useEffect(() => {
    if (reducedMotion || inside) return undefined;
    const timer = window.setTimeout(() => setInside(true), 1800);
    return () => window.clearTimeout(timer);
  }, [inside, reducedMotion]);

  const trigger = () => {
    setInside(true);
    emitTelemetry('click', { templateId: TEMPLATE_ID, target: 'simulate-arrival' });
  };
  const claim = () => {
    emitTelemetry('click', { templateId: TEMPLATE_ID, target: 'claim-nearby-offer' });
    emitTelemetry('complete', { templateId: TEMPLATE_ID, action: 'offer-claimed' });
  };

  if (dismissed) return null;

  return (
    <section ref={viewRef} className="mx-auto max-w-md overflow-hidden rounded-3xl bg-slate-950 p-5 text-white shadow-2xl">
      <div className="flex items-start justify-between gap-3"><div><p className="text-[10px] font-bold uppercase tracking-[0.2em] text-cyan-300">Sponsored nearby moment</p><h3 className="mt-1 text-xl font-black">{inside ? 'You’ve entered the Harbor zone' : 'Approaching Harbor Market'}</h3></div><button type="button" aria-label="Close ad" onClick={() => dismiss('button')} className="flex min-h-11 min-w-11 items-center justify-center rounded-full bg-white/10 hover:bg-white/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan-300"><X size={19} /></button></div>
      <div className="relative my-6 flex min-h-48 items-center justify-center">
        {[144, 104, 64].map((size, index) => <div key={size} className={`absolute rounded-full border ${inside ? 'border-emerald-300/60' : 'border-cyan-300/40'} ${reducedMotion ? '' : 'transition-all duration-700'}`} style={{ width: size, height: size, opacity: 1 - index * 0.2 }} />)}
        <div className={`relative flex h-14 w-14 items-center justify-center rounded-full ${inside ? 'bg-emerald-400 text-emerald-950' : 'bg-cyan-400 text-slate-950'} ${reducedMotion || inside ? '' : 'animate-pulse'}`}><MapPin size={27} /></div>
      </div>
      <p className="flex items-center gap-2 text-xs text-slate-400"><ShieldCheck size={16} /> Simulation only — no location is collected.</p>
      {inside ? <button type="button" onClick={claim} className="mt-4 min-h-12 w-full rounded-xl bg-emerald-400 px-4 font-black text-emerald-950 hover:bg-emerald-300">Claim free cold brew</button> : <button type="button" onClick={trigger} className="mt-4 flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-white px-4 font-black text-slate-950 hover:bg-cyan-100"><LocateFixed size={19} /> Simulate arrival</button>}
    </section>
  );
}

import React, { useCallback, useState } from 'react';
import { Clock3, MapPin, Navigation, X } from 'lucide-react';
import { useDismissState, useReducedMotion, useViewability } from '../hooks';
import { emitTelemetry } from '../telemetry';

const TEMPLATE_ID = 'map-local-offer-ad';

export default function Template36MapLocalOfferAd() {
  const [selected, setSelected] = useState('SoMa');
  const [routed, setRouted] = useState(false);
  const reducedMotion = useReducedMotion();
  const onDismiss = useCallback((reason) => emitTelemetry('close', { templateId: TEMPLATE_ID, reason }), []);
  const { dismissed, dismiss } = useDismissState({ key: TEMPLATE_ID, onDismiss });
  const viewRef = useViewability({ templateId: TEMPLATE_ID });
  const choose = (location) => {
    setSelected(location);
    setRouted(false);
    emitTelemetry('click', { templateId: TEMPLATE_ID, target: 'map-pin', location });
  };
  const directions = () => {
    setRouted(true);
    emitTelemetry('click', { templateId: TEMPLATE_ID, target: 'directions', location: selected });
    emitTelemetry('complete', { templateId: TEMPLATE_ID, action: 'directions-requested' });
  };

  if (dismissed) return null;

  return (
    <section ref={viewRef} className="mx-auto max-w-2xl overflow-hidden rounded-3xl border border-slate-200 bg-white text-slate-900 shadow-xl">
      <div className="relative min-h-48 overflow-hidden bg-[#dfe9dc]" aria-label="Illustrated map with two store locations">
        <svg aria-hidden="true" viewBox="0 0 700 280" className="absolute inset-0 h-full w-full">
          <path d="M-20 90 C160 10 245 190 410 90 S650 45 740 130" fill="none" stroke="#fff" strokeWidth="28" />
          <path d="M80 -20 C170 85 125 205 245 310M500 -20 C440 80 550 180 480 310" fill="none" stroke="#fff" strokeWidth="18" />
          <path d="M0 220 C180 160 340 275 720 190" fill="none" stroke="#b9d9e9" strokeWidth="30" />
          <g fill="#b8cfad"><circle cx="80" cy="55" r="28" /><circle cx="620" cy="75" r="38" /><circle cx="370" cy="210" r="30" /></g>
        </svg>
        {['SoMa', 'Mission'].map((location, index) => (
          <button key={location} type="button" onClick={() => choose(location)} aria-pressed={selected === location} aria-label={`Select ${location} location`} className={`absolute flex min-h-11 min-w-11 items-center justify-center rounded-full shadow-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700 ${selected === location ? 'bg-blue-700 text-white' : 'bg-white text-blue-700'} ${reducedMotion ? '' : 'transition-transform hover:-translate-y-1'}`} style={{ left: index ? '68%' : '27%', top: index ? '35%' : '52%' }}><MapPin size={21} /></button>
        ))}
        <button type="button" aria-label="Close ad" onClick={() => dismiss('button')} className="absolute right-3 top-3 flex min-h-11 min-w-11 items-center justify-center rounded-full bg-white/95 shadow hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-700"><X size={19} /></button>
      </div>
      <div className="grid gap-4 p-4 sm:grid-cols-[1fr_auto] sm:items-center">
        <div><p className="text-[10px] font-bold uppercase tracking-widest text-blue-700">Sponsored local offer</p><h3 className="text-xl font-black">Bluebird Market · {selected}</h3><p className="mt-1 flex items-center gap-1 text-sm text-slate-600" role="status"><Clock3 size={16} /> {routed ? `Fastest route to ${selected} loaded · 8 min` : '8 min away · Open until 9'}</p></div>
        <button type="button" onClick={directions} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-blue-700 px-5 text-sm font-bold text-white hover:bg-blue-600"><Navigation size={18} /> {routed ? 'Route loaded' : 'Directions'}</button>
      </div>
    </section>
  );
}

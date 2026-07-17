import React, { useCallback, useState } from 'react';
import { Check, Quote, Star, X } from 'lucide-react';
import { useDismissState, useReducedMotion, useViewability } from '../hooks';
import { emitTelemetry } from '../telemetry';

const TEMPLATE_ID = 'testimonial-bubble-ad';

export default function Template41TestimonialBubbleAd() {
  const [expanded, setExpanded] = useState(false);
  const [started, setStarted] = useState(false);
  const reducedMotion = useReducedMotion();
  const onDismiss = useCallback((reason) => emitTelemetry('close', { templateId: TEMPLATE_ID, reason }), []);
  const { dismissed, dismiss } = useDismissState({ key: TEMPLATE_ID, onDismiss });
  const viewRef = useViewability({ templateId: TEMPLATE_ID });
  const toggle = () => {
    setExpanded((value) => !value);
    emitTelemetry(expanded ? 'click' : 'expand', { templateId: TEMPLATE_ID, target: 'testimonial' });
  };
  const trial = () => {
    setStarted(true);
    emitTelemetry('click', { templateId: TEMPLATE_ID, target: 'start-trial' });
    emitTelemetry('complete', { templateId: TEMPLATE_ID, action: 'trial-started' });
  };

  if (dismissed) return null;

  return (
    <aside ref={viewRef} className="mx-auto max-w-lg p-3 text-slate-950">
      <div className={`relative rounded-[2rem] rounded-bl-md border border-amber-200 bg-amber-50 p-5 shadow-xl ${reducedMotion ? '' : 'transition-all duration-300'}`}>
        <button type="button" aria-label="Close ad" onClick={() => dismiss('button')} className="absolute right-3 top-3 flex min-h-11 min-w-11 items-center justify-center rounded-full hover:bg-amber-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-700"><X size={18} /></button>
        <div className="flex items-center gap-3 pr-12"><div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-400"><Quote size={23} /></div><div><p className="font-black">Priya K. <span className="text-xs font-medium text-slate-500">· verified buyer</span></p><div className="flex text-amber-600" aria-label="5 out of 5 stars">{Array.from({ length: 5 }, (_, index) => <Star key={index} size={14} fill="currentColor" />)}</div></div></div>
        <blockquote className="mt-4 text-lg font-bold leading-7">“My mornings finally feel calm instead of optimized.”</blockquote>
        {expanded && <p className="mt-3 text-sm leading-6 text-slate-600">The guided focus sessions are short enough to use every day, and the offline mode made it stick during travel.</p>}
        <button type="button" onClick={toggle} aria-expanded={expanded} className="mt-3 min-h-11 rounded-full px-2 text-sm font-bold text-amber-800 underline decoration-2 underline-offset-4">{expanded ? 'Show less' : 'Read full review'}</button>
      </div>
      <div className="mt-3 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-slate-950 p-4 text-white"><div><p className="text-[10px] font-bold uppercase tracking-widest text-amber-300">Sponsored · Stillspace</p><p className="font-black">Try 14 mindful days</p></div><button type="button" onClick={trial} disabled={started} className={`inline-flex min-h-11 items-center gap-2 rounded-xl px-4 text-sm font-black ${started ? 'bg-emerald-400 text-emerald-950' : 'bg-amber-300 text-slate-950'}`}><Check size={18} /> {started ? 'Trial started' : 'Start free'}</button></div>
    </aside>
  );
}

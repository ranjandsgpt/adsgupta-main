import React, { useCallback, useState } from 'react';
import { Check, Search, Sparkles, X } from 'lucide-react';
import { useDismissState, useReducedMotion, useViewability } from '../hooks';
import { emitTelemetry } from '../telemetry';

const TEMPLATE_ID = 'sponsored-search-result-ad';

export default function Template32SponsoredSearchResultAd() {
  const [query, setQuery] = useState('lightweight travel bags');
  const reducedMotion = useReducedMotion();
  const onDismiss = useCallback((reason) => emitTelemetry('close', { templateId: TEMPLATE_ID, reason }), []);
  const { dismissed, dismiss } = useDismissState({ key: TEMPLATE_ID, onDismiss });
  const viewRef = useViewability({ templateId: TEMPLATE_ID });
  const act = (target) => {
    emitTelemetry('click', { templateId: TEMPLATE_ID, target, query });
    emitTelemetry('complete', { templateId: TEMPLATE_ID, action: target });
  };

  if (dismissed) return null;

  return (
    <section ref={viewRef} className="mx-auto max-w-2xl rounded-2xl border border-slate-200 bg-white p-4 text-slate-900 shadow-lg">
      <div className="flex items-center gap-2">
        <label className="flex min-h-12 flex-1 items-center gap-2 rounded-full border border-slate-300 px-4 focus-within:ring-2 focus-within:ring-violet-500">
          <Search size={18} className="text-slate-500" />
          <span className="sr-only">Search products</span>
          <input value={query} onChange={(event) => setQuery(event.target.value)} className="min-w-0 flex-1 bg-transparent text-sm outline-none" />
        </label>
        <button type="button" aria-label="Close ad" onClick={() => dismiss('button')} className="flex min-h-11 min-w-11 items-center justify-center rounded-full hover:bg-slate-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-violet-600"><X size={19} /></button>
      </div>
      <div className="mt-4 grid gap-4 sm:grid-cols-[112px_1fr]">
        <div className="flex min-h-28 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-200 to-orange-200">
          <div className={`h-20 w-14 rounded-xl border-4 border-white bg-violet-700 shadow-lg ${reducedMotion ? '' : 'transition-transform hover:-rotate-3'}`}><div className="mx-auto mt-4 h-6 w-7 rounded-full border-2 border-white/70" /></div>
        </div>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Sponsored · Roamly</p>
          <h3 className="mt-1 text-lg font-black text-violet-800">FeatherPack 28L — carry-on ready</h3>
          <p className="mt-1 text-sm text-slate-600">1.4 lb recycled shell · lifetime repair · ships free</p>
          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs font-semibold text-emerald-700"><span className="inline-flex gap-1"><Check size={15} /> 4.9 rating</span><span className="inline-flex gap-1"><Sparkles size={15} /> Editor pick</span></div>
          <button type="button" onClick={() => act('view-result')} className="mt-3 min-h-11 rounded-full bg-violet-700 px-5 text-sm font-bold text-white hover:bg-violet-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-600">View result · $89</button>
        </div>
      </div>
    </section>
  );
}

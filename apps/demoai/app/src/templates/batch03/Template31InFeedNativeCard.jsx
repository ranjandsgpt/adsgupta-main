import React, { useCallback, useState } from 'react';
import { Bookmark, Mountain, Play, X } from 'lucide-react';
import { useDismissState, useReducedMotion, useViewability } from '../hooks';
import { emitTelemetry } from '../telemetry';

const TEMPLATE_ID = 'in-feed-native-card';

export default function Template31InFeedNativeCard() {
  const [saved, setSaved] = useState(false);
  const reducedMotion = useReducedMotion();
  const onDismiss = useCallback((reason) => emitTelemetry('close', { templateId: TEMPLATE_ID, reason }), []);
  const { dismissed, dismiss } = useDismissState({ key: TEMPLATE_ID, onDismiss });
  const viewRef = useViewability({ templateId: TEMPLATE_ID });

  const act = (target) => {
    if (target === 'save') setSaved((value) => !value);
    emitTelemetry('click', { templateId: TEMPLATE_ID, target });
    emitTelemetry('complete', { templateId: TEMPLATE_ID, action: target });
  };

  if (dismissed) return null;

  return (
    <article ref={viewRef} className="mx-auto max-w-xl overflow-hidden rounded-3xl border border-slate-200 bg-white text-slate-950 shadow-xl">
      <header className="flex min-h-14 items-center justify-between px-4">
        <div><p className="text-xs font-black">NORTH / COAST</p><p className="text-[10px] uppercase tracking-widest text-slate-500">Promoted</p></div>
        <button type="button" aria-label="Close ad" onClick={() => dismiss('button')} className="flex min-h-11 min-w-11 items-center justify-center rounded-full hover:bg-slate-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-600"><X size={19} /></button>
      </header>
      <div className="relative flex min-h-64 items-center justify-center overflow-hidden bg-gradient-to-br from-sky-200 via-blue-500 to-slate-950">
        <Mountain size={130} strokeWidth={0.8} className={`text-white/60 ${reducedMotion ? '' : 'transition-transform duration-700 hover:scale-110'}`} />
        <button type="button" onClick={() => act('watch')} aria-label="Play campaign film" className="absolute flex min-h-12 min-w-12 items-center justify-center rounded-full bg-white text-slate-950 shadow-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"><Play size={20} fill="currentColor" /></button>
      </div>
      <div className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div><h3 className="text-xl font-black">Find the long way home.</h3><p className="mt-2 text-sm leading-6 text-slate-600">Weather-ready layers made for unplanned turns and quieter trails.</p></div>
          <button type="button" aria-label={saved ? 'Remove bookmark' : 'Save ad'} aria-pressed={saved} onClick={() => act('save')} className={`flex min-h-11 min-w-11 items-center justify-center rounded-full border ${saved ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-slate-200'}`}><Bookmark size={19} fill={saved ? 'currentColor' : 'none'} /></button>
        </div>
        <button type="button" onClick={() => act('shop-collection')} className="mt-4 min-h-11 w-full rounded-xl bg-slate-950 px-4 text-sm font-bold text-white hover:bg-blue-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600">Explore the collection</button>
      </div>
    </article>
  );
}

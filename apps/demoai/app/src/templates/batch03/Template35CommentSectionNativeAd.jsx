import React, { useCallback, useState } from 'react';
import { Heart, MessageCircle, Send, X } from 'lucide-react';
import { useDismissState, useReducedMotion, useViewability } from '../hooks';
import { emitTelemetry } from '../telemetry';

const TEMPLATE_ID = 'comment-section-native-ad';

export default function Template35CommentSectionNativeAd() {
  const [liked, setLiked] = useState(false);
  const reducedMotion = useReducedMotion();
  const onDismiss = useCallback((reason) => emitTelemetry('close', { templateId: TEMPLATE_ID, reason }), []);
  const { dismissed, dismiss } = useDismissState({ key: TEMPLATE_ID, onDismiss });
  const viewRef = useViewability({ templateId: TEMPLATE_ID });
  const act = (target) => {
    if (target === 'like') setLiked((value) => !value);
    emitTelemetry('click', { templateId: TEMPLATE_ID, target });
    emitTelemetry('complete', { templateId: TEMPLATE_ID, action: target });
  };

  if (dismissed) return null;

  return (
    <aside ref={viewRef} aria-label="Sponsored comment" className="mx-auto max-w-2xl rounded-2xl border border-slate-200 bg-white p-4 text-slate-900 shadow-md">
      <div className="flex gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-orange-400 to-rose-600 font-black text-white">M</div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div><p className="text-sm font-black">Morrow Coffee <span className="ml-1 rounded bg-slate-100 px-1.5 py-0.5 text-[9px] uppercase tracking-wider text-slate-500">Sponsored</span></p><p className="text-xs text-slate-500">Brand reply · just now</p></div>
            <button type="button" aria-label="Close ad" onClick={() => dismiss('button')} className="flex min-h-11 min-w-11 items-center justify-center rounded-full hover:bg-slate-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-rose-600"><X size={18} /></button>
          </div>
          <p className="mt-2 text-sm leading-6">That rainy-day ritual deserves a roast with notes of cocoa and orange. Here’s 20% off your first small-batch delivery.</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <button type="button" aria-pressed={liked} onClick={() => act('like')} className={`inline-flex min-h-11 items-center gap-2 rounded-full px-4 text-sm font-bold ${liked ? 'bg-rose-50 text-rose-700' : 'bg-slate-100'}`}><Heart size={17} fill={liked ? 'currentColor' : 'none'} className={reducedMotion || !liked ? '' : 'animate-pulse'} /> {liked ? 'Liked' : 'Like'}</button>
            <button type="button" onClick={() => act('reply')} className="inline-flex min-h-11 items-center gap-2 rounded-full bg-slate-100 px-4 text-sm font-bold"><MessageCircle size={17} /> Reply</button>
            <button type="button" onClick={() => act('claim-offer')} className="inline-flex min-h-11 items-center gap-2 rounded-full bg-slate-950 px-4 text-sm font-bold text-white"><Send size={17} /> Claim 20%</button>
          </div>
        </div>
      </div>
    </aside>
  );
}

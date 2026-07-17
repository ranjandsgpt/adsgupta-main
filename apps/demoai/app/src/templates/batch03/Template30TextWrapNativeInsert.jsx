import React, { useCallback } from 'react';
import { ArrowUpRight, Leaf, X } from 'lucide-react';
import { useDismissState, useReducedMotion, useViewability } from '../hooks';
import { emitTelemetry } from '../telemetry';

const TEMPLATE_ID = 'text-wrap-native-insert';

export default function Template30TextWrapNativeInsert() {
  const reducedMotion = useReducedMotion();
  const onDismiss = useCallback((reason) => {
    emitTelemetry('close', { templateId: TEMPLATE_ID, reason });
  }, []);
  const { dismissed, dismiss } = useDismissState({ key: TEMPLATE_ID, onDismiss });
  const viewRef = useViewability({ templateId: TEMPLATE_ID });

  const openStory = () => {
    emitTelemetry('click', { templateId: TEMPLATE_ID, target: 'read-story' });
    emitTelemetry('complete', { templateId: TEMPLATE_ID, action: 'article-opened' });
  };

  if (dismissed) return null;

  return (
    <article ref={viewRef} className="mx-auto max-w-3xl rounded-2xl border border-emerald-200 bg-stone-50 p-4 text-stone-800 shadow-lg">
      <div className="mb-3 flex items-center justify-between gap-3 border-b border-stone-200 pb-3">
        <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-emerald-700">Sponsored field note</span>
        <button type="button" onClick={() => dismiss('button')} aria-label="Close ad" className="flex min-h-11 min-w-11 items-center justify-center rounded-full hover:bg-stone-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-600">
          <X size={18} />
        </button>
      </div>
      <div className="sm:flow-root">
        <div className={`mb-4 flex min-h-40 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-950 via-emerald-700 to-lime-300 sm:float-left sm:mb-2 sm:mr-5 sm:w-2/5 ${reducedMotion ? '' : 'transition-transform duration-500 hover:scale-[1.02]'}`}>
          <div className="relative flex h-24 w-24 items-center justify-center rounded-full border border-white/40 bg-white/15">
            <Leaf size={44} className="text-white" />
            <span className="absolute -bottom-3 rounded-full bg-white px-3 py-1 text-xs font-black text-emerald-900">68% less water</span>
          </div>
        </div>
        <h3 className="text-xl font-black leading-tight">The everyday tee, re-grown.</h3>
        <p className="mt-2 text-sm leading-6 text-stone-600">
          New regenerative cotton restores soil while creating a softer, longer-lasting staple. Every fiber is traced from farm to finish, pairing a familiar silhouette with a lighter footprint.
        </p>
        <button type="button" onClick={openStory} className="mt-3 inline-flex min-h-11 items-center gap-2 rounded-full bg-emerald-800 px-4 text-sm font-bold text-white hover:bg-emerald-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700">
          Read the field story <ArrowUpRight size={17} />
        </button>
      </div>
    </article>
  );
}

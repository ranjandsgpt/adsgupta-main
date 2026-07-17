import React, { useCallback, useState } from 'react';
import { Check, Package, ShieldCheck, Sparkles, Truck } from 'lucide-react';
import { useDismissState } from './hooks/useDismissState';
import { BottomSheet } from './primitives/BottomSheet';
import { NativeWidgetChrome } from './primitives/NativeWidgetChrome';
import { emitTelemetry } from './telemetry';

const TEMPLATE_ID = 'bottom-sheet';

export default function Template34BottomSheetAd() {
  const [finish, setFinish] = useState('Graphite');
  const [added, setAdded] = useState(false);
  const handleDismissTelemetry = useCallback((reason) => {
    emitTelemetry('close', { templateId: TEMPLATE_ID, reason });
  }, []);
  const { dismissed, dismiss } = useDismissState({
    key: TEMPLATE_ID,
    scope: 'component',
    onDismiss: handleDismissTelemetry,
  });

  const addToBag = () => {
    setAdded(true);
    emitTelemetry('click', { templateId: TEMPLATE_ID, target: 'add-to-bag', finish });
    emitTelemetry('complete', { templateId: TEMPLATE_ID, action: 'added-to-bag' });
  };

  if (dismissed) return null;

  return (
    <BottomSheet templateId={TEMPLATE_ID} onDismiss={dismiss}>
      <NativeWidgetChrome
        label="Sponsored product"
        title="Arc One · Spatial audio"
        onClose={() => dismiss('button')}
        className="border-0 bg-transparent shadow-none"
      >
        <div className="grid gap-6 p-4 sm:grid-cols-[0.85fr_1.15fr] sm:p-6">
          <div className="relative flex min-h-48 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-cyan-300 via-blue-500 to-indigo-950">
            <div className="absolute h-44 w-44 rounded-full border-[18px] border-white/15" />
            <div className="relative flex h-28 w-28 items-center justify-center rounded-[2.25rem] border border-white/30 bg-slate-950/80 shadow-2xl backdrop-blur">
              <Sparkles className="text-cyan-300" size={42} />
            </div>
            <span className="absolute bottom-3 left-3 rounded-full bg-black/35 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-white">
              New release
            </span>
          </div>

          <div>
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-cyan-400">Arc One</p>
                <h2 className="mt-1 text-2xl font-black text-white">Focus, without the noise.</h2>
              </div>
              <p className="text-xl font-bold text-white">$249</p>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-slate-400">
              Adaptive spatial audio, 40-hour battery life, and a pressure-balanced fit for all-day work.
            </p>

            <div className="mt-5">
              <p className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-500">Choose finish</p>
              <div className="flex flex-wrap gap-2">
                {['Graphite', 'Cloud', 'Cobalt'].map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setFinish(option)}
                    className={`min-h-11 rounded-full border px-4 text-sm font-semibold ${
                      finish === option
                        ? 'border-cyan-400 bg-cyan-400/10 text-cyan-300'
                        : 'border-slate-700 text-slate-300 hover:border-slate-500'
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-5 grid grid-cols-3 gap-2 text-center text-[10px] font-medium text-slate-400">
              <div className="rounded-xl bg-white/5 p-2"><Truck className="mx-auto mb-1 text-cyan-400" size={18} />Free delivery</div>
              <div className="rounded-xl bg-white/5 p-2"><ShieldCheck className="mx-auto mb-1 text-cyan-400" size={18} />2-year cover</div>
              <div className="rounded-xl bg-white/5 p-2"><Package className="mx-auto mb-1 text-cyan-400" size={18} />30-day returns</div>
            </div>

            <button
              type="button"
              onClick={addToBag}
              className={`mt-5 flex min-h-12 w-full items-center justify-center gap-2 rounded-xl px-5 font-bold transition-colors ${
                added ? 'bg-emerald-400 text-slate-950' : 'bg-white text-slate-950 hover:bg-cyan-100'
              }`}
            >
              {added ? <><Check size={20} /> Added to bag</> : 'Add to bag'}
            </button>
          </div>
        </div>
      </NativeWidgetChrome>
    </BottomSheet>
  );
}

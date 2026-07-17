import React, { useCallback, useEffect, useState } from 'react';
import { Bell, TrendingDown, X } from 'lucide-react';
import { useDismissState, useReducedMotion, useViewability } from '../hooks';
import { emitTelemetry } from '../telemetry';

const TEMPLATE_ID = 'live-price-drop-ticker-ad';
const PRICES = [129, 124, 119, 114];

export default function Template38LivePriceDropTickerAd() {
  const [priceIndex, setPriceIndex] = useState(0);
  const [alerted, setAlerted] = useState(false);
  const reducedMotion = useReducedMotion();
  const onDismiss = useCallback((reason) => emitTelemetry('close', { templateId: TEMPLATE_ID, reason }), []);
  const { dismissed, dismiss } = useDismissState({ key: TEMPLATE_ID, onDismiss });
  const viewRef = useViewability({ templateId: TEMPLATE_ID });

  useEffect(() => {
    if (reducedMotion) return undefined;
    const interval = window.setInterval(() => setPriceIndex((value) => Math.min(value + 1, PRICES.length - 1)), 1800);
    return () => window.clearInterval(interval);
  }, [reducedMotion]);

  const setAlert = () => {
    setAlerted(true);
    emitTelemetry('click', { templateId: TEMPLATE_ID, target: 'price-alert', price: PRICES[priceIndex] });
    emitTelemetry('complete', { templateId: TEMPLATE_ID, action: 'alert-set' });
  };

  if (dismissed) return null;

  return (
    <aside ref={viewRef} className="mx-auto flex max-w-3xl flex-col gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-3 text-slate-950 shadow-lg sm:flex-row sm:items-center">
      <div className="flex flex-1 items-center gap-3">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-rose-600 text-white"><TrendingDown size={25} /></div>
        <div className="min-w-0"><p className="text-[10px] font-black uppercase tracking-widest text-rose-700">Sponsored · Live price drop</p><h3 className="truncate font-black">Aero cabin case <span className="ml-2 text-slate-400 line-through">$159</span></h3></div>
      </div>
      <div className="flex items-center gap-2">
        <output aria-live="polite" className={`min-w-20 text-center text-2xl font-black text-rose-700 ${reducedMotion ? '' : 'transition-transform duration-300'}`}>${PRICES[priceIndex]}</output>
        <button type="button" onClick={setAlert} className={`inline-flex min-h-11 items-center gap-2 rounded-xl px-4 text-sm font-bold ${alerted ? 'bg-emerald-600 text-white' : 'bg-slate-950 text-white'}`}><Bell size={17} /> {alerted ? 'Alert set' : 'Alert me'}</button>
        <button type="button" aria-label="Close ad" onClick={() => dismiss('button')} className="flex min-h-11 min-w-11 items-center justify-center rounded-full hover:bg-rose-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-rose-600"><X size={18} /></button>
      </div>
    </aside>
  );
}

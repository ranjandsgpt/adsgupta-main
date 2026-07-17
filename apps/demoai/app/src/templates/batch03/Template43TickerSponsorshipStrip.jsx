import React, { useCallback, useState } from 'react';
import { ArrowUpRight, Pause, Play, X } from 'lucide-react';
import { useDismissState, useReducedMotion, useViewability } from '../hooks';
import { emitTelemetry } from '../telemetry';

const TEMPLATE_ID = 'ticker-sponsorship-strip';
const ITEMS = ['SOLAR +2.8%', 'WIND +1.4%', 'GRID 86%', 'STORAGE +4.1%'];

export default function Template43TickerSponsorshipStrip() {
  const reducedMotion = useReducedMotion();
  const [paused, setPaused] = useState(reducedMotion);
  const onDismiss = useCallback((reason) => emitTelemetry('close', { templateId: TEMPLATE_ID, reason }), []);
  const { dismissed, dismiss } = useDismissState({ key: TEMPLATE_ID, onDismiss });
  const viewRef = useViewability({ templateId: TEMPLATE_ID });
  const toggle = () => {
    setPaused((value) => !value);
    emitTelemetry('click', { templateId: TEMPLATE_ID, target: paused ? 'play-ticker' : 'pause-ticker' });
  };
  const report = () => {
    emitTelemetry('click', { templateId: TEMPLATE_ID, target: 'open-report' });
    emitTelemetry('complete', { templateId: TEMPLATE_ID, action: 'report-opened' });
  };

  if (dismissed) return null;

  return (
    <aside ref={viewRef} className="mx-auto flex max-w-4xl items-stretch overflow-hidden rounded-xl bg-slate-950 text-white shadow-xl">
      <div className="flex shrink-0 items-center bg-emerald-400 px-3 text-xs font-black uppercase tracking-wider text-emerald-950">Energy now</div>
      <div className={`relative flex min-h-14 min-w-0 flex-1 items-center ${paused || reducedMotion ? 'overflow-x-auto' : 'overflow-hidden'}`} aria-label="Energy market ticker">
        <div className={`flex min-w-max items-center gap-8 px-5 text-sm font-bold ${paused || reducedMotion ? '' : 'animate-marquee-wide'}`}>{ITEMS.map((item) => <span key={item} className="whitespace-nowrap">{item}</span>)}{!paused && !reducedMotion && ITEMS.map((item) => <span key={`${item}-repeat`} aria-hidden="true" className="whitespace-nowrap">{item}</span>)}</div>
      </div>
      <button type="button" onClick={report} className="inline-flex min-h-11 shrink-0 items-center gap-1 whitespace-nowrap border-l border-white/10 px-2 text-xs font-bold text-emerald-300 underline underline-offset-4 hover:bg-white/10">Report <ArrowUpRight size={14} /></button>
      <button type="button" onClick={toggle} aria-label={paused ? 'Play ticker' : 'Pause ticker'} aria-pressed={paused} className="flex min-h-11 min-w-11 items-center justify-center border-l border-white/10 hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-300">{paused ? <Play size={18} /> : <Pause size={18} />}</button>
      <button type="button" onClick={() => dismiss('button')} aria-label="Close ad" className="flex min-h-11 min-w-11 items-center justify-center border-l border-white/10 hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-300"><X size={18} /></button>
    </aside>
  );
}

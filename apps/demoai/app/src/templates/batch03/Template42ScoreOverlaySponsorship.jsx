import React, { useCallback, useEffect, useState } from 'react';
import { Radio, Trophy, X } from 'lucide-react';
import { useDismissState, useReducedMotion, useViewability } from '../hooks';
import { emitTelemetry } from '../telemetry';

const TEMPLATE_ID = 'score-overlay-sponsorship';

export default function Template42ScoreOverlaySponsorship() {
  const [period, setPeriod] = useState(3);
  const reducedMotion = useReducedMotion();
  const onDismiss = useCallback((reason) => emitTelemetry('close', { templateId: TEMPLATE_ID, reason }), []);
  const { dismissed, dismiss } = useDismissState({ key: TEMPLATE_ID, onDismiss });
  const viewRef = useViewability({ templateId: TEMPLATE_ID });

  useEffect(() => {
    if (reducedMotion) return undefined;
    const timer = window.setTimeout(() => setPeriod(4), 3500);
    return () => window.clearTimeout(timer);
  }, [reducedMotion]);

  const highlights = () => {
    emitTelemetry('click', { templateId: TEMPLATE_ID, target: 'watch-highlights' });
    emitTelemetry('complete', { templateId: TEMPLATE_ID, action: 'highlights-opened' });
  };

  if (dismissed) return null;

  return (
    <aside ref={viewRef} className="mx-auto max-w-2xl overflow-hidden rounded-2xl border border-white/15 bg-slate-950 text-white shadow-2xl">
      <div className="h-2 bg-gradient-to-r from-cyan-400 via-blue-500 to-violet-500" />
      <div className="flex flex-wrap items-center gap-3 p-3">
        <div className="flex min-h-11 items-center gap-2 rounded-lg bg-red-500/15 px-3 text-xs font-black text-red-300"><Radio size={16} className={reducedMotion ? '' : 'animate-pulse'} /> LIVE</div>
        <div className="flex flex-1 items-center justify-center gap-4" aria-label={`Harbor 78, Metro 74, quarter ${period}`}>
          <div className="text-center"><span className="block text-[10px] font-bold text-slate-400">HBR</span><strong className="text-2xl">78</strong></div>
          <div className="rounded-lg bg-white/10 px-3 py-2 text-center"><span className="block text-[9px] text-slate-400">Q{period}</span><strong className="tabular-nums">02:18</strong></div>
          <div className="text-center"><span className="block text-[10px] font-bold text-slate-400">MTR</span><strong className="text-2xl">74</strong></div>
        </div>
        <button type="button" aria-label="Close ad" onClick={() => dismiss('button')} className="flex min-h-11 min-w-11 items-center justify-center rounded-full hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan-300"><X size={19} /></button>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/10 bg-gradient-to-r from-blue-950 to-violet-950 px-4 py-3"><p className="flex items-center gap-2 text-xs font-bold"><Trophy size={17} className="text-amber-300" /> Scoreboard presented by Apex</p><button type="button" onClick={highlights} className="min-h-11 rounded-lg bg-white px-4 text-xs font-black text-slate-950">Watch highlights</button></div>
    </aside>
  );
}

import React, { useCallback, useEffect, useState } from 'react';
import { BookOpen, Check, Gift, X } from 'lucide-react';
import { useDismissState, useReducedMotion, useViewability } from '../hooks';
import { emitTelemetry } from '../telemetry';

const TEMPLATE_ID = 'reading-progress-reward-ad';

export default function Template44ReadingProgressRewardAd({ scrollAreaRef }) {
  const [progress, setProgress] = useState(0);
  const [claimed, setClaimed] = useState(false);
  const reducedMotion = useReducedMotion();
  const onDismiss = useCallback((reason) => emitTelemetry('close', { templateId: TEMPLATE_ID, reason }), []);
  const { dismissed, dismiss } = useDismissState({ key: TEMPLATE_ID, onDismiss });
  const viewRef = useViewability({ templateId: TEMPLATE_ID });

  useEffect(() => {
    const scrollArea = scrollAreaRef?.current;
    const target = scrollArea || window;
    const update = () => {
      const top = scrollArea ? scrollArea.scrollTop : window.scrollY;
      const total = scrollArea
        ? scrollArea.scrollHeight - scrollArea.clientHeight
        : document.documentElement.scrollHeight - window.innerHeight;
      setProgress(total > 0 ? Math.min(100, Math.round((top / total) * 100)) : 0);
    };
    update();
    target.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    return () => {
      target.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, [scrollAreaRef]);

  const claim = () => {
    setClaimed(true);
    emitTelemetry('click', { templateId: TEMPLATE_ID, target: 'claim-reading-reward', progress });
    emitTelemetry('complete', { templateId: TEMPLATE_ID, action: 'reward-claimed' });
  };

  if (dismissed) return null;
  const unlocked = progress >= 75;

  return (
    <aside ref={viewRef} className="mx-auto max-w-2xl rounded-2xl border border-indigo-200 bg-white p-4 text-slate-950 shadow-xl">
      <div className="flex items-start gap-3">
        <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${unlocked ? 'bg-emerald-500 text-white' : 'bg-indigo-100 text-indigo-700'} ${reducedMotion ? '' : 'transition-colors duration-500'}`}>{unlocked ? <Gift size={24} /> : <BookOpen size={24} />}</div>
        <div className="min-w-0 flex-1"><p className="text-[10px] font-bold uppercase tracking-widest text-indigo-700">Sponsored reading reward</p><h3 className="font-black">{claimed ? 'Reward added to your pass' : unlocked ? 'Your reward is unlocked' : 'Read to 75% to unlock'}</h3><p className="mt-1 text-xs text-slate-500">{unlocked ? 'Enjoy one month of Atlas Audio free.' : `${Math.max(0, 75 - progress)}% more to go`}</p></div>
        <button type="button" aria-label="Close ad" onClick={() => dismiss('button')} className="flex min-h-11 min-w-11 items-center justify-center rounded-full hover:bg-slate-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-600"><X size={18} /></button>
      </div>
      <div className="mt-4 h-3 overflow-hidden rounded-full bg-indigo-100" role="progressbar" aria-label="Article reading progress" aria-valuemin="0" aria-valuemax="100" aria-valuenow={progress}><div className={`h-full rounded-full bg-gradient-to-r from-indigo-600 to-emerald-500 ${reducedMotion ? '' : 'transition-[width] duration-300'}`} style={{ width: `${progress}%` }} /></div>
      <div className="mt-3 flex items-center justify-between gap-3"><output className="text-sm font-black tabular-nums">{progress}% read</output><button type="button" disabled={!unlocked || claimed} onClick={claim} className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-indigo-700 px-5 text-sm font-black text-white disabled:bg-slate-200 disabled:text-slate-500">{claimed && <Check size={18} />}{claimed ? 'Claimed' : 'Claim reward'}</button></div>
    </aside>
  );
}

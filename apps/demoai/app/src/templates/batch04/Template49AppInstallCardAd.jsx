import React, { useEffect, useState } from 'react';
import { Check, Download, Star } from 'lucide-react';
import { useDismissState } from '../hooks/useDismissState';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { NativeWidgetChrome } from '../primitives/NativeWidgetChrome';
import { emitTelemetry } from '../telemetry';

const ID = 'app-install-card-ad';

export default function Template49AppInstallCardAd() {
  const [installing, setInstalling] = useState(false);
  const [progress, setProgress] = useState(0);
  const reduced = useReducedMotion();
  const { dismissed, dismiss } = useDismissState({ key: ID, onDismiss: (reason) => emitTelemetry('close', { templateId: ID, reason }) });
  useEffect(() => {
    if (!installing || progress >= 100) return undefined;
    const timer = window.setInterval(() => setProgress((value) => Math.min(100, value + (reduced ? 100 : 10))), reduced ? 50 : 180);
    return () => window.clearInterval(timer);
  }, [installing, progress, reduced]);
  if (dismissed) return null;
  const install = () => { setInstalling(true); emitTelemetry('click', { templateId: ID, target: 'simulate-install' }); };
  return (
    <NativeWidgetChrome label="Sponsored app · simulation" title="Featured productivity app" onClose={() => dismiss('button')}>
      <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center">
        <div className="grid h-24 w-24 shrink-0 place-items-center rounded-[1.75rem] bg-gradient-to-br from-lime-300 to-emerald-700 text-4xl shadow-xl" aria-hidden="true">✓</div>
        <div className="min-w-0 flex-1">
          <h3 className="text-xl font-black text-white">Daylight Tasks</h3>
          <p className="text-sm text-slate-400">Plan gently. Finish clearly.</p>
          <div className="mt-2 flex items-center gap-1 text-amber-300" aria-label="Rated 4.8 out of 5"><Star size={16} fill="currentColor" /><span className="text-sm font-bold">4.8</span><span className="text-slate-500">· Demo listing</span></div>
          {installing && <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10" aria-label={`Simulated install ${progress}%`} role="progressbar" aria-valuenow={progress}><div className="h-full bg-lime-300 transition-[width]" style={{ width: `${progress}%` }} /></div>}
        </div>
        <button type="button" onClick={install} disabled={installing} className="flex min-h-11 min-w-32 items-center justify-center gap-2 rounded-xl bg-lime-300 px-4 font-bold text-slate-950 disabled:opacity-80">
          {progress >= 100 ? <><Check size={18} /> Simulated</> : installing ? `${progress}%` : <><Download size={18} /> Try install</>}
        </button>
      </div>
    </NativeWidgetChrome>
  );
}

import React, { useEffect, useState } from 'react';
import { Clock3, RotateCcw } from 'lucide-react';
import { useDismissState } from '../hooks/useDismissState';
import { NativeWidgetChrome } from '../primitives/NativeWidgetChrome';
import { emitTelemetry } from '../telemetry';

const ID = 'countdown-banner-ad';
const START = 75;

export default function Template50CountdownBannerAd() {
  const [seconds, setSeconds] = useState(START);
  const { dismissed, dismiss } = useDismissState({ key: ID, onDismiss: (reason) => emitTelemetry('close', { templateId: ID, reason }) });
  useEffect(() => {
    if (!seconds) return undefined;
    const timer = window.setInterval(() => setSeconds((value) => Math.max(0, value - 1)), 1000);
    return () => window.clearInterval(timer);
  }, [seconds]);
  if (dismissed) return null;
  const display = `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;
  return (
    <NativeWidgetChrome label="Sponsored · simulated timer" title="Studio drop window" onClose={() => dismiss('button')}>
      <div className="flex flex-col gap-4 bg-gradient-to-r from-rose-950 to-orange-900 p-4 sm:flex-row sm:items-center">
        <Clock3 className="shrink-0 text-orange-300" size={32} />
        <div className="flex-1"><h3 className="font-black text-white">{seconds ? 'Preview access closes soon' : 'Preview window ended'}</h3><p className="text-sm text-orange-100/70">No real inventory or purchase is implied.</p></div>
        <output aria-live="off" aria-label={`${seconds} seconds remaining`} className="font-mono text-3xl font-black tabular-nums text-white">{display}</output>
        <button type="button" onClick={() => { setSeconds(START); emitTelemetry('click', { templateId: ID, target: 'restart-timer' }); }} className="flex min-h-11 items-center justify-center gap-2 rounded-xl bg-white px-4 font-bold text-rose-950"><RotateCcw size={18} /> Restart demo</button>
      </div>
    </NativeWidgetChrome>
  );
}

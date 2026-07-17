import React, { useEffect, useRef, useState } from 'react';
import { Pause, Play, RotateCcw, RotateCw } from 'lucide-react';
import { useDismissState } from '../hooks/useDismissState';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { NativeWidgetChrome } from '../primitives/NativeWidgetChrome';
import { emitTelemetry } from '../telemetry';

const ID = 'podcast-native-player-ad';
const DURATION = 92;

export default function Template45PodcastNativePlayerAd() {
  const [playing, setPlaying] = useState(false);
  const [time, setTime] = useState(18);
  const reduced = useReducedMotion();
  const announced = useRef(false);
  const { dismissed, dismiss } = useDismissState({ key: ID, onDismiss: (reason) => emitTelemetry('close', { templateId: ID, reason }) });

  useEffect(() => {
    if (!playing) return undefined;
    const timer = window.setInterval(() => setTime((value) => {
      if (value >= DURATION) { setPlaying(false); return 0; }
      return value + 1;
    }), 1000);
    return () => window.clearInterval(timer);
  }, [playing]);

  if (dismissed) return null;
  const seek = (next) => setTime(Math.max(0, Math.min(DURATION, next)));
  const toggle = () => {
    setPlaying((value) => !value);
    if (!announced.current) { emitTelemetry('click', { templateId: ID, target: 'play' }); announced.current = true; }
  };

  return (
    <NativeWidgetChrome label="Sponsored podcast" title="The Better Workday · 8 min" onClose={() => dismiss('button')}>
      <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center">
        <div className={`grid h-28 w-full shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-fuchsia-500 to-indigo-950 sm:w-28 ${playing && !reduced ? 'animate-pulse' : ''}`} aria-hidden="true">
          <span className="text-4xl">🎙️</span>
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-bold text-white">Designing space for deep focus</p>
          <p className="mt-1 text-sm text-slate-400">A short conversation with Maya Chen</p>
          <input aria-label="Podcast position" className="mt-4 h-11 w-full accent-fuchsia-400" type="range" min="0" max={DURATION} value={time} onChange={(event) => seek(Number(event.target.value))} />
          <div className="flex items-center justify-between text-xs text-slate-400"><span>{Math.floor(time / 60)}:{String(time % 60).padStart(2, '0')}</span><span>1:32</span></div>
          <div className="mt-2 flex justify-center gap-2">
            <button type="button" aria-label="Back 10 seconds" onClick={() => seek(time - 10)} className="grid min-h-11 min-w-11 place-items-center rounded-full hover:bg-white/10"><RotateCcw size={20} /></button>
            <button type="button" aria-label={playing ? 'Pause podcast' : 'Play podcast'} onClick={toggle} className="grid min-h-11 min-w-11 place-items-center rounded-full bg-fuchsia-400 text-slate-950">{playing ? <Pause /> : <Play />}</button>
            <button type="button" aria-label="Forward 10 seconds" onClick={() => seek(time + 10)} className="grid min-h-11 min-w-11 place-items-center rounded-full hover:bg-white/10"><RotateCw size={20} /></button>
          </div>
        </div>
      </div>
    </NativeWidgetChrome>
  );
}

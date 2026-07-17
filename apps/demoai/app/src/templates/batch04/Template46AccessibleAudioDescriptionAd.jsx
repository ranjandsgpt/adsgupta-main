import React, { useEffect, useState } from 'react';
import { AudioLines, Pause, Play } from 'lucide-react';
import { useDismissState } from '../hooks/useDismissState';
import { NativeWidgetChrome } from '../primitives/NativeWidgetChrome';
import { emitTelemetry } from '../telemetry';

const ID = 'accessible-audio-description-ad';
const CUES = [
  'A cyclist reaches a quiet overlook at sunrise.',
  'They unfold a cobalt jacket as clouds gather.',
  'Rain beads roll away while the city wakes below.',
];

export default function Template46AccessibleAudioDescriptionAd() {
  const [playing, setPlaying] = useState(false);
  const [described, setDescribed] = useState(true);
  const [cue, setCue] = useState(0);
  const { dismissed, dismiss } = useDismissState({ key: ID, onDismiss: (reason) => emitTelemetry('close', { templateId: ID, reason }) });

  useEffect(() => {
    if (!playing) return undefined;
    const timer = window.setInterval(() => setCue((value) => (value + 1) % CUES.length), 2600);
    return () => window.clearInterval(timer);
  }, [playing]);

  if (dismissed) return null;
  return (
    <NativeWidgetChrome label="Sponsored · accessible media" title="Weatherproof your commute" onClose={() => dismiss('button')}>
      <div className="p-4">
        <div className="relative grid min-h-52 place-items-center overflow-hidden rounded-2xl bg-gradient-to-br from-amber-300 via-sky-500 to-slate-950">
          <div className="h-28 w-28 rounded-full border-[18px] border-white/30" aria-hidden="true" />
          <button type="button" aria-label={playing ? 'Pause video' : 'Play video'} onClick={() => { setPlaying((value) => !value); emitTelemetry('click', { templateId: ID, target: 'playback' }); }} className="absolute grid min-h-12 min-w-12 place-items-center rounded-full bg-black/70 text-white">
            {playing ? <Pause /> : <Play />}
          </button>
        </div>
        <div aria-live="polite" className="mt-3 min-h-16 rounded-xl bg-white/5 p-3 text-sm text-slate-200">
          <span className="font-bold text-cyan-300">{described ? 'Audio description: ' : 'Caption: '}</span>
          {described ? CUES[cue] : 'Move freely, whatever the forecast.'}
        </div>
        <button type="button" aria-pressed={described} onClick={() => setDescribed((value) => !value)} className="mt-3 flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-white/15 font-semibold text-white hover:bg-white/10">
          <AudioLines size={20} /> Audio description {described ? 'on' : 'off'}
        </button>
      </div>
    </NativeWidgetChrome>
  );
}

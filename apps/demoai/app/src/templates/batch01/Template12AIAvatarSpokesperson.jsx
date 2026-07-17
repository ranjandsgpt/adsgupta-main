import React, { useEffect, useRef, useState } from 'react';
import { Pause, Play, UserRound } from 'lucide-react';
import BatchTemplateFrame, { track } from './BatchTemplateFrame';

const ID = 'ai-avatar-spokesperson';

export default function Template12AIAvatarSpokesperson() {
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const interval = useRef(null);

  useEffect(() => {
    window.clearInterval(interval.current);
    if (!playing) return undefined;
    interval.current = window.setInterval(() => {
      setProgress((value) => {
        if (value >= 95) {
          window.clearInterval(interval.current);
          setPlaying(false);
          track(ID, 'complete', { simulation: 'avatar-message' });
          return 100;
        }
        return value + 5;
      });
    }, 180);
    return () => window.clearInterval(interval.current);
  }, [playing]);

  const toggle = () => {
    if (progress === 100) setProgress(0);
    setPlaying((value) => !value);
    track(ID, 'click', { target: playing ? 'pause-avatar' : 'play-avatar' });
    if (!playing) track(ID, 'expand', { mode: 'avatar-playback' });
  };

  return (
    <BatchTemplateFrame templateId={ID} title="AI Avatar Spokesperson" subtitle="Synthetic local playback simulation · audio-free">
      {({ reducedMotion }) => (
        <>
          <div className="relative flex min-h-72 flex-col items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-b from-cyan-700 to-slate-950">
            <div className={`flex h-36 w-36 items-center justify-center rounded-full border-4 border-cyan-300 bg-slate-800 ${playing && !reducedMotion ? 'animate-pulse' : ''}`}>
              <UserRound size={82} className="text-cyan-100" />
            </div>
            <p className="mt-5 max-w-sm px-5 text-center text-sm font-semibold">
              “Meet Nova One: adaptive audio tuned to your day, with forty hours of battery.”
            </p>
            <span className="absolute bottom-3 left-3 rounded-full bg-black/40 px-3 py-1 text-[10px] font-bold uppercase tracking-widest">AI-generated avatar</span>
          </div>
          <div className="mt-4 flex items-center gap-3">
            <button type="button" onClick={toggle} className="flex min-h-12 min-w-12 items-center justify-center rounded-full bg-white text-slate-950" aria-label={playing ? 'Pause spokesperson' : 'Play spokesperson'}>
              {playing ? <Pause /> : <Play />}
            </button>
            <div className="h-3 flex-1 overflow-hidden rounded-full bg-white/10" role="progressbar" aria-valuenow={progress} aria-valuemin="0" aria-valuemax="100">
              <div className="h-full bg-cyan-400" style={{ width: `${progress}%`, transition: reducedMotion ? 'none' : 'width 180ms linear' }} />
            </div>
            <span className="w-10 text-right text-xs font-bold">{progress}%</span>
          </div>
        </>
      )}
    </BatchTemplateFrame>
  );
}

import React, { useEffect, useState } from 'react';
import { Pause, Play, SkipForward } from 'lucide-react';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { MorphContainer } from '../primitives/MorphContainer';
import { Batch05Shell, buttonClass, trackClick } from './Batch05Shell';

const ID = 'mrec-video-story-morph';
const chapters = ['Signal', 'Momentum', 'Arrival'];

export default function Template61MrecVideoStoryMorph() {
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const reducedMotion = useReducedMotion();
  const chapter = Math.min(2, Math.floor(progress / 34));

  useEffect(() => {
    if (!playing || reducedMotion) return undefined;
    const timer = window.setInterval(() => {
      setProgress((value) => {
        if (value >= 100) {
          setPlaying(false);
          return 100;
        }
        return Math.min(100, value + 1);
      });
    }, 100);
    return () => window.clearInterval(timer);
  }, [playing, reducedMotion]);

  const togglePlayback = () => {
    if (reducedMotion) {
      setProgress(100);
      setPlaying(false);
    } else {
      setPlaying((value) => !value);
    }
    trackClick(ID, playing ? 'pause' : 'play');
  };

  return (
    <Batch05Shell templateId={ID} title="MREC to Video Story Morph" className="mx-auto max-w-md" onClosed={() => setPlaying(false)}>
      <MorphContainer className="overflow-hidden bg-slate-950 text-white">
        <div className="relative flex aspect-[4/3] items-center justify-center bg-gradient-to-br from-orange-500/40 via-fuchsia-700/30 to-cyan-950">
          <div className="absolute inset-x-0 bottom-0 h-1 bg-white/20"><div className="h-full bg-orange-300" style={{ width: `${progress}%` }} /></div>
          <div className="text-center"><p className="text-xs font-bold uppercase tracking-[.25em] text-orange-200">Chapter {chapter + 1}</p><h3 className="mt-2 text-4xl font-black">{chapters[chapter]}</h3><p className="mt-3 text-sm text-white/70">Motion-rendered story · no external media</p></div>
        </div>
        <div className="flex gap-2 p-4">
          <button type="button" className={`${buttonClass} flex flex-1 items-center justify-center gap-2 bg-orange-300 text-slate-950`} onClick={togglePlayback}>
            {playing ? <Pause size={18} /> : <Play size={18} />} {playing ? 'Pause' : 'Play'}
          </button>
          <button type="button" aria-label="Next chapter" className={`${buttonClass} bg-white/10 text-white`} onClick={() => { setProgress((value) => Math.min(100, (Math.floor(value / 34) + 1) * 34)); trackClick(ID, 'skip'); }}><SkipForward size={19} /></button>
        </div>
      </MorphContainer>
    </Batch05Shell>
  );
}

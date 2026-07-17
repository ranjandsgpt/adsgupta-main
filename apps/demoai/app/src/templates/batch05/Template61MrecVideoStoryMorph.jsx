import React, { useEffect, useState } from 'react';
import { Pause, Play, SkipForward } from 'lucide-react';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { MorphContainer } from '../primitives/MorphContainer';
import { Batch05Shell, MorphOverlay, buttonClass, trackClick, useMorph } from './Batch05Shell';

const ID = 'mrec-video-story-morph';
const chapters = ['Signal', 'Momentum', 'Arrival'];

export default function Template61MrecVideoStoryMorph() {
  const { expanded, setMorph } = useMorph(ID);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const reducedMotion = useReducedMotion();
  const chapter = Math.min(2, Math.floor(progress / 34));

  useEffect(() => {
    if (!playing || !expanded || reducedMotion) return undefined;
    const timer = window.setInterval(() => {
      setProgress((value) => {
        if (value >= 100) return 100;
        return Math.min(100, value + 1);
      });
    }, 100);
    return () => window.clearInterval(timer);
  }, [expanded, playing, reducedMotion]);

  useEffect(() => {
    if (progress >= 100) setPlaying(false);
  }, [progress]);

  const openStory = () => {
    setMorph(true, 'open-video-story');
    setProgress(0);
    setPlaying(!reducedMotion);
    if (reducedMotion) setProgress(100);
    trackClick(ID, 'play');
  };

  const closeStory = (reason) => {
    setPlaying(false);
    setMorph(false, reason);
  };

  const togglePlayback = () => {
    if (reducedMotion) {
      setProgress(100);
      setPlaying(false);
    } else {
      if (!playing && progress >= 100) setProgress(0);
      setPlaying((value) => !value);
    }
    trackClick(ID, playing ? 'pause' : 'play');
  };

  const skip = () => {
    setProgress((value) => Math.min(100, (Math.floor(value / 34) + 1) * 34));
    trackClick(ID, 'skip');
  };

  return (
    <>
      <Batch05Shell templateId={ID} title="MREC to Video Story Morph" className="mx-auto max-w-md" onClosed={() => { setPlaying(false); if (expanded) setMorph(false, 'dismiss'); }}>
        <MorphContainer className="overflow-hidden bg-slate-950 text-white">
          <div className="relative flex min-h-[180px] items-center justify-center bg-gradient-to-br from-orange-500/40 via-fuchsia-700/30 to-cyan-950 p-5">
            <div className="text-center">
              <p className="text-xs font-bold uppercase tracking-[.25em] text-orange-200">Three-chapter story</p>
              <h3 className="mt-2 text-3xl font-black">{chapters[chapter]}</h3>
              <p className="mt-3 text-sm text-white/70">Motion-rendered story · no external media</p>
            </div>
          </div>
          <div className="p-4">
            <button type="button" className={`${buttonClass} flex w-full items-center justify-center gap-2 bg-orange-300 text-slate-950`} onClick={openStory}>
              <Play size={18} /> Watch story
            </button>
          </div>
        </MorphContainer>
      </Batch05Shell>

      {expanded && (
        <MorphOverlay label="Video story ad" onClose={() => closeStory('close-video-story')} className="bg-slate-950 text-white">
          <div className="absolute inset-0 bg-gradient-to-br from-orange-500/40 via-fuchsia-700/30 to-cyan-950" aria-hidden="true" />
          <div className="relative z-10 flex h-full flex-col justify-between p-6 pt-16">
            <p className="text-xs font-bold uppercase tracking-[.25em] text-orange-200">Sponsored story · Chapter {chapter + 1} of {chapters.length}</p>
            <div className="text-center">
              <h3 className="text-5xl font-black">{chapters[chapter]}</h3>
              <p className="mt-4 text-sm text-white/70">Motion-rendered story · no external media</p>
            </div>
            <div>
              <div className="h-1.5 overflow-hidden rounded-full bg-white/20" aria-hidden="true">
                <div className="h-full rounded-full bg-orange-300" style={{ width: `${progress}%`, transition: reducedMotion ? 'none' : 'width 100ms linear' }} />
              </div>
              <div className="mt-4 flex gap-2">
                <button type="button" className={`${buttonClass} flex flex-1 items-center justify-center gap-2 bg-orange-300 text-slate-950`} onClick={togglePlayback}>
                  {playing ? <Pause size={18} /> : <Play size={18} />} {playing ? 'Pause' : progress >= 100 ? 'Replay' : 'Play'}
                </button>
                <button type="button" aria-label="Next chapter" className={`${buttonClass} bg-white/10 text-white`} onClick={skip}><SkipForward size={19} /></button>
              </div>
            </div>
          </div>
        </MorphOverlay>
      )}
    </>
  );
}

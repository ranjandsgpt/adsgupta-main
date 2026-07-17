import React, { useState } from 'react';
import { Maximize2 } from 'lucide-react';
import { MorphContainer } from '../primitives/MorphContainer';
import { Batch05Shell, MorphOverlay, buttonClass, trackClick, useMorph } from './Batch05Shell';

const ID = 'mrec-interscroller-morph';

export default function Template59MrecInterscrollerMorph() {
  const { expanded, setMorph } = useMorph(ID);
  const [reveal, setReveal] = useState(30);
  const update = (value) => {
    const next = Number(value);
    setReveal(next);
    if (next === 100) trackClick(ID, 'reveal-complete');
  };

  return (
    <>
      <Batch05Shell templateId={ID} title="MREC to Interscroller Morph" className="mx-auto max-w-xl" onClosed={() => { if (expanded) setMorph(false, 'dismiss'); }}>
        <MorphContainer className="relative min-h-[230px] overflow-hidden bg-slate-950 text-white">
          <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/30 via-violet-600/20 to-slate-950" />
          <div className="relative flex min-h-[230px] flex-col justify-between p-5">
            <div>
              <p className="text-xs font-bold uppercase tracking-[.22em] text-cyan-300">Interscroller preview</p>
              <h3 className="mt-2 max-w-sm text-3xl font-black">Reveal the city in motion.</h3>
            </div>
            <button
              type="button"
              className={`${buttonClass} flex items-center justify-center gap-2 bg-cyan-300 text-slate-950`}
              onClick={() => setMorph(true, 'open-interscroller')}
            >
              <Maximize2 size={18} /> Expand interscroller
            </button>
          </div>
        </MorphContainer>
      </Batch05Shell>

      {expanded && (
        <MorphOverlay label="Interscroller ad" onClose={() => setMorph(false, 'close-interscroller')} className="bg-slate-950 text-white">
          <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-violet-950 to-slate-950" />
          {/* Revealed creative layer grows from the bottom as the reveal advances. */}
          <div
            className="absolute inset-x-0 bottom-0 overflow-hidden bg-gradient-to-t from-cyan-500/45 via-violet-600/30 to-transparent transition-[height] duration-200 ease-out"
            style={{ height: `${reveal}%` }}
            aria-hidden="true"
          >
            <div className="absolute inset-x-0 bottom-0 flex h-40 items-end justify-center gap-2 px-8 pb-6 opacity-80">
              {[52, 96, 70, 120, 84, 132, 64, 104, 76].map((height, index) => (
                <span key={`bar-${height}-${index}`} className="w-full max-w-10 rounded-t-md bg-cyan-200/35" style={{ height: `${height}px` }} />
              ))}
            </div>
          </div>
          <div className="relative z-10 flex h-full flex-col justify-between p-6 pt-16">
            <div>
              <p className="text-xs font-bold uppercase tracking-[.22em] text-cyan-300">Sponsored · Scroll simulation</p>
              <h3 className="mt-2 max-w-sm text-4xl font-black">Reveal the city in motion.</h3>
              <p className="mt-3 max-w-xs text-sm text-white/70">Drag the reveal control to simulate the interscroller uncovering as the page scrolls past.</p>
            </div>
            <div>
              <label htmlFor="interscroller-reveal" className="mb-2 block text-sm font-medium">Creative reveal: {reveal}%</label>
              <input
                id="interscroller-reveal"
                type="range"
                min="0"
                max="100"
                value={reveal}
                onChange={(event) => update(event.target.value)}
                className="h-11 w-full cursor-pointer accent-cyan-300"
              />
              <div className="mt-3 flex gap-2">
                <button type="button" className={`${buttonClass} bg-cyan-300 text-slate-950`} onClick={() => update(100)}>Reveal all</button>
                <button type="button" className={`${buttonClass} bg-white/10 text-white`} onClick={() => setMorph(false, 'collapse')}>Back to article</button>
              </div>
            </div>
          </div>
        </MorphOverlay>
      )}
    </>
  );
}

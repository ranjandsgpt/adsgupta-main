import React, { useState } from 'react';
import { MorphContainer } from '../primitives/MorphContainer';
import { Batch05Shell, buttonClass, trackClick } from './Batch05Shell';

const ID = 'mrec-interscroller-morph';

export default function Template59MrecInterscrollerMorph() {
  const [reveal, setReveal] = useState(30);
  const update = (value) => {
    const next = Number(value);
    setReveal(next);
    if (next === 100) trackClick(ID, 'reveal-complete');
  };

  return (
    <Batch05Shell templateId={ID} title="MREC to Interscroller Morph" className="mx-auto max-w-xl">
      <MorphContainer className="relative min-h-[300px] overflow-hidden bg-slate-950 text-white" style={{ minHeight: `${250 + reveal * 1.5}px` }}>
        <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/30 via-violet-600/20 to-slate-950" />
        <div className="relative flex min-h-[300px] flex-col justify-between p-6">
          <div><p className="text-xs font-bold uppercase tracking-[.22em] text-cyan-300">Scroll simulation</p><h3 className="mt-2 max-w-sm text-4xl font-black">Reveal the city in motion.</h3></div>
          <div>
            <label htmlFor="interscroller-reveal" className="mb-2 block text-sm font-medium">Creative reveal: {reveal}%</label>
            <input id="interscroller-reveal" type="range" min="0" max="100" value={reveal} onChange={(event) => update(event.target.value)} className="h-11 w-full cursor-pointer accent-cyan-300" />
            <button type="button" className={`${buttonClass} mt-3 bg-cyan-300 text-slate-950`} onClick={() => update(100)}>Reveal all</button>
          </div>
        </div>
      </MorphContainer>
    </Batch05Shell>
  );
}

import React, { useRef, useState } from 'react';
import { LockKeyhole, Sparkles } from 'lucide-react';
import BatchTemplateFrame, { track } from './BatchTemplateFrame';

const ID = 'drag-reveal-puzzle';

export default function Template01DragRevealPuzzleAd() {
  const [reveal, setReveal] = useState(18);
  const completed = useRef(false);

  const update = (value) => {
    const next = Number(value);
    setReveal(next);
    track(ID, 'click', { target: 'reveal-slider', progress: next });
    if (next >= 96 && !completed.current) {
      completed.current = true;
      track(ID, 'complete', { reward: '25-percent' });
    }
  };

  return (
    <BatchTemplateFrame templateId={ID} title="Drag-to-Reveal Puzzle Ad" subtitle="Slide the lens to solve the hidden image">
      {({ reducedMotion }) => (
        <>
          <div className="relative h-52 overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-700 to-fuchsia-600">
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <Sparkles size={54} className="mb-3 text-amber-300" />
              <p className="text-3xl font-black">25% OFF</p>
              <p className="text-sm text-white/80">Puzzle solved · SUMMER25</p>
            </div>
            <div
              className={`absolute inset-y-0 right-0 flex items-center justify-center bg-slate-900 ${reducedMotion ? '' : 'transition-[width] duration-150'}`}
              style={{ width: `${100 - reveal}%` }}
              aria-hidden="true"
            >
              <LockKeyhole className="text-slate-500" size={44} />
            </div>
            <div className="absolute inset-y-0 w-1 bg-white shadow-lg" style={{ left: `${reveal}%` }} />
          </div>
          <label className="mt-5 block text-sm font-bold" htmlFor={`${ID}-range`}>
            Reveal progress <span className="text-cyan-300">{reveal}%</span>
          </label>
          <input
            id={`${ID}-range`}
            type="range"
            min="0"
            max="100"
            value={reveal}
            onChange={(event) => update(event.target.value)}
            className="mt-2 h-11 w-full cursor-ew-resize accent-cyan-400"
            aria-valuetext={`${reveal} percent revealed`}
          />
        </>
      )}
    </BatchTemplateFrame>
  );
}

import React, { useEffect, useRef, useState } from 'react';
import { RotateCw } from 'lucide-react';
import BatchTemplateFrame, { track } from './BatchTemplateFrame';

const ID = 'spin-wheel-overlay';
const PRIZES = ['10% off', 'Free ship', '2× points', 'Try again', '20% off', 'Bonus gift'];

export default function Template07SpinWheelOverlay() {
  const [rotation, setRotation] = useState(0);
  const [prize, setPrize] = useState('');
  const [spinning, setSpinning] = useState(false);
  const timer = useRef(null);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const spin = (reducedMotion) => {
    if (spinning) return;
    const index = Math.floor(Math.random() * PRIZES.length);
    const next = reducedMotion ? index * 60 : rotation + 1080 + index * 60;
    setPrize('');
    setSpinning(true);
    setRotation(next);
    track(ID, 'click', { target: 'spin' });
    timer.current = window.setTimeout(() => {
      setPrize(PRIZES[index]);
      setSpinning(false);
      track(ID, 'complete', { prize: PRIZES[index] });
    }, reducedMotion ? 0 : 1600);
  };

  return (
    <BatchTemplateFrame templateId={ID} title="Spin-the-Wheel Overlay" subtitle="Tap once for a locally simulated prize">
      {({ reducedMotion }) => (
        <div className="text-center">
          <div className="relative mx-auto h-64 w-64">
            <span className="absolute left-1/2 top-0 z-10 -translate-x-1/2 text-3xl text-white">▼</span>
            <div
              className="grid h-full w-full grid-cols-2 overflow-hidden rounded-full border-8 border-white/20 bg-gradient-to-br from-fuchsia-500 via-amber-400 to-cyan-400 shadow-2xl"
              style={{ transform: `rotate(${rotation}deg)`, transition: reducedMotion ? 'none' : 'transform 1.6s cubic-bezier(.2,.8,.2,1)' }}
              aria-hidden="true"
            >
              {['🎁', '✨', '⭐', '🎉'].map((icon) => <span key={icon} className="flex items-center justify-center text-4xl">{icon}</span>)}
            </div>
          </div>
          <p className="mt-3 min-h-7 text-lg font-black text-amber-300" aria-live="polite">{prize && `You won ${prize}!`}</p>
          <button type="button" onClick={() => spin(reducedMotion)} disabled={spinning} className="mt-2 flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-white font-black text-slate-950 disabled:opacity-60">
            <RotateCw size={20} /> {spinning ? 'Spinning…' : prize ? 'Spin again' : 'Spin the wheel'}
          </button>
        </div>
      )}
    </BatchTemplateFrame>
  );
}

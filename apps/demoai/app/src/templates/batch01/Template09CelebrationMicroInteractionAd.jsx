import React, { useEffect, useRef, useState } from 'react';
import { PartyPopper } from 'lucide-react';
import BatchTemplateFrame, { track } from './BatchTemplateFrame';

const ID = 'celebration-micro-interaction';
const COLORS = ['#22d3ee', '#facc15', '#f472b6', '#a7f3d0'];

function Celebration({ reducedMotion }) {
  const canvasRef = useRef(null);
  const frameRef = useRef(null);
  const [celebrating, setCelebrating] = useState(false);

  useEffect(() => () => window.cancelAnimationFrame(frameRef.current), []);

  const celebrate = () => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext('2d');
    if (!context) return;
    setCelebrating(true);
    track(ID, 'click', { target: 'celebrate' });
    track(ID, 'expand', { effect: 'confetti' });
    const pieces = Array.from({ length: reducedMotion ? 18 : 50 }, (_, index) => ({
      x: 210, y: 130, dx: (index % 10 - 5) * 1.4, dy: -3 - (index % 6), color: COLORS[index % COLORS.length],
    }));
    let tick = 0;
    const draw = () => {
      context.clearRect(0, 0, 420, 260);
      pieces.forEach((piece) => {
        if (!reducedMotion) {
          piece.x += piece.dx;
          piece.y += piece.dy;
          piece.dy += 0.16;
        } else {
          piece.x += piece.dx * 8;
          piece.y += piece.dy * 5;
        }
        context.fillStyle = piece.color;
        context.fillRect(piece.x, piece.y, 8, 12);
      });
      tick += 1;
      if (!reducedMotion && tick < 90) frameRef.current = window.requestAnimationFrame(draw);
      else {
        setCelebrating(false);
        track(ID, 'complete', { effect: 'confetti' });
      }
    };
    window.cancelAnimationFrame(frameRef.current);
    draw();
  };

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-600 to-cyan-950 text-center">
      <canvas ref={canvasRef} width="420" height="260" className="absolute inset-0 h-full w-full" aria-hidden="true" />
      <div className="relative z-10 flex min-h-52 flex-col items-center justify-center p-6">
        <PartyPopper size={48} className="text-amber-300" />
        <h3 className="mt-3 text-2xl font-black">Tiny action. Big delight.</h3>
        <button type="button" onClick={celebrate} disabled={celebrating} className="mt-5 min-h-12 rounded-full bg-white px-7 font-black text-slate-950 disabled:opacity-60">
          {celebrating ? 'Celebrating…' : 'Make it sparkle'}
        </button>
      </div>
    </div>
  );
}

export default function Template09CelebrationMicroInteractionAd() {
  return (
    <BatchTemplateFrame templateId={ID} title="Celebration Micro-Interaction Ad" subtitle="A lightweight canvas reward moment">
      {({ reducedMotion }) => <Celebration reducedMotion={reducedMotion} />}
    </BatchTemplateFrame>
  );
}

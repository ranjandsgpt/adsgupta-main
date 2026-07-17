import React, { useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { MorphContainer } from '../primitives/MorphContainer';
import { Batch05Shell, buttonClass, trackClick } from './Batch05Shell';

const ID = 'mrec-carousel-morph';
const cards = [
  ['Cloud', 'Focus without friction.', 'from-cyan-500 to-blue-800'],
  ['Pulse', 'Energy for every mile.', 'from-fuchsia-500 to-violet-900'],
  ['Terra', 'Designed with less.', 'from-emerald-500 to-teal-900'],
];

export default function Template62MrecCarouselMorph() {
  const [index, setIndex] = useState(0);
  const startX = useRef(null);
  const move = (delta) => {
    setIndex((value) => Math.max(0, Math.min(cards.length - 1, value + delta)));
    trackClick(ID, delta > 0 ? 'next' : 'previous');
  };
  const [name, copy, color] = cards[index];

  return (
    <Batch05Shell templateId={ID} title="MREC to Carousel Morph" className="mx-auto max-w-lg">
      <MorphContainer
        className={`touch-pan-y bg-gradient-to-br ${color} p-6 text-white`}
        onPointerDown={(event) => { startX.current = event.clientX; event.currentTarget.setPointerCapture(event.pointerId); }}
        onPointerUp={(event) => {
          if (startX.current === null) return;
          const delta = event.clientX - startX.current;
          if (Math.abs(delta) > 45) move(delta < 0 ? 1 : -1);
          startX.current = null;
        }}
        onPointerCancel={() => { startX.current = null; }}
      >
        <p className="text-xs font-bold uppercase tracking-[.2em]">Collection {index + 1} / {cards.length}</p>
        <div className="flex min-h-[150px] flex-col justify-center"><h3 className="text-5xl font-black">{name}</h3><p className="mt-2 text-lg text-white/75">{copy}</p></div>
        <div className="flex items-center justify-between">
          <button type="button" aria-label="Previous product" disabled={index === 0} className={`${buttonClass} bg-black/20 text-white`} onClick={() => move(-1)}><ChevronLeft /></button>
          <div className="flex gap-2" aria-label={`Slide ${index + 1} of ${cards.length}`}>{cards.map((card, itemIndex) => <span key={card[0]} className={`h-2 w-2 rounded-full ${itemIndex === index ? 'bg-white' : 'bg-white/35'}`} />)}</div>
          <button type="button" aria-label="Next product" disabled={index === cards.length - 1} className={`${buttonClass} bg-black/20 text-white`} onClick={() => move(1)}><ChevronRight /></button>
        </div>
      </MorphContainer>
    </Batch05Shell>
  );
}

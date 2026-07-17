import React, { useRef, useState } from 'react';
import { ArrowDown, ArrowUp, Layers3 } from 'lucide-react';
import { MorphContainer } from '../primitives/MorphContainer';
import { Batch05Shell, buttonClass, trackClick } from './Batch05Shell';

const ID = 'widget-stack-ad';
const initialCards = [
  { id: 'weather', label: '18° · Clear trail', color: 'from-cyan-500 to-blue-800' },
  { id: 'route', label: '12 km · Ridge loop', color: 'from-fuchsia-500 to-violet-900' },
  { id: 'gear', label: 'Pack light layers', color: 'from-lime-500 to-emerald-900' },
];

export default function Template70WidgetStackAd() {
  const [cards, setCards] = useState(initialCards);
  const startY = useRef(null);
  const rotate = (direction) => {
    setCards((items) => direction > 0 ? [...items.slice(1), items[0]] : [items[items.length - 1], ...items.slice(0, -1)]);
    trackClick(ID, direction > 0 ? 'stack-next' : 'stack-previous');
  };

  return (
    <Batch05Shell templateId={ID} title="Widget Stack Ad" className="mx-auto max-w-md">
      <div className="bg-slate-950 p-6 text-white">
        <div
          className="relative h-64 touch-pan-x"
          onPointerDown={(event) => { startY.current = event.clientY; event.currentTarget.setPointerCapture(event.pointerId); }}
          onPointerUp={(event) => {
            if (startY.current === null) return;
            const delta = event.clientY - startY.current;
            if (Math.abs(delta) > 40) rotate(delta < 0 ? 1 : -1);
            startY.current = null;
          }}
          onPointerCancel={() => { startY.current = null; }}
        >
          {cards.map((card, index) => (
            <MorphContainer key={card.id} className={`absolute inset-x-0 top-0 flex h-44 items-center justify-between rounded-3xl bg-gradient-to-br ${card.color} p-6 shadow-2xl`} style={{ transform: `translateY(${index * 24}px) scale(${1 - index * 0.05})`, zIndex: cards.length - index, opacity: 1 - index * 0.18 }}>
              <div><p className="text-xs font-bold uppercase tracking-[.2em]">Trail utility</p><h3 className="mt-2 text-2xl font-black">{card.label}</h3></div><Layers3 size={30} />
            </MorphContainer>
          ))}
        </div>
        <p className="text-center text-sm text-white/55">Swipe vertically or use the controls.</p>
        <div className="mt-3 flex justify-center gap-2">
          <button type="button" aria-label="Previous widget" className={`${buttonClass} bg-white/10 text-white`} onClick={() => rotate(-1)}><ArrowUp /></button>
          <button type="button" aria-label="Next widget" className={`${buttonClass} bg-white/10 text-white`} onClick={() => rotate(1)}><ArrowDown /></button>
        </div>
      </div>
    </Batch05Shell>
  );
}

import React, { useRef, useState } from 'react';
import { BatteryCharging, Camera, Zap } from 'lucide-react';
import BatchTemplateFrame, { track } from './BatchTemplateFrame';

const ID = 'product-duel';

export default function Template04ProductDuelAd() {
  const [split, setSplit] = useState(50);
  const completed = useRef(false);

  const compare = (value) => {
    const next = Number(value);
    setSplit(next);
    track(ID, 'click', { target: 'comparison-slider', preference: next < 50 ? 'camera' : 'battery' });
    if ((next < 15 || next > 85) && !completed.current) {
      completed.current = true;
      track(ID, 'complete', { winner: next < 15 ? 'Pixel Pro' : 'Volt Max' });
    }
  };

  return (
    <BatchTemplateFrame templateId={ID} title="Product Duel (Swipe to Compare)" subtitle="Drag the divider toward your winner">
      <div className="relative h-72 overflow-hidden rounded-2xl bg-indigo-700">
        <div className="absolute inset-0 flex items-center justify-end bg-indigo-700 p-8 text-right">
          <div><BatteryCharging className="ml-auto text-lime-300" size={52} /><h3 className="mt-3 text-2xl font-black">Volt Max</h3><p>2-day battery</p></div>
        </div>
        <div className="absolute inset-y-0 left-0 overflow-hidden bg-rose-600" style={{ width: `${split}%` }}>
          <div className="flex h-full w-[34rem] max-w-[calc(100vw-4rem)] items-center p-8">
            <div><Camera className="text-amber-200" size={52} /><h3 className="mt-3 text-2xl font-black">Pixel Pro</h3><p>Studio camera</p></div>
          </div>
        </div>
        <div className="absolute inset-y-0 w-1 bg-white" style={{ left: `${split}%` }}>
          <Zap className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white p-2 text-slate-950" size={44} />
        </div>
      </div>
      <label htmlFor={`${ID}-range`} className="mt-4 block text-sm font-bold">Choose your champion</label>
      <input
        id={`${ID}-range`}
        type="range"
        min="0"
        max="100"
        value={split}
        onChange={(event) => compare(event.target.value)}
        className="h-11 w-full accent-rose-400"
        aria-valuetext={`${split}% Pixel Pro, ${100 - split}% Volt Max`}
      />
    </BatchTemplateFrame>
  );
}

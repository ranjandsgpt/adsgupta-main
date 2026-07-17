import React, { useState } from 'react';
import { Settings2 } from 'lucide-react';
import { MorphContainer } from '../primitives/MorphContainer';
import { Batch05Shell, buttonClass, trackClick, useMorph } from './Batch05Shell';

const ID = 'widget-configurator-morph';
const colors = ['#67e8f9', '#f9a8d4', '#86efac'];

export default function Template65WidgetConfiguratorMorph() {
  const { expanded, setMorph, reducedMotion } = useMorph(ID);
  const [color, setColor] = useState(colors[0]);
  const [size, setSize] = useState(50);

  return (
    <Batch05Shell templateId={ID} title="Widget to Configurator Morph" className="mx-auto max-w-lg">
      <MorphContainer className="bg-slate-950 p-5 text-white">
        <div className="flex min-h-[190px] items-center justify-center overflow-hidden rounded-2xl bg-white/5">
          <div className="rounded-[2rem] shadow-2xl" style={{ width: `${70 + size}px`, height: `${70 + size}px`, backgroundColor: color, transition: reducedMotion ? 'none' : 'all 220ms ease' }} role="img" aria-label="Configured product preview" />
        </div>
        {!expanded ? (
          <button type="button" className={`${buttonClass} mt-4 flex w-full items-center justify-center gap-2 bg-white text-slate-950`} onClick={() => setMorph(true, 'open-configurator')}><Settings2 size={18} /> Customize</button>
        ) : (
          <div className="mt-4 space-y-4">
            <fieldset><legend className="text-sm font-semibold">Finish</legend><div className="mt-2 flex gap-2">{colors.map((item) => <button key={item} type="button" aria-label={`Select finish ${item}`} aria-pressed={color === item} className="min-h-11 min-w-11 rounded-full border-4 border-slate-950 outline-none focus-visible:ring-2 focus-visible:ring-white" style={{ backgroundColor: item, boxShadow: color === item ? '0 0 0 2px white' : 'none' }} onClick={() => { setColor(item); trackClick(ID, 'finish', { value: item }); }} />)}</div></fieldset>
            <label className="block text-sm font-semibold" htmlFor="config-size">Scale: {size}%</label><input id="config-size" type="range" min="20" max="100" value={size} onChange={(event) => setSize(Number(event.target.value))} className="h-11 w-full accent-cyan-300" />
            <div className="flex gap-2"><button type="button" className={`${buttonClass} flex-1 bg-cyan-300 text-slate-950`} onClick={() => trackClick(ID, 'save-configuration', { color, size })}>Save design</button><button type="button" className={`${buttonClass} bg-white/10 text-white`} onClick={() => setMorph(false, 'collapse')}>Done</button></div>
          </div>
        )}
      </MorphContainer>
    </Batch05Shell>
  );
}

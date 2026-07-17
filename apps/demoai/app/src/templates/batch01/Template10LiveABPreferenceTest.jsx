import React, { useState } from 'react';
import { Check } from 'lucide-react';
import BatchTemplateFrame, { track } from './BatchTemplateFrame';

const ID = 'live-ab-preference-test';
const VARIANTS = [
  { id: 'A', title: 'Move boldly.', copy: 'Built for your fastest mile.', color: 'from-cyan-500 to-blue-700', votes: 57 },
  { id: 'B', title: 'Own the distance.', copy: 'Comfort that keeps going.', color: 'from-fuchsia-500 to-rose-700', votes: 43 },
];

export default function Template10LiveABPreferenceTest() {
  const [choice, setChoice] = useState('');

  const choose = (variant) => {
    setChoice(variant.id);
    track(ID, 'click', { target: 'variant', variant: variant.id });
    track(ID, 'complete', { preference: variant.id });
  };

  return (
    <BatchTemplateFrame templateId={ID} title="Live A/B Preference Test" subtitle="Choose the message that moves you">
      <div className="grid gap-3 sm:grid-cols-2">
        {VARIANTS.map((variant) => (
          <button
            key={variant.id}
            type="button"
            onClick={() => choose(variant)}
            aria-pressed={choice === variant.id}
            className={`relative min-h-56 overflow-hidden rounded-2xl bg-gradient-to-br p-5 text-left ${variant.color} focus-visible:outline focus-visible:outline-2 focus-visible:outline-white`}
          >
            <span className="text-xs font-black uppercase tracking-widest">Creative {variant.id}</span>
            <strong className="mt-12 block text-2xl font-black">{variant.title}</strong>
            <span className="mt-2 block text-sm text-white/80">{variant.copy}</span>
            {choice === variant.id && <Check className="absolute right-4 top-4 rounded-full bg-white p-1 text-slate-950" size={32} />}
            {choice && <span className="absolute bottom-4 right-4 rounded-full bg-black/25 px-3 py-1 text-xs font-bold">{variant.votes + (choice === variant.id ? 1 : 0)}%</span>}
          </button>
        ))}
      </div>
      <p className="mt-4 text-center text-sm text-slate-400" aria-live="polite">{choice ? `Thanks — variant ${choice} joined the mock live result.` : 'Results appear after you vote.'}</p>
    </BatchTemplateFrame>
  );
}

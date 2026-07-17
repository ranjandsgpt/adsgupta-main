import React, { useEffect, useState } from 'react';
import { Check, ChevronRight, Search, ShieldCheck } from 'lucide-react';
import { emitTelemetry } from '../telemetry';

const answers = {
  performance: ['Adaptive creative', 'Real-time placement', 'Attention optimization'],
  privacy: ['Contextual signals', 'Consent-aware delivery', 'No third-party cookies'],
  revenue: ['Incremental slots', 'Yield protection', 'Frequency controls'],
};

export default function Template74SponsoredAnswerAd() {
  const [topic, setTopic] = useState('performance');

  useEffect(() => {
    emitTelemetry('impression', { templateId: 'sponsored-answer' });
  }, []);

  return (
    <section className="my-7 overflow-hidden rounded-2xl border border-emerald-200 bg-white text-slate-900 shadow-xl">
      <div className="flex items-center gap-3 border-b border-slate-200 p-4">
        <Search size={18} className="text-emerald-600" />
        <p className="text-sm font-semibold">Which ad stack fits this publisher?</p>
      </div>
      <div className="flex gap-2 overflow-x-auto px-4 pt-4">
        {Object.keys(answers).map((key) => (
          <button
            key={key}
            type="button"
            onClick={() => setTopic(key)}
            className={`min-h-11 shrink-0 rounded-full px-4 text-xs font-bold capitalize ${topic === key ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600'}`}
          >
            {key}
          </button>
        ))}
      </div>
      <div className="p-4">
        <div className="rounded-xl bg-emerald-50 p-4">
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-800"><ShieldCheck size={16} /> AI matched recommendation</div>
          <h3 className="mt-2 text-lg font-black">Sage Context Engine</h3>
          <ul className="mt-3 space-y-2">
            {answers[topic].map((item) => <li key={item} className="flex items-center gap-2 text-sm text-slate-700"><Check size={14} className="text-emerald-600" /> {item}</li>)}
          </ul>
          <button type="button" onClick={() => emitTelemetry('click', { templateId: 'sponsored-answer', topic })} className="mt-4 flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 text-sm font-bold text-white">
            Compare solutions <ChevronRight size={16} />
          </button>
        </div>
        <p className="mt-2 text-center text-[9px] uppercase tracking-widest text-slate-400">Sponsored · Ranked by contextual fit</p>
      </div>
    </section>
  );
}

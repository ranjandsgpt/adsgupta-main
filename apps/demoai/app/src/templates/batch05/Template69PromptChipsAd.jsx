import React, { useState } from 'react';
import { Sparkles } from 'lucide-react';
import { Batch05Shell, buttonClass, trackClick } from './Batch05Shell';

const ID = 'prompt-chips-ad';
const prompts = {
  'Plan a city break': 'A 48-hour route: market breakfast, design district, sunset ferry.',
  'Find a quiet escape': 'Try a lakeside cabin with offline maps and a late checkout.',
  'Build a food tour': 'Start with a bakery crawl, add a chef’s counter, finish at the night market.',
};

export default function Template69PromptChipsAd() {
  const [answer, setAnswer] = useState('Choose a prompt to shape your next escape.');
  const choose = (prompt) => {
    setAnswer(prompts[prompt]);
    trackClick(ID, 'prompt-chip', { prompt });
  };

  return (
    <Batch05Shell templateId={ID} title="Prompt Chips Ad" className="mx-auto max-w-lg">
      <div className="bg-gradient-to-br from-cyan-950 via-slate-950 to-violet-950 p-6 text-white">
        <div className="flex items-center gap-2 text-cyan-300"><Sparkles size={20} /><span className="text-xs font-bold uppercase tracking-[.2em]">Trip ideas</span></div>
        <h3 className="mt-3 text-3xl font-black">Where should we begin?</h3>
        <div className="mt-5 flex flex-wrap gap-2">{Object.keys(prompts).map((prompt) => <button key={prompt} type="button" className={`${buttonClass} bg-white/10 text-sm text-white hover:bg-white/20`} onClick={() => choose(prompt)}>{prompt}</button>)}</div>
        <div className="mt-5 min-h-[88px] rounded-2xl border border-cyan-300/25 bg-cyan-300/10 p-4 text-sm leading-relaxed text-cyan-50" aria-live="polite">{answer}</div>
        <button type="button" className={`${buttonClass} mt-4 bg-cyan-300 text-slate-950`} onClick={() => trackClick(ID, 'explore-idea')}>Explore this idea</button>
      </div>
    </Batch05Shell>
  );
}

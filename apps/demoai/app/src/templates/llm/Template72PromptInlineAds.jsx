import React, { useEffect, useState } from 'react';
import { ArrowUp, Bot, Sparkles } from 'lucide-react';
import { emitTelemetry } from '../telemetry';

const prompts = [
  'How do adaptive ads work?',
  'Compare contextual ad platforms',
  'Show a privacy-first strategy',
];

export default function Template72PromptInlineAds() {
  const [answer, setAnswer] = useState('Ask a follow-up to explore the topic.');

  useEffect(() => {
    emitTelemetry('impression', { templateId: 'prompt-inline-ads' });
  }, []);

  const ask = (prompt) => {
    setAnswer(prompt === prompts[0]
      ? 'Adaptive ads combine page context, viewport size, attention, and placement rules to choose a suitable format.'
      : 'I found a concise answer and a relevant sponsored tool that can help you take the next step.');
    emitTelemetry('click', { templateId: 'prompt-inline-ads', prompt });
  };

  return (
    <section className="my-7 rounded-2xl border border-slate-200 bg-white p-4 text-slate-900 shadow-xl sm:p-5">
      <div className="flex items-center gap-2 text-sm font-bold"><Bot size={18} className="text-blue-600" /> Continue with AI</div>
      <div className="mt-3 rounded-xl bg-slate-100 p-3 text-sm leading-6 text-slate-700">{answer}</div>
      <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
        {prompts.map((prompt) => (
          <button key={prompt} type="button" onClick={() => ask(prompt)} className="min-h-11 shrink-0 rounded-full border border-slate-300 bg-white px-4 text-xs font-semibold hover:border-blue-400">
            {prompt}
          </button>
        ))}
      </div>
      <div className="mt-4 flex items-center gap-3 rounded-xl border border-violet-200 bg-violet-50 p-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-violet-600 text-white"><Sparkles size={17} /></div>
        <div className="min-w-0 flex-1">
          <p className="text-[9px] font-bold uppercase tracking-widest text-violet-700">Sponsored response</p>
          <p className="truncate text-xs font-semibold">Scale creative intelligence with Brand Studio AI</p>
        </div>
        <button type="button" onClick={() => emitTelemetry('click', { templateId: 'prompt-inline-ads', target: 'sponsor' })} className="flex min-h-11 min-w-11 items-center justify-center rounded-full bg-slate-950 text-white" aria-label="Open sponsor"><ArrowUp size={16} className="rotate-45" /></button>
      </div>
    </section>
  );
}

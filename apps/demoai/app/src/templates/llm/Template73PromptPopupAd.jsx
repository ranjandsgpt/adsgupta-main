import React, { useEffect, useState } from 'react';
import { Bot, Sparkles, X } from 'lucide-react';
import { emitTelemetry } from '../telemetry';

export default function Template73PromptPopupAd() {
  const [open, setOpen] = useState(true);
  const [message, setMessage] = useState('Want a 30-second AI briefing on this article?');

  useEffect(() => {
    emitTelemetry('impression', { templateId: 'prompt-popup' });
  }, []);

  if (!open) return null;

  return (
    <aside className="pointer-events-auto absolute bottom-4 left-3 right-3 z-50 mx-auto max-w-sm overflow-hidden rounded-2xl border border-white/15 bg-slate-950 text-white shadow-2xl">
      <div className="flex items-center justify-between bg-gradient-to-r from-blue-600 to-violet-600 px-4 py-3">
        <div className="flex items-center gap-2 text-sm font-bold"><Bot size={17} /> AI reading companion</div>
        <button
          type="button"
          onClick={() => {
            setOpen(false);
            emitTelemetry('close', { templateId: 'prompt-popup' });
          }}
          className="flex min-h-11 min-w-11 items-center justify-center rounded-lg hover:bg-white/10"
          aria-label="Close ad"
        >
          <X size={17} />
        </button>
      </div>
      <div className="p-4">
        <p className="text-sm leading-6 text-slate-200">{message}</p>
        <div className="mt-3 grid gap-2">
          {['Summarize key trends', 'Show recommended tools', 'What should I do next?'].map((prompt) => (
            <button
              key={prompt}
              type="button"
              onClick={() => {
                setMessage(`Here is a tailored answer for “${prompt}” — powered by a context-matched sponsor.`);
                emitTelemetry('click', { templateId: 'prompt-popup', prompt });
              }}
              className="min-h-11 rounded-xl border border-slate-700 bg-slate-900 px-3 text-left text-xs font-semibold hover:border-violet-400"
            >
              {prompt}
            </button>
          ))}
        </div>
        <p className="mt-3 flex items-center gap-1.5 text-[9px] uppercase tracking-widest text-slate-500"><Sparkles size={11} /> Prompts may include sponsored recommendations</p>
      </div>
    </aside>
  );
}

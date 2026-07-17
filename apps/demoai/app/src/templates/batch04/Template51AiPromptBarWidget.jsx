import React, { useRef, useState } from 'react';
import { ArrowUp, Sparkles } from 'lucide-react';
import { useDismissState } from '../hooks/useDismissState';
import { NativeWidgetChrome } from '../primitives/NativeWidgetChrome';
import { emitTelemetry } from '../telemetry';

const ID = 'ai-prompt-bar-widget';
const replies = {
  summarize: 'A lighter planning system can protect focus by limiting daily priorities.',
  ideas: 'Try a focus soundtrack, meeting-free hour, or end-of-day reset ritual.',
  default: 'Demo response: break that goal into one clear, time-boxed next action.',
};

export default function Template51AiPromptBarWidget() {
  const [prompt, setPrompt] = useState('');
  const [reply, setReply] = useState('');
  const input = useRef(null);
  const { dismissed, dismiss } = useDismissState({ key: ID, onDismiss: (reason) => emitTelemetry('close', { templateId: ID, reason }) });
  if (dismissed) return null;
  const submit = (event) => {
    event.preventDefault();
    const value = prompt.trim();
    if (!value) return;
    setReply(value.toLowerCase().includes('summar') ? replies.summarize : value.toLowerCase().includes('idea') ? replies.ideas : replies.default);
    emitTelemetry('complete', { templateId: ID, action: 'local-prompt' });
  };
  return (
    <NativeWidgetChrome label="Sponsored · local AI simulation" title="Ask Focus Companion" onClose={() => dismiss('button')}>
      <div className="p-4">
        <div className="flex flex-wrap gap-2">{['Summarize this benefit', 'Give me ideas'].map((item) => <button key={item} type="button" onClick={() => { setPrompt(item); input.current?.focus(); }} className="min-h-11 rounded-full border border-white/15 px-4 text-sm text-slate-200 hover:bg-white/10">{item}</button>)}</div>
        <form onSubmit={submit} className="mt-3 flex items-end gap-2 rounded-2xl border border-violet-400/40 bg-slate-950 p-2">
          <Sparkles className="mb-3 ml-2 shrink-0 text-violet-300" size={20} />
          <label className="sr-only" htmlFor={`${ID}-prompt`}>Prompt</label>
          <textarea ref={input} id={`${ID}-prompt`} rows="1" value={prompt} onChange={(event) => setPrompt(event.target.value)} placeholder="Ask about better focus…" className="min-h-11 flex-1 resize-none bg-transparent px-2 py-3 text-white outline-none" />
          <button type="submit" aria-label="Send prompt" className="grid min-h-11 min-w-11 place-items-center rounded-xl bg-violet-400 text-slate-950"><ArrowUp /></button>
        </form>
        {reply && <p role="status" className="mt-3 rounded-xl bg-violet-400/10 p-3 text-sm text-violet-100">{reply}</p>}
        <p className="mt-2 text-xs text-slate-500">Scripted locally; no model or network request is used.</p>
      </div>
    </NativeWidgetChrome>
  );
}

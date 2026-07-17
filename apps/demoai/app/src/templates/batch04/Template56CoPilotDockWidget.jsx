import React, { useRef, useState } from 'react';
import { Bot, CheckCircle2, ChevronDown, ChevronUp, Send } from 'lucide-react';
import { useDismissState } from '../hooks/useDismissState';
import { NativeWidgetChrome } from '../primitives/NativeWidgetChrome';
import { emitTelemetry } from '../telemetry';

const ID = 'co-pilot-dock-widget';

export default function Template56CoPilotDockWidget() {
  const [expanded, setExpanded] = useState(false);
  const [task, setTask] = useState('');
  const [result, setResult] = useState('');
  const input = useRef(null);
  const { dismissed, dismiss } = useDismissState({ key: ID, onDismiss: (reason) => emitTelemetry('close', { templateId: ID, reason }) });
  if (dismissed) return null;
  const toggle = () => {
    const opening = !expanded;
    setExpanded(opening);
    emitTelemetry(opening ? 'expand' : 'click', { templateId: ID, target: opening ? 'open-dock' : 'close-dock' });
    if (opening) window.setTimeout(() => input.current?.focus(), 0);
  };
  const submit = (event) => { event.preventDefault(); if (!task.trim()) return; setResult(`Demo plan ready: clarify “${task.trim()}”, choose one owner, and set a 20-minute first step.`); emitTelemetry('complete', { templateId: ID, action: 'local-task' }); };
  return (
    <NativeWidgetChrome label="Sponsored · co-pilot simulation" title="Workflow co-pilot dock" onClose={() => dismiss('button')}>
      <div className="p-3">
        <button type="button" aria-expanded={expanded} onClick={toggle} className="flex min-h-14 w-full items-center gap-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-500 px-4 text-left text-white">
          <Bot className="shrink-0" /><span className="flex-1"><span className="block font-black">Need a next step?</span><span className="block text-xs text-white/75">Open a local scripted helper</span></span>{expanded ? <ChevronUp /> : <ChevronDown />}
        </button>
        {expanded && <div className="pt-3">
          <form onSubmit={submit} className="flex flex-col gap-2 sm:flex-row">
            <label className="sr-only" htmlFor={`${ID}-task`}>Task to plan</label>
            <input ref={input} id={`${ID}-task`} value={task} onChange={(event) => setTask(event.target.value)} placeholder="e.g. Prepare the project kickoff" className="min-h-11 flex-1 rounded-xl border border-white/15 bg-slate-950 px-3 text-white" />
            <button type="submit" className="flex min-h-11 items-center justify-center gap-2 rounded-xl bg-violet-400 px-4 font-bold text-slate-950"><Send size={18} /> Plan</button>
          </form>
          {result && <p role="status" className="mt-3 flex gap-2 rounded-xl bg-emerald-400/10 p-3 text-sm text-emerald-100"><CheckCircle2 className="shrink-0" size={20} />{result}</p>}
          <p className="mt-2 text-xs text-slate-500">No AI service or network request is used.</p>
        </div>}
      </div>
    </NativeWidgetChrome>
  );
}

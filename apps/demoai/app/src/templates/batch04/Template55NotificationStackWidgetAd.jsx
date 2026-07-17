import React, { useState } from 'react';
import { Bell, Check, Package, Sparkles, X } from 'lucide-react';
import { useDismissState } from '../hooks/useDismissState';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { NativeWidgetChrome } from '../primitives/NativeWidgetChrome';
import { emitTelemetry } from '../telemetry';

const ID = 'notification-stack-widget-ad';
const initial = [
  { id: 1, title: 'Order packed', body: 'Your demo parcel is ready.', icon: Package },
  { id: 2, title: 'New studio mix', body: 'A focus playlist was added.', icon: Sparkles },
  { id: 3, title: 'Weekly goal', body: 'Three sessions complete.', icon: Check },
];

export default function Template55NotificationStackWidgetAd() {
  const [notes, setNotes] = useState(initial);
  const reduced = useReducedMotion();
  const { dismissed, dismiss } = useDismissState({ key: ID, onDismiss: (reason) => emitTelemetry('close', { templateId: ID, reason }) });
  if (dismissed) return null;
  const remove = (id) => { setNotes((items) => items.filter((item) => item.id !== id)); emitTelemetry('click', { templateId: ID, target: 'dismiss-notification' }); };
  return (
    <NativeWidgetChrome label="Sponsored · notification demo" title="A calmer update stack" onClose={() => dismiss('button')}>
      <div className="p-4">
        <div className="mb-3 flex items-center gap-2 text-sm text-slate-400"><Bell size={18} /> Local simulated notifications</div>
        <div aria-live="polite" className="space-y-2">
          {notes.map((note) => { const Icon = note.icon; return <article key={note.id} className={`flex items-center gap-3 rounded-2xl border border-white/10 bg-slate-950 p-3 ${reduced ? '' : 'transition-all'}`}><div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-cyan-400/15 text-cyan-300"><Icon size={20} /></div><div className="min-w-0 flex-1"><h3 className="font-bold text-white">{note.title}</h3><p className="truncate text-sm text-slate-400">{note.body}</p></div><button type="button" aria-label={`Dismiss ${note.title}`} onClick={() => remove(note.id)} className="grid min-h-11 min-w-11 place-items-center rounded-full text-slate-400 hover:bg-white/10"><X size={18} /></button></article>; })}
          {!notes.length && <div role="status" className="rounded-2xl border border-dashed border-white/15 p-8 text-center text-slate-400">You’re all caught up.</div>}
        </div>
        {notes.length < initial.length && <button type="button" onClick={() => setNotes(initial)} className="mt-3 min-h-11 w-full rounded-xl border border-white/15 font-bold text-white">Restore demo stack</button>}
      </div>
    </NativeWidgetChrome>
  );
}

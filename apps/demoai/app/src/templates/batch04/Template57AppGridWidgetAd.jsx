import React, { useState } from 'react';
import { CalendarDays, CheckSquare, CloudSun, Headphones, MessageCircle, TimerReset } from 'lucide-react';
import { useDismissState } from '../hooks/useDismissState';
import { NativeWidgetChrome } from '../primitives/NativeWidgetChrome';
import { emitTelemetry } from '../telemetry';

const ID = 'app-grid-widget-ad';
const apps = [
  { name: 'Plan', detail: 'Today’s three priorities', icon: CheckSquare, color: 'bg-emerald-400/15 text-emerald-300' },
  { name: 'Listen', detail: 'Start a focus mix', icon: Headphones, color: 'bg-fuchsia-400/15 text-fuchsia-300' },
  { name: 'Weather', detail: '18° · light rain', icon: CloudSun, color: 'bg-sky-400/15 text-sky-300' },
  { name: 'Meet', detail: 'Next at 2:30 PM', icon: CalendarDays, color: 'bg-amber-400/15 text-amber-300' },
  { name: 'Focus', detail: 'Begin a 25 min session', icon: TimerReset, color: 'bg-violet-400/15 text-violet-300' },
  { name: 'Chat', detail: 'Two demo messages', icon: MessageCircle, color: 'bg-cyan-400/15 text-cyan-300' },
];

export default function Template57AppGridWidgetAd() {
  const [active, setActive] = useState(null);
  const { dismissed, dismiss } = useDismissState({ key: ID, onDismiss: (reason) => emitTelemetry('close', { templateId: ID, reason }) });
  if (dismissed) return null;
  return (
    <NativeWidgetChrome label="Sponsored · app grid demo" title="Your day, one tap away" onClose={() => dismiss('button')}>
      <div className="p-4">
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">{apps.map((app) => { const Icon = app.icon; return <button key={app.name} type="button" aria-pressed={active === app.name} onClick={() => { setActive(app.name); emitTelemetry('click', { templateId: ID, target: `app-${app.name.toLowerCase()}` }); }} className={`min-h-28 rounded-2xl border p-3 text-left ${active === app.name ? 'border-cyan-300 bg-white/10' : 'border-white/10 bg-slate-950 hover:bg-white/5'}`}><span className={`grid h-11 w-11 place-items-center rounded-xl ${app.color}`}><Icon size={22} /></span><span className="mt-3 block font-bold text-white">{app.name}</span><span className="block text-xs text-slate-400">{app.detail}</span></button>; })}</div>
        <p aria-live="polite" className="mt-3 min-h-11 rounded-xl bg-white/5 p-3 text-sm text-slate-300">{active ? `${active} opened as a local demo tile; no app was launched.` : 'Choose any tile to preview its local state.'}</p>
      </div>
    </NativeWidgetChrome>
  );
}

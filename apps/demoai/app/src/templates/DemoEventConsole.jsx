import React, { useEffect, useState } from 'react';
import { Activity, Trash2 } from 'lucide-react';
import { getTelemetryHistory, subscribeTelemetry } from './telemetry';

const EVENT_COLORS = {
  impression: 'text-blue-300',
  viewable: 'text-cyan-300',
  click: 'text-emerald-300',
  expand: 'text-violet-300',
  close: 'text-rose-300',
  complete: 'text-amber-300',
};

export function DemoEventConsole({ className = '' }) {
  const [events, setEvents] = useState(() => getTelemetryHistory().slice(0, 8));

  useEffect(() => subscribeTelemetry((event) => {
    setEvents((current) => [event, ...current].slice(0, 8));
  }), []);

  return (
    <section className={`flex min-h-0 flex-col border-slate-800 bg-slate-950/95 ${className}`} aria-label="Demo event console">
      <div className="flex min-h-11 items-center justify-between gap-2 px-3">
        <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
          <Activity size={14} className="text-cyan-400" />
          Demo Event Console
          <span className="rounded-full bg-slate-800 px-2 py-0.5 font-mono text-slate-500">{events.length}</span>
        </div>
        <button
          type="button"
          onClick={() => setEvents([])}
          className="flex min-h-11 min-w-11 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-800 hover:text-white"
          aria-label="Clear event console"
        >
          <Trash2 size={15} />
        </button>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto px-3 pb-3 font-mono text-[10px]">
        {events.length === 0 ? (
          <p className="py-2 text-slate-600">Interact with a template to see telemetry.</p>
        ) : events.map((event) => (
          <div key={event.id} className="flex items-center gap-2 border-t border-slate-900 py-1.5">
            <time className="shrink-0 text-slate-600">
              {new Date(event.timestamp).toLocaleTimeString([], { hour12: false, minute: '2-digit', second: '2-digit' })}
            </time>
            <span className={`w-16 shrink-0 ${EVENT_COLORS[event.type] || 'text-slate-300'}`}>{event.type}</span>
            <span className="truncate text-slate-500">{event.templateId || 'unknown'}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

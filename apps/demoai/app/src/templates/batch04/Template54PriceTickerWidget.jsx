import React, { useEffect, useState } from 'react';
import { ArrowDownRight, ArrowUpRight, Pause, Play } from 'lucide-react';
import { useDismissState } from '../hooks/useDismissState';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { NativeWidgetChrome } from '../primitives/NativeWidgetChrome';
import { emitTelemetry } from '../telemetry';

const ID = 'price-ticker-widget';
const base = [{ symbol: 'NOVA', price: 84.2 }, { symbol: 'ARC', price: 42.75 }, { symbol: 'MOSS', price: 117.1 }];

export default function Template54PriceTickerWidget() {
  const [tick, setTick] = useState(0);
  const [running, setRunning] = useState(true);
  const reduced = useReducedMotion();
  const { dismissed, dismiss } = useDismissState({ key: ID, onDismiss: (reason) => emitTelemetry('close', { templateId: ID, reason }) });
  useEffect(() => {
    if (!running || reduced) return undefined;
    const timer = window.setInterval(() => setTick((value) => value + 1), 1800);
    return () => window.clearInterval(timer);
  }, [running, reduced]);
  if (dismissed) return null;
  return (
    <NativeWidgetChrome label="Sponsored · simulated prices" title="Demo market pulse" onClose={() => dismiss('button')}>
      <div className="p-4">
        <ul className="grid gap-2 sm:grid-cols-3">{base.map((item, index) => {
          const delta = (((tick + index * 2) % 7) - 3) * 0.18; const up = delta >= 0;
          return <li key={item.symbol} className="rounded-xl border border-white/10 bg-slate-950 p-3"><div className="flex items-center justify-between"><span className="font-black text-white">{item.symbol}</span>{up ? <ArrowUpRight className="text-emerald-300" /> : <ArrowDownRight className="text-rose-300" />}</div><p className="mt-3 font-mono text-xl text-white">${(item.price + delta).toFixed(2)}</p><p className={`text-xs ${up ? 'text-emerald-300' : 'text-rose-300'}`}>{up ? '+' : ''}{delta.toFixed(2)} demo</p></li>;
        })}</ul>
        <div className="mt-3 flex items-center justify-between gap-3"><p className="text-xs text-slate-500">Deterministic fictional values; not financial data.</p><button type="button" onClick={() => { setRunning((value) => !value); emitTelemetry('click', { templateId: ID, target: 'ticker-toggle' }); }} className="flex min-h-11 min-w-28 items-center justify-center gap-2 rounded-xl border border-white/15 text-white">{running ? <Pause size={18} /> : <Play size={18} />}{running ? 'Pause' : 'Resume'}</button></div>
      </div>
    </NativeWidgetChrome>
  );
}

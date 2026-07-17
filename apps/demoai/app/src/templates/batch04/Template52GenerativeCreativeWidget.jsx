import React, { useState } from 'react';
import { Palette, RefreshCw } from 'lucide-react';
import { useDismissState } from '../hooks/useDismissState';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { NativeWidgetChrome } from '../primitives/NativeWidgetChrome';
import { emitTelemetry } from '../telemetry';

const ID = 'generative-creative-widget';
const variants = [
  { title: 'Make room for wonder.', copy: 'A vivid reset for your everyday carry.', gradient: 'from-fuchsia-500 via-rose-400 to-amber-300' },
  { title: 'Quiet tools. Bold ideas.', copy: 'Designed to disappear into your flow.', gradient: 'from-cyan-300 via-blue-500 to-indigo-950' },
  { title: 'Move at your own tempo.', copy: 'Flexible essentials for changing plans.', gradient: 'from-lime-300 via-emerald-500 to-slate-950' },
];

export default function Template52GenerativeCreativeWidget() {
  const [variant, setVariant] = useState(0);
  const reduced = useReducedMotion();
  const { dismissed, dismiss } = useDismissState({ key: ID, onDismiss: (reason) => emitTelemetry('close', { templateId: ID, reason }) });
  if (dismissed) return null;
  const current = variants[variant];
  const generate = () => { setVariant((value) => (value + 1) % variants.length); emitTelemetry('click', { templateId: ID, target: 'generate-local-variant' }); };
  return (
    <NativeWidgetChrome label="Sponsored · generative simulation" title="Creative variation studio" onClose={() => dismiss('button')}>
      <div className="grid gap-4 p-4 sm:grid-cols-[1.2fr_.8fr]">
        <div className={`relative min-h-64 overflow-hidden rounded-2xl bg-gradient-to-br ${current.gradient} p-6 ${reduced ? '' : 'transition-colors duration-500'}`}>
          <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full border-[24px] border-white/20" aria-hidden="true" />
          <p className="relative text-xs font-bold uppercase tracking-widest text-white/75">Variant {variant + 1} · locally composed</p>
          <h3 className="relative mt-16 max-w-xs text-3xl font-black text-white">{current.title}</h3>
          <p className="relative mt-2 text-sm text-white/80">{current.copy}</p>
        </div>
        <div className="flex flex-col justify-center">
          <Palette className="text-fuchsia-300" />
          <h3 className="mt-3 font-bold text-white">Explore scripted variants</h3>
          <p className="mt-2 text-sm text-slate-400">Cycles deterministic copy and color combinations without generating or transmitting data.</p>
          <button type="button" onClick={generate} className="mt-4 flex min-h-11 items-center justify-center gap-2 rounded-xl bg-fuchsia-400 px-4 font-bold text-slate-950"><RefreshCw size={18} /> Next variant</button>
        </div>
      </div>
    </NativeWidgetChrome>
  );
}

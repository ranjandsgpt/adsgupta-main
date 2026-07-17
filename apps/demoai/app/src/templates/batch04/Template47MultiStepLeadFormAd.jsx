import React, { useState } from 'react';
import { Check, ChevronLeft, ChevronRight } from 'lucide-react';
import { useDismissState } from '../hooks/useDismissState';
import { NativeWidgetChrome } from '../primitives/NativeWidgetChrome';
import { emitTelemetry } from '../telemetry';

const ID = 'multi-step-lead-form-ad';

export default function Template47MultiStepLeadFormAd() {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({ goal: '', email: '', consent: false });
  const { dismissed, dismiss } = useDismissState({ key: ID, onDismiss: (reason) => emitTelemetry('close', { templateId: ID, reason }) });
  if (dismissed) return null;
  const valid = step === 0 ? form.goal : step === 1 ? /\S+@\S+\.\S+/.test(form.email) : form.consent;
  const next = () => {
    if (step === 2) { setStep(3); emitTelemetry('complete', { templateId: ID, action: 'lead-simulated' }); }
    else setStep((value) => value + 1);
  };
  return (
    <NativeWidgetChrome label="Sponsored · demo form" title="Build your 4-week learning plan" onClose={() => dismiss('button')}>
      <div className="p-4">
        <p className="text-xs font-bold uppercase tracking-wider text-cyan-300">Step {Math.min(step + 1, 3)} of 3</p>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/10"><div className="h-full bg-cyan-400 transition-[width]" style={{ width: `${Math.min(step + 1, 3) / 3 * 100}%` }} /></div>
        {step === 0 && <fieldset className="mt-5"><legend className="font-bold text-white">What do you want to improve?</legend><div className="mt-3 grid gap-2 sm:grid-cols-3">{['Leadership', 'Design', 'Data'].map((goal) => <button key={goal} type="button" aria-pressed={form.goal === goal} onClick={() => setForm({ ...form, goal })} className={`min-h-11 rounded-xl border px-3 ${form.goal === goal ? 'border-cyan-400 bg-cyan-400/10 text-cyan-200' : 'border-white/15 text-white'}`}>{goal}</button>)}</div></fieldset>}
        {step === 1 && <label className="mt-5 block font-bold text-white">Where should the demo plan go?<input autoFocus type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} placeholder="you@example.com" className="mt-3 min-h-11 w-full rounded-xl border border-white/15 bg-slate-950 px-3 text-white" /><span className="mt-2 block text-xs font-normal text-slate-400">Local simulation only; nothing is sent.</span></label>}
        {step === 2 && <label className="mt-5 flex min-h-11 cursor-pointer items-center gap-3 rounded-xl border border-white/15 p-3 text-sm text-white"><input type="checkbox" checked={form.consent} onChange={(event) => setForm({ ...form, consent: event.target.checked })} className="h-5 w-5 accent-cyan-400" />I agree to preview this simulated plan.</label>}
        {step === 3 && <div role="status" className="mt-5 rounded-2xl bg-emerald-400/10 p-6 text-center text-emerald-200"><Check className="mx-auto mb-2" />Demo lead complete. No data left this browser.</div>}
        {step < 3 && <div className="mt-5 flex gap-2">{step > 0 && <button type="button" onClick={() => setStep((value) => value - 1)} className="flex min-h-11 flex-1 items-center justify-center gap-1 rounded-xl border border-white/15 text-white"><ChevronLeft size={18} /> Back</button>}<button type="button" disabled={!valid} onClick={next} className="flex min-h-11 flex-1 items-center justify-center gap-1 rounded-xl bg-cyan-400 font-bold text-slate-950 disabled:cursor-not-allowed disabled:opacity-40">{step === 2 ? 'Finish demo' : 'Continue'} <ChevronRight size={18} /></button></div>}
      </div>
    </NativeWidgetChrome>
  );
}

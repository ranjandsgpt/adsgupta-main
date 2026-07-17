import React, { useEffect, useRef, useState } from 'react';
import { Bell, Check } from 'lucide-react';
import { Batch05Shell, buttonClass, trackClick } from './Batch05Shell';

const ID = 'reminder-widget-ad';

export default function Template68ReminderWidgetAd() {
  const [state, setState] = useState('idle');
  const timerRef = useRef(null);
  useEffect(() => () => window.clearTimeout(timerRef.current), []);

  const schedule = () => {
    window.clearTimeout(timerRef.current);
    setState('scheduled');
    trackClick(ID, 'schedule-reminder');
    timerRef.current = window.setTimeout(() => setState('ready'), 5000);
  };
  const clearReminder = () => {
    window.clearTimeout(timerRef.current);
    setState('idle');
  };

  return (
    <Batch05Shell templateId={ID} title="Reminder Widget Ad" className="mx-auto max-w-sm" onClosed={clearReminder}>
      <div className="bg-gradient-to-br from-purple-950 to-slate-950 p-6 text-white" aria-live="polite">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-purple-300 text-purple-950">{state === 'ready' ? <Check size={25} /> : <Bell size={25} />}</div>
        <p className="mt-5 text-xs font-bold uppercase tracking-[.2em] text-purple-300">Local demo reminder</p>
        <h3 className="mt-2 text-3xl font-black">{state === 'ready' ? 'Your early access is ready.' : 'Don’t miss the drop.'}</h3>
        <p className="mt-2 text-sm text-white/65">{state === 'scheduled' ? 'Reminder set for five seconds from now.' : 'No system notification or permission is requested.'}</p>
        <button type="button" className={`${buttonClass} mt-5 w-full bg-purple-300 text-purple-950`} onClick={schedule}>{state === 'idle' ? 'Remind me' : 'Reset reminder'}</button>
      </div>
    </Batch05Shell>
  );
}

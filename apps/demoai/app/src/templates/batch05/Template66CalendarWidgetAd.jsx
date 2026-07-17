import React, { useState } from 'react';
import { CalendarPlus } from 'lucide-react';
import { Batch05Shell, buttonClass, trackClick } from './Batch05Shell';

const ID = 'calendar-widget-ad';

function toIcsDate(date, hour) {
  return `${date.replaceAll('-', '')}T${String(hour).padStart(2, '0')}0000`;
}

export default function Template66CalendarWidgetAd() {
  const tomorrow = new Date(Date.now() + 86400000).toISOString().slice(0, 10);
  const [date, setDate] = useState(tomorrow);

  const downloadInvite = () => {
    const ics = [
      'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//DemoAI//Calendar Widget Ad//EN',
      'BEGIN:VEVENT', `UID:${crypto.randomUUID?.() || `${Date.now()}@demoai`}`,
      `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')}`,
      `DTSTART:${toIcsDate(date, 18)}`, `DTEND:${toIcsDate(date, 19)}`,
      'SUMMARY:Studio North live preview', 'DESCRIPTION:An event saved from the sponsored calendar widget.',
      'END:VEVENT', 'END:VCALENDAR',
    ].join('\r\n');
    const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'studio-north-preview.ics';
    link.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 0);
    trackClick(ID, 'download-ics', { date });
  };

  return (
    <Batch05Shell templateId={ID} title="Calendar Widget Ad" className="mx-auto max-w-sm">
      <div className="bg-gradient-to-br from-blue-950 to-slate-950 p-5 text-white">
        <div className="rounded-2xl bg-white p-5 text-slate-950"><p className="text-xs font-black uppercase tracking-[.2em] text-blue-700">Studio North</p><h3 className="mt-2 text-2xl font-black">Live preview night</h3><p className="mt-2 text-sm text-slate-600">Choose a date. The calendar file is generated locally only when you tap add.</p><label htmlFor="event-date" className="mt-5 block text-sm font-semibold">Event date</label><input id="event-date" type="date" value={date} min={tomorrow} onChange={(event) => setDate(event.target.value)} className="mt-1 min-h-11 w-full rounded-xl border border-slate-300 px-3" /><button type="button" className={`${buttonClass} mt-4 flex w-full items-center justify-center gap-2 bg-blue-700 text-white`} onClick={downloadInvite}><CalendarPlus size={18} /> Add to calendar</button></div>
      </div>
    </Batch05Shell>
  );
}

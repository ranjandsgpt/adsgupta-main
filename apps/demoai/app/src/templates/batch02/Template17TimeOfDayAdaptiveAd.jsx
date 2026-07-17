import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Coffee, Moon, Sun, Sunset } from 'lucide-react';
import { useDismissState } from '../hooks/useDismissState';
import { useViewability } from '../hooks/useViewability';
import { emitTelemetry } from '../telemetry';
import { MorphContainer } from '../primitives/MorphContainer';

const TEMPLATE_ID = 'time-of-day';

const DAYPARTS = [
  {
    id: 'morning',
    range: [5, 11],
    label: 'Morning',
    icon: Coffee,
    scene: 'from-amber-200 via-orange-300 to-rose-400',
    ink: 'text-slate-900',
    headline: 'Start strong.',
    body: 'Kettle & Co. cold brew concentrate \u2014 ready in 20 seconds, smooth for hours.',
    cta: 'Order morning brew',
  },
  {
    id: 'afternoon',
    range: [11, 17],
    label: 'Afternoon',
    icon: Sun,
    scene: 'from-sky-300 via-cyan-400 to-blue-600',
    ink: 'text-white',
    headline: 'Beat the 3pm dip.',
    body: 'Kettle & Co. sparkling yerba mate \u2014 focused energy without the crash.',
    cta: 'Grab an afternoon lift',
  },
  {
    id: 'evening',
    range: [17, 21],
    label: 'Evening',
    icon: Sunset,
    scene: 'from-orange-400 via-rose-500 to-purple-800',
    ink: 'text-white',
    headline: 'Unwind time.',
    body: 'Kettle & Co. golden turmeric latte \u2014 caffeine-free comfort for winding down.',
    cta: 'Shop evening blends',
  },
  {
    id: 'night',
    range: [21, 5],
    label: 'Night',
    icon: Moon,
    scene: 'from-indigo-800 via-slate-900 to-black',
    ink: 'text-white',
    headline: 'Sleep is a skill.',
    body: 'Kettle & Co. chamomile\u2011valerian infusion \u2014 the nightcap your morning will thank you for.',
    cta: 'Shop sleep teas',
  },
];

const daypartForHour = (hour) => DAYPARTS.find(({ range: [start, end] }) => (
  start < end ? hour >= start && hour < end : hour >= start || hour < end
));

export default function Template17TimeOfDayAdaptiveAd() {
  const viewabilityRef = useViewability({ templateId: TEMPLATE_ID });
  const handleDismiss = useCallback((reason) => {
    emitTelemetry('close', { templateId: TEMPLATE_ID, reason });
  }, []);
  const { dismissed, dismiss } = useDismissState({ key: TEMPLATE_ID, onDismiss: handleDismiss });

  const realDaypart = useMemo(() => daypartForHour(new Date().getHours()), []);
  const [override, setOverride] = useState(null);
  const [clock, setClock] = useState(() => new Date());

  useEffect(() => {
    const interval = window.setInterval(() => setClock(new Date()), 30_000);
    return () => window.clearInterval(interval);
  }, []);

  const daypart = override ?? realDaypart;

  const preview = (part) => {
    setOverride(part);
    emitTelemetry('click', { templateId: TEMPLATE_ID, target: `preview-${part.id}` });
  };

  if (dismissed) return null;
  const Icon = daypart.icon;
  const timeLabel = clock.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <section
      ref={viewabilityRef}
      className="mx-auto w-full max-w-md overflow-hidden rounded-2xl border border-white/10 shadow-2xl"
      aria-label="Time-of-day adaptive sponsored unit"
    >
      <MorphContainer className={`bg-gradient-to-br p-5 ${daypart.scene}`} duration={600}>
        <div className="flex items-start justify-between gap-3">
          <div className={`flex items-center gap-2 rounded-full bg-black/20 px-3 py-1.5 text-xs font-bold backdrop-blur ${daypart.ink === 'text-white' ? 'text-white' : 'text-slate-900'}`}>
            <Icon size={16} /> {daypart.label} creative · your clock reads {timeLabel}
          </div>
          <button
            type="button"
            onClick={() => dismiss('button')}
            className="flex min-h-11 min-w-11 items-center justify-center rounded-full bg-black/20 text-white backdrop-blur hover:bg-black/40"
            aria-label="Close ad"
          >
            ✕
          </button>
        </div>
        <h2 className={`mt-6 text-3xl font-black leading-tight drop-shadow ${daypart.ink}`}>{daypart.headline}</h2>
        <p className={`mt-2 max-w-sm text-sm leading-relaxed ${daypart.ink === 'text-white' ? 'text-white/90' : 'text-slate-800'}`}>
          {daypart.body}
        </p>
        <button
          type="button"
          onClick={() => {
            emitTelemetry('click', { templateId: TEMPLATE_ID, target: 'cta', daypart: daypart.id });
            emitTelemetry('complete', { templateId: TEMPLATE_ID, action: 'cta-clicked', daypart: daypart.id });
          }}
          className="mt-5 min-h-11 rounded-full bg-slate-950 px-6 text-sm font-bold text-white hover:bg-slate-800"
        >
          {daypart.cta}
        </button>
      </MorphContainer>
      <div className="border-t border-white/10 bg-slate-950 p-2">
        <p className="px-1 pb-1 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
          Demo: preview other dayparts (live unit follows the visitor&rsquo;s clock)
        </p>
        <div className="flex items-center gap-1.5" role="tablist" aria-label="Preview daypart">
          {DAYPARTS.map((part) => (
            <button
              key={part.id}
              type="button"
              role="tab"
              aria-selected={part.id === daypart.id}
              onClick={() => preview(part)}
              className={`flex min-h-11 flex-1 items-center justify-center gap-1.5 rounded-lg text-xs font-semibold transition-colors ${
                part.id === daypart.id ? 'bg-white/15 text-white' : 'text-slate-400 hover:bg-white/5'
              }`}
            >
              <part.icon size={15} /> {part.label}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

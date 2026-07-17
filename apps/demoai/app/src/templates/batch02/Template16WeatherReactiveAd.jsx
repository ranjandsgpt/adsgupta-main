import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { CloudRain, CloudSnow, Sun, Wind } from 'lucide-react';
import { useDismissState } from '../hooks/useDismissState';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { useViewability } from '../hooks/useViewability';
import { emitTelemetry } from '../telemetry';
import { MorphContainer } from '../primitives/MorphContainer';

const TEMPLATE_ID = 'weather-reactive';

const CONDITIONS = [
  {
    id: 'sunny',
    label: 'Sunny · 28°C',
    icon: Sun,
    scene: 'from-amber-300 via-orange-400 to-rose-500',
    headline: 'Sun\u2019s out. SPF on.',
    body: 'UV index is high right now \u2014 Terraform SPF 50 mist keeps you covered on the go.',
    product: 'SPF 50 Mist · $19',
    cta: 'Shop sun care',
  },
  {
    id: 'rain',
    label: 'Rain · 14°C',
    icon: CloudRain,
    scene: 'from-slate-500 via-slate-700 to-slate-900',
    headline: 'Downpour incoming.',
    body: 'The Terraform StormShell sheds rain for 8 hours and packs into its own pocket.',
    product: 'StormShell Jacket · $129',
    cta: 'Shop rain gear',
  },
  {
    id: 'snow',
    label: 'Snow · -3°C',
    icon: CloudSnow,
    scene: 'from-sky-200 via-blue-400 to-indigo-700',
    headline: 'First snow of the season.',
    body: 'Layer up with the Terraform AlpineDown \u2014 rated to -20°C, lighter than a coffee cup.',
    product: 'AlpineDown Parka · $249',
    cta: 'Shop winter layers',
  },
  {
    id: 'windy',
    label: 'Windy · 19°C',
    icon: Wind,
    scene: 'from-teal-300 via-emerald-500 to-cyan-800',
    headline: 'Gusts up to 40 km/h.',
    body: 'The Terraform Windrow hoodie blocks gusts without the bulk of a jacket.',
    product: 'Windrow Hoodie · $79',
    cta: 'Shop windproof',
  },
];

export default function Template16WeatherReactiveAd() {
  const reducedMotion = useReducedMotion();
  const viewabilityRef = useViewability({ templateId: TEMPLATE_ID });
  const handleDismiss = useCallback((reason) => {
    emitTelemetry('close', { templateId: TEMPLATE_ID, reason });
  }, []);
  const { dismissed, dismiss } = useDismissState({ key: TEMPLATE_ID, onDismiss: handleDismiss });

  const [index, setIndex] = useState(0);
  const [auto, setAuto] = useState(true);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (!auto || dismissed) return undefined;
    intervalRef.current = window.setInterval(() => {
      setIndex((prev) => (prev + 1) % CONDITIONS.length);
    }, 5000);
    return () => window.clearInterval(intervalRef.current);
  }, [auto, dismissed]);

  const condition = CONDITIONS[index];
  const particles = useMemo(
    () => Array.from({ length: 14 }, (_, i) => ({
      left: `${(i * 37) % 100}%`,
      delay: `${(i % 7) * 0.4}s`,
      duration: `${2.4 + (i % 5) * 0.5}s`,
    })),
    [],
  );

  const selectCondition = (nextIndex) => {
    setAuto(false);
    setIndex(nextIndex);
    emitTelemetry('click', { templateId: TEMPLATE_ID, target: `condition-${CONDITIONS[nextIndex].id}` });
  };

  if (dismissed) return null;
  const Icon = condition.icon;
  const showParticles = !reducedMotion && (condition.id === 'rain' || condition.id === 'snow');

  return (
    <section
      ref={viewabilityRef}
      className="relative mx-auto w-full max-w-md overflow-hidden rounded-2xl border border-white/10 shadow-2xl"
      aria-label="Weather-reactive sponsored unit"
    >
      <style>{'@keyframes weather-fall { from { transform: translateY(-12%); } to { transform: translateY(112%); } }'}</style>
      <MorphContainer className={`relative bg-gradient-to-br p-5 ${condition.scene}`} duration={600}>
        {showParticles && (
          <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
            {particles.map((p, i) => (
              <span
                key={i}
                className={condition.id === 'snow' ? 'absolute h-2 w-2 rounded-full bg-white/80' : 'absolute h-4 w-0.5 rounded bg-white/50'}
                style={{ left: p.left, top: '-10%', animation: `weather-fall ${p.duration} linear ${p.delay} infinite` }}
              />
            ))}
          </div>
        )}
        <div className="relative flex items-start justify-between gap-3">
          <div className="flex items-center gap-2 rounded-full bg-black/25 px-3 py-1.5 text-xs font-bold text-white backdrop-blur">
            <Icon size={16} /> {condition.label} · simulated feed
          </div>
          <button
            type="button"
            onClick={() => dismiss('button')}
            className="flex min-h-11 min-w-11 items-center justify-center rounded-full bg-black/25 text-white backdrop-blur hover:bg-black/45"
            aria-label="Close ad"
          >
            ✕
          </button>
        </div>
        <h2 className="relative mt-6 text-3xl font-black leading-tight text-white drop-shadow">{condition.headline}</h2>
        <p className="relative mt-2 max-w-sm text-sm leading-relaxed text-white/90">{condition.body}</p>
        <div className="relative mt-5 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-black/25 p-3 backdrop-blur">
          <p className="text-sm font-bold text-white">{condition.product}</p>
          <button
            type="button"
            onClick={() => {
              emitTelemetry('click', { templateId: TEMPLATE_ID, target: 'cta', condition: condition.id });
              emitTelemetry('complete', { templateId: TEMPLATE_ID, action: 'cta-clicked', condition: condition.id });
            }}
            className="min-h-11 rounded-full bg-white px-5 text-sm font-bold text-slate-950 hover:bg-slate-200"
          >
            {condition.cta}
          </button>
        </div>
      </MorphContainer>
      <div className="flex items-center gap-1.5 border-t border-white/10 bg-slate-950 p-2" role="tablist" aria-label="Simulate weather condition">
        {CONDITIONS.map((item, i) => (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={i === index}
            onClick={() => selectCondition(i)}
            className={`flex min-h-11 flex-1 items-center justify-center gap-1.5 rounded-lg text-xs font-semibold transition-colors ${
              i === index ? 'bg-white/15 text-white' : 'text-slate-400 hover:bg-white/5'
            }`}
          >
            <item.icon size={15} /> {item.id}
          </button>
        ))}
      </div>
    </section>
  );
}

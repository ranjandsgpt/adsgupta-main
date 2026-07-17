import React, { useEffect, useRef, useState } from 'react';
import { Footprints, Pause, Play } from 'lucide-react';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { emitTelemetry } from '../telemetry';
import { Batch05Shell, buttonClass, trackClick } from './Batch05Shell';

const ID = 'activity-ring-widget-ad';

export default function Template67ActivityRingWidgetAd() {
  const [active, setActive] = useState(false);
  const [progress, setProgress] = useState(36);
  const completed = useRef(false);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    if (!active || reducedMotion) return undefined;
    const timer = window.setInterval(() => setProgress((value) => Math.min(100, value + 2)), 250);
    return () => window.clearInterval(timer);
  }, [active, reducedMotion]);

  useEffect(() => {
    if (progress < 100 || completed.current) return;
    completed.current = true;
    setActive(false);
    emitTelemetry('complete', { templateId: ID });
  }, [progress]);

  const circumference = 2 * Math.PI * 48;
  const toggle = () => {
    if (reducedMotion) {
      setProgress(100);
      setActive(false);
    } else {
      setActive((value) => !value);
    }
    trackClick(ID, active ? 'pause' : 'start');
  };
  return (
    <Batch05Shell templateId={ID} title="Activity Ring Widget Ad" className="mx-auto max-w-sm" onClosed={() => setActive(false)}>
      <div className="bg-slate-950 p-6 text-center text-white">
        <div className="relative mx-auto h-36 w-36"><svg viewBox="0 0 120 120" className="-rotate-90" role="img" aria-label={`${progress}% activity goal`}><circle cx="60" cy="60" r="48" fill="none" stroke="rgba(255,255,255,.1)" strokeWidth="12" /><circle cx="60" cy="60" r="48" fill="none" stroke="#a3e635" strokeWidth="12" strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={circumference * (1 - progress / 100)} /></svg><div className="absolute inset-0 flex flex-col items-center justify-center"><Footprints className="text-lime-300" /><strong className="text-2xl">{progress}%</strong></div></div>
        <h3 className="mt-3 text-2xl font-black">Close your discovery ring.</h3><p className="mt-1 text-sm text-white/60">Start the demo to simulate an active session.</p>
        <button type="button" disabled={progress === 100} className={`${buttonClass} mt-5 inline-flex items-center justify-center gap-2 bg-lime-300 text-slate-950`} onClick={toggle}>{active ? <Pause size={18} /> : <Play size={18} />} {active ? 'Pause' : progress === 100 ? 'Goal complete' : 'Start activity'}</button>
      </div>
    </Batch05Shell>
  );
}

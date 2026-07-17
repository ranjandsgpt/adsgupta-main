import React, { useEffect, useRef, useState } from 'react';
import { Sparkles } from 'lucide-react';
import BatchTemplateFrame, { track } from './BatchTemplateFrame';

const ID = 'ai-personalized-copy';
const MODES = {
  Focus: ['Protect your deep-work hours.', 'Quiet technology for your clearest thinking.'],
  Travel: ['Pack light. Go further.', 'A world-ready companion for every connection.'],
  Fitness: ['Move stronger, recover smarter.', 'Built to keep pace with your next goal.'],
};

export default function Template11AIPersonalizedCopyAd() {
  const [mode, setMode] = useState('Focus');
  const [copy, setCopy] = useState(MODES.Focus[0]);
  const [generating, setGenerating] = useState(false);
  const timer = useRef(null);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const generate = (nextMode, reducedMotion) => {
    setMode(nextMode);
    setGenerating(true);
    track(ID, 'click', { target: 'persona', persona: nextMode });
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => {
      const options = MODES[nextMode];
      setCopy(options[Math.floor(Math.random() * options.length)]);
      setGenerating(false);
      track(ID, 'complete', { simulation: 'copy-generated', persona: nextMode });
    }, reducedMotion ? 0 : 650);
  };

  return (
    <BatchTemplateFrame templateId={ID} title="AI Personalized Copy Ad" subtitle="On-device mock generation · no data leaves this demo">
      {({ reducedMotion }) => (
        <>
          <div className="flex min-h-56 flex-col justify-between rounded-2xl bg-gradient-to-br from-indigo-700 via-violet-700 to-fuchsia-600 p-6">
            <Sparkles className="text-amber-300" size={36} />
            <div>
              <p className="text-xs font-black uppercase tracking-widest text-white/70">Generated for {mode}</p>
              <h3 className={`mt-2 text-3xl font-black ${generating && !reducedMotion ? 'animate-pulse' : ''}`}>{generating ? 'Writing your message…' : copy}</h3>
            </div>
          </div>
          <fieldset className="mt-4">
            <legend className="mb-2 text-sm font-bold">Personalize for</legend>
            <div className="grid grid-cols-3 gap-2">
              {Object.keys(MODES).map((item) => (
                <button key={item} type="button" onClick={() => generate(item, reducedMotion)} aria-pressed={mode === item} className={`min-h-11 rounded-xl font-bold ${mode === item ? 'bg-cyan-400 text-slate-950' : 'bg-white/10'}`}>{item}</button>
              ))}
            </div>
          </fieldset>
        </>
      )}
    </BatchTemplateFrame>
  );
}

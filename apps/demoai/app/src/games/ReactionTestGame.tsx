import { useEffect, useRef, useState } from 'react';
import type { GameProps } from './types';

type Phase = 'wait' | 'ready' | 'go';

export function ReactionTestGame({ onScore }: GameProps) {
  const [phase, setPhase] = useState<Phase>('wait');
  const [label, setLabel] = useState('Wait for green…');
  const timerRef = useRef<number>();
  const startRef = useRef(0);
  const onScoreRef = useRef(onScore);

  useEffect(() => {
    onScoreRef.current = onScore;
  }, [onScore]);

  useEffect(() => {
    onScoreRef.current('Click to start');
    return () => window.clearTimeout(timerRef.current);
  }, []);

  const click = () => {
    if (phase === 'wait') {
      setPhase('ready');
      setLabel('Wait…');
      timerRef.current = window.setTimeout(() => {
        startRef.current = performance.now();
        setPhase('go');
        setLabel('CLICK!');
      }, 1000 + Math.random() * 2500);
      return;
    }

    if (phase === 'ready') {
      window.clearTimeout(timerRef.current);
      setPhase('wait');
      setLabel('Too soon! Click to retry');
      return;
    }

    const milliseconds = Math.round(performance.now() - startRef.current);
    onScoreRef.current(`${milliseconds} ms`);
    setPhase('wait');
    setLabel('Again? Click to start');
  };

  const color = phase === 'ready' ? '#EF9F27' : phase === 'go' ? '#97C459' : '#E24B4A';

  return (
    <button
      type="button"
      onClick={click}
      className="h-[200px] w-[280px] max-w-full rounded-xl px-5 text-[18px] font-medium text-white transition-colors"
      style={{ backgroundColor: color }}
    >
      {label}
    </button>
  );
}

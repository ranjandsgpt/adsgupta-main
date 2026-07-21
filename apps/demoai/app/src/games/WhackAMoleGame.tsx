import { useEffect, useRef, useState } from 'react';
import { IconMoodSmile } from '@tabler/icons-react';
import type { GameProps } from './types';

export function WhackAMoleGame({ onScore }: GameProps) {
  const [activeHole, setActiveHole] = useState(-1);
  const [finished, setFinished] = useState(false);
  const scoreRef = useRef(0);
  const timeRef = useRef(20);
  const onScoreRef = useRef(onScore);

  useEffect(() => {
    onScoreRef.current = onScore;
  }, [onScore]);

  useEffect(() => {
    onScoreRef.current('Score 0 · 20s');

    const popTimer = window.setInterval(() => {
      setActiveHole(Math.floor(Math.random() * 9));
    }, 800);

    const clockTimer = window.setInterval(() => {
      timeRef.current -= 1;

      if (timeRef.current <= 0) {
        window.clearInterval(popTimer);
        window.clearInterval(clockTimer);
        setActiveHole(-1);
        setFinished(true);
        onScoreRef.current(`Final: ${scoreRef.current}`);
        return;
      }

      onScoreRef.current(`Score ${scoreRef.current} · ${timeRef.current}s`);
    }, 1000);

    return () => {
      window.clearInterval(popTimer);
      window.clearInterval(clockTimer);
    };
  }, []);

  const hit = (index: number) => {
    if (finished || index !== activeHole) return;

    scoreRef.current += 1;
    setActiveHole(-1);
    onScoreRef.current(`Score ${scoreRef.current} · ${timeRef.current}s`);
  };

  return (
    <div className="grid grid-cols-3 gap-2.5" aria-label="Whack-a-Mole board">
      {Array.from({ length: 9 }, (_, index) => {
        const active = index === activeHole;

        return (
          <button
            key={index}
            type="button"
            disabled={finished}
            onClick={() => hit(index)}
            aria-label={active ? `Hit mole in hole ${index + 1}` : `Empty hole ${index + 1}`}
            className="flex h-20 w-20 items-center justify-center rounded-full text-[30px] transition-colors disabled:cursor-default"
            style={{ backgroundColor: active ? '#EF9F27' : '#5F5E5A' }}
          >
            <IconMoodSmile
              size={30}
              stroke={1.75}
              style={{ color: active ? '#412402' : 'transparent' }}
              aria-hidden="true"
            />
          </button>
        );
      })}
    </div>
  );
}

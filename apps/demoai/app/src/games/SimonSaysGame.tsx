import { useEffect, useRef, useState } from 'react';
import type { GameProps } from './types';

const COLORS = ['#E24B4A', '#97C459', '#378ADD', '#EF9F27'];
const RESTING_OPACITY = 0.55;
const FLASH_MS = 300;
const REPLAY_MS = 600;

export function SimonSaysGame({ onScore }: GameProps) {
  const [active, setActive] = useState(-1);
  const [playing, setPlaying] = useState(true);
  const sequenceRef = useRef<number[]>([]);
  const playerPosRef = useRef(0);
  const timersRef = useRef<number[]>([]);
  const onScoreRef = useRef(onScore);

  useEffect(() => {
    onScoreRef.current = onScore;
  }, [onScore]);

  const clearTimers = () => {
    timersRef.current.forEach((id) => {
      window.clearTimeout(id);
      window.clearInterval(id);
    });
    timersRef.current = [];
  };

  const flash = (index: number) => {
    setActive(index);
    const id = window.setTimeout(() => setActive(-1), FLASH_MS);
    timersRef.current.push(id);
  };

  const nextRound = () => {
    playerPosRef.current = 0;
    sequenceRef.current = [...sequenceRef.current, Math.floor(Math.random() * 4)];
    setPlaying(true);
    onScoreRef.current('Watch');

    let step = 0;
    const interval = window.setInterval(() => {
      flash(sequenceRef.current[step]);
      step += 1;
      if (step >= sequenceRef.current.length) {
        window.clearInterval(interval);
        setPlaying(false);
        onScoreRef.current('Your turn');
      }
    }, REPLAY_MS);
    timersRef.current.push(interval);
  };

  useEffect(() => {
    onScoreRef.current('Watch');
    const start = window.setTimeout(nextRound, 500);
    timersRef.current.push(start);
    return clearTimers;
  }, []);

  const press = (index: number) => {
    if (playing) return;

    flash(index);

    if (sequenceRef.current[playerPosRef.current] === index) {
      playerPosRef.current += 1;
      if (playerPosRef.current === sequenceRef.current.length) {
        onScoreRef.current(`Round ${sequenceRef.current.length} ✓`);
        const id = window.setTimeout(nextRound, 600);
        timersRef.current.push(id);
      }
      return;
    }

    onScoreRef.current('Wrong! Restarting');
    sequenceRef.current = [];
    const id = window.setTimeout(nextRound, 900);
    timersRef.current.push(id);
  };

  return (
    <div className="grid grid-cols-2 gap-2" aria-label="Simon Says pads">
      {COLORS.map((color, index) => (
        <button
          key={color}
          type="button"
          onClick={() => press(index)}
          disabled={playing}
          aria-label={`Simon pad ${index + 1}`}
          className="h-[90px] w-[90px] rounded-xl transition-opacity disabled:cursor-default"
          style={{ backgroundColor: color, opacity: active === index ? 1 : RESTING_OPACITY }}
        />
      ))}
    </div>
  );
}

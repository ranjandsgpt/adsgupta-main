import { useEffect, useRef, useState } from 'react';
import type { GameProps } from './types';

type Direction = 'l' | 'r' | 'u' | 'd';

const COLORS: Record<number, string> = {
  0: '#D3D1C7',
  2: '#EEEDFE',
  4: '#CECBF6',
  8: '#AFA9EC',
  16: '#7F77DD',
  32: '#5DCAA5',
  64: '#1D9E75',
  128: '#EF9F27',
  256: '#D85A30',
  512: '#E24B4A',
  1024: '#D4537E',
  2048: '#534AB7',
};

const FALLBACK_COLOR = '#26215C';

function spawn(board: number[]): number[] {
  const empty = board.flatMap((value, index) => (value === 0 ? [index] : []));
  if (!empty.length) return board;
  const next = [...board];
  next[empty[Math.floor(Math.random() * empty.length)]] = Math.random() < 0.9 ? 2 : 4;
  return next;
}

function initialBoard(): number[] {
  return spawn(spawn(Array(16).fill(0)));
}

function slide(line: number[]): { line: number[]; gained: number } {
  const values = line.filter(Boolean);
  const merged: number[] = [];
  let gained = 0;

  for (let i = 0; i < values.length; i += 1) {
    if (values[i] === values[i + 1]) {
      const value = values[i] * 2;
      merged.push(value);
      gained += value;
      i += 1;
    } else {
      merged.push(values[i]);
    }
  }

  return { line: [...merged, ...Array(4 - merged.length).fill(0)], gained };
}

export function Game2048({ onScore }: GameProps) {
  const [board, setBoard] = useState(initialBoard);
  const [score, setScore] = useState(0);
  const boardRef = useRef<HTMLDivElement>(null);
  const onScoreRef = useRef(onScore);
  const touchRef = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    onScoreRef.current = onScore;
  }, [onScore]);

  useEffect(() => {
    onScoreRef.current('Score 0');
    boardRef.current?.focus();
  }, []);

  const move = (direction: Direction) => {
    const next = Array(16).fill(0);
    let gained = 0;

    for (let group = 0; group < 4; group += 1) {
      const vertical = direction === 'u' || direction === 'd';
      let line = Array.from({ length: 4 }, (_, offset) =>
        board[vertical ? offset * 4 + group : group * 4 + offset],
      );
      const reversed = direction === 'r' || direction === 'd';
      if (reversed) line = [...line].reverse();

      const result = slide(line);
      gained += result.gained;

      const output = reversed ? [...result.line].reverse() : result.line;
      output.forEach((value, offset) => {
        next[vertical ? offset * 4 + group : group * 4 + offset] = value;
      });
    }

    if (next.every((value, index) => value === board[index])) return;

    const nextScore = score + gained;
    setBoard(spawn(next));
    setScore(nextScore);
    onScoreRef.current(`Score ${nextScore}`);
  };

  const keyMap: Record<string, Direction> = {
    ArrowLeft: 'l',
    ArrowRight: 'r',
    ArrowUp: 'u',
    ArrowDown: 'd',
  };

  return (
    <div
      ref={boardRef}
      role="application"
      aria-label="2048 board"
      tabIndex={0}
      onKeyDown={(event) => {
        const direction = keyMap[event.key];
        if (!direction) return;
        event.preventDefault();
        move(direction);
      }}
      onTouchStart={(event) => {
        touchRef.current = { x: event.touches[0].clientX, y: event.touches[0].clientY };
      }}
      onTouchEnd={(event) => {
        const start = touchRef.current;
        if (!start) return;
        const touch = event.changedTouches[0];
        const dx = touch.clientX - start.x;
        const dy = touch.clientY - start.y;
        touchRef.current = null;
        if (Math.max(Math.abs(dx), Math.abs(dy)) < 20) return;
        move(Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'r' : 'l') : dy > 0 ? 'd' : 'u');
      }}
      className="grid grid-cols-4 gap-1.5 rounded-lg bg-[#B4B2A9] p-1.5 outline-none focus-visible:ring-2 focus-visible:ring-[#378ADD]"
      style={{ touchAction: 'none' }}
    >
      {board.map((value, index) => (
        <div
          key={index}
          className={`flex h-16 w-16 items-center justify-center rounded-md font-bold ${
            value > 99 ? 'text-lg' : 'text-[22px]'
          }`}
          style={{
            backgroundColor: COLORS[value] ?? FALLBACK_COLOR,
            color: value > 4 ? '#FFFFFF' : '#26215C',
          }}
        >
          {value || ''}
        </div>
      ))}
    </div>
  );
}

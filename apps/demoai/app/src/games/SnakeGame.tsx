import { useEffect, useRef } from 'react';
import type { GameProps } from './types';

type Cell = { x: number; y: number };

const GRID = 15;
const CELL = 20;
const SIZE = GRID * CELL; // 300
const TICK_MS = 110;

const DIRS: Record<string, Cell> = {
  ArrowUp: { x: 0, y: -1 },
  ArrowDown: { x: 0, y: 1 },
  ArrowLeft: { x: -1, y: 0 },
  ArrowRight: { x: 1, y: 0 },
};

function isPerpendicular(current: Cell, next: Cell) {
  return current.x * next.x + current.y * next.y === 0;
}

function spawnFood(snake: Cell[]): Cell {
  const free: Cell[] = [];
  for (let y = 0; y < GRID; y += 1) {
    for (let x = 0; x < GRID; x += 1) {
      if (!snake.some((cell) => cell.x === x && cell.y === y)) free.push({ x, y });
    }
  }
  return free[Math.floor(Math.random() * free.length)] ?? { x: 0, y: 0 };
}

export function SnakeGame({ onScore }: GameProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const onScoreRef = useRef(onScore);
  const touchAnchorRef = useRef<Cell | null>(null);
  const stateRef = useRef({
    snake: [{ x: 7, y: 7 }] as Cell[],
    dir: { x: 1, y: 0 } as Cell,
    nextDir: { x: 1, y: 0 } as Cell,
    food: { x: 11, y: 7 } as Cell,
    score: 0,
    dead: false,
  });

  useEffect(() => {
    onScoreRef.current = onScore;
  }, [onScore]);

  useEffect(() => {
    onScoreRef.current('Score 0');
    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    const ctx = canvas.getContext('2d');
    if (!ctx) return undefined;

    const queueTurn = (candidate: Cell) => {
      const { dir } = stateRef.current;
      if (isPerpendicular(dir, candidate)) stateRef.current.nextDir = candidate;
    };

    const draw = () => {
      const { snake, food, dead } = stateRef.current;
      ctx.fillStyle = '#111111';
      ctx.fillRect(0, 0, SIZE, SIZE);

      ctx.fillStyle = '#97C459';
      snake.forEach(({ x, y }) => {
        ctx.fillRect(x * CELL + 1, y * CELL + 1, 18, 18);
      });

      ctx.fillStyle = '#E24B4A';
      ctx.fillRect(food.x * CELL + 1, food.y * CELL + 1, 18, 18);

      if (dead) {
        ctx.fillStyle = '#FFFFFF';
        ctx.font = '20px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('Game over', SIZE / 2, SIZE / 2);
      }
    };

    const onKeyDown = (event: KeyboardEvent) => {
      const next = DIRS[event.key];
      if (!next) return;
      event.preventDefault();
      queueTurn(next);
    };

    window.addEventListener('keydown', onKeyDown);
    draw();

    const timer = window.setInterval(() => {
      const state = stateRef.current;
      if (state.dead) return;

      state.dir = state.nextDir;
      const head = state.snake[0];
      const newHead = {
        x: (head.x + state.dir.x + GRID) % GRID,
        y: (head.y + state.dir.y + GRID) % GRID,
      };

      if (state.snake.some((cell) => cell.x === newHead.x && cell.y === newHead.y)) {
        state.dead = true;
        draw();
        return;
      }

      state.snake.unshift(newHead);
      if (newHead.x === state.food.x && newHead.y === state.food.y) {
        state.score += 1;
        onScoreRef.current(`Score ${state.score}`);
        state.food = spawnFood(state.snake);
      } else {
        state.snake.pop();
      }
      draw();
    }, TICK_MS);

    return () => {
      window.clearInterval(timer);
      window.removeEventListener('keydown', onKeyDown);
    };
  }, []);

  const onTouchStart = (event: React.TouchEvent<HTMLCanvasElement>) => {
    const touch = event.touches[0];
    touchAnchorRef.current = { x: touch.clientX, y: touch.clientY };
  };

  const onTouchMove = (event: React.TouchEvent<HTMLCanvasElement>) => {
    event.preventDefault();
    const touch = event.touches[0];
    const anchor = touchAnchorRef.current;
    if (!anchor) {
      touchAnchorRef.current = { x: touch.clientX, y: touch.clientY };
      return;
    }

    const dx = touch.clientX - anchor.x;
    const dy = touch.clientY - anchor.y;
    if (Math.abs(dx) + Math.abs(dy) < 20) return;

    const candidate: Cell = Math.abs(dx) > Math.abs(dy)
      ? { x: Math.sign(dx), y: 0 }
      : { x: 0, y: Math.sign(dy) };

    const { dir } = stateRef.current;
    if (isPerpendicular(dir, candidate)) stateRef.current.nextDir = candidate;
    touchAnchorRef.current = { x: touch.clientX, y: touch.clientY };
  };

  return (
    <canvas
      ref={canvasRef}
      width={SIZE}
      height={SIZE}
      aria-label="Snake game board"
      className="arcade-canvas max-w-[300px] bg-[#111111]"
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
    />
  );
}

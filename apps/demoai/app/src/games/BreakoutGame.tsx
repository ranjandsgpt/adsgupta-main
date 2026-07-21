import { useEffect, useRef } from 'react';
import type { GameProps } from './types';

const WIDTH = 320;
const HEIGHT = 260;
const PW = 60;
const PADDLE_Y = HEIGHT - 10;
const PADDLE_H = 6;
const BALL_R = 5;
const TICK_MS = 18;
const ROW_COLORS = ['#E24B4A', '#EF9F27', '#97C459', '#378ADD'];

type Brick = { r: number; c: number; alive: boolean };

function makeBricks(): Brick[] {
  const bricks: Brick[] = [];
  for (let r = 0; r < 4; r += 1) {
    for (let c = 0; c < 8; c += 1) {
      bricks.push({ r, c, alive: true });
    }
  }
  return bricks;
}

export function BreakoutGame({ onScore }: GameProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const onScoreRef = useRef(onScore);
  const paddleRef = useRef(130);
  const stateRef = useRef({
    bricks: makeBricks(),
    bx: 160,
    by: 180,
    vx: 2.5,
    vy: -2.5,
    score: 0,
    message: '',
    running: true,
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

    const render = () => {
      const s = stateRef.current;
      ctx.fillStyle = '#111111';
      ctx.fillRect(0, 0, WIDTH, HEIGHT);

      s.bricks.forEach((brick) => {
        if (!brick.alive) return;
        ctx.fillStyle = ROW_COLORS[brick.r];
        ctx.fillRect(brick.c * 40 + 1, brick.r * 16 + 21, 38, 14);
      });

      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(paddleRef.current, PADDLE_Y, PW, PADDLE_H);

      ctx.beginPath();
      ctx.arc(s.bx, s.by, BALL_R, 0, Math.PI * 2);
      ctx.fill();

      if (s.message) {
        ctx.fillStyle = '#FFFFFF';
        ctx.font = '18px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(s.message, WIDTH / 2, HEIGHT / 2);
      }
    };

    render();

    const timer = window.setInterval(() => {
      const s = stateRef.current;
      if (!s.running) return;

      s.bx += s.vx;
      s.by += s.vy;

      if (s.bx < 5 || s.bx > WIDTH - 5) s.vx = -s.vx;
      if (s.by < 5) s.vy = -s.vy;

      if (s.by > HEIGHT - 15 && s.bx >= paddleRef.current && s.bx <= paddleRef.current + PW) {
        s.vy = -Math.abs(s.vy);
      }

      if (s.by > HEIGHT) {
        s.message = 'Game over';
        s.running = false;
        window.clearInterval(timer);
        render();
        return;
      }

      for (const brick of s.bricks) {
        if (!brick.alive) continue;
        const bx0 = brick.c * 40;
        const by0 = brick.r * 16 + 20;
        const bx1 = bx0 + 40;
        const by1 = by0 + 16;
        if (s.bx >= bx0 && s.bx <= bx1 && s.by >= by0 && s.by <= by1) {
          brick.alive = false;
          s.vy = -s.vy;
          s.score += 10;
          onScoreRef.current(`Score ${s.score}`);
          break;
        }
      }

      if (s.bricks.every((brick) => !brick.alive)) {
        s.message = 'You win!';
        s.running = false;
        window.clearInterval(timer);
      }

      render();
    }, TICK_MS);

    return () => window.clearInterval(timer);
  }, []);

  const movePaddle = (clientX: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = WIDTH / rect.width;
    const x = (clientX - rect.left) * scaleX;
    paddleRef.current = Math.max(0, Math.min(WIDTH - PW, x - PW / 2));
  };

  return (
    <canvas
      ref={canvasRef}
      width={WIDTH}
      height={HEIGHT}
      aria-label="Breakout game board"
      className="arcade-canvas max-w-[320px] bg-[#111111]"
      onMouseMove={(event) => movePaddle(event.clientX)}
      onTouchStart={(event) => {
        event.preventDefault();
        movePaddle(event.touches[0].clientX);
      }}
      onTouchMove={(event) => {
        event.preventDefault();
        movePaddle(event.touches[0].clientX);
      }}
    />
  );
}

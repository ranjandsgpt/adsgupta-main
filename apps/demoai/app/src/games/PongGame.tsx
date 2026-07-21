import { useEffect, useRef } from 'react';
import type { GameProps } from './types';

const WIDTH = 320;
const HEIGHT = 240;
const PH = 48;
const PW = 8;
const TICK_MS = 20;

export function PongGame({ onScore }: GameProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const onScoreRef = useRef(onScore);
  const stateRef = useRef({
    playerY: 100,
    aiY: 100,
    bx: 160,
    by: 120,
    vx: 3,
    vy: 2,
    playerScore: 0,
    aiScore: 0,
  });

  useEffect(() => {
    onScoreRef.current = onScore;
  }, [onScore]);

  useEffect(() => {
    onScoreRef.current('0 : 0');
    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    const ctx = canvas.getContext('2d');
    if (!ctx) return undefined;

    const render = () => {
      const s = stateRef.current;
      ctx.fillStyle = '#111111';
      ctx.fillRect(0, 0, WIDTH, HEIGHT);

      ctx.fillStyle = '#378ADD';
      ctx.fillRect(5, s.playerY, PW, PH);

      ctx.fillStyle = '#E24B4A';
      ctx.fillRect(WIDTH - 13, s.aiY, PW, PH);

      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.arc(s.bx, s.by, 5, 0, Math.PI * 2);
      ctx.fill();
    };

    render();

    const timer = window.setInterval(() => {
      const s = stateRef.current;
      s.bx += s.vx;
      s.by += s.vy;

      if (s.by < 5 || s.by > 235) s.vy = -s.vy;

      s.aiY += (s.by - (s.aiY + PH / 2)) * 0.08;
      s.aiY = Math.max(0, Math.min(HEIGHT - PH, s.aiY));

      if (s.bx < 15 && s.by >= s.playerY && s.by <= s.playerY + PH) {
        s.vx = Math.abs(s.vx);
      }
      if (s.bx > WIDTH - 15 && s.by >= s.aiY && s.by <= s.aiY + PH) {
        s.vx = -Math.abs(s.vx);
      }

      if (s.bx < 0) {
        s.aiScore += 1;
        s.bx = 160;
        s.by = 120;
        s.vx = 3;
        s.vy = 2;
      } else if (s.bx > WIDTH) {
        s.playerScore += 1;
        s.bx = 160;
        s.by = 120;
        s.vx = -3;
        s.vy = 2;
      }

      onScoreRef.current(`${s.playerScore} : ${s.aiScore}`);
      render();
    }, TICK_MS);

    return () => window.clearInterval(timer);
  }, []);

  const movePaddle = (clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleY = HEIGHT / rect.height;
    const y = (clientY - rect.top) * scaleY;
    stateRef.current.playerY = Math.max(0, Math.min(HEIGHT - PH, y - PH / 2));
  };

  return (
    <canvas
      ref={canvasRef}
      width={WIDTH}
      height={HEIGHT}
      aria-label="Pong versus AI"
      className="arcade-canvas max-w-[320px] bg-[#111111]"
      onMouseMove={(event) => movePaddle(event.clientY)}
      onTouchStart={(event) => {
        event.preventDefault();
        movePaddle(event.touches[0].clientY);
      }}
      onTouchMove={(event) => {
        event.preventDefault();
        movePaddle(event.touches[0].clientY);
      }}
    />
  );
}

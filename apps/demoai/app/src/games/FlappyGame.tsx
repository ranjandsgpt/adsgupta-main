import { useEffect, useRef } from 'react';
import type { GameProps } from './types';

const WIDTH = 300;
const HEIGHT = 300;
const TICK_MS = 18;
const BIRD_X = 45;
const PIPE_W = 50;
const GAP_H = 90;

type Pipe = { x: number; gap: number };

function freshState() {
  return {
    birdY: 150,
    velocity: 0,
    score: 0,
    dead: false,
    pipes: [{ x: 300, gap: 120 }] as Pipe[],
  };
}

export function FlappyGame({ onScore }: GameProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const onScoreRef = useRef(onScore);
  const stateRef = useRef(freshState());

  useEffect(() => {
    onScoreRef.current = onScore;
  }, [onScore]);

  const resetOrFlap = () => {
    const state = stateRef.current;
    if (state.dead) {
      stateRef.current = freshState();
      onScoreRef.current('Score 0');
    } else {
      state.velocity = -5;
    }
  };

  useEffect(() => {
    onScoreRef.current('Score 0');
    stateRef.current = freshState();

    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    const ctx = canvas.getContext('2d');
    if (!ctx) return undefined;

    const render = () => {
      const state = stateRef.current;
      ctx.fillStyle = '#9FE1CB';
      ctx.fillRect(0, 0, WIDTH, HEIGHT);

      ctx.fillStyle = '#0F6E56';
      state.pipes.forEach((pipe) => {
        ctx.fillRect(pipe.x, 0, PIPE_W, pipe.gap);
        ctx.fillRect(pipe.x, pipe.gap + GAP_H, PIPE_W, HEIGHT);
      });

      ctx.fillStyle = '#EF9F27';
      ctx.beginPath();
      ctx.arc(BIRD_X, state.birdY, 10, 0, Math.PI * 2);
      ctx.fill();

      if (state.dead) {
        ctx.fillStyle = '#FFFFFF';
        ctx.font = '16px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('Tap to restart', WIDTH / 2, HEIGHT / 2 + 5);
      }
    };

    const onKey = (event: KeyboardEvent) => {
      if (event.code !== 'Space') return;
      event.preventDefault();
      resetOrFlap();
    };

    window.addEventListener('keydown', onKey);
    render();

    const timer = window.setInterval(() => {
      const state = stateRef.current;
      if (!state.dead) {
        state.velocity += 0.4;
        state.birdY += state.velocity;

        state.pipes.forEach((pipe) => {
          pipe.x -= 2;
        });

        const lastPipe = state.pipes[state.pipes.length - 1];
        if (lastPipe && lastPipe.x < 160) {
          state.pipes.push({ x: 300, gap: 60 + Math.random() * 140 });
        }

        if (state.pipes[0]?.x < -50) {
          state.pipes.shift();
          state.score += 1;
          onScoreRef.current(`Score ${state.score}`);
        }

        const pipeHit = state.pipes.some(
          (pipe) => pipe.x > 10 && pipe.x < 70 && (state.birdY < pipe.gap || state.birdY > pipe.gap + GAP_H),
        );

        if (state.birdY > HEIGHT || state.birdY < 0 || pipeHit) {
          state.dead = true;
        }
      }

      render();
    }, TICK_MS);

    return () => {
      window.clearInterval(timer);
      window.removeEventListener('keydown', onKey);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      width={WIDTH}
      height={HEIGHT}
      aria-label="Flappy Bird game"
      className="arcade-canvas max-w-[300px] cursor-pointer bg-[#9FE1CB]"
      onMouseDown={resetOrFlap}
      onTouchStart={(event) => {
        event.preventDefault();
        resetOrFlap();
      }}
    />
  );
}

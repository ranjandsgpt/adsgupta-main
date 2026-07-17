import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Pause, Play } from 'lucide-react';
import BatchTemplateFrame, { track } from './BatchTemplateFrame';

const ID = 'playable-endless-runner';

function Runner({ reducedMotion }) {
  const canvasRef = useRef(null);
  const frameRef = useRef(null);
  const game = useRef({ y: 150, velocity: 0, obstacle: 420, score: 0, over: false });
  const [running, setRunning] = useState(!reducedMotion);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const completed = useRef(false);

  const restart = useCallback(() => {
    game.current = { y: 150, velocity: 0, obstacle: 420, score: 0, over: false };
    setScore(0);
    setGameOver(false);
    setRunning(true);
    track(ID, 'click', { target: 'restart' });
  }, []);

  const jump = useCallback(() => {
    if (game.current.over) {
      restart();
      return;
    }
    game.current.velocity = -8;
    setRunning(true);
    track(ID, 'click', { target: 'jump' });
  }, [restart]);

  const onKeyDown = (event) => {
    if (event.code === 'Space' || event.key === 'ArrowUp' || event.key === 'Enter') {
      event.preventDefault();
      jump();
    }
  };

  useEffect(() => {
    const context = canvasRef.current?.getContext('2d');
    if (!context) return undefined;
    const draw = () => {
      const state = game.current;
      if (running && !state.over) {
        state.velocity += 0.5;
        state.y = Math.min(150, state.y + state.velocity);
        state.obstacle -= 4;
        if (state.obstacle < -30) {
          state.obstacle = 420;
          state.score += 1;
          setScore(state.score);
          if (state.score === 3 && !completed.current) {
            completed.current = true;
            track(ID, 'complete', { score: state.score });
          }
        }
        const hit = state.obstacle < 48 + 28 && state.obstacle + 24 > 48 && state.y + 28 > 142;
        if (hit) {
          state.over = true;
          setGameOver(true);
          setRunning(false);
          track(ID, 'click', { target: 'game-over', score: state.score });
        }
      }
      context.clearRect(0, 0, 420, 200);
      context.fillStyle = '#0f172a';
      context.fillRect(0, 0, 420, 200);
      context.fillStyle = '#22d3ee';
      context.fillRect(0, 178, 420, 4);
      context.fillStyle = '#facc15';
      context.fillRect(48, state.y, 28, 28);
      context.fillStyle = '#f43f5e';
      context.fillRect(state.obstacle, 142, 24, 38);
      if (state.over) {
        context.fillStyle = 'rgba(15, 23, 42, 0.7)';
        context.fillRect(0, 0, 420, 200);
        context.fillStyle = '#ffffff';
        context.font = 'bold 26px system-ui, sans-serif';
        context.textAlign = 'center';
        context.fillText('Game over', 210, 92);
        context.font = 'bold 14px system-ui, sans-serif';
        context.fillStyle = '#22d3ee';
        context.fillText(`Score ${state.score} · tap Restart to try again`, 210, 118);
      }
      frameRef.current = window.requestAnimationFrame(draw);
    };
    draw();
    return () => window.cancelAnimationFrame(frameRef.current);
  }, [running]);

  return (
    <>
      <canvas
        ref={canvasRef}
        width="420"
        height="200"
        role="application"
        tabIndex={0}
        className="w-full cursor-pointer rounded-2xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan-300"
        onPointerDown={jump}
        onKeyDown={onKeyDown}
        aria-label={gameOver ? `Game over. Final score ${score}. Press Enter to restart.` : `Endless runner game. Score ${score}. Press Space or Arrow Up to jump.`}
      />
      <div className="mt-4 flex gap-3">
        <button type="button" onClick={jump} className="min-h-12 flex-1 rounded-xl bg-cyan-400 px-5 font-black text-slate-950">
          {gameOver ? 'Restart' : 'Jump'}
        </button>
        <button
          type="button"
          onClick={() => (gameOver ? restart() : setRunning((value) => !value))}
          className="flex min-h-12 min-w-12 items-center justify-center rounded-xl bg-white/10"
          aria-label={gameOver ? 'Restart game' : running ? 'Pause game' : 'Play game'}
        >
          {running ? <Pause /> : <Play />}
        </button>
      </div>
      <p className="mt-3 text-center text-sm font-bold" aria-live="polite">
        {gameOver ? `Game over · Final score ${score}` : `Score: ${score} · Clear 3 gates to complete`}
      </p>
    </>
  );
}

export default function Template05PlayableEndlessRunner() {
  return (
    <BatchTemplateFrame templateId={ID} title="Playable Endless Runner" subtitle="Space, Arrow Up, or tap to jump">
      {({ reducedMotion }) => <Runner reducedMotion={reducedMotion} />}
    </BatchTemplateFrame>
  );
}

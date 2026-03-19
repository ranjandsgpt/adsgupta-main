import React, { useState, useCallback, useEffect } from 'react';
import { Gamepad2, CheckCircle2, Play, Loader2 } from 'lucide-react';
import { Footer } from '../components/Footer';

const MAX_GAMES = 50;

// Fallback games when API is unavailable (e.g. no backend). All run client-side; no server required.
const FALLBACK_GAMES = Array.from({ length: 10 }, (_, i) => ({
  id: i + 1,
  name: `Target Rush #${i + 1}`,
  played: false,
}));

const API_BASE = import.meta.env.VITE_API_URL || '';

async function fetchGames() {
  try {
    const res = await fetch(`${API_BASE}/api/games`);
    if (!res.ok) throw new Error('Failed to load games');
    const data = await res.json();
    const games = data.games || [];
    return games.length > 0 ? games : FALLBACK_GAMES;
  } catch {
    return FALLBACK_GAMES;
  }
}

async function reportPlayed(gameId, currentGames) {
  try {
    const res = await fetch(`${API_BASE}/api/games/play`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ gameId: Number(gameId) }),
    });
    if (!res.ok) throw new Error('Failed to report play');
    const data = await res.json();
    return data.games || currentGames;
  } catch {
    // Client-side only: mark as played locally
    return currentGames.map((g) => (g.id === Number(gameId) ? { ...g, played: true } : g));
  }
}

// ---- The single game: Target Rush (click target 5 times) ----
const TARGET_COUNT = 5;

function TargetRushGame({ gameId, onComplete }) {
  const [score, setScore] = useState(0);
  const [targetPos, setTargetPos] = useState({ x: 50, y: 50 });
  const [done, setDone] = useState(false);

  const moveTarget = useCallback(() => {
    setTargetPos({
      x: 15 + Math.random() * 70,
      y: 20 + Math.random() * 60,
    });
  }, []);

  const handleHit = () => {
    if (done) return;
    const next = score + 1;
    setScore(next);
    if (next >= TARGET_COUNT) {
      setDone(true);
      setTimeout(() => onComplete(), 600);
    } else {
      moveTarget();
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[320px] p-6 bg-[#0A0A0A] rounded-2xl border border-cyan-500/20">
      <p className="text-cyan-400 font-bold text-sm mb-2">Game #{gameId} — Target Rush</p>
      <p className="text-zinc-500 text-xs mb-4">Click the target {TARGET_COUNT} times</p>
      <div className="relative w-full max-w-md aspect-video bg-slate-900/80 rounded-xl border border-white/10 overflow-hidden">
        <button
          type="button"
          onClick={handleHit}
          disabled={done}
          className="absolute w-14 h-14 rounded-full bg-cyan-500 border-4 border-cyan-300 shadow-lg shadow-cyan-500/40 transition-transform hover:scale-110 active:scale-95 disabled:opacity-80"
          style={{
            left: `${targetPos.x}%`,
            top: `${targetPos.y}%`,
            transform: 'translate(-50%, -50%)',
          }}
          aria-label="Hit target"
        />
        <div className="absolute top-2 left-2 px-2 py-1 rounded bg-black/60 text-cyan-400 text-xs font-bold">
          {score} / {TARGET_COUNT}
        </div>
      </div>
      {done && (
        <p className="mt-4 text-emerald-400 font-bold flex items-center gap-2">
          <CheckCircle2 size={20} /> Complete!
        </p>
      )}
    </div>
  );
}

export function GamesLab() {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [playingId, setPlayingId] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const loadGames = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const list = await fetchGames();
      setGames(list);
    } catch (e) {
      setError(e.message || 'Could not load games');
      setGames([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadGames();
  }, [loadGames]);

  const handleGameComplete = useCallback(async (gameId) => {
    setSubmitting(true);
    setError(null);
    try {
      const updated = await reportPlayed(gameId, games);
      setGames(updated);
      setPlayingId(null);
    } catch (e) {
      setError(e.message || 'Could not save. Try again.');
    } finally {
      setSubmitting(false);
    }
  }, [games]);

  const playedCount = games.filter((g) => g.played).length;

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-[#0A0A0A] text-zinc-200">
      <main className="flex-1 max-w-[1600px] mx-auto w-full px-4 sm:px-6 py-6 flex flex-col gap-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              <span className="text-cyan-400">Games</span>
            </h2>
            <p className="text-zinc-500 text-sm mt-1">
              Play a game. When one is completed, two new games are added automatically—up to {MAX_GAMES} games.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="px-3 py-1.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-bold">
              {games.length} / {MAX_GAMES} games
            </span>
            <span className="text-zinc-500 text-xs">{playedCount} played</span>
          </div>
        </div>

        {error && (
          <div className="px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center justify-between gap-2">
            <span>{error}</span>
            <button type="button" onClick={() => setError(null)} className="text-red-400 hover:text-white">
              Dismiss
            </button>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={32} className="text-cyan-400 animate-spin" />
          </div>
        ) : playingId !== null ? (
          <div className="space-y-4">
            <button
              type="button"
              onClick={() => setPlayingId(null)}
              disabled={submitting}
              className="text-zinc-500 hover:text-white text-sm flex items-center gap-2 disabled:opacity-50"
            >
              ← Back to list
            </button>
            <TargetRushGame
              gameId={playingId}
              onComplete={() => handleGameComplete(playingId)}
            />
            {submitting && (
              <div className="flex items-center gap-2 text-cyan-400 text-sm">
                <Loader2 size={16} className="animate-spin" /> Saving…
              </div>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {games.map((game) => (
              <div
                key={game.id}
                className={`rounded-2xl border p-5 flex flex-col items-center justify-center min-h-[140px] transition-all ${
                  game.played
                    ? 'bg-emerald-500/5 border-emerald-500/20'
                    : 'bg-[#111114] border-white/10 hover:border-cyan-500/30'
                }`}
              >
                <div className={`p-2 rounded-xl mb-3 ${game.played ? 'bg-emerald-500/20' : 'bg-cyan-500/20'}`}>
                  <Gamepad2 size={24} className={game.played ? 'text-emerald-400' : 'text-cyan-400'} />
                </div>
                <span className="text-white font-bold text-sm">{game.name || `Game #${game.id}`}</span>
                {game.played ? (
                  <span className="mt-2 text-emerald-400 text-xs flex items-center gap-1">
                    <CheckCircle2 size={12} /> Completed
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => setPlayingId(game.id)}
                    className="mt-3 px-4 py-2 rounded-xl bg-cyan-500/20 border border-cyan-500/40 text-cyan-400 text-xs font-bold flex items-center gap-2 hover:bg-cyan-500/30 transition-colors"
                  >
                    <Play size={14} /> Play
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}

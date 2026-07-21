import { useCallback, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { GameShell } from '../games/GameShell';
import { games, getGame } from '../games/registry';

/** Reserved slot between game cards for future monetization. */
function GameGridAd({ label }: { label: string }) {
  return (
    <div
      className="col-span-full flex min-h-[88px] flex-col items-center justify-center rounded-2xl border border-dashed border-white/15 bg-[#0f0f12] p-4 text-center sm:col-span-1 sm:min-h-[140px] sm:p-5"
      aria-label={label}
    >
      <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-600">Ad</span>
      <span className="mt-1 text-xs text-zinc-500 sm:mt-2">{label}</span>
    </div>
  );
}

export function GamesLanding() {
  const items: Array<{ type: 'game'; id: string } | { type: 'ad'; key: string; label: string }> = [];
  games.forEach((game, index) => {
    items.push({ type: 'game', id: game.id });
    // Insert an ad after every 4 cards so rows can host monetization.
    if ((index + 1) % 4 === 0 && index < games.length - 1) {
      items.push({ type: 'ad', key: `ad-${index}`, label: 'Sponsored placement' });
    }
  });

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-[#0A0A0A] text-zinc-200">
      <main className="mx-auto flex w-full max-w-[1100px] flex-1 flex-col gap-4 px-4 py-5 sm:gap-5 sm:px-6 sm:py-6">
        <p className="text-sm text-zinc-500">Tap a game to play. Each is fully functional.</p>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-[repeat(auto-fit,minmax(150px,1fr))]">
          {items.map((item) => {
            if (item.type === 'ad') {
              return <GameGridAd key={item.key} label={item.label} />;
            }
            const game = games.find((entry) => entry.id === item.id);
            if (!game) return null;
            const Icon = game.icon;
            return (
              <Link
                key={game.id}
                to={`/games/play/${game.id}`}
                className="group flex min-h-[120px] flex-col items-center justify-center rounded-2xl border border-white/10 bg-[#15151a] p-4 text-center transition-all active:scale-[0.98] hover:border-white/20 hover:bg-[#1a1a20] sm:min-h-[140px] sm:p-5"
              >
                <Icon size={28} stroke={1.5} className="mb-2 text-zinc-100 sm:mb-3" aria-hidden />
                <span className="text-sm font-semibold text-zinc-100 group-hover:text-white">
                  {game.name}
                </span>
              </Link>
            );
          })}
        </div>
      </main>
    </div>
  );
}

export function GamePlayPage() {
  const { gameId } = useParams<{ gameId: string }>();
  const navigate = useNavigate();
  const game = getGame(gameId);
  const [score, setScore] = useState('—');
  const onScore = useCallback((text: string) => setScore(text), []);
  const goBack = useCallback(() => navigate('/games'), [navigate]);

  if (!game) {
    return (
      <div className="arcade-play-page flex flex-1 flex-col items-center justify-center gap-4 bg-[#0A0A0A] px-4 text-center text-zinc-300">
        <p className="text-sm">Game not found.</p>
        <Link to="/games" className="inline-flex min-h-11 items-center text-sm font-medium text-cyan-400 hover:text-cyan-300">
          ← Back to Games
        </Link>
      </div>
    );
  }

  const Game = game.component;
  return (
    <div className="arcade-play-page flex min-h-0 flex-1 flex-col bg-[#0A0A0A] px-3 pt-4 sm:px-6 sm:pt-6">
      <GameShell title={game.name} score={score} onBack={goBack}>
        <Game onScore={onScore} />
      </GameShell>
    </div>
  );
}

/** Legacy export kept for any remaining imports. */
export function GamesLab() {
  return <GamesLanding />;
}

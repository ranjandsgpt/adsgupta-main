import { useEffect, useRef, useState } from 'react';
import {
  IconBolt,
  IconCloud,
  IconFlame,
  IconHeart,
  IconLeaf,
  IconMoon,
  IconStar,
  IconSun,
} from '@tabler/icons-react';
import type { GameIcon, GameProps } from './types';

const ACCENT = '#378ADD';
const ICONS: GameIcon[] = [IconHeart, IconStar, IconBolt, IconMoon, IconSun, IconCloud, IconFlame, IconLeaf];

type Card = { id: number; pair: number; Icon: GameIcon };

function makeDeck(): Card[] {
  const cards: Card[] = ICONS.flatMap((Icon, pair) => [
    { id: pair * 2, pair, Icon },
    { id: pair * 2 + 1, pair, Icon },
  ]);

  for (let i = cards.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [cards[i], cards[j]] = [cards[j], cards[i]];
  }

  return cards;
}

export function MemoryMatchGame({ onScore }: GameProps) {
  const [deck] = useState(makeDeck);
  const [flipped, setFlipped] = useState<number[]>([]);
  const [matched, setMatched] = useState<Set<number>>(() => new Set());
  const [moves, setMoves] = useState(0);
  const [busy, setBusy] = useState(false);
  const onScoreRef = useRef(onScore);
  const timerRef = useRef<number>();

  useEffect(() => {
    onScoreRef.current = onScore;
  }, [onScore]);

  useEffect(() => {
    onScoreRef.current('Moves 0');
    return () => window.clearTimeout(timerRef.current);
  }, []);

  const reveal = (index: number) => {
    if (busy || flipped.includes(index) || matched.has(index) || flipped.length >= 2) return;

    const nextFlipped = [...flipped, index];
    setFlipped(nextFlipped);

    if (nextFlipped.length !== 2) return;

    const nextMoves = moves + 1;
    setMoves(nextMoves);
    onScoreRef.current(`Moves ${nextMoves}`);

    if (deck[nextFlipped[0]].pair === deck[nextFlipped[1]].pair) {
      const nextMatched = new Set(matched);
      nextMatched.add(nextFlipped[0]);
      nextMatched.add(nextFlipped[1]);
      setMatched(nextMatched);
      setFlipped([]);

      if (nextMatched.size / 2 === 8) {
        onScoreRef.current(`Won in ${nextMoves}!`);
      }
      return;
    }

    setBusy(true);
    timerRef.current = window.setTimeout(() => {
      setFlipped([]);
      setBusy(false);
    }, 700);
  };

  return (
    <div className="grid w-[280px] max-w-full grid-cols-4 gap-2" aria-label="Memory Match board">
      {deck.map((card, index) => {
        const visible = flipped.includes(index) || matched.has(index);
        const { Icon } = card;

        return (
          <button
            key={card.id}
            type="button"
            onClick={() => reveal(index)}
            aria-label={visible ? `Card ${index + 1}, revealed` : `Reveal card ${index + 1}`}
            className="aspect-square rounded-lg border-[0.5px] border-white/20 bg-[#333333] transition-transform hover:scale-[1.03] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#378ADD]"
          >
            <Icon
              size={22}
              stroke={1.75}
              className="mx-auto block transition-colors"
              style={{ color: visible ? ACCENT : 'transparent' }}
              aria-hidden="true"
            />
          </button>
        );
      })}
    </div>
  );
}

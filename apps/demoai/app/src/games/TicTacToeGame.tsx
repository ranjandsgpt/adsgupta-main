import { useEffect, useRef, useState } from 'react';
import type { GameProps } from './types';

type Mark = 'X' | 'O' | null;

const WIN_LINES = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

function check(board: Mark[], player: Mark): boolean {
  return WIN_LINES.some((line) => line.every((index) => board[index] === player));
}

function findWinningMove(board: Mark[], mark: Mark): number | undefined {
  const empty = board.flatMap((value, cell) => (value ? [] : [cell]));
  return empty.find((cell) => {
    const test = [...board];
    test[cell] = mark;
    return check(test, mark);
  });
}

export function TicTacToeGame({ onScore }: GameProps) {
  const [board, setBoard] = useState<Mark[]>(() => Array(9).fill(null));
  const [finished, setFinished] = useState(false);
  const onScoreRef = useRef(onScore);

  useEffect(() => {
    onScoreRef.current = onScore;
  }, [onScore]);

  useEffect(() => {
    onScoreRef.current('Your turn');
  }, []);

  const play = (index: number) => {
    if (finished || board[index]) return;

    const next = [...board];
    next[index] = 'X';

    if (check(next, 'X')) {
      setBoard(next);
      setFinished(true);
      onScoreRef.current('You win!');
      return;
    }

    if (next.every(Boolean)) {
      setBoard(next);
      setFinished(true);
      onScoreRef.current('Draw');
      return;
    }

    const empty = next.flatMap((value, cell) => (value ? [] : [cell]));
    const aiMove =
      findWinningMove(next, 'O') ??
      findWinningMove(next, 'X') ??
      empty[Math.floor(Math.random() * empty.length)];

    next[aiMove] = 'O';
    setBoard(next);

    if (check(next, 'O')) {
      setFinished(true);
      onScoreRef.current('AI wins');
    } else if (next.every(Boolean)) {
      setFinished(true);
      onScoreRef.current('Draw');
    } else {
      onScoreRef.current('Your turn');
    }
  };

  return (
    <div className="grid grid-cols-3 gap-1.5" role="grid" aria-label="Tic-Tac-Toe board">
      {board.map((mark, index) => (
        <button
          key={index}
          type="button"
          onClick={() => play(index)}
          disabled={finished || Boolean(mark)}
          aria-label={mark ? `Cell ${index + 1}: ${mark}` : `Play cell ${index + 1}`}
          className="h-20 w-20 rounded-lg border-[0.5px] border-white/20 bg-[#333333] text-[32px] font-medium text-white transition-colors hover:bg-[#3d3d3d] disabled:cursor-default disabled:hover:bg-[#333333]"
        >
          {mark}
        </button>
      ))}
    </div>
  );
}

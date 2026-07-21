import { useEffect } from 'react';
import type { GameProps } from './types';

/** Stand-in until the real game component is built. */
export function PlaceholderGame({ onScore }: GameProps) {
  useEffect(() => {
    onScore('Soon');
  }, [onScore]);

  return (
    <div
      className="flex h-[220px] w-[280px] max-w-full flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-white/20 bg-[#111111] px-6 text-center"
      role="status"
    >
      <p className="text-[15px] font-medium text-white">Coming next</p>
      <p className="text-xs leading-5 text-zinc-500">
        This card is reserved. The playable game lands here one at a time.
      </p>
    </div>
  );
}

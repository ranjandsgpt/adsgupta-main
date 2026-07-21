import type { ReactNode } from 'react';
import { IconArrowLeft } from '@tabler/icons-react';

type GameShellProps = {
  title: string;
  score: string;
  onBack: () => void;
  children: ReactNode;
};

export function GameShell({ title, score, onBack, children }: GameShellProps) {
  return (
    <section className="mx-auto w-full max-w-2xl rounded-2xl border border-white/10 bg-[#111114] p-3 shadow-2xl sm:p-5">
      <header className="mb-3 grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2 sm:mb-4 sm:gap-3">
        <button
          type="button"
          onClick={onBack}
          className="flex min-h-11 min-w-11 items-center gap-1.5 justify-self-start rounded-lg px-2 text-sm font-medium text-zinc-400 transition-colors hover:bg-white/5 hover:text-white"
          aria-label="Back to Games"
        >
          <IconArrowLeft size={16} stroke={1.75} aria-hidden="true" />
          <span className="hidden sm:inline">Games</span>
        </button>
        <h2 className="truncate text-center text-[15px] font-medium text-white">{title}</h2>
        <output
          className="min-w-[56px] max-w-[96px] justify-self-end truncate text-right text-[11px] font-medium text-zinc-500 sm:min-w-[70px] sm:text-xs"
          aria-live="polite"
        >
          {score}
        </output>
      </header>
      <div className="flex min-h-[min(60dvh,324px)] items-center justify-center overflow-x-hidden overflow-y-auto rounded-xl bg-[#17171b] p-2 sm:min-h-[324px] sm:p-3">
        {children}
      </div>
    </section>
  );
}

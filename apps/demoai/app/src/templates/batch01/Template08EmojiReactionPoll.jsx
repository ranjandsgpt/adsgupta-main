import React, { useState } from 'react';
import BatchTemplateFrame, { track } from './BatchTemplateFrame';

const ID = 'emoji-reaction-poll';
const REACTIONS = [
  { emoji: '😍', label: 'Love it', votes: 48 },
  { emoji: '🤔', label: 'Curious', votes: 31 },
  { emoji: '🔥', label: 'Hot', votes: 21 },
];

export default function Template08EmojiReactionPoll() {
  const [selected, setSelected] = useState('');

  const vote = (item) => {
    setSelected(item.label);
    track(ID, 'click', { target: 'reaction', reaction: item.label });
    track(ID, 'complete', { reaction: item.label });
  };

  return (
    <BatchTemplateFrame templateId={ID} title="Emoji Reaction Poll" subtitle="How does the new colorway feel?">
      <div className="rounded-2xl bg-gradient-to-r from-pink-600 to-orange-500 p-6 text-center">
        <p className="text-sm font-bold uppercase tracking-widest text-white/80">Pulse sneaker · Solar</p>
        <p className="mt-2 text-5xl font-black">DROP 01</p>
      </div>
      <div className="mt-4 grid grid-cols-3 gap-2">
        {REACTIONS.map((item) => {
          const totalVotes = REACTIONS.reduce((sum, r) => sum + r.votes, 0) + (selected ? 1 : 0);
          const percent = Math.round(((item.votes + (selected === item.label ? 1 : 0)) / totalVotes) * 100);
          return (
            <button
              key={item.label}
              type="button"
              onClick={() => vote(item)}
              aria-pressed={selected === item.label}
              className={`min-h-24 rounded-2xl border p-2 ${selected === item.label ? 'border-cyan-300 bg-cyan-300/15' : 'border-white/10 bg-white/5'}`}
            >
              <span className="block text-3xl" aria-hidden="true">{item.emoji}</span>
              <span className="mt-1 block text-xs font-bold">{item.label}</span>
              {selected && <span className="block text-xs text-cyan-300">{percent}%</span>}
            </button>
          );
        })}
      </div>
      <p className="mt-3 text-center text-sm text-slate-400" aria-live="polite">{selected ? `Reaction recorded: ${selected}` : 'Tap a reaction to see the live mock result'}</p>
    </BatchTemplateFrame>
  );
}

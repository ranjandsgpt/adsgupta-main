import React from 'react';
import { useDismissState } from './hooks/useDismissState';
import { StoryEngine } from './primitives/StoryEngine';
import { emitTelemetry } from './telemetry';

const TEMPLATE_ID = 'vertical-story';

const FRAMES = [
  {
    id: 'signal',
    eyebrow: 'Frame 01 · Signal',
    kicker: 'Creative intelligence',
    title: 'Start with the moment.',
    body: 'Turn live context into a creative direction while attention is at its peak.',
    mark: '01',
    background: 'bg-gradient-to-br from-indigo-950 via-violet-800 to-fuchsia-600',
  },
  {
    id: 'shape',
    eyebrow: 'Frame 02 · Shape',
    kicker: 'Adaptive design',
    title: 'Shape every message.',
    body: 'Compose modular copy, color, and offer systems for every audience and screen.',
    mark: '02',
    background: 'bg-gradient-to-br from-slate-950 via-cyan-900 to-emerald-600',
  },
  {
    id: 'learn',
    eyebrow: 'Frame 03 · Learn',
    kicker: 'Continuous learning',
    title: 'Learn while it runs.',
    body: 'Read engagement signals and move stronger creative into the spotlight.',
    mark: '03',
    background: 'bg-gradient-to-br from-slate-950 via-blue-900 to-cyan-500',
  },
  {
    id: 'scale',
    eyebrow: 'Frame 04 · Scale',
    kicker: 'One creative system',
    title: 'Make every impression count.',
    body: 'Launch a story-led campaign that stays coherent from discovery to action.',
    mark: '04',
    background: 'bg-gradient-to-br from-slate-950 via-rose-900 to-orange-500',
  },
];

export default function Template33VerticalStoryAd() {
  const { dismissed, dismiss } = useDismissState({
    key: TEMPLATE_ID,
    scope: 'component',
    onDismiss: (reason) => {
      if (reason === 'escape') {
        emitTelemetry('close', { templateId: TEMPLATE_ID, reason });
      }
    },
  });

  if (dismissed) return null;

  return (
    <StoryEngine
      frames={FRAMES}
      templateId={TEMPLATE_ID}
      onDismiss={dismiss}
    />
  );
}

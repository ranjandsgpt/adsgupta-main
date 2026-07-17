import React from 'react';
import { Play } from 'lucide-react';
import { MorphContainer } from '../primitives/MorphContainer';
import { StoryEngine } from '../primitives/StoryEngine';
import { Batch05Shell, buttonClass, trackClick, useMorph } from './Batch05Shell';

const ID = 'mrec-story-morph';
const frames = [
  { id: 'one', eyebrow: 'Aperture', kicker: 'New perspective', title: 'Make every frame count.', body: 'A compact MREC unfolds into a touch-first brand story.', mark: '01', background: 'bg-gradient-to-br from-violet-950 to-cyan-950' },
  { id: 'two', eyebrow: 'Aperture', kicker: 'Built to move', title: 'Stories without a detour.', body: 'Tap either side to navigate, hold to pause, or swipe down to close.', mark: '02', background: 'bg-gradient-to-br from-rose-950 to-violet-950' },
  { id: 'three', eyebrow: 'Aperture', kicker: 'Your next chapter', title: 'Turn attention into action.', body: 'An immersive finish with measurable engagement.', mark: '03', background: 'bg-gradient-to-br from-cyan-950 to-slate-950' },
];

export default function Template58MrecStoryMorph() {
  const { expanded, setMorph } = useMorph(ID);

  if (expanded) return <StoryEngine frames={frames} templateId={ID} onDismiss={() => setMorph(false, 'story')} />;

  return (
    <Batch05Shell templateId={ID} title="MREC to Story Morph" className="mx-auto max-w-[360px]">
      <MorphContainer className="flex min-h-[250px] flex-col justify-between bg-gradient-to-br from-violet-950 via-slate-950 to-cyan-950 p-5 text-white">
        <div><p className="text-xs font-bold uppercase tracking-[.2em] text-cyan-300">Aperture Stories</p><h3 className="mt-3 text-3xl font-black leading-none">Small canvas.<br />Big chapter.</h3></div>
        <button type="button" className={`${buttonClass} flex items-center justify-center gap-2 bg-white text-slate-950`} onClick={() => { trackClick(ID, 'open-story'); setMorph(true, 'open-story'); }}>
          <Play size={18} fill="currentColor" /> Open story
        </button>
      </MorphContainer>
    </Batch05Shell>
  );
}

import React, { useCallback, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, Heart, Play, X } from 'lucide-react';
import { useDismissState, useReducedMotion, useViewability } from '../hooks';
import { emitTelemetry } from '../telemetry';

const TEMPLATE_ID = 'ugc-carousel-ad';
const POSTS = [
  { creator: '@mika.moves', quote: 'Three cities, one tiny carry-on.', colors: 'from-orange-300 via-rose-500 to-violet-900' },
  { creator: '@noahoutside', quote: 'Rain test: passed with room to spare.', colors: 'from-cyan-200 via-teal-500 to-slate-900' },
  { creator: '@sunday.studio', quote: 'The desk-to-weekend switch.', colors: 'from-lime-200 via-emerald-500 to-indigo-950' },
];

export default function Template40UGCCarouselAd() {
  const [active, setActive] = useState(0);
  const [liked, setLiked] = useState([]);
  const reducedMotion = useReducedMotion();
  const touchStart = useRef(null);
  const onDismiss = useCallback((reason) => emitTelemetry('close', { templateId: TEMPLATE_ID, reason }), []);
  const { dismissed, dismiss } = useDismissState({ key: TEMPLATE_ID, onDismiss });
  const viewRef = useViewability({ templateId: TEMPLATE_ID });
  const move = (direction) => {
    setActive((value) => (value + direction + POSTS.length) % POSTS.length);
    emitTelemetry('click', { templateId: TEMPLATE_ID, target: direction > 0 ? 'next' : 'previous' });
  };
  const toggleLike = () => {
    setLiked((values) => (values.includes(active) ? values.filter((value) => value !== active) : [...values, active]));
    emitTelemetry('click', { templateId: TEMPLATE_ID, target: 'like', slide: active });
  };
  const shop = () => {
    emitTelemetry('click', { templateId: TEMPLATE_ID, target: 'shop-look', slide: active });
    emitTelemetry('complete', { templateId: TEMPLATE_ID, action: 'look-selected' });
  };

  if (dismissed) return null;
  const post = POSTS[active];

  return (
    <section ref={viewRef} className="mx-auto max-w-sm rounded-3xl bg-slate-950 p-4 text-white shadow-2xl">
      <header className="flex min-h-12 items-center justify-between"><div><p className="text-xs font-black">WEEKEND / FORM</p><p className="text-[9px] uppercase tracking-widest text-slate-400">Sponsored creator picks</p></div><button type="button" aria-label="Close ad" onClick={() => dismiss('button')} className="flex min-h-11 min-w-11 items-center justify-center rounded-full hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"><X size={19} /></button></header>
      <div onTouchStart={(event) => { touchStart.current = event.touches[0].clientX; }} onTouchEnd={(event) => { if (touchStart.current === null) return; const delta = event.changedTouches[0].clientX - touchStart.current; touchStart.current = null; if (Math.abs(delta) > 40) move(delta < 0 ? 1 : -1); }} className={`relative mt-2 flex min-h-56 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br ${post.colors} ${reducedMotion ? '' : 'transition-colors duration-500'}`}>
        <div className="absolute left-4 top-3 rounded-full bg-black/30 px-3 py-1 text-xs font-bold backdrop-blur">{post.creator}</div>
        <div className="flex h-24 w-20 items-center justify-center rounded-[1.5rem] border border-white/40 bg-white/15 shadow-2xl backdrop-blur"><Play size={28} fill="currentColor" /></div>
        <blockquote className="absolute bottom-4 left-5 right-5 text-lg font-black leading-tight">“{post.quote}”</blockquote>
        <button type="button" aria-label="Previous post" onClick={() => move(-1)} className="absolute left-2 top-1/2 flex min-h-11 min-w-11 -translate-y-1/2 items-center justify-center rounded-full bg-black/30 backdrop-blur"><ChevronLeft /></button>
        <button type="button" aria-label="Next post" onClick={() => move(1)} className="absolute right-2 top-1/2 flex min-h-11 min-w-11 -translate-y-1/2 items-center justify-center rounded-full bg-black/30 backdrop-blur"><ChevronRight /></button>
      </div>
      <div className="mt-2 flex justify-center gap-1.5" aria-hidden="true">{POSTS.map((item, index) => <span key={item.creator} className={`h-1.5 rounded-full transition-all ${index === active ? 'w-5 bg-white' : 'w-1.5 bg-white/40'}`} />)}</div>
      <div className="mt-2 flex items-center gap-2"><button type="button" aria-label={liked.includes(active) ? 'Unlike post' : 'Like post'} aria-pressed={liked.includes(active)} onClick={toggleLike} className={`flex min-h-11 min-w-11 items-center justify-center rounded-full ${liked.includes(active) ? 'bg-rose-500/30 text-rose-300' : 'bg-white/10'}`}><Heart size={19} fill={liked.includes(active) ? 'currentColor' : 'none'} /></button><button type="button" onClick={shop} className="min-h-11 flex-1 rounded-xl bg-white px-4 text-sm font-black text-slate-950">Shop this look</button></div>
    </section>
  );
}

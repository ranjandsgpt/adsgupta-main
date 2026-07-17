import React, { useState, useEffect, useRef } from 'react';
import {
  X, ChevronDown, MousePointer2, Gamepad2, ShoppingCart, Timer, Maximize2, Layers,
  AlertCircle, BellRing, MoveRight, BarChart2, Play, Pause, ChevronRight, Activity, Zap,
  MessageSquare, ArrowRight, CheckCircle, TrendingUp, Sun, CloudRain, Unlock, Star, Sparkles,
  MessageCircle, ArrowLeftRight, CreditCard, ChevronLeft, Box, Bot
} from 'lucide-react';

export const DEMO_CTA_URL = '/';

export const articleContent = [
  'The shift from static banners to dynamic, context-aware creative is no longer optional. Brands that tailor messaging in real time see higher engagement and conversion. Programmatic creative combines data signals—device, location, time of day, even the content on the page—with flexible templates so that one campaign can yield thousands of relevant variants without manual work.',
  "Creative templates sit at the heart of this. A single 'master' design is parameterized: headlines, images, and calls to action are swapped automatically. When a user is reading an article about travel, the ad might show a flight deal; the same slot on a sports site might show gear. The format stays consistent; the message adapts. This is what we mean by 'creative at scale.'",
  'Formats matter as much as content. Interscrollers and flying carpets reveal the ad as the user scrolls, tying viewability to intent. Sticky footers and anchor units keep the CTA in view without blocking the page. Native and in-feed units match the look and feel of the publisher, which tends to perform better than disruptive takeovers. The best campaigns use a mix: high-impact units for awareness, subtle units for consideration and conversion.',
  "Agentic and AI-driven creative take this further. Instead of pre-defined rules, an 'agent' can propose headlines, adjust tone, or suggest a different offer based on real-time context. The creative becomes a conversation: the system tests variants, learns, and optimizes. For advertisers, this means less manual A/B testing and faster iteration. For users, it means more relevant, less repetitive ads.",
  'Measurement and attribution have evolved in parallel. Viewability, completion rates, and click-through still matter, but so do outcomes: sign-ups, purchases, and post-view conversions. Privacy constraints are pushing the industry toward first-party data and consent-based targeting. Creative that works in a cookie-less world—relying on context, consent, and on-site behavior—will define the next decade.',
  "This demo lets you explore dozens of creative templates in context. Each format is fully interactive; you can tap CTAs, close ads, and scroll to see how they behave. Everything runs on this page so it works on desktop and mobile. Use the template selector to switch formats and see how the same 'article' can carry different ad experiences."
];

const CTA = ({ href = DEMO_CTA_URL, children, className = '', ...props }) => (
  <a href={href} className={`cursor-pointer ${className}`} {...props}>{children}</a>
);

const useScrollReveal = (scrollAreaRef) => {
  const ref = useRef(null);
  const [progress, setProgress] = useState(0.5);
  useEffect(() => {
    const area = scrollAreaRef?.current;
    const target = area || window;
    let frame = 0;
    const update = () => {
      frame = 0;
      if (!ref.current) return;
      const rect = ref.current.getBoundingClientRect();
      const root = area?.getBoundingClientRect() || {
        top: 0,
        bottom: document.documentElement.clientHeight,
        height: document.documentElement.clientHeight,
      };
      const value = (root.bottom - rect.top) / Math.max(root.height + rect.height, 1);
      setProgress(Math.max(0, Math.min(1, value)));
    };
    const schedule = () => {
      if (!frame) frame = window.requestAnimationFrame(update);
    };
    update();
    target.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    return () => {
      target.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [scrollAreaRef]);
  return [ref, progress];
};

export const Interscroller = ({ scrollAreaRef }) => {
  const [ref, progress] = useScrollReveal(scrollAreaRef);
  return (
    <div ref={ref} className="relative h-[300px] w-full overflow-hidden rounded-xl border border-cyan-500/30 bg-slate-950">
      <div
        className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(34,211,238,.5),transparent_35%),linear-gradient(135deg,#020617,#312e81,#0f172a)] transition-transform duration-100"
        style={{ transform: `translateY(${(0.5 - progress) * 36}px) scale(1.12)` }}
      />
      <div className="absolute inset-0 bg-slate-950/25" />
      <div className="relative flex h-full flex-col items-center justify-center px-5 text-center">
        <span className="mb-2 block text-[10px] font-bold tracking-[0.22em] text-cyan-300">SPONSORED · IMMERSIVE REVEAL</span>
        <h3 className="text-3xl font-black leading-tight text-white">The True Interscroller</h3>
        <p className="my-3 max-w-md text-sm text-slate-200">A high-impact canvas revealed naturally as you read.</p>
        <CTA className="inline-block rounded-full bg-white px-6 py-2.5 text-sm font-bold text-slate-900 transition hover:bg-cyan-300">Explore Collection</CTA>
      </div>
    </div>
  );
};

export const StickyFooter = () => {
  const [visible, setVisible] = useState(true);
  if (!visible) return null;
  return (
    <div className="pointer-events-auto absolute inset-x-0 bottom-0 z-50 flex items-center justify-between gap-3 border-t border-slate-700 bg-slate-900/95 p-3 shadow-[0_-12px_32px_rgba(0,0,0,0.45)] backdrop-blur-xl">
      <div className="flex min-w-0 items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-cyan-500"><Layers className="text-white" size={20} /></div>
        <div className="min-w-0"><span className="text-[9px] font-bold uppercase tracking-widest text-cyan-400">Sponsored</span><h4 className="truncate text-sm font-bold text-white">Upgrade Your Workflow</h4></div>
      </div>
      <div className="flex shrink-0 items-center gap-1">
        <CTA className="rounded-lg bg-white px-3 py-2 text-xs font-bold text-slate-900 hover:bg-cyan-100">Get Started</CTA>
        <button type="button" aria-label="Dismiss ad" onClick={() => setVisible(false)} className="flex min-h-11 min-w-11 cursor-pointer items-center justify-center rounded-full text-slate-300 hover:bg-slate-700 hover:text-white"><X size={18} /></button>
      </div>
    </div>
  );
};

export const StickyTopLeaderboard = () => {
  const [visible, setVisible] = useState(true);
  if (!visible) return null;
  return (
  <div className="pointer-events-auto absolute inset-x-0 top-0 z-50 flex items-center justify-center border-b border-indigo-500 bg-indigo-700 p-2 shadow-lg">
    <div className="flex min-w-0 items-center gap-2">
      <span className="px-2 py-1 bg-white/20 rounded text-xs font-bold text-white uppercase tracking-wider">Ad</span>
      <p className="truncate text-xs font-medium text-white sm:text-sm">Get 50% off enterprise plans.</p>
      <CTA className="whitespace-nowrap rounded-md bg-white px-3 py-2 text-xs font-bold text-indigo-700 hover:bg-indigo-50">Claim</CTA>
      <button type="button" aria-label="Dismiss ad" onClick={() => setVisible(false)} className="flex min-h-11 min-w-11 cursor-pointer items-center justify-center rounded-full text-indigo-100 hover:bg-white/15"><X size={16} /></button>
    </div>
  </div>
  );
};

export const ExpandableBanner = () => {
  const [expanded, setExpanded] = useState(false);
  return (
    <div
      className={`relative w-full cursor-pointer overflow-hidden rounded-xl border border-slate-700 bg-gradient-to-r from-slate-800 to-slate-900 transition-all duration-500 ${expanded ? 'h-[300px]' : 'h-[100px]'}`}
      onClick={() => setExpanded(!expanded)}
      role="button"
      tabIndex={0}
      aria-expanded={expanded}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          setExpanded((value) => !value);
        }
      }}
    >
      <div className="absolute inset-0 flex items-center justify-between p-6 z-20 bg-slate-900/40 backdrop-blur-sm group-hover:bg-slate-900/20 transition-colors">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-cyan-500/20 flex items-center justify-center border border-cyan-500/50">
            <Zap className="text-cyan-400" size={20} />
          </div>
          <div>
            <span className="mb-1 block text-[10px] font-bold uppercase tracking-widest text-cyan-400">Sponsored · Interactive Canvas</span>
            <h3 className="text-xl font-bold text-white transition-colors">Hover or Click to Expand</h3>
          </div>
        </div>
        <Maximize2 className={`text-cyan-400 transition-transform duration-500 ${expanded ? 'rotate-180 opacity-0' : 'opacity-100'}`} />
      </div>
      <div className={`absolute inset-x-0 bottom-0 top-[100px] p-4 transition-opacity duration-300 ${expanded ? 'opacity-100' : 'pointer-events-none opacity-0'}`}>
        <div className="flex h-full items-center gap-4">
          <div className="hidden h-full w-2/5 rounded-lg border border-cyan-400/30 bg-[radial-gradient(circle_at_35%_30%,#22d3ee,transparent_30%),linear-gradient(135deg,#312e81,#0f172a)] sm:block" role="img" aria-label="Abstract technology artwork" />
          <div className="flex min-w-0 flex-1 flex-col justify-center">
            <h4 className="mb-2 text-xl font-bold text-white">Unlock Full Potential</h4>
            <p className="mb-4 text-sm leading-relaxed text-slate-300">Rich media and useful interactions, contained inside the page.</p>
            <CTA className="flex w-fit items-center gap-2 rounded-lg bg-cyan-500 px-5 py-2.5 text-sm font-bold text-slate-950 hover:bg-cyan-400" onClick={(e) => e.stopPropagation()}>Claim Offer <ChevronRight size={18} /></CTA>
          </div>
        </div>
      </div>
    </div>
  );
};

export const PlayableMini = () => {
  const [gameState, setGameState] = useState('start');
  const [score, setScore] = useState(0);
  const [targetPos, setTargetPos] = useState({ top: '50%', left: '50%' });

  const moveTarget = () => {
    setTargetPos({ top: Math.random() * 60 + 20 + '%', left: Math.random() * 80 + 10 + '%' });
  };

  const startGame = (e) => {
    e.stopPropagation();
    setGameState('playing');
    setScore(0);
    moveTarget();
  };

  const handleHit = (e) => {
    e.stopPropagation();
    const newScore = score + 1;
    setScore(newScore);
    if (newScore >= 3) setGameState('won');
    else moveTarget();
  };

  return (
    <div className="relative h-[300px] w-full overflow-hidden rounded-xl border border-slate-700 bg-[radial-gradient(circle_at_80%_25%,#e11d48,transparent_25%),linear-gradient(120deg,#020617,#1e293b)]">
      <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-900/60 to-transparent" />
      <div className="absolute inset-4 z-10 max-w-sm">
        <span className="text-[10px] font-bold uppercase tracking-widest text-rose-300">Sponsored playable</span>
        <h3 className="mb-1 text-2xl font-black text-white">The New V8.</h3>
        <div className="relative mt-3 overflow-hidden rounded-xl border border-slate-600/50 bg-slate-900/85 p-4 shadow-2xl backdrop-blur-md">
          {gameState === 'start' && (
            <div className="text-center animate-fade-in">
              <Gamepad2 className="mx-auto text-rose-500 mb-3" size={32} />
              <h4 className="text-white font-bold mb-1">Unlock Test Drive</h4>
              <p className="text-xs text-slate-400 mb-4">Tap 3 targets to reveal your exclusive booking link.</p>
              <button type="button" onClick={startGame} className="cursor-pointer rounded-full bg-rose-600 px-6 py-2 text-sm font-bold text-white hover:bg-rose-500">Play Now</button>
            </div>
          )}
          {gameState === 'playing' && (
            <div className="h-32 relative">
              <div className="absolute top-0 right-0 text-xs font-mono text-slate-400">Score: {score}/3</div>
              <button
                type="button"
                className="absolute w-10 h-10 bg-rose-500 rounded-full shadow-[0_0_15px_rgba(244,63,94,0.6)] transition-all duration-300 ease-out flex items-center justify-center hover:scale-110"
                style={{ top: targetPos.top, left: targetPos.left, transform: 'translate(-50%, -50%)' }}
                onClick={handleHit}
                onMouseEnter={moveTarget}
                aria-label="Hit target"
              >
                <MousePointer2 size={16} className="text-white" />
              </button>
            </div>
          )}
          {gameState === 'won' && (
            <div className="text-center animate-fade-in">
              <div className="w-12 h-12 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-3 text-emerald-400">
                <Activity size={24} />
              </div>
              <h4 className="text-emerald-400 font-bold mb-1">Unlocked!</h4>
              <CTA className="w-full bg-white text-slate-950 font-bold py-2 rounded mt-2 hover:bg-slate-200 transition-colors block text-center">Book Test Drive</CTA>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export const AgenticAd = () => {
  const [iteration, setIteration] = useState(0);
  const [confidence, setConfidence] = useState(42);
  const [locked, setLocked] = useState(false);
  const variants = [
    { bg: 'from-blue-900 to-slate-900', art: 'from-cyan-300 via-blue-500 to-indigo-950', head: 'Need a Vacation?', cta: 'Book Flight', ctaColor: 'bg-blue-500' },
    { bg: 'from-emerald-900 to-slate-900', art: 'from-lime-300 via-emerald-500 to-teal-950', head: 'Escape to Nature.', cta: 'See Resorts', ctaColor: 'bg-emerald-500' },
    { bg: 'from-rose-900 to-slate-900', art: 'from-amber-200 via-rose-500 to-purple-950', head: 'Luxury Awaits.', cta: 'Claim Offer', ctaColor: 'bg-rose-500' },
  ];

  useEffect(() => {
    if (locked) return;
    const interval = setInterval(() => {
      setIteration((prev) => {
        const next = (prev + 1) % variants.length;
        if (next === 2 && confidence > 85) {
          setLocked(true);
          setConfidence(98);
        } else {
          setConfidence((c) => Math.min(c + Math.floor(Math.random() * 15), 98));
        }
        return next;
      });
    }, 1500);
    return () => clearInterval(interval);
  }, [confidence, locked, variants.length]);

  const active = variants[iteration];
  return (
    <div className="relative w-full overflow-hidden rounded-xl border border-slate-700 bg-slate-900">
      <div className="bg-slate-950 border-b border-slate-800 p-3 flex flex-wrap justify-between items-center gap-2 text-xs font-mono">
        <div className="flex items-center gap-3">
          <div className={`w-2 h-2 rounded-full ${locked ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'}`} />
          <span className={locked ? 'text-emerald-400' : 'text-amber-400'}>{locked ? 'AGENT OPTIMIZED' : 'AGENT A/B TESTING...'}</span>
        </div>
        <div className="flex items-center gap-2 text-slate-500">
          <span>Variant: {String.fromCharCode(65 + iteration)}</span>
          <div className="flex items-center gap-2">
            <div className="w-24 h-2 bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full bg-cyan-500 transition-all duration-500" style={{ width: `${confidence}%` }} />
            </div>
            <span className="text-cyan-400 w-6">{confidence}%</span>
          </div>
        </div>
      </div>
      <div className={`bg-gradient-to-br p-4 ${active.bg} transition-colors duration-700`}>
        <div className="flex items-center gap-4">
          <div className={`relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-lg bg-gradient-to-br ${active.art} shadow-lg`} role="img" aria-label="Generated destination artwork">
            {locked && <div className="absolute inset-0 border-4 border-emerald-500 z-10 rounded-lg shadow-[inset_0_0_20px_rgba(16,185,129,0.5)]" />}
          </div>
          <div className="min-w-0 flex-grow">
            <span className="text-[9px] font-bold uppercase tracking-widest text-slate-300">Sponsored</span>
            <h3 className="mb-1 text-xl font-bold text-white transition-all duration-500" key={active.head}>{active.head}</h3>
            <p className="text-slate-300 text-sm mb-4">Personalized offer generated based on real-time browsing context.</p>
            <CTA className={`${active.ctaColor} inline-block rounded px-5 py-2 text-sm font-bold text-white shadow-lg transition-all duration-500`} key={active.cta}>{active.cta}</CTA>
          </div>
        </div>
      </div>
    </div>
  );
};

const initialSwipeCards = [
  { id: 1, color: 'from-rose-500 to-orange-950', title: 'Running Gear' },
  { id: 2, color: 'from-blue-400 to-indigo-950', title: 'Street Style' },
  { id: 3, color: 'from-emerald-400 to-teal-950', title: 'Trail Mix' },
];

export const SwipeableCards = () => {
  const [cards, setCards] = useState(initialSwipeCards);
  const [dragX, setDragX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const handlePointerDown = () => setIsDragging(true);
  const handlePointerMove = (e) => { if (isDragging) setDragX((prev) => prev + e.movementX); };
  const handlePointerUp = () => { setIsDragging(false); if (Math.abs(dragX) > 100) setCards((prev) => prev.slice(1)); setDragX(0); };
  if (cards.length === 0) {
    return (
      <div className="flex h-[300px] w-full items-center justify-center rounded-xl border border-slate-700 bg-slate-800">
        <div className="text-center">
          <h3 className="text-white font-bold mb-2">You&apos;ve seen them all!</h3>
          <button type="button" onClick={() => setCards(initialSwipeCards)} className="cursor-pointer text-sm text-cyan-400 hover:underline">Reset Stack</button>
        </div>
      </div>
    );
  }
  return (
    <div className="relative flex h-[300px] w-full select-none items-center justify-center overflow-hidden rounded-xl bg-slate-950/30">
      <div className="absolute inset-0 flex items-center justify-between px-12 opacity-30 pointer-events-none z-0">
        <div className="text-rose-500 font-bold flex flex-col items-center"><X size={32} />Pass</div>
        <div className="text-emerald-500 font-bold flex flex-col items-center"><ShoppingCart size={32} />Save</div>
      </div>
      <div className="perspective-1000 relative z-10 h-[280px] w-64">
        {cards.map((card, index) => {
          const isTop = index === 0;
          const rotateStyle = isTop ? dragX * 0.1 : 0;
          const xStyle = isTop ? dragX : 0;
          const scaleStyle = isTop ? 1 : 1 - index * 0.05;
          const yStyle = isTop ? 0 : index * 15;
          const opacity = isTop ? 1 : 1 - index * 0.2;
          return (
            <div
              key={card.id}
              className={`absolute inset-0 rounded-2xl shadow-2xl overflow-hidden border-2 border-slate-700 bg-slate-900 transition-all ${isDragging && isTop ? 'duration-0' : 'duration-300'}`}
              style={{ transform: `translateX(${xStyle}px) translateY(${yStyle}px) scale(${scaleStyle}) rotate(${rotateStyle}deg)`, opacity, zIndex: cards.length - index, cursor: isTop ? (isDragging ? 'grabbing' : 'grab') : 'default' }}
              onPointerDown={isTop ? handlePointerDown : undefined}
              onPointerMove={isTop ? handlePointerMove : undefined}
              onPointerUp={isTop ? handlePointerUp : undefined}
              onPointerLeave={isTop ? handlePointerUp : undefined}
              role={isTop ? 'group' : undefined}
              aria-label={isTop ? `${card.title}. Drag left to pass or right to save.` : undefined}
            >
              <div className={`relative h-1/2 bg-gradient-to-br ${card.color}`}>
                <div className="absolute inset-4 rounded-full border border-white/20 bg-white/10 shadow-[0_0_40px_rgba(255,255,255,.18)]" />
                <span className="absolute left-3 top-3 rounded bg-black/30 px-2 py-1 text-[9px] font-bold uppercase tracking-widest text-white">Sponsored</span>
              </div>
              <div className="p-6 h-1/2 flex flex-col justify-between">
                <div>
                  <h3 className="text-2xl font-bold text-white mb-1">{card.title}</h3>
                  <p className="text-slate-400 text-sm">Swipe left to pass, right to save.</p>
                </div>
                <CTA className="w-full bg-slate-800 text-white font-bold py-2 rounded border border-slate-700 text-center">View Details</CTA>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export const QuizAd = () => {
  const [answered, setAnswered] = useState(false);
  const options = ['Cloud Infrastructure', 'AI / Machine Learning', 'Cybersecurity', 'Data Analytics'];
  return (
    <div className="relative w-full overflow-hidden rounded-xl border border-indigo-500/30 bg-gradient-to-br from-indigo-900 to-purple-900 p-5 text-white">
      <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" />
      {!answered ? (
        <div className="relative z-10 animate-fade-in">
          <span className="mb-2 block text-xs font-bold uppercase tracking-widest text-indigo-300">Sponsored · Quick Poll</span>
          <h3 className="mb-4 text-xl font-bold">What is your top IT priority for 2026?</h3>
          <div className="grid grid-cols-2 gap-2">
            {options.map((opt, i) => (
              <button key={opt} type="button" onClick={() => setAnswered(true)} className="group flex cursor-pointer items-center justify-between rounded-lg border border-indigo-500/50 bg-indigo-950/50 p-3 text-left text-xs font-medium transition-colors hover:bg-indigo-600">
                {opt}
                <div className="w-5 h-5 rounded-full border-2 border-indigo-400 group-hover:border-white" />
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="relative z-10 text-center animate-fade-in py-4">
          <BarChart2 className="mx-auto text-indigo-300 mb-4" size={48} />
          <h3 className="text-2xl font-bold mb-2">Thanks for sharing!</h3>
          <p className="text-indigo-200 mb-6">42% of leaders agree with you.</p>
          <CTA className="bg-white text-indigo-900 font-bold py-3 px-8 rounded-full hover:bg-indigo-50 transition-colors inline-block">Download Report (Free)</CTA>
        </div>
      )}
    </div>
  );
};

export const ProgressBarAd = () => {
  const [progress, setProgress] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => setIsVisible(entry.isIntersecting), { threshold: 0.5 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    if (!isVisible) return;
    const timer = setInterval(() => setProgress((p) => (p >= 100 ? 100 : p + 2)), 100);
    return () => clearInterval(timer);
  }, [isVisible]);
  return (
    <div ref={ref} className="relative flex h-48 w-full items-center overflow-hidden rounded-xl border border-slate-700 bg-slate-800 px-5 shadow-lg">
      <div className="z-10 w-full">
        <div className="flex justify-between items-end mb-4">
          <div>
            <span className="text-[9px] font-bold uppercase tracking-widest text-cyan-400">Sponsored reward</span>
            <h3 className="text-xl font-bold text-white">Attention Rewarded</h3>
            <p className="text-slate-400 text-sm">View this ad to unlock premium content.</p>
          </div>
          <div className="text-cyan-400 font-mono font-bold text-xl">{progress}%</div>
        </div>
        <div className="h-3 w-full overflow-hidden rounded-full border border-slate-700 bg-slate-900" role="progressbar" aria-label="Ad view progress" aria-valuemin="0" aria-valuemax="100" aria-valuenow={progress}>
          <div className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-100 ease-linear" style={{ width: `${progress}%` }} />
        </div>
        {progress === 100 && (
          <div className="absolute inset-0 bg-slate-900/95 backdrop-blur-sm flex items-center justify-center animate-fade-in z-20">
            <div className="text-center">
              <h4 className="text-xl font-bold text-white mb-3">Content Unlocked!</h4>
              <CTA className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold px-6 py-2 rounded-lg transition-colors inline-block">Continue Reading Premium</CTA>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export const OutstreamVideo = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const ref = useRef(null);
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      setIsVisible(entry.isIntersecting);
      if (entry.intersectionRatio > 0.7) setIsPlaying(true);
      if (entry.intersectionRatio < 0.2) setIsPlaying(false);
    }, { threshold: [0.2, 0.7] });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);
  return (
    <div ref={ref} className={`w-full overflow-hidden rounded-xl border border-slate-700 bg-black transition-all duration-500 ${isVisible ? 'h-[300px] opacity-100' : 'h-0 border-0 opacity-0'}`}>
      <div className="relative h-full w-full bg-[radial-gradient(circle_at_70%_30%,#7c3aed,transparent_30%),linear-gradient(135deg,#020617,#1e1b4b,#0f172a)]">
        <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/90 via-transparent to-transparent p-5">
          <span className="absolute left-4 top-4 rounded bg-slate-800/80 px-2 py-1 text-xs font-bold text-white">SPONSORED VIDEO</span>
          <h3 className="text-2xl font-bold text-white mb-2">The Future of Cinematic Experiences</h3>
          <div className="flex items-center justify-between">
            <button type="button" aria-label={isPlaying ? 'Pause sponsored video' : 'Play sponsored video'} onClick={() => setIsPlaying(!isPlaying)} className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-full border border-white/50 bg-white/20 text-white backdrop-blur transition-colors hover:bg-white hover:text-black">
              {isPlaying ? <Pause size={18} /> : <Play size={18} className="ml-1" />}
            </button>
            <CTA className="bg-white text-black px-4 py-2 rounded font-bold text-sm">Watch Full Film</CTA>
          </div>
        </div>
      </div>
    </div>
  );
};

export const FloatingVideo = () => {
  const [isFloating, setIsFloating] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    if (dismissed) return undefined;
    const observer = new IntersectionObserver(([entry]) => setIsFloating(!entry.isIntersecting), { threshold: 0.1 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [dismissed]);
  if (dismissed) return null;
  return (
    <>
      <div ref={ref} className="h-1 w-full bg-transparent" />
      <div className={`w-full transition-all duration-300 ${isFloating ? 'h-[300px] mb-8' : 'h-0 mb-0'}`} />
      <div className={`group z-40 overflow-hidden bg-[radial-gradient(circle_at_60%_30%,#06b6d4,transparent_28%),linear-gradient(135deg,#0f172a,#312e81)] transition-all duration-500 ${isFloating ? 'absolute bottom-4 left-3 right-3 h-44 w-auto rounded-xl border-2 border-slate-600 shadow-2xl sm:left-auto sm:right-6 sm:w-72' : 'relative h-[280px] w-full rounded-xl border border-slate-700 shadow-lg'}`}>
        <button type="button" aria-label={isPlaying ? 'Pause video' : 'Play video'} onClick={() => setIsPlaying((value) => !value)} className="absolute inset-0 flex cursor-pointer items-center justify-center bg-black/20 transition-colors hover:bg-black/40">
          <span className="flex h-14 w-14 items-center justify-center rounded-full border border-white/50 bg-white/30 backdrop-blur-md">{isPlaying ? <Pause className="text-white" size={22} /> : <Play className="ml-1 text-white" size={22} />}</span>
        </button>
        <button type="button" onClick={() => setDismissed(true)} aria-label="Close floating video ad" className="absolute right-2 top-2 z-10 flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-black/60 text-white hover:bg-rose-500"><X size={16} /></button>
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black p-3">
          <span className="text-[9px] font-bold uppercase tracking-widest text-cyan-300">Sponsored video</span>
          <p className="line-clamp-1 text-sm font-medium text-white">Live: Product Keynote 2026</p>
        </div>
      </div>
    </>
  );
};

export const CarouselAd = () => {
  const slides = [
    { title: 'Performance', color: 'from-rose-500 to-orange-400' },
    { title: 'Analytics', color: 'from-blue-500 to-cyan-400' },
    { title: 'Growth', color: 'from-emerald-500 to-teal-400' }
  ];
  return (
    <div className="my-8 w-full bg-slate-800 rounded-xl border border-slate-700 p-4">
      <div className="flex justify-between items-center mb-4 px-2">
        <span className="text-xs text-slate-400 uppercase tracking-widest">Sponsored</span>
        <span className="text-xs text-slate-400">Swipe to explore</span>
      </div>
      <div className="flex overflow-x-auto gap-4 snap-x snap-mandatory pb-4 hide-scrollbar">
        {slides.map((slide, i) => (
          <div key={slide.title} className="group relative h-56 min-w-[82%] cursor-pointer snap-center overflow-hidden rounded-lg">
            <div className={`absolute inset-0 bg-gradient-to-br ${slide.color} opacity-80 mix-blend-multiply`} />
            <div className="absolute inset-6 rounded-full border border-white/20 bg-white/10 transition-transform duration-700 group-hover:scale-110" />
            <div className="absolute inset-0 p-6 flex flex-col justify-end">
              <h3 className="text-2xl font-bold text-white mb-2">{slide.title}</h3>
              <CTA className="bg-white/20 backdrop-blur-sm border border-white/50 text-white px-4 py-2 rounded-md w-max hover:bg-white hover:text-slate-900 transition-colors inline-block">View Details</CTA>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export const ShoppableHotspots = () => {
  const [activeSpot, setActiveSpot] = useState(null);
  const spots = [
    { id: 1, top: '30%', left: '45%', title: 'Minimalist Lamp', price: '$129' },
    { id: 2, top: '65%', left: '70%', title: 'Ergonomic Chair', price: '$399' },
    { id: 3, top: '75%', left: '25%', title: 'Wool Rug', price: '$249' }
  ];
  return (
    <div className="relative h-[300px] w-full overflow-hidden rounded-xl border border-slate-700 bg-[linear-gradient(155deg,#f8fafc_0_42%,#cbd5e1_42%_47%,#475569_47%)]" role="img" aria-label="Stylized modern room">
      <div className="absolute inset-0 bg-slate-900/20 pointer-events-none" />
      <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full flex items-center gap-2 border border-white/20">
        <ShoppingCart size={14} className="text-white" />
        <span className="text-xs font-medium text-white">SPONSORED · SHOP THE LOOK</span>
      </div>
      {spots.map((spot) => (
        <div key={spot.id} className="absolute" style={{ top: spot.top, left: spot.left }} onMouseEnter={() => setActiveSpot(spot.id)} onMouseLeave={() => setActiveSpot(null)}>
          <button type="button" aria-label={`View ${spot.title}, ${spot.price}`} onClick={() => setActiveSpot(activeSpot === spot.id ? null : spot.id)} className="group relative flex h-10 w-10 cursor-pointer items-center justify-center">
            <div className="absolute w-full h-full bg-white rounded-full opacity-40 animate-ping" />
            <div className="w-3 h-3 bg-white rounded-full shadow-lg" />
          </button>
          <div className={`absolute bottom-full left-1/2 -translate-x-1/2 mb-3 bg-white text-slate-900 px-4 py-2 rounded-lg shadow-xl min-w-[140px] transition-all duration-200 ${activeSpot === spot.id ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}>
            <div className="font-bold text-sm whitespace-nowrap">{spot.title}</div>
            <div className="text-cyan-600 font-medium">{spot.price}</div>
          </div>
        </div>
      ))}
    </div>
  );
};

export const FullScreenTakeover = ({ onClose }) => (
  <div className="creative-frame-takeover absolute inset-0 z-[100] flex flex-col items-center justify-center overflow-hidden bg-slate-950 p-6 animate-fade-in pointer-events-auto sm:p-8">
    <button type="button" aria-label="Close takeover ad" onClick={onClose} className="absolute top-4 right-4 flex min-h-11 min-w-11 cursor-pointer items-center justify-center rounded-full border border-slate-700 bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white sm:top-6 sm:right-6">
      <X size={24} />
    </button>
    <div className="max-w-2xl space-y-4 text-center sm:space-y-6">
      <span className="inline-block rounded-full border border-rose-500/30 bg-rose-500/20 px-4 py-1 text-sm font-bold uppercase tracking-widest text-rose-400">Limited Time Takeover</span>
      <h2 className="bg-gradient-to-r from-rose-400 to-orange-500 bg-clip-text text-3xl font-black leading-tight text-transparent sm:text-5xl">Command Attention.</h2>
      <p className="text-base text-slate-300 sm:text-xl">High-impact, immersive experiences that guarantee 100% share of voice.</p>
      <div className="flex flex-wrap justify-center gap-3 pt-4 sm:gap-4 sm:pt-8">
        <CTA className="rounded-full bg-gradient-to-r from-rose-500 to-orange-500 px-8 py-3 text-base font-bold text-white shadow-lg transition-all hover:from-rose-400 hover:to-orange-400 sm:px-12 sm:py-4 sm:text-lg">Explore Features</CTA>
        <button type="button" onClick={onClose} className="rounded-full border border-slate-600 bg-transparent px-6 py-3 text-base font-bold text-slate-300 transition-colors hover:bg-slate-800 sm:px-8 sm:py-4 sm:text-lg">Return to Site</button>
      </div>
    </div>
  </div>
);

export const PushNotification = ({ onClose }) => (
  <div className="pointer-events-auto absolute left-3 right-3 top-3 z-50 flex gap-3 rounded-xl border border-slate-600 bg-slate-800 p-4 shadow-2xl sm:left-auto sm:right-6 sm:top-6 sm:w-80">
    <div className="flex-shrink-0 pt-1">
      <div className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center text-blue-400"><BellRing size={20} /></div>
    </div>
    <div className="flex-grow">
      <div className="flex justify-between items-start mb-1">
        <h4 className="font-bold text-white text-sm">New Message</h4>
        <button type="button" aria-label="Dismiss notification ad" onClick={onClose} className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full text-slate-400 hover:bg-slate-700 hover:text-white"><X size={16} /></button>
      </div>
      <p className="text-xs text-slate-300 mb-3">Your personalized offer is ready. Claim your 50% discount now.</p>
      <CTA className="text-xs font-bold bg-blue-500 text-white px-3 py-1.5 rounded hover:bg-blue-400 transition-colors shadow-md inline-block">View Offer</CTA>
    </div>
  </div>
);

export const AnchorAd = () => {
  const [visible, setVisible] = useState(true);
  if (!visible) return null;
  return (
  <aside className="group pointer-events-auto absolute bottom-4 left-3 right-3 z-50 flex items-center gap-3 rounded-xl border border-slate-600 bg-slate-800 p-3 shadow-2xl transition-colors hover:bg-slate-700 sm:bottom-6 sm:left-auto sm:right-6 sm:w-72">
    <div className="w-12 h-12 bg-indigo-500 rounded-lg flex items-center justify-center text-white shrink-0">
      <MoveRight className="group-hover:translate-x-1 transition-transform" />
    </div>
    <div className="flex-grow">
      <div className="mb-1 text-[10px] font-bold uppercase tracking-wider text-indigo-400">Sponsored · Next Article</div>
      <CTA className="block text-sm font-medium leading-tight text-white hover:text-indigo-200">The Future of Cookie-less Targeting</CTA>
    </div>
    <button type="button" aria-label="Dismiss anchor ad" onClick={(event) => { event.stopPropagation(); setVisible(false); }} className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full text-slate-400 hover:bg-slate-600 hover:text-white"><X size={16} /></button>
  </aside>
  );
};

export const DoubleXClose = () => {
  const [stage, setStage] = useState(0);
  if (stage === 2) return null;
  return (
    <div className="my-8 w-full bg-rose-950/40 border border-rose-900 rounded-lg p-6 relative overflow-hidden text-center flex flex-col items-center justify-center min-h-[150px]">
      <AlertCircle className="text-rose-500 mb-2 opacity-50" size={32} />
      <h3 className="text-white font-bold text-lg mb-1">Don&apos;t Miss Out!</h3>
      <p className="text-rose-200/70 text-sm">A two-step close confirms before dismissing this experimental ad.</p>
      {stage === 0 && (
        <button type="button" aria-label="Start closing ad" className="absolute right-2 top-2 flex h-10 w-10 cursor-pointer items-center justify-center rounded-full text-rose-300 hover:bg-rose-900 hover:text-white" onClick={() => setStage(1)}><X size={18} /></button>
      )}
      {stage === 1 && (
        <button type="button" className="absolute right-3 top-3 cursor-pointer rounded-lg bg-white px-3 py-2 text-xs font-bold text-rose-900 hover:bg-rose-100" onClick={() => setStage(2)}>Confirm close</button>
      )}
    </div>
  );
};

export const CountdownAd = () => {
  const [timeLeft, setTimeLeft] = useState(3600);
  useEffect(() => {
    const timer = setInterval(() => setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0)), 1000);
    return () => clearInterval(timer);
  }, []);
  const formatTime = (s) => `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;
  return (
    <div className="my-8 w-full bg-gradient-to-r from-amber-500 to-orange-600 rounded-xl p-6 text-white flex flex-col md:flex-row items-center justify-between shadow-lg relative overflow-hidden">
      <div className="flex items-center gap-4 z-10 mb-4 md:mb-0">
        <div className="bg-black/20 p-3 rounded-full"><Timer size={24} /></div>
        <div>
          <span className="text-[9px] font-bold uppercase tracking-widest text-orange-100">Sponsored flash sale</span>
          <h3 className="mb-1 text-xl font-bold leading-none">Flash Sale Ending Soon!</h3>
          <p className="text-orange-100 text-sm">Use code FLASH50 at checkout.</p>
        </div>
      </div>
      <div className="flex items-center gap-6 z-10">
        <div className="font-mono text-4xl font-black tracking-widest bg-black/20 px-4 py-2 rounded-lg">{formatTime(timeLeft)}</div>
        <CTA className="bg-white text-orange-600 font-bold py-3 px-6 rounded-lg shadow-md hover:bg-orange-50 transition-colors whitespace-nowrap">Shop Now</CTA>
      </div>
    </div>
  );
};

export const MarqueeTicker = () => (
  <div className="absolute top-0 left-0 right-0 bg-cyan-600 text-white overflow-hidden whitespace-nowrap flex items-center h-10 z-40 pointer-events-auto shadow-md">
    <div className="animate-marquee-wide inline-block font-bold text-sm tracking-widest">
      SPONSORED • NEW PROGRAMMATIC AD FORMATS LAUNCHED • INCREASE ROI BY 300% • TRY INTERACTIVE TEMPLATES TODAY •
      SPONSORED • NEW PROGRAMMATIC AD FORMATS LAUNCHED • INCREASE ROI BY 300% • TRY INTERACTIVE TEMPLATES TODAY •
    </div>
  </div>
);

export const PeelBackCorner = () => (
  <div className="pointer-events-none absolute right-0 top-0 z-50 h-64 w-64 overflow-hidden">
    <div className="group absolute right-0 top-0 flex h-64 w-64 translate-x-32 -translate-y-32 cursor-pointer flex-col items-end rounded-bl-3xl bg-gradient-to-bl from-rose-500 to-orange-500 p-4 font-bold text-white shadow-[inset_0_0_20px_rgba(0,0,0,0.3)] transition-transform duration-500 hover:translate-x-0 hover:translate-y-0 focus-within:translate-x-0 focus-within:translate-y-0 pointer-events-auto">
      <div className="mt-16 mr-12 text-right">
        <span className="block text-[9px] uppercase tracking-widest">Sponsored</span>
        <span className="block text-2xl drop-shadow-md">Surprise!</span>
        <span className="block text-sm font-normal">You found the secret offer.</span>
        <CTA className="mt-2 inline-block rounded bg-white px-3 py-2 text-xs text-rose-600 shadow">Reveal</CTA>
      </div>
    </div>
  </div>
);

export const RotatingCubeAd = ({ scrollAreaRef }) => {
  const [rot, setRot] = useState({ x: -20, y: 45 });
  const ref = useRef(null);
  useEffect(() => {
    const el = scrollAreaRef?.current;
    const target = el || window;
    const handleScroll = () => {
      if (!ref.current) return;
      const rect = ref.current.getBoundingClientRect();
      const scrollRect = el?.getBoundingClientRect() || { bottom: document.documentElement.clientHeight, height: document.documentElement.clientHeight };
      const progress = (scrollRect.bottom - rect.top) / Math.max(scrollRect.height, 1);
      setRot({ x: -20 + progress * 180, y: 45 + progress * 90 });
    };
    handleScroll();
    target.addEventListener('scroll', handleScroll, { passive: true });
    return () => target.removeEventListener('scroll', handleScroll);
  }, [scrollAreaRef]);
  const faces = [
    { side: 'Exclusive', transform: 'rotateY(0deg) translateZ(80px)', bg: 'bg-gradient-to-br from-rose-500 to-orange-500' },
    { side: 'Offers', transform: 'rotateY(180deg) translateZ(80px)', bg: 'bg-gradient-to-br from-blue-500 to-cyan-500' },
    { side: 'Inside', transform: 'rotateY(90deg) translateZ(80px)', bg: 'bg-gradient-to-br from-emerald-500 to-teal-500' },
    { side: 'Click', transform: 'rotateY(-90deg) translateZ(80px)', bg: 'bg-gradient-to-br from-amber-500 to-orange-500' },
    { side: 'Now', transform: 'rotateX(90deg) translateZ(80px)', bg: 'bg-gradient-to-br from-purple-500 to-indigo-500' },
    { side: '3D Ad', transform: 'rotateX(-90deg) translateZ(80px)', bg: 'bg-gradient-to-br from-slate-700 to-slate-900' },
  ];
  return (
    <div className="relative flex h-[300px] w-full flex-col items-center justify-center overflow-hidden rounded-xl border border-slate-800 bg-slate-900 shadow-inner" style={{ perspective: '800px' }}>
      <span className="absolute left-4 top-4 text-[10px] font-mono text-slate-400">SPONSORED · SCROLL TO ROTATE</span>
      <div ref={ref} className="preserve-3d relative h-[160px] w-[160px] cursor-pointer transition-transform duration-75 ease-out hover:scale-105" style={{ transform: `rotateX(${rot.x}deg) rotateY(${rot.y}deg)` }}>
        {faces.map((f, i) => (
          <div key={i} className={`absolute w-full h-full ${f.bg} opacity-95 border border-white/30 flex items-center justify-center shadow-[inset_0_0_40px_rgba(0,0,0,0.3)] backdrop-blur-sm`} style={{ transform: f.transform, backfaceVisibility: 'hidden' }}>
            <div className="text-white font-black text-2xl drop-shadow-lg flex flex-col items-center">
              <Box size={24} className="mb-2 opacity-50" />
              {f.side}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export const AIBotOverlay = () => {
  const [open, setOpen] = useState(false);
  return (
    <div className={`absolute bottom-6 left-6 z-50 flex flex-col items-start gap-4 pointer-events-auto transition-all duration-300 ${open ? 'translate-y-0' : 'translate-y-2'}`}>
      {open && (
        <div className="w-72 bg-slate-800 border border-slate-600 rounded-2xl shadow-2xl overflow-hidden animate-fade-in-up origin-bottom-left">
          <div className="bg-indigo-600 p-4 text-white flex justify-between items-center">
            <div className="flex items-center gap-2 font-bold"><Bot size={18} /> Sponsored · Affinity AI</div>
            <button type="button" aria-label="Close AI assistant" onClick={() => setOpen(false)} className="flex h-9 w-9 cursor-pointer items-center justify-center rounded hover:bg-indigo-500"><X size={16} /></button>
          </div>
          <div className="p-4 bg-slate-900 text-sm">
            <p className="text-slate-300 mb-4 bg-slate-800 p-3 rounded-lg rounded-tl-none inline-block">Looking for an enterprise DSP solution?</p>
            <div className="flex flex-col gap-2">
              <CTA className="border border-indigo-500 text-indigo-400 hover:bg-indigo-500 hover:text-white px-3 py-2 rounded-lg transition-colors text-left">Yes, show me features</CTA>
              <button type="button" onClick={() => setOpen(false)} className="cursor-pointer rounded-lg border border-slate-600 px-3 py-2 text-left text-slate-400 transition-colors hover:bg-slate-700 hover:text-white">No, just browsing</button>
            </div>
          </div>
        </div>
      )}
      <button type="button" aria-label={open ? 'Close AI commerce assistant' : 'Open AI commerce assistant'} aria-expanded={open} onClick={() => setOpen(!open)} className="relative flex h-14 w-14 cursor-pointer items-center justify-center rounded-full bg-indigo-600 text-white shadow-lg transition-transform hover:scale-110 hover:bg-indigo-500">
        <MessageCircle size={24} className={open ? 'hidden' : 'block'} />
        <X size={24} className={open ? 'block' : 'hidden'} />
        {!open && <span className="absolute -top-1 -right-1 w-3 h-3 bg-rose-500 rounded-full border-2 border-slate-900 animate-pulse" />}
      </button>
    </div>
  );
};

export const ScrollMorphBanner = ({ scrollAreaRef }) => {
  const [ref, ratio] = useScrollReveal(scrollAreaRef);
  const scale = 0.85 + ratio * 0.15;
  const borderRadius = 40 - ratio * 24;
  const opacity = 0.4 + ratio * 0.6;
  return (
    <div className="perspective-1000 relative flex h-[280px] w-full items-center justify-center overflow-hidden">
      <div ref={ref} className="group relative flex h-full w-full cursor-pointer flex-col items-center justify-center overflow-hidden bg-gradient-to-r from-purple-600 via-fuchsia-600 to-orange-500 p-6 text-center shadow-2xl transition-all duration-75 ease-out" style={{ transform: `scale(${scale})`, borderRadius: `${borderRadius}px`, opacity }}>
        <span className="mb-2 text-[10px] font-bold uppercase tracking-widest text-white/80">Sponsored motion</span>
        <Sparkles className="mb-3 text-white/80 drop-shadow-md" size={32} />
        <h3 className="mb-2 text-3xl font-black tracking-tight text-white drop-shadow-md">Scroll-Adaptive Ad</h3>
        <p className="max-w-md text-sm font-medium text-white/90 drop-shadow">Changes shape and scale as it reaches the center of the frame.</p>
      </div>
    </div>
  );
};

export const ParallaxDepthAd = () => {
  const [mouse, setMouse] = useState({ x: 0, y: 0 });
  const handleMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMouse({ x: (e.clientX - rect.left - rect.width / 2) / 25, y: (e.clientY - rect.top - rect.height / 2) / 25 });
  };
  return (
    <div className="perspective-1000 relative h-[300px] w-full cursor-crosshair overflow-hidden rounded-xl border border-slate-700 bg-slate-900 shadow-2xl" onMouseMove={handleMove} onMouseLeave={() => setMouse({ x: 0, y: 0 })}>
      <div className="absolute inset-[-60px] bg-[radial-gradient(circle_at_70%_25%,#06b6d4,transparent_22%),radial-gradient(circle_at_30%_70%,#7c3aed,transparent_26%),linear-gradient(135deg,#020617,#172554)] opacity-80 transition-transform duration-200 ease-out" style={{ transform: `translate(${mouse.x * 0.5}px, ${mouse.y * 0.5}px) scale(1.1)` }} />
      <div className="absolute inset-0 flex flex-col items-center justify-center transition-transform duration-200 ease-out pointer-events-none" style={{ transform: `translate(${mouse.x * -2.5}px, ${mouse.y * -2.5}px)` }}>
        <span className="text-[10px] font-bold uppercase tracking-widest text-cyan-200">Sponsored</span>
        <h3 className="text-5xl font-black tracking-tighter text-white drop-shadow-[0_15px_25px_rgba(0,0,0,0.8)]">DEPTH.</h3>
        <p className="text-cyan-300 font-bold mt-2 drop-shadow-md uppercase tracking-widest text-sm">True Parallax Unit</p>
        <CTA className="mt-8 bg-cyan-500 text-slate-950 px-8 py-3 rounded-full font-bold shadow-lg pointer-events-auto hover:bg-white hover:scale-105 transition-all">Interact</CTA>
      </div>
    </div>
  );
};

export const ContextualHighlightUnit = () => {
  const [open, setOpen] = useState(false);
  return (
  <div className="rounded-xl border border-slate-700/50 bg-slate-800/30 p-5">
    <span className="mb-3 block text-[10px] font-mono text-slate-500">SPONSORED CONTEXTUAL DEMO</span>
    <p className="relative inline-block font-serif text-base leading-relaxed text-slate-300">
      We noticed that{' '}
      <span className="relative inline-block">
        <button type="button" aria-expanded={open} onClick={() => setOpen((value) => !value)} className="cursor-pointer border-b-2 border-dashed border-cyan-400/50 text-cyan-400 transition-colors hover:bg-cyan-900/30">
          programmatic buying
        </button>
      </span>
      {' '}has increased significantly in the last quarter.
    </p>
    {open && (
      <div className="mt-3 rounded-xl border border-slate-600 bg-slate-800 p-4 font-sans shadow-xl">
        <span className="mb-2 flex items-center gap-2 text-sm font-bold text-cyan-400"><TrendingUp size={16} /> Market Insight</span>
        <span className="mb-3 block text-xs text-slate-200">Programmatic spending is expected to increase by 40% next year.</span>
        <CTA className="block w-full rounded bg-cyan-500 py-2 text-center text-sm font-bold text-slate-950 shadow hover:bg-cyan-400">View Platform</CTA>
      </div>
    )}
  </div>
  );
};

export const AIChatMiniAssistant = () => {
  const [messages, setMessages] = useState([{ sender: 'bot', text: 'Hi! Looking for creative ad templates?' }]);
  const [typing, setTyping] = useState(false);
  const replyTimerRef = useRef(null);
  useEffect(() => () => {
    if (replyTimerRef.current) clearTimeout(replyTimerRef.current);
  }, []);
  const handleReply = (text, responseText) => {
    if (typing) return;
    setMessages((prev) => [...prev, { sender: 'user', text }]);
    setTyping(true);
    replyTimerRef.current = setTimeout(() => {
      setTyping(false);
      setMessages((prev) => [...prev, { sender: 'bot', text: responseText }]);
      replyTimerRef.current = null;
    }, 1000);
  };
  return (
    <div className="flex h-[300px] w-full flex-col overflow-hidden rounded-xl border border-slate-700 bg-slate-900 shadow-xl">
      <div className="bg-slate-800 px-4 py-3 border-b border-slate-700 flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400"><Bot size={16} /></div>
        <div>
          <h4 className="text-sm font-bold text-white">Sponsored Ad Assistant</h4>
          <span className="text-[10px] text-emerald-400 flex items-center gap-1"><div className="w-1.5 h-1.5 bg-emerald-400 rounded-full" /> Online</span>
        </div>
      </div>
      <div className="flex-grow p-4 overflow-y-auto custom-scrollbar flex flex-col gap-3">
        {messages.map((m, i) => (
          <div key={`${m.sender}-${i}-${m.text}`} className={`max-w-[80%] p-3 rounded-xl text-sm ${m.sender === 'bot' ? 'bg-slate-800 text-slate-200 self-start rounded-tl-sm' : 'bg-cyan-600 text-white self-end rounded-tr-sm'}`}>{m.text}</div>
        ))}
        {typing && <div className="bg-slate-800 self-start p-3 rounded-xl rounded-tl-sm flex gap-1 items-center"><span className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce" /><span className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '75ms' }} /><span className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} /></div>}
      </div>
      <div className="p-3 border-t border-slate-700 bg-slate-900 flex gap-2 overflow-x-auto hide-scrollbar">
        <button type="button" onClick={() => handleReply('Show me Video Ads', 'We have Outstream, Floating PiP, and Reward videos.')} className="whitespace-nowrap px-4 py-2 bg-slate-800 hover:bg-slate-700 text-cyan-400 text-xs font-bold rounded-full border border-slate-700 transition-colors">Show me Video Ads</button>
        <button type="button" onClick={() => handleReply("What's Agentic?", "Agentic ads use real-time AI. Try the Agentic format!")} className="whitespace-nowrap px-4 py-2 bg-slate-800 hover:bg-slate-700 text-cyan-400 text-xs font-bold rounded-full border border-slate-700 transition-colors">What&apos;s Agentic?</button>
      </div>
    </div>
  );
};

export const SplitScreenSlider = () => {
  const [splitPos, setSplitPos] = useState(50);
  const containerRef = useRef(null);
  const handleMove = (e) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    setSplitPos((x / rect.width) * 100);
  };
  return (
    <div ref={containerRef} className="relative h-[300px] w-full cursor-ew-resize touch-none select-none overflow-hidden rounded-xl border border-slate-700 bg-gradient-to-br from-rose-400 to-orange-950 shadow-xl" onMouseMove={handleMove} onTouchMove={handleMove}>
      <span className="absolute bottom-4 right-4 text-[10px] font-bold uppercase tracking-widest text-white">Sponsored comparison</span>
      <div className="absolute top-4 right-4 bg-rose-500 text-white text-xs font-bold px-3 py-1 rounded shadow-lg backdrop-blur z-0">V2.0 Pro</div>
      <div className="absolute inset-0 z-10" style={{ clipPath: `inset(0 ${100 - splitPos}% 0 0)` }}>
        <div className="absolute inset-0 bg-gradient-to-br from-slate-300 via-slate-500 to-slate-950 opacity-90" />
        <div className="absolute top-4 left-4 bg-slate-800 text-white text-xs font-bold px-3 py-1 rounded shadow-lg backdrop-blur">Classic</div>
      </div>
      <div className="absolute top-0 bottom-0 w-1 bg-white shadow-lg z-20" style={{ left: `${splitPos}%`, transform: 'translateX(-50%)' }}>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-white rounded-full shadow-2xl flex items-center justify-center border-2 border-slate-200">
          <ArrowLeftRight size={18} className="text-slate-900" />
        </div>
      </div>
    </div>
  );
};

export const MicroCheckoutCommerce = () => {
  const [step, setStep] = useState(0);
  const [color, setColor] = useState('Black');
  const checkoutTimerRef = useRef(null);
  useEffect(() => () => {
    if (checkoutTimerRef.current) clearTimeout(checkoutTimerRef.current);
  }, []);
  const handleBuy = () => {
    setStep(1);
    checkoutTimerRef.current = setTimeout(() => {
      setStep(2);
      checkoutTimerRef.current = null;
    }, 2000);
  };
  return (
    <div className="flex h-[300px] w-full overflow-hidden rounded-xl border border-slate-700 bg-slate-800 shadow-xl">
      <div className="hidden w-2/5 items-center justify-center bg-[radial-gradient(circle,#f8fafc_0_12%,#94a3b8_13%_18%,transparent_19%),linear-gradient(135deg,#334155,#0f172a)] sm:flex" role="img" aria-label="Minimalist watch illustration" />
      <div className="relative flex min-w-0 flex-1 flex-col justify-center bg-slate-900 p-5">
        {step === 0 && (
          <div className="animate-fade-in">
            <span className="mb-1 block text-xs font-bold uppercase tracking-widest text-amber-500">Sponsored · Limited Drop</span>
            <h3 className="text-2xl font-bold text-white mb-2">Minimalist Watch</h3>
            <p className="text-slate-400 text-sm mb-4">In-ad commerce. Buy directly from the page.</p>
            <div className="flex gap-2 mb-6">
              {['Black', 'Silver', 'Rose'].map((c) => <button key={c} type="button" aria-pressed={color === c} onClick={() => setColor(c)} className={`cursor-pointer rounded border px-3 py-1 text-xs transition-colors ${color === c ? 'border-white bg-white text-slate-900' : 'border-slate-600 text-slate-300 hover:border-white hover:text-white'}`}>{c}</button>)}
            </div>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-light text-white">$149</span>
              <button type="button" onClick={handleBuy} className="flex cursor-pointer items-center gap-2 rounded bg-white px-5 py-2 font-bold text-slate-900 hover:bg-slate-200"><CreditCard size={16} /> Buy Now</button>
            </div>
          </div>
        )}
        {step === 1 && (
          <div className="flex flex-col items-center justify-center h-full animate-fade-in">
            <div className="w-12 h-12 border-4 border-slate-700 border-t-cyan-500 rounded-full animate-spin mb-4" />
            <p className="text-slate-300 font-medium text-sm">Processing Payment securely...</p>
          </div>
        )}
        {step === 2 && (
          <div className="flex flex-col items-center justify-center h-full animate-fade-in">
            <CheckCircle size={48} className="text-emerald-500 mb-4" />
            <h3 className="text-xl font-bold text-white mb-1">Order Confirmed</h3>
            <p className="text-slate-400 text-sm">Receipt sent to your email.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export const LiveDataAdaptiveAd = () => {
  const [weather, setWeather] = useState('sunny');
  useEffect(() => {
    const i = setInterval(() => setWeather((w) => (w === 'sunny' ? 'rainy' : 'sunny')), 3000);
    return () => clearInterval(i);
  }, []);
  const isSun = weather === 'sunny';
  return (
    <div className={`relative flex h-[250px] w-full items-center overflow-hidden rounded-xl border border-slate-700 px-4 transition-colors duration-1000 ${isSun ? 'bg-amber-950' : 'bg-blue-950'}`}>
      <div className={`absolute top-4 right-4 flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-mono border ${isSun ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' : 'bg-blue-500/20 text-blue-400 border-blue-500/30'}`}>
        <Activity size={12} className="animate-pulse" /> SPONSORED · LIVE WEATHER
      </div>
      <div className="flex items-center gap-6 w-full relative z-10">
        <div className={`w-24 h-24 md:w-32 md:h-32 rounded-full flex items-center justify-center transition-all duration-1000 shrink-0 ${isSun ? 'bg-gradient-to-br from-amber-400 to-orange-500' : 'bg-gradient-to-br from-blue-400 to-indigo-600'}`}>
          {isSun ? <Sun size={48} className="text-white" /> : <CloudRain size={48} className="text-white animate-bounce" />}
        </div>
        <div className="flex-grow">
          <h3 className="text-2xl md:text-3xl font-bold text-white mb-2">{isSun ? 'Hot Day Ahead.' : 'Looks Like Rain.'}</h3>
          <p className="text-slate-300 text-sm md:text-base mb-4 md:mb-6">{isSun ? 'Stay refreshed with our summer citrus blend.' : 'Cozy up with our premium roasted coffee.'}</p>
          <CTA className={`px-6 py-2 rounded font-bold text-slate-900 transition-colors shadow-lg inline-block ${isSun ? 'bg-amber-400 hover:bg-amber-300' : 'bg-blue-400 hover:bg-blue-300'}`}>Order Delivery</CTA>
        </div>
      </div>
    </div>
  );
};

export const AmbientTakeover = () => (
  <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden mix-blend-screen" aria-label="Sponsored ambient brand treatment">
    <div className="absolute inset-0 border-[20px] border-cyan-500/10 shadow-[inset_0_0_150px_rgba(6,182,212,0.15)] animate-pulse" />
    <div className="absolute -top-40 -right-40 w-[600px] h-[600px] bg-cyan-500/5 rounded-full blur-[100px] animate-pulse" />
    <div className="absolute -bottom-40 -left-40 w-[600px] h-[600px] bg-purple-500/5 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '500ms' }} />
  </div>
);

export const SideRailDock = () => (
  <div className="pointer-events-auto absolute right-0 top-1/4 z-50 flex max-w-[40%] flex-col items-end gap-2 pr-1 sm:top-1/3 sm:max-w-none sm:pr-2">
    {['Deals', 'Video', 'Shop'].map((label) => (
      <button type="button" aria-label={`Open sponsored ${label}`} key={label} className="group relative flex h-12 w-12 cursor-pointer items-center justify-end overflow-hidden rounded-l-xl border border-slate-600 bg-slate-800 px-3 shadow-2xl transition-all duration-300 ease-out hover:w-32 focus:w-32">
        <span className="text-white font-bold text-sm whitespace-nowrap opacity-0 group-hover:opacity-100 absolute left-4 transition-opacity duration-300 delay-100">{label}</span>
        <ChevronLeft size={18} className="text-slate-400 group-hover:text-white shrink-0" />
      </button>
    ))}
  </div>
);

export const InfiniteStickyRibbon = () => (
  <div className="absolute top-14 left-0 right-0 bg-indigo-600 text-white overflow-hidden flex items-center h-12 z-40 pointer-events-auto shadow-xl border-b border-indigo-500">
    <div className="animate-marquee-wide inline-flex items-center gap-8 whitespace-nowrap px-4">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded bg-white/20 text-[8px] font-bold">AD</div>
          <span className="font-medium text-sm">Sneaker X - $120</span>
          <CTA className="bg-white text-indigo-900 text-xs px-2 py-1 rounded font-bold hover:bg-indigo-50">Buy</CTA>
        </div>
      ))}
    </div>
  </div>
);

export const GestureUnlockAd = () => {
  const [val, setVal] = useState(0);
  const unlocked = val >= 99;
  return (
    <div className="relative flex h-56 w-full flex-col items-center justify-center overflow-hidden rounded-xl border border-slate-700 bg-slate-900 p-5 shadow-xl">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_25%,rgba(34,211,238,.25),transparent_25%),radial-gradient(circle_at_75%_75%,rgba(124,58,237,.3),transparent_30%)]" />
      {unlocked ? (
        <div className="animate-fade-in text-center relative z-10">
          <div className="w-16 h-16 bg-emerald-500/20 border border-emerald-500/50 rounded-full flex items-center justify-center mx-auto mb-3 text-emerald-400">
            <Unlock size={32} />
          </div>
          <h3 className="text-white font-black text-2xl tracking-tight mb-2">Offer Unlocked!</h3>
          <CTA className="mt-2 bg-emerald-500 text-slate-900 px-6 py-2 rounded-full font-bold shadow-lg hover:bg-emerald-400 transition-colors inline-block">Claim 30% Off</CTA>
        </div>
      ) : (
        <div className="w-full max-w-sm text-center relative z-10">
          <span className="mb-1 block text-[9px] font-bold uppercase tracking-widest text-cyan-400">Sponsored reward</span>
          <h3 className="mb-5 text-lg font-bold text-white">Slide to Reveal Exclusive Offer</h3>
          <div className="relative w-full h-14 bg-slate-800 rounded-full border border-slate-600 shadow-inner overflow-hidden flex items-center px-1">
            <div className="absolute top-0 bottom-0 left-0 bg-gradient-to-r from-cyan-600 to-blue-500 pointer-events-none transition-all" style={{ width: `${val}%` }} />
            <span className="absolute inset-0 flex items-center justify-center text-slate-400 text-sm font-medium pointer-events-none">Swipe Right →</span>
            <input type="range" min="0" max="100" value={val} onChange={(e) => setVal(Number(e.target.value))} aria-label="Slide to unlock sponsored offer" className="absolute inset-0 z-20 h-full w-full cursor-ew-resize opacity-0" />
            <div className="absolute h-12 w-16 bg-white rounded-full shadow-lg flex items-center justify-center pointer-events-none z-10 border-2 border-slate-200" style={{ left: `calc(${val}% - ${val * 0.16}px)` }}>
              <MoveRight size={20} className="text-slate-900" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const GRID_COLS = 10;
const GRID_ROWS = 10;
const TOTAL_BLOCKS = GRID_COLS * GRID_ROWS;

export const ScratchCardReward = () => {
  const containerRef = useRef(null);
  const draggingRef = useRef(false);
  const [scratched, setScratched] = useState(() => new Set());
  const scratchedCount = scratched.size;
  const scratchedArray = Array.from({ length: TOTAL_BLOCKS }, (_, i) => scratched.has(i));
  const getCellIndex = (clientX, clientY) => {
    if (!containerRef.current) return -1;
    const rect = containerRef.current.getBoundingClientRect();
    const relX = clientX - rect.left;
    const relY = clientY - rect.top;
    if (relX < 0 || relY < 0 || relX > rect.width || relY > rect.height) return -1;
    const col = Math.min(Math.floor((relX / rect.width) * GRID_COLS), GRID_COLS - 1);
    const row = Math.min(Math.floor((relY / rect.height) * GRID_ROWS), GRID_ROWS - 1);
    return row * GRID_COLS + col;
  };
  const scratchAt = (clientX, clientY) => {
    const idx = getCellIndex(clientX, clientY);
    if (idx >= 0) setScratched((prev) => new Set([...prev, idx]));
  };
  const handlePointerDown = (e) => { draggingRef.current = true; scratchAt(e.clientX, e.clientY); };
  const handlePointerMove = (e) => { if (draggingRef.current) scratchAt(e.clientX, e.clientY); };
  const handlePointerUp = () => { draggingRef.current = false; };
  const handlePointerLeave = () => { draggingRef.current = false; };
  const handleTouchStart = (e) => { draggingRef.current = true; scratchAt(e.touches[0].clientX, e.touches[0].clientY); };
  const handleTouchMove = (e) => { if (draggingRef.current) scratchAt(e.touches[0].clientX, e.touches[0].clientY); };
  const handleTouchEnd = () => { draggingRef.current = false; };
  return (
    <div className="relative h-[300px] w-full touch-none select-none overflow-hidden rounded-xl border-2 border-slate-600 shadow-2xl">
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900 to-indigo-900 text-white flex flex-col items-center justify-center">
        <Star size={48} className="text-amber-400 mb-4" />
        <h3 className="text-3xl font-black tracking-tight mb-2">You Won!</h3>
        <p className="text-purple-200 mb-4 font-medium">Sponsored reward · code SCRATCH50</p>
        <CTA className={`bg-white text-indigo-900 px-6 py-2 rounded font-bold shadow-lg transition-all inline-block ${scratchedCount > 40 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}>Shop Now</CTA>
      </div>
      <div
        ref={containerRef}
        className={`absolute inset-0 grid transition-opacity duration-1000 ${scratchedCount > 60 ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
        style={{ gridTemplateColumns: `repeat(${GRID_COLS}, 1fr)`, gridTemplateRows: `repeat(${GRID_ROWS}, 1fr)` }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerLeave}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {scratchedArray.map((isScratched, i) => (
          <div key={i} className={`border border-slate-600 transition-opacity duration-300 cursor-crosshair ${isScratched ? 'opacity-0 pointer-events-none' : 'opacity-100 bg-slate-500'}`} />
        ))}
      </div>
      {scratchedCount === 0 && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-white/50 font-bold text-2xl tracking-widest uppercase">Scratch Here (drag on desktop)</div>
      )}
    </div>
  );
};

export const CinematicStoryAd = ({ scrollAreaRef }) => {
  const [ref, progress] = useScrollReveal(scrollAreaRef);
  const active = Math.min(2, Math.floor(progress * 3));
  const scenes = [
    { title: 'Pace.', copy: 'Designed for speed. Engineered for comfort.', color: 'from-rose-600 via-orange-700 to-slate-950' },
    { title: 'Style.', copy: 'Stand out from the crowd.', color: 'from-blue-500 via-indigo-700 to-slate-950' },
    { title: 'Yours.', copy: 'Built around the way you move.', color: 'from-emerald-500 via-teal-700 to-slate-950' },
  ];
  return (
    <div ref={ref} className={`relative h-[300px] w-full overflow-hidden rounded-xl border border-white/20 bg-gradient-to-br ${scenes[active].color} shadow-2xl transition-colors duration-500`}>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_25%,rgba(255,255,255,.28),transparent_20%),linear-gradient(transparent,rgba(2,6,23,.75))]" />
      <div className="relative flex h-full flex-col justify-between p-5">
        <div className="flex items-center justify-between"><span className="text-[10px] font-bold uppercase tracking-widest text-white/80">Sponsored cinematic story</span><span className="text-xs font-bold text-white">{active + 1}/3</span></div>
        <div>
          <h3 className="mb-2 text-4xl font-black text-white">{scenes[active].title}</h3>
          <p className="mb-4 text-sm text-white/85">{scenes[active].copy}</p>
          {active === 2 && <CTA className="inline-block rounded-full bg-white px-6 py-2.5 text-sm font-bold text-slate-900 shadow-lg hover:bg-emerald-100">Build Your Custom Pair</CTA>}
          <div className="mt-4 flex gap-2">{scenes.map((scene, index) => <span key={scene.title} className={`h-1.5 flex-1 rounded-full ${index <= active ? 'bg-white' : 'bg-white/25'}`} />)}</div>
        </div>
      </div>
    </div>
  );
};

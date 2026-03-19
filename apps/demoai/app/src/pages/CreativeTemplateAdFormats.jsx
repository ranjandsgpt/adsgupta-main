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

export const AD_FORMATS = [
  { id: 'interscroller', name: 'Interscroller (Full Reveal)', type: 'inline' },
  { id: 'sticky-footer', name: 'Sticky Footer Banner', type: 'overlay' },
  { id: 'sticky-top', name: 'Sticky Top Leaderboard', type: 'overlay' },
  { id: 'anchor', name: 'Anchor Ad (Sticky Corner)', type: 'overlay' },
  { id: 'takeover', name: 'Full-Screen Takeover', type: 'overlay' },
  { id: 'playable', name: 'Playable Mini', type: 'inline' },
  { id: 'agentic', name: 'Agentic AI Optimization', type: 'inline' },
  { id: 'swipeable', name: 'Swipeable Card Stack', type: 'inline' },
  { id: 'floating-video', name: 'Floating Video (PiP)', type: 'inline' },
  { id: 'outstream', name: 'Outstream Video', type: 'inline' },
  { id: 'quiz', name: 'Interactive Quiz / Poll', type: 'inline' },
  { id: 'progress', name: 'Progress Bar (View Time)', type: 'inline' },
  { id: 'shoppable', name: 'Shoppable Hotspots', type: 'inline' },
  { id: 'expandable', name: 'Expandable Banner', type: 'inline' },
  { id: 'carousel', name: 'Carousel Multi-Slide', type: 'inline' },
  { id: 'push', name: 'Push-Style Notification', type: 'overlay' },
  { id: 'double-x', name: 'Double X for Close', type: 'inline' },
  { id: 'countdown', name: 'Countdown Timer Ad', type: 'inline' },
  { id: 'marquee', name: 'Marquee Ticker', type: 'overlay' },
  { id: 'peel-back', name: 'Corner Curl / Peel-Back', type: 'overlay' },
  { id: '3d-cube', name: 'Floating 3D Rotating Cube', type: 'inline' },
  { id: 'ai-bot', name: 'Floating AI Commerce Bot', type: 'overlay' },
  { id: 'scroll-morph', name: 'Scroll-Morphing Banner', type: 'inline' },
  { id: 'parallax', name: 'Parallax Depth Ad', type: 'inline' },
  { id: 'contextual', name: 'Contextual Highlight Unit', type: 'inline' },
  { id: 'ai-chat', name: 'AI Chat Mini Assistant', type: 'inline' },
  { id: 'split-screen', name: 'Split-Screen Slider', type: 'inline' },
  { id: 'micro-checkout', name: 'Micro-Checkout Commerce', type: 'inline' },
  { id: 'live-data', name: 'Live Data Adaptive Ad', type: 'inline' },
  { id: 'ambient', name: 'Ambient Brand Takeover', type: 'overlay' },
  { id: 'side-rail', name: 'Expandable Side Rail Dock', type: 'overlay' },
  { id: 'infinite-ribbon', name: 'Infinite Product Ribbon', type: 'overlay' },
  { id: 'gesture', name: 'Gesture-Based Unlock', type: 'inline' },
  { id: 'scratch-card', name: 'Reward Scratch Card', type: 'inline' },
  { id: 'cinematic', name: 'Scroll-Synced Cinematic Story', type: 'inline' }
];

const CTA = ({ href = DEMO_CTA_URL, children, className = '', ...props }) => (
  <a href={href} className={className} {...props}>{children}</a>
);

export const Interscroller = () => (
  <div className="my-16 relative w-full h-[80vh] overflow-hidden group border-y border-slate-700/50 rounded-lg" style={{ clipPath: 'inset(0)' }}>
    <div className="fixed top-0 left-0 w-full h-screen -z-10 bg-slate-950 flex flex-col justify-center items-center">
      <div className="absolute inset-0 bg-[url(\'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop\')] bg-center bg-cover opacity-60" />
      <div className="relative z-10 text-center max-w-2xl px-8 ml-0 md:ml-80">
        <span className="text-cyan-400 font-bold tracking-widest text-sm mb-4 block">IMMERSIVE REVEAL</span>
        <h3 className="text-4xl md:text-7xl font-black text-white mb-6 leading-tight drop-shadow-2xl">The True Interscroller</h3>
        <p className="text-lg md:text-xl text-slate-200 mb-8 drop-shadow-md">Seamlessly blends into the content stream. 100% share of voice without disrupting the reading experience.</p>
        <CTA className="bg-white text-slate-900 font-bold py-4 px-10 rounded-full hover:bg-cyan-400 hover:text-slate-950 transition-all duration-300 transform hover:scale-105 inline-block">Explore Collection</CTA>
      </div>
    </div>
  </div>
);

export const StickyFooter = () => (
  <div className="absolute bottom-0 left-0 right-0 bg-slate-900/95 backdrop-blur-xl border-t border-slate-700 p-4 flex items-center justify-between shadow-[0_-20px_40px_rgba(0,0,0,0.5)] z-50 animate-slide-up pointer-events-auto">
    <div className="flex items-center gap-4">
      <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg">
        <Layers className="text-white" />
      </div>
      <div>
        <h4 className="font-bold text-white text-lg leading-tight">Upgrade Your Workflow</h4>
        <p className="text-sm text-cyan-400 font-medium">Try the new pro tools today.</p>
      </div>
    </div>
    <div className="flex gap-4">
      <button type="button" className="px-4 py-2 text-sm font-medium text-slate-400 hover:text-white transition-colors">Dismiss</button>
      <CTA className="px-6 py-2.5 text-sm font-bold bg-white text-slate-900 rounded-lg hover:bg-slate-200 transition-colors shadow-md">Get Started</CTA>
    </div>
  </div>
);

export const StickyTopLeaderboard = () => (
  <div className="absolute top-0 left-0 right-0 bg-indigo-600 border-b border-indigo-500 p-3 flex items-center justify-center shadow-lg z-50 animate-slide-down pointer-events-auto">
    <div className="flex items-center gap-4 md:gap-6">
      <span className="px-2 py-1 bg-white/20 rounded text-xs font-bold text-white uppercase tracking-wider">Ad</span>
      <p className="text-white font-medium text-sm md:text-base">Get 50% off all enterprise plans this week only.</p>
      <CTA className="bg-white text-indigo-700 font-bold px-4 py-1.5 rounded-md text-sm hover:bg-indigo-50 transition-colors">Claim Deal</CTA>
    </div>
  </div>
);

export const ExpandableBanner = () => {
  const [expanded, setExpanded] = useState(false);
  return (
    <div
      className={`my-8 w-full bg-gradient-to-r from-slate-800 to-slate-900 rounded-xl border border-slate-700 overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] cursor-pointer relative group ${expanded ? 'h-[400px]' : 'h-[100px]'}`}
      onClick={() => setExpanded(!expanded)}
      onMouseLeave={() => setExpanded(false)}
    >
      <div className="absolute inset-0 flex items-center justify-between p-6 z-20 bg-slate-900/40 backdrop-blur-sm group-hover:bg-slate-900/20 transition-colors">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-cyan-500/20 flex items-center justify-center border border-cyan-500/50">
            <Zap className="text-cyan-400" size={20} />
          </div>
          <div>
            <span className="text-cyan-400 text-[10px] font-bold uppercase tracking-widest mb-1 block">Interactive Canvas</span>
            <h3 className="text-xl font-bold text-white transition-colors">Hover or Click to Expand</h3>
          </div>
        </div>
        <Maximize2 className={`text-cyan-400 transition-transform duration-500 ${expanded ? 'rotate-180 opacity-0' : 'opacity-100'}`} />
      </div>
      <div className={`absolute top-[100px] left-0 right-0 bottom-0 p-8 transition-opacity duration-500 delay-100 flex flex-col justify-between ${expanded ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        <div className="flex flex-col md:flex-row gap-8 h-full">
          <div className="w-full md:w-1/2 h-48 md:h-full bg-slate-800 rounded-lg overflow-hidden border border-slate-700 relative">
            <img src="https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=1000&auto=format&fit=crop" className="absolute inset-0 w-full h-full object-cover opacity-80" alt="Tech" />
          </div>
          <div className="w-full md:w-1/2 flex flex-col justify-center">
            <h4 className="text-2xl md:text-3xl font-bold text-white mb-4">Unlock Full Potential</h4>
            <p className="text-base text-slate-300 mb-8 leading-relaxed">Expanded state allows for rich media and complex interactions without ever forcing the user to leave the page.</p>
            <CTA className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold py-3 px-6 rounded-lg transition-colors flex items-center gap-2 w-fit" onClick={(e) => e.stopPropagation()}>Claim Offer <ChevronRight size={18} /></CTA>
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
    <div className="my-8 w-full h-[400px] relative rounded-xl border border-slate-700 overflow-hidden group">
      <img src="https://images.unsplash.com/photo-1617814076367-b759c7d7e738?q=80&w=2000&auto=format&fit=crop" className="absolute inset-0 w-full h-full object-cover opacity-60" alt="Car" />
      <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-900/80 to-transparent" />
      <div className="absolute top-8 left-8 z-10 w-full md:w-1/2">
        <h3 className="text-3xl md:text-4xl font-black text-white mb-2">The New V8.</h3>
        <p className="text-slate-300 mb-6">Experience power like never before.</p>
        <div className="bg-slate-900/80 backdrop-blur-md p-6 rounded-xl border border-slate-600/50 shadow-2xl relative overflow-hidden">
          {gameState === 'start' && (
            <div className="text-center animate-fade-in">
              <Gamepad2 className="mx-auto text-rose-500 mb-3" size={32} />
              <h4 className="text-white font-bold mb-1">Unlock Test Drive</h4>
              <p className="text-xs text-slate-400 mb-4">Tap 3 targets to reveal your exclusive booking link.</p>
              <button type="button" onClick={startGame} className="bg-rose-600 hover:bg-rose-500 text-white text-sm font-bold py-2 px-6 rounded-full transition-colors">Play Now</button>
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
    { bg: 'from-blue-900 to-slate-900', img: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&q=80', head: 'Need a Vacation?', cta: 'Book Flight', ctaColor: 'bg-blue-500' },
    { bg: 'from-emerald-900 to-slate-900', img: 'https://images.unsplash.com/photo-1540541338287-41700207dee6?w=400&q=80', head: 'Escape to Nature.', cta: 'See Resorts', ctaColor: 'bg-emerald-500' },
    { bg: 'from-rose-900 to-slate-900', img: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&q=80', head: 'Luxury Awaits.', cta: 'Claim Offer', ctaColor: 'bg-rose-500' },
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
    <div className="my-8 w-full bg-slate-900 rounded-xl border border-slate-700 overflow-hidden relative">
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
      <div className={`p-6 bg-gradient-to-br ${active.bg} transition-colors duration-700`}>
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <div className="w-32 h-32 rounded-lg overflow-hidden flex-shrink-0 relative shadow-lg">
            {locked && <div className="absolute inset-0 border-4 border-emerald-500 z-10 rounded-lg shadow-[inset_0_0_20px_rgba(16,185,129,0.5)]" />}
            <img src={active.img} alt="Dynamic" className="w-full h-full object-cover transition-opacity duration-500" key={active.img} />
          </div>
          <div className="flex-grow text-center sm:text-left">
            <h3 className="text-2xl md:text-3xl font-bold text-white mb-2 transition-all duration-500" key={active.head}>{active.head}</h3>
            <p className="text-slate-300 text-sm mb-4">Personalized offer generated based on real-time browsing context.</p>
            <CTA className={`${active.ctaColor} text-white font-bold py-2 px-6 rounded shadow-lg transition-all duration-500 inline-block`} key={active.cta}>{active.cta}</CTA>
          </div>
        </div>
      </div>
    </div>
  );
};

const initialSwipeCards = [
  { id: 1, color: 'bg-rose-600', img: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400', title: 'Running Gear' },
  { id: 2, color: 'bg-blue-600', img: 'https://images.unsplash.com/photo-1551107696-a4b0c5a0d9a2?w=400', title: 'Street Style' },
  { id: 3, color: 'bg-emerald-600', img: 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=400', title: 'Trail Mix' },
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
      <div className="my-8 w-full h-[350px] bg-slate-800 rounded-xl flex items-center justify-center border border-slate-700">
        <div className="text-center">
          <h3 className="text-white font-bold mb-2">You&apos;ve seen them all!</h3>
          <button type="button" onClick={() => setCards(initialSwipeCards)} className="text-cyan-400 text-sm hover:underline">Reset Stack</button>
        </div>
      </div>
    );
  }
  return (
    <div className="my-8 w-full h-[350px] flex items-center justify-center relative select-none">
      <div className="absolute inset-0 flex items-center justify-between px-12 opacity-30 pointer-events-none z-0">
        <div className="text-rose-500 font-bold flex flex-col items-center"><X size={32} />Pass</div>
        <div className="text-emerald-500 font-bold flex flex-col items-center"><ShoppingCart size={32} />Save</div>
      </div>
      <div className="relative w-72 h-80 z-10 perspective-1000">
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
            >
              <div className={`h-1/2 ${card.color} relative`}>
                <img src={card.img} alt="product" className="absolute inset-0 w-full h-full object-cover mix-blend-overlay" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent" />
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
    <div className="my-8 w-full bg-gradient-to-br from-indigo-900 to-purple-900 rounded-xl p-8 border border-indigo-500/30 text-white relative overflow-hidden">
      <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" />
      {!answered ? (
        <div className="relative z-10 animate-fade-in">
          <span className="text-indigo-300 text-xs font-bold tracking-widest uppercase mb-2 block">Quick Poll</span>
          <h3 className="text-2xl font-bold mb-6">What is your top IT priority for 2026?</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {options.map((opt, i) => (
              <button key={i} type="button" onClick={() => setAnswered(true)} className="bg-indigo-950/50 hover:bg-indigo-600 border border-indigo-500/50 rounded-lg p-4 text-left transition-colors font-medium flex items-center justify-between group">
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
    <div ref={ref} className="my-8 w-full bg-slate-800 rounded-xl border border-slate-700 overflow-hidden shadow-lg relative h-48 flex items-center px-8">
      <div className="z-10 w-full">
        <div className="flex justify-between items-end mb-4">
          <div>
            <h3 className="text-2xl font-bold text-white mb-1">Attention Rewarded</h3>
            <p className="text-slate-400 text-sm">View this ad to unlock premium content.</p>
          </div>
          <div className="text-cyan-400 font-mono font-bold text-xl">{progress}%</div>
        </div>
        <div className="w-full h-3 bg-slate-900 rounded-full overflow-hidden border border-slate-700">
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
  const [isVisible, setIsVisible] = useState(false);
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
    <div ref={ref} className={`my-8 w-full bg-black rounded-xl border border-slate-700 overflow-hidden transition-all duration-700 ${isVisible ? 'h-[400px] opacity-100' : 'h-0 opacity-0 my-0 border-0'}`}>
      <div className="relative w-full h-full">
        <img src="https://images.unsplash.com/photo-1536240478700-b869070f9279?q=80&w=1000&auto=format&fit=crop" className="w-full h-full object-cover opacity-80" alt="Video" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-6">
          <span className="text-white text-xs bg-slate-800/80 px-2 py-1 rounded absolute top-4 left-4 font-bold">SPONSORED VIDEO</span>
          <h3 className="text-2xl font-bold text-white mb-2">The Future of Cinematic Experiences</h3>
          <div className="flex items-center justify-between">
            <button type="button" onClick={() => setIsPlaying(!isPlaying)} className="w-10 h-10 rounded-full bg-white/20 backdrop-blur border border-white/50 flex items-center justify-center text-white hover:bg-white hover:text-black transition-colors">
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
  const ref = useRef(null);
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => setIsFloating(!entry.isIntersecting), { threshold: 0.1 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);
  return (
    <>
      <div ref={ref} className="h-1 w-full bg-transparent" />
      <div className={`w-full transition-all duration-300 ${isFloating ? 'h-[300px] mb-8' : 'h-0 mb-0'}`} />
      <div className={`transition-all duration-500 z-40 ${isFloating ? 'fixed bottom-6 right-6 w-80 shadow-2xl rounded-xl border-2 border-slate-600' : 'relative my-8 w-full h-[300px] rounded-xl border border-slate-700 shadow-lg'} overflow-hidden bg-black group`}>
        <img src="https://images.unsplash.com/photo-1616469829581-73993eb86b02?q=80&w=1000&auto=format&fit=crop" className="w-full h-full object-cover opacity-90" alt="Video" />
        <div className="absolute inset-0 bg-black/20 flex items-center justify-center pointer-events-none group-hover:bg-black/40 transition-colors">
          <div className="w-16 h-16 rounded-full bg-white/30 backdrop-blur-md flex items-center justify-center border border-white/50">
            <Play className="text-white ml-1" size={24} />
          </div>
        </div>
        {isFloating && (
          <button type="button" onClick={() => setIsFloating(false)} className="absolute top-2 right-2 bg-black/50 p-1 rounded-full text-white hover:bg-rose-500 z-10"><X size={14} /></button>
        )}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black p-3">
          <p className="text-white font-medium text-sm line-clamp-1">Live: Product Keynote 2026</p>
        </div>
      </div>
    </>
  );
};

export const CarouselAd = () => {
  const slides = [
    { title: 'Performance', color: 'from-rose-500 to-orange-400', img: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=500&q=80' },
    { title: 'Analytics', color: 'from-blue-500 to-cyan-400', img: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=500&q=80' },
    { title: 'Growth', color: 'from-emerald-500 to-teal-400', img: 'https://images.unsplash.com/photo-1533750516457-a7f992034fec?w=500&q=80' }
  ];
  return (
    <div className="my-8 w-full bg-slate-800 rounded-xl border border-slate-700 p-4">
      <div className="flex justify-between items-center mb-4 px-2">
        <span className="text-xs text-slate-400 uppercase tracking-widest">Sponsored</span>
        <span className="text-xs text-slate-400">Swipe to explore</span>
      </div>
      <div className="flex overflow-x-auto gap-4 snap-x snap-mandatory pb-4 hide-scrollbar">
        {slides.map((slide, i) => (
          <div key={i} className="min-w-[80%] md:min-w-[60%] h-64 snap-center rounded-lg overflow-hidden relative group cursor-pointer">
            <div className={`absolute inset-0 bg-gradient-to-br ${slide.color} opacity-80 mix-blend-multiply`} />
            <img src={slide.img} alt={slide.title} className="absolute inset-0 w-full h-full object-cover mix-blend-overlay group-hover:scale-110 transition-transform duration-700" />
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
    <div className="my-8 relative w-full rounded-xl overflow-hidden border border-slate-700">
      <img src="https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?q=80&w=1000&auto=format&fit=crop" alt="Room" className="w-full h-[400px] object-cover" />
      <div className="absolute inset-0 bg-slate-900/20 pointer-events-none" />
      <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full flex items-center gap-2 border border-white/20">
        <ShoppingCart size={14} className="text-white" />
        <span className="text-white text-xs font-medium">SHOP THE LOOK</span>
      </div>
      {spots.map((spot) => (
        <div key={spot.id} className="absolute" style={{ top: spot.top, left: spot.left }} onMouseEnter={() => setActiveSpot(spot.id)} onMouseLeave={() => setActiveSpot(null)}>
          <div className="relative flex items-center justify-center w-8 h-8 cursor-pointer group">
            <div className="absolute w-full h-full bg-white rounded-full opacity-40 animate-ping" />
            <div className="w-3 h-3 bg-white rounded-full shadow-lg" />
          </div>
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
  <div className="absolute inset-0 z-[100] bg-slate-950 flex flex-col items-center justify-center p-8 animate-fade-in pointer-events-auto">
    <button type="button" onClick={onClose} className="absolute top-6 right-6 p-3 bg-slate-800 rounded-full text-slate-400 hover:text-white hover:bg-slate-700 transition-colors shadow-lg border border-slate-700">
      <X size={24} />
    </button>
    <div className="max-w-2xl text-center space-y-6">
      <span className="inline-block px-4 py-1 bg-rose-500/20 text-rose-400 rounded-full text-sm font-bold tracking-widest uppercase border border-rose-500/30">Limited Time Takeover</span>
      <h2 className="text-4xl md:text-7xl font-black text-white leading-tight bg-clip-text text-transparent bg-gradient-to-r from-rose-400 to-orange-500">Command Attention.</h2>
      <p className="text-xl text-slate-300">High-impact, immersive experiences that guarantee 100% share of voice.</p>
      <div className="pt-8 flex justify-center gap-4 flex-wrap">
        <CTA className="bg-gradient-to-r from-rose-500 to-orange-500 hover:from-rose-400 hover:to-orange-400 text-white font-bold text-lg py-4 px-12 rounded-full shadow-lg transition-all">Explore Features</CTA>
        <button type="button" onClick={onClose} className="bg-transparent border border-slate-600 text-slate-300 hover:bg-slate-800 font-bold text-lg py-4 px-8 rounded-full transition-colors">Return to Site</button>
      </div>
    </div>
  </div>
);

export const PushNotification = ({ onClose }) => (
  <div className="absolute top-6 right-6 w-80 bg-slate-800 border border-slate-600 rounded-xl shadow-2xl p-4 flex gap-4 z-50 animate-slide-in-right pointer-events-auto">
    <div className="flex-shrink-0 pt-1">
      <div className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center text-blue-400"><BellRing size={20} /></div>
    </div>
    <div className="flex-grow">
      <div className="flex justify-between items-start mb-1">
        <h4 className="font-bold text-white text-sm">New Message</h4>
        <button type="button" onClick={onClose} className="text-slate-400 hover:text-white"><X size={14} /></button>
      </div>
      <p className="text-xs text-slate-300 mb-3">Your personalized offer is ready. Claim your 50% discount now.</p>
      <CTA className="text-xs font-bold bg-blue-500 text-white px-3 py-1.5 rounded hover:bg-blue-400 transition-colors shadow-md inline-block">View Offer</CTA>
    </div>
  </div>
);

export const AnchorAd = () => (
  <div className="absolute bottom-6 right-6 bg-slate-800 border border-slate-600 rounded-xl p-4 shadow-2xl flex items-center gap-4 z-50 hover:bg-slate-700 transition-colors cursor-pointer group animate-fade-in-up pointer-events-auto w-72">
    <div className="w-12 h-12 bg-indigo-500 rounded-lg flex items-center justify-center text-white shrink-0">
      <MoveRight className="group-hover:translate-x-1 transition-transform" />
    </div>
    <div className="flex-grow">
      <div className="text-[10px] text-indigo-400 font-bold mb-1 tracking-wider uppercase">Next Article</div>
      <div className="text-sm text-white font-medium leading-tight">The Future of Cookie-less Targeting</div>
    </div>
    <button type="button" className="text-slate-400 hover:text-white p-1 rounded-full"><X size={14} /></button>
  </div>
);

export const DoubleXClose = () => {
  const [stage, setStage] = useState(0);
  const [fakePos, setFakePos] = useState({ top: '10%', left: '80%' });
  const handleFakeHover = () => {
    if (stage === 0) setFakePos({ top: (10 + Math.random() * 70) + '%', left: (10 + Math.random() * 70) + '%' });
  };
  if (stage === 2) return null;
  return (
    <div className="my-8 w-full bg-rose-950/40 border border-rose-900 rounded-lg p-6 relative overflow-hidden text-center flex flex-col items-center justify-center min-h-[150px]">
      <AlertCircle className="text-rose-500 mb-2 opacity-50" size={32} />
      <h3 className="text-white font-bold text-lg mb-1">Don&apos;t Miss Out!</h3>
      <p className="text-rose-200/70 text-sm">Double-tap the real close to dismiss. First X moves.</p>
      {stage === 0 && (
        <button type="button" className="absolute text-rose-400 hover:text-white p-2 transition-all duration-200" style={fakePos} onMouseEnter={handleFakeHover} onClick={() => setStage(1)}><X size={16} /></button>
      )}
      {stage === 1 && (
        <button type="button" className="absolute top-2 right-2 text-xs text-slate-500 hover:text-slate-300 underline" onClick={() => setStage(2)}>Close ad</button>
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
          <h3 className="font-bold text-xl leading-none mb-1">Flash Sale Ending Soon!</h3>
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
      BREAKING NEWS: NEW PROGRAMMATIC AD FORMATS LAUNCHED • INCREASE ROI BY 300% • TRY INTERACTIVE TEMPLATES TODAY •
      BREAKING NEWS: NEW PROGRAMMATIC AD FORMATS LAUNCHED • INCREASE ROI BY 300% • TRY INTERACTIVE TEMPLATES TODAY •
    </div>
  </div>
);

export const PeelBackCorner = () => (
  <div className="absolute top-0 right-0 w-32 h-32 overflow-hidden z-50 pointer-events-none">
    <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-rose-500 to-orange-500 text-white p-4 font-bold rounded-bl-3xl shadow-[inset_0_0_20px_rgba(0,0,0,0.3)] pointer-events-auto origin-top-right transition-transform duration-500 translate-x-32 -translate-y-32 hover:translate-x-0 hover:-translate-y-0 flex flex-col items-end cursor-pointer">
      <div className="mt-16 mr-12 text-right">
        <span className="block text-2xl drop-shadow-md">Surprise!</span>
        <span className="block text-sm font-normal">You found the secret offer.</span>
        <CTA className="mt-2 text-xs bg-white text-rose-600 px-3 py-1 rounded shadow inline-block">Reveal</CTA>
      </div>
    </div>
  </div>
);

export const RotatingCubeAd = ({ scrollAreaRef }) => {
  const [rot, setRot] = useState({ x: -20, y: 45 });
  const ref = useRef(null);
  useEffect(() => {
    const el = scrollAreaRef?.current || document.getElementById('demo-scroll-area');
    const handleScroll = () => {
      if (!ref.current || !el) return;
      const rect = ref.current.getBoundingClientRect();
      const progress = (window.innerHeight - rect.top) / window.innerHeight;
      setRot({ x: -20 + progress * 180, y: 45 + progress * 90 });
    };
    if (el) { el.addEventListener('scroll', handleScroll); return () => el.removeEventListener('scroll', handleScroll); }
  }, [scrollAreaRef]);
  const faces = [
    { side: 'Exclusive', transform: 'rotateY(0deg) translateZ(100px)', bg: 'bg-gradient-to-br from-rose-500 to-orange-500' },
    { side: 'Offers', transform: 'rotateY(180deg) translateZ(100px)', bg: 'bg-gradient-to-br from-blue-500 to-cyan-500' },
    { side: 'Inside', transform: 'rotateY(90deg) translateZ(100px)', bg: 'bg-gradient-to-br from-emerald-500 to-teal-500' },
    { side: 'Click', transform: 'rotateY(-90deg) translateZ(100px)', bg: 'bg-gradient-to-br from-amber-500 to-orange-500' },
    { side: 'Now', transform: 'rotateX(90deg) translateZ(100px)', bg: 'bg-gradient-to-br from-purple-500 to-indigo-500' },
    { side: '3D Ad', transform: 'rotateX(-90deg) translateZ(100px)', bg: 'bg-gradient-to-br from-slate-700 to-slate-900' },
  ];
  return (
    <div className="my-16 h-[350px] flex flex-col items-center justify-center w-full bg-slate-900 rounded-xl border border-slate-800 shadow-inner relative overflow-hidden" style={{ perspective: '800px' }}>
      <span className="absolute top-4 left-4 text-xs font-mono text-slate-500">SCROLL TO ROTATE</span>
      <div ref={ref} className="relative w-[200px] h-[200px] transition-transform duration-75 ease-out cursor-pointer hover:scale-110 preserve-3d" style={{ transform: `rotateX(${rot.x}deg) rotateY(${rot.y}deg)` }}>
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
            <div className="flex items-center gap-2 font-bold"><Bot size={18} /> Affinity AI</div>
            <button type="button" onClick={() => setOpen(false)} className="hover:bg-indigo-500 p-1 rounded"><X size={14} /></button>
          </div>
          <div className="p-4 bg-slate-900 text-sm">
            <p className="text-slate-300 mb-4 bg-slate-800 p-3 rounded-lg rounded-tl-none inline-block">Looking for an enterprise DSP solution?</p>
            <div className="flex flex-col gap-2">
              <CTA className="border border-indigo-500 text-indigo-400 hover:bg-indigo-500 hover:text-white px-3 py-2 rounded-lg transition-colors text-left">Yes, show me features</CTA>
              <button type="button" className="border border-slate-600 text-slate-400 hover:bg-slate-700 hover:text-white px-3 py-2 rounded-lg transition-colors text-left">No, just browsing</button>
            </div>
          </div>
        </div>
      )}
      <button type="button" onClick={() => setOpen(!open)} className="w-14 h-14 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full flex items-center justify-center shadow-lg transition-transform hover:scale-110 relative">
        <MessageCircle size={24} className={open ? 'hidden' : 'block'} />
        <X size={24} className={open ? 'block' : 'hidden'} />
        {!open && <span className="absolute -top-1 -right-1 w-3 h-3 bg-rose-500 rounded-full border-2 border-slate-900 animate-pulse" />}
      </button>
    </div>
  );
};

export const ScrollMorphBanner = () => {
  const [ratio, setRatio] = useState(0);
  const ref = useRef(null);
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => setRatio(entry.intersectionRatio), { threshold: Array.from({ length: 20 }, (_, i) => i * 0.05) });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);
  const scale = 0.85 + ratio * 0.15;
  const borderRadius = 40 - ratio * 24;
  const opacity = 0.4 + ratio * 0.6;
  return (
    <div className="my-16 w-full h-[300px] flex items-center justify-center relative perspective-1000">
      <div ref={ref} className="w-full h-full bg-gradient-to-r from-purple-600 via-fuchsia-600 to-orange-500 flex flex-col justify-center items-center text-center p-8 transition-all duration-75 ease-out shadow-2xl relative overflow-hidden group cursor-pointer" style={{ transform: `scale(${scale})`, borderRadius: `${borderRadius}px`, opacity }}>
        <Sparkles className="text-white/80 mb-4 drop-shadow-md" size={40} />
        <h3 className="text-4xl font-black text-white mb-2 tracking-tight drop-shadow-md">Scroll-Adaptive Ad</h3>
        <p className="text-white/90 font-medium text-lg max-w-md drop-shadow">Changes shape and scale as it reaches the center of your screen.</p>
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
    <div className="my-12 w-full h-[400px] bg-slate-900 rounded-xl overflow-hidden relative cursor-crosshair border border-slate-700 perspective-1000 shadow-2xl" onMouseMove={handleMove} onMouseLeave={() => setMouse({ x: 0, y: 0 })}>
      <div className="absolute inset-[-60px] bg-[url(\'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1000\')] bg-cover bg-center transition-transform duration-200 ease-out opacity-60" style={{ transform: `translate(${mouse.x * 0.5}px, ${mouse.y * 0.5}px) scale(1.1)` }} />
      <div className="absolute inset-0 flex flex-col items-center justify-center transition-transform duration-200 ease-out pointer-events-none" style={{ transform: `translate(${mouse.x * -2.5}px, ${mouse.y * -2.5}px)` }}>
        <h3 className="text-6xl font-black text-white drop-shadow-[0_15px_25px_rgba(0,0,0,0.8)] tracking-tighter">DEPTH.</h3>
        <p className="text-cyan-300 font-bold mt-2 drop-shadow-md uppercase tracking-widest text-sm">True Parallax Unit</p>
        <CTA className="mt-8 bg-cyan-500 text-slate-950 px-8 py-3 rounded-full font-bold shadow-lg pointer-events-auto hover:bg-white hover:scale-105 transition-all">Interact</CTA>
      </div>
    </div>
  );
};

export const ContextualHighlightUnit = () => (
  <div className="my-12 p-8 bg-slate-800/30 border border-slate-700/50 rounded-xl">
    <span className="text-xs font-mono text-slate-500 mb-4 block">DEMO PARAGRAPH</span>
    <p className="text-xl text-slate-300 font-serif leading-relaxed relative group inline-block">
      We noticed that{' '}
      <span className="text-cyan-400 border-b-2 border-dashed border-cyan-400/50 cursor-pointer relative inline-block hover:bg-cyan-900/30 transition-colors group/highlight">
        programmatic buying
        <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 w-72 p-5 bg-slate-800 rounded-xl shadow-2xl opacity-0 group-hover/highlight:opacity-100 transition-all duration-300 pointer-events-none group-hover/highlight:pointer-events-auto z-20 border border-slate-600 translate-y-2 group-hover/highlight:translate-y-0 font-sans text-left">
          <span className="flex items-center gap-2 text-cyan-400 font-bold text-sm mb-2"><TrendingUp size={16} /> Market Insight</span>
          <span className="text-slate-200 text-sm block mb-4">Programmatic spending is expected to increase by 40% next year.</span>
          <CTA className="w-full bg-cyan-500 text-slate-950 font-bold py-2 rounded shadow text-sm hover:bg-cyan-400 block text-center">View Platform</CTA>
        </span>
      </span>
      {' '}has increased significantly in the last quarter.
    </p>
  </div>
);

export const AIChatMiniAssistant = () => {
  const [messages, setMessages] = useState([{ sender: 'bot', text: 'Hi! Looking for creative ad templates?' }]);
  const [typing, setTyping] = useState(false);
  const handleReply = (text, responseText) => {
    if (typing) return;
    setMessages((prev) => [...prev, { sender: 'user', text }]);
    setTyping(true);
    setTimeout(() => { setTyping(false); setMessages((prev) => [...prev, { sender: 'bot', text: responseText }]); }, 1000);
  };
  return (
    <div className="my-8 w-full bg-slate-900 border border-slate-700 rounded-xl overflow-hidden flex flex-col h-[350px] shadow-xl">
      <div className="bg-slate-800 px-4 py-3 border-b border-slate-700 flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400"><Bot size={16} /></div>
        <div>
          <h4 className="text-sm font-bold text-white">Ad Assistant</h4>
          <span className="text-[10px] text-emerald-400 flex items-center gap-1"><div className="w-1.5 h-1.5 bg-emerald-400 rounded-full" /> Online</span>
        </div>
      </div>
      <div className="flex-grow p-4 overflow-y-auto custom-scrollbar flex flex-col gap-3">
        {messages.map((m, i) => (
          <div key={i} className={`max-w-[80%] p-3 rounded-xl text-sm ${m.sender === 'bot' ? 'bg-slate-800 text-slate-200 self-start rounded-tl-sm' : 'bg-cyan-600 text-white self-end rounded-tr-sm'}`}>{m.text}</div>
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
    <div ref={containerRef} className="my-12 w-full h-[400px] relative rounded-xl overflow-hidden cursor-ew-resize select-none touch-none shadow-xl border border-slate-700" onMouseMove={handleMove} onTouchMove={handleMove}>
      <img src="https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=1000" className="absolute inset-0 w-full h-full object-cover" draggable={false} alt="After" />
      <div className="absolute top-4 right-4 bg-rose-500 text-white text-xs font-bold px-3 py-1 rounded shadow-lg backdrop-blur z-0">V2.0 Pro</div>
      <div className="absolute inset-0 z-10" style={{ clipPath: `inset(0 ${100 - splitPos}% 0 0)` }}>
        <img src="https://images.unsplash.com/photo-1551107696-a4b0c5a0d9a2?w=1000" className="absolute inset-0 w-full h-full object-cover grayscale opacity-80" draggable={false} alt="Before" />
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
  const handleBuy = () => { setStep(1); setTimeout(() => setStep(2), 2000); };
  return (
    <div className="my-12 w-full bg-slate-800 rounded-xl border border-slate-700 overflow-hidden flex flex-col md:flex-row shadow-xl">
      <div className="w-full md:w-2/5 h-48 md:h-auto bg-[url(\'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600\')] bg-cover bg-center" />
      <div className="p-6 md:w-3/5 flex flex-col justify-center bg-slate-900 relative">
        {step === 0 && (
          <div className="animate-fade-in">
            <span className="text-amber-500 text-xs font-bold tracking-widest uppercase mb-1 block">Limited Drop</span>
            <h3 className="text-2xl font-bold text-white mb-2">Minimalist Watch</h3>
            <p className="text-slate-400 text-sm mb-4">In-ad commerce. Buy directly from the page.</p>
            <div className="flex gap-2 mb-6">
              {['Black', 'Silver', 'Rose'].map((c) => <button key={c} type="button" className="px-3 py-1 text-xs border border-slate-600 rounded hover:border-white text-slate-300 hover:text-white transition-colors">{c}</button>)}
            </div>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-light text-white">$149</span>
              <button type="button" onClick={handleBuy} className="bg-white text-slate-900 px-6 py-2 rounded font-bold hover:bg-slate-200 flex items-center gap-2"><CreditCard size={16} /> Buy Now</button>
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
    <div className={`my-12 w-full h-[250px] rounded-xl border border-slate-700 overflow-hidden relative transition-colors duration-1000 flex items-center px-4 md:px-8 ${isSun ? 'bg-amber-500/10' : 'bg-blue-600/10'}`}>
      <div className={`absolute top-4 right-4 flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-mono border ${isSun ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' : 'bg-blue-500/20 text-blue-400 border-blue-500/30'}`}>
        <Activity size={12} className="animate-pulse" /> LIVE WEATHER SYNC
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
  <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden mix-blend-screen">
    <div className="absolute inset-0 border-[20px] border-cyan-500/10 shadow-[inset_0_0_150px_rgba(6,182,212,0.15)] animate-pulse" />
    <div className="absolute -top-40 -right-40 w-[600px] h-[600px] bg-cyan-500/5 rounded-full blur-[100px] animate-pulse" />
    <div className="absolute -bottom-40 -left-40 w-[600px] h-[600px] bg-purple-500/5 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '500ms' }} />
  </div>
);

export const SideRailDock = () => (
  <div className="fixed right-0 top-1/3 z-50 flex flex-col items-end gap-2 pr-2 pointer-events-auto">
    {['Deals', 'Video', 'Shop'].map((label, i) => (
      <div key={i} className="group relative w-12 hover:w-32 h-12 bg-slate-800 border border-slate-600 rounded-l-xl shadow-2xl transition-all duration-300 ease-out cursor-pointer overflow-hidden flex items-center justify-end px-3">
        <span className="text-white font-bold text-sm whitespace-nowrap opacity-0 group-hover:opacity-100 absolute left-4 transition-opacity duration-300 delay-100">{label}</span>
        <ChevronLeft size={18} className="text-slate-400 group-hover:text-white shrink-0" />
      </div>
    ))}
  </div>
);

export const InfiniteStickyRibbon = () => (
  <div className="absolute top-14 left-0 right-0 bg-indigo-600 text-white overflow-hidden flex items-center h-12 z-40 pointer-events-auto shadow-xl border-b border-indigo-500">
    <div className="animate-marquee-wide inline-flex items-center gap-8 whitespace-nowrap px-4">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="flex items-center gap-3">
          <div className="w-8 h-8 bg-white/20 rounded flex items-center justify-center text-[10px] font-bold">ITEM</div>
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
    <div className="my-12 w-full bg-slate-900 rounded-xl border border-slate-700 p-8 relative overflow-hidden flex flex-col items-center justify-center h-56 shadow-xl">
      <div className="absolute inset-0 opacity-20 bg-[url(\'https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80\')] bg-cover mix-blend-luminosity" />
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
          <h3 className="text-white font-bold mb-6 text-lg">Slide to Reveal Exclusive Offer</h3>
          <div className="relative w-full h-14 bg-slate-800 rounded-full border border-slate-600 shadow-inner overflow-hidden flex items-center px-1">
            <div className="absolute top-0 bottom-0 left-0 bg-gradient-to-r from-cyan-600 to-blue-500 pointer-events-none transition-all" style={{ width: `${val}%` }} />
            <span className="absolute inset-0 flex items-center justify-center text-slate-400 text-sm font-medium pointer-events-none">Swipe Right →</span>
            <input type="range" min="0" max="100" value={val} onChange={(e) => setVal(Number(e.target.value))} className="w-full h-full opacity-0 cursor-ew-resize absolute inset-0 z-20" />
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
    <div className="my-12 relative w-full h-[300px] rounded-xl overflow-hidden border-2 border-slate-600 shadow-2xl select-none">
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900 to-indigo-900 text-white flex flex-col items-center justify-center">
        <Star size={48} className="text-amber-400 mb-4" />
        <h3 className="text-3xl font-black tracking-tight mb-2">You Won!</h3>
        <p className="text-purple-200 mb-4 font-medium">Use code SCRATCH50</p>
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

export const CinematicStoryAd = () => (
  <div className="my-24 w-full relative">
    <div className="h-[250vh]">
      <div className="h-[70vh] sticky top-20 bg-[url(\'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80\')] bg-cover bg-center overflow-hidden rounded-xl border border-rose-500/50 mb-2 shadow-2xl flex items-end p-8">
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-900/40 to-transparent" />
        <div className="relative z-10 w-full md:w-1/2">
          <h3 className="text-4xl font-black text-white mb-2">Pace.</h3>
          <p className="text-rose-200 text-lg">Designed for speed. Engineered for comfort.</p>
        </div>
      </div>
      <div className="h-[70vh] sticky top-24 bg-[url(\'https://images.unsplash.com/photo-1551107696-a4b0c5a0d9a2?q=80\')] bg-cover bg-center overflow-hidden rounded-xl border border-blue-500/50 mb-2 shadow-2xl flex items-end p-8">
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-900/40 to-transparent" />
        <div className="relative z-10 w-full md:w-1/2">
          <h3 className="text-4xl font-black text-white mb-2">Style.</h3>
          <p className="text-blue-200 text-lg">Stand out from the crowd.</p>
        </div>
      </div>
      <div className="h-[70vh] sticky top-28 bg-[url(\'https://images.unsplash.com/photo-1608231387042-66d1773070a5?q=80\')] bg-cover bg-center overflow-hidden rounded-xl border border-emerald-500/50 mb-2 shadow-2xl flex items-end p-8">
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-900/40 to-transparent" />
        <div className="relative z-10 w-full md:w-1/2">
          <h3 className="text-4xl font-black text-white mb-4">Yours.</h3>
          <CTA className="bg-white text-slate-900 font-bold px-8 py-3 rounded-full hover:bg-slate-200 transition-colors shadow-lg inline-block">Build Your Custom Pair</CTA>
        </div>
      </div>
    </div>
  </div>
);

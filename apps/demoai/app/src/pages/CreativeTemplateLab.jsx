import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown, Palette, X, List } from 'lucide-react';
import {
  AD_FORMATS,
  articleContent,
  Interscroller,
  StickyFooter,
  StickyTopLeaderboard,
  ExpandableBanner,
  PlayableMini,
  AgenticAd,
  SwipeableCards,
  QuizAd,
  ProgressBarAd,
  OutstreamVideo,
  FloatingVideo,
  CarouselAd,
  ShoppableHotspots,
  FullScreenTakeover,
  PushNotification,
  AnchorAd,
  DoubleXClose,
  CountdownAd,
  MarqueeTicker,
  PeelBackCorner,
  RotatingCubeAd,
  AIBotOverlay,
  ScrollMorphBanner,
  ParallaxDepthAd,
  ContextualHighlightUnit,
  AIChatMiniAssistant,
  SplitScreenSlider,
  MicroCheckoutCommerce,
  LiveDataAdaptiveAd,
  AmbientTakeover,
  SideRailDock,
  InfiniteStickyRibbon,
  GestureUnlockAd,
  ScratchCardReward,
  CinematicStoryAd,
} from './CreativeTemplateAdFormats';

function renderAd(selectedFormat, type, scrollAreaRef) {
  const info = AD_FORMATS.find((f) => f.id === selectedFormat);
  if (info?.type !== type) return null;
  switch (selectedFormat) {
    case 'sticky-footer': return <StickyFooter />;
    case 'sticky-top': return <StickyTopLeaderboard />;
    case 'anchor': return <AnchorAd />;
    case 'marquee': return <MarqueeTicker />;
    case 'peel-back': return <PeelBackCorner />;
    case 'ai-bot': return <AIBotOverlay />;
    case 'ambient': return <AmbientTakeover />;
    case 'side-rail': return <SideRailDock />;
    case 'infinite-ribbon': return <InfiniteStickyRibbon />;
    case 'interscroller': return <Interscroller />;
    case 'expandable': return <ExpandableBanner />;
    case 'carousel': return <CarouselAd />;
    case 'playable': return <PlayableMini />;
    case 'shoppable': return <ShoppableHotspots />;
    case 'double-x': return <DoubleXClose />;
    case 'countdown': return <CountdownAd />;
    case 'agentic': return <AgenticAd />;
    case 'swipeable': return <SwipeableCards />;
    case 'quiz': return <QuizAd />;
    case 'progress': return <ProgressBarAd />;
    case 'outstream': return <OutstreamVideo />;
    case 'floating-video': return <FloatingVideo />;
    case '3d-cube': return <RotatingCubeAd scrollAreaRef={scrollAreaRef} />;
    case 'scroll-morph': return <ScrollMorphBanner />;
    case 'parallax': return <ParallaxDepthAd />;
    case 'contextual': return <ContextualHighlightUnit />;
    case 'ai-chat': return <AIChatMiniAssistant />;
    case 'split-screen': return <SplitScreenSlider />;
    case 'micro-checkout': return <MicroCheckoutCommerce />;
    case 'live-data': return <LiveDataAdaptiveAd />;
    case 'gesture': return <GestureUnlockAd />;
    case 'scratch-card': return <ScratchCardReward />;
    case 'cinematic': return <CinematicStoryAd />;
    default: return null;
  }
}

export function CreativeTemplateLab() {
  const [selectedFormat, setSelectedFormat] = useState(AD_FORMATS[0].id);
  const [showTakeover, setShowTakeover] = useState(false);
  const [showPush, setShowPush] = useState(false);
  const [formatPickerOpen, setFormatPickerOpen] = useState(false);
  const scrollAreaRef = useRef(null);

  useEffect(() => {
    setShowTakeover(selectedFormat === 'takeover');
    setShowPush(selectedFormat === 'push');
  }, [selectedFormat]);

  const activeFormatInfo = AD_FORMATS.find((f) => f.id === selectedFormat);

  const selectFormat = (id) => {
    setSelectedFormat(id);
    setFormatPickerOpen(false);
  };

  const formatList = (
    <div className="space-y-1">
      {AD_FORMATS.map((format) => (
        <button
          key={format.id}
          type="button"
          onClick={() => selectFormat(format.id)}
          className={`w-full text-left px-3 py-2.5 rounded-lg text-sm transition-all duration-200 flex justify-between items-center group
            ${selectedFormat === format.id
              ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30'
              : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200 border border-transparent'
            }`}
        >
          <span className="truncate pr-2">{format.name}</span>
          <ChevronDown size={14} className={`shrink-0 -rotate-90 ${selectedFormat === format.id ? 'opacity-100 text-cyan-400' : 'opacity-0 group-hover:opacity-100'}`} />
        </button>
      ))}
    </div>
  );

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-slate-950 text-slate-300 overflow-hidden">
      <div className="flex flex-col lg:flex-row flex-1 min-h-0">
        {/* Desktop sidebar */}
        <div className="hidden lg:flex w-80 border-r border-slate-800 flex-col bg-slate-950 z-20 shrink-0 shadow-xl">
          <div className="p-6 border-b border-slate-800 bg-slate-900/50">
            <h1 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
              <Palette size={20} className="text-cyan-400" />
              Creative <span className="text-cyan-400">Template</span>
            </h1>
            <p className="text-xs text-slate-500">
              {AD_FORMATS.length} ad formats. Pick a template to see it in context.
            </p>
          </div>
          <div className="p-3 flex-grow overflow-y-auto custom-scrollbar min-h-0">
            <div className="text-xs font-bold text-slate-500 mb-2 ml-2 tracking-wider">TEMPLATE LIST</div>
            {formatList}
          </div>
        </div>

        {/* Main demo area */}
        <div className="flex-grow flex flex-col min-h-0 min-w-0 relative bg-slate-900">
          <div className="lg:hidden shrink-0 border-b border-slate-800 bg-slate-950 px-3 py-2 flex items-center gap-2">
            <button
              type="button"
              onClick={() => setFormatPickerOpen(true)}
              className="flex-1 flex items-center justify-between gap-2 px-3 py-2.5 rounded-lg bg-slate-900 border border-slate-700 text-sm text-white touch-manipulation"
            >
              <span className="flex items-center gap-2 min-w-0">
                <List size={16} className="text-cyan-400 shrink-0" />
                <span className="truncate">{activeFormatInfo?.name || 'Choose format'}</span>
              </span>
              <ChevronDown size={16} className="text-slate-500 shrink-0" />
            </button>
          </div>

          {formatPickerOpen && (
            <>
              <div
                className="lg:hidden fixed inset-0 z-[60] bg-black/70"
                onClick={() => setFormatPickerOpen(false)}
                aria-hidden
              />
              <div className="lg:hidden fixed inset-x-0 bottom-0 z-[70] max-h-[75vh] flex flex-col rounded-t-2xl bg-slate-950 border-t border-slate-700 shadow-2xl safe-bottom">
                <div className="flex items-center justify-between p-4 border-b border-slate-800">
                  <h2 className="text-sm font-bold text-white">Ad formats</h2>
                  <button
                    type="button"
                    onClick={() => setFormatPickerOpen(false)}
                    className="p-2 rounded-lg text-slate-400 hover:text-white touch-manipulation"
                    aria-label="Close"
                  >
                    <X size={20} />
                  </button>
                </div>
                <div className="overflow-y-auto custom-scrollbar p-3 flex-1">{formatList}</div>
              </div>
            </>
          )}

          <div className="absolute inset-0 pointer-events-none z-50">
            {renderAd(selectedFormat, 'overlay', scrollAreaRef)}
            {showTakeover && <FullScreenTakeover onClose={() => setShowTakeover(false)} />}
            {showPush && <PushNotification onClose={() => setShowPush(false)} />}
          </div>

          <div className="h-11 sm:h-12 border-b border-slate-800 flex items-center px-3 sm:px-4 gap-2 sm:gap-4 bg-slate-950/80 backdrop-blur-md sticky top-0 z-30 shrink-0">
            <div className="hidden sm:flex gap-1.5 shrink-0">
              <div className="w-2.5 h-2.5 rounded-full bg-rose-500/50" />
              <div className="w-2.5 h-2.5 rounded-full bg-amber-500/50" />
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/50" />
            </div>
            <span className="text-[10px] sm:text-xs text-slate-500 font-mono bg-slate-900 px-2 py-1 rounded border border-slate-800 truncate min-w-0">
              demoai / {activeFormatInfo?.id}
            </span>
          </div>

          <div ref={scrollAreaRef} id="demo-scroll-area" className="flex-grow overflow-y-auto overflow-x-hidden relative custom-scrollbar bg-slate-900 min-h-0">
            <div className="max-w-3xl mx-auto px-3 sm:px-8 py-6 sm:py-16 relative z-10">
              <span className="text-cyan-400 font-mono text-xs md:text-sm tracking-widest mb-4 block">INDUSTRY INSIGHTS</span>
              <h1 className="text-2xl sm:text-3xl md:text-5xl font-bold text-white mb-6 leading-tight">
                How Programmatic Creative Is Shaping the Future of Digital Advertising
              </h1>
              <div className="flex items-center gap-4 mb-8 pb-6 border-b border-slate-800">
                <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 shrink-0" />
                <div className="min-w-0">
                  <div className="text-white text-sm font-medium">Alex Chen</div>
                  <div className="text-slate-500 text-xs">Published Oct 24 • 5 min read</div>
                </div>
              </div>

              <div className="space-y-6 text-sm sm:text-base md:text-lg text-slate-300 leading-relaxed">
                <p>{articleContent[0]}</p>
                <p>{articleContent[1]}</p>

                <div className="my-8 sm:my-12 overflow-x-auto">
                  {renderAd(selectedFormat, 'inline', scrollAreaRef)}
                </div>

                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-white mt-12 mb-4">The Role of Context</h2>
                <p>{articleContent[2]}</p>
                <p>{articleContent[3]}</p>
                <p>{articleContent[4]}</p>

                <div className="my-8 sm:my-12 p-4 sm:p-8 bg-slate-800/50 rounded-xl border border-slate-700 italic text-center text-sm sm:text-base">
                  &ldquo;{articleContent[5]}&rdquo;
                </div>
              </div>

              <div className="h-[20vh] sm:h-[30vh] mt-12 sm:mt-16 border-t border-slate-800 pt-8 text-center text-slate-600 text-xs sm:text-sm flex flex-col items-center">
                <span>End of article. Keep scrolling to test behaviors.</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import {
  AIBotOverlay,
  AIChatMiniAssistant,
  AgenticAd,
  AmbientTakeover,
  AnchorAd,
  CarouselAd,
  CinematicStoryAd,
  ContextualHighlightUnit,
  CountdownAd,
  DoubleXClose,
  ExpandableBanner,
  FloatingVideo,
  FullScreenTakeover,
  GestureUnlockAd,
  InfiniteStickyRibbon,
  Interscroller,
  LiveDataAdaptiveAd,
  MarqueeTicker,
  MicroCheckoutCommerce,
  OutstreamVideo,
  ParallaxDepthAd,
  PeelBackCorner,
  PlayableMini,
  ProgressBarAd,
  PushNotification,
  QuizAd,
  RotatingCubeAd,
  ScratchCardReward,
  ScrollMorphBanner,
  ShoppableHotspots,
  SideRailDock,
  SplitScreenSlider,
  StickyFooter,
  StickyTopLeaderboard,
  SwipeableCards,
} from '../pages/CreativeTemplateAdFormats';
import Template33VerticalStoryAd from './Template33VerticalStoryAd';
import Template34BottomSheetAd from './Template34BottomSheetAd';
import { BATCH_01_TEMPLATES } from './batch01';
import { BATCH_02_TEMPLATES } from './batch02';
import { BATCH_03_TEMPLATES } from './batch03';
import { BATCH_04_TEMPLATES } from './batch04';
import { BATCH_05_TEMPLATES } from './batch05';
import Template71AISummaryAd from './llm/Template71AISummaryAd';
import Template72PromptInlineAds from './llm/Template72PromptInlineAds';
import Template73PromptPopupAd from './llm/Template73PromptPopupAd';
import Template74SponsoredAnswerAd from './llm/Template74SponsoredAnswerAd';
import Template75KeywordAds from './llm/Template75KeywordAds';
import { FramePortal } from './primitives/FramePortal';

function TakeoverAdapter() {
  const [visible, setVisible] = useState(true);
  return visible ? (
    <FramePortal>
      <FullScreenTakeover onClose={() => setVisible(false)} />
    </FramePortal>
  ) : null;
}

function PushAdapter() {
  const [visible, setVisible] = useState(true);
  return visible ? <PushNotification onClose={() => setVisible(false)} /> : null;
}

const template = (order, id, displayName, description, family, size, placement, component) => ({
  order,
  id,
  displayName,
  description,
  family,
  size,
  placement,
  type: placement,
  component,
});

const LEGACY_CREATIVE_TEMPLATES = [
  template(1, 'interscroller', 'Interscroller (Full Reveal)', 'A scroll-revealed, high-impact brand canvas.', 'High impact', 'Responsive full-width', 'inline', Interscroller),
  template(2, 'sticky-footer', 'Sticky Footer Banner', 'A persistent offer anchored beneath page content.', 'Sticky', 'Responsive banner', 'overlay', StickyFooter),
  template(3, 'sticky-top', 'Sticky Top Leaderboard', 'A compact promotion pinned to the top edge.', 'Sticky', 'Leaderboard', 'overlay', StickyTopLeaderboard),
  template(4, 'anchor', 'Anchor Ad (Sticky Corner)', 'A contextual card anchored to a viewport corner.', 'Sticky', '288 × 96', 'overlay', AnchorAd),
  template(5, 'takeover', 'Full-Screen Takeover', 'An immersive, modal brand experience.', 'High impact', 'Full screen', 'overlay', TakeoverAdapter),
  template(6, 'playable', 'Playable Mini', 'A short interactive challenge with a reward state.', 'Interactive', 'Responsive 400px', 'inline', PlayableMini),
  template(7, 'agentic', 'Agentic AI Optimization', 'A simulated creative agent that selects a winning variant.', 'AI', 'Responsive card', 'inline', AgenticAd),
  template(8, 'swipeable', 'Swipeable Card Stack', 'A gesture-led stack for browsing product choices.', 'Commerce', '288 × 320', 'inline', SwipeableCards),
  template(9, 'floating-video', 'Floating Video (PiP)', 'Video that follows the reader in a picture-in-picture unit.', 'Video', 'Responsive / 320px PiP', 'inline', FloatingVideo),
  template(10, 'outstream', 'Outstream Video', 'A viewability-triggered video placement in article flow.', 'Video', 'Responsive 400px', 'inline', OutstreamVideo),
  template(11, 'quiz', 'Interactive Quiz / Poll', 'A lightweight audience question with instant feedback.', 'Interactive', 'Responsive card', 'inline', QuizAd),
  template(12, 'progress', 'Progress Bar (View Time)', 'A rewarded unit driven by active view time.', 'Rewarded', 'Responsive 192px', 'inline', ProgressBarAd),
  template(13, 'shoppable', 'Shoppable Hotspots', 'An explorable product scene with contextual hotspots.', 'Commerce', 'Responsive 400px', 'inline', ShoppableHotspots),
  template(14, 'expandable', 'Expandable Banner', 'A compact banner that morphs into a richer canvas.', 'Expandable', 'Responsive 100–400px', 'inline', ExpandableBanner),
  template(15, 'carousel', 'Carousel Multi-Slide', 'A horizontal, swipeable collection of product stories.', 'Commerce', 'Responsive carousel', 'inline', CarouselAd),
  template(16, 'push', 'Push-Style Notification', 'A notification-inspired offer card.', 'Native', '320px card', 'overlay', PushAdapter),
  template(17, 'double-x', 'Double X for Close', 'An experimental multi-stage dismissal interaction.', 'Experimental', 'Responsive card', 'inline', DoubleXClose),
  template(18, 'countdown', 'Countdown Timer Ad', 'A time-sensitive offer with a live countdown.', 'Commerce', 'Responsive banner', 'inline', CountdownAd),
  template(19, 'marquee', 'Marquee Ticker', 'A continuous breaking-news style message rail.', 'Display', 'Full-width ticker', 'overlay', MarqueeTicker),
  template(20, 'peel-back', 'Corner Curl / Peel-Back', 'A corner reveal that rewards hover exploration.', 'Expandable', '256px corner', 'overlay', PeelBackCorner),
  template(21, '3d-cube', 'Floating 3D Rotating Cube', 'A scroll-reactive dimensional display unit.', 'Experimental', '200px cube', 'inline', RotatingCubeAd),
  template(22, 'ai-bot', 'Floating AI Commerce Bot', 'A compact assistant for guided product discovery.', 'AI', '288px chat', 'overlay', AIBotOverlay),
  template(23, 'scroll-morph', 'Scroll-Morphing Banner', 'A creative canvas that changes shape with viewability.', 'Motion', 'Responsive 300px', 'inline', ScrollMorphBanner),
  template(24, 'parallax', 'Parallax Depth Ad', 'A pointer-responsive scene with layered depth.', 'Motion', 'Responsive 400px', 'inline', ParallaxDepthAd),
  template(25, 'contextual', 'Contextual Highlight Unit', 'A native insight attached to relevant article language.', 'Native', 'In-text', 'inline', ContextualHighlightUnit),
  template(26, 'ai-chat', 'AI Chat Mini Assistant', 'A conversational unit with guided prompts.', 'AI', 'Responsive 350px', 'inline', AIChatMiniAssistant),
  template(27, 'split-screen', 'Split-Screen Slider', 'A draggable before-and-after product comparison.', 'Interactive', 'Responsive 400px', 'inline', SplitScreenSlider),
  template(28, 'micro-checkout', 'Micro-Checkout Commerce', 'A compact purchase journey contained inside the ad.', 'Commerce', 'Responsive card', 'inline', MicroCheckoutCommerce),
  template(29, 'live-data', 'Live Data Adaptive Ad', 'Creative that changes with a simulated live data signal.', 'Dynamic', 'Responsive 250px', 'inline', LiveDataAdaptiveAd),
  template(30, 'ambient', 'Ambient Brand Takeover', 'A low-interruption visual treatment around page content.', 'High impact', 'Viewport', 'overlay', AmbientTakeover),
  template(31, 'side-rail', 'Expandable Side Rail Dock', 'A set of compact utilities docked to the viewport edge.', 'Sticky', '48–128px rail', 'overlay', SideRailDock),
  template(32, 'infinite-ribbon', 'Infinite Product Ribbon', 'A persistent moving rail of commerce offers.', 'Commerce', 'Full-width ribbon', 'overlay', InfiniteStickyRibbon),
  template(33, 'gesture', 'Gesture-Based Unlock', 'A swipe-to-unlock interaction for a gated offer.', 'Rewarded', 'Responsive 224px', 'inline', GestureUnlockAd),
  template(34, 'scratch-card', 'Reward Scratch Card', 'A tactile scratch interaction that reveals a reward.', 'Rewarded', 'Responsive 300px', 'inline', ScratchCardReward),
  template(35, 'cinematic', 'Scroll-Synced Cinematic Story', 'A long-form sequence synchronized to article scrolling.', 'Story', 'Responsive cinematic', 'inline', CinematicStoryAd),
];

const FOUNDATION_TEMPLATES = [
  template(133, 'vertical-story', 'Vertical Story Ad', 'A four-frame, full-screen story with tap, hold, and swipe gestures.', 'Story', 'Full screen · 9:16', 'overlay', Template33VerticalStoryAd),
  template(134, 'bottom-sheet', 'Bottom Sheet Ad', 'A draggable product detail sheet with peek, half, and full states.', 'Native commerce', 'Responsive bottom sheet', 'overlay', Template34BottomSheetAd),
];

const LLM_TEMPLATES = [
  template(171, 'ai-summary', 'AI Summary with Sponsored Insight', 'An AI-generated article summary with a clearly labelled contextual recommendation.', 'LLM', 'Responsive answer card', 'inline', Template71AISummaryAd),
  template(172, 'prompt-inline-ads', 'Prompts with Inline Ads', 'Follow-up prompt chips that introduce relevant sponsored responses inside the conversation.', 'LLM', 'Responsive prompt unit', 'inline', Template72PromptInlineAds),
  template(173, 'prompt-popup', 'Popup Ad with Prompts', 'A dismissible AI companion with actionable prompt suggestions beneath its message.', 'LLM', 'Responsive popup', 'overlay', Template73PromptPopupAd),
  template(174, 'sponsored-answer', 'LLM Sponsored Answer', 'An explainable AI recommendation that adapts its answer to the selected objective.', 'LLM', 'Responsive answer card', 'inline', Template74SponsoredAnswerAd),
  template(175, 'keyword-ads', 'Keyword Ads', 'Highlighted high-intent phrases open an AI summary, 300 × 250 ad, and contextual prompts.', 'LLM', 'Keyword + popup widget', 'inline', Template75KeywordAds),
];

export const NEW_CREATIVE_TEMPLATES = [
  ...BATCH_01_TEMPLATES,
  ...BATCH_02_TEMPLATES,
  ...BATCH_03_TEMPLATES,
  ...FOUNDATION_TEMPLATES,
  ...BATCH_04_TEMPLATES,
  ...BATCH_05_TEMPLATES,
  ...LLM_TEMPLATES,
].sort((a, b) => a.order - b.order);

export const CREATIVE_TEMPLATES = [
  ...LEGACY_CREATIVE_TEMPLATES,
  ...NEW_CREATIVE_TEMPLATES,
];

export const getCreativeTemplate = (id) => CREATIVE_TEMPLATES.find((item) => item.id === id);

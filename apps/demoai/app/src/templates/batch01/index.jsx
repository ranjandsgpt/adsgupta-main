import { lazy } from 'react';

const Template01DragRevealPuzzleAd = lazy(() => import('./Template01DragRevealPuzzleAd'));
const Template02TiltParallaxAd = lazy(() => import('./Template02TiltParallaxAd'));
const Template03ShakeToWinAd = lazy(() => import('./Template03ShakeToWinAd'));
const Template04ProductDuelAd = lazy(() => import('./Template04ProductDuelAd'));
const Template05PlayableEndlessRunner = lazy(() => import('./Template05PlayableEndlessRunner'));
const Template06TriviaRewardUnlock = lazy(() => import('./Template06TriviaRewardUnlock'));
const Template07SpinWheelOverlay = lazy(() => import('./Template07SpinWheelOverlay'));
const Template08EmojiReactionPoll = lazy(() => import('./Template08EmojiReactionPoll'));
const Template09CelebrationMicroInteractionAd = lazy(() => import('./Template09CelebrationMicroInteractionAd'));
const Template10LiveABPreferenceTest = lazy(() => import('./Template10LiveABPreferenceTest'));
const Template11AIPersonalizedCopyAd = lazy(() => import('./Template11AIPersonalizedCopyAd'));
const Template12AIAvatarSpokesperson = lazy(() => import('./Template12AIAvatarSpokesperson'));
const Template13DynamicLocalizationAd = lazy(() => import('./Template13DynamicLocalizationAd'));
const Template14VoiceCTAAd = lazy(() => import('./Template14VoiceCTAAd'));

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

export const BATCH_01_TEMPLATES = [
  template(101, 'drag-reveal-puzzle', 'Drag-to-Reveal Puzzle Ad', 'A draggable reveal challenge that unlocks a promotional reward.', 'Interactive', 'Responsive card', 'inline', Template01DragRevealPuzzleAd),
  template(102, 'tilt-parallax', 'Tilt Parallax Ad', 'A pointer, touch, and keyboard-driven dimensional product scene.', 'Motion', 'Responsive card', 'inline', Template02TiltParallaxAd),
  template(103, 'shake-to-win', 'Shake-to-Win Ad', 'A motion-inspired tap challenge with an instant prize state.', 'Rewarded', 'Responsive card', 'inline', Template03ShakeToWinAd),
  template(104, 'product-duel', 'Product Duel (Swipe to Compare)', 'A swipeable split view that asks audiences to choose a product winner.', 'Commerce', 'Responsive card', 'inline', Template04ProductDuelAd),
  template(105, 'playable-endless-runner', 'Playable Endless Runner', 'A canvas-based jump game with keyboard and touch controls.', 'Playable', 'Responsive 420 × 200', 'inline', Template05PlayableEndlessRunner),
  template(106, 'trivia-reward-unlock', 'Trivia Reward Unlock', 'A one-question knowledge challenge that unlocks bonus points.', 'Rewarded', 'Responsive card', 'inline', Template06TriviaRewardUnlock),
  template(107, 'spin-wheel-overlay', 'Spin-the-Wheel Overlay', 'A prize-wheel experience with locally simulated outcomes.', 'Rewarded', 'Responsive card', 'inline', Template07SpinWheelOverlay),
  template(108, 'emoji-reaction-poll', 'Emoji Reaction Poll', 'A fast, expressive audience poll with mocked live results.', 'Interactive', 'Responsive card', 'inline', Template08EmojiReactionPoll),
  template(109, 'celebration-micro-interaction', 'Celebration Micro-Interaction Ad', 'A compact canvas celebration that rewards a lightweight action.', 'Motion', 'Responsive card', 'inline', Template09CelebrationMicroInteractionAd),
  template(110, 'live-ab-preference-test', 'Live A/B Preference Test', 'A side-by-side creative preference test with simulated live voting.', 'Research', 'Responsive card', 'inline', Template10LiveABPreferenceTest),
  template(111, 'ai-personalized-copy', 'AI Personalized Copy Ad', 'A local mock generator that adapts campaign copy to a selected persona.', 'AI', 'Responsive card', 'inline', Template11AIPersonalizedCopyAd),
  template(112, 'ai-avatar-spokesperson', 'AI Avatar Spokesperson', 'An accessible, audio-free simulation of a synthetic spokesperson.', 'AI', 'Responsive video card', 'inline', Template12AIAvatarSpokesperson),
  template(113, 'dynamic-localization', 'Dynamic Localization Ad', 'A market switcher that updates language, pricing, offer, and CTA.', 'Dynamic', 'Responsive card', 'inline', Template13DynamicLocalizationAd),
  template(114, 'voice-cta', 'Voice CTA Ad', 'A privacy-safe hold-to-speak simulation for voice-led intent.', 'Experimental', 'Responsive card', 'inline', Template14VoiceCTAAd),
];

export default BATCH_01_TEMPLATES;

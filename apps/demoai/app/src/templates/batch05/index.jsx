import { lazy } from 'react';

const Template58MrecStoryMorph = lazy(() => import('./Template58MrecStoryMorph'));
const Template59MrecInterscrollerMorph = lazy(() => import('./Template59MrecInterscrollerMorph'));
const Template60MrecArMorph = lazy(() => import('./Template60MrecArMorph'));
const Template61MrecVideoStoryMorph = lazy(() => import('./Template61MrecVideoStoryMorph'));
const Template62MrecCarouselMorph = lazy(() => import('./Template62MrecCarouselMorph'));
const Template63MrecQuizFlip = lazy(() => import('./Template63MrecQuizFlip'));
const Template64BannerChatMorph = lazy(() => import('./Template64BannerChatMorph'));
const Template65WidgetConfiguratorMorph = lazy(() => import('./Template65WidgetConfiguratorMorph'));
const Template66CalendarWidgetAd = lazy(() => import('./Template66CalendarWidgetAd'));
const Template67ActivityRingWidgetAd = lazy(() => import('./Template67ActivityRingWidgetAd'));
const Template68ReminderWidgetAd = lazy(() => import('./Template68ReminderWidgetAd'));
const Template69PromptChipsAd = lazy(() => import('./Template69PromptChipsAd'));
const Template70WidgetStackAd = lazy(() => import('./Template70WidgetStackAd'));

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

export const BATCH_05_TEMPLATES = [
  template(158, 'mrec-story-morph', 'MREC to Story Morph', 'A compact MREC that expands into a touch-first vertical story.', 'Morph', '300 × 250 to full screen', 'inline', Template58MrecStoryMorph),
  template(159, 'mrec-interscroller-morph', 'MREC to Interscroller Morph', 'A controllable MREC reveal that grows into an interscroller canvas.', 'Morph', 'Responsive MREC', 'inline', Template59MrecInterscrollerMorph),
  template(160, 'mrec-ar-morph', 'MREC to AR Morph', 'A tap-initiated camera preview with a guaranteed local 360-degree fallback.', 'Immersive', 'Responsive MREC', 'inline', Template60MrecArMorph),
  template(161, 'mrec-video-story-morph', 'MREC to Video Story Morph', 'A lightweight chapter-based video-story simulation rendered without external media.', 'Video', 'Responsive MREC', 'inline', Template61MrecVideoStoryMorph),
  template(162, 'mrec-carousel-morph', 'MREC to Carousel Morph', 'A swipeable and keyboard-accessible product carousel.', 'Commerce', 'Responsive MREC', 'inline', Template62MrecCarouselMorph),
  template(163, 'mrec-quiz-flip', 'MREC to Quiz Flip', 'A one-tap quiz that flips into an educational result.', 'Interactive', 'Responsive MREC', 'inline', Template63MrecQuizFlip),
  template(164, 'banner-chat-morph', 'Banner to Chat Morph', 'A compact banner that expands into a guided chat experience.', 'Conversational', 'Responsive banner', 'inline', Template64BannerChatMorph),
  template(165, 'widget-configurator-morph', 'Widget to Configurator Morph', 'A product widget that opens clean, local configuration controls.', 'Commerce', 'Responsive widget', 'inline', Template65WidgetConfiguratorMorph),
  template(166, 'calendar-widget-ad', 'Calendar Widget Ad', 'A native calendar card that generates a real ICS file after an explicit tap.', 'Native widget', 'Small widget', 'inline', Template66CalendarWidgetAd),
  template(167, 'activity-ring-widget-ad', 'Activity Ring Widget Ad', 'An activity-inspired progress widget with a measurable completion state.', 'Native widget', 'Small widget', 'inline', Template67ActivityRingWidgetAd),
  template(168, 'reminder-widget-ad', 'Reminder Widget Ad', 'A permission-free local reminder demonstration with timer cleanup.', 'Native widget', 'Small widget', 'inline', Template68ReminderWidgetAd),
  template(169, 'prompt-chips-ad', 'Prompt Chips Ad', 'A guided prompt-chip creative with instant local responses.', 'Conversational', 'Responsive widget', 'inline', Template69PromptChipsAd),
  template(170, 'widget-stack-ad', 'Widget Stack Ad', 'A touch and keyboard controlled stack of native utility cards.', 'Native widget', 'Responsive widget', 'inline', Template70WidgetStackAd),
];

export {
  Template58MrecStoryMorph,
  Template59MrecInterscrollerMorph,
  Template60MrecArMorph,
  Template61MrecVideoStoryMorph,
  Template62MrecCarouselMorph,
  Template63MrecQuizFlip,
  Template64BannerChatMorph,
  Template65WidgetConfiguratorMorph,
  Template66CalendarWidgetAd,
  Template67ActivityRingWidgetAd,
  Template68ReminderWidgetAd,
  Template69PromptChipsAd,
  Template70WidgetStackAd,
};

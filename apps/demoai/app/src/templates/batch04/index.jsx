import { lazy } from 'react';

const Template45PodcastNativePlayerAd = lazy(() => import('./Template45PodcastNativePlayerAd'));
const Template46AccessibleAudioDescriptionAd = lazy(() => import('./Template46AccessibleAudioDescriptionAd'));
const Template47MultiStepLeadFormAd = lazy(() => import('./Template47MultiStepLeadFormAd'));
const Template48QrBridgeAd = lazy(() => import('./Template48QrBridgeAd'));
const Template49AppInstallCardAd = lazy(() => import('./Template49AppInstallCardAd'));
const Template50CountdownBannerAd = lazy(() => import('./Template50CountdownBannerAd'));
const Template51AiPromptBarWidget = lazy(() => import('./Template51AiPromptBarWidget'));
const Template52GenerativeCreativeWidget = lazy(() => import('./Template52GenerativeCreativeWidget'));
const Template53WeatherWidgetAd = lazy(() => import('./Template53WeatherWidgetAd'));
const Template54PriceTickerWidget = lazy(() => import('./Template54PriceTickerWidget'));
const Template55NotificationStackWidgetAd = lazy(() => import('./Template55NotificationStackWidgetAd'));
const Template56CoPilotDockWidget = lazy(() => import('./Template56CoPilotDockWidget'));
const Template57AppGridWidgetAd = lazy(() => import('./Template57AppGridWidgetAd'));

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

export const BATCH_04_TEMPLATES = [
  template(145, 'podcast-native-player-ad', 'Podcast Native Player Ad', 'A native podcast player with seek and playback simulation.', 'Audio', 'Responsive card', 'inline', Template45PodcastNativePlayerAd),
  template(146, 'accessible-audio-description-ad', 'Accessible Audio-Description Ad', 'An accessible media preview with optional described visual cues.', 'Accessible media', 'Responsive card', 'inline', Template46AccessibleAudioDescriptionAd),
  template(147, 'multi-step-lead-form-ad', 'Multi-Step Lead Form Ad', 'A three-step, local-only lead journey with validation.', 'Lead generation', 'Responsive form', 'inline', Template47MultiStepLeadFormAd),
  template(148, 'qr-bridge-ad', 'QR Bridge Ad', 'A clearly labeled QR-like visual and user-triggered deep-link demo.', 'Cross-device', 'Responsive card', 'inline', Template48QrBridgeAd),
  template(149, 'app-install-card-ad', 'App Install Card Ad', 'A simulated app listing and local install progress flow.', 'App promotion', 'Responsive card', 'inline', Template49AppInstallCardAd),
  template(150, 'countdown-banner-ad', 'Countdown Banner Ad', 'A restartable urgency banner using a local countdown.', 'Dynamic', 'Responsive banner', 'inline', Template50CountdownBannerAd),
  template(151, 'ai-prompt-bar-widget', 'AI Prompt Bar Widget', 'A compact prompt bar with deterministic local responses.', 'AI', 'Responsive widget', 'inline', Template51AiPromptBarWidget),
  template(152, 'generative-creative-widget', 'Generative Creative Widget', 'A deterministic studio for cycling composed creative variants.', 'AI creative', 'Responsive canvas', 'inline', Template52GenerativeCreativeWidget),
  template(153, 'weather-widget-ad', 'Weather Widget Ad', 'A city-selectable weather creative using fictional local data.', 'Dynamic', 'Responsive widget', 'inline', Template53WeatherWidgetAd),
  template(154, 'price-ticker-widget', 'Price Ticker Widget', 'A pausable ticker with deterministic fictional prices.', 'Dynamic', 'Responsive ticker', 'inline', Template54PriceTickerWidget),
  template(155, 'notification-stack-widget-ad', 'Notification Stack Widget Ad', 'A dismissible and restorable stack of simulated updates.', 'Native', 'Responsive stack', 'inline', Template55NotificationStackWidgetAd),
  template(156, 'co-pilot-dock-widget', 'Co-Pilot Dock Widget', 'An expandable task helper with scripted local planning.', 'AI', 'Responsive dock', 'inline', Template56CoPilotDockWidget),
  template(157, 'app-grid-widget-ad', 'App Grid Widget Ad', 'A keyboard-friendly grid of locally simulated app tiles.', 'Native', 'Responsive grid', 'inline', Template57AppGridWidgetAd),
];

export {
  Template45PodcastNativePlayerAd,
  Template46AccessibleAudioDescriptionAd,
  Template47MultiStepLeadFormAd,
  Template48QrBridgeAd,
  Template49AppInstallCardAd,
  Template50CountdownBannerAd,
  Template51AiPromptBarWidget,
  Template52GenerativeCreativeWidget,
  Template53WeatherWidgetAd,
  Template54PriceTickerWidget,
  Template55NotificationStackWidgetAd,
  Template56CoPilotDockWidget,
  Template57AppGridWidgetAd,
};

export default BATCH_04_TEMPLATES;

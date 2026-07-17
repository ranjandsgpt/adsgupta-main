import { lazy } from 'react';

const Template15ChatToPurchaseAd = lazy(() => import('./Template15ChatToPurchaseAd'));
const Template16WeatherReactiveAd = lazy(() => import('./Template16WeatherReactiveAd'));
const Template17TimeOfDayAdaptiveAd = lazy(() => import('./Template17TimeOfDayAdaptiveAd'));
const Template18AdaptiveThemeAd = lazy(() => import('./Template18AdaptiveThemeAd'));
const Template19ARTryOnLauncher = lazy(() => import('./Template19ARTryOnLauncher'));
const Template20Spin360ViewerAd = lazy(() => import('./Template20Spin360ViewerAd'));
const Template21BeforeAfterSliderAd = lazy(() => import('./Template21BeforeAfterSliderAd'));
const Template22ProductConfiguratorAd = lazy(() => import('./Template22ProductConfiguratorAd'));
const Template23LivestreamShoppingAd = lazy(() => import('./Template23LivestreamShoppingAd'));
const Template24CartRecoverySlideIn = lazy(() => import('./Template24CartRecoverySlideIn'));
const Template25PostPurchaseCrossSellAd = lazy(() => import('./Template25PostPurchaseCrossSellAd'));
const Template26ShoppableHowToAd = lazy(() => import('./Template26ShoppableHowToAd'));
const Template27QuoteEstimatorAd = lazy(() => import('./Template27QuoteEstimatorAd'));
const Template28LoyaltyPointsWidgetAd = lazy(() => import('./Template28LoyaltyPointsWidgetAd'));
const Template29ShareToUnlockAd = lazy(() => import('./Template29ShareToUnlockAd'));

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

export const BATCH_02_TEMPLATES = [
  template(115, 'chat-to-purchase', 'Chat-to-Purchase Ad', 'A guided concierge chat that recommends a product and completes a simulated purchase.', 'AI', 'Responsive card', 'inline', Template15ChatToPurchaseAd),
  template(116, 'weather-reactive', 'Weather-Reactive Ad', 'Creative that re-themes headline, scene, and offer around a simulated weather feed.', 'Dynamic', 'Responsive card', 'inline', Template16WeatherReactiveAd),
  template(117, 'time-of-day', 'Time-of-Day Adaptive Ad', 'A daypart-aware unit that follows the visitor\u2019s clock, with a demo daypart preview.', 'Dynamic', 'Responsive card', 'inline', Template17TimeOfDayAdaptiveAd),
  template(118, 'adaptive-theme', 'Adaptive Theme Ad', 'Creative that matches light, dark, and high-contrast system preferences automatically.', 'Native', 'Responsive card', 'inline', Template18AdaptiveThemeAd),
  template(119, 'ar-try-on', 'AR Try-On Launcher', 'A tap-to-start camera try-on for glasses that falls back to a simulated model preview.', 'Interactive', 'Responsive 4:5 viewport', 'inline', Template19ARTryOnLauncher),
  template(120, 'spin-360', '360 Spin Viewer Ad', 'A procedurally rendered product you can spin by dragging, arrow keys, or auto-rotation.', 'Interactive', 'Responsive 4:3 canvas', 'inline', Template20Spin360ViewerAd),
  template(121, 'before-after', 'Before/After Slider Ad', 'A draggable, keyboard-accessible reveal comparing a product\u2019s before and after states.', 'Interactive', 'Responsive 4:3', 'inline', Template21BeforeAfterSliderAd),
  template(122, 'configurator', 'Product Configurator Ad', 'Pick color, size, and add-ons with a live preview and running price inside the ad.', 'Commerce', 'Responsive card', 'inline', Template22ProductConfiguratorAd),
  template(123, 'livestream-shopping', 'Livestream Shopping Ad', 'A simulated live shopping stream with scripted chat, reactions, and rotating drop deals.', 'Commerce', 'Responsive 4:5', 'inline', Template23LivestreamShoppingAd),
  template(124, 'cart-recovery', 'Cart Recovery Slide-In', 'An abandoned-cart reminder with a discount; demo triggers at 3s, production at ~30s idle.', 'Commerce', 'Responsive card', 'inline', Template24CartRecoverySlideIn),
  template(125, 'cross-sell', 'Post-Purchase Cross-Sell Ad', 'An order-confirmation moment offering complementary items added to the same shipment.', 'Commerce', 'Responsive card', 'inline', Template25PostPurchaseCrossSellAd),
  template(126, 'shoppable-how-to', 'Shoppable How-To Ad', 'A step-by-step tutorial where each step surfaces the product used, ready to add to cart.', 'Commerce', 'Responsive card', 'inline', Template26ShoppableHowToAd),
  template(127, 'quote-estimator', 'Quote Estimator Ad', 'An in-ad insurance estimator with locally computed pricing and a save-quote action.', 'Lead gen', 'Responsive card', 'inline', Template27QuoteEstimatorAd),
  template(128, 'loyalty-points', 'Loyalty Points Widget Ad', 'A live points balance with tier progress, earn actions, and redeemable rewards.', 'Rewarded', 'Responsive card', 'inline', Template28LoyaltyPointsWidgetAd),
  template(129, 'share-to-unlock', 'Share-to-Unlock Ad', 'A gated offer unlocked by a simulated share flow that reveals a copyable promo code.', 'Rewarded', 'Responsive card', 'inline', Template29ShareToUnlockAd),
];

export const getBatch02Template = (id) => BATCH_02_TEMPLATES.find((item) => item.id === id);

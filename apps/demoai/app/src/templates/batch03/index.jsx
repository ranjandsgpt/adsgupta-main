import { lazy } from 'react';

const Template30TextWrapNativeInsert = lazy(() => import('./Template30TextWrapNativeInsert'));
const Template31InFeedNativeCard = lazy(() => import('./Template31InFeedNativeCard'));
const Template32SponsoredSearchResultAd = lazy(() => import('./Template32SponsoredSearchResultAd'));
const Template35CommentSectionNativeAd = lazy(() => import('./Template35CommentSectionNativeAd'));
const Template36MapLocalOfferAd = lazy(() => import('./Template36MapLocalOfferAd'));
const Template37GeoFenceTriggerAd = lazy(() => import('./Template37GeoFenceTriggerAd'));
const Template38LivePriceDropTickerAd = lazy(() => import('./Template38LivePriceDropTickerAd'));
const Template39SocialProofCounterAd = lazy(() => import('./Template39SocialProofCounterAd'));
const Template40UGCCarouselAd = lazy(() => import('./Template40UGCCarouselAd'));
const Template41TestimonialBubbleAd = lazy(() => import('./Template41TestimonialBubbleAd'));
const Template42ScoreOverlaySponsorship = lazy(() => import('./Template42ScoreOverlaySponsorship'));
const Template43TickerSponsorshipStrip = lazy(() => import('./Template43TickerSponsorshipStrip'));
const Template44ReadingProgressRewardAd = lazy(() => import('./Template44ReadingProgressRewardAd'));

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

export const BATCH_03_TEMPLATES = [
  template(130, 'text-wrap-native-insert', 'Text-Wrap Native Insert', 'A contained editorial insert whose copy flows beside procedural creative.', 'Native', 'Responsive article insert', 'inline', Template30TextWrapNativeInsert),
  template(131, 'in-feed-native-card', 'In-Feed Native Card', 'A social-feed card with creator-style video art and save controls.', 'Native', 'Responsive feed card', 'inline', Template31InFeedNativeCard),
  template(132, 'sponsored-search-result-ad', 'Sponsored Search Result Ad', 'A clearly labeled promoted result tailored to an editable search query.', 'Native commerce', 'Responsive search result', 'inline', Template32SponsoredSearchResultAd),
  template(135, 'comment-section-native-ad', 'Comment Section Native Ad', 'A sponsored brand reply designed to sit naturally among article comments.', 'Native', 'Responsive comment', 'inline', Template35CommentSectionNativeAd),
  template(136, 'map-local-offer-ad', 'Map Local Offer Ad', 'An illustrated local map with selectable nearby offers and directions.', 'Location', 'Responsive map card', 'inline', Template36MapLocalOfferAd),
  template(137, 'geo-fence-trigger-ad', 'Geo-Fence Trigger Ad', 'A privacy-safe simulation of an offer unlocked on entering a nearby zone.', 'Location', 'Responsive card', 'inline', Template37GeoFenceTriggerAd),
  template(138, 'live-price-drop-ticker-ad', 'Live Price Drop Ticker Ad', 'A compact commerce ticker that simulates a live falling price.', 'Dynamic commerce', 'Responsive ticker', 'inline', Template38LivePriceDropTickerAd),
  template(139, 'social-proof-counter-ad', 'Social Proof Counter Ad', 'A live-style community counter with an interactive join state.', 'Dynamic', 'Responsive card', 'inline', Template39SocialProofCounterAd),
  template(140, 'ugc-carousel-ad', 'UGC Carousel Ad', 'A swipeable collection of procedural creator posts and product stories.', 'Social commerce', 'Mobile carousel', 'inline', Template40UGCCarouselAd),
  template(141, 'testimonial-bubble-ad', 'Testimonial Bubble Ad', 'An expandable verified-customer quote paired with a trial action.', 'Native', 'Responsive bubble', 'inline', Template41TestimonialBubbleAd),
  template(142, 'score-overlay-sponsorship', 'Score Overlay Sponsorship', 'A compact live-score treatment with an integrated sponsor message.', 'Sponsorship', 'Responsive scoreboard', 'inline', Template42ScoreOverlaySponsorship),
  template(143, 'ticker-sponsorship-strip', 'Ticker Sponsorship Strip', 'A pausable data strip with a clearly attributed sponsor report.', 'Sponsorship', 'Full-width strip', 'inline', Template43TickerSponsorshipStrip),
  template(144, 'reading-progress-reward-ad', 'Reading Progress Reward Ad', 'An article-scroll reward that unlocks after meaningful reading progress.', 'Rewarded', 'Responsive article unit', 'inline', Template44ReadingProgressRewardAd),
];

export {
  Template30TextWrapNativeInsert,
  Template31InFeedNativeCard,
  Template32SponsoredSearchResultAd,
  Template35CommentSectionNativeAd,
  Template36MapLocalOfferAd,
  Template37GeoFenceTriggerAd,
  Template38LivePriceDropTickerAd,
  Template39SocialProofCounterAd,
  Template40UGCCarouselAd,
  Template41TestimonialBubbleAd,
  Template42ScoreOverlaySponsorship,
  Template43TickerSponsorshipStrip,
  Template44ReadingProgressRewardAd,
};

/**
 * StickyAd.jsx - 320x50 Sticky Footer Advertisement
 * Fixed position ad with close functionality
 * Integrates with AdProvider for header bidding
 */
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ExternalLink, Sparkles } from 'lucide-react';

const StickyAd = ({ 
  onAdClick, 
  isVisible = true,
  adContent = null 
}) => {
  const [isDismissed, setIsDismissed] = useState(false);
  const [adLoaded, setAdLoaded] = useState(false);
  const [impressionLogged, setImpressionLogged] = useState(false);

  // Default ad content if not provided
  const defaultAd = {
    headline: "Discover Premium Coconut Products",
    subtext: "Shop AI-curated selections",
    cta: "Shop Now",
    sponsor: "Sponsored",
    image: "https://images.unsplash.com/photo-1525351326368-efbb5cb6814d?w=200&q=80",
    targetUrl: "#"
  };

  const ad = adContent || defaultAd;

  // Simulate ad load
  useEffect(() => {
    const timer = setTimeout(() => {
      setAdLoaded(true);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  // Log impression when ad becomes visible
  useEffect(() => {
    if (adLoaded && isVisible && !isDismissed && !impressionLogged) {
      console.log('[StickyAd] Impression logged for:', ad.headline);
      setImpressionLogged(true);
      // In production: send impression pixel/beacon
    }
  }, [adLoaded, isVisible, isDismissed, impressionLogged, ad.headline]);

  const handleAdClick = (e) => {
    e.stopPropagation();
    console.log('[StickyAd] Click logged for:', ad.headline);
    // In production: send click tracking
    onAdClick?.();
  };

  const handleDismiss = (e) => {
    e.stopPropagation();
    setIsDismissed(true);
  };

  if (isDismissed || !isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="fixed bottom-0 left-0 right-0 z-50 flex justify-center p-2 pointer-events-none"
        data-testid="sticky-ad-container"
      >
        <motion.div
          className="relative w-[320px] h-[50px] rounded-lg overflow-hidden shadow-[0_-4px_20px_rgba(0,0,0,0.5)] pointer-events-auto"
          style={{
            background: 'linear-gradient(135deg, #0A0A0A 0%, #1a1a2e 100%)'
          }}
          whileHover={{ scale: 1.02 }}
          data-testid="sticky-ad"
        >
          {/* Border gradient effect */}
          <div className="absolute inset-0 rounded-lg border border-cyan-500/30" />
          
          {/* Ad badge */}
          <div className="absolute top-1 left-1 px-1.5 py-0.5 bg-black/80 rounded text-[8px] font-bold text-zinc-400">
            {ad.sponsor}
          </div>
          
          {/* Close button */}
          <button
            onClick={handleDismiss}
            className="absolute top-1 right-1 p-0.5 rounded bg-black/60 text-zinc-500 hover:text-white hover:bg-black/80 transition-all z-10"
            data-testid="sticky-ad-close"
          >
            <X size={12} />
          </button>
          
          {/* Ad Content */}
          <button
            onClick={handleAdClick}
            className="w-full h-full flex items-center gap-3 px-3 pr-8"
          >
            {/* Product thumbnail */}
            <div className="w-10 h-10 rounded-md overflow-hidden flex-shrink-0 border border-white/10">
              <img 
                src={ad.image} 
                alt="" 
                className="w-full h-full object-cover"
              />
            </div>
            
            {/* Text content */}
            <div className="flex-1 min-w-0 text-left">
              <p className="text-white text-xs font-medium truncate">{ad.headline}</p>
              <p className="text-zinc-500 text-[10px] truncate">{ad.subtext}</p>
            </div>
            
            {/* CTA */}
            <div className="flex items-center gap-1 px-2 py-1 rounded bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-[10px] font-medium flex-shrink-0">
              <Sparkles size={10} />
              {ad.cta}
            </div>
          </button>
          
          {/* Loading state */}
          {!adLoaded && (
            <div className="absolute inset-0 bg-[#0A0A0A] flex items-center justify-center">
              <div className="w-4 h-4 border-2 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin" />
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default StickyAd;

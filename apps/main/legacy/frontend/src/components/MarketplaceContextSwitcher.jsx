/**
 * Marketplace Context Switcher Component
 * Responsive top-bar for switching between Amazon, Walmart, and Others
 */
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, ChevronDown, Bell, Mail, Loader2, CheckCircle2, X } from 'lucide-react';

const API_URL = process.env.REACT_APP_BACKEND_URL;

// Marketplace configurations
export const MARKETPLACES = [
  { 
    id: 'amazon', 
    label: 'Amazon', 
    color: '#FF9900',
    bgColor: 'bg-orange-500/10',
    borderColor: 'border-orange-500/30',
    textColor: 'text-orange-400',
    status: 'active',
    description: 'Full audit engine available'
  },
  { 
    id: 'walmart', 
    label: 'Walmart', 
    color: '#0071DC',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/30',
    textColor: 'text-blue-400',
    status: 'staging',
    description: 'Protocol in development'
  },
  { 
    id: 'blinkit', 
    label: 'Blinkit', 
    color: '#F8C800',
    bgColor: 'bg-yellow-500/10',
    borderColor: 'border-yellow-500/30',
    textColor: 'text-yellow-400',
    status: 'coming',
    description: 'Quick commerce protocol'
  },
  { 
    id: 'swiggy', 
    label: 'Swiggy Instamart', 
    color: '#FC8019',
    bgColor: 'bg-orange-500/10',
    borderColor: 'border-orange-500/30',
    textColor: 'text-orange-400',
    status: 'coming',
    description: 'Quick commerce protocol'
  },
  { 
    id: 'zomato', 
    label: 'Zomato', 
    color: '#E23744',
    bgColor: 'bg-red-500/10',
    borderColor: 'border-red-500/30',
    textColor: 'text-red-400',
    status: 'coming',
    description: 'Quick commerce protocol'
  }
];

// Notify Me Modal for placeholder marketplaces
const NotifyMeModal = ({ marketplace, isOpen, onClose }) => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;
    
    setIsSubmitting(true);
    
    try {
      await fetch(`${API_URL}/api/leads/capture`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email, 
          source: `marketplace_waitlist_${marketplace?.id}`,
          marketplace: marketplace?.label
        })
      });
      setIsSubmitted(true);
      setTimeout(() => {
        onClose();
        setIsSubmitted(false);
        setEmail('');
      }, 2500);
    } catch (error) {
      console.error('Lead capture error:', error);
    }
    
    setIsSubmitting(false);
  };
  
  if (!isOpen) return null;
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-6"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="relative max-w-md w-full rounded-2xl overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Gradient border effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 via-blue-500 to-cyan-500 p-[1px] rounded-2xl">
          <div className="w-full h-full bg-[#0A1628] rounded-2xl" />
        </div>
        
        <div className="relative p-8">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-lg text-zinc-500 hover:text-white hover:bg-white/10 transition-all"
          >
            <X size={20} />
          </button>
          
          {!isSubmitted ? (
            <>
              <div className="text-center mb-6">
                <div className={`w-16 h-16 mx-auto rounded-2xl ${marketplace?.bgColor} flex items-center justify-center mb-4`}>
                  <ShoppingCart size={28} className={marketplace?.textColor} />
                </div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 mb-4">
                  <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                  <span className="text-cyan-400 text-xs font-medium uppercase tracking-wider">
                    Protocol in Development
                  </span>
                </div>
                <h2 className="text-2xl font-bold text-white font-['Space_Grotesk'] mb-2">
                  {marketplace?.label} Audit Engine
                </h2>
                <p className="text-zinc-400">
                  Be the first to access our {marketplace?.label} optimization protocol when it launches.
                </p>
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="relative">
                  <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    required
                    className="w-full pl-12 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-zinc-500 focus:border-cyan-500/50 focus:outline-none transition-all"
                    data-testid="notify-email-input"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting || !email}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-bold flex items-center justify-center gap-2 disabled:opacity-50 transition-all hover:shadow-[0_0_30px_rgba(0,240,255,0.3)]"
                  data-testid="notify-submit-btn"
                >
                  {isSubmitting ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : (
                    <>
                      <Bell size={18} />
                      Notify Me at Launch
                    </>
                  )}
                </button>
              </form>
              
              <p className="text-zinc-600 text-xs text-center mt-4">
                We'll notify you when {marketplace?.label} integration goes live. No spam.
              </p>
            </>
          ) : (
            <div className="text-center py-8">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', damping: 10 }}
                className="w-20 h-20 mx-auto rounded-full bg-emerald-500/20 flex items-center justify-center mb-4"
              >
                <CheckCircle2 size={40} className="text-emerald-400" />
              </motion.div>
              <h3 className="text-xl font-bold text-white mb-2">You're on the List!</h3>
              <p className="text-zinc-400">We'll notify you when {marketplace?.label} launches.</p>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

// Protocol Development State Component
export const ProtocolDevelopmentState = ({ marketplace, onNotifyClick }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-2xl mx-auto text-center py-16"
    >
      {/* Animated Protocol Visual */}
      <div className="relative mb-8">
        <div className={`w-24 h-24 mx-auto rounded-2xl ${marketplace.bgColor} border ${marketplace.borderColor} flex items-center justify-center`}>
          <ShoppingCart size={40} className={marketplace.textColor} />
        </div>
        
        {/* Pulsing rings */}
        <div className={`absolute inset-0 m-auto w-24 h-24 rounded-2xl border ${marketplace.borderColor} animate-ping opacity-20`} />
        <div className={`absolute inset-0 m-auto w-32 h-32 rounded-2xl border ${marketplace.borderColor} animate-pulse opacity-10`} />
      </div>
      
      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/10 border border-cyan-500/30 mb-6">
        <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
        <span className="text-cyan-400 text-sm font-medium tracking-wider">
          PROTOCOL DEVELOPMENT IN PROGRESS
        </span>
      </div>
      
      <h2 className="text-3xl font-bold text-white font-['Space_Grotesk'] mb-4">
        {marketplace.label} Audit Engine
      </h2>
      
      <p className="text-zinc-400 text-lg mb-8 max-w-xl mx-auto">
        Our team is building a comprehensive optimization protocol for {marketplace.label}. 
        {marketplace.id === 'walmart' && ' Including Walmart Seller Center integration, listing optimization, and PPC analytics.'}
        {['blinkit', 'swiggy', 'zomato'].includes(marketplace.id) && ' Specialized for quick-commerce: dark store visibility, instant delivery zones, and hyperlocal targeting.'}
      </p>
      
      <div className="grid grid-cols-3 gap-4 max-w-lg mx-auto mb-8">
        <div className="p-4 rounded-xl bg-white/5 border border-white/5">
          <p className="text-2xl font-bold text-white font-['Space_Grotesk']">20+</p>
          <p className="text-zinc-500 text-xs">AI Agents</p>
        </div>
        <div className="p-4 rounded-xl bg-white/5 border border-white/5">
          <p className="text-2xl font-bold text-white font-['Space_Grotesk']">Q2</p>
          <p className="text-zinc-500 text-xs">2026 Launch</p>
        </div>
        <div className="p-4 rounded-xl bg-white/5 border border-white/5">
          <p className="text-2xl font-bold text-white font-['Space_Grotesk']">Free</p>
          <p className="text-zinc-500 text-xs">Beta Access</p>
        </div>
      </div>
      
      <button
        onClick={onNotifyClick}
        className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-bold hover:shadow-[0_0_30px_rgba(0,240,255,0.3)] transition-all"
        data-testid="notify-me-btn"
      >
        <Bell size={18} />
        Get Notified at Launch
      </button>
    </motion.div>
  );
};

// Main Marketplace Context Switcher
const MarketplaceContextSwitcher = ({ activeMarketplace, onMarketplaceChange }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [notifyModal, setNotifyModal] = useState({ isOpen: false, marketplace: null });
  
  const activeConfig = MARKETPLACES.find(m => m.id === activeMarketplace) || MARKETPLACES[0];
  const primaryMarketplaces = MARKETPLACES.slice(0, 2); // Amazon, Walmart
  const otherMarketplaces = MARKETPLACES.slice(2); // Quick commerce
  
  const handleMarketplaceSelect = (marketplace) => {
    if (marketplace.status === 'active') {
      onMarketplaceChange(marketplace.id);
    } else {
      setNotifyModal({ isOpen: true, marketplace });
    }
    setIsExpanded(false);
  };
  
  return (
    <>
      <div className="w-full bg-[#0A1628] border-b border-white/5 sticky top-20 z-40">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between py-3">
            {/* Left: Marketplace Tabs */}
            <div className="flex items-center gap-2">
              {/* Primary Marketplaces */}
              {primaryMarketplaces.map((marketplace) => (
                <button
                  key={marketplace.id}
                  onClick={() => handleMarketplaceSelect(marketplace)}
                  className={`relative flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                    activeMarketplace === marketplace.id
                      ? `${marketplace.bgColor} ${marketplace.textColor} border ${marketplace.borderColor}`
                      : 'text-zinc-400 hover:text-white hover:bg-white/5'
                  }`}
                  data-testid={`marketplace-tab-${marketplace.id}`}
                >
                  <ShoppingCart size={16} />
                  {marketplace.label}
                  {marketplace.status === 'active' && activeMarketplace === marketplace.id && (
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  )}
                  {marketplace.status === 'staging' && (
                    <span className="px-1.5 py-0.5 rounded text-[10px] bg-blue-500/20 text-blue-400 uppercase">
                      Soon
                    </span>
                  )}
                </button>
              ))}
              
              {/* Others Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                    otherMarketplaces.some(m => m.id === activeMarketplace)
                      ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30'
                      : 'text-zinc-400 hover:text-white hover:bg-white/5'
                  }`}
                  data-testid="marketplace-others-dropdown"
                >
                  Others
                  <ChevronDown size={14} className={`transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                </button>
                
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute top-full left-0 mt-2 w-56 rounded-xl bg-[#0A1628] border border-white/10 shadow-2xl overflow-hidden z-50"
                    >
                      <div className="p-2 border-b border-white/5">
                        <p className="text-zinc-500 text-xs uppercase tracking-wider px-2">Quick Commerce</p>
                      </div>
                      {otherMarketplaces.map((marketplace) => (
                        <button
                          key={marketplace.id}
                          onClick={() => handleMarketplaceSelect(marketplace)}
                          className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-white/5 transition-all"
                        >
                          <div className={`w-8 h-8 rounded-lg ${marketplace.bgColor} flex items-center justify-center`}>
                            <ShoppingCart size={14} className={marketplace.textColor} />
                          </div>
                          <div className="flex-1">
                            <p className="text-white text-sm font-medium">{marketplace.label}</p>
                            <p className="text-zinc-500 text-xs">{marketplace.description}</p>
                          </div>
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
            
            {/* Right: Status indicator */}
            <div className="flex items-center gap-2 text-xs">
              <div className={`w-2 h-2 rounded-full ${
                activeConfig.status === 'active' ? 'bg-emerald-400' : 'bg-cyan-400 animate-pulse'
              }`} />
              <span className="text-zinc-500">
                {activeConfig.status === 'active' ? 'Protocol Active' : 'In Development'}
              </span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Notify Modal */}
      <NotifyMeModal
        marketplace={notifyModal.marketplace}
        isOpen={notifyModal.isOpen}
        onClose={() => setNotifyModal({ isOpen: false, marketplace: null })}
      />
    </>
  );
};

export default MarketplaceContextSwitcher;

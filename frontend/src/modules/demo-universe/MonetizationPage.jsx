/**
 * Monetization Demo Page - LLM Native Ads Showcase
 * Replicating adsgupta-health.preview.emergentagent.com exactly
 * Route: /monetization
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Menu, User, Share2, Bookmark, X, ChevronLeft, ChevronRight, Cpu,
  Play, Pause, Volume2, VolumeX, Maximize2, MoreVertical, Star,
  Eye, Heart, MessageCircle, Send, Mic, Paperclip, Sparkles,
  ExternalLink, Clock
} from 'lucide-react';

// ============== DATA ==============

const articleContent = {
  title: "Myth: Coconut Oil Causes Weight Gain",
  date: "11 Nov 2025",
  heroImage: "https://customer-assets.emergentagent.com/job_health-ui-upgrade/artifacts/kqit75d0_image.png",
  author: "Prototype by Ranjan",
  paragraphs: [
    {
      highlightWord: "Coconut oil",
      text: "has often been misunderstood when it comes to weight gain. The truth is, it doesn't directly make you gain weight — the impact depends on how and how much you use it."
    },
    {
      highlightWord: "Coconut oil",
      text: "is rich in medium-chain triglycerides (MCTs), a type of fat that's metabolized faster than most other dietary fats. Unlike long-chain fatty acids, MCTs are quickly converted into energy by the liver instead of being stored as body fat."
    },
    {
      text: "Several studies suggest that moderate MCT intake may even support fat oxidation and satiety, helping with better appetite control and energy balance."
    },
    {
      highlightWord: "Coconut oil",
      text: "is still calorie-dense, so it should be used wisely — as a complement to a balanced diet, not as a cure-all."
    },
    {
      text: "When consumed in the right portions, coconut oil can be part of a healthy, sustainable nutrition plan rather than a cause of unwanted weight gain."
    },
    {
      text: "Health experts now acknowledge that the type of fat matters just as much as the amount. Virgin coconut oil contains antioxidants and anti-inflammatory compounds that not only support metabolism but also promote overall wellness."
    },
    {
      text: "Incorporating coconut oil mindfully is where the real benefits shine. A teaspoon added to your morning coffee, blended into a smoothie, or used to sauté vegetables can provide lasting energy and help reduce sugar cravings."
    },
    {
      text: "To get the highest nutritional value, choosing cold-pressed, virgin coconut oil is important. This minimally processed version retains more antioxidants, natural aroma, and beneficial fatty acids compared to refined oils."
    }
  ],
  tags: ["coconut oil", "weight management", "health myths", "nutrition"]
};

const curatedContent = [
  { emoji: "🤔", title: "Wait, does coconut oil really help you lose weight?", desc: "Turns out, only specific MCTs matter for metabolism. But here's the catch...", views: "2.5k", likes: "1.5k" },
  { emoji: "✨", title: "The 'miracle oil' that does... what exactly?", desc: "Great for skin & hair, yes. But the rest? Let's just say marketing got creative...", views: "3.5k", likes: "2.5k" },
  { emoji: "🔥", title: "High heat cooking with coconut oil?", desc: "Safe? Yes. Smart? Well, there's a nutrient trade-off you should know...", views: "4.8k", likes: "3.2k" },
  { emoji: "💚", title: "Heart health hero or silent risk?", desc: "Studies are split. Some show benefits, others flag concerns about LDL...", views: "5.1k", likes: "3.7k" },
  { emoji: "🥥", title: "vs 🫒 The ultimate oil showdown", desc: "Spoiler: Neither wins. It depends on what you're cooking...", views: "6.2k", likes: "4.5k", sponsored: true }
];

const products = [
  { name: "Dabur Coconut Oil 200ml", price: 140, rating: 4.5, reviews: "1247", image: "https://images.unsplash.com/photo-1525351326368-efbb5cb6814d?w=200&q=80" },
  { name: "Parachute Advansed Coconut Oil 500ml", price: 210, rating: 4.6, reviews: "3456", image: "https://images.unsplash.com/photo-1593164842264-854604db2260?w=200&q=80" },
  { name: "KLF Nirmal Cold Pressed Coconut Oil...", price: 185, rating: 4.6, reviews: "3.2k+", image: "https://images.unsplash.com/photo-1474899420076-a61e74989430?w=200&q=80" },
  { name: "Coco Soul Cold Pressed Coconut Oil...", price: 225, rating: 4.7, reviews: "2.8k+", image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200&q=80" },
  { name: "24 Mantra Organic Coconut Oil 500ml", price: 199, rating: 4.5, reviews: "4.1k+", image: "https://images.unsplash.com/photo-1583224964564-a4e1d2c67f90?w=200&q=80" },
  { name: "Nutiva Organic Virgin Coconut Oil 444ml", price: 599, rating: 4.8, reviews: "6.5k+", image: "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=200&q=80" },
  { name: "Gold Winner Refined Coconut Oil 1L", price: 175, rating: 4.4, reviews: "5.3k+", image: "https://images.unsplash.com/photo-1516594915697-87eb3b1c14ea?w=200&q=80" },
  { name: "Organic India Extra Virgin Coconut Oil...", price: 350, rating: 4.7, reviews: "3.9k+", image: "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=200&q=80" },
  { name: "Morpheme Pure Cold Pressed Coconut Oil...", price: 280, rating: 4.6, reviews: "4.7k+", image: "https://images.unsplash.com/photo-1523294587484-bae6cc870010?w=200&q=80" }
];

const rotatingTexts = [
  "Dabur Coconut Oil 200ml",
  "Coconut oil helps with weight loss",
  "It's great for everything: skin, hair, diet",
  "Ask My AI"
];

// ============== COMPONENTS ==============

// Header
const Header = () => (
  <header className="fixed top-0 left-0 right-0 z-50 bg-[#0A0A0A] border-b border-white/10">
    <div className="flex items-center justify-between px-6 py-4">
      <button className="p-2 text-white hover:bg-white/10 rounded-lg transition-colors">
        <Menu size={24} />
      </button>
      <h1 className="text-2xl font-bold text-cyan-400 font-['Space_Grotesk']">AdsGupta AI</h1>
      <button className="p-2 text-white hover:bg-white/10 rounded-lg transition-colors">
        <User size={24} />
      </button>
    </div>
  </header>
);

// Sidebar Ad Unit (Sticky)
const SidebarAds = ({ onChatClick }) => {
  const [videoSkipTime, setVideoSkipTime] = useState(5);
  const [canSkip, setCanSkip] = useState(false);

  useEffect(() => {
    if (videoSkipTime > 0) {
      const timer = setTimeout(() => setVideoSkipTime(videoSkipTime - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanSkip(true);
    }
  }, [videoSkipTime]);

  return (
    <div className="w-80 flex-shrink-0">
      <div className="sticky top-24 space-y-4">
        {/* Banner Ad */}
        <div className="rounded-xl overflow-hidden border border-white/10 bg-gradient-to-b from-amber-500 to-amber-600">
          <img 
            src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&q=80" 
            alt="Premium Products"
            className="w-full h-40 object-cover"
          />
          <div className="p-4 text-white">
            <h3 className="font-bold text-lg">Discover Premium Coconut Products</h3>
            <p className="text-sm opacity-90">Shop Now for Best Deals</p>
          </div>
        </div>

        {/* Video Ad */}
        <div className="rounded-xl overflow-hidden border border-white/10 bg-black relative">
          <div className="absolute top-2 left-2 px-2 py-0.5 bg-black/80 text-white text-xs rounded z-10">Ad</div>
          <div className="absolute top-2 right-2 z-10">
            <button className={`px-3 py-1 rounded text-xs font-medium ${canSkip ? 'bg-white text-black' : 'bg-black/80 text-white'}`}>
              {canSkip ? 'Skip Ad' : `Skip in ${videoSkipTime}s`}
            </button>
          </div>
          <video
            className="w-full aspect-video object-cover"
            poster="https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&q=80"
            muted
            loop
            autoPlay
          >
            <source src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4" type="video/mp4" />
          </video>
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2">
            <div className="flex items-center gap-2 text-white text-xs">
              <Play size={12} />
              <span>0:00</span>
              <div className="flex-1 h-1 bg-white/30 rounded">
                <div className="w-1/4 h-full bg-cyan-400 rounded" />
              </div>
              <VolumeX size={12} />
              <Maximize2 size={12} />
              <MoreVertical size={12} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Neural Oracle Floating Button
const NeuralOracleFloater = ({ onClick, rotatingText }) => (
  <motion.button
    onClick={onClick}
    className="fixed bottom-6 right-6 z-50 group"
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
  >
    {/* Rotating text bubble */}
    <div className="absolute right-full mr-3 top-1/2 -translate-y-1/2 whitespace-nowrap">
      <div className="px-4 py-2 rounded-xl bg-[#0A0A0A] border border-cyan-500/30 shadow-lg">
        <div className="flex items-center gap-2">
          <span className="text-white font-medium text-sm">Neural Oracle</span>
          <span className="px-1.5 py-0.5 rounded bg-cyan-500 text-[10px] font-bold text-white">AI</span>
        </div>
        <div className="flex items-center gap-1 mt-1">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          <span className="text-emerald-400 text-xs">Online</span>
          <span className="text-cyan-400 text-xs ml-2">{rotatingText}</span>
        </div>
      </div>
      <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-2 h-2 bg-[#0A0A0A] border-r border-b border-cyan-500/30 rotate-[-45deg]" />
    </div>

    {/* Main Button */}
    <div className="relative">
      {/* Pulse rings */}
      <div className="absolute inset-0 rounded-full bg-cyan-500/20 animate-ping" />
      <div className="absolute -inset-2 rounded-full bg-cyan-500/10 animate-pulse" />
      
      {/* Button */}
      <div className="relative w-14 h-14 rounded-full bg-gradient-to-br from-cyan-400 to-cyan-600 flex items-center justify-center shadow-[0_0_30px_rgba(0,255,255,0.4)]">
        <Cpu size={24} className="text-white" />
      </div>
      
      {/* AI Badge */}
      <div className="absolute -top-1 -right-1 px-1.5 py-0.5 rounded-full bg-cyan-500 text-[10px] font-bold text-white border-2 border-[#0A0A0A]">
        AI
      </div>
      
      {/* Online indicator */}
      <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-400 border-2 border-[#0A0A0A]" />
    </div>
  </motion.button>
);

// Neural Oracle Panel (Full Screen Modal)
const NeuralOraclePanel = ({ isOpen, onClose }) => {
  const [message, setMessage] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef(null);

  const handleSend = () => {
    if (!message.trim()) return;
    setChatHistory(prev => [...prev, { role: 'user', content: message }]);
    setMessage('');
    setIsTyping(true);
    
    setTimeout(() => {
      setChatHistory(prev => [...prev, { 
        role: 'assistant', 
        content: "Great question! Coconut oil's MCTs are metabolized differently than other fats - they go straight to the liver for energy conversion. This can provide a slight metabolic boost. However, it's still calorie-dense, so moderation is key!"
      }]);
      setIsTyping(false);
    }, 1500);
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chatHistory]);

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-end justify-center"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="w-full max-w-4xl bg-[#0A0A0A] rounded-t-3xl border-t border-x border-white/10 max-h-[85vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors z-10"
        >
          <X size={20} />
        </button>

        {/* Header */}
        <div className="p-6 border-b border-white/10">
          <h2 className="text-xl font-bold text-white">Myth vs Reality: A quick breakdown</h2>
          <p className="text-zinc-400 text-sm mt-1">
            Coconut oil contains beneficial MCTs, its high saturated fat content means moderation is key. Here's a quick breakdown of what's true – and what's not.
          </p>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto max-h-[60vh] p-6 space-y-6">
          {/* Curated Contents */}
          <div>
            <h3 className="text-cyan-400 text-sm font-medium mb-4">Curated contents for you</h3>
            <div className="grid grid-cols-5 gap-3">
              {curatedContent.map((item, i) => (
                <div 
                  key={i}
                  className="p-4 rounded-xl bg-cyan-500/10 border border-cyan-500/30 hover:bg-cyan-500/20 transition-colors cursor-pointer relative"
                >
                  {item.sponsored && (
                    <span className="absolute top-2 right-2 px-2 py-0.5 rounded bg-cyan-500 text-[10px] font-bold text-white">
                      SPONSORED
                    </span>
                  )}
                  <span className="text-2xl">{item.emoji}</span>
                  <h4 className="text-white font-medium text-sm mt-2 line-clamp-2">{item.title}</h4>
                  <p className="text-zinc-400 text-xs mt-1 line-clamp-2">{item.desc}</p>
                  <p className="text-cyan-400 text-xs mt-1">Read more</p>
                  <div className="flex items-center gap-3 mt-2 text-zinc-500 text-xs">
                    <span className="flex items-center gap-1"><Eye size={10} /> {item.views}</span>
                    <span className="flex items-center gap-1"><Heart size={10} /> {item.likes}</span>
                    <Share2 size={10} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recommended Products */}
          <div>
            <h3 className="text-white font-medium mb-4">Recommended Products</h3>
            <div className="flex gap-3 overflow-x-auto pb-2">
              {/* Video Ad Thumbnail */}
              <div className="flex-shrink-0 w-28 rounded-xl overflow-hidden border border-white/10 bg-black relative">
                <div className="absolute top-1 left-1 px-1.5 py-0.5 bg-black/80 text-white text-[10px] rounded z-10">AD</div>
                <div className="absolute top-1 right-1 px-1.5 py-0.5 bg-black/80 text-white text-[10px] rounded z-10">Skip Ad in 5s</div>
                <div className="aspect-square bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center">
                  <Play size={20} className="text-white/50" />
                </div>
                <p className="text-[10px] text-zinc-500 p-2">Sponsored Video</p>
              </div>

              {products.map((product, i) => (
                <div key={i} className="flex-shrink-0 w-28 rounded-xl overflow-hidden border border-white/10 bg-[#111]">
                  <div className="relative">
                    <span className="absolute top-1 left-1 px-1.5 py-0.5 rounded bg-cyan-500 text-[10px] font-bold text-white">
                      Sponsored
                    </span>
                    <img src={product.image} alt={product.name} className="w-full aspect-square object-cover" />
                  </div>
                  <div className="p-2">
                    <h4 className="text-white text-xs font-medium line-clamp-2 min-h-[2rem]">{product.name}</h4>
                    <p className="text-cyan-400 font-bold text-sm mt-1">₹{product.price}</p>
                    <div className="flex items-center gap-1 mt-0.5">
                      <Star size={10} className="text-amber-400 fill-amber-400" />
                      <span className="text-white text-[10px]">{product.rating}</span>
                      <span className="text-zinc-500 text-[10px]">({product.reviews})</span>
                    </div>
                    <button className="w-full mt-2 py-1.5 rounded-lg border border-cyan-500 text-cyan-400 text-xs font-medium hover:bg-cyan-500/10 transition-colors">
                      {i % 2 === 0 ? 'Buy Now' : 'Check Out'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Chat History */}
          {chatHistory.length > 0 && (
            <div ref={scrollRef} className="space-y-3">
              {chatHistory.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm ${
                    msg.role === 'user' 
                      ? 'bg-cyan-500 text-white rounded-br-md' 
                      : 'bg-white/10 text-white rounded-bl-md'
                  }`}>
                    {msg.content}
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-white/10 px-4 py-3 rounded-2xl rounded-bl-md">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Chat Input */}
        <div className="p-4 border-t border-white/10">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <Cpu size={20} className="text-cyan-400" />
              <span className="text-white font-medium">Neural Oracle</span>
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 ml-1" />
            </div>
          </div>
          
          <div className="mt-3 relative">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask the Neural Engine..."
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 pr-24 text-white placeholder-zinc-500 focus:outline-none focus:border-cyan-500/50"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
              <button className="p-1.5 text-zinc-500 hover:text-white transition-colors">
                <Paperclip size={18} />
              </button>
              <button className="p-1.5 text-zinc-500 hover:text-white transition-colors">
                <Mic size={18} />
              </button>
              <button 
                onClick={handleSend}
                className="p-2 bg-cyan-500 rounded-lg text-white hover:bg-cyan-400 transition-colors"
              >
                <Send size={16} />
              </button>
            </div>
          </div>
          
          <button className="w-full mt-3 py-2.5 rounded-xl border border-cyan-500/30 bg-cyan-500/10 text-cyan-400 text-sm font-medium flex items-center justify-center gap-2 hover:bg-cyan-500/20 transition-colors">
            <Sparkles size={16} />
            Upgrade to AI Pro
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

// Inline Video Ad
const InlineVideoAd = () => {
  const [skipTime, setSkipTime] = useState(5);
  const [canSkip, setCanSkip] = useState(false);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (skipTime > 0) {
      const timer = setTimeout(() => setSkipTime(skipTime - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanSkip(true);
    }
  }, [skipTime]);

  if (!isVisible) return null;

  return (
    <div className="my-8 rounded-xl overflow-hidden border border-white/10 bg-black relative">
      {/* AD Badge */}
      <div className="absolute top-3 left-3 px-2 py-1 bg-black/90 text-white text-xs font-bold rounded z-10">
        AD
      </div>
      
      {/* Skip Button */}
      <div className="absolute top-3 right-3 z-10">
        <button 
          onClick={() => canSkip && setIsVisible(false)}
          className={`px-4 py-1.5 rounded text-sm font-medium transition-all ${
            canSkip ? 'bg-white text-black hover:bg-gray-100' : 'bg-black/80 text-white'
          }`}
        >
          {canSkip ? 'Skip Ad' : `Skip Ad in ${skipTime}s`}
        </button>
      </div>

      {/* Video */}
      <video
        className="w-full aspect-video object-cover"
        poster="https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&q=80"
        muted
        loop
        autoPlay
        playsInline
      >
        <source src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4" type="video/mp4" />
      </video>

      {/* Controls */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-4">
        <div className="flex items-center gap-3 text-white">
          <Play size={16} />
          <span className="text-sm">0:00</span>
          <div className="flex-1 h-1 bg-white/30 rounded-full">
            <div className="w-1/4 h-full bg-cyan-400 rounded-full" />
          </div>
          <VolumeX size={16} />
          <Maximize2 size={16} />
          <MoreVertical size={16} />
        </div>
      </div>

      {/* Advertisement label */}
      <div className="absolute bottom-14 left-4">
        <span className="text-zinc-400 text-xs">Advertisement</span>
      </div>
    </div>
  );
};

// Loading Ad Placeholder
const LoadingAd = () => (
  <div className="my-6 p-8 rounded-xl border border-white/10 bg-white/5 flex items-center justify-center">
    <div className="flex items-center gap-3">
      <div className="w-5 h-5 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
      <span className="text-zinc-500 text-sm">Loading ad...</span>
    </div>
  </div>
);

// AI Prompt Chips
const AIPromptChips = ({ onPromptClick }) => (
  <div className="mt-8 space-y-3">
    {curatedContent.slice(0, 5).map((item, i) => (
      <motion.button
        key={i}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: i * 0.1 }}
        onClick={() => onPromptClick(item.title)}
        className="w-full p-4 rounded-xl border border-white/10 bg-white/5 text-left hover:border-cyan-500/30 hover:bg-white/10 transition-all group"
      >
        <div className="flex items-center gap-3">
          <span className="text-2xl">{item.emoji}</span>
          <span className="text-white group-hover:text-cyan-400 transition-colors">{item.title}</span>
        </div>
      </motion.button>
    ))}
  </div>
);

// ============== MAIN COMPONENT ==============

const MonetizationPage = () => {
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [rotatingIndex, setRotatingIndex] = useState(0);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setRotatingIndex(prev => (prev + 1) % rotatingTexts.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white">
      {/* Header */}
      <Header />

      {/* Main Layout */}
      <div className="pt-20 px-6 pb-24">
        <div className="max-w-7xl mx-auto flex gap-8">
          {/* Main Content */}
          <main className="flex-1 max-w-4xl">
            {/* Article Header */}
            <h1 className="text-4xl font-bold text-white mb-3">{articleContent.title}</h1>
            <p className="text-zinc-500 text-sm mb-4">{articleContent.date}</p>
            
            <div className="flex items-center gap-3 mb-6">
              <button className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors">
                <Share2 size={16} />
                <span className="text-sm">Share</span>
              </button>
              <button 
                onClick={() => setIsSaved(!isSaved)}
                className={`flex items-center gap-2 transition-colors ${isSaved ? 'text-cyan-400' : 'text-zinc-400 hover:text-white'}`}
              >
                <Bookmark size={16} className={isSaved ? 'fill-current' : ''} />
                <span className="text-sm">{isSaved ? 'Saved' : 'Save'}</span>
              </button>
            </div>

            {/* Hero Image */}
            <div className="relative rounded-2xl overflow-hidden mb-8">
              <img 
                src={articleContent.heroImage} 
                alt={articleContent.title}
                className="w-full"
              />
              <p className="absolute bottom-4 right-4 text-zinc-400 text-xs">{articleContent.author}</p>
            </div>

            {/* Article Content */}
            <article className="space-y-6">
              {/* Paragraph 1 */}
              <p className="text-zinc-300 leading-relaxed">
                <a href="#" className="text-cyan-400 hover:underline">{articleContent.paragraphs[0].highlightWord}</a>
                {' '}{articleContent.paragraphs[0].text}
              </p>

              {/* Inline Video Ad */}
              <InlineVideoAd />

              {/* Paragraph 2 */}
              <p className="text-zinc-300 leading-relaxed">
                <a href="#" className="text-cyan-400 hover:underline">{articleContent.paragraphs[1].highlightWord}</a>
                {' '}{articleContent.paragraphs[1].text}
              </p>

              <p className="text-zinc-300 leading-relaxed">{articleContent.paragraphs[2].text}</p>

              <p className="text-zinc-300 leading-relaxed">
                The key, however, is moderation.{' '}
                <a href="#" className="text-cyan-400 hover:underline">{articleContent.paragraphs[3].highlightWord}</a>
                {' '}{articleContent.paragraphs[3].text}
              </p>

              <p className="text-zinc-300 leading-relaxed">{articleContent.paragraphs[4].text}</p>

              <LoadingAd />

              <p className="text-zinc-300 leading-relaxed">{articleContent.paragraphs[5].text}</p>
              <p className="text-zinc-300 leading-relaxed">{articleContent.paragraphs[6].text}</p>

              <LoadingAd />

              <p className="text-zinc-300 leading-relaxed">{articleContent.paragraphs[7].text}</p>
            </article>

            {/* Tags */}
            <div className="mt-8 flex flex-wrap gap-2">
              {articleContent.tags.map((tag, i) => (
                <span 
                  key={i}
                  className="px-4 py-2 rounded-full bg-white/5 border border-white/10 text-zinc-400 text-sm hover:border-cyan-500/30 hover:text-white cursor-pointer transition-all"
                >
                  {tag}
                </span>
              ))}
            </div>

            {/* AI Prompt Chips */}
            <AIPromptChips onPromptClick={() => setIsPanelOpen(true)} />

            {/* Sponsored Banner */}
            <div className="mt-8 p-4 rounded-xl border border-white/10 bg-white/5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-zinc-500 text-xs">Sponsored</span>
                <img 
                  src="https://demoai.adsgupta.com/adsgupta-logo.png" 
                  alt="AdsGupta AI"
                  className="h-8"
                  onError={(e) => e.target.style.display = 'none'}
                />
              </div>
            </div>
          </main>

          {/* Sidebar */}
          <SidebarAds onChatClick={() => setIsPanelOpen(true)} />
        </div>
      </div>

      {/* Neural Oracle Floater */}
      <NeuralOracleFloater 
        onClick={() => setIsPanelOpen(true)}
        rotatingText={rotatingTexts[rotatingIndex]}
      />

      {/* Neural Oracle Panel */}
      <AnimatePresence>
        {isPanelOpen && (
          <NeuralOraclePanel 
            isOpen={isPanelOpen}
            onClose={() => setIsPanelOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Back to Showcase Link - Fixed at top */}
      <Link
        to="/showcase"
        className="fixed top-20 left-6 z-40 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-black/80 border border-white/10 text-zinc-400 hover:text-white hover:border-cyan-500/30 transition-all text-sm backdrop-blur-sm"
      >
        <ChevronLeft size={16} />
        Back to Showcase Hub
      </Link>
    </div>
  );
};

export default MonetizationPage;

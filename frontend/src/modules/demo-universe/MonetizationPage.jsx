/**
 * Monetization Demo Page - LLM Native Ads Showcase
 * Native Widget & LLM Monetization with Live Demo
 * Industrial Luxury Tech Theme
 * Route: /monetization (on demoai.adsgupta.com)
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Cpu, Zap, Play, Pause, X, ChevronLeft, ChevronRight, Bot,
  Share2, Bookmark, Star, ShoppingCart, MessageCircle, Send,
  Sparkles, Volume2, VolumeX, SkipForward, ExternalLink,
  TrendingUp, Eye, DollarSign, BarChart3, Loader2, Mic, Paperclip
} from 'lucide-react';

// ============== MOCK DATA ==============

const articleContent = {
  title: "Myth: Coconut Oil Causes Weight Gain",
  date: "11 Nov 2025",
  image: "https://images.unsplash.com/photo-1526947425960-945c6e72858f?w=800&q=80",
  author: "Prototype by Ranjan",
  sections: [
    {
      text: "Coconut oil has often been misunderstood when it comes to weight gain. The truth is, it doesn't directly make you gain weight — the impact depends on how and how much you use it.",
      hasAd: false
    },
    {
      text: "Coconut oil is rich in medium-chain triglycerides (MCTs), a type of fat that's metabolized faster than most other dietary fats. Unlike long-chain fatty acids, MCTs are quickly converted into energy by the liver instead of being stored as body fat.",
      hasAd: true,
      adType: 'video'
    },
    {
      text: "Several studies suggest that moderate MCT intake may even support fat oxidation and satiety, helping with better appetite control and energy balance. The key, however, is moderation. Coconut oil is still calorie-dense, so it should be used wisely — as a complement to a balanced diet, not as a cure-all.",
      hasAd: false
    },
    {
      text: "Health experts now acknowledge that the type of fat matters just as much as the amount. Virgin coconut oil contains antioxidants and anti-inflammatory compounds that not only support metabolism but also promote overall wellness.",
      hasAd: true,
      adType: 'native'
    },
    {
      text: "Incorporating coconut oil mindfully is where the real benefits shine. A teaspoon added to your morning coffee, blended into a smoothie, or used to sauté vegetables can provide lasting energy and help reduce sugar cravings.",
      hasAd: false
    }
  ],
  tags: ["coconut oil", "weight management", "health myths", "nutrition"]
};

const sponsoredProducts = [
  { id: 1, name: "Parachute Advansed Coconut Oil 500ml", price: 210, rating: 4.6, reviews: "3456", image: "https://images.unsplash.com/photo-1525351326368-efbb5cb6814d?w=400&q=80" },
  { id: 2, name: "Kama Ayurveda Extra Virgin Organic Coconut Oil 200ml", price: 395, rating: 4.7, reviews: "567", image: "https://images.unsplash.com/photo-1593164842264-854604db2260?w=400&q=80" },
  { id: 3, name: "KLF Nirmal Cold Pressed Coconut Oil 500ml", price: 185, rating: 4.6, reviews: "3.2k+", image: "https://images.unsplash.com/photo-1474899420076-a61e74989430?w=400&q=80" },
  { id: 4, name: "Coco Soul Cold Pressed Coconut Oil 500ml", price: 225, rating: 4.7, reviews: "2.8k+", image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&q=80" },
  { id: 5, name: "24 Mantra Organic Coconut Oil 500ml", price: 199, rating: 4.5, reviews: "4.1k+", image: "https://images.unsplash.com/photo-1583224964564-a4e1d2c67f90?w=400&q=80" },
  { id: 6, name: "Nutiva Organic Virgin Coconut Oil 444ml", price: 599, rating: 4.8, reviews: "6.5k+", image: "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400&q=80" },
];

const aiPrompts = [
  { emoji: "🤔", text: "Wait, does coconut oil really help you lose weight?" },
  { emoji: "✨", text: "The 'miracle oil' that does... what exactly?" },
  { emoji: "🔥", text: "High heat cooking with coconut oil?" },
  { emoji: "💚", text: "Heart health hero or silent risk?" },
  { emoji: "🥥", text: "Coconut oil vs Olive oil - The ultimate showdown" }
];

const rotatingTexts = [
  "Dabur Coconut Oil 200ml",
  "Coconut oil helps with weight loss",
  "It's great for everything: skin, hair, diet",
  "Ask My AI"
];

// ============== COMPONENTS ==============

// Back to Hub Link
const BackToHub = () => (
  <Link
    to="/showcase"
    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-zinc-400 hover:text-white hover:border-cyan-500/30 transition-all text-sm"
    data-testid="back-to-hub"
  >
    <ChevronLeft size={16} />
    Back to Showcase Hub
  </Link>
);

// Video Ad Component with Skip
const VideoAd = ({ onSkip, onClose }) => {
  const [countdown, setCountdown] = useState(5);
  const [canSkip, setCanSkip] = useState(false);
  const [isMuted, setIsMuted] = useState(true);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanSkip(true);
    }
  }, [countdown]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="relative rounded-xl overflow-hidden border border-cyan-500/30 bg-black"
    >
      {/* Video placeholder */}
      <div className="relative aspect-video bg-gradient-to-br from-violet-900/50 to-cyan-900/50">
        <video
          className="w-full h-full object-cover"
          poster="https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&q=80"
          autoPlay
          loop
          muted={isMuted}
        >
          <source src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4" type="video/mp4" />
        </video>
        
        {/* Overlay controls */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent">
          {/* Top badge */}
          <div className="absolute top-3 left-3 flex items-center gap-2">
            <span className="px-2 py-1 rounded bg-amber-500/90 text-black text-xs font-bold">Ad</span>
            <span className="text-white/80 text-xs">Sponsored Video</span>
          </div>
          
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 p-1.5 rounded-full bg-black/50 text-white/80 hover:text-white transition-colors"
          >
            <X size={16} />
          </button>
          
          {/* Bottom controls */}
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setIsMuted(!isMuted)}
                  className="p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
                >
                  {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
                </button>
                <div className="flex-1 h-1 bg-white/20 rounded-full w-32">
                  <div className="h-full bg-cyan-400 rounded-full w-1/3" />
                </div>
              </div>
              
              {/* Skip button */}
              <button
                onClick={canSkip ? onSkip : undefined}
                disabled={!canSkip}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                  canSkip 
                    ? 'bg-white text-black hover:bg-cyan-400' 
                    : 'bg-white/20 text-white/60 cursor-not-allowed'
                }`}
              >
                {canSkip ? (
                  <>
                    <SkipForward size={14} />
                    Skip Ad
                  </>
                ) : (
                  `Skip Ad in ${countdown}s`
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// Product Card
const ProductCard = ({ product }) => (
  <motion.div
    whileHover={{ y: -4 }}
    className="flex-shrink-0 w-44 rounded-xl overflow-hidden border border-white/10 bg-[#0A0A0A] hover:border-cyan-500/30 transition-all"
  >
    <div className="relative">
      <span className="absolute top-2 left-2 px-2 py-0.5 rounded bg-violet-500/90 text-white text-[10px] font-bold">
        Sponsored
      </span>
      <img src={product.image} alt={product.name} className="w-full h-28 object-cover" />
    </div>
    <div className="p-3">
      <h4 className="text-white text-xs font-medium line-clamp-2 mb-2 min-h-[2rem]">
        {product.name}
      </h4>
      <p className="text-cyan-400 font-bold text-sm mb-1">₹{product.price}</p>
      <div className="flex items-center gap-1 mb-3">
        <Star size={10} className="text-amber-400 fill-amber-400" />
        <span className="text-white text-xs">{product.rating}</span>
        <span className="text-zinc-500 text-xs">({product.reviews})</span>
      </div>
      <button className="w-full py-1.5 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-xs font-medium hover:from-cyan-400 hover:to-blue-500 transition-all">
        Buy Now
      </button>
    </div>
  </motion.div>
);

// Products Carousel
const ProductsCarousel = () => {
  const scrollRef = useRef(null);
  
  const scroll = (direction) => {
    if (scrollRef.current) {
      const amount = direction === 'left' ? -200 : 200;
      scrollRef.current.scrollBy({ left: amount, behavior: 'smooth' });
    }
  };
  
  return (
    <div className="relative my-8">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white font-['Space_Grotesk']">
          Recommended Products
        </h3>
        <div className="flex items-center gap-2">
          <button onClick={() => scroll('left')} className="p-1.5 rounded-lg bg-white/5 text-zinc-400 hover:text-white transition-colors">
            <ChevronLeft size={18} />
          </button>
          <button onClick={() => scroll('right')} className="p-1.5 rounded-lg bg-white/5 text-zinc-400 hover:text-white transition-colors">
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
      
      <div 
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto scrollbar-hide pb-2"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {sponsoredProducts.map(product => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
};

// AI Chat Floater
const AIChatFloater = ({ isExpanded, onToggle }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [rotatingIndex, setRotatingIndex] = useState(0);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setRotatingIndex(prev => (prev + 1) % rotatingTexts.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);
  
  const handleSend = async () => {
    if (!input.trim()) return;
    
    const userMessage = input;
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setInput('');
    setIsThinking(true);
    
    // Simulate AI response
    setTimeout(() => {
      const responses = [
        "Great question! Coconut oil contains MCTs which are metabolized differently than other fats. Studies show it may boost metabolism slightly and help with satiety.",
        "While coconut oil is calorie-dense, its unique fat composition means it's used for energy rather than stored as fat. The key is moderation!",
        "Research suggests 1-2 tablespoons daily can be beneficial. It's best used as a replacement for less healthy fats, not in addition to them."
      ];
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: responses[Math.floor(Math.random() * responses.length)] 
      }]);
      setIsThinking(false);
    }, 1500);
  };
  
  const handlePromptClick = (prompt) => {
    setInput(prompt);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <AnimatePresence mode="wait">
        {isExpanded ? (
          <motion.div
            key="expanded"
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="w-80 sm:w-96 rounded-2xl border border-cyan-500/30 overflow-hidden shadow-[0_0_60px_rgba(0,255,255,0.15)]"
            style={{ 
              background: 'rgba(10, 10, 10, 0.95)',
              backdropFilter: 'blur(20px)'
            }}
          >
            {/* Header */}
            <div className="p-4 border-b border-white/10 flex items-center justify-between bg-gradient-to-r from-cyan-500/10 to-violet-500/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
                  <Bot size={20} className="text-white" />
                </div>
                <div>
                  <h4 className="text-white font-semibold text-sm">Neural Oracle</h4>
                  <div className="flex items-center gap-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-emerald-400 text-xs">Online</span>
                  </div>
                </div>
              </div>
              <button onClick={onToggle} className="p-2 rounded-lg hover:bg-white/10 text-zinc-400 hover:text-white transition-colors">
                <X size={18} />
              </button>
            </div>
            
            {/* Messages */}
            <div className="h-64 overflow-y-auto p-4 space-y-3">
              {messages.length === 0 && (
                <div className="text-center py-6">
                  <Bot size={32} className="mx-auto text-cyan-400/50 mb-3" />
                  <p className="text-zinc-500 text-sm">Ask me anything about coconut oil!</p>
                </div>
              )}
              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm ${
                    msg.role === 'user' 
                      ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-br-md' 
                      : 'bg-white/10 text-zinc-200 rounded-bl-md'
                  }`}>
                    {msg.content}
                  </div>
                </motion.div>
              ))}
              {isThinking && (
                <div className="flex justify-start">
                  <div className="bg-white/10 px-4 py-2.5 rounded-2xl rounded-bl-md">
                    <div className="flex items-center gap-2">
                      <Loader2 size={14} className="text-cyan-400 animate-spin" />
                      <span className="text-zinc-400 text-sm">Thinking...</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            {/* Quick prompts */}
            {messages.length === 0 && (
              <div className="px-4 pb-2 flex gap-2 flex-wrap">
                {aiPrompts.slice(0, 3).map((prompt, i) => (
                  <button
                    key={i}
                    onClick={() => handlePromptClick(prompt.text)}
                    className="px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs text-zinc-400 hover:text-white hover:border-cyan-500/30 transition-all"
                  >
                    {prompt.emoji} {prompt.text.slice(0, 30)}...
                  </button>
                ))}
              </div>
            )}
            
            {/* Input */}
            <div className="p-4 border-t border-white/10">
              <div className="flex items-center gap-2">
                <button className="p-2 rounded-lg hover:bg-white/10 text-zinc-500 hover:text-white transition-colors">
                  <Paperclip size={18} />
                </button>
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Ask My AI Anything..."
                  className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm placeholder-zinc-500 focus:outline-none focus:border-cyan-500/50"
                />
                <button className="p-2 rounded-lg hover:bg-white/10 text-zinc-500 hover:text-white transition-colors">
                  <Mic size={18} />
                </button>
                <button 
                  onClick={handleSend}
                  className="p-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white hover:from-cyan-400 hover:to-blue-500 transition-all"
                >
                  <Send size={16} />
                </button>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.button
            key="collapsed"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            onClick={onToggle}
            className="relative group"
          >
            {/* Rotating text bubble */}
            <motion.div
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              className="absolute right-full mr-3 top-1/2 -translate-y-1/2 whitespace-nowrap"
            >
              <div className="px-4 py-2 rounded-xl bg-[#0A0A0A] border border-cyan-500/30 shadow-lg">
                <motion.p 
                  key={rotatingIndex}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-white text-sm"
                >
                  {rotatingTexts[rotatingIndex]}
                </motion.p>
              </div>
              <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-2 h-2 bg-[#0A0A0A] border-r border-b border-cyan-500/30 rotate-[-45deg]" />
            </motion.div>
            
            {/* Main button */}
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-[0_0_30px_rgba(0,255,255,0.3)] group-hover:shadow-[0_0_40px_rgba(0,255,255,0.4)] transition-all">
              <Bot size={24} className="text-white" />
            </div>
            
            {/* Pulse effect */}
            <div className="absolute inset-0 rounded-2xl bg-cyan-500/30 animate-ping" />
            
            {/* AI badge */}
            <div className="absolute -top-1 -right-1 px-1.5 py-0.5 rounded-full bg-violet-500 text-white text-[10px] font-bold">
              AI
            </div>
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
};

// Inline Native Ad
const InlineNativeAd = () => (
  <div className="my-6 p-4 rounded-xl border border-violet-500/30 bg-gradient-to-r from-violet-500/5 to-cyan-500/5">
    <div className="flex items-center gap-2 mb-3">
      <span className="px-2 py-0.5 rounded bg-violet-500/90 text-white text-[10px] font-bold">Advertisement</span>
      <span className="text-zinc-500 text-xs">Ask My AI</span>
    </div>
    <div className="flex items-center gap-4">
      <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center flex-shrink-0">
        <Sparkles size={28} className="text-white" />
      </div>
      <div className="flex-1">
        <h4 className="text-white font-medium mb-1">Discover More with AI</h4>
        <p className="text-zinc-400 text-sm">Get personalized health insights powered by Neural Oracle</p>
      </div>
      <button className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-sm font-medium hover:from-cyan-400 hover:to-blue-500 transition-all flex-shrink-0">
        Try Now
      </button>
    </div>
  </div>
);

// Loading Ad Placeholder
const LoadingAd = () => (
  <div className="my-6 p-6 rounded-xl border border-white/10 bg-white/5 flex items-center justify-center">
    <div className="flex items-center gap-3">
      <Loader2 size={20} className="text-cyan-400 animate-spin" />
      <span className="text-zinc-500 text-sm">Loading ad...</span>
    </div>
  </div>
);

// AI Prompt Chips
const AIPromptChips = ({ onPromptClick }) => (
  <div className="mt-8 space-y-3">
    {aiPrompts.map((prompt, i) => (
      <motion.button
        key={i}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: i * 0.1 }}
        onClick={() => onPromptClick(prompt.text)}
        className="w-full p-4 rounded-xl border border-white/10 bg-white/5 text-left hover:border-cyan-500/30 hover:bg-white/10 transition-all group"
      >
        <div className="flex items-center gap-3">
          <span className="text-2xl">{prompt.emoji}</span>
          <span className="text-white group-hover:text-cyan-400 transition-colors">{prompt.text}</span>
        </div>
      </motion.button>
    ))}
  </div>
);

// Performance Metrics Panel
const MetricsPanel = () => {
  const metrics = [
    { label: 'Impressions', value: '12.4K', icon: Eye, color: 'text-cyan-400' },
    { label: 'eCPM', value: '$8.20', icon: DollarSign, color: 'text-emerald-400' },
    { label: 'CTR', value: '3.2%', icon: TrendingUp, color: 'text-violet-400' },
    { label: 'Revenue', value: '$102', icon: BarChart3, color: 'text-amber-400' },
  ];
  
  return (
    <div className="mt-8 p-4 rounded-xl border border-white/10 bg-[#0A0A0A]">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        <span className="text-emerald-400 text-xs font-mono">LIVE METRICS</span>
      </div>
      <div className="grid grid-cols-4 gap-4">
        {metrics.map((metric, i) => (
          <div key={i} className="text-center">
            <metric.icon size={20} className={`mx-auto mb-2 ${metric.color}`} />
            <p className={`text-lg font-bold ${metric.color} font-mono`}>{metric.value}</p>
            <p className="text-zinc-500 text-xs">{metric.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

// ============== MAIN COMPONENT ==============

const MonetizationPage = () => {
  const [showVideoAd, setShowVideoAd] = useState(true);
  const [chatExpanded, setChatExpanded] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-violet-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl" />
      </div>
      <div className="fixed inset-0 bg-[linear-gradient(to_right,#80808003_1px,transparent_1px),linear-gradient(to_bottom,#80808003_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none" />
      
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-white/5 backdrop-blur-xl bg-black/70">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/showcase" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
                <Cpu size={20} className="text-white" />
              </div>
              <div>
                <span className="text-xl font-bold font-['Space_Grotesk'] text-white">DemoAI</span>
                <span className="text-xs text-zinc-500 block">Native Ads</span>
              </div>
            </Link>
          </div>
          <BackToHub />
        </div>
      </header>
      
      {/* Hero Banner */}
      <div className="border-b border-white/5 bg-gradient-to-r from-violet-500/10 via-transparent to-cyan-500/10">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center gap-2">
            <Zap size={16} className="text-violet-400" />
            <span className="text-violet-400 text-sm font-medium">Native Widget & LLM Monetization</span>
            <span className="text-zinc-600 text-sm">•</span>
            <span className="text-zinc-400 text-sm">AI-Powered Revenue Engine</span>
          </div>
          <p className="text-zinc-500 text-sm mt-1">Watch LLM-driven content monetization in action</p>
        </div>
      </div>
      
      {/* Main Content */}
      <main className="relative max-w-4xl mx-auto px-6 py-8">
        {/* Article Header */}
        <div className="mb-6">
          <h1 className="text-3xl md:text-4xl font-bold text-white font-['Space_Grotesk'] mb-4">
            {articleContent.title}
          </h1>
          <div className="flex items-center justify-between">
            <span className="text-zinc-500 text-sm">{articleContent.date}</span>
            <div className="flex items-center gap-2">
              <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 text-zinc-400 hover:text-white hover:bg-white/10 transition-all text-sm">
                <Share2 size={14} />
                Share
              </button>
              <button 
                onClick={() => setIsSaved(!isSaved)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-all ${
                  isSaved 
                    ? 'bg-cyan-500/20 text-cyan-400' 
                    : 'bg-white/5 text-zinc-400 hover:text-white hover:bg-white/10'
                }`}
              >
                <Bookmark size={14} className={isSaved ? 'fill-current' : ''} />
                {isSaved ? 'Saved' : 'Save'}
              </button>
            </div>
          </div>
        </div>
        
        {/* Hero Image */}
        <div className="relative rounded-2xl overflow-hidden mb-8">
          <img 
            src={articleContent.image} 
            alt={articleContent.title}
            className="w-full aspect-[16/9] object-cover"
          />
          <div className="absolute bottom-4 left-4 px-3 py-1.5 rounded-lg bg-black/70 backdrop-blur-sm">
            <span className="text-zinc-400 text-xs">{articleContent.author}</span>
          </div>
        </div>
        
        {/* Article Content with Ads */}
        <article className="prose prose-invert max-w-none">
          {articleContent.sections.map((section, i) => (
            <div key={i}>
              <p className="text-zinc-300 leading-relaxed mb-6">
                {section.text}
              </p>
              
              {section.hasAd && section.adType === 'video' && showVideoAd && (
                <VideoAd 
                  onSkip={() => setShowVideoAd(false)} 
                  onClose={() => setShowVideoAd(false)} 
                />
              )}
              
              {section.hasAd && section.adType === 'native' && (
                <InlineNativeAd />
              )}
              
              {i === 1 && <ProductsCarousel />}
              
              {i === 3 && <LoadingAd />}
            </div>
          ))}
        </article>
        
        {/* Tags */}
        <div className="mt-8 flex flex-wrap gap-2">
          {articleContent.tags.map((tag, i) => (
            <span 
              key={i} 
              className="px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-zinc-400 text-sm hover:border-cyan-500/30 hover:text-white transition-all cursor-pointer"
            >
              {tag}
            </span>
          ))}
        </div>
        
        {/* AI Prompts */}
        <AIPromptChips onPromptClick={(text) => {
          setChatExpanded(true);
        }} />
        
        {/* Live Metrics */}
        <MetricsPanel />
        
        {/* Sponsored Footer Banner */}
        <div className="mt-8 p-6 rounded-2xl border border-violet-500/30 bg-gradient-to-r from-violet-500/10 to-cyan-500/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                <Sparkles size={24} className="text-white" />
              </div>
              <div>
                <p className="text-zinc-500 text-xs mb-1">Sponsored</p>
                <h4 className="text-white font-semibold">AdsGupta AI</h4>
                <p className="text-zinc-400 text-sm">Monetize your content with AI-powered ads</p>
              </div>
            </div>
            <a 
              href="https://adsgupta.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-violet-500 to-purple-600 text-white font-medium hover:from-violet-400 hover:to-purple-500 transition-all"
            >
              Learn More
              <ExternalLink size={14} />
            </a>
          </div>
        </div>
      </main>
      
      {/* AI Chat Floater */}
      <AIChatFloater 
        isExpanded={chatExpanded} 
        onToggle={() => setChatExpanded(!chatExpanded)} 
      />
    </div>
  );
};

export default MonetizationPage;

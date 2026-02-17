/**
 * Monetization Demo Page - TalentOS Design Language
 * LLM Native Ads Showcase with Global Sidebar Navigation
 * Mobile & Desktop Responsive
 * Route: /monetization
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import {
  Menu, X, ChevronLeft, ChevronRight, Cpu, Zap, ShoppingCart,
  Bot, MessageCircle, Brain, ExternalLink, Play, Pause, Volume2,
  VolumeX, SkipForward, Star, Eye, Heart, Share2, Bookmark,
  Send, Mic, Paperclip, Sparkles, LayoutGrid, Users, TrendingUp,
  Clock, Maximize2, MoreVertical, Home
} from 'lucide-react';

// ============== GLOBAL SIDEBAR ==============

const GlobalSidebar = ({ isOpen, onToggle, currentPath }) => {
  const navItems = [
    { icon: Home, label: 'Command Center', path: '/showcase', description: 'DemoAI Root' },
    { icon: ShoppingCart, label: 'Amazon Optimizer', path: '/amazon-audit', description: 'Marketplace Audit' },
    { icon: Zap, label: 'Native Monetization', path: '/monetization', description: 'LLM Ad Engine', active: true },
    { icon: Brain, label: 'TalentOS', path: 'https://talentos.adsgupta.com', description: 'Career AI', external: true },
    { icon: Bot, label: 'Neural Oracle', path: '#', description: 'Staging', staging: true },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onToggle}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{ 
          x: isOpen ? 0 : -280,
          width: isOpen ? 280 : 0
        }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="fixed left-0 top-0 bottom-0 w-[280px] bg-[#050505] border-r border-white/5 z-50 overflow-hidden"
      >
        <div className="h-full flex flex-col">
          {/* Header */}
          <div className="p-6 border-b border-white/5">
            <div className="flex items-center justify-between">
              <Link to="/showcase" className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
                  <Cpu size={20} className="text-white" />
                </div>
                <div>
                  <span className="text-white font-bold font-['Space_Grotesk'] text-lg">DemoAI</span>
                  <span className="text-zinc-600 text-xs block">by AdsGupta</span>
                </div>
              </Link>
              <button
                onClick={onToggle}
                className="lg:hidden p-2 rounded-lg hover:bg-white/5 text-zinc-400"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            <p className="text-zinc-600 text-xs font-medium uppercase tracking-wider px-3 mb-3">Protocols</p>
            {navItems.map((item, i) => {
              const isActive = item.active || currentPath === item.path;
              const isExternal = item.external;
              const isStaging = item.staging;
              
              const content = (
                <div className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all ${
                  isActive 
                    ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/10 border border-cyan-500/30 text-cyan-400' 
                    : 'text-zinc-400 hover:text-white hover:bg-white/5'
                }`}>
                  <item.icon size={20} />
                  <div className="flex-1 min-w-0">
                    <span className="text-sm font-medium block truncate">{item.label}</span>
                    <span className="text-xs text-zinc-600 block truncate">{item.description}</span>
                  </div>
                  {isExternal && <ExternalLink size={14} className="text-zinc-600" />}
                  {isStaging && (
                    <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 text-[10px] font-medium">
                      STAGING
                    </span>
                  )}
                </div>
              );

              if (isExternal) {
                return (
                  <a key={i} href={item.path} target="_blank" rel="noopener noreferrer">
                    {content}
                  </a>
                );
              }
              
              if (isStaging) {
                return <div key={i} className="cursor-not-allowed opacity-60">{content}</div>;
              }

              return (
                <Link key={i} to={item.path}>
                  {content}
                </Link>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-white/5">
            <div className="px-3 py-3 rounded-xl bg-white/[0.02] border border-white/5">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-emerald-400 text-xs font-mono">SYSTEM ONLINE</span>
              </div>
              <p className="text-zinc-700 text-[10px] font-mono">AD-OS Protocol v3.2.1</p>
            </div>
          </div>
        </div>

        {/* Desktop Toggle Button */}
        <button
          onClick={onToggle}
          className="hidden lg:flex absolute -right-4 top-1/2 -translate-y-1/2 w-8 h-16 bg-[#0A0A0A] border border-white/10 rounded-r-xl items-center justify-center hover:bg-white/5 transition-all group z-10"
        >
          <ChevronRight size={16} className={`text-zinc-500 group-hover:text-cyan-400 transition-all ${isOpen ? 'rotate-180' : ''}`} />
        </button>
      </motion.aside>
    </>
  );
};

// ============== DATA ==============

const articleContent = {
  title: "Myth: Coconut Oil Causes Weight Gain",
  subtitle: "The truth about MCTs, metabolism, and mindful consumption",
  date: "11 Nov 2025",
  readTime: "5 min read",
  heroImage: "https://images.unsplash.com/photo-1526947425960-945c6e72858f?w=1200&q=80",
  author: "Prototype by Ranjan",
  paragraphs: [
    { highlight: "Coconut oil", text: "has often been misunderstood when it comes to weight gain. The truth is, it doesn't directly make you gain weight — the impact depends on how and how much you use it." },
    { highlight: "Coconut oil", text: "is rich in medium-chain triglycerides (MCTs), a type of fat that's metabolized faster than most other dietary fats. Unlike long-chain fatty acids, MCTs are quickly converted into energy by the liver instead of being stored as body fat." },
    { text: "Several studies suggest that moderate MCT intake may even support fat oxidation and satiety, helping with better appetite control and energy balance." },
    { highlight: "Coconut oil", text: "is still calorie-dense, so it should be used wisely — as a complement to a balanced diet, not as a cure-all." },
    { text: "Health experts now acknowledge that the type of fat matters just as much as the amount. Virgin coconut oil contains antioxidants and anti-inflammatory compounds that support metabolism and overall wellness." },
    { text: "Incorporating coconut oil mindfully is where the real benefits shine. A teaspoon added to your morning coffee, blended into a smoothie, or used to sauté vegetables can provide lasting energy." },
  ],
  tags: ["coconut oil", "weight management", "MCTs", "nutrition", "health myths"]
};

const curatedContent = [
  { emoji: "🤔", title: "Wait, does coconut oil really help you lose weight?", desc: "Turns out, only specific MCTs matter for metabolism...", views: "2.5k", likes: "1.5k" },
  { emoji: "✨", title: "The 'miracle oil' that does... what exactly?", desc: "Great for skin & hair, yes. But the rest?", views: "3.5k", likes: "2.5k" },
  { emoji: "🔥", title: "High heat cooking with coconut oil?", desc: "Safe? Yes. Smart? There's a nutrient trade-off...", views: "4.8k", likes: "3.2k" },
  { emoji: "💚", title: "Heart health hero or silent risk?", desc: "Studies are split on LDL concerns...", views: "5.1k", likes: "3.7k" },
  { emoji: "🥥", title: "vs 🫒 The ultimate oil showdown", desc: "Spoiler: Neither wins. It depends...", views: "6.2k", likes: "4.5k", sponsored: true }
];

const products = [
  { name: "Dabur Coconut Oil 200ml", price: 140, rating: 4.5, reviews: "1.2k", image: "https://images.unsplash.com/photo-1525351326368-efbb5cb6814d?w=200&q=80" },
  { name: "Parachute Advansed 500ml", price: 210, rating: 4.6, reviews: "3.4k", image: "https://images.unsplash.com/photo-1593164842264-854604db2260?w=200&q=80" },
  { name: "KLF Nirmal Cold Pressed", price: 185, rating: 4.6, reviews: "3.2k", image: "https://images.unsplash.com/photo-1474899420076-a61e74989430?w=200&q=80" },
  { name: "Coco Soul Cold Pressed", price: 225, rating: 4.7, reviews: "2.8k", image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200&q=80" },
  { name: "24 Mantra Organic 500ml", price: 199, rating: 4.5, reviews: "4.1k", image: "https://images.unsplash.com/photo-1583224964564-a4e1d2c67f90?w=200&q=80" },
  { name: "Nutiva Virgin Coconut Oil", price: 599, rating: 4.8, reviews: "6.5k", image: "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=200&q=80" },
];

const rotatingTexts = ["Dabur Coconut Oil 200ml", "Ask about MCT benefits", "Compare coconut oils", "Get nutrition tips"];

// ============== COMPONENTS ==============

// Glowing Border Component (TalentOS Style)
const GlowingBorder = ({ children, className = '', gradient = 'from-cyan-500 via-blue-500 to-purple-500' }) => (
  <div className={`relative group ${className}`}>
    <div className={`absolute -inset-0.5 bg-gradient-to-r ${gradient} rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-500`} />
    <div className="relative bg-[#0A0A0A] rounded-2xl">{children}</div>
  </div>
);

// Video Ad Component
const VideoAd = ({ onSkip, compact = false }) => {
  const [skipTime, setSkipTime] = useState(5);
  const [canSkip, setCanSkip] = useState(false);
  const [isMuted, setIsMuted] = useState(true);

  useEffect(() => {
    if (skipTime > 0) {
      const timer = setTimeout(() => setSkipTime(skipTime - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanSkip(true);
    }
  }, [skipTime]);

  return (
    <div className={`rounded-xl overflow-hidden border border-white/10 bg-black relative ${compact ? 'aspect-video' : ''}`}>
      <div className="absolute top-2 left-2 px-2 py-0.5 bg-black/80 text-white text-xs font-bold rounded z-10">AD</div>
      <div className="absolute top-2 right-2 z-10">
        <button
          onClick={() => canSkip && onSkip?.()}
          className={`px-3 py-1 rounded text-xs font-medium transition-all ${
            canSkip ? 'bg-white text-black hover:bg-gray-100' : 'bg-black/60 text-white/80'
          }`}
        >
          {canSkip ? 'Skip Ad' : `Skip in ${skipTime}s`}
        </button>
      </div>
      <video
        className="w-full h-full object-cover"
        poster="https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&q=80"
        muted={isMuted}
        loop
        autoPlay
        playsInline
      >
        <source src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4" type="video/mp4" />
      </video>
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3">
        <div className="flex items-center gap-2 text-white/80 text-sm">
          <Play size={14} />
          <span className="text-xs">0:00</span>
          <div className="flex-1 h-1 bg-white/20 rounded-full">
            <div className="w-1/4 h-full bg-cyan-400 rounded-full" />
          </div>
          <button onClick={() => setIsMuted(!isMuted)}>
            {isMuted ? <VolumeX size={14} /> : <Volume2 size={14} />}
          </button>
          <Maximize2 size={14} />
        </div>
      </div>
    </div>
  );
};

// Product Card (TalentOS Bento Style)
const ProductCard = ({ product }) => (
  <motion.div
    whileHover={{ y: -4, scale: 1.02 }}
    transition={{ duration: 0.2 }}
    className="flex-shrink-0 w-36 sm:w-40 rounded-xl overflow-hidden border border-white/5 bg-[#0A0A0A] hover:border-cyan-500/30 transition-all group"
  >
    <div className="relative">
      <span className="absolute top-2 left-2 px-1.5 py-0.5 rounded bg-cyan-500/90 text-white text-[9px] font-bold">
        Sponsored
      </span>
      <img src={product.image} alt={product.name} className="w-full h-28 object-cover" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
    </div>
    <div className="p-3">
      <h4 className="text-white text-xs font-medium line-clamp-2 min-h-[2rem]">{product.name}</h4>
      <p className="text-cyan-400 font-bold text-sm mt-1">₹{product.price}</p>
      <div className="flex items-center gap-1 mt-1">
        <Star size={10} className="text-amber-400 fill-amber-400" />
        <span className="text-white text-[10px]">{product.rating}</span>
        <span className="text-zinc-600 text-[10px]">({product.reviews})</span>
      </div>
      <button className="w-full mt-2 py-1.5 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-[10px] font-medium hover:from-cyan-400 hover:to-blue-500 transition-all">
        Buy Now
      </button>
    </div>
  </motion.div>
);

// Curated Content Card
const CuratedCard = ({ item, onClick }) => (
  <motion.button
    onClick={onClick}
    whileHover={{ scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
    className="flex-shrink-0 w-64 sm:w-72 p-4 rounded-xl bg-gradient-to-br from-cyan-500/10 to-blue-500/5 border border-cyan-500/20 hover:border-cyan-500/40 transition-all text-left relative overflow-hidden group"
  >
    {item.sponsored && (
      <span className="absolute top-2 right-2 px-2 py-0.5 rounded bg-cyan-500 text-[10px] font-bold text-white">
        SPONSORED
      </span>
    )}
    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
    <span className="text-2xl">{item.emoji}</span>
    <h4 className="text-white font-medium text-sm mt-2 line-clamp-2">{item.title}</h4>
    <p className="text-zinc-500 text-xs mt-1 line-clamp-2">{item.desc}</p>
    <div className="flex items-center gap-3 mt-3 text-zinc-600 text-xs">
      <span className="flex items-center gap-1"><Eye size={10} /> {item.views}</span>
      <span className="flex items-center gap-1"><Heart size={10} /> {item.likes}</span>
    </div>
  </motion.button>
);

// Neural Oracle Floating Button
const NeuralOracleFloater = ({ onClick, rotatingText }) => (
  <motion.button
    onClick={onClick}
    className="fixed bottom-6 right-6 z-50 group"
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
    data-testid="neural-oracle-floater"
  >
    {/* Rotating text bubble - Hidden on mobile */}
    <div className="hidden sm:block absolute right-full mr-3 top-1/2 -translate-y-1/2 whitespace-nowrap">
      <div className="px-4 py-2 rounded-xl bg-[#0A0A0A] border border-cyan-500/30 shadow-lg shadow-cyan-500/10">
        <div className="flex items-center gap-2">
          <span className="text-white font-medium text-sm">Neural Oracle</span>
          <span className="px-1.5 py-0.5 rounded bg-cyan-500 text-[10px] font-bold text-white">AI</span>
        </div>
        <div className="flex items-center gap-2 mt-1">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-emerald-400 text-xs">Online</span>
          <span className="text-cyan-400 text-xs truncate max-w-[150px]">{rotatingText}</span>
        </div>
      </div>
      <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-2 h-2 bg-[#0A0A0A] border-r border-b border-cyan-500/30 rotate-[-45deg]" />
    </div>

    {/* Main Button */}
    <div className="relative">
      <div className="absolute inset-0 rounded-full bg-cyan-500/30 animate-ping" />
      <div className="absolute -inset-2 rounded-full bg-gradient-to-r from-cyan-500/20 to-blue-500/20 animate-pulse" />
      <div className="relative w-14 h-14 rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center shadow-[0_0_40px_rgba(0,255,255,0.3)]">
        <Cpu size={24} className="text-white" />
      </div>
      <div className="absolute -top-1 -right-1 px-1.5 py-0.5 rounded-full bg-cyan-500 text-[10px] font-bold text-white border-2 border-[#0A0A0A]">AI</div>
      <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-400 border-2 border-[#0A0A0A]" />
    </div>
  </motion.button>
);

// Neural Oracle Panel (TalentOS Style)
const NeuralOraclePanel = ({ isOpen, onClose }) => {
  const [message, setMessage] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [isTyping, setIsTyping] = useState(false);

  const handleSend = () => {
    if (!message.trim()) return;
    setChatHistory(prev => [...prev, { role: 'user', content: message }]);
    setMessage('');
    setIsTyping(true);
    setTimeout(() => {
      setChatHistory(prev => [...prev, { 
        role: 'assistant', 
        content: "Great question! Coconut oil's MCTs are metabolized differently - they go straight to the liver for energy. This can boost metabolism slightly, but moderation is key since it's still calorie-dense!"
      }]);
      setIsTyping(false);
    }, 1500);
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: '100%', opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: '100%', opacity: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="w-full sm:max-w-4xl bg-[#0A0A0A] rounded-t-3xl sm:rounded-2xl border-t sm:border border-white/10 max-h-[90vh] overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-white/5 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/5 text-zinc-400 hover:text-white hover:bg-white/10 transition-all"
          >
            <X size={20} />
          </button>
          <h2 className="text-xl sm:text-2xl font-bold text-white font-['Space_Grotesk'] pr-10">
            Myth vs Reality: A quick breakdown
          </h2>
          <p className="text-zinc-500 text-sm mt-1">
            Understanding the truth about coconut oil and metabolism
          </p>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto max-h-[60vh] p-4 sm:p-6 space-y-6">
          {/* Curated Contents */}
          <div>
            <h3 className="text-cyan-400 text-sm font-medium mb-3 flex items-center gap-2">
              <Sparkles size={14} />
              Curated contents for you
            </h3>
            <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 scrollbar-hide">
              {curatedContent.map((item, i) => (
                <CuratedCard key={i} item={item} onClick={() => {}} />
              ))}
            </div>
          </div>

          {/* Recommended Products */}
          <div>
            <h3 className="text-white font-medium mb-3">Recommended Products</h3>
            <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 scrollbar-hide">
              {products.map((product, i) => (
                <ProductCard key={i} product={product} />
              ))}
            </div>
          </div>

          {/* Chat History */}
          {chatHistory.length > 0 && (
            <div className="space-y-3">
              {chatHistory.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[85%] px-4 py-3 rounded-2xl text-sm ${
                    msg.role === 'user' 
                      ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-br-md' 
                      : 'bg-white/5 border border-white/10 text-zinc-200 rounded-bl-md'
                  }`}>
                    {msg.content}
                  </div>
                </motion.div>
              ))}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-white/5 border border-white/10 px-4 py-3 rounded-2xl rounded-bl-md">
                    <div className="flex gap-1">
                      {[0, 1, 2].map(i => (
                        <div key={i} className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: `${i * 150}ms` }} />
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Chat Input */}
        <div className="p-4 sm:p-6 border-t border-white/5 bg-[#050505]">
          <div className="flex items-center gap-2 mb-3">
            <Cpu size={18} className="text-cyan-400" />
            <span className="text-white font-medium text-sm">Neural Oracle</span>
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          </div>
          <div className="relative">
            <input
              type="text"
              value={message}
              onChange={e => setMessage(e.target.value)}
              onKeyPress={e => e.key === 'Enter' && handleSend()}
              placeholder="Ask the Neural Engine..."
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 pr-28 text-white placeholder-zinc-600 focus:outline-none focus:border-cyan-500/50 text-sm"
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
              <button className="p-2 text-zinc-500 hover:text-white transition-colors"><Paperclip size={16} /></button>
              <button className="p-2 text-zinc-500 hover:text-white transition-colors"><Mic size={16} /></button>
              <button onClick={handleSend} className="p-2 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-lg text-white hover:opacity-90 transition-all">
                <Send size={14} />
              </button>
            </div>
          </div>
          <button className="w-full mt-3 py-2.5 rounded-xl border border-cyan-500/30 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 text-cyan-400 text-sm font-medium flex items-center justify-center gap-2 hover:from-cyan-500/20 hover:to-blue-500/20 transition-all">
            <Sparkles size={14} />
            Upgrade to AI Pro
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

// ============== MAIN COMPONENT ==============

const MonetizationPage = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [rotatingIndex, setRotatingIndex] = useState(0);
  const [isSaved, setIsSaved] = useState(false);
  const [showVideoAd, setShowVideoAd] = useState(true);
  const productsRef = useRef(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setRotatingIndex(prev => (prev + 1) % rotatingTexts.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Close sidebar on desktop resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setSidebarOpen(true);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const scrollProducts = (direction) => {
    if (productsRef.current) {
      productsRef.current.scrollBy({ left: direction === 'left' ? -200 : 200, behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white">
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-cyan-500/5 rounded-full blur-[150px]" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[150px]" />
      </div>
      <div className="fixed inset-0 bg-[linear-gradient(to_right,#80808003_1px,transparent_1px),linear-gradient(to_bottom,#80808003_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none" />

      {/* Global Sidebar */}
      <GlobalSidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} currentPath="/monetization" />

      {/* Header */}
      <header className={`fixed top-0 right-0 z-40 bg-[#0A0A0A]/80 backdrop-blur-xl border-b border-white/5 transition-all ${sidebarOpen ? 'lg:left-[280px]' : 'left-0'}`}>
        <div className="flex items-center justify-between px-4 sm:px-6 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-lg hover:bg-white/5 text-zinc-400 hover:text-white transition-all"
              data-testid="menu-toggle"
            >
              <Menu size={20} />
            </button>
            <div className="hidden sm:flex items-center gap-2">
              <Zap size={16} className="text-cyan-400" />
              <span className="text-cyan-400 text-sm font-medium">Native Monetization</span>
              <span className="text-zinc-600">•</span>
              <span className="text-zinc-500 text-sm">AI-Powered Revenue Engine</span>
            </div>
          </div>
          <h1 className="text-lg sm:text-xl font-bold text-cyan-400 font-['Space_Grotesk'] sm:hidden">AdsGupta AI</h1>
          <div className="flex items-center gap-2">
            <button className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-zinc-400 hover:text-white text-sm transition-all">
              <Share2 size={14} />
              Share
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className={`relative pt-20 pb-24 transition-all ${sidebarOpen ? 'lg:ml-[280px]' : ''}`}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          {/* Article Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white font-['Space_Grotesk'] leading-tight mb-3">
              {articleContent.title}
            </h1>
            <p className="text-zinc-400 text-base sm:text-lg mb-4">{articleContent.subtitle}</p>
            <div className="flex flex-wrap items-center gap-4 text-sm">
              <span className="text-zinc-500">{articleContent.date}</span>
              <span className="text-zinc-600">•</span>
              <span className="text-zinc-500 flex items-center gap-1"><Clock size={14} /> {articleContent.readTime}</span>
              <button
                onClick={() => setIsSaved(!isSaved)}
                className={`flex items-center gap-1 ml-auto ${isSaved ? 'text-cyan-400' : 'text-zinc-500 hover:text-white'} transition-colors`}
              >
                <Bookmark size={16} className={isSaved ? 'fill-current' : ''} />
                {isSaved ? 'Saved' : 'Save'}
              </button>
            </div>
          </motion.div>

          {/* Hero Image */}
          <GlowingBorder className="mb-8">
            <div className="relative rounded-2xl overflow-hidden">
              <img 
                src={articleContent.heroImage} 
                alt={articleContent.title}
                className="w-full aspect-[16/9] object-cover"
              />
              <div className="absolute bottom-4 left-4 px-3 py-1.5 rounded-lg bg-black/60 backdrop-blur-sm">
                <span className="text-zinc-400 text-xs">{articleContent.author}</span>
              </div>
            </div>
          </GlowingBorder>

          {/* Article Content */}
          <article className="space-y-6">
            {/* First paragraphs */}
            <p className="text-zinc-300 leading-relaxed text-base sm:text-lg">
              <a href="#" className="text-cyan-400 hover:underline font-medium">{articleContent.paragraphs[0].highlight}</a>
              {' '}{articleContent.paragraphs[0].text}
            </p>

            {/* Video Ad */}
            {showVideoAd && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <GlowingBorder gradient="from-violet-500 via-purple-500 to-pink-500">
                  <VideoAd onSkip={() => setShowVideoAd(false)} />
                </GlowingBorder>
              </motion.div>
            )}

            <p className="text-zinc-300 leading-relaxed text-base sm:text-lg">
              <a href="#" className="text-cyan-400 hover:underline font-medium">{articleContent.paragraphs[1].highlight}</a>
              {' '}{articleContent.paragraphs[1].text}
            </p>

            <p className="text-zinc-300 leading-relaxed text-base sm:text-lg">{articleContent.paragraphs[2].text}</p>

            {/* Products Carousel */}
            <div className="py-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white font-['Space_Grotesk']">Recommended Products</h3>
                <div className="flex gap-2">
                  <button onClick={() => scrollProducts('left')} className="p-2 rounded-lg bg-white/5 border border-white/10 text-zinc-400 hover:text-white hover:bg-white/10 transition-all">
                    <ChevronLeft size={16} />
                  </button>
                  <button onClick={() => scrollProducts('right')} className="p-2 rounded-lg bg-white/5 border border-white/10 text-zinc-400 hover:text-white hover:bg-white/10 transition-all">
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
              <div ref={productsRef} className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
                {products.map((product, i) => (
                  <ProductCard key={i} product={product} />
                ))}
              </div>
            </div>

            <p className="text-zinc-300 leading-relaxed text-base sm:text-lg">
              The key, however, is moderation.{' '}
              <a href="#" className="text-cyan-400 hover:underline font-medium">{articleContent.paragraphs[3].highlight}</a>
              {' '}{articleContent.paragraphs[3].text}
            </p>

            <p className="text-zinc-300 leading-relaxed text-base sm:text-lg">{articleContent.paragraphs[4].text}</p>
            <p className="text-zinc-300 leading-relaxed text-base sm:text-lg">{articleContent.paragraphs[5].text}</p>
          </article>

          {/* Tags */}
          <div className="mt-8 flex flex-wrap gap-2">
            {articleContent.tags.map((tag, i) => (
              <span 
                key={i}
                className="px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-zinc-400 text-sm hover:border-cyan-500/30 hover:text-white cursor-pointer transition-all"
              >
                {tag}
              </span>
            ))}
          </div>

          {/* AI Prompt Chips */}
          <div className="mt-8 space-y-3">
            <h3 className="text-lg font-semibold text-white font-['Space_Grotesk'] flex items-center gap-2">
              <Sparkles size={18} className="text-cyan-400" />
              Ask Neural Oracle
            </h3>
            {curatedContent.slice(0, 4).map((item, i) => (
              <motion.button
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                onClick={() => setIsPanelOpen(true)}
                className="w-full p-4 rounded-xl border border-white/5 bg-white/[0.02] text-left hover:border-cyan-500/30 hover:bg-white/5 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{item.emoji}</span>
                  <span className="text-white group-hover:text-cyan-400 transition-colors flex-1">{item.title}</span>
                  <ChevronRight size={16} className="text-zinc-600 group-hover:text-cyan-400 transition-colors" />
                </div>
              </motion.button>
            ))}
          </div>

          {/* Sponsored Banner */}
          <GlowingBorder className="mt-8" gradient="from-violet-500 via-purple-500 to-cyan-500">
            <div className="p-6 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center flex-shrink-0">
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
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-violet-500 to-purple-600 text-white font-medium hover:from-violet-400 hover:to-purple-500 transition-all flex-shrink-0"
              >
                Learn More
                <ExternalLink size={14} />
              </a>
            </div>
          </GlowingBorder>
        </div>
      </main>

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
    </div>
  );
};

export default MonetizationPage;

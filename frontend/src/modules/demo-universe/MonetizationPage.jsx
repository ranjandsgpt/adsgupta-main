/**
 * MonetizationPage.jsx - LLM Native Ads Showcase
 * Monetization AI - Unified Ad-Hook System with SLM Intelligence
 * Route: /monetization
 * 
 * Features:
 * - Dynamic Hyperlinking (content-aware ad hooks)
 * - Sticky 320x50 Footer Ad
 * - Unified Dynamic Popup (triggered by hyperlinks, chatbot, sticky ad)
 * - Chrome SLM (Gemini Nano) integration for contextual intelligence
 * - Enterprise Ad-Stack Architecture (GAM + TAM + OpenWrap placeholders)
 * - Content-Fluidity (re-initializes on content change)
 */
import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Menu, ChevronLeft, ChevronRight, Zap, Star, Clock, Bookmark,
  Share2, Sparkles, Cpu
} from 'lucide-react';

// Import refactored components
import GlobalSidebar from './components/monetization/GlobalSidebar';
import DynamicPopup from './components/monetization/DynamicPopup';
import StickyAd from './components/monetization/StickyAd';
import { renderWithHyperlinks, useContentAnalysis } from './components/monetization/DynamicHyperlink';
import { VideoAd, GlowingBorder } from './components/monetization/AdContainer';
import { AdProvider } from './components/monetization/AdProvider';

// ============== ARTICLE DATA ==============

const articleContent = {
  title: "Myth: Coconut Oil Causes Weight Gain",
  subtitle: "The truth about MCTs, metabolism, and mindful consumption",
  date: "11 Nov 2025",
  readTime: "5 min read",
  heroImage: "https://images.unsplash.com/photo-1526947425960-945c6e72858f?w=1200&q=80",
  author: "Prototype by Ranjan",
  paragraphs: [
    { text: "Coconut oil has often been misunderstood when it comes to weight gain. The truth is, it doesn't directly make you gain weight — the impact depends on how and how much you use it." },
    { text: "Coconut oil is rich in medium-chain triglycerides (MCTs), a type of fat that's metabolized faster than most other dietary fats. Unlike long-chain fatty acids, MCTs are quickly converted into energy by the liver instead of being stored as body fat." },
    { text: "Several studies suggest that moderate MCT intake may even support fat oxidation and satiety, helping with better appetite control and energy balance." },
    { text: "The key, however, is moderation. Coconut oil is still calorie-dense, so it should be used wisely — as a complement to a balanced diet, not as a cure-all." },
    { text: "Health experts now acknowledge that the type of fat matters just as much as the amount. Virgin coconut oil contains antioxidants and anti-inflammatory compounds that support metabolism and overall wellness." },
    { text: "Incorporating coconut oil mindfully is where the real benefits shine. A teaspoon added to your morning coffee, blended into a smoothie, or used to sauté vegetables can provide lasting energy." },
  ],
  tags: ["coconut oil", "weight management", "MCTs", "nutrition", "health myths"]
};

// Combine all paragraphs for content analysis
const fullArticleText = articleContent.paragraphs.map(p => p.text).join(' ');

// ============== CURATED CONTENT DATA ==============

const curatedContent = [
  { emoji: "🤔", title: "Wait, does coconut oil really help you lose weight?", desc: "Turns out, only specific MCTs matter for metabolism...", views: "2.5k", likes: "1.5k" },
  { emoji: "✨", title: "The 'miracle oil' that does... what exactly?", desc: "Great for skin & hair, yes. But the rest?", views: "3.5k", likes: "2.5k" },
  { emoji: "🔥", title: "High heat cooking with coconut oil?", desc: "Safe? Yes. Smart? There's a nutrient trade-off...", views: "4.8k", likes: "3.2k" },
  { emoji: "💚", title: "Heart health hero or silent risk?", desc: "Studies are split on LDL concerns...", views: "5.1k", likes: "3.7k" },
  { emoji: "🥥", title: "vs 🫒 The ultimate oil showdown", desc: "Spoiler: Neither wins. It depends...", views: "6.2k", likes: "4.5k", sponsored: true }
];

// ============== PRODUCTS DATA ==============

const products = [
  { name: "Dabur Coconut Oil 200ml", price: 140, rating: 4.5, reviews: "1.2k", image: "https://images.unsplash.com/photo-1525351326368-efbb5cb6814d?w=200&q=80" },
  { name: "Parachute Advansed 500ml", price: 210, rating: 4.6, reviews: "3.4k", image: "https://images.unsplash.com/photo-1593164842264-854604db2260?w=200&q=80" },
  { name: "KLF Nirmal Cold Pressed", price: 185, rating: 4.6, reviews: "3.2k", image: "https://images.unsplash.com/photo-1474899420076-a61e74989430?w=200&q=80" },
  { name: "Coco Soul Cold Pressed", price: 225, rating: 4.7, reviews: "2.8k", image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200&q=80" },
  { name: "24 Mantra Organic 500ml", price: 199, rating: 4.5, reviews: "4.1k", image: "https://images.unsplash.com/photo-1583224964564-a4e1d2c67f90?w=200&q=80" },
  { name: "Nutiva Virgin Coconut Oil", price: 599, rating: 4.8, reviews: "6.5k", image: "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=200&q=80" },
];

// ============== ROTATING TEXTS FOR CHATBOT ==============

const rotatingTexts = ["Dabur Coconut Oil 200ml", "Ask about MCT benefits", "Compare coconut oils", "Get nutrition tips"];

// ============== PRODUCT CARD COMPONENT ==============

const ProductCard = ({ product }) => (
  <motion.div
    whileHover={{ y: -4, scale: 1.02 }}
    transition={{ duration: 0.2 }}
    className="flex-shrink-0 w-36 sm:w-40 rounded-xl overflow-hidden border border-white/5 bg-[#0A0A0A] hover:border-cyan-500/30 transition-all group"
    data-testid="product-card"
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

// ============== NEURAL ORACLE FLOATER ==============

const NeuralOracleFloater = ({ onClick, rotatingText }) => (
  <motion.button
    onClick={onClick}
    className="fixed bottom-20 right-6 z-40 group"
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

// ============== MAIN COMPONENT ==============

const MonetizationPage = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [rotatingIndex, setRotatingIndex] = useState(0);
  const [isSaved, setIsSaved] = useState(false);
  const [showVideoAd, setShowVideoAd] = useState(true);
  const productsRef = useRef(null);
  
  // Unified popup state
  const [popupState, setPopupState] = useState({
    isOpen: false,
    trigger: 'default',
    triggerTerm: ''
  });

  // Content analysis for dynamic keywords
  const { keywords: analyzedKeywords } = useContentAnalysis(fullArticleText, articleContent.tags);

  // Rotate text for chatbot floater
  useEffect(() => {
    const interval = setInterval(() => {
      setRotatingIndex(prev => (prev + 1) % rotatingTexts.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Open sidebar on desktop
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

  // Scroll products carousel
  const scrollProducts = (direction) => {
    if (productsRef.current) {
      productsRef.current.scrollBy({ left: direction === 'left' ? -200 : 200, behavior: 'smooth' });
    }
  };

  // Unified popup trigger handlers
  const openPopup = useCallback((trigger, triggerTerm = '') => {
    setPopupState({
      isOpen: true,
      trigger,
      triggerTerm
    });
  }, []);

  const closePopup = useCallback(() => {
    setPopupState(prev => ({ ...prev, isOpen: false }));
  }, []);

  // Handle hyperlink clicks - opens unified popup
  const handleHyperlinkClick = useCallback((keyword) => {
    openPopup('hyperlink', keyword);
  }, [openPopup]);

  // Handle sticky ad click - opens unified popup
  const handleStickyAdClick = useCallback(() => {
    openPopup('sticky_ad', 'Sponsored Products');
  }, [openPopup]);

  // Handle chatbot click - opens unified popup
  const handleChatbotClick = useCallback(() => {
    openPopup('chatbot', 'Ask Neural Oracle');
  }, [openPopup]);

  // Render paragraph with dynamic hyperlinks
  const renderParagraph = useCallback((text, index) => {
    return (
      <p key={index} className="text-zinc-300 leading-relaxed text-base sm:text-lg">
        {renderWithHyperlinks(text, handleHyperlinkClick, articleContent.tags)}
      </p>
    );
  }, [handleHyperlinkClick]);

  return (
    <AdProvider contentContext={{ vertical: 'health', keywords: articleContent.tags }}>
      <div className="min-h-screen bg-[#0A0A0A] text-white" data-testid="monetization-page">
        {/* Background Effects */}
        <div className="fixed inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-cyan-500/5 rounded-full blur-[150px]" />
          <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[150px]" />
        </div>
        <div className="fixed inset-0 bg-[linear-gradient(to_right,#80808003_1px,transparent_1px),linear-gradient(to_bottom,#80808003_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none" />

        {/* Global Sidebar */}
        <GlobalSidebar 
          isOpen={sidebarOpen} 
          onToggle={() => setSidebarOpen(!sidebarOpen)} 
          currentPath="/monetization" 
        />

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
            <h1 className="text-lg sm:text-xl font-bold text-cyan-400 font-['Space_Grotesk'] sm:hidden">Monetization AI</h1>
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
                  data-testid="save-article-btn"
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

            {/* Article Content with Dynamic Hyperlinks */}
            <article className="space-y-6">
              {/* First paragraph */}
              {renderParagraph(articleContent.paragraphs[0].text, 0)}

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

              {/* Second and third paragraphs */}
              {renderParagraph(articleContent.paragraphs[1].text, 1)}
              {renderParagraph(articleContent.paragraphs[2].text, 2)}

              {/* Products Carousel */}
              <div className="py-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white font-['Space_Grotesk']">Recommended Products</h3>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => scrollProducts('left')} 
                      className="p-2 rounded-lg bg-white/5 border border-white/10 text-zinc-400 hover:text-white hover:bg-white/10 transition-all"
                      data-testid="scroll-products-left"
                    >
                      <ChevronLeft size={16} />
                    </button>
                    <button 
                      onClick={() => scrollProducts('right')} 
                      className="p-2 rounded-lg bg-white/5 border border-white/10 text-zinc-400 hover:text-white hover:bg-white/10 transition-all"
                      data-testid="scroll-products-right"
                    >
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

              {/* Remaining paragraphs */}
              {articleContent.paragraphs.slice(3).map((p, i) => renderParagraph(p.text, i + 3))}
            </article>

            {/* Tags */}
            <div className="mt-8 flex flex-wrap gap-2">
              {articleContent.tags.map((tag, i) => (
                <button 
                  key={i}
                  onClick={() => handleHyperlinkClick(tag)}
                  className="px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-zinc-400 text-sm hover:border-cyan-500/30 hover:text-white cursor-pointer transition-all"
                  data-testid={`tag-${tag.replace(/\s+/g, '-')}`}
                >
                  {tag}
                </button>
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
                  onClick={() => openPopup('chatbot', item.title)}
                  className="w-full p-4 rounded-xl border border-white/5 bg-white/[0.02] text-left hover:border-cyan-500/30 hover:bg-white/5 transition-all group"
                  data-testid={`prompt-chip-${i}`}
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
                    <h4 className="text-white font-semibold">Monetization AI</h4>
                    <p className="text-zinc-400 text-sm">Power your content with AI-native advertising</p>
                  </div>
                </div>
                <a 
                  href="https://adsgupta.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-violet-500 to-purple-600 text-white font-medium hover:from-violet-400 hover:to-purple-500 transition-all flex-shrink-0"
                  data-testid="sponsored-cta"
                >
                  Learn More
                </a>
              </div>
            </GlowingBorder>
          </div>
        </main>

        {/* Neural Oracle Floater */}
        <NeuralOracleFloater 
          onClick={handleChatbotClick}
          rotatingText={rotatingTexts[rotatingIndex]}
        />

        {/* Sticky Footer Ad - 320x50 */}
        <StickyAd 
          onAdClick={handleStickyAdClick}
          isVisible={true}
        />

        {/* Unified Dynamic Popup */}
        <AnimatePresence>
          {popupState.isOpen && (
            <DynamicPopup 
              isOpen={popupState.isOpen}
              onClose={closePopup}
              trigger={popupState.trigger}
              triggerTerm={popupState.triggerTerm}
              pageContent={fullArticleText}
              keywords={analyzedKeywords}
              products={products}
              curatedContent={curatedContent}
            />
          )}
        </AnimatePresence>
      </div>
    </AdProvider>
  );
};

export default MonetizationPage;

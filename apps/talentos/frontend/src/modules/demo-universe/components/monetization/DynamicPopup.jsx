/**
 * DynamicPopup.jsx - Unified Ad-Hook Popup with SLM Intelligence
 * Single popup triggered by: Hyperlinks, Chatbot, Sticky Ad
 * Integrates Chrome's Prompt API (Gemini Nano) for contextual content
 */
import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Sparkles, Star, Eye, Heart, Send, Mic, Paperclip,
  Cpu, Loader2, AlertTriangle, RefreshCw, ChevronRight
} from 'lucide-react';

// Check if Chrome's AI API is available
const checkSLMAvailability = async () => {
  if (typeof window !== 'undefined' && window.ai?.languageModel) {
    try {
      const availability = await window.ai.languageModel.availability();
      return availability === 'available' || availability === 'readily';
    } catch (e) {
      console.log('[SLM] API check failed:', e);
      return false;
    }
  }
  return false;
};

// SLM Service for contextual intelligence
const SLMService = {
  session: null,
  
  async initialize() {
    if (!window.ai?.languageModel) return false;
    try {
      this.session = await window.ai.languageModel.create({
        systemPrompt: `You are an AI assistant for a native advertising platform. 
        Your role is to:
        1. Summarize article content concisely (2-3 sentences max)
        2. Generate relevant ad suggestions based on content context
        3. Create engaging prompt suggestions that users might ask
        Keep responses brief, helpful, and contextually relevant to the content.`
      });
      return true;
    } catch (e) {
      console.error('[SLM] Failed to create session:', e);
      return false;
    }
  },
  
  async summarize(content) {
    if (!this.session) return null;
    try {
      const response = await this.session.prompt(
        `Summarize this article in 2-3 short sentences, focusing on key takeaways:\n\n${content.substring(0, 2000)}`
      );
      return response;
    } catch (e) {
      console.error('[SLM] Summarize failed:', e);
      return null;
    }
  },
  
  async generateAdSuggestions(content, keywords) {
    if (!this.session) return null;
    try {
      const response = await this.session.prompt(
        `Based on this article about "${keywords.join(', ')}", suggest 3 relevant product categories for advertising (one line each):\n\n${content.substring(0, 1500)}`
      );
      return response.split('\n').filter(line => line.trim());
    } catch (e) {
      console.error('[SLM] Ad suggestions failed:', e);
      return null;
    }
  },
  
  async generatePromptSuggestions(content, clickedTerm) {
    if (!this.session) return null;
    try {
      const response = await this.session.prompt(
        `The user clicked on "${clickedTerm}" in an article. Generate 4 short questions (max 10 words each) they might want to ask about this topic. Format: one question per line.`
      );
      return response.split('\n').filter(line => line.trim()).slice(0, 4);
    } catch (e) {
      console.error('[SLM] Prompt suggestions failed:', e);
      return null;
    }
  },
  
  async chat(message, context) {
    if (!this.session) return null;
    try {
      const response = await this.session.prompt(
        `Context: Article about ${context.keywords?.join(', ') || 'general topics'}\n\nUser question: ${message}\n\nProvide a helpful, concise answer (2-3 sentences).`
      );
      return response;
    } catch (e) {
      console.error('[SLM] Chat failed:', e);
      return null;
    }
  },
  
  destroy() {
    if (this.session?.destroy) {
      this.session.destroy();
    }
    this.session = null;
  }
};

// Curated Content Card
const CuratedCard = ({ item, onClick }) => (
  <motion.button
    onClick={() => onClick?.(item)}
    whileHover={{ scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
    className="flex-shrink-0 w-64 sm:w-72 p-4 rounded-xl bg-gradient-to-br from-cyan-500/10 to-blue-500/5 border border-cyan-500/20 hover:border-cyan-500/40 transition-all text-left relative overflow-hidden group"
    data-testid="curated-card"
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

// Product Card (Compact)
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

// Main Dynamic Popup Component
const DynamicPopup = ({ 
  isOpen, 
  onClose, 
  trigger = 'default', // 'hyperlink' | 'chatbot' | 'sticky_ad' | 'default'
  triggerTerm = '',
  pageContent = '',
  keywords = [],
  products = [],
  curatedContent = []
}) => {
  const [slmAvailable, setSLMAvailable] = useState(false);
  const [slmInitialized, setSLMInitialized] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // SLM-generated content
  const [summary, setSummary] = useState('');
  const [adSuggestions, setAdSuggestions] = useState([]);
  const [promptSuggestions, setPromptSuggestions] = useState([]);
  
  // Chat state
  const [message, setMessage] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  
  const chatRef = useRef(null);

  // Check SLM availability on mount
  useEffect(() => {
    checkSLMAvailability().then(available => {
      setSLMAvailable(available);
      if (available) {
        SLMService.initialize().then(success => {
          setSLMInitialized(success);
        });
      }
    });
    
    return () => {
      SLMService.destroy();
    };
  }, []);

  // Generate contextual content when popup opens
  useEffect(() => {
    if (!isOpen) return;
    
    const generateContent = async () => {
      setLoading(true);
      setError(null);
      
      if (slmInitialized && pageContent) {
        try {
          // Generate summary
          const summaryResult = await SLMService.summarize(pageContent);
          if (summaryResult) setSummary(summaryResult);
          
          // Generate ad suggestions
          const adResult = await SLMService.generateAdSuggestions(pageContent, keywords);
          if (adResult) setAdSuggestions(adResult);
          
          // Generate prompt suggestions based on trigger
          const promptResult = await SLMService.generatePromptSuggestions(pageContent, triggerTerm || 'this topic');
          if (promptResult) setPromptSuggestions(promptResult);
        } catch (e) {
          console.error('[DynamicPopup] SLM generation failed:', e);
          setError('AI analysis unavailable');
        }
      } else {
        // Fallback content when SLM is not available
        setSummary("This article explores key insights about the topic, providing evidence-based information and practical takeaways for readers.");
        setAdSuggestions([
          "Health & Wellness Products",
          "Natural Supplements",
          "Lifestyle Accessories"
        ]);
        setPromptSuggestions([
          `What are the benefits of ${triggerTerm || 'this topic'}?`,
          "How can I incorporate this into my routine?",
          "Are there any side effects to consider?",
          "What do experts recommend?"
        ]);
      }
      
      setLoading(false);
    };
    
    generateContent();
  }, [isOpen, slmInitialized, pageContent, keywords, triggerTerm]);

  // Handle chat send
  const handleSend = async () => {
    if (!message.trim()) return;
    
    const userMessage = message.trim();
    setChatHistory(prev => [...prev, { role: 'user', content: userMessage }]);
    setMessage('');
    setIsTyping(true);
    
    let response;
    if (slmInitialized) {
      response = await SLMService.chat(userMessage, { keywords, triggerTerm });
    }
    
    // Fallback response if SLM fails
    if (!response) {
      response = `Great question about ${triggerTerm || 'this topic'}! Based on the article, there are several important considerations. The key is to approach this with balanced information and consult relevant experts for personalized advice.`;
    }
    
    setChatHistory(prev => [...prev, { role: 'assistant', content: response }]);
    setIsTyping(false);
  };

  // Handle prompt suggestion click
  const handlePromptClick = (prompt) => {
    setMessage(prompt);
    handleSend();
  };

  // Auto-scroll chat
  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [chatHistory]);

  if (!isOpen) return null;

  // Trigger-specific header
  const getTriggerHeader = () => {
    switch (trigger) {
      case 'hyperlink':
        return `Explore: ${triggerTerm}`;
      case 'chatbot':
        return 'Neural Oracle Assistant';
      case 'sticky_ad':
        return 'Discover Relevant Products';
      default:
        return 'Contextual Insights';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={onClose}
      data-testid="dynamic-popup-overlay"
    >
      <motion.div
        initial={{ y: '100%', opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: '100%', opacity: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="w-full sm:max-w-4xl bg-[#0A0A0A] rounded-t-3xl sm:rounded-2xl border-t sm:border border-white/10 max-h-[90vh] overflow-hidden"
        onClick={e => e.stopPropagation()}
        data-testid="dynamic-popup"
      >
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-white/5 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/5 text-zinc-400 hover:text-white hover:bg-white/10 transition-all"
            data-testid="popup-close-btn"
          >
            <X size={20} />
          </button>
          
          <div className="flex items-center gap-3 mb-2">
            {slmAvailable && (
              <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[10px] font-mono flex items-center gap-1">
                <Cpu size={10} />
                SLM Active
              </span>
            )}
            {!slmAvailable && (
              <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 text-[10px] font-mono flex items-center gap-1">
                <AlertTriangle size={10} />
                SLM Unavailable
              </span>
            )}
          </div>
          
          <h2 className="text-xl sm:text-2xl font-bold text-white font-['Space_Grotesk'] pr-10">
            {getTriggerHeader()}
          </h2>
          
          {/* AI Summary */}
          {loading ? (
            <div className="flex items-center gap-2 mt-2 text-zinc-500 text-sm">
              <Loader2 size={14} className="animate-spin" />
              <span>Analyzing content...</span>
            </div>
          ) : summary && (
            <p className="text-zinc-400 text-sm mt-2 leading-relaxed">{summary}</p>
          )}
        </div>

        {/* Scrollable Content */}
        <div ref={chatRef} className="overflow-y-auto max-h-[60vh] p-4 sm:p-6 space-y-6">
          {/* Dynamic Prompt Suggestions */}
          {promptSuggestions.length > 0 && (
            <div>
              <h3 className="text-cyan-400 text-sm font-medium mb-3 flex items-center gap-2">
                <Sparkles size={14} />
                Suggested Questions
              </h3>
              <div className="flex flex-wrap gap-2">
                {promptSuggestions.map((prompt, i) => (
                  <motion.button
                    key={i}
                    onClick={() => handlePromptClick(prompt)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-zinc-300 text-sm hover:border-cyan-500/30 hover:text-white transition-all flex items-center gap-2"
                    data-testid={`prompt-suggestion-${i}`}
                  >
                    {prompt}
                    <ChevronRight size={14} className="text-zinc-600" />
                  </motion.button>
                ))}
              </div>
            </div>
          )}

          {/* Ad Suggestions from SLM */}
          {adSuggestions.length > 0 && (
            <div>
              <h3 className="text-white font-medium mb-3 text-sm">AI-Recommended Categories</h3>
              <div className="flex flex-wrap gap-2">
                {adSuggestions.map((suggestion, i) => (
                  <span
                    key={i}
                    className="px-3 py-1.5 rounded-full bg-gradient-to-r from-violet-500/10 to-purple-500/10 border border-violet-500/20 text-violet-300 text-xs"
                  >
                    {suggestion}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Curated Content */}
          {curatedContent.length > 0 && (
            <div>
              <h3 className="text-cyan-400 text-sm font-medium mb-3 flex items-center gap-2">
                <Sparkles size={14} />
                Curated for you
              </h3>
              <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 scrollbar-hide">
                {curatedContent.map((item, i) => (
                  <CuratedCard key={i} item={item} onClick={() => {}} />
                ))}
              </div>
            </div>
          )}

          {/* Recommended Products */}
          {products.length > 0 && (
            <div>
              <h3 className="text-white font-medium mb-3">Recommended Products</h3>
              <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 scrollbar-hide">
                {products.map((product, i) => (
                  <ProductCard key={i} product={product} />
                ))}
              </div>
            </div>
          )}

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
            {slmAvailable && <span className="text-zinc-600 text-xs">(Powered by Gemini Nano)</span>}
          </div>
          <div className="relative">
            <input
              type="text"
              value={message}
              onChange={e => setMessage(e.target.value)}
              onKeyPress={e => e.key === 'Enter' && handleSend()}
              placeholder="Ask about this content..."
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 pr-28 text-white placeholder-zinc-600 focus:outline-none focus:border-cyan-500/50 text-sm"
              data-testid="popup-chat-input"
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
              <button className="p-2 text-zinc-500 hover:text-white transition-colors" data-testid="popup-attach-btn">
                <Paperclip size={16} />
              </button>
              <button className="p-2 text-zinc-500 hover:text-white transition-colors" data-testid="popup-mic-btn">
                <Mic size={16} />
              </button>
              <button 
                onClick={handleSend} 
                className="p-2 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-lg text-white hover:opacity-90 transition-all"
                data-testid="popup-send-btn"
              >
                <Send size={14} />
              </button>
            </div>
          </div>
          <button 
            className="w-full mt-3 py-2.5 rounded-xl border border-cyan-500/30 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 text-cyan-400 text-sm font-medium flex items-center justify-center gap-2 hover:from-cyan-500/20 hover:to-blue-500/20 transition-all"
            data-testid="popup-upgrade-btn"
          >
            <Sparkles size={14} />
            Upgrade to AI Pro
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default DynamicPopup;

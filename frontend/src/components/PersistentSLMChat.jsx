/**
 * PersistentSLMChat.jsx - Browser-Based SLM Chatbot
 * Persists across all pages, privacy-first (no external data)
 * Uses Chrome's Prompt API (Gemini Nano) when available
 */
import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MessageSquare, X, Send, Cpu, Sparkles, 
  Loader2, AlertCircle, ChevronDown, Minimize2
} from 'lucide-react';

// Check SLM availability
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

// Extract page context
const extractPageContext = () => {
  const title = document.title || '';
  const metaDescription = document.querySelector('meta[name="description"]')?.content || '';
  const h1 = document.querySelector('h1')?.textContent || '';
  const h2s = Array.from(document.querySelectorAll('h2')).slice(0, 3).map(h => h.textContent).join(', ');
  const pathname = window.location.pathname;
  
  // Get visible text content (limited)
  const mainContent = document.querySelector('main')?.textContent?.slice(0, 1500) || 
                      document.body.textContent?.slice(0, 1500) || '';
  
  return {
    title,
    description: metaDescription,
    heading: h1,
    subheadings: h2s,
    path: pathname,
    content: mainContent.replace(/\s+/g, ' ').trim()
  };
};

// SLM Service
const SLMService = {
  session: null,
  
  async initialize(pageContext) {
    if (!window.ai?.languageModel) return false;
    try {
      this.session = await window.ai.languageModel.create({
        systemPrompt: `You are a helpful AI assistant for AdsGupta, an AI-native advertising platform. 
You are embedded on the page: "${pageContext.title}"
Page description: "${pageContext.description}"
Main heading: "${pageContext.heading}"

Your role:
1. Answer questions about this page's content and AdsGupta's services
2. Help users navigate the platform
3. Explain AI advertising concepts
4. Keep responses concise (2-3 sentences max)
5. Be friendly and professional

Current page context: ${pageContext.content.slice(0, 500)}`
      });
      return true;
    } catch (e) {
      console.error('[SLM] Failed to create session:', e);
      return false;
    }
  },
  
  async chat(message) {
    if (!this.session) return null;
    try {
      return await this.session.prompt(message);
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

// Fallback responses when SLM is unavailable
const getFallbackResponse = (message, pageContext) => {
  const lowerMsg = message.toLowerCase();
  
  if (lowerMsg.includes('amazon') || lowerMsg.includes('audit')) {
    return "Our Amazon Audit tool analyzes your seller performance with 20+ AI agents. Visit demoai.adsgupta.com to try it for free!";
  }
  if (lowerMsg.includes('talentos') || lowerMsg.includes('career') || lowerMsg.includes('interview')) {
    return "TalentOS is our AI career acceleration platform. It helps with resume analysis, mock interviews, and job matching.";
  }
  if (lowerMsg.includes('monetiz') || lowerMsg.includes('ad')) {
    return "Monetization AI is our native advertising engine with contextual intelligence. It uses browser-based SLM for privacy-first ad targeting.";
  }
  if (lowerMsg.includes('what') && lowerMsg.includes('adsgupta')) {
    return "AdsGupta is an AI-native advertising platform that predicts consumer desire. We offer marketplace optimization, monetization tools, and career AI.";
  }
  if (lowerMsg.includes('help') || lowerMsg.includes('how')) {
    return `You're currently on ${pageContext.heading || pageContext.title}. I can help you understand this page's content or navigate to other AdsGupta tools.`;
  }
  
  return "I'm here to help with AdsGupta's AI advertising platform. You can ask about our marketplace tools, monetization features, or TalentOS career AI!";
};

// Quick prompts based on page
const getQuickPrompts = (path) => {
  if (path.includes('audit') || path.includes('amazon')) {
    return ['How does the audit work?', 'What metrics are analyzed?', 'Is my data secure?'];
  }
  if (path.includes('talentos')) {
    return ['How does interview AI work?', 'Can I upload my resume?', 'What jobs can I find?'];
  }
  if (path.includes('monetization')) {
    return ['What is native advertising?', 'How does SLM targeting work?', 'Is it privacy-safe?'];
  }
  return ['What is AdsGupta?', 'Show me the tools', 'How can AI help my ads?'];
};

const PersistentSLMChat = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [slmAvailable, setSLMAvailable] = useState(false);
  const [slmInitialized, setSLMInitialized] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [pageContext, setPageContext] = useState({});
  const chatRef = useRef(null);
  const inputRef = useRef(null);

  // Initialize SLM and extract page context
  useEffect(() => {
    const init = async () => {
      const context = extractPageContext();
      setPageContext(context);
      
      const available = await checkSLMAvailability();
      setSLMAvailable(available);
      
      if (available) {
        const initialized = await SLMService.initialize(context);
        setSLMInitialized(initialized);
      }
    };
    
    init();
    
    // Re-initialize on route change
    const handleRouteChange = () => {
      const context = extractPageContext();
      setPageContext(context);
      if (slmAvailable) {
        SLMService.destroy();
        SLMService.initialize(context).then(setSLMInitialized);
      }
    };
    
    window.addEventListener('popstate', handleRouteChange);
    
    return () => {
      window.removeEventListener('popstate', handleRouteChange);
      SLMService.destroy();
    };
  }, []);

  // Auto-scroll chat
  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [messages]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen && !isMinimized && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen, isMinimized]);

  // Send message
  const handleSend = useCallback(async () => {
    if (!input.trim()) return;
    
    const userMessage = input.trim();
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setInput('');
    setIsTyping(true);
    
    let response;
    if (slmInitialized) {
      response = await SLMService.chat(userMessage);
    }
    
    if (!response) {
      response = getFallbackResponse(userMessage, pageContext);
    }
    
    // Simulate typing delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    setMessages(prev => [...prev, { role: 'assistant', content: response }]);
    setIsTyping(false);
  }, [input, slmInitialized, pageContext]);

  // Handle quick prompt click
  const handleQuickPrompt = (prompt) => {
    setInput(prompt);
    setTimeout(() => handleSend(), 100);
  };

  const quickPrompts = getQuickPrompts(pageContext.path || '');

  return (
    <>
      {/* Chat Toggle Button - Positioned to avoid overlap with sticky ad */}
      <motion.button
        onClick={() => { setIsOpen(true); setIsMinimized(false); }}
        className={`fixed z-50 group ${isOpen ? 'hidden' : 'block'}`}
        style={{ bottom: '80px', right: '24px' }} // Above sticky ad
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        data-testid="slm-chat-toggle"
      >
        <div className="relative">
          <div className="absolute inset-0 rounded-full bg-cyan-500/30 animate-ping" />
          <div className="relative w-14 h-14 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/25">
            <MessageSquare size={24} className="text-white" />
          </div>
          {/* AI Badge */}
          <div className="absolute -top-1 -right-1 px-1.5 py-0.5 rounded-full bg-emerald-500 text-[9px] font-bold text-white border-2 border-[#121212]">
            AI
          </div>
          {/* SLM Status */}
          <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-[#121212] ${slmAvailable ? 'bg-emerald-400' : 'bg-amber-400'}`} />
        </div>
        
        {/* Tooltip */}
        <div className="absolute right-full mr-3 top-1/2 -translate-y-1/2 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="px-3 py-2 rounded-lg bg-[#0A0A0A] border border-white/10 text-white text-sm shadow-lg">
            <div className="flex items-center gap-2">
              <Cpu size={12} className="text-cyan-400" />
              <span>Neural Assistant</span>
            </div>
            <div className="text-[10px] text-zinc-500 mt-0.5">
              {slmAvailable ? 'SLM Active (Privacy Mode)' : 'Fallback Mode'}
            </div>
          </div>
        </div>
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed z-50 w-[360px] max-w-[calc(100vw-32px)]"
            style={{ bottom: '80px', right: '24px' }} // Above sticky ad
            data-testid="slm-chat-window"
          >
            <div className={`bg-[#0A0A0A] rounded-2xl border border-white/10 shadow-2xl shadow-black/50 overflow-hidden transition-all ${isMinimized ? 'h-14' : 'h-[500px]'}`}>
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border-b border-white/5">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
                    <Cpu size={16} className="text-white" />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold text-sm">Neural Assistant</h3>
                    <div className="flex items-center gap-1.5">
                      <div className={`w-1.5 h-1.5 rounded-full ${slmAvailable ? 'bg-emerald-400' : 'bg-amber-400'}`} />
                      <span className="text-[10px] text-zinc-500">
                        {slmAvailable ? 'SLM Active' : 'Fallback Mode'}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setIsMinimized(!isMinimized)}
                    className="p-1.5 rounded-lg hover:bg-white/5 text-zinc-400 hover:text-white transition-colors"
                  >
                    {isMinimized ? <ChevronDown size={16} /> : <Minimize2 size={16} />}
                  </button>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-1.5 rounded-lg hover:bg-white/5 text-zinc-400 hover:text-white transition-colors"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>

              {/* Chat Content */}
              {!isMinimized && (
                <>
                  {/* Messages */}
                  <div ref={chatRef} className="flex-1 overflow-y-auto p-4 space-y-3 h-[360px]">
                    {messages.length === 0 && (
                      <div className="text-center py-6">
                        <Sparkles size={32} className="text-cyan-400 mx-auto mb-3" />
                        <p className="text-zinc-400 text-sm mb-4">
                          Ask me about this page or AdsGupta's tools
                        </p>
                        <div className="flex flex-wrap gap-2 justify-center">
                          {quickPrompts.map((prompt, i) => (
                            <button
                              key={i}
                              onClick={() => handleQuickPrompt(prompt)}
                              className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-zinc-300 text-xs hover:bg-white/10 transition-colors"
                            >
                              {prompt}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {messages.map((msg, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`max-w-[85%] px-3 py-2 rounded-xl text-sm ${
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
                        <div className="bg-white/5 border border-white/10 px-3 py-2 rounded-xl rounded-bl-md">
                          <div className="flex gap-1">
                            {[0, 1, 2].map(i => (
                              <div key={i} className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: `${i * 150}ms` }} />
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Input */}
                  <div className="p-3 border-t border-white/5">
                    <div className="relative">
                      <input
                        ref={inputRef}
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                        placeholder="Ask about this page..."
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 pr-12 text-white placeholder-zinc-500 text-sm focus:outline-none focus:border-cyan-500/50"
                        data-testid="slm-chat-input"
                      />
                      <button
                        onClick={handleSend}
                        disabled={!input.trim() || isTyping}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                        data-testid="slm-chat-send"
                      >
                        {isTyping ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                      </button>
                    </div>
                    
                    {/* Privacy Notice */}
                    <p className="text-[10px] text-zinc-600 mt-2 text-center">
                      {slmAvailable ? '🔒 Processed locally via browser SLM' : '⚠️ Using fallback responses'}
                    </p>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default PersistentSLMChat;

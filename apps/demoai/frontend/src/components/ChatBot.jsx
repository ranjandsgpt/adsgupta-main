import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Sparkles, Bot, BarChart3, TrendingUp, Target, Cpu } from 'lucide-react';

export const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'bot',
      text: 'Neural Oracle Online. I can architect your strategy across Supply, Demand, and Marketplace Intelligence. How shall we begin?',
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const quickActions = [
    { label: 'Marketplace Audit', icon: BarChart3, color: 'text-emerald-400' },
    { label: 'Supply Yield Optimization', icon: TrendingUp, color: 'text-violet-400' },
    { label: 'Demand Intelligence', icon: Target, color: 'text-cyan-400' },
  ];

  const handleSend = (text = inputValue) => {
    if (!text.trim()) return;
    
    setMessages((prev) => [
      ...prev,
      { id: Date.now(), type: 'user', text: text },
    ]);
    setInputValue('');
    setIsTyping(true);
    
    setTimeout(() => {
      setIsTyping(false);
      let response = '';
      
      if (text.toLowerCase().includes('marketplace') || text.toLowerCase().includes('audit')) {
        response = 'Initiating Marketplace Audit Protocol. I can analyze your presence across Amazon, Walmart, Target, Blinkit, Swiggy, and Zomato. Our AI-SEO engine optimizes listings while automated bidding maximizes ROAS. Shall I run a diagnostic on your Seller Central account?';
      } else if (text.toLowerCase().includes('supply') || text.toLowerCase().includes('yield')) {
        response = 'Neural Supply Protocol engaged. I specialize in next-gen monetization across Web, App, CTV, OTT, and LLM-crawler traffic. Our CoMP (Content Monetization Protocol) enables you to monetize AI bot traffic. Would you like to explore audience-first yield architecture?';
      } else if (text.toLowerCase().includes('demand') || text.toLowerCase().includes('intelligence')) {
        response = 'Universal Demand Engine online. As an AI-native alternative to Google Marketing Platform, I offer custom bidders, Reseller DSP access, and Agent-to-Agent (A2A) protocols. Cross-publisher frequency optimization is also available. What\'s your primary demand objective?';
      } else {
        response = 'The Neural Oracle processes across three dimensions: (1) Marketplace Intel for e-commerce dominance, (2) Supply Protocol for publisher monetization, (3) Demand Engine for programmatic buying. Which dimension shall we explore?';
      }
      
      setMessages((prev) => [
        ...prev,
        { id: Date.now() + 1, type: 'bot', text: response },
      ]);
    }, 1500);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleQuickAction = (action) => {
    handleSend(action.label);
  };

  return (
    <>
      {/* Floating Chat Button - Neural Oracle */}
      <motion.button
        data-testid="chat-button"
        data-hoverable="true"
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-24 md:bottom-8 right-6 z-50 w-16 h-16 rounded-2xl flex items-center justify-center
          bg-[#0A0A0A]/95 backdrop-blur-xl border border-cyan-500/30
          shadow-[0_0_40px_rgba(0,240,255,0.2),inset_0_0_20px_rgba(0,240,255,0.05)]
          hover:shadow-[0_0_60px_rgba(0,240,255,0.35)] hover:border-cyan-400/50
          transition-all duration-500 ${isOpen ? 'hidden' : ''}`}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 1, type: 'spring' }}
      >
        <Cpu size={26} className="text-cyan-400" strokeWidth={1.5} />
        {/* Cyan Pulse Rings */}
        <span className="absolute inset-0 rounded-2xl border border-cyan-400/40 animate-ping opacity-75" />
        <span className="absolute inset-[-4px] rounded-2xl border border-cyan-400/20 animate-pulse" />
        <span className="absolute -top-1 -right-1 w-4 h-4 bg-cyan-400 rounded-full shadow-[0_0_10px_rgba(0,240,255,0.8)]">
          <span className="absolute inset-0 bg-cyan-400 rounded-full animate-ping opacity-50" />
        </span>
      </motion.button>

      {/* Chat Interface - Neural Oracle */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            data-testid="chat-interface"
            className="fixed bottom-24 md:bottom-8 right-6 z-50 w-[420px] max-w-[calc(100vw-3rem)] h-[580px] max-h-[80vh]
              rounded-2xl overflow-hidden flex flex-col
              bg-[#0A0A0A]/98 backdrop-blur-2xl border border-cyan-500/20
              shadow-[0_0_100px_rgba(0,240,255,0.12),inset_0_1px_0_rgba(255,255,255,0.05)]"
            initial={{ scale: 0.8, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          >
            {/* Header */}
            <div className="relative flex items-center justify-between px-5 py-4 border-b border-cyan-500/20 bg-gradient-to-r from-cyan-500/10 via-transparent to-violet-500/10">
              {/* Animated background line */}
              <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent" />
              
              <div className="flex items-center gap-3">
                <div className="relative w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500/20 to-violet-500/20 border border-cyan-500/30 flex items-center justify-center">
                  <Cpu size={24} className="text-cyan-400" strokeWidth={1.5} />
                  <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-cyan-400 rounded-full border-2 border-[#0A0A0A] shadow-[0_0_8px_rgba(0,240,255,0.8)]" />
                </div>
                <div>
                  <h3 className="text-white font-semibold text-sm font-['Space_Grotesk'] tracking-tight flex items-center gap-2">
                    THE NEURAL ORACLE
                    <span className="px-1.5 py-0.5 text-[9px] rounded bg-cyan-500/20 text-cyan-400 font-bold tracking-wider">AI</span>
                  </h3>
                  <p className="text-cyan-400/80 text-xs font-medium">Strategic Intelligence System • Online</p>
                </div>
              </div>
              <button
                data-testid="chat-close-button"
                data-hoverable="true"
                onClick={() => setIsOpen(false)}
                className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-white/10 hover:border-cyan-500/30 transition-all"
              >
                <X size={18} strokeWidth={1.5} />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4 scrollbar-thin">
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] px-4 py-3 rounded-2xl text-sm leading-relaxed
                      ${message.type === 'user'
                        ? 'bg-cyan-500/15 text-white rounded-br-md border border-cyan-500/20'
                        : 'bg-white/5 text-zinc-300 rounded-bl-md border border-white/5'
                      }`}
                  >
                    {message.text}
                  </div>
                </motion.div>
              ))}
              
              {/* Typing Indicator */}
              {isTyping && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex justify-start"
                >
                  <div className="bg-white/5 border border-white/5 rounded-2xl rounded-bl-md px-4 py-3">
                    <div className="flex gap-1.5">
                      <span className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Quick Actions */}
            {messages.length <= 2 && (
              <div className="px-4 pb-3">
                <p className="text-zinc-500 text-xs mb-2 font-medium uppercase tracking-wider">Quick Protocols</p>
                <div className="flex flex-wrap gap-2">
                  {quickActions.map((action, index) => (
                    <motion.button
                      key={index}
                      data-testid={`quick-action-${index}`}
                      onClick={() => handleQuickAction(action)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-zinc-300 hover:text-white hover:bg-white/10 hover:border-cyan-500/30 transition-all`}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <action.icon size={14} className={action.color} />
                      {action.label}
                    </motion.button>
                  ))}
                </div>
              </div>
            )}

            {/* Input */}
            <div className="p-4 border-t border-white/10 bg-gradient-to-t from-white/[0.02] to-transparent">
              <div className="flex items-center gap-3">
                <input
                  type="text"
                  data-testid="chat-input"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Query the Oracle..."
                  className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white text-sm
                    placeholder-zinc-500 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20
                    transition-all duration-300"
                />
                <motion.button
                  data-testid="chat-send-button"
                  data-hoverable="true"
                  onClick={() => handleSend()}
                  className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-cyan-600 flex items-center justify-center text-black
                    hover:from-cyan-400 hover:to-cyan-500 transition-all duration-300 shadow-[0_0_25px_rgba(0,240,255,0.3)]"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Send size={18} strokeWidth={2} />
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ChatBot;

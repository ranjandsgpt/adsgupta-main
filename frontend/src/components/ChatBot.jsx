import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, Sparkles, Bot, ShoppingCart, Users, Zap } from 'lucide-react';

export const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'bot',
      text: 'Welcome to the Command Center. I can help you with retail media strategies, lead qualification, or navigating our ad-tech suite.',
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const quickActions = [
    { label: 'Retail Media Strategies', icon: ShoppingCart },
    { label: 'Lead Qualification', icon: Users },
    { label: 'Ad-Tech Suite Demo', icon: Zap },
  ];

  const handleSend = (text = inputValue) => {
    if (!text.trim()) return;
    
    setMessages((prev) => [
      ...prev,
      { id: Date.now(), type: 'user', text: text },
    ]);
    setInputValue('');
    setIsTyping(true);
    
    // Simulate AI Sales & Support Agent response
    setTimeout(() => {
      setIsTyping(false);
      let response = '';
      
      if (text.toLowerCase().includes('retail') || text.toLowerCase().includes('media')) {
        response = 'Our retail media solutions include Predictive Bidding with AI-driven dayparting, Inventory-Synchronized Ads that auto-pause for low-stock items, and Full-Funnel Display for both Amazon and Walmart. Would you like a personalized demo?';
      } else if (text.toLowerCase().includes('lead') || text.toLowerCase().includes('qualification')) {
        response = 'I can help qualify your needs. Are you a Publisher looking to maximize yield, an Advertiser seeking programmatic RTB solutions, or a Brand exploring influencer marketing? Tell me more about your goals.';
      } else if (text.toLowerCase().includes('demo') || text.toLowerCase().includes('suite')) {
        response = 'Excellent! Our AI Sandbox offers hands-on experience with neural targeting and predictive creative. Visit demoai.adsgupta.com or I can connect you with our partnerships team for an enterprise walkthrough.';
      } else {
        response = 'Thanks for your inquiry! As your AI Sales & Support Agent, I can assist with: (1) Retail media strategy for Amazon/Walmart sellers, (2) Programmatic advertising solutions, or (3) Publisher yield optimization. What interests you most?';
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
      {/* Floating Chat Button with Cyan Pulse */}
      <motion.button
        data-testid="chat-button"
        data-hoverable="true"
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-24 md:bottom-8 right-6 z-50 w-16 h-16 rounded-full flex items-center justify-center
          bg-[#121212]/90 backdrop-blur-xl border border-cyan-500/40
          shadow-[0_0_30px_rgba(0,240,255,0.25)] hover:shadow-[0_0_50px_rgba(0,240,255,0.4)]
          transition-shadow duration-300 ${isOpen ? 'hidden' : ''}`}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 1, type: 'spring' }}
      >
        <Bot size={26} className="text-cyan-400" strokeWidth={1.5} />
        {/* Cyan Pulse Animation */}
        <span className="absolute inset-0 rounded-full border-2 border-cyan-400/50 animate-ping" />
        <span className="absolute -top-1 -right-1 w-4 h-4 bg-cyan-400 rounded-full flex items-center justify-center">
          <span className="w-2 h-2 bg-white rounded-full" />
        </span>
      </motion.button>

      {/* Chat Interface */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            data-testid="chat-interface"
            className="fixed bottom-24 md:bottom-8 right-6 z-50 w-[400px] max-w-[calc(100vw-3rem)] h-[550px] max-h-[75vh]
              rounded-2xl overflow-hidden flex flex-col
              bg-[#0A0A0A]/95 backdrop-blur-2xl border border-cyan-500/20
              shadow-[0_0_80px_rgba(0,240,255,0.15),inset_0_1px_0_rgba(255,255,255,0.05)]"
            initial={{ scale: 0.8, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 bg-gradient-to-r from-cyan-500/10 to-transparent">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center relative">
                  <Sparkles size={22} className="text-cyan-400" strokeWidth={1.5} />
                  <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 rounded-full border-2 border-[#0A0A0A]" />
                </div>
                <div>
                  <h3 className="text-white font-semibold text-sm font-['Space_Grotesk'] tracking-tight">
                    Ads Gupta AI
                  </h3>
                  <p className="text-cyan-400 text-xs font-medium">Neural Assistant • Online</p>
                </div>
              </div>
              <button
                data-testid="chat-close-button"
                data-hoverable="true"
                onClick={() => setIsOpen(false)}
                className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
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
                        ? 'bg-cyan-500/20 text-white rounded-br-md border border-cyan-500/20'
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
                    <div className="flex gap-1">
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
              <div className="px-4 pb-2">
                <p className="text-zinc-500 text-xs mb-2 font-medium">Quick Actions</p>
                <div className="flex flex-wrap gap-2">
                  {quickActions.map((action, index) => (
                    <motion.button
                      key={index}
                      data-testid={`quick-action-${index}`}
                      onClick={() => handleQuickAction(action)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs text-zinc-300 hover:text-white hover:bg-white/10 hover:border-cyan-500/30 transition-all"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <action.icon size={12} />
                      {action.label}
                    </motion.button>
                  ))}
                </div>
              </div>
            )}

            {/* Input */}
            <div className="p-4 border-t border-white/10 bg-white/[0.02]">
              <div className="flex items-center gap-3">
                <input
                  type="text"
                  data-testid="chat-input"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask about retail media, ads, or partnerships..."
                  className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm
                    placeholder-zinc-500 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20
                    transition-all duration-300"
                />
                <motion.button
                  data-testid="chat-send-button"
                  data-hoverable="true"
                  onClick={() => handleSend()}
                  className="w-11 h-11 rounded-xl bg-cyan-500 flex items-center justify-center text-black
                    hover:bg-cyan-400 transition-colors duration-300 shadow-[0_0_20px_rgba(0,240,255,0.3)]"
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

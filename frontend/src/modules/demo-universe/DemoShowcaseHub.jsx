/**
 * DemoAI Showcase Hub
 * Multi-Product Protocol Gallery with Terminal Transition
 * Industrial Luxury Tech Aesthetic
 * Route: / (on demoai.adsgupta.com)
 */
import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import {
  Cpu, ShoppingCart, Bot, MessageSquare, Video, Zap, Network, 
  Sparkles, ArrowRight, ExternalLink, ChevronRight, Terminal,
  Activity, Play, Pause, LayoutGrid, Clock, Mail
} from 'lucide-react';

// Scanline Effect Component
const ScanlineEffect = () => (
  <div className="absolute inset-0 pointer-events-none overflow-hidden">
    <div 
      className="absolute inset-0 opacity-[0.03]"
      style={{
        backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0, 255, 255, 0.1) 2px, rgba(0, 255, 255, 0.1) 4px)',
        animation: 'scanlines 0.1s linear infinite'
      }}
    />
    <style>{`
      @keyframes scanlines {
        0% { transform: translateY(0); }
        100% { transform: translateY(4px); }
      }
    `}</style>
  </div>
);

// Enhanced Terminal Transition Overlay with Scanline + Typewriter Effect
const TerminalOverlay = ({ isVisible, protocolName, protocolType, onComplete }) => {
  const [displayedLines, setDisplayedLines] = useState([]);
  const [currentLineText, setCurrentLineText] = useState('');
  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const terminalRef = useRef(null);
  
  const getTerminalLines = useCallback(() => {
    const baseLines = [
      '> INITIALIZING AD-OS KERNEL v3.2.1...',
      '> LOADING NEURAL WEIGHTS (Gemini 3 Flash)...',
      '> AUTHENTICATING PROTOCOL ACCESS...',
      '> SYNCING MARKETPLACE CONTEXT...'
    ];
    
    if (protocolType === 'placeholder') {
      return [
        ...baseLines,
        '> PROTOCOL STATUS: STAGING...',
        `> REDIRECTING TO ${protocolName.toUpperCase()} PREVIEW...`
      ];
    }
    
    return [
      ...baseLines,
      '> SECURE HANDSHAKE ESTABLISHED...',
      `> ACCESS GRANTED. LAUNCHING ${protocolName.toUpperCase()}...`
    ];
  }, [protocolName, protocolType]);
  
  const terminalLines = getTerminalLines();
  
  useEffect(() => {
    if (!isVisible) {
      setDisplayedLines([]);
      setCurrentLineText('');
      setCurrentLineIndex(0);
      setCharIndex(0);
      return;
    }
    
    // Typewriter effect - type each character
    if (currentLineIndex < terminalLines.length) {
      const currentFullLine = terminalLines[currentLineIndex];
      
      if (charIndex < currentFullLine.length) {
        const typeTimer = setTimeout(() => {
          setCurrentLineText(prev => prev + currentFullLine[charIndex]);
          setCharIndex(prev => prev + 1);
        }, 15 + Math.random() * 25); // Variable typing speed for realism
        
        return () => clearTimeout(typeTimer);
      } else {
        // Line complete, move to next
        const nextLineTimer = setTimeout(() => {
          setDisplayedLines(prev => [...prev, currentFullLine]);
          setCurrentLineText('');
          setCharIndex(0);
          setCurrentLineIndex(prev => prev + 1);
        }, 100);
        
        return () => clearTimeout(nextLineTimer);
      }
    } else {
      // All lines complete, trigger navigation
      const completeTimer = setTimeout(onComplete, 400);
      return () => clearTimeout(completeTimer);
    }
  }, [isVisible, currentLineIndex, charIndex, terminalLines, onComplete]);
  
  if (!isVisible) return null;
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.15 }}
      className="fixed inset-0 bg-black z-[100] flex items-center justify-center"
    >
      {/* Scanline overlay */}
      <ScanlineEffect />
      
      {/* CRT flicker effect */}
      <motion.div
        className="absolute inset-0 bg-cyan-500/5"
        animate={{ opacity: [0.02, 0.05, 0.02] }}
        transition={{ duration: 0.1, repeat: Infinity }}
      />
      
      <div className="max-w-2xl w-full mx-6 relative">
        {/* Terminal Window */}
        <motion.div 
          initial={{ scale: 0.95, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="rounded-xl border border-cyan-500/40 bg-[#030303] overflow-hidden shadow-[0_0_80px_rgba(0,255,255,0.15)]"
        >
          {/* Terminal Header */}
          <div className="px-4 py-2.5 border-b border-cyan-500/20 flex items-center gap-2 bg-[#050505]">
            <div className="w-3 h-3 rounded-full bg-red-500/80" />
            <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
            <div className="w-3 h-3 rounded-full bg-green-500/80" />
            <span className="ml-4 text-cyan-500/70 text-xs font-mono tracking-wider">AD-OS TERMINAL v3.2.1</span>
            <div className="ml-auto flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
              <span className="text-cyan-400/60 text-xs font-mono">SECURE</span>
            </div>
          </div>
          
          {/* Terminal Content */}
          <div ref={terminalRef} className="p-6 font-mono text-sm h-72 overflow-hidden bg-gradient-to-b from-[#030303] to-[#000000]">
            {displayedLines.map((line, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className={`mb-1.5 ${
                  line.includes('ACCESS GRANTED') || line.includes('LAUNCHING')
                    ? 'text-emerald-400 font-bold' 
                    : line.includes('ERROR') 
                      ? 'text-red-400' 
                      : line.includes('STAGING') || line.includes('PREVIEW')
                        ? 'text-amber-400'
                        : 'text-cyan-400/90'
                }`}
              >
                {line}
              </motion.div>
            ))}
            
            {/* Currently typing line */}
            {currentLineIndex < terminalLines.length && (
              <div className={`mb-1.5 ${
                currentLineText.includes('ACCESS GRANTED') 
                  ? 'text-emerald-400' 
                  : 'text-cyan-400/90'
              }`}>
                {currentLineText}
                <motion.span 
                  className="inline-block w-2.5 h-4 bg-cyan-400 ml-0.5"
                  animate={{ opacity: [1, 0] }}
                  transition={{ duration: 0.5, repeat: Infinity }}
                />
              </div>
            )}
          </div>
          
          {/* Progress bar */}
          <div className="h-1 bg-[#050505]">
            <motion.div
              className="h-full bg-gradient-to-r from-cyan-500 to-emerald-500"
              initial={{ width: '0%' }}
              animate={{ width: `${((currentLineIndex + 1) / terminalLines.length) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

// Waitlist Modal for Staging Protocols
const WaitlistModal = ({ isOpen, onClose, protocolName }) => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;
    
    try {
      const API_URL = process.env.REACT_APP_BACKEND_URL;
      await fetch(`${API_URL}/api/leads/capture`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email, 
          source: protocolName.toLowerCase().replace(/\s+/g, '_')
        })
      });
      setSubmitted(true);
      setTimeout(() => {
        onClose();
        setSubmitted(false);
        setEmail('');
      }, 2000);
    } catch (err) {
      console.error('Lead capture error:', err);
    }
  };
  
  if (!isOpen) return null;
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[90] flex items-center justify-center p-6"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md rounded-2xl border border-cyan-500/20 bg-[#050505] p-6 shadow-[0_0_60px_rgba(0,255,255,0.1)]"
      >
        <div className="text-center mb-6">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-purple-500/20 border border-cyan-500/30 flex items-center justify-center">
            <Clock size={28} className="text-cyan-400" />
          </div>
          <h3 className="text-xl font-bold text-white font-['Space_Grotesk'] mb-2">
            {protocolName}
          </h3>
          <p className="text-zinc-400 text-sm">
            This protocol is currently in staging. Join the waitlist for early access.
          </p>
        </div>
        
        {submitted ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-4"
          >
            <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-emerald-500/20 flex items-center justify-center">
              <Sparkles size={24} className="text-emerald-400" />
            </div>
            <p className="text-emerald-400 font-medium">You're on the list!</p>
          </motion.div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="w-full pl-12 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-zinc-500 focus:outline-none focus:border-cyan-500/50 transition-colors"
                data-testid="waitlist-email-input"
              />
            </div>
            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-medium hover:from-cyan-400 hover:to-blue-500 transition-all"
              data-testid="waitlist-submit-btn"
            >
              Join Waitlist
            </button>
          </form>
        )}
        
        <button
          onClick={onClose}
          className="w-full mt-4 py-2 text-zinc-500 hover:text-white text-sm transition-colors"
        >
          Close
        </button>
      </motion.div>
    </motion.div>
  );
};

// Protocol Card Component with Magnetic Hover + Glassmorphism
const ProtocolCard = ({ 
  icon: Icon, 
  title, 
  description, 
  status, 
  gradient, 
  link, 
  isExternal,
  placeholderType,
  hasDemo,
  onNavigate,
  size = 'normal',
  index = 0
}) => {
  const cardRef = useRef(null);
  const [isHovered, setIsHovered] = useState(false);
  
  // Mouse position for magnetic effect
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  
  // Spring physics for smooth magnetic tilt
  const springConfig = { damping: 25, stiffness: 300 };
  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [8, -8]), springConfig);
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-8, 8]), springConfig);
  
  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const normalizedX = (e.clientX - centerX) / rect.width;
    const normalizedY = (e.clientY - centerY) / rect.height;
    mouseX.set(normalizedX);
    mouseY.set(normalizedY);
  };
  
  const handleMouseLeave = () => {
    setIsHovered(false);
    mouseX.set(0);
    mouseY.set(0);
  };
  
  const handleClick = () => {
    if (onNavigate) {
      onNavigate(title, link, isExternal, placeholderType);
    }
  };
  
  const statusConfig = {
    active: { color: 'bg-emerald-400', label: 'ACTIVE', textColor: 'text-emerald-400', borderColor: 'border-emerald-500/30' },
    preview: { color: 'bg-cyan-400', label: 'PREVIEW', textColor: 'text-cyan-400', borderColor: 'border-cyan-500/30' },
    coming: { color: 'bg-amber-400', label: 'COMING SOON', textColor: 'text-amber-400', borderColor: 'border-amber-500/30' },
    staging: { color: 'bg-purple-400', label: 'STAGING', textColor: 'text-purple-400', borderColor: 'border-purple-500/30' }
  };
  
  const currentStatus = statusConfig[status] || statusConfig.coming;
  const isPlaceholder = !!placeholderType;

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1, duration: 0.5, ease: 'easeOut' }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
      style={{ 
        rotateX: isHovered ? rotateX : 0, 
        rotateY: isHovered ? rotateY : 0,
        transformStyle: 'preserve-3d',
        perspective: 1000
      }}
      className={`relative group cursor-pointer ${
        size === 'large' ? 'md:col-span-2 md:row-span-2' : ''
      } ${size === 'wide' ? 'md:col-span-2' : ''}`}
      data-testid={`protocol-card-${title.toLowerCase().replace(/\s+/g, '-')}`}
    >
      {/* Cyan outer glow on hover */}
      <motion.div 
        className="absolute -inset-1 rounded-3xl opacity-0 transition-opacity duration-500"
        animate={{ opacity: isHovered ? 1 : 0 }}
        style={{
          background: 'linear-gradient(135deg, rgba(0,255,255,0.4), rgba(0,150,255,0.2))',
          filter: 'blur(24px)'
        }}
      />
      
      {/* Glassmorphism Card */}
      <motion.div 
        className="relative h-full"
        animate={{ scale: isHovered ? 1.02 : 1 }}
        transition={{ duration: 0.3 }}
      >
        {/* Card background - Industrial Luxury Tech */}
        <div 
          className={`relative h-full rounded-2xl overflow-hidden transition-all duration-500 ${
            isHovered ? 'border-cyan-500/50' : 'border-white/[0.08]'
          } border`}
          style={{
            background: 'rgba(255, 255, 255, 0.03)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)'
          }}
        >
          {/* Gradient accent overlay */}
          <div className={`absolute top-0 right-0 w-48 h-48 ${gradient} rounded-full blur-[80px] opacity-20 group-hover:opacity-40 transition-opacity duration-500`} />
          
          {/* Inner content */}
          <div className="relative z-10 h-full flex flex-col p-6">
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <motion.div 
                className={`w-14 h-14 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-lg`}
                whileHover={{ rotate: [0, -5, 5, 0] }}
                transition={{ duration: 0.5 }}
              >
                <Icon size={28} className="text-white" />
              </motion.div>
              
              <div className={`flex items-center gap-2 px-2.5 py-1 rounded-lg ${currentStatus.borderColor} border bg-black/40`}>
                <motion.div 
                  className={`w-1.5 h-1.5 rounded-full ${currentStatus.color}`}
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
                <span className={`text-[10px] font-mono font-medium ${currentStatus.textColor} tracking-wider`}>
                  {currentStatus.label}
                </span>
              </div>
            </div>
            
            {/* Content */}
            <h3 className="text-xl font-bold text-white font-['Space_Grotesk'] mb-2 tracking-tight">
              {title}
            </h3>
            <p className="text-zinc-400 text-sm leading-relaxed flex-1">
              {description}
            </p>
            
            {/* Action Footer */}
            <div className="mt-4 pt-4 border-t border-white/[0.05]">
              <motion.div 
                className={`flex items-center gap-2 text-sm font-medium transition-colors duration-300 ${
                  isHovered ? 'text-cyan-400' : 'text-zinc-500'
                }`}
                animate={{ x: isHovered ? 4 : 0 }}
              >
                {isPlaceholder ? (
                  <>
                    <Clock size={16} />
                    <span>{placeholderType === 'waitlist' ? 'Join Waitlist' : placeholderType === 'video' ? 'Preview Demo' : 'Coming Soon'}</span>
                  </>
                ) : hasDemo ? (
                  <>
                    <Play size={16} />
                    <span>Launch Demo</span>
                  </>
                ) : (
                  <>
                    <span>Initialize Protocol</span>
                    {isExternal ? <ExternalLink size={14} /> : <ArrowRight size={16} />}
                  </>
                )}
              </motion.div>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

// System Status Indicator - Enhanced
const SystemStatus = () => {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex items-center gap-2.5 px-4 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 backdrop-blur-sm"
    >
      <motion.div 
        className="w-2 h-2 rounded-full bg-emerald-400"
        animate={{ 
          scale: [1, 1.3, 1],
          boxShadow: ['0 0 0 0 rgba(52, 211, 153, 0.4)', '0 0 0 8px rgba(52, 211, 153, 0)', '0 0 0 0 rgba(52, 211, 153, 0.4)']
        }}
        transition={{ duration: 2, repeat: Infinity }}
      />
      <span className="text-emerald-400 text-xs font-mono tracking-wider">SYSTEM STATUS: ONLINE</span>
    </motion.div>
  );
};

// Global Sidebar - Retractable
const GlobalSidebar = ({ isOpen, onToggle }) => {
  return (
    <>
      {/* Backdrop on mobile */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onToggle}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
          />
        )}
      </AnimatePresence>
      
      <motion.aside
        initial={false}
        animate={{ x: isOpen ? 0 : -240 }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="fixed left-0 top-0 bottom-0 w-60 bg-[#030303]/95 backdrop-blur-xl border-r border-white/[0.06] z-50"
      >
        <div className="p-5">
          <div className="flex items-center justify-between mb-8">
            <Link to="/" className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
                <Cpu size={18} className="text-white" />
              </div>
              <div>
                <span className="text-white font-bold font-['Space_Grotesk'] text-lg">DemoAI</span>
                <span className="text-zinc-600 text-[10px] block font-mono">by AdsGupta</span>
              </div>
            </Link>
          </div>
          
          <nav className="space-y-1">
            <Link to="/" className="flex items-center gap-3 px-4 py-3 rounded-xl text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 transition-all">
              <LayoutGrid size={18} />
              <span className="text-sm font-medium">Showcase Hub</span>
            </Link>
            <Link to="/amazon-audit" className="flex items-center gap-3 px-4 py-3 rounded-xl text-zinc-400 hover:text-white hover:bg-white/5 transition-all">
              <ShoppingCart size={18} />
              <span className="text-sm">Amazon Audit</span>
            </Link>
            <Link to="/monetization" className="flex items-center gap-3 px-4 py-3 rounded-xl text-zinc-400 hover:text-white hover:bg-white/5 transition-all">
              <Zap size={18} />
              <span className="text-sm">Monetization</span>
            </Link>
          </nav>
          
          {/* Version info */}
          <div className="absolute bottom-6 left-5 right-5">
            <div className="px-4 py-3 rounded-xl bg-white/[0.02] border border-white/[0.05]">
              <p className="text-zinc-600 text-[10px] font-mono">AD-OS PROTOCOL v3.2.1</p>
              <p className="text-zinc-700 text-[10px] font-mono mt-1">Build: 2026.01.15</p>
            </div>
          </div>
        </div>
        
        {/* Toggle button */}
        <button
          onClick={onToggle}
          className="absolute -right-4 top-1/2 -translate-y-1/2 w-8 h-14 bg-[#050505] border border-white/[0.08] rounded-r-xl flex items-center justify-center hover:bg-white/5 transition-all group"
          data-testid="sidebar-toggle"
        >
          <ChevronRight size={16} className={`text-zinc-500 group-hover:text-cyan-400 transition-all ${isOpen ? 'rotate-180' : ''}`} />
        </button>
      </motion.aside>
    </>
  );
};

// Main Showcase Hub Component
const DemoShowcaseHub = () => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [terminalVisible, setTerminalVisible] = useState(false);
  const [targetProtocol, setTargetProtocol] = useState({ name: '', link: '', isExternal: false, type: 'working' });
  const [waitlistModal, setWaitlistModal] = useState({ isOpen: false, protocolName: '' });
  
  // Protocol definitions - Per user's specifications
  const protocols = [
    {
      icon: ShoppingCart,
      title: 'Marketplace Optimizer',
      description: 'AI-powered Amazon audit engine with 20 optimization agents. Instant analysis of Search Term Reports, Business Reports, and campaign performance.',
      status: 'active',
      gradient: 'from-orange-500 to-amber-600',
      link: '/amazon-audit',
      isExternal: false,
      hasDemo: true,
      size: 'large'
    },
    {
      icon: Zap,
      title: 'Native Widget / Monetization',
      description: 'Real-time ad insertion visualization and AI-powered LLM content monetization protocols.',
      status: 'active',
      gradient: 'from-violet-500 to-purple-600',
      link: '/monetization',
      isExternal: false,
      hasDemo: true
    },
    {
      icon: Bot,
      title: 'TalentOS',
      description: 'AI Interview Coach with Web Speech API. Resume gap analysis, STAR method scoring, and recursive mock interviews.',
      status: 'preview',
      gradient: 'from-cyan-500 to-blue-600',
      link: 'https://talentos.adsgupta.com',
      isExternal: true,
      hasDemo: true,
      size: 'large'
    },
    {
      icon: MessageSquare,
      title: 'Neural Oracle (Chat)',
      description: 'Enterprise conversational AI with node-based flow visualization. Haptik-style automation for support and sales.',
      status: 'staging',
      gradient: 'from-emerald-500 to-teal-600',
      link: '#',
      isExternal: false,
      placeholderType: 'waitlist'
    },
    {
      icon: Video,
      title: 'Influencer AI Video',
      description: 'Generate AI-powered video personas from a single headshot. Elevator pitch in 30 seconds with SadTalker/LivePortrait.',
      status: 'staging',
      gradient: 'from-pink-500 to-rose-600',
      link: '#',
      isExternal: false,
      placeholderType: 'video'
    },
    {
      icon: Network,
      title: 'Walmart / Quick Commerce',
      description: 'Walmart Seller Center optimization + Blinkit, Swiggy, Zomato hyperlocal targeting protocols. Dark store visibility.',
      status: 'coming',
      gradient: 'from-blue-500 to-indigo-600',
      link: '#',
      isExternal: false,
      placeholderType: 'coming',
      size: 'wide'
    }
  ];
  
  const handleNavigate = (name, link, isExternal, placeholderType) => {
    // Handle placeholder protocols
    if (placeholderType === 'waitlist') {
      setTargetProtocol({ name, link, isExternal, type: 'placeholder' });
      setTerminalVisible(true);
      return;
    }
    
    if (placeholderType === 'video') {
      setTargetProtocol({ name, link, isExternal, type: 'placeholder' });
      setTerminalVisible(true);
      return;
    }
    
    if (placeholderType === 'coming') {
      setTargetProtocol({ name, link, isExternal, type: 'placeholder' });
      setTerminalVisible(true);
      return;
    }
    
    // Working protocols go through terminal
    setTargetProtocol({ name, link, isExternal, type: 'working' });
    setTerminalVisible(true);
  };
  
  const handleTransitionComplete = () => {
    setTerminalVisible(false);
    
    // Handle placeholder protocols after terminal
    if (targetProtocol.type === 'placeholder') {
      setWaitlistModal({ isOpen: true, protocolName: targetProtocol.name });
      return;
    }
    
    // Navigate to working protocols
    if (targetProtocol.isExternal) {
      window.open(targetProtocol.link, '_blank');
    } else {
      navigate(targetProtocol.link);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white" data-testid="demo-showcase-hub">
      {/* Deepest Black Canvas with subtle effects */}
      <div className="fixed inset-0 bg-black pointer-events-none">
        {/* Radial gradient ambient light */}
        <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-cyan-500/[0.02] rounded-full blur-[150px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-purple-500/[0.02] rounded-full blur-[150px]" />
      </div>
      
      {/* Subtle Grid Pattern */}
      <div className="fixed inset-0 bg-[linear-gradient(to_right,#80808003_1px,transparent_1px),linear-gradient(to_bottom,#80808003_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none" />
      
      {/* Sidebar */}
      <GlobalSidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
      
      {/* Terminal Transition */}
      <AnimatePresence>
        {terminalVisible && (
          <TerminalOverlay 
            isVisible={terminalVisible}
            protocolName={targetProtocol.name}
            protocolType={targetProtocol.type}
            onComplete={handleTransitionComplete}
          />
        )}
      </AnimatePresence>
      
      {/* Waitlist Modal */}
      <AnimatePresence>
        <WaitlistModal
          isOpen={waitlistModal.isOpen}
          onClose={() => setWaitlistModal({ isOpen: false, protocolName: '' })}
          protocolName={waitlistModal.protocolName}
        />
      </AnimatePresence>
      
      {/* Main Content */}
      <main className={`relative transition-all duration-300 ${sidebarOpen ? 'ml-60' : ''}`}>
        {/* Header */}
        <header className="sticky top-0 z-40 border-b border-white/[0.04] backdrop-blur-xl bg-black/70">
          <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2.5 rounded-xl hover:bg-white/5 text-zinc-400 hover:text-cyan-400 transition-all"
                data-testid="menu-toggle"
              >
                <LayoutGrid size={20} />
              </button>
              
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
                  <Cpu size={20} className="text-white" />
                </div>
                <div>
                  <span className="text-xl font-bold font-['Space_Grotesk'] text-white tracking-tight">DemoAI</span>
                  <span className="text-[10px] text-zinc-600 block font-mono">by AdsGupta</span>
                </div>
              </div>
            </div>
            
            <SystemStatus />
          </div>
        </header>
        
        {/* Hero Section */}
        <section className="relative pt-20 pb-16 px-6">
          <div className="max-w-7xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full bg-white/[0.03] border border-white/[0.08] mb-8"
            >
              <Terminal size={14} className="text-cyan-400" />
              <span className="text-zinc-400 text-sm font-mono tracking-wide">AD-OS PROTOCOL GATEWAY v3.2</span>
            </motion.div>
            
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-4xl sm:text-5xl lg:text-6xl font-bold font-['Space_Grotesk'] tracking-tight mb-6"
            >
              <span className="text-white">Protocol </span>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400">
                Showcase Hub
              </span>
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-zinc-500 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed"
            >
              Interactive demonstrations of AdsGupta's AI-powered marketing protocols. 
              Select a module to initialize secure access.
            </motion.p>
          </div>
        </section>
        
        {/* Bento Grid - Non-uniform 3x3 */}
        <section className="relative px-6 pb-24">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 auto-rows-fr">
              {protocols.map((protocol, index) => (
                <ProtocolCard
                  key={index}
                  index={index}
                  {...protocol}
                  onNavigate={handleNavigate}
                />
              ))}
            </div>
          </div>
        </section>
        
        {/* Footer */}
        <footer className="relative border-t border-white/[0.04] py-8 px-6 bg-black/50">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
                <Cpu size={14} className="text-white" />
              </div>
              <span className="text-zinc-600 text-sm font-mono">DemoAI by AdsGupta © 2026</span>
            </div>
            
            <a 
              href="https://adsgupta.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-zinc-500 hover:text-cyan-400 text-sm flex items-center gap-1.5 transition-colors"
            >
              Visit AdsGupta <ExternalLink size={12} />
            </a>
          </div>
        </footer>
      </main>
    </div>
  );
};

export default DemoShowcaseHub;

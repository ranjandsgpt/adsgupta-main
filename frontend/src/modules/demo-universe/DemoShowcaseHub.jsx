/**
 * DemoAI Showcase Hub
 * Multi-Product Protocol Gallery with Terminal Transition
 * Route: / (on demoai.adsgupta.com)
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import {
  Cpu, ShoppingCart, Bot, MessageSquare, Video, Zap, Network, 
  Sparkles, ArrowRight, ExternalLink, ChevronRight, Terminal,
  Activity, Play, Pause, LayoutGrid
} from 'lucide-react';

// Terminal Transition Overlay
const TerminalOverlay = ({ isVisible, protocolName, onComplete }) => {
  const [lines, setLines] = useState([]);
  const terminalRef = useRef(null);
  
  const terminalLines = [
    '> INITIALIZING AD-OS KERNEL...',
    '> LOADING NEURAL WEIGHTS (Gemini 3 Flash)...',
    '> SYNCING MARKETPLACE CONTEXT...',
    '> VALIDATING PROTOCOL INTEGRITY...',
    '> ESTABLISHING SECURE CONNECTION...',
    `> ACCESS GRANTED. REDIRECTING TO ${protocolName.toUpperCase()}...`
  ];
  
  useEffect(() => {
    if (!isVisible) {
      setLines([]);
      return;
    }
    
    let index = 0;
    const interval = setInterval(() => {
      if (index < terminalLines.length) {
        setLines(prev => [...prev, terminalLines[index]]);
        index++;
      } else {
        clearInterval(interval);
        setTimeout(onComplete, 500);
      }
    }, 300);
    
    return () => clearInterval(interval);
  }, [isVisible, onComplete, protocolName]);
  
  if (!isVisible) return null;
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black z-[100] flex items-center justify-center"
    >
      <div className="max-w-2xl w-full mx-6">
        {/* Terminal Window */}
        <div className="rounded-xl border border-cyan-500/30 bg-[#0a0a0a] overflow-hidden shadow-[0_0_50px_rgba(0,255,255,0.1)]">
          {/* Terminal Header */}
          <div className="px-4 py-2 border-b border-white/10 flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <div className="w-3 h-3 rounded-full bg-yellow-500" />
            <div className="w-3 h-3 rounded-full bg-green-500" />
            <span className="ml-4 text-zinc-500 text-xs font-mono">AD-OS TERMINAL v2.0.26</span>
          </div>
          
          {/* Terminal Content */}
          <div ref={terminalRef} className="p-6 font-mono text-sm h-64 overflow-hidden">
            {lines.map((line, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.2 }}
                className={`mb-2 ${
                  line.includes('ACCESS GRANTED') 
                    ? 'text-emerald-400' 
                    : line.includes('ERROR') 
                      ? 'text-red-400' 
                      : 'text-cyan-400'
                }`}
              >
                {line}
              </motion.div>
            ))}
            
            {/* Blinking cursor */}
            {lines.length < terminalLines.length && (
              <span className="inline-block w-2 h-4 bg-cyan-400 animate-pulse" />
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// Protocol Card Component with Glassmorphism
const ProtocolCard = ({ 
  icon: Icon, 
  title, 
  description, 
  status, 
  gradient, 
  link, 
  isExternal,
  isComingSoon,
  hasDemo,
  onNavigate,
  size = 'normal'
}) => {
  const [isHovered, setIsHovered] = useState(false);
  
  const handleClick = () => {
    if (isComingSoon) return;
    if (onNavigate) {
      onNavigate(title, link, isExternal);
    }
  };
  
  const statusConfig = {
    active: { color: 'bg-emerald-400', label: 'ACTIVE', textColor: 'text-emerald-400' },
    preview: { color: 'bg-cyan-400', label: 'PREVIEW', textColor: 'text-cyan-400' },
    coming: { color: 'bg-amber-400', label: 'COMING', textColor: 'text-amber-400' },
    staging: { color: 'bg-purple-400', label: 'STAGING', textColor: 'text-purple-400' }
  };
  
  const currentStatus = statusConfig[status] || statusConfig.coming;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleClick}
      className={`relative group cursor-pointer ${
        size === 'large' ? 'md:col-span-2 md:row-span-2' : ''
      } ${size === 'wide' ? 'md:col-span-2' : ''}`}
    >
      {/* Glassmorphism Card */}
      <div className={`relative h-full rounded-2xl overflow-hidden transition-all duration-500 ${
        isHovered ? 'scale-[1.02]' : ''
      }`}>
        {/* Border glow effect */}
        <div className={`absolute inset-0 rounded-2xl transition-opacity duration-500 ${
          isHovered ? 'opacity-100' : 'opacity-0'
        }`} style={{
          background: 'linear-gradient(135deg, rgba(0,255,255,0.3), rgba(0,100,255,0.3))',
          filter: 'blur(20px)'
        }} />
        
        {/* Card background */}
        <div className="relative h-full rounded-2xl border border-white/10 bg-black/60 backdrop-blur-xl p-6 hover:border-cyan-500/50 transition-all">
          {/* Gradient overlay */}
          <div className={`absolute top-0 right-0 w-40 h-40 ${gradient} rounded-full blur-3xl opacity-20 group-hover:opacity-40 transition-opacity`} />
          
          <div className="relative z-10 h-full flex flex-col">
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center`}>
                <Icon size={28} className="text-white" />
              </div>
              
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${currentStatus.color} animate-pulse`} />
                <span className={`text-xs font-mono ${currentStatus.textColor}`}>
                  {currentStatus.label}
                </span>
              </div>
            </div>
            
            {/* Content */}
            <h3 className="text-xl font-bold text-white font-['Space_Grotesk'] mb-2">
              {title}
            </h3>
            <p className="text-zinc-400 text-sm leading-relaxed flex-1">
              {description}
            </p>
            
            {/* Action */}
            <div className="mt-4 pt-4 border-t border-white/5">
              {isComingSoon ? (
                <div className="flex items-center gap-2 text-zinc-500 text-sm">
                  <Activity size={16} />
                  <span>Protocol in Development</span>
                </div>
              ) : (
                <div className={`flex items-center gap-2 text-sm font-medium transition-colors ${
                  isHovered ? 'text-cyan-400' : 'text-zinc-400'
                }`}>
                  {hasDemo ? (
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
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// System Status Indicator
const SystemStatus = () => {
  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30">
      <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
      <span className="text-emerald-400 text-xs font-mono">SYSTEM STATUS: ONLINE</span>
    </div>
  );
};

// Global Sidebar
const GlobalSidebar = ({ isOpen, onToggle }) => {
  return (
    <motion.aside
      initial={{ x: -200 }}
      animate={{ x: isOpen ? 0 : -200 }}
      className="fixed left-0 top-0 bottom-0 w-56 bg-black/80 backdrop-blur-xl border-r border-white/5 z-50"
    >
      <div className="p-4">
        <div className="flex items-center justify-between mb-6">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
              <Cpu size={16} className="text-white" />
            </div>
            <span className="text-white font-bold font-['Space_Grotesk']">DemoAI</span>
          </Link>
        </div>
        
        <nav className="space-y-2">
          <Link to="/" className="flex items-center gap-3 px-3 py-2 rounded-lg text-cyan-400 bg-cyan-500/10">
            <LayoutGrid size={16} />
            <span className="text-sm">Showcase Hub</span>
          </Link>
          <Link to="/amazon-audit" className="flex items-center gap-3 px-3 py-2 rounded-lg text-zinc-400 hover:text-white hover:bg-white/5">
            <ShoppingCart size={16} />
            <span className="text-sm">Amazon Audit</span>
          </Link>
          <Link to="/monetization" className="flex items-center gap-3 px-3 py-2 rounded-lg text-zinc-400 hover:text-white hover:bg-white/5">
            <Zap size={16} />
            <span className="text-sm">Monetization</span>
          </Link>
        </nav>
      </div>
      
      {/* Toggle button */}
      <button
        onClick={onToggle}
        className="absolute -right-8 top-1/2 -translate-y-1/2 w-6 h-12 bg-white/5 border border-white/10 rounded-r-lg flex items-center justify-center hover:bg-white/10 transition-all"
      >
        <ChevronRight size={14} className={`text-zinc-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
    </motion.aside>
  );
};

// Main Showcase Hub Component
const DemoShowcaseHub = () => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [terminalVisible, setTerminalVisible] = useState(false);
  const [targetProtocol, setTargetProtocol] = useState({ name: '', link: '', isExternal: false });
  
  // Protocol definitions
  const protocols = [
    {
      icon: ShoppingCart,
      title: 'Marketplace Optimizer',
      description: 'AI-powered Amazon audit engine with 20 optimization agents. Instant analysis of Search Term Reports, Business Reports, and more.',
      status: 'active',
      gradient: 'from-orange-500 to-amber-600',
      link: '/amazon-audit',
      isExternal: false,
      hasDemo: true,
      size: 'large'
    },
    {
      icon: Zap,
      title: 'Native Widget & LLM Monetization',
      description: 'Real-time ad insertion visualization and AI-powered content monetization protocols.',
      status: 'active',
      gradient: 'from-violet-500 to-purple-600',
      link: '/monetization',
      isExternal: false,
      hasDemo: true
    },
    {
      icon: Bot,
      title: 'TalentOS Preview',
      description: 'AI Interview Coach with Web Speech API. Resume gap analysis, STAR method scoring, and mock interviews.',
      status: 'preview',
      gradient: 'from-cyan-500 to-blue-600',
      link: 'https://talentos.adsgupta.com',
      isExternal: true,
      hasDemo: true
    },
    {
      icon: MessageSquare,
      title: 'Neural Oracle',
      description: 'Enterprise conversational AI with node-based flow visualization. Haptik-style automation.',
      status: 'staging',
      gradient: 'from-emerald-500 to-teal-600',
      link: '#',
      isExternal: false,
      isComingSoon: true
    },
    {
      icon: Video,
      title: 'Influencer AI Video',
      description: 'Generate AI-powered video personas from a single headshot. Elevator pitch in 30 seconds.',
      status: 'staging',
      gradient: 'from-pink-500 to-rose-600',
      link: '#',
      isExternal: false,
      isComingSoon: true
    },
    {
      icon: Sparkles,
      title: 'Prompt Exchange',
      description: 'Marketplace for AI prompts optimized for ad-tech workflows. Buy, sell, and share.',
      status: 'coming',
      gradient: 'from-yellow-500 to-orange-600',
      link: '#',
      isExternal: false,
      isComingSoon: true
    },
    {
      icon: Network,
      title: 'Quick Commerce Logic',
      description: 'Blinkit, Swiggy, Zomato optimization protocols. Dark store visibility and hyperlocal targeting.',
      status: 'coming',
      gradient: 'from-red-500 to-pink-600',
      link: '#',
      isExternal: false,
      isComingSoon: true,
      size: 'wide'
    }
  ];
  
  const handleNavigate = (name, link, isExternal) => {
    setTargetProtocol({ name, link, isExternal });
    setTerminalVisible(true);
  };
  
  const handleTransitionComplete = () => {
    setTerminalVisible(false);
    if (targetProtocol.isExternal) {
      window.open(targetProtocol.link, '_blank');
    } else {
      navigate(targetProtocol.link);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-gradient-radial from-cyan-500/5 to-transparent rounded-full" />
      </div>
      
      {/* Grid Pattern */}
      <div className="fixed inset-0 bg-[linear-gradient(to_right,#80808005_1px,transparent_1px),linear-gradient(to_bottom,#80808005_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none" />
      
      {/* Sidebar */}
      <GlobalSidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
      
      {/* Terminal Transition */}
      <AnimatePresence>
        {terminalVisible && (
          <TerminalOverlay 
            isVisible={terminalVisible}
            protocolName={targetProtocol.name}
            onComplete={handleTransitionComplete}
          />
        )}
      </AnimatePresence>
      
      {/* Main Content */}
      <main className={`relative transition-all ${sidebarOpen ? 'ml-56' : ''}`}>
        {/* Header */}
        <header className="sticky top-0 z-40 border-b border-white/5 backdrop-blur-xl bg-black/50">
          <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 rounded-lg hover:bg-white/5 text-zinc-400 hover:text-white transition-all"
              >
                <LayoutGrid size={20} />
              </button>
              
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
                  <Cpu size={20} className="text-white" />
                </div>
                <div>
                  <span className="text-xl font-bold font-['Space_Grotesk'] text-white">DemoAI</span>
                  <span className="text-xs text-zinc-500 block">by AdsGupta</span>
                </div>
              </div>
            </div>
            
            <SystemStatus />
          </div>
        </header>
        
        {/* Hero Section */}
        <section className="relative pt-16 pb-12 px-6">
          <div className="max-w-7xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-6"
            >
              <Terminal size={14} className="text-cyan-400" />
              <span className="text-zinc-400 text-sm font-mono">AD-OS PROTOCOL GATEWAY v2.0</span>
            </motion.div>
            
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-4xl md:text-6xl font-bold font-['Space_Grotesk'] tracking-tight mb-4"
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
              className="text-zinc-400 text-lg max-w-2xl mx-auto"
            >
              Interactive demonstrations of AdsGupta's AI-powered marketing protocols. 
              Select a module to initialize.
            </motion.p>
          </div>
        </section>
        
        {/* Bento Grid */}
        <section className="relative px-6 pb-24">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {protocols.map((protocol, index) => (
                <ProtocolCard
                  key={index}
                  {...protocol}
                  onNavigate={handleNavigate}
                />
              ))}
            </div>
          </div>
        </section>
        
        {/* Footer */}
        <footer className="relative border-t border-white/5 py-8 px-6">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
                <Cpu size={14} className="text-white" />
              </div>
              <span className="text-zinc-500 text-sm">DemoAI by AdsGupta © 2026</span>
            </div>
            
            <a 
              href="https://adsgupta.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-zinc-500 hover:text-white text-sm flex items-center gap-1 transition-colors"
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

/**
 * Monetization Demo Page
 * Native Widget & LLM Monetization Visualization
 * Route: /monetization (on demoai.adsgupta.com)
 */
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import {
  Cpu, Zap, DollarSign, TrendingUp, Layers, Code, Play, Pause,
  RefreshCw, ChevronRight, LayoutGrid, Activity, Eye, MousePointer,
  ArrowRight, Bot, ChevronLeft
} from 'lucide-react';

// Mock ad content data
const mockAdUnits = [
  { id: 1, type: 'banner', size: '728x90', cpm: 4.50, fillRate: 92, viewability: 78 },
  { id: 2, type: 'native', size: 'in-feed', cpm: 8.20, fillRate: 88, viewability: 85 },
  { id: 3, type: 'video', size: '16:9', cpm: 15.00, fillRate: 75, viewability: 90 },
  { id: 4, type: 'interstitial', size: 'fullscreen', cpm: 22.50, fillRate: 60, viewability: 95 }
];

// Back to Hub Link
const BackToHub = () => (
  <Link
    to="/"
    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-zinc-400 hover:text-white hover:border-cyan-500/30 transition-all text-sm"
  >
    <ChevronLeft size={16} />
    Back to Showcase Hub
  </Link>
);

// Real-time Ad Insertion Visualization
const AdInsertionVisualizer = () => {
  const [activeSlot, setActiveSlot] = useState(0);
  const [isRunning, setIsRunning] = useState(true);
  
  useEffect(() => {
    if (!isRunning) return;
    
    const interval = setInterval(() => {
      setActiveSlot(prev => (prev + 1) % 4);
    }, 2000);
    
    return () => clearInterval(interval);
  }, [isRunning]);
  
  const slots = [
    { position: 'Header', type: 'Banner 728x90' },
    { position: 'In-Feed', type: 'Native Widget' },
    { position: 'Sidebar', type: 'Display 300x250' },
    { position: 'Footer', type: 'Sticky Banner' }
  ];
  
  return (
    <div className="rounded-2xl border border-white/5 bg-[#0A0A0A] p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-white font-['Space_Grotesk']">
          Real-time Ad Insertion
        </h3>
        <button
          onClick={() => setIsRunning(!isRunning)}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
            isRunning 
              ? 'bg-emerald-500/20 text-emerald-400' 
              : 'bg-white/10 text-zinc-400'
          }`}
        >
          {isRunning ? <Pause size={14} /> : <Play size={14} />}
          {isRunning ? 'Running' : 'Paused'}
        </button>
      </div>
      
      {/* Webpage Mockup */}
      <div className="relative rounded-xl border border-white/10 bg-black/50 p-4 overflow-hidden">
        {/* Browser chrome */}
        <div className="absolute top-0 left-0 right-0 h-8 bg-white/5 border-b border-white/10 flex items-center px-3 gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-red-500/50" />
          <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/50" />
          <div className="w-2.5 h-2.5 rounded-full bg-green-500/50" />
          <div className="ml-3 flex-1 h-4 rounded bg-white/10" />
        </div>
        
        <div className="pt-8 space-y-3">
          {slots.map((slot, index) => (
            <motion.div
              key={index}
              animate={{
                borderColor: activeSlot === index ? 'rgba(0, 255, 255, 0.5)' : 'rgba(255,255,255,0.1)',
                backgroundColor: activeSlot === index ? 'rgba(0, 255, 255, 0.05)' : 'transparent'
              }}
              className="relative rounded-lg border p-3 transition-all"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    activeSlot === index ? 'bg-cyan-500/20 text-cyan-400' : 'bg-white/5 text-zinc-500'
                  }`}>
                    <Layers size={16} />
                  </div>
                  <div>
                    <p className="text-white text-sm font-medium">{slot.position}</p>
                    <p className="text-zinc-500 text-xs">{slot.type}</p>
                  </div>
                </div>
                
                {activeSlot === index && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="flex items-center gap-2 px-2 py-1 rounded bg-cyan-500/20"
                  >
                    <Activity size={12} className="text-cyan-400" />
                    <span className="text-cyan-400 text-xs font-mono">INSERTING</span>
                  </motion.div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

// LLM Content Monetization
const LLMMonetization = () => {
  const [activeStep, setActiveStep] = useState(0);
  
  const steps = [
    { label: 'Content Analysis', desc: 'AI scans page context' },
    { label: 'Intent Mapping', desc: 'Match user intent to ads' },
    { label: 'Bid Optimization', desc: 'Real-time floor pricing' },
    { label: 'Ad Injection', desc: 'Native placement' }
  ];
  
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStep(prev => (prev + 1) % steps.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);
  
  return (
    <div className="rounded-2xl border border-white/5 bg-[#0A0A0A] p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-violet-500/20 flex items-center justify-center">
          <Bot size={20} className="text-violet-400" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-white font-['Space_Grotesk']">
            LLM-Powered Monetization
          </h3>
          <p className="text-zinc-500 text-sm">AI-driven contextual ad placement</p>
        </div>
      </div>
      
      {/* Pipeline visualization */}
      <div className="relative">
        <div className="absolute top-6 left-6 right-6 h-0.5 bg-white/5">
          <motion.div
            className="h-full bg-gradient-to-r from-violet-500 to-cyan-500"
            animate={{ width: `${((activeStep + 1) / steps.length) * 100}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
        
        <div className="grid grid-cols-4 gap-4">
          {steps.map((step, index) => (
            <div key={index} className="relative">
              <div className={`relative z-10 w-12 h-12 mx-auto rounded-xl flex items-center justify-center transition-all ${
                index <= activeStep
                  ? 'bg-violet-500/20 border border-violet-500/50'
                  : 'bg-white/5 border border-white/10'
              }`}>
                <span className={`font-mono text-sm ${
                  index <= activeStep ? 'text-violet-400' : 'text-zinc-500'
                }`}>
                  {index + 1}
                </span>
              </div>
              <div className="text-center mt-3">
                <p className={`text-sm font-medium ${
                  index <= activeStep ? 'text-white' : 'text-zinc-500'
                }`}>
                  {step.label}
                </p>
                <p className="text-zinc-600 text-xs mt-1">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Output preview */}
      <div className="mt-8 p-4 rounded-xl bg-black/50 border border-white/10">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-emerald-400 text-xs font-mono">LIVE OUTPUT</span>
        </div>
        <div className="font-mono text-sm text-zinc-400">
          <p>{">"} Context: Product review page (Electronics)</p>
          <p>{">"} Intent: Purchase consideration</p>
          <p>{">"} Recommended: Native shopping widget</p>
          <p className="text-cyan-400">{">"} Predicted eCPM: $12.40</p>
        </div>
      </div>
    </div>
  );
};

// Performance Metrics
const PerformanceMetrics = () => {
  return (
    <div className="rounded-2xl border border-white/5 bg-[#0A0A0A] p-6">
      <h3 className="text-lg font-semibold text-white font-['Space_Grotesk'] mb-6">
        Live Performance Metrics
      </h3>
      
      <div className="grid grid-cols-2 gap-4">
        {mockAdUnits.map((unit) => (
          <div key={unit.id} className="p-4 rounded-xl bg-white/5 border border-white/5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-white font-medium capitalize">{unit.type}</span>
              <span className="text-zinc-500 text-xs">{unit.size}</span>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-zinc-400">CPM</span>
                <span className="text-emerald-400 font-mono">${unit.cpm.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-zinc-400">Fill Rate</span>
                <span className="text-cyan-400 font-mono">{unit.fillRate}%</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-zinc-400">Viewability</span>
                <span className="text-violet-400 font-mono">{unit.viewability}%</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Main Monetization Page
const MonetizationPage = () => {
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-violet-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl" />
      </div>
      <div className="fixed inset-0 bg-[linear-gradient(to_right,#80808005_1px,transparent_1px),linear-gradient(to_bottom,#80808005_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none" />
      
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-white/5 backdrop-blur-xl bg-black/50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
                <Cpu size={20} className="text-white" />
              </div>
              <div>
                <span className="text-xl font-bold font-['Space_Grotesk'] text-white">DemoAI</span>
                <span className="text-xs text-zinc-500 block">Monetization</span>
              </div>
            </Link>
          </div>
          
          <BackToHub />
        </div>
      </header>
      
      {/* Main Content */}
      <main className="relative pt-8 pb-24 px-6">
        <div className="max-w-7xl mx-auto">
          {/* Hero */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-violet-500/10 border border-violet-500/30 mb-4">
              <Zap size={14} className="text-violet-400" />
              <span className="text-violet-400 text-sm">Native Widget & LLM Monetization</span>
            </div>
            <h1 className="text-3xl md:text-5xl font-bold text-white font-['Space_Grotesk'] mb-4">
              AI-Powered <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-cyan-400">Revenue Engine</span>
            </h1>
            <p className="text-zinc-400 text-lg max-w-2xl mx-auto">
              Watch real-time ad insertion and LLM-driven content monetization in action.
            </p>
          </motion.div>
          
          {/* Grid Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <AdInsertionVisualizer />
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <LLMMonetization />
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="lg:col-span-2"
            >
              <PerformanceMetrics />
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default MonetizationPage;

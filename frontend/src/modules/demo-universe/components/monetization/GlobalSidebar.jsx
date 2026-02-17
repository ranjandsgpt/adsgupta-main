/**
 * GlobalSidebar.jsx - Unified Navigation Sidebar
 * Retractable sidebar for Monetization AI ecosystem
 */
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Menu, X, ChevronRight, Cpu, Zap, ShoppingCart,
  Bot, Home, ExternalLink
} from 'lucide-react';

const GlobalSidebar = ({ isOpen, onToggle, currentPath }) => {
  const navItems = [
    { icon: Home, label: 'Command Center', path: '/showcase', description: 'DemoAI Root' },
    { icon: ShoppingCart, label: 'Amazon Optimizer', path: '/amazon-audit', description: 'Marketplace Audit' },
    { icon: Zap, label: 'Native Monetization', path: '/monetization', description: 'LLM Ad Engine', active: true },
    { icon: Bot, label: 'TalentOS', path: 'https://talentos.adsgupta.com', description: 'Career AI', external: true },
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
            data-testid="sidebar-overlay"
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
        data-testid="global-sidebar"
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
                  <span className="text-white font-bold font-['Space_Grotesk'] text-lg">Monetization AI</span>
                  <span className="text-zinc-600 text-xs block">Native Ad Engine</span>
                </div>
              </Link>
              <button
                onClick={onToggle}
                className="lg:hidden p-2 rounded-lg hover:bg-white/5 text-zinc-400"
                data-testid="sidebar-close-btn"
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
                  <a key={i} href={item.path} target="_blank" rel="noopener noreferrer" data-testid={`nav-${item.label.toLowerCase().replace(/\s+/g, '-')}`}>
                    {content}
                  </a>
                );
              }
              
              if (isStaging) {
                return <div key={i} className="cursor-not-allowed opacity-60" data-testid={`nav-${item.label.toLowerCase().replace(/\s+/g, '-')}`}>{content}</div>;
              }

              return (
                <Link key={i} to={item.path} data-testid={`nav-${item.label.toLowerCase().replace(/\s+/g, '-')}`}>
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
          data-testid="sidebar-toggle-btn"
        >
          <ChevronRight size={16} className={`text-zinc-500 group-hover:text-cyan-400 transition-all ${isOpen ? 'rotate-180' : ''}`} />
        </button>
      </motion.aside>
    </>
  );
};

export default GlobalSidebar;

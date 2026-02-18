/**
 * MegaMenu.jsx - Dynamic Protocols Mega-Menu
 * Auto-populates from protocolsConfig.js
 * Hover state for "The Protocols" nav item
 */
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  ShoppingCart, Store, LineChart, Sparkles, GraduationCap, 
  DollarSign, ExternalLink, ArrowRight, Cpu, Zap
} from 'lucide-react';
import { protocolsConfig, brandNames } from '../config/protocolsConfig';

// Icon mapping
const iconMap = {
  ShoppingCart,
  Store,
  LineChart,
  Sparkles,
  GraduationCap,
  DollarSign,
};

// Color mapping for backgrounds
const bgColorMap = {
  orange: 'from-orange-500/20 to-orange-500/5',
  blue: 'from-blue-500/20 to-blue-500/5',
  violet: 'from-violet-500/20 to-violet-500/5',
  cyan: 'from-cyan-500/20 to-cyan-500/5',
  emerald: 'from-emerald-500/20 to-emerald-500/5',
  amber: 'from-amber-500/20 to-amber-500/5',
};

const textColorMap = {
  orange: 'text-orange-400',
  blue: 'text-blue-400',
  violet: 'text-violet-400',
  cyan: 'text-cyan-400',
  emerald: 'text-emerald-400',
  amber: 'text-amber-400',
};

const MegaMenu = ({ isOpen, onClose }) => {
  const liveProtocols = protocolsConfig.filter(p => p.status === 'live');
  const comingSoonProtocols = protocolsConfig.filter(p => p.status === 'coming-soon');

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40"
            onClick={onClose}
          />
          
          {/* Menu Panel */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full left-0 right-0 z-50 mt-2"
            onMouseLeave={onClose}
            data-testid="mega-menu"
          >
            <div className="max-w-[1200px] mx-auto px-6 md:px-12">
              <div className="bg-[#0A0A0A]/98 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl shadow-black/50 overflow-hidden">
                <div className="p-6 md:p-8">
                  {/* Header */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/20 to-violet-500/20 flex items-center justify-center">
                        <Cpu size={20} className="text-cyan-400" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-white font-['Space_Grotesk']">
                          {brandNames.products}
                        </h3>
                        <p className="text-xs text-zinc-500">
                          Powered by {brandNames.ecosystem}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Zap size={12} className="text-emerald-400" />
                      <span className="text-xs text-zinc-400">
                        {liveProtocols.length} Live
                      </span>
                    </div>
                  </div>

                  {/* Protocols Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {liveProtocols.map((protocol) => {
                      const Icon = iconMap[protocol.icon] || Sparkles;
                      const bgColor = bgColorMap[protocol.color] || bgColorMap.cyan;
                      const textColor = textColorMap[protocol.color] || textColorMap.cyan;

                      const content = (
                        <motion.div
                          whileHover={{ scale: 1.02, y: -2 }}
                          className={`group relative p-4 rounded-xl bg-gradient-to-br ${bgColor} border border-white/5 hover:border-white/10 transition-all cursor-pointer`}
                        >
                          <div className="flex items-start gap-3">
                            <div className={`w-10 h-10 rounded-lg bg-black/30 flex items-center justify-center ${textColor}`}>
                              <Icon size={20} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="text-white font-semibold text-sm">
                                  {protocol.name}
                                </h4>
                                {protocol.external && (
                                  <ExternalLink size={10} className="text-zinc-500" />
                                )}
                              </div>
                              <p className="text-zinc-400 text-xs line-clamp-2">
                                {protocol.description}
                              </p>
                            </div>
                            <ArrowRight size={14} className="text-zinc-600 group-hover:text-white group-hover:translate-x-1 transition-all" />
                          </div>
                          
                          {/* Status Badge */}
                          <div className="absolute top-2 right-2">
                            <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[9px] font-bold uppercase">
                              Live
                            </span>
                          </div>
                        </motion.div>
                      );

                      if (protocol.external) {
                        return (
                          <a
                            key={protocol.id}
                            href={protocol.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={onClose}
                            data-testid={`mega-menu-${protocol.id}`}
                          >
                            {content}
                          </a>
                        );
                      }

                      return (
                        <Link
                          key={protocol.id}
                          to={protocol.href}
                          onClick={onClose}
                          data-testid={`mega-menu-${protocol.id}`}
                        >
                          {content}
                        </Link>
                      );
                    })}

                    {/* Coming Soon Protocols */}
                    {comingSoonProtocols.map((protocol) => {
                      const Icon = iconMap[protocol.icon] || Sparkles;
                      
                      return (
                        <div
                          key={protocol.id}
                          className="relative p-4 rounded-xl bg-white/[0.02] border border-white/5 opacity-60"
                          data-testid={`mega-menu-${protocol.id}`}
                        >
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-lg bg-black/30 flex items-center justify-center text-zinc-500">
                              <Icon size={20} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="text-zinc-400 font-semibold text-sm mb-1">
                                {protocol.name}
                              </h4>
                              <p className="text-zinc-600 text-xs line-clamp-2">
                                {protocol.description}
                              </p>
                            </div>
                          </div>
                          
                          {/* Coming Soon Badge */}
                          <div className="absolute top-2 right-2">
                            <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 text-[9px] font-bold uppercase">
                              Soon
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Footer CTA */}
                  <div className="mt-6 pt-6 border-t border-white/5 flex items-center justify-between">
                    <p className="text-zinc-500 text-xs">
                      New protocols launching monthly. Stay tuned.
                    </p>
                    <a
                      href="https://demoai.adsgupta.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-medium hover:bg-cyan-500/20 transition-all"
                    >
                      <Sparkles size={12} />
                      Enter the Sandbox
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default MegaMenu;

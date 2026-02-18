/**
 * OmniNav.jsx - Sticky Secondary Sub-Navigation Bar
 * Dynamically pulls from protocolsConfig.js
 * Appears on all tool pages (/audit, /tools, etc.)
 */
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
import { 
  ShoppingCart, Store, LineChart, Sparkles, GraduationCap, 
  DollarSign, ChevronRight, Cpu, ExternalLink
} from 'lucide-react';
import { protocolsConfig, getLiveProtocols } from '../config/protocolsConfig';

// Icon mapping
const iconMap = {
  ShoppingCart,
  Store,
  LineChart,
  Sparkles,
  GraduationCap,
  DollarSign,
};

// Color mapping
const colorMap = {
  orange: 'text-orange-400 bg-orange-500/10 border-orange-500/30',
  blue: 'text-blue-400 bg-blue-500/10 border-blue-500/30',
  violet: 'text-violet-400 bg-violet-500/10 border-violet-500/30',
  cyan: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30',
  emerald: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
  amber: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
};

const OmniNav = ({ showOnPages = ['/audit', '/tools', '/analysis', '/multi-vault', '/neural-map', '/talentos'] }) => {
  const location = useLocation();
  const [isVisible, setIsVisible] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Check if current page should show OmniNav
  useEffect(() => {
    const shouldShow = showOnPages.some(page => location.pathname.startsWith(page));
    setIsVisible(shouldShow);
  }, [location.pathname, showOnPages]);

  // Handle scroll for sticky behavior
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 80);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (!isVisible) return null;

  const liveProtocols = getLiveProtocols();

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -50, opacity: 0 }}
        className={`fixed top-[64px] left-0 right-0 z-40 transition-all duration-300 ${
          scrolled 
            ? 'bg-[#0A0A0A]/95 backdrop-blur-xl border-b border-white/5 shadow-lg' 
            : 'bg-[#0A0A0A]/80 backdrop-blur-md border-b border-white/5'
        }`}
        data-testid="omni-nav"
      >
        <div className="max-w-[1400px] mx-auto px-4 md:px-8">
          <div className="flex items-center justify-between h-12">
            {/* Left: Neural Engine Badge */}
            <div className="hidden md:flex items-center gap-2">
              <Cpu size={14} className="text-cyan-400" />
              <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider">
                The Protocols
              </span>
              <ChevronRight size={12} className="text-zinc-600" />
            </div>

            {/* Center: Protocol Links */}
            <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide py-2 -mx-4 px-4 md:mx-0 md:px-0">
              {liveProtocols.map((protocol) => {
                const Icon = iconMap[protocol.icon] || Sparkles;
                const isActive = location.pathname.includes(protocol.id) || 
                  (protocol.href && location.pathname === protocol.href);
                const colors = colorMap[protocol.color] || colorMap.cyan;

                const content = (
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
                      isActive 
                        ? `${colors} border` 
                        : 'text-zinc-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <Icon size={14} />
                    <span>{protocol.shortName}</span>
                    {protocol.external && <ExternalLink size={10} className="opacity-50" />}
                  </motion.div>
                );

                if (protocol.external) {
                  return (
                    <a
                      key={protocol.id}
                      href={protocol.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      data-testid={`omni-nav-${protocol.id}`}
                    >
                      {content}
                    </a>
                  );
                }

                return (
                  <Link
                    key={protocol.id}
                    to={protocol.href}
                    data-testid={`omni-nav-${protocol.id}`}
                  >
                    {content}
                  </Link>
                );
              })}
            </div>

            {/* Right: Status Indicator */}
            <div className="hidden md:flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[10px] text-zinc-500 font-mono uppercase">
                {liveProtocols.length} Protocols Active
              </span>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default OmniNav;

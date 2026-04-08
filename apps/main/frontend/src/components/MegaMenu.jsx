/**
 * MegaMenu.jsx - Protocols mega-menu (grouped)
 */
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShoppingCart,
  Store,
  LineChart,
  Sparkles,
  GraduationCap,
  DollarSign,
  ExternalLink,
  ArrowRight,
  Cpu,
  Zap,
  Server,
} from 'lucide-react';
import { brandNames } from '../config/protocolsConfig';

const iconMap = {
  ShoppingCart,
  Store,
  LineChart,
  Sparkles,
  GraduationCap,
  DollarSign,
  Server,
};

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

const megaMenuGroups = [
  {
    label: 'Monetization & Infrastructure',
    items: [
      {
        id: 'ad-exchange',
        name: 'Ad Exchange',
        description:
          'Programmatic exchange with real-time bidding & yield optimization',
        href: 'https://exchange.adsgupta.com',
        external: true,
        status: 'live',
        icon: 'Server',
        color: 'cyan',
      },
      {
        id: 'monetization-ai',
        name: 'Monetization AI',
        description: 'Native ad engine with SLM intelligence',
        href: 'https://exchange.adsgupta.com',
        external: true,
        status: 'live',
        icon: 'DollarSign',
        color: 'amber',
      },
    ],
  },
  {
    label: 'Marketplace & Commerce',
    items: [
      {
        id: 'amazon-audit',
        name: 'Amazon Audit',
        description: 'AI-powered Amazon seller optimization',
        href: 'https://marketplace.adsgupta.com',
        external: true,
        status: 'live',
        icon: 'ShoppingCart',
        color: 'orange',
      },
      {
        id: 'insights-engine',
        name: 'Insights Engine',
        description: 'Neural analytics & deep reporting',
        href: 'https://marketplace.adsgupta.com',
        external: true,
        status: 'live',
        icon: 'LineChart',
        color: 'violet',
      },
      {
        id: 'walmart-audit',
        name: 'Walmart Audit',
        description: 'Walmart marketplace intelligence',
        href: null,
        external: false,
        status: 'coming-soon',
        icon: 'Store',
        color: 'blue',
      },
    ],
  },
  {
    label: 'Intelligence & Exploration',
    items: [
      {
        id: 'demoai',
        name: 'DemoAI Sandbox',
        description: 'Test drive the neural engines',
        href: 'https://demoai.adsgupta.com',
        external: true,
        status: 'live',
        icon: 'Sparkles',
        color: 'cyan',
      },
      {
        id: 'talentos',
        name: 'TalentOS',
        description: 'AI career acceleration platform',
        href: 'https://talentos.adsgupta.com',
        external: true,
        status: 'live',
        icon: 'GraduationCap',
        color: 'emerald',
      },
    ],
  },
];

const liveCount = megaMenuGroups.reduce(
  (n, g) => n + g.items.filter((i) => i.status === 'live').length,
  0
);

function ProtocolTile({ protocol, onClose }) {
  const Icon = iconMap[protocol.icon] || Sparkles;
  const bgColor = bgColorMap[protocol.color] || bgColorMap.cyan;
  const textColor = textColorMap[protocol.color] || textColorMap.cyan;
  const isSoon = protocol.status === 'coming-soon';

  if (isSoon) {
    return (
      <div
        className="relative p-4 rounded-xl bg-white/[0.02] border border-white/5 opacity-60"
        data-testid={`mega-menu-${protocol.id}`}
      >
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-black/30 flex items-center justify-center text-zinc-500">
            <Icon size={20} />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-zinc-400 font-semibold text-sm mb-1">{protocol.name}</h4>
            <p className="text-zinc-600 text-xs line-clamp-2">{protocol.description}</p>
          </div>
        </div>
        <div className="absolute top-2 right-2">
          <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 text-[9px] font-bold uppercase">
            Soon
          </span>
        </div>
      </div>
    );
  }

  const content = (
    <motion.div
      whileHover={{ scale: 1.02, y: -2 }}
      className={`group relative p-4 rounded-xl bg-gradient-to-br ${bgColor} border border-white/5 hover:border-white/10 transition-all cursor-pointer`}
    >
      <div className="flex items-start gap-3">
        <div
          className={`w-10 h-10 rounded-lg bg-black/30 flex items-center justify-center ${textColor}`}
        >
          <Icon size={20} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="text-white font-semibold text-sm">{protocol.name}</h4>
            {protocol.external && <ExternalLink size={10} className="text-zinc-500" />}
          </div>
          <p className="text-zinc-400 text-xs line-clamp-2">{protocol.description}</p>
        </div>
        <ArrowRight
          size={14}
          className="text-zinc-600 group-hover:text-white group-hover:translate-x-1 transition-all"
        />
      </div>
      <div className="absolute top-2 right-2">
        <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[9px] font-bold uppercase">
          Live
        </span>
      </div>
    </motion.div>
  );

  return (
    <a
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

const MegaMenu = ({ isOpen, onClose }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed top-[64px] left-0 right-0 bottom-0 z-[55] bg-black/60"
            onClick={onClose}
          />

          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="fixed top-[64px] left-0 right-0 z-[60] pt-2"
            onMouseLeave={onClose}
            data-testid="mega-menu"
          >
            <div className="max-w-[1200px] mx-auto px-6 md:px-12">
              <div className="bg-[#0A0A0A] backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl shadow-black/50 overflow-hidden">
                <div className="p-6 md:p-8">
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
                      <span className="text-xs text-zinc-400">{liveCount} Live</span>
                    </div>
                  </div>

                  <div className="space-y-6">
                    {megaMenuGroups.map((group) => (
                      <div key={group.label}>
                        <p className="text-[10px] font-semibold tracking-widest uppercase text-zinc-500 mb-3">
                          {group.label}
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {group.items.map((protocol) => (
                            <ProtocolTile key={protocol.id} protocol={protocol} onClose={onClose} />
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 pt-6 border-t border-white/5 flex items-center justify-between">
                    <p className="text-zinc-500 text-xs">New protocols launching monthly. Stay tuned.</p>
                    <a
                      href="https://demoai.adsgupta.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-medium hover:bg-cyan-500/20 transition-all"
                    >
                      <Sparkles size={12} />
                      Enter the Sandbox →
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

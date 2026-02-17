import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Search, Zap, Clock, Package, DollarSign, Target, AlertTriangle,
  TrendingUp, TrendingDown, BarChart3, Globe, Star, RefreshCw, Mail,
  ShoppingCart, Eye, Percent, Award, Brain, Sparkles, ChevronRight,
  FileText, CheckCircle2, Loader2, Bot
} from 'lucide-react';

// AI Agent definitions
const AI_AGENTS = [
  {
    id: 'rufus-seo',
    name: 'Rufus-SEO Check',
    description: 'Audit listings for 2026 AI discovery optimization',
    icon: Search,
    color: 'text-blue-400',
    bg: 'bg-blue-500/10',
    category: 'Listing'
  },
  {
    id: 'dayparting',
    name: 'Dayparting Pro',
    description: 'Heatmap of peak conversion hours',
    icon: Clock,
    color: 'text-violet-400',
    bg: 'bg-violet-500/10',
    category: 'PPC'
  },
  {
    id: 'inventory-sync',
    name: 'Inventory-Ad Sync',
    description: 'Pause ads for SKUs with <14 days of stock',
    icon: Package,
    color: 'text-amber-400',
    bg: 'bg-amber-500/10',
    category: 'Inventory'
  },
  {
    id: 'negative-ninja',
    name: 'Negative Ninja',
    description: 'Identify search terms with 0% conversion',
    icon: Target,
    color: 'text-red-400',
    bg: 'bg-red-500/10',
    category: 'PPC'
  },
  {
    id: 'price-elasticity',
    name: 'Price Elasticity Bot',
    description: 'Predict Buy Box win-probability at $0.10 increments',
    icon: DollarSign,
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
    category: 'Pricing'
  },
  {
    id: 'sentiment-miner',
    name: 'Sentiment Miner',
    description: 'Group review keywords into Product Improvement tasks',
    icon: Star,
    color: 'text-yellow-400',
    bg: 'bg-yellow-500/10',
    category: 'Reviews'
  },
  {
    id: 'cannibalization',
    name: 'Cannibalization Audit',
    description: 'Calculate organic sales stolen by your own ads',
    icon: AlertTriangle,
    color: 'text-orange-400',
    bg: 'bg-orange-500/10',
    category: 'PPC'
  },
  {
    id: 'refund-root',
    name: 'Refund Root-Cause',
    description: 'Identify manufacturing flaws from return codes',
    icon: RefreshCw,
    color: 'text-rose-400',
    bg: 'bg-rose-500/10',
    category: 'Operations'
  },
  {
    id: 'ltv-calculator',
    name: 'LTV Calculator',
    description: 'Predict 12-month repeat buyer value',
    icon: TrendingUp,
    color: 'text-cyan-400',
    bg: 'bg-cyan-500/10',
    category: 'Analytics'
  },
  {
    id: 'marketplace-arbitrage',
    name: 'Marketplace Arbitrage',
    description: 'Compare SKU profit on Amazon vs. Walmart',
    icon: Globe,
    color: 'text-indigo-400',
    bg: 'bg-indigo-500/10',
    category: 'Strategy'
  },
  {
    id: 'bsr-predictor',
    name: 'BSR Trend Predictor',
    description: 'Forecast ranking for the next 14 days',
    icon: BarChart3,
    color: 'text-purple-400',
    bg: 'bg-purple-500/10',
    category: 'Analytics'
  },
  {
    id: 'budget-pacing',
    name: 'Budget Pacing',
    description: 'Visual alert if ad spend exceeds budget by day 20',
    icon: Percent,
    color: 'text-pink-400',
    bg: 'bg-pink-500/10',
    category: 'PPC'
  },
  {
    id: 'dsp-funnel',
    name: 'DSP Funnel Builder',
    description: 'Auto-generate re-marketing audiences',
    icon: Eye,
    color: 'text-sky-400',
    bg: 'bg-sky-500/10',
    category: 'DSP'
  },
  {
    id: 'aplus-scorer',
    name: 'A+ Content Scorer',
    description: 'Vision AI analysis of listing images',
    icon: FileText,
    color: 'text-teal-400',
    bg: 'bg-teal-500/10',
    category: 'Listing'
  },
  {
    id: 'brand-voice',
    name: 'Brand Share of Voice',
    description: 'Real-time visibility vs. top 3 competitors',
    icon: Award,
    color: 'text-lime-400',
    bg: 'bg-lime-500/10',
    category: 'Competition'
  },
  {
    id: 'oos-penalty',
    name: 'OOS Penalty Estimator',
    description: 'Calculate revenue lost due to stockouts',
    icon: ShoppingCart,
    color: 'text-red-400',
    bg: 'bg-red-500/10',
    category: 'Inventory'
  },
  {
    id: 'climate-pledge',
    name: 'Climate Pledge Bot',
    description: 'Find SKUs eligible for Climate Pledge Friendly badges',
    icon: Globe,
    color: 'text-green-400',
    bg: 'bg-green-500/10',
    category: 'Compliance'
  },
  {
    id: 'emailer-api',
    name: 'Emailer API Connect',
    description: 'Pre-built triggers for Review Requests via API',
    icon: Mail,
    color: 'text-blue-400',
    bg: 'bg-blue-500/10',
    category: 'Automation'
  },
  {
    id: 'global-expansion',
    name: 'Global Expansion Map',
    description: 'Highlight EU marketplace with highest demand',
    icon: Globe,
    color: 'text-indigo-400',
    bg: 'bg-indigo-500/10',
    category: 'Strategy'
  },
  {
    id: 'liquidation',
    name: 'Liquidation Logic',
    description: 'Identify aged inventory and suggest exact discount',
    icon: TrendingDown,
    color: 'text-amber-400',
    bg: 'bg-amber-500/10',
    category: 'Inventory'
  }
];

// Strategy Ticket Component
const StrategyTicket = ({ agent, result, onClose }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="p-4 rounded-xl bg-[#0A1628] border border-white/10"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-lg ${agent.bg} flex items-center justify-center`}>
            <agent.icon size={16} className={agent.color} />
          </div>
          <div>
            <h4 className="text-white font-semibold text-sm">{agent.name}</h4>
            <p className="text-zinc-500 text-xs">Strategy Ticket #{Math.random().toString(36).slice(2, 8).toUpperCase()}</p>
          </div>
        </div>
        <button onClick={onClose} className="text-zinc-500 hover:text-white">
          <X size={14} />
        </button>
      </div>
      
      <div className="space-y-3">
        {result.findings.map((finding, index) => (
          <div key={index} className="p-3 rounded-lg bg-white/5 border border-white/5">
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle2 size={14} className={finding.type === 'alert' ? 'text-red-400' : 'text-emerald-400'} />
              <span className={`text-xs font-medium uppercase tracking-wider ${
                finding.type === 'alert' ? 'text-red-400' : 'text-emerald-400'
              }`}>
                {finding.type === 'alert' ? 'Action Required' : 'Opportunity'}
              </span>
            </div>
            <p className="text-white text-sm mb-1">{finding.title}</p>
            <p className="text-zinc-400 text-xs">{finding.description}</p>
            {finding.value && (
              <p className="text-lg font-bold font-['JetBrains_Mono'] mt-2 text-blue-400">{finding.value}</p>
            )}
          </div>
        ))}
        
        <div className="flex items-center justify-between pt-2 border-t border-white/5">
          <span className="text-zinc-500 text-xs">Generated by AI Agent</span>
          <button className="flex items-center gap-1 text-blue-400 text-xs font-medium hover:text-blue-300">
            Export Report <ChevronRight size={12} />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

// Agent Card Component
const AgentCard = ({ agent, onRun, isRunning }) => {
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => onRun(agent)}
      disabled={isRunning}
      className="w-full p-3 rounded-xl bg-white/5 border border-white/5 hover:border-white/10 
        hover:bg-white/10 transition-all text-left group disabled:opacity-50"
    >
      <div className="flex items-center gap-3">
        <div className={`w-9 h-9 rounded-lg ${agent.bg} flex items-center justify-center 
          group-hover:scale-110 transition-transform`}>
          {isRunning ? (
            <Loader2 size={16} className={`${agent.color} animate-spin`} />
          ) : (
            <agent.icon size={16} className={agent.color} />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-white text-sm font-medium truncate">{agent.name}</h4>
          <p className="text-zinc-500 text-xs truncate">{agent.description}</p>
        </div>
        <ChevronRight size={14} className="text-zinc-600 group-hover:text-white transition-colors" />
      </div>
    </motion.button>
  );
};

// Generate mock results for each agent
const generateAgentResult = (agent) => {
  const results = {
    'rufus-seo': {
      findings: [
        { type: 'alert', title: '12 listings missing AI-optimized keywords', description: 'Rufus AI will prioritize listings with natural language queries', value: '-23% potential discovery' },
        { type: 'opportunity', title: 'Add "sustainable" and "eco-friendly" to 8 SKUs', description: 'High search volume for sustainability terms in your category' }
      ]
    },
    'dayparting': {
      findings: [
        { type: 'opportunity', title: 'Peak Conversion Window: 7-9 PM EST', description: 'Increase bids by 30% during this window for max ROAS', value: '+$2,400/week potential' },
        { type: 'alert', title: 'Low performance: 3-5 AM EST', description: 'Consider pausing ads during this time to save budget' }
      ]
    },
    'inventory-sync': {
      findings: [
        { type: 'alert', title: '8 SKUs running ads with <14 days stock', description: 'Risk of stockout while actively spending', value: '$1,850 at risk' },
        { type: 'opportunity', title: 'Reallocate budget to high-stock SKUs', description: '5 SKUs with 90+ days inventory underadvertised' }
      ]
    },
    'negative-ninja': {
      findings: [
        { type: 'alert', title: '47 search terms with 0% conversion', description: 'These terms consumed $892 in the last 30 days', value: '-$892 wasted' },
        { type: 'opportunity', title: 'Auto-add to negative keywords', description: 'Click to add all 47 terms as exact match negatives' }
      ]
    },
    'price-elasticity': {
      findings: [
        { type: 'opportunity', title: 'Optimal price point: $24.99', description: 'Current price $26.99 - dropping $2 increases Buy Box to 94%', value: '+12% Buy Box' },
        { type: 'alert', title: 'Competitor undercut detected', description: 'NewSeller123 priced at $23.49 - monitor closely' }
      ]
    },
    'sentiment-miner': {
      findings: [
        { type: 'alert', title: '"Packaging" mentioned in 34% of negative reviews', description: 'Product arrives damaged - consider reinforced packaging', value: '4.1★ → 4.5★ potential' },
        { type: 'opportunity', title: '"Easy to use" is top positive phrase', description: 'Highlight this in A+ content and bullet points' }
      ]
    },
    'cannibalization': {
      findings: [
        { type: 'alert', title: '18% of ad sales are cannibalized organic', description: 'You\'re paying for sales you would have gotten free', value: '$3,200/month loss' },
        { type: 'opportunity', title: 'Reduce branded keyword bids by 40%', description: 'Maintain visibility while reducing waste' }
      ]
    },
    'refund-root': {
      findings: [
        { type: 'alert', title: 'Return Code: DEFECTIVE - 42% of returns', description: 'Quality control issue detected - check batch #2024-Q4', value: '8.2% return rate' },
        { type: 'opportunity', title: 'Add quality check step before shipping', description: 'Estimated $4,500/month savings in returns' }
      ]
    },
    'ltv-calculator': {
      findings: [
        { type: 'opportunity', title: 'Average Customer LTV: $89.50', description: 'Based on 23% repeat purchase rate over 12 months', value: '2.3x first purchase' },
        { type: 'opportunity', title: 'Email re-engagement opportunity', description: '2,400 customers due for repurchase this month' }
      ]
    },
    'marketplace-arbitrage': {
      findings: [
        { type: 'opportunity', title: 'SKU-0012 margin 23% higher on Walmart', description: 'Lower fees and less competition', value: '+$4.20/unit' },
        { type: 'alert', title: '3 SKUs underperforming on Amazon vs Walmart', description: 'Consider shifting inventory allocation' }
      ]
    },
    'bsr-predictor': {
      findings: [
        { type: 'opportunity', title: 'BSR predicted to improve to #45 in 14 days', description: 'Current trajectory based on velocity increase', value: '#89 → #45' },
        { type: 'alert', title: 'Competitor launching similar product in 7 days', description: 'Consider defensive PPC strategy' }
      ]
    },
    'budget-pacing': {
      findings: [
        { type: 'alert', title: 'Budget will deplete by Day 18', description: 'Current spend rate $450/day vs $300/day target', value: '150% overpacing' },
        { type: 'opportunity', title: 'Reduce non-converting campaign bids', description: 'Save $2,100 to last full month' }
      ]
    },
    'dsp-funnel': {
      findings: [
        { type: 'opportunity', title: 'Re-marketing audience: 12,400 users', description: 'Users who viewed but didn\'t purchase in 30 days', value: '3.2% est. conversion' },
        { type: 'opportunity', title: 'Lookalike audience ready', description: '45,000 potential customers matching buyer profile' }
      ]
    },
    'aplus-scorer': {
      findings: [
        { type: 'alert', title: 'Main image quality score: 62/100', description: 'Low contrast and small product in frame', value: '-15% CTR impact' },
        { type: 'opportunity', title: 'Add lifestyle images', description: 'Competitors average 5 lifestyle images vs your 2' }
      ]
    },
    'brand-voice': {
      findings: [
        { type: 'opportunity', title: 'Share of Voice: 12%', description: 'Competitor A: 28%, Competitor B: 22%', value: '3rd place' },
        { type: 'alert', title: 'Visibility dropping on top 5 keywords', description: 'Lost 4 positions in the last 7 days' }
      ]
    },
    'oos-penalty': {
      findings: [
        { type: 'alert', title: '3 stockouts in last 30 days', description: 'Estimated revenue lost: $8,400', value: '-$8,400' },
        { type: 'opportunity', title: 'Set reorder point alerts', description: 'Prevent future stockouts with 21-day buffer' }
      ]
    },
    'climate-pledge': {
      findings: [
        { type: 'opportunity', title: '8 SKUs eligible for Climate Pledge Friendly', description: 'Badge increases conversion by 8-12%', value: '+$12,000/year' },
        { type: 'opportunity', title: 'Certification path available', description: 'Simple documentation required for approval' }
      ]
    },
    'emailer-api': {
      findings: [
        { type: 'opportunity', title: 'Review request automation ready', description: 'Send requests 7 days post-delivery', value: '+0.3★ average' },
        { type: 'opportunity', title: '1,200 eligible orders this month', description: 'Connect SendGrid/Mailchimp to activate' }
      ]
    },
    'global-expansion': {
      findings: [
        { type: 'opportunity', title: 'Germany (DE) has highest demand', description: 'Search volume 3.2x higher than current market', value: '€45,000/month potential' },
        { type: 'opportunity', title: 'UK market ready for launch', description: 'Similar demographics, English listings work' }
      ]
    },
    'liquidation': {
      findings: [
        { type: 'alert', title: '12 SKUs with >180 days inventory', description: 'Storage fees eating into margin', value: '$890/month fees' },
        { type: 'opportunity', title: 'Recommended discount: 25%', description: 'Break-even clearance price calculated' }
      ]
    }
  };

  return results[agent.id] || {
    findings: [
      { type: 'opportunity', title: 'Analysis complete', description: 'No significant issues found', value: 'All clear' }
    ]
  };
};

// Main AI Agent Sidebar
export const AIAgentSidebar = ({ onClose, data, skuData }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [runningAgent, setRunningAgent] = useState(null);
  const [activeTicket, setActiveTicket] = useState(null);
  const [scanProgress, setScanProgress] = useState(0);

  const filteredAgents = AI_AGENTS.filter(agent =>
    agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    agent.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    agent.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const categories = [...new Set(AI_AGENTS.map(a => a.category))];

  const runAgent = async (agent) => {
    setRunningAgent(agent.id);
    setScanProgress(0);
    setActiveTicket(null);

    // Simulate scanning animation
    for (let i = 0; i <= 100; i += 5) {
      await new Promise(resolve => setTimeout(resolve, 50));
      setScanProgress(i);
    }

    // Generate result
    const result = generateAgentResult(agent);
    setActiveTicket({ agent, result });
    setRunningAgent(null);
  };

  return (
    <motion.div
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ type: 'spring', damping: 25 }}
      className="fixed right-0 top-0 h-full w-[420px] bg-[#050B18] border-l border-white/10 z-50 flex flex-col"
    >
      {/* Header */}
      <div className="p-6 border-b border-white/10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
              <Bot size={20} className="text-blue-400" />
            </div>
            <div>
              <h2 className="text-white font-bold font-['Manrope']">AI Agent Console</h2>
              <p className="text-zinc-500 text-xs">20 optimization agents ready</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition-all"
          >
            <X size={18} />
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input
            type="text"
            placeholder="Search agents..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white 
              placeholder-zinc-500 text-sm focus:outline-none focus:border-blue-500/50"
          />
        </div>
      </div>

      {/* Scanning Animation */}
      <AnimatePresence>
        {runningAgent && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="px-6 py-4 border-b border-white/10 bg-blue-500/5"
          >
            <div className="flex items-center gap-3 mb-3">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              >
                <Sparkles size={18} className="text-blue-400" />
              </motion.div>
              <span className="text-white text-sm">Scanning {data?.length || 0} data points...</span>
            </div>
            <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${scanProgress}%` }}
                className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Active Ticket */}
      <AnimatePresence>
        {activeTicket && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="px-6 py-4 border-b border-white/10"
          >
            <StrategyTicket
              agent={activeTicket.agent}
              result={activeTicket.result}
              onClose={() => setActiveTicket(null)}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Agent List */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {categories.map(category => {
          const categoryAgents = filteredAgents.filter(a => a.category === category);
          if (categoryAgents.length === 0) return null;

          return (
            <div key={category}>
              <h3 className="text-zinc-500 text-xs uppercase tracking-wider mb-3">{category}</h3>
              <div className="space-y-2">
                {categoryAgents.map(agent => (
                  <AgentCard
                    key={agent.id}
                    agent={agent}
                    onRun={runAgent}
                    isRunning={runningAgent === agent.id}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="p-6 border-t border-white/10 space-y-3">
        <button className="w-full py-3 rounded-xl bg-blue-500 text-white font-bold hover:bg-blue-400 
          transition-all shadow-[0_0_20px_rgba(59,130,246,0.3)] flex items-center justify-center gap-2">
          <Zap size={18} />
          Run All Agents
        </button>
        
        {/* Demo Universe Link */}
        {process.env.REACT_APP_SHOW_DEMO === 'true' && (
          <a 
            href="/internal-demo"
            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-violet-500/20 to-purple-500/20 
              border border-violet-500/30 text-violet-400 text-sm font-medium hover:from-violet-500/30 
              hover:to-purple-500/30 transition-all flex items-center justify-center gap-2"
          >
            <Sparkles size={14} />
            See the Future of AdsGupta
          </a>
        )}
      </div>
    </motion.div>
  );
};

export default AIAgentSidebar;

/**
 * Dashboard Sidebar Component
 * Persistent global sidebar for the Universal Dashboard
 */
import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, ShoppingCart, TrendingUp, Search, Users, FileText, 
  ChevronDown, ChevronRight, ExternalLink, Zap, BarChart3, Target,
  Store, Truck, Bot
} from 'lucide-react';

// Sidebar sections configuration
const SIDEBAR_SECTIONS = [
  {
    id: 'marketplaces',
    title: 'Marketplaces',
    icon: Store,
    items: [
      { 
        id: 'amazon', 
        label: 'Amazon Seller Hub', 
        icon: ShoppingCart,
        path: '/dashboard',
        color: 'text-orange-400',
        status: 'active'
      },
      { 
        id: 'walmart', 
        label: 'Walmart Hub', 
        icon: ShoppingCart,
        path: '/dashboard?marketplace=walmart',
        color: 'text-blue-400',
        status: 'coming',
        badge: 'Soon'
      }
    ]
  },
  {
    id: 'growth-tools',
    title: 'Growth Tools',
    icon: TrendingUp,
    items: [
      { 
        id: 'seo', 
        label: 'SEO Intelligence', 
        icon: Search,
        path: '/tools#seo',
        color: 'text-cyan-400',
        status: 'active'
      },
      { 
        id: 'audit', 
        label: 'Growth Audit Engine', 
        icon: Zap,
        path: '/audit',
        color: 'text-emerald-400',
        status: 'active',
        highlight: true
      },
      { 
        id: 'affiliate', 
        label: 'Affiliate Manager', 
        icon: Users,
        path: '/tools#affiliate',
        color: 'text-violet-400',
        status: 'active'
      },
      { 
        id: 'content', 
        label: 'AI Content Studio', 
        icon: FileText,
        path: '/tools#content',
        color: 'text-orange-400',
        status: 'active'
      }
    ]
  }
];

const DashboardSidebar = ({ isCollapsed, onToggle, activeModule, onModuleChange }) => {
  const location = useLocation();
  const [expandedSections, setExpandedSections] = useState(['marketplaces', 'growth-tools']);
  
  const toggleSection = (sectionId) => {
    setExpandedSections(prev => 
      prev.includes(sectionId)
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    );
  };
  
  const isItemActive = (item) => {
    if (item.id === 'amazon' && location.pathname === '/dashboard') return true;
    if (item.id === 'audit' && location.pathname === '/audit') return true;
    return location.pathname === item.path;
  };
  
  return (
    <motion.aside
      initial={false}
      animate={{ width: isCollapsed ? 64 : 260 }}
      className="fixed left-0 top-20 bottom-0 bg-[#0A1628] border-r border-white/5 z-40 overflow-hidden"
    >
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-white/5">
          <div className="flex items-center justify-between">
            {!isCollapsed && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-white font-semibold font-['Space_Grotesk']"
              >
                Command Center
              </motion.span>
            )}
            <button
              onClick={onToggle}
              className="p-2 rounded-lg hover:bg-white/5 text-zinc-400 hover:text-white transition-all"
            >
              <LayoutDashboard size={18} />
            </button>
          </div>
        </div>
        
        {/* Sections */}
        <div className="flex-1 overflow-y-auto py-4">
          {SIDEBAR_SECTIONS.map((section) => (
            <div key={section.id} className="mb-4">
              {/* Section Header */}
              <button
                onClick={() => !isCollapsed && toggleSection(section.id)}
                className={`w-full flex items-center gap-3 px-4 py-2 text-left transition-all ${
                  isCollapsed ? 'justify-center' : ''
                }`}
              >
                <section.icon size={16} className="text-zinc-500" />
                {!isCollapsed && (
                  <>
                    <span className="flex-1 text-zinc-400 text-xs uppercase tracking-wider font-medium">
                      {section.title}
                    </span>
                    {expandedSections.includes(section.id) ? (
                      <ChevronDown size={14} className="text-zinc-500" />
                    ) : (
                      <ChevronRight size={14} className="text-zinc-500" />
                    )}
                  </>
                )}
              </button>
              
              {/* Section Items */}
              <AnimatePresence>
                {(isCollapsed || expandedSections.includes(section.id)) && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    {section.items.map((item) => {
                      const isActive = isItemActive(item);
                      
                      return (
                        <Link
                          key={item.id}
                          to={item.path}
                          onClick={() => onModuleChange?.(item.id)}
                          className={`flex items-center gap-3 px-4 py-2.5 mx-2 rounded-lg transition-all ${
                            isCollapsed ? 'justify-center' : ''
                          } ${
                            isActive
                              ? 'bg-cyan-500/10 border border-cyan-500/30'
                              : 'hover:bg-white/5'
                          } ${item.highlight ? 'ring-1 ring-emerald-500/30' : ''}`}
                          data-testid={`sidebar-item-${item.id}`}
                        >
                          <item.icon 
                            size={18} 
                            className={isActive ? 'text-cyan-400' : item.color} 
                          />
                          
                          {!isCollapsed && (
                            <>
                              <span className={`flex-1 text-sm font-medium ${
                                isActive ? 'text-white' : 'text-zinc-400'
                              }`}>
                                {item.label}
                              </span>
                              
                              {item.badge && (
                                <span className="px-1.5 py-0.5 rounded text-[10px] bg-blue-500/20 text-blue-400 uppercase">
                                  {item.badge}
                                </span>
                              )}
                              
                              {item.status === 'active' && isActive && (
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                              )}
                            </>
                          )}
                        </Link>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
        
        {/* Footer */}
        {!isCollapsed && (
          <div className="p-4 border-t border-white/5">
            <a
              href="https://demoai.adsgupta.com/amazon-audit"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gradient-to-r from-violet-500/10 to-cyan-500/10 border border-violet-500/20 text-violet-400 text-sm font-medium hover:border-violet-500/40 transition-all"
            >
              <Bot size={16} />
              <span>Demo Universe</span>
              <ExternalLink size={12} className="ml-auto opacity-50" />
            </a>
          </div>
        )}
      </div>
    </motion.aside>
  );
};

export default DashboardSidebar;

import React, { useState, useRef, useEffect } from 'react';
import { Menu, X, Search } from 'lucide-react';

const TABS = [
  { id: 'monetization', label: 'Monetization Lab' },
  { id: 'ai-lab', label: 'AI Lab' },
  { id: 'creative-template', label: 'Creative Template' },
  { id: 'games', label: 'Games' },
];

export function DemoAIHeader({ activeTab, setActiveTab, toolSearchQuery, setToolSearchQuery, placeholder = 'Search tools...' }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const searchInputRef = useRef(null);

  useEffect(() => {
    if (searchOpen) searchInputRef.current?.focus();
  }, [searchOpen]);

  return (
    <header className="sticky top-0 z-50 border-b border-white/5 bg-[#0A0A0A]/95 backdrop-blur-xl">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 h-14 sm:h-16 flex items-center justify-between gap-2">
        {/* Logo + Hamburger (mobile) */}
        <div className="flex items-center gap-2 min-w-0">
          <button
            type="button"
            onClick={() => setMobileOpen((o) => !o)}
            className="lg:hidden p-2 -ml-2 text-zinc-400 hover:text-white rounded-lg"
            aria-label="Menu"
          >
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
          <button
            type="button"
            onClick={() => window.scrollTo(0, 0)}
            className="flex items-center gap-2 shrink-0 text-left"
          >
            <span className="text-lg sm:text-xl font-bold tracking-tight text-white font-sans">
              Demo<span className="text-cyan-400">AI</span>
            </span>
            <span className="hidden sm:inline-flex px-2 py-0.5 text-[9px] rounded bg-cyan-500/20 text-cyan-400 font-bold tracking-wider border border-cyan-500/30">
              by AdsGupta
            </span>
          </button>
        </div>

        {/* Desktop: Tabs + Search dropdown */}
        <div className="hidden lg:flex items-center gap-2 flex-1 justify-center max-w-2xl">
          <nav className="flex items-center gap-1" role="tablist">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={activeTab === tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3 py-2 sm:px-4 sm:py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                  activeTab === tab.id
                    ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40'
                    : 'text-zinc-400 hover:text-white hover:bg-white/5 border border-transparent'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
          <div className="relative">
            <button
              type="button"
              onClick={() => setSearchOpen((o) => !o)}
              className="flex items-center gap-2 px-3 py-2 rounded-xl border border-white/10 bg-white/5 text-zinc-400 hover:text-white hover:border-cyan-500/30 text-sm"
            >
              <Search size={16} />
              <span className="max-w-[120px] truncate">{toolSearchQuery || 'Search tool'}</span>
            </button>
            {searchOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setSearchOpen(false)} aria-hidden />
                <div className="absolute right-0 top-full mt-1 z-20 w-64 sm:w-72 bg-slate-900 border border-white/10 rounded-xl shadow-xl p-2">
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={toolSearchQuery}
                    onChange={(e) => setToolSearchQuery(e.target.value)}
                    placeholder={placeholder}
                    className="w-full px-3 py-2 rounded-lg bg-black/50 border border-white/10 text-white placeholder-zinc-500 text-sm focus:border-cyan-500/50 focus:outline-none"
                  />
                </div>
              </>
            )}
          </div>
        </div>

        {/* Spacer for mobile */}
        <div className="w-10 lg:hidden" />
      </div>

      {/* Mobile menu: Tabs + Search */}
      {mobileOpen && (
        <div className="lg:hidden border-t border-white/5 bg-[#0A0A0A] px-4 py-4 space-y-4">
          <nav className="flex flex-col gap-1">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => { setActiveTab(tab.id); setMobileOpen(false); }}
                className={`px-4 py-3 rounded-xl text-left text-sm font-semibold ${
                  activeTab === tab.id ? 'bg-cyan-500/20 text-cyan-400' : 'text-zinc-400'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
          <div>
            <label className="text-xs font-medium text-zinc-500 uppercase tracking-wider block mb-2">Search tool</label>
            <input
              type="search"
              value={toolSearchQuery}
              onChange={(e) => setToolSearchQuery(e.target.value)}
              placeholder={placeholder}
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-zinc-500 text-sm focus:border-cyan-500/50 focus:outline-none"
            />
          </div>
        </div>
      )}
    </header>
  );
}

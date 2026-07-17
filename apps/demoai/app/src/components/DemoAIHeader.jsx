import React, { useState, useRef, useEffect } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { Menu, X, Search } from 'lucide-react';
import { DEMO_TAB_ROUTES } from '../config/demoRoutes';
import { DemoTabStrip } from './DemoTabNav';

export function DemoAIHeader({
  toolSearchQuery,
  setToolSearchQuery,
  placeholder = 'Search tools...',
}) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const searchInputRef = useRef(null);
  const location = useLocation();

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (searchOpen) searchInputRef.current?.focus();
  }, [searchOpen]);

  const tabLinkClass = ({ isActive }) =>
    `px-3 py-2 sm:px-4 sm:py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all border ${
      isActive
        ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/40'
        : 'text-zinc-400 hover:text-white hover:bg-white/5 border-transparent'
    }`;

  const mobileTabClass = (path) =>
    `px-4 py-3 rounded-xl text-left text-sm font-semibold block ${
      location.pathname === path ? 'bg-cyan-500/20 text-cyan-400' : 'text-zinc-400'
    }`;

  return (
    <header className="sticky top-0 z-50 border-b border-white/5 bg-[#0A0A0A]/95 backdrop-blur-xl safe-top">
      <div className="max-w-[1600px] mx-auto px-3 sm:px-6 h-14 sm:h-16 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1 sm:gap-2 min-w-0 flex-1 lg:flex-none">
          <button
            type="button"
            onClick={() => setMobileOpen((o) => !o)}
            className="lg:hidden p-2 -ml-1 text-zinc-400 hover:text-white rounded-lg touch-manipulation"
            aria-label="Menu"
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
          <Link
            to="/monetizationlab"
            className="flex items-center gap-2 shrink-0 min-w-0"
            onClick={() => window.scrollTo(0, 0)}
          >
            <span className="text-base sm:text-xl font-bold tracking-tight text-white font-sans truncate">
              Demo<span className="text-cyan-400">AI</span>
            </span>
            <span className="hidden sm:inline-flex px-2 py-0.5 text-[9px] rounded bg-cyan-500/20 text-cyan-400 font-bold tracking-wider border border-cyan-500/30">
              by AdsGupta
            </span>
          </Link>
        </div>

        <div className="hidden lg:flex items-center gap-2 flex-1 justify-center max-w-3xl">
          <nav className="flex items-center gap-1 flex-wrap justify-center" role="tablist">
            {DEMO_TAB_ROUTES.map((tab) => (
              <NavLink
                key={tab.id}
                to={tab.path}
                role="tab"
                className={tabLinkClass}
                end
              >
                {tab.label}
              </NavLink>
            ))}
          </nav>
          <div className="relative shrink-0">
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
                    type="search"
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

        <button
          type="button"
          onClick={() => setSearchOpen((o) => !o)}
          className="lg:hidden p-2 text-zinc-400 hover:text-white rounded-lg touch-manipulation"
          aria-label="Search tools"
        >
          <Search size={20} />
        </button>
      </div>

      <div className="lg:hidden border-t border-white/5 px-2 py-2 bg-[#0A0A0A]/98">
        <DemoTabStrip />
      </div>

      {searchOpen && (
        <div className="lg:hidden border-t border-white/5 px-3 py-3 bg-[#0A0A0A]">
          <input
            ref={searchInputRef}
            type="search"
            value={toolSearchQuery}
            onChange={(e) => setToolSearchQuery(e.target.value)}
            placeholder={placeholder}
            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-zinc-500 text-base focus:border-cyan-500/50 focus:outline-none"
          />
        </div>
      )}

      {mobileOpen && (
        <div className="lg:hidden border-t border-white/5 bg-[#0A0A0A] px-3 py-4 space-y-3 max-h-[min(70vh,480px)] overflow-y-auto">
          <nav className="flex flex-col gap-1">
            {DEMO_TAB_ROUTES.map((tab) => (
              <Link key={tab.id} to={tab.path} className={mobileTabClass(tab.path)}>
                {tab.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}

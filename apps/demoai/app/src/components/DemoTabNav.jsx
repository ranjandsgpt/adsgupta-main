import { NavLink } from 'react-router-dom';
import { DEMO_TAB_ROUTES } from '../config/demoRoutes';

function tabClassName({ isActive }, variant) {
  if (variant === 'bottom') {
    return `flex flex-col items-center justify-center gap-0.5 py-2 px-1 min-h-[3rem] text-[10px] sm:text-xs font-semibold transition-colors touch-manipulation ${
      isActive ? 'text-cyan-400' : 'text-zinc-500 hover:text-zinc-300'
    }`;
  }
  return `shrink-0 px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all border touch-manipulation ${
    isActive
      ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/40'
      : 'text-zinc-400 hover:text-white hover:bg-white/5 border-transparent'
  }`;
}

export function DemoTabStrip({ className = '', variant = 'scroll' }) {
  return (
    <nav
      className={`flex items-center gap-1.5 ${variant === 'scroll' ? 'overflow-x-auto hide-scrollbar' : ''} ${className}`}
      aria-label="Demo sections"
    >
      {DEMO_TAB_ROUTES.map((tab) => (
        <NavLink key={tab.id} to={tab.path} className={(state) => tabClassName(state, 'scroll')} end>
          {tab.label}
        </NavLink>
      ))}
    </nav>
  );
}

export function DemoBottomNav() {
  return (
    <nav
      className="lg:hidden fixed bottom-0 inset-x-0 z-40 border-t border-white/10 bg-[#0A0A0A]/95 backdrop-blur-xl safe-bottom demo-bottom-nav"
      aria-label="Primary navigation"
    >
      <div className="grid grid-cols-4 max-w-[1600px] mx-auto">
        {DEMO_TAB_ROUTES.map((tab) => (
          <NavLink key={tab.id} to={tab.path} className={(state) => tabClassName(state, 'bottom')} end>
            <span className="leading-tight text-center px-0.5">{tab.shortLabel}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}

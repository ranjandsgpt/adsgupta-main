import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Box, FileText, Briefcase, Users, Phone, Menu, X, LogIn, ChevronDown } from 'lucide-react';
import { useState } from 'react';
import MegaMenu from './MegaMenu';
import { brandNames } from '../config/protocolsConfig';

export const Navigation = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [megaMenuOpen, setMegaMenuOpen] = useState(false);

  const navItems = [
    { label: 'The Neural Engine', href: '/#features', icon: Box },
    { label: 'The Protocols', href: null, icon: Briefcase, hasMegaMenu: true },
    { label: 'The Archives', href: '/blog', icon: FileText },
    { label: 'About', href: '/aboutme', icon: Users },
    { label: 'Contact', href: '/contact', icon: Phone },
  ];

  return (
    <motion.nav
      data-testid="desktop-navigation"
      className="fixed top-0 left-0 right-0 z-50 px-6 md:px-12 py-4 bg-[#121212]/90 backdrop-blur-xl border-b border-white/5"
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
    >
      <div className="max-w-[1200px] mx-auto flex items-center justify-between">
        {/* Logo + Badge Group */}
        <div className="flex items-center">
          <motion.div whileHover={{ scale: 1.02 }}>
            <Link
              to="/"
              data-testid="logo-link"
              data-hoverable="true"
              className="flex items-center gap-2"
            >
              <span className="text-xl md:text-2xl font-bold tracking-tight text-white font-['Space_Grotesk']">
                ADS<span className="text-cyan-400">GUPTA</span>
              </span>
              <span className="hidden md:inline-flex px-2 py-0.5 text-[9px] rounded bg-cyan-500/20 text-cyan-400 font-bold tracking-wider border border-cyan-500/30">
                AD-OS
              </span>
            </Link>
          </motion.div>
          
          {/* 20px spacer */}
          <div className="w-5 md:w-8" />
        </div>

        {/* Desktop Nav Links - Centered */}
        <div className="hidden lg:flex items-center gap-6 xl:gap-8">
          {navItems.map((item) => {
            // Handle mega-menu item
            if (item.hasMegaMenu) {
              return (
                <div
                  key={item.label}
                  className="relative"
                  onMouseEnter={() => setMegaMenuOpen(true)}
                  onMouseLeave={() => setMegaMenuOpen(false)}
                >
                  <motion.button
                    onClick={() => setMegaMenuOpen(!megaMenuOpen)}
                    data-testid={`nav-link-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
                    data-hoverable="true"
                    className="flex items-center gap-1 text-zinc-400 hover:text-white transition-colors duration-300 text-[13px] font-medium tracking-wide whitespace-nowrap"
                    whileHover={{ y: -1 }}
                  >
                    {item.label}
                    <ChevronDown size={14} className={`transition-transform ${megaMenuOpen ? 'rotate-180' : ''}`} />
                  </motion.button>
                  
                  <MegaMenu isOpen={megaMenuOpen} onClose={() => setMegaMenuOpen(false)} />
                </div>
              );
            }
            
            // Handle anchor links
            if (item.href?.startsWith('/#')) {
              return (
                <motion.a
                  key={item.label}
                  href={item.href}
                  data-testid={`nav-link-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
                  data-hoverable="true"
                  className="text-zinc-400 hover:text-white transition-colors duration-300 text-[13px] font-medium tracking-wide whitespace-nowrap"
                  whileHover={{ y: -1 }}
                >
                  {item.label}
                </motion.a>
              );
            }
            
            // Handle regular links
            return (
              <Link
                key={item.label}
                to={item.href}
                data-testid={`nav-link-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
                data-hoverable="true"
                className="text-zinc-400 hover:text-white transition-colors duration-300 text-[13px] font-medium tracking-wide whitespace-nowrap"
              >
                {item.label}
              </Link>
            );
          })}
        </div>

        {/* Right Side: Login + Try Demo with Divider */}
        <div className="hidden lg:flex items-center">
          {/* Vertical Divider */}
          <div className="h-6 w-px bg-white/10 mr-5" />
          
          {/* Login Button */}
          <motion.a
            href="https://exchange.adsgupta.com/login"
            target="_blank"
            rel="noopener noreferrer"
            data-testid="nav-login-button"
            data-hoverable="true"
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-cyan-500/40 text-cyan-400 text-[13px] font-medium
              hover:bg-cyan-500/10 hover:border-cyan-400 hover:text-white transition-all duration-300 mr-3"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <LogIn size={14} strokeWidth={1.5} />
            Login
          </motion.a>

          {/* CTA Button */}
          <motion.a
            href="https://demoai.adsgupta.com"
            target="_blank"
            rel="noopener noreferrer"
            data-testid="nav-cta-button"
            data-hoverable="true"
            className="glow-button px-4 py-2 rounded-lg bg-cyan-500 text-black text-[13px] font-bold
              hover:bg-cyan-400 shadow-[0_0_15px_rgba(0,240,255,0.25)]"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Try Demo
          </motion.a>
        </div>

        {/* Mobile Menu Button */}
        <button
          data-testid="mobile-menu-button"
          className="lg:hidden text-white p-2"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:hidden absolute top-full left-0 right-0 bg-[#121212]/98 backdrop-blur-xl border-b border-white/10 py-6 px-6"
        >
          <div className="flex flex-col gap-4">
            {navItems.map((item) => {
              if (item.hasMegaMenu) {
                return (
                  <a
                    key={item.label}
                    href="https://demoai.adsgupta.com"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 text-zinc-300 hover:text-white py-2 text-sm"
                  >
                    <item.icon size={18} strokeWidth={1.5} />
                    {item.label}
                  </a>
                );
              }
              
              if (item.href?.startsWith('/#')) {
                return (
                  <a
                    key={item.label}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 text-zinc-300 hover:text-white py-2 text-sm"
                  >
                    <item.icon size={18} strokeWidth={1.5} />
                    {item.label}
                  </a>
                );
              }
              
              return (
                <Link
                  key={item.label}
                  to={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 text-zinc-300 hover:text-white py-2 text-sm"
                >
                  <item.icon size={18} strokeWidth={1.5} />
                  {item.label}
                </Link>
              );
            })}
            <div className="flex gap-3 mt-4 pt-4 border-t border-white/10">
              <a
                href="https://exchange.adsgupta.com/login"
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-cyan-500/40 text-cyan-400 text-sm font-medium"
              >
                <LogIn size={16} />
                Login
              </a>
              <a
                href="https://demoai.adsgupta.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center px-4 py-2.5 rounded-lg bg-cyan-500 text-black text-sm font-bold"
              >
                Try Demo
              </a>
            </div>
          </div>
        </motion.div>
      )}
    </motion.nav>
  );
};

export default Navigation;

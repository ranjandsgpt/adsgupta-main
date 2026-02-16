import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Box, FileText, Briefcase, Users, Phone, Menu, X, LogIn } from 'lucide-react';
import { useState } from 'react';

export const Navigation = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { label: 'Ecosystem', href: '/#hub', icon: Box },
    { label: 'Solutions', href: '/#solutions-grid', icon: Briefcase },
    { label: 'The Archives', href: '/blog', icon: FileText },
    { label: 'About', href: '/aboutme', icon: Users },
    { label: 'Contact', href: '/contact', icon: Phone },
  ];

  return (
    <motion.nav
      data-testid="desktop-navigation"
      className="desktop-nav fixed top-0 left-0 right-0 z-50 px-6 md:px-12 py-4 bg-[#121212]/90 backdrop-blur-xl border-b border-white/5"
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <motion.div whileHover={{ scale: 1.02 }}>
          <Link
            to="/"
            data-testid="logo-link"
            data-hoverable="true"
            className="flex items-center gap-2"
          >
            <span className="text-2xl font-bold tracking-tight text-white font-['Space_Grotesk']">
              ADS<span className="text-cyan-400">GUPTA</span>
            </span>
            <span className="hidden md:inline-flex px-2 py-0.5 text-[9px] rounded bg-cyan-500/20 text-cyan-400 font-bold tracking-wider border border-cyan-500/30">
              AD-OS
            </span>
          </Link>
        </motion.div>

        {/* Desktop Nav Links */}
        <div className="hidden lg:flex items-center gap-5">
          {navItems.map((item) => (
            item.href.startsWith('/#') ? (
              <motion.a
                key={item.label}
                href={item.href}
                data-testid={`nav-link-${item.label.toLowerCase().replace(' ', '-')}`}
                data-hoverable="true"
                className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors duration-300 text-sm font-medium tracking-wide"
                whileHover={{ y: -2 }}
              >
                <item.icon size={15} strokeWidth={1.5} />
                {item.label}
              </motion.a>
            ) : (
              <Link
                key={item.label}
                to={item.href}
                data-testid={`nav-link-${item.label.toLowerCase().replace(' ', '-')}`}
                data-hoverable="true"
                className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors duration-300 text-sm font-medium tracking-wide"
              >
                <item.icon size={15} strokeWidth={1.5} />
                {item.label}
              </Link>
            )
          ))}

          {/* Login Button */}
          <motion.button
            data-testid="nav-login-button"
            data-hoverable="true"
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-cyan-500/50 text-cyan-400 text-sm font-medium
              hover:bg-cyan-500/10 hover:border-cyan-400 hover:text-white transition-all duration-300"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <LogIn size={16} strokeWidth={1.5} />
            Login
          </motion.button>

          {/* CTA Button */}
          <motion.a
            href="https://demoai.adsgupta.com"
            target="_blank"
            rel="noopener noreferrer"
            data-testid="nav-cta-button"
            data-hoverable="true"
            className="glow-button px-5 py-2.5 rounded-xl bg-cyan-500 text-black text-sm font-bold
              hover:bg-cyan-400 shadow-[0_0_20px_rgba(0,240,255,0.3)]"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Try Demo
          </motion.a>
        </div>

        {/* Mobile Menu Button */}
        <button
          data-testid="mobile-menu-button"
          className="lg:hidden text-white"
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
            {navItems.map((item) => (
              item.href.startsWith('/#') ? (
                <a
                  key={item.label}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 text-zinc-300 hover:text-white py-2"
                >
                  <item.icon size={18} strokeWidth={1.5} />
                  {item.label}
                </a>
              ) : (
                <Link
                  key={item.label}
                  to={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 text-zinc-300 hover:text-white py-2"
                >
                  <item.icon size={18} strokeWidth={1.5} />
                  {item.label}
                </Link>
              )
            ))}
            <button className="flex items-center gap-3 text-cyan-400 py-2 mt-2 border-t border-white/10 pt-4">
              <LogIn size={18} strokeWidth={1.5} />
              Login
            </button>
          </div>
        </motion.div>
      )}
    </motion.nav>
  );
};

export default Navigation;

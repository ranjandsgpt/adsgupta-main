import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Box, FileText, Network, Briefcase, Users, Phone, Menu, X } from 'lucide-react';
import { useState } from 'react';

export const Navigation = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { label: 'Ecosystem', href: '/#hub', icon: Box },
    { label: 'Solutions', href: '/#stakeholders', icon: Briefcase },
    { label: 'The Archives', href: '/blog', icon: FileText },
    { label: 'About', href: '/aboutme', icon: Users },
    { label: 'Contact', href: '/contact', icon: Phone },
  ];

  return (
    <motion.nav
      data-testid="desktop-navigation"
      className="desktop-nav fixed top-0 left-0 right-0 z-50 px-6 md:px-12 py-5 bg-[#121212]/80 backdrop-blur-xl border-b border-white/5"
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
          </Link>
        </motion.div>

        {/* Desktop Nav Links */}
        <div className="hidden lg:flex items-center gap-6">
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
                <item.icon size={16} strokeWidth={1.5} />
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
                <item.icon size={16} strokeWidth={1.5} />
                {item.label}
              </Link>
            )
          ))}

          {/* CTA Button */}
          <motion.a
            href="https://demoai.adsgupta.com"
            target="_blank"
            rel="noopener noreferrer"
            data-testid="nav-cta-button"
            data-hoverable="true"
            className="glow-button px-5 py-2.5 rounded-full border border-cyan-500/50 text-cyan-400 text-sm font-medium hover:bg-cyan-500/10 hover:text-white"
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
          className="lg:hidden absolute top-full left-0 right-0 bg-[#121212]/95 backdrop-blur-xl border-b border-white/10 py-6 px-6"
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
          </div>
        </motion.div>
      )}
    </motion.nav>
  );
};

export default Navigation;

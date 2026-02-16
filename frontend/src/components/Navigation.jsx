import { motion } from 'framer-motion';
import { Box, FileText, Network } from 'lucide-react';

export const Navigation = () => {
  const navItems = [
    { label: 'AI Tool', href: 'https://demoai.adsgupta.com', icon: Box },
    { label: 'Ad-Blog', href: 'https://blog.adsgupta.com', icon: FileText },
    { label: 'Network', href: '#network', icon: Network },
  ];

  return (
    <motion.nav
      data-testid="desktop-navigation"
      className="desktop-nav fixed top-0 left-0 right-0 z-50 px-6 md:px-12 py-6"
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <motion.a
          href="/"
          data-testid="logo-link"
          data-hoverable="true"
          className="flex items-center gap-2"
          whileHover={{ scale: 1.02 }}
        >
          <span className="text-2xl font-bold tracking-tight text-white font-['Space_Grotesk']">
            ADS<span className="text-cyan-400">GUPTA</span>
          </span>
        </motion.a>

        {/* Nav Links */}
        <div className="flex items-center gap-8">
          {navItems.map((item) => (
            <motion.a
              key={item.label}
              href={item.href}
              target={item.href.startsWith('http') ? '_blank' : undefined}
              rel={item.href.startsWith('http') ? 'noopener noreferrer' : undefined}
              data-testid={`nav-link-${item.label.toLowerCase().replace(' ', '-')}`}
              data-hoverable="true"
              className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors duration-300 text-sm font-medium tracking-wide"
              whileHover={{ y: -2 }}
            >
              <item.icon size={16} strokeWidth={1.5} />
              {item.label}
            </motion.a>
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
      </div>
    </motion.nav>
  );
};

export default Navigation;

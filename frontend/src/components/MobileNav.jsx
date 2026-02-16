import { motion } from 'framer-motion';
import { Box, FileText, Network, Home } from 'lucide-react';

export const MobileNav = () => {
  const navItems = [
    { label: 'Home', href: '#hero', icon: Home },
    { label: 'AI Tool', href: 'https://demoai.adsgupta.com', icon: Box },
    { label: 'Blog', href: 'https://blog.adsgupta.com', icon: FileText },
    { label: 'Network', href: '#network', icon: Network },
  ];

  return (
    <motion.nav
      data-testid="mobile-navigation"
      className="mobile-nav mobile-bottom-nav"
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
    >
      <div className="flex items-center justify-around h-full px-4">
        {navItems.map((item) => (
          <motion.a
            key={item.label}
            href={item.href}
            target={item.href.startsWith('http') ? '_blank' : undefined}
            rel={item.href.startsWith('http') ? 'noopener noreferrer' : undefined}
            data-testid={`mobile-nav-${item.label.toLowerCase()}`}
            className="flex flex-col items-center gap-1 text-zinc-500 hover:text-cyan-400 transition-colors duration-300"
            whileTap={{ scale: 0.95 }}
          >
            <item.icon size={22} strokeWidth={1.5} />
            <span className="text-[10px] font-medium tracking-wide">{item.label}</span>
          </motion.a>
        ))}
      </div>
    </motion.nav>
  );
};

export default MobileNav;

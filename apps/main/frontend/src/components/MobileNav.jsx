import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Box, FileText, Network, Home, Phone } from 'lucide-react';

export const MobileNav = () => {
  const navItems = [
    { label: 'Home', href: '/', icon: Home, isLink: true },
    { label: 'Hub', href: '/#hub', icon: Box, isLink: false },
    { label: 'Blog', href: 'https://blog.adsgupta.com', icon: FileText, isExternal: true },
    { label: 'Contact', href: '/contact', icon: Phone, isLink: true },
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
        {navItems.map((item) =>
          item.isExternal ? (
            <a
              key={item.label}
              href={item.href}
              target="_blank"
              rel="noopener noreferrer"
              data-testid={`mobile-nav-${item.label.toLowerCase().replace(' ', '-')}`}
              className="flex flex-col items-center gap-1 text-zinc-500 hover:text-cyan-400 transition-colors duration-300"
            >
              <item.icon size={22} strokeWidth={1.5} />
              <span className="text-[10px] font-medium tracking-wide">{item.label}</span>
            </a>
          ) : item.isLink ? (
            <Link
              key={item.label}
              to={item.href}
              data-testid={`mobile-nav-${item.label.toLowerCase().replace(' ', '-')}`}
              className="flex flex-col items-center gap-1 text-zinc-500 hover:text-cyan-400 transition-colors duration-300"
            >
              <item.icon size={22} strokeWidth={1.5} />
              <span className="text-[10px] font-medium tracking-wide">{item.label}</span>
            </Link>
          ) : (
            <a
              key={item.label}
              href={item.href}
              data-testid={`mobile-nav-${item.label.toLowerCase().replace(' ', '-')}`}
              className="flex flex-col items-center gap-1 text-zinc-500 hover:text-cyan-400 transition-colors duration-300"
            >
              <item.icon size={22} strokeWidth={1.5} />
              <span className="text-[10px] font-medium tracking-wide">{item.label}</span>
            </a>
          )
        )}
      </div>
    </motion.nav>
  );
};

export default MobileNav;

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Menu, X } from 'lucide-react';

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <motion.header
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="fixed top-0 left-0 right-0 z-50 px-6 md:px-12 py-4 bg-[#121212]/90 backdrop-blur-xl border-b border-white/5"
    >
      <div className="max-w-[1200px] mx-auto flex items-center justify-between">
        <a
          href="https://adsgupta.com"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2"
        >
          <span className="text-xl md:text-2xl font-bold tracking-tight text-white font-sans">
            DemoAI <span className="text-cyan-400">by AdsGupta</span>
          </span>
          <span className="hidden md:inline-flex px-2 py-0.5 text-[9px] rounded bg-cyan-500/20 text-cyan-400 font-bold tracking-wider border border-cyan-500/30">
            LAB v3.2
          </span>
        </a>

        <nav className="hidden md:flex items-center gap-6">
          <a
            href="https://adsgupta.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-zinc-400 hover:text-white transition-colors text-sm font-medium"
          >
            AdsGupta
          </a>
          <a
            href="https://adsgupta.com/#hub"
            target="_blank"
            rel="noopener noreferrer"
            className="text-zinc-400 hover:text-white transition-colors text-sm font-medium"
          >
            Ecosystem
          </a>
          <a
            href="https://adsgupta.com/contact"
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 rounded-lg bg-cyan-500 text-black text-sm font-bold hover:bg-cyan-400 transition-colors"
          >
            Contact
          </a>
        </nav>

        <button
          type="button"
          className="md:hidden text-white p-2"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {mobileOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="md:hidden mt-4 pb-4 border-t border-white/5 pt-4 flex flex-col gap-3"
        >
          <a href="https://adsgupta.com" target="_blank" rel="noopener noreferrer" className="text-zinc-400 hover:text-white text-sm">AdsGupta</a>
          <a href="https://adsgupta.com/#hub" target="_blank" rel="noopener noreferrer" className="text-zinc-400 hover:text-white text-sm">Ecosystem</a>
          <a href="https://adsgupta.com/contact" target="_blank" rel="noopener noreferrer" className="text-zinc-400 hover:text-white text-sm">Contact</a>
        </motion.div>
      )}
    </motion.header>
  );
}

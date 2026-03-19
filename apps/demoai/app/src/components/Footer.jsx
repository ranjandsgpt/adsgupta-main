import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Linkedin, Twitter } from 'lucide-react';

export function Footer() {
  const [email, setEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (email) {
      setIsSubscribed(true);
      setEmail('');
      setTimeout(() => setIsSubscribed(false), 3000);
    }
  };

  const footerLinks = [
    {
      title: 'Platform',
      links: [
        { label: 'AI Sandbox', href: 'https://demoai.adsgupta.com', external: true },
        { label: 'Features', href: 'https://adsgupta.com/#features', external: true },
        { label: 'Pricing', href: 'https://adsgupta.com/#', external: true },
      ],
    },
    {
      title: 'Resources',
      links: [
        { label: 'Blog', href: 'https://adsgupta.com/blog', external: true },
        { label: 'Documentation', href: 'https://adsgupta.com/#', external: true },
        { label: 'API', href: 'https://adsgupta.com/#', external: true },
      ],
    },
    {
      title: 'Company',
      links: [
        { label: 'About', href: 'https://adsgupta.com/aboutme', external: true },
        { label: 'Contact', href: 'https://adsgupta.com/contact', external: true },
        { label: 'Careers', href: 'https://adsgupta.com/#', external: true },
      ],
    },
    {
      title: 'Legal',
      links: [
        { label: 'Privacy Policy', href: 'https://adsgupta.com/privacy', external: true },
        { label: 'Terms of Service', href: 'https://adsgupta.com/terms', external: true },
      ],
    },
  ];

  return (
    <footer
      data-testid="footer-section"
      className="relative py-16 md:py-24 bg-[#0A0A0A] border-t border-white/5"
    >
      <div className="max-w-[1200px] mx-auto px-6 md:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 mb-16">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h3 className="text-3xl md:text-4xl font-bold text-white font-sans mb-4 tracking-tight">
              Stay Ahead of<br />the Curve
            </h3>
            <p className="text-zinc-400 text-lg mb-8 max-w-md">
              Get exclusive insights on AI advertising, delivered to your inbox.
            </p>
            <form onSubmit={handleSubmit} className="flex gap-3">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                data-testid="newsletter-input"
                className="newsletter-input flex-1 px-5 py-4 rounded-full text-white placeholder-zinc-500 font-medium"
                required
              />
              <motion.button
                type="submit"
                data-testid="newsletter-submit"
                className="glow-button w-14 h-14 rounded-full bg-cyan-500 text-black flex items-center justify-center hover:bg-cyan-400"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <ArrowRight size={20} />
              </motion.button>
            </form>
            {isSubscribed && (
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-cyan-400 mt-4 text-sm font-medium"
              >
                Thanks for subscribing! Check your inbox.
              </motion.p>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-8"
          >
            {footerLinks.map((group, index) => (
              <div key={index}>
                <h4 className="text-white font-semibold mb-4 text-sm tracking-wide">
                  {group.title}
                </h4>
                <ul className="space-y-3">
                  {group.links.map((link, linkIndex) => (
                    <li key={linkIndex}>
                      <a
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-zinc-500 hover:text-white transition-colors duration-300 text-sm"
                      >
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </motion.div>
        </div>

        <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-6">
            <a
              href="https://adsgupta.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-2xl font-bold text-white font-sans"
            >
              ADS<span className="text-cyan-400">GUPTA</span>
            </a>
            <span className="text-zinc-600 text-sm font-mono">
              DemoAI by AdsGupta © 2026
            </span>
          </div>
          <div className="flex items-center gap-4">
            <motion.a
              href="https://twitter.com/adsgupta"
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
              whileHover={{ y: -2 }}
            >
              <Twitter size={18} strokeWidth={1.5} />
            </motion.a>
            <motion.a
              href="https://linkedin.com/company/adsgupta"
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
              whileHover={{ y: -2 }}
            >
              <Linkedin size={18} strokeWidth={1.5} />
            </motion.a>
          </div>
        </div>
      </div>
    </footer>
  );
}

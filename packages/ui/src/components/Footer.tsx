import * as React from "react";
import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, Linkedin, Twitter } from "lucide-react";

export const Footer = () => {
  const [email, setEmail] = useState("");
  const [isSubscribed, setIsSubscribed] = useState(false);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (email) {
      setIsSubscribed(true);
      setEmail("");
      setTimeout(() => setIsSubscribed(false), 3000);
    }
  };

  const footerLinks: Array<{
    title: string;
    links: Array<{ label: string; href: string; external?: boolean }>;
  }> = [
    {
      title: "Platform",
      links: [
        {
          label: "AI Sandbox",
          href: "https://demoai.adsgupta.com",
          external: true,
        },
        { label: "Features", href: "/#features" },
        { label: "Pricing", href: "#" },
      ],
    },
    {
      title: "Resources",
      links: [
        { label: "Blog", href: "/blog" },
        { label: "Documentation", href: "#" },
        { label: "API", href: "#" },
      ],
    },
    {
      title: "Company",
      links: [
        { label: "About", href: "/aboutme" },
        { label: "Contact", href: "/contact" },
        { label: "Careers", href: "#" },
      ],
    },
    {
      title: "Legal",
      links: [
        { label: "Privacy Policy", href: "/privacy" },
        { label: "Terms of Service", href: "/terms" },
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
          {/* Left: Newsletter */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h3 className="text-3xl md:text-4xl font-bold text-white font-['Space_Grotesk'] mb-4 tracking-tight">
              Stay Ahead of
              <br />
              the Curve
            </h3>
            <p className="text-zinc-400 text-lg mb-8 max-w-md">
              Get exclusive insights on AI advertising, delivered to your inbox.
            </p>

            <form
              onSubmit={handleSubmit}
              className="flex gap-3"
            >
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
                data-hoverable="true"
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

          {/* Right: Links */}
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
                      {link.external ? (
                        <a
                          href={link.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          data-hoverable="true"
                          className="text-zinc-500 hover:text-white transition-colors duration-300 text-sm"
                        >
                          {link.label}
                        </a>
                      ) : link.href.startsWith("/#") ? (
                        <a
                          href={link.href}
                          data-hoverable="true"
                          className="text-zinc-500 hover:text-white transition-colors duration-300 text-sm"
                        >
                          {link.label}
                        </a>
                      ) : (
                        <Link
                          to={link.href}
                          data-hoverable="true"
                          className="text-zinc-500 hover:text-white transition-colors duration-300 text-sm"
                        >
                          {link.label}
                        </Link>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-6">
            <Link
              to="/"
              className="text-2xl font-bold text-white font-['Space_Grotesk']"
            >
              ADS
              <span className="text-cyan-400">GUPTA</span>
            </Link>
            <span className="text-zinc-600 text-sm">
              © 2025 Ads Gupta. All rights reserved.
            </span>
          </div>

          <div className="flex items-center gap-4">
            <motion.a
              href="#"
              data-testid="social-twitter"
              data-hoverable="true"
              className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-white/10 transition-colors duration-300"
              whileHover={{ y: -2 }}
            >
              <Twitter size={18} strokeWidth={1.5} />
            </motion.a>
            <motion.a
              href="#"
              data-testid="social-linkedin"
              data-hoverable="true"
              className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-white/10 transition-colors duration-300"
              whileHover={{ y: -2 }}
            >
              <Linkedin size={18} strokeWidth={1.5} />
            </motion.a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;


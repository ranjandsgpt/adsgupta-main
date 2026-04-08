/* eslint-disable react/prop-types */
import React from "react";

export function Footer() {
  return (
    <footer
      data-testid="footer-section"
      className="relative py-16 md:py-24 bg-[#0A0A0A] border-t border-white/5"
    >
      <div className="max-w-[1200px] mx-auto px-6 md:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 mb-16">
          <div>
            <h3 className="text-3xl md:text-4xl font-bold text-white font-['Space_Grotesk'] mb-4 tracking-tight">
              Stay Ahead of
              <br />
              the Curve
            </h3>
            <p className="text-zinc-400 text-lg mb-8 max-w-md">
              Get exclusive insights on AI advertising, delivered to your inbox.
            </p>
            <form
              className="flex gap-3"
              onSubmit={(e) => {
                e.preventDefault();
              }}
              aria-label="Newsletter signup"
            >
              <input
                placeholder="Enter your email"
                data-testid="newsletter-input"
                className="newsletter-input flex-1 px-5 py-4 rounded-full text-white placeholder-zinc-500 font-medium"
                required
                type="email"
              />
              <button
                type="submit"
                data-testid="newsletter-submit"
                data-hoverable="true"
                className="glow-button w-14 h-14 rounded-full bg-cyan-500 text-black flex items-center justify-center hover:bg-cyan-400"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M5 12h14" />
                  <path d="m12 5 7 7-7 7" />
                </svg>
              </button>
            </form>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <h4 className="text-white font-semibold mb-4 text-sm tracking-wide">Platform</h4>
              <ul className="space-y-3">
                <li>
                  <a
                    href="https://demoai.adsgupta.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    data-hoverable="true"
                    className="text-zinc-500 hover:text-white transition-colors duration-300 text-sm"
                  >
                    AI Sandbox
                  </a>
                </li>
                <li>
                  <a
                    href="/#features"
                    data-hoverable="true"
                    className="text-zinc-500 hover:text-white transition-colors duration-300 text-sm"
                  >
                    Features
                  </a>
                </li>
                <li>
                  <a
                    href="/"
                    data-hoverable="true"
                    className="text-zinc-500 hover:text-white transition-colors duration-300 text-sm"
                  >
                    Pricing
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4 text-sm tracking-wide">Resources</h4>
              <ul className="space-y-3">
                <li>
                  <a
                    href="/blog"
                    data-hoverable="true"
                    className="text-zinc-500 hover:text-white transition-colors duration-300 text-sm"
                  >
                    Blog
                  </a>
                </li>
                <li>
                  <a
                    href="/"
                    data-hoverable="true"
                    className="text-zinc-500 hover:text-white transition-colors duration-300 text-sm"
                  >
                    Documentation
                  </a>
                </li>
                <li>
                  <a
                    href="/"
                    data-hoverable="true"
                    className="text-zinc-500 hover:text-white transition-colors duration-300 text-sm"
                  >
                    API
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4 text-sm tracking-wide">Company</h4>
              <ul className="space-y-3">
                <li>
                  <a
                    href="/aboutme"
                    data-hoverable="true"
                    className="text-zinc-500 hover:text-white transition-colors duration-300 text-sm"
                  >
                    About
                  </a>
                </li>
                <li>
                  <a
                    href="/contact"
                    data-hoverable="true"
                    className="text-zinc-500 hover:text-white transition-colors duration-300 text-sm"
                  >
                    Contact
                  </a>
                </li>
                <li>
                  <a
                    href="/"
                    data-hoverable="true"
                    className="text-zinc-500 hover:text-white transition-colors duration-300 text-sm"
                  >
                    Careers
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4 text-sm tracking-wide">Legal</h4>
              <ul className="space-y-3">
                <li>
                  <a
                    href="/privacy"
                    data-hoverable="true"
                    className="text-zinc-500 hover:text-white transition-colors duration-300 text-sm"
                  >
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a
                    href="/terms"
                    data-hoverable="true"
                    className="text-zinc-500 hover:text-white transition-colors duration-300 text-sm"
                  >
                    Terms of Service
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-6">
            <a
              className="text-2xl font-bold text-white font-['Space_Grotesk']"
              href="/"
            >
              ADS<span className="text-cyan-400">GUPTA</span>
            </a>
            <span className="text-zinc-600 text-sm">
              © {new Date().getFullYear()} Ads Gupta. All rights reserved.
            </span>
          </div>

          <div className="flex items-center gap-4">
            <a
              href="#"
              data-testid="social-twitter"
              data-hoverable="true"
              className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-white/10 transition-colors duration-300"
              aria-label="Twitter"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
              </svg>
            </a>
            <a
              href="#"
              data-testid="social-linkedin"
              data-hoverable="true"
              className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-white/10 transition-colors duration-300"
              aria-label="LinkedIn"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                <rect width="4" height="12" x="2" y="9" />
                <circle cx="4" cy="4" r="2" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;


"use client";

import * as React from "react";
import { useState } from "react";
import "./Footer.css";

export type FooterProps = {
  /** When set, POSTs JSON `{ email, source }` to this URL (e.g. `/api/subscribe`). */
  subscribeEndpoint?: string;
  subscribeSource?: string;
};

/**
 * Master footer — matches apps/ranjan/footer.js (layout, links, #0A0A0A background).
 * Uses plain <a href> so it works in Next.js and CRA without a router import.
 */
export function Footer({ subscribeEndpoint, subscribeSource = "footer" }: FooterProps) {
  const [email, setEmail] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const [busy, setBusy] = useState(false);
  const [formError, setFormError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!email.trim()) return;
    setFormError("");

    if (subscribeEndpoint) {
      setBusy(true);
      try {
        const res = await fetch(subscribeEndpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: email.trim(), source: subscribeSource }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error((data as { error?: string }).error || "Subscribe failed");
        setShowSuccess(true);
        setEmail("");
        window.setTimeout(() => setShowSuccess(false), 4000);
      } catch (err) {
        setFormError(err instanceof Error ? err.message : "Subscribe failed");
      } finally {
        setBusy(false);
      }
      return;
    }

    setShowSuccess(true);
    setEmail("");
    window.setTimeout(() => setShowSuccess(false), 4000);
  }

  return (
    <footer
      className="adsg-footer"
      data-testid="footer-section"
      role="contentinfo"
    >
      <div className="adsg-footer__container">
        <div className="adsg-footer__main">
          <div className="adsg-footer__left">
            <h3 className="adsg-footer__title">
              Stay Ahead of
              <br />
              the Curve
            </h3>

            <p className="adsg-footer__subtitle">
              Get exclusive insights on AI advertising, delivered to your inbox.
            </p>

            <form
              className="adsg-footer__form"
              data-testid="newsletter-form"
              aria-label="Newsletter signup"
              onSubmit={handleSubmit}
            >
              <input
                placeholder="Enter your email"
                data-testid="newsletter-input"
                className="adsg-footer__input"
                required
                type="email"
                aria-label="Email for newsletter"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <button
                type="submit"
                disabled={busy}
                data-testid="newsletter-submit"
                className="adsg-footer__submit"
                aria-label="Subscribe"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#000000"
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

            {formError ? (
              <p className="adsg-footer__subtitle" style={{ color: "#f87171", marginTop: "0.5rem" }}>
                {formError}
              </p>
            ) : null}

            <div
              className={
                "adsg-footer__success" +
                (showSuccess ? " adsg-footer__success--visible" : "")
              }
              role="status"
              aria-live="polite"
              aria-atomic="true"
            >
              Thanks! You are subscribed.
            </div>
          </div>

          <div className="adsg-footer__right" aria-label="Footer navigation">
            <div className="adsg-footer__grid">
              <div className="adsg-footer__col">
                <h4 className="adsg-footer__heading">Platform</h4>
                <ul className="adsg-footer__list">
                  <li>
                    <a
                      href="https://demoai.adsgupta.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="adsg-footer__link"
                    >
                      AI Sandbox
                    </a>
                  </li>
                  <li>
                    <a
                      href="https://adsgupta.com/#features"
                      className="adsg-footer__link"
                    >
                      Features
                    </a>
                  </li>
                  <li>
                    <a href="https://adsgupta.com/" className="adsg-footer__link">
                      Pricing
                    </a>
                  </li>
                </ul>
              </div>

              <div className="adsg-footer__col">
                <h4 className="adsg-footer__heading">Resources</h4>
                <ul className="adsg-footer__list">
                  <li>
                    <a href="/insights" className="adsg-footer__link">
                      Blog
                    </a>
                  </li>
                  <li>
                    <a href="https://adsgupta.com/" className="adsg-footer__link">
                      Documentation
                    </a>
                  </li>
                  <li>
                    <a href="https://adsgupta.com/" className="adsg-footer__link">
                      API
                    </a>
                  </li>
                </ul>
              </div>

              <div className="adsg-footer__col">
                <h4 className="adsg-footer__heading">Company</h4>
                <ul className="adsg-footer__list">
                  <li>
                    <a href="/about" className="adsg-footer__link">
                      About
                    </a>
                  </li>
                  <li>
                    <a href="/contact" className="adsg-footer__link">
                      Contact
                    </a>
                  </li>
                  <li>
                    <a href="https://adsgupta.com/" className="adsg-footer__link">
                      Careers
                    </a>
                  </li>
                </ul>
              </div>

              <div className="adsg-footer__col">
                <h4 className="adsg-footer__heading">Legal</h4>
                <ul className="adsg-footer__list">
                  <li>
                    <a
                      href="https://adsgupta.com/privacy"
                      className="adsg-footer__link"
                    >
                      Privacy Policy
                    </a>
                  </li>
                  <li>
                    <a
                      href="https://adsgupta.com/terms"
                      className="adsg-footer__link"
                    >
                      Terms of Service
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div className="adsg-footer__bottom">
          <div className="adsg-footer__brand">
            <a
              className="adsg-footer__brand-link"
              href="https://adsgupta.com"
              aria-label="ADS Gupta"
            >
              ADS<span className="adsg-footer__brand-accent">GUPTA</span>
            </a>
            <span className="adsg-footer__copyright">
              © {new Date().getFullYear()} Ads Gupta. All rights reserved.
            </span>
          </div>

          <div className="adsg-footer__social" aria-label="Social links">
            <a
              href="https://twitter.com/adsgupta"
              target="_blank"
              rel="noopener noreferrer"
              data-testid="social-twitter"
              className="adsg-footer__icon"
              aria-label="Twitter"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
              </svg>
            </a>

            <a
              href="https://linkedin.com/company/adsgupta"
              target="_blank"
              rel="noopener noreferrer"
              data-testid="social-linkedin"
              className="adsg-footer__icon"
              aria-label="LinkedIn"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                <rect width="4" height="12" x="2" y="9" fill="none" />
                <circle cx="4" cy="4" r="2" fill="none" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;

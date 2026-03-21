"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "adsgupta_newsletter_emails";

export default function Newsletter() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setSubmitted(true);
      }
    } catch {
      // ignore storage errors
    }
  }, []);

  function handleSubmit(e) {
    e.preventDefault();
    if (!email) return;

    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      const list = stored ? JSON.parse(stored) : [];
      if (!list.includes(email)) {
        list.push(email);
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
      }
    } catch {
      // ignore storage errors
    }

    setSubmitted(true);
  }

  return (
    <section className="newsletter-block">
      <div className="newsletter-inner">
        <p className="hero-kicker">Signal Feed</p>
        <h2 className="newsletter-title">Stay ahead of the ad auctions.</h2>
        <p className="newsletter-description">
          Subscribe for field reports on programmatic infrastructure, neural
          targeting, and marketplace strategy — straight from the AdsGupta
          team.
        </p>
        {submitted ? (
          <p className="newsletter-confirmation">
            You&apos;re in. Watch your inbox for the next drop.
          </p>
        ) : (
          <form className="newsletter-form" onSubmit={handleSubmit}>
            <input
              type="email"
              name="email"
              autoComplete="email"
              required
              placeholder="you@brand.com"
              className="newsletter-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <button type="submit" className="newsletter-button">
              Subscribe
            </button>
          </form>
        )}
      </div>
    </section>
  );
}


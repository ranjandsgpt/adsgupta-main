"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "adsgupta_newsletter_home";

export default function HomeNewsletter() {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored) setSubmitted(true);
    } catch {
      /* ignore */
    }
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!email) return;

    try {
      await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, source: "homepage", role }),
      });
    } catch {
      /* still show success for UX */
    }

    try {
      window.localStorage.setItem(STORAGE_KEY, "1");
    } catch {
      /* ignore */
    }
    setSubmitted(true);
  }

  return (
    <section className="pub-newsletter" id="newsletter">
      <div className="pub-newsletter__grid">
        <div className="pub-newsletter__left">
          <h2 className="pub-newsletter__headline">Operator-grade intel. Weekly.</h2>
        </div>
        <div className="pub-newsletter__right">
          {submitted ? (
            <p className="pub-newsletter__ok">You&apos;re subscribed. Watch your inbox.</p>
          ) : (
            <form className="pub-newsletter__form" onSubmit={handleSubmit}>
              <input
                type="email"
                name="email"
                autoComplete="email"
                required
                placeholder="Work email"
                className="pub-newsletter__input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <input
                type="text"
                name="role"
                autoComplete="organization-title"
                placeholder="Role (optional)"
                className="pub-newsletter__input"
                value={role}
                onChange={(e) => setRole(e.target.value)}
              />
              <button type="submit" className="pub-newsletter__submit">
                Subscribe
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}

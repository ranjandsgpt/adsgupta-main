"use client";

import { CookieConsentBanner } from "@/components/cookie-consent-banner";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { Barlow_Condensed } from "next/font/google";

type PublicStats = {
  auctionsToday: number;
  activePublishers: number;
  activeCampaigns: number;
  avgCpmLast7d: number;
};

const barlow900 = Barlow_Condensed({ subsets: ["latin"], weight: ["900"] });

const structuredData = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "MDE Exchange",
  applicationCategory: "BusinessApplication",
  description: "Real-time OpenRTB 2.6 ad exchange for publishers and advertisers",
  url: "https://exchange.adsgupta.com",
  author: { "@type": "Person", name: "Ranjan Dasgupta", url: "https://ranjan.adsgupta.com" },
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
    description: "Free to register. Revenue share model."
  }
};

function formatMoney(n: number) {
  if (!Number.isFinite(n)) return "$0";
  return `$${n.toFixed(2)}`;
}

function useAnimatedNumber(target: number, opts?: { durationMs?: number; format?: (n: number) => string }) {
  const durationMs = opts?.durationMs ?? 900;
  const format = opts?.format ?? ((n: number) => String(n));
  const [display, setDisplay] = useState(() => target);
  const rafRef = useRef<number | null>(null);
  const fromRef = useRef<number>(target);
  const toRef = useRef<number>(target);

  useEffect(() => {
    if (!Number.isFinite(target)) return;
    fromRef.current = display;
    toRef.current = target;
    const start = performance.now();
    const step = (now: number) => {
      const t = Math.min(1, (now - start) / durationMs);
      const eased = 1 - Math.pow(1 - t, 3);
      const next = fromRef.current + (toRef.current - fromRef.current) * eased;
      setDisplay(next);
      if (t < 1) {
        rafRef.current = requestAnimationFrame(step);
      }
    };

    rafRef.current = requestAnimationFrame(step);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target, durationMs]);

  return useMemo(() => format(display), [display, format]);
}

function LiveStatBar({ stats }: { stats: PublicStats | null }) {
  const auctionsText = useAnimatedNumber(stats?.auctionsToday ?? 0, { format: (n) => Math.round(n).toLocaleString() });
  const pubsText = useAnimatedNumber(stats?.activePublishers ?? 0, { format: (n) => Math.round(n).toLocaleString() });
  const cpmText = useAnimatedNumber(stats?.avgCpmLast7d ?? 0, { format: (n) => formatMoney(n) });

  return (
    <div
      style={{
        marginTop: 22,
        display: "flex",
        flexWrap: "wrap",
        gap: 10,
        alignItems: "center",
        justifyContent: "center"
      }}
    >
      <div className="portal-card" style={{ padding: "10px 14px", borderColor: "#00d4aa55", minWidth: 260 }}>
        <div style={{ fontSize: 10, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
          Live exchange stats
        </div>
        <div style={{ fontSize: 13, fontWeight: 800, color: "var(--text-bright)", marginTop: 4, lineHeight: 1.4 }}>
          {auctionsText} auctions today · {pubsText} active publishers · {cpmText} average CPM
        </div>
      </div>
    </div>
  );
}

function StepsColumn({
  title,
  steps
}: {
  title: string;
  steps: Array<{ icon: string; label: string; desc: string }>;
}) {
  return (
    <div>
      <div style={{ fontSize: 12, fontWeight: 900, color: "#00d4aa", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 10 }}>
        {title}
      </div>
      <div style={{ display: "grid", gap: 12 }}>
        {steps.map((s, idx) => (
          <div
            key={s.label}
            style={{
              border: "1px solid var(--border)",
              borderRadius: 10,
              padding: 14,
              background: "rgba(15,20,25,0.65)"
            }}
          >
            <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
              <div
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 10,
                  background: idx === 0 ? "#00d4aa18" : idx === 1 ? "#4a9eff18" : "#2ecc7118",
                  border: idx === 0 ? "1px solid #00d4aa55" : "1px solid var(--border)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 16
                }}
              >
                {s.icon}
              </div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 900, color: "var(--text-bright)" }}>{idx + 1}. {s.label}</div>
                <div style={{ fontSize: 12, color: "var(--text-muted)", lineHeight: 1.5, marginTop: 3 }}>{s.desc}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function ExchangeHomepage() {
  const [stats, setStats] = useState<PublicStats | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const r = await fetch("/api/public/stats", { cache: "no-store" });
        const j = (await r.json()) as PublicStats;
        if (!cancelled) setStats(j);
      } catch {
        if (!cancelled) setStats(null);
      }
    }

    void load();
    const id = setInterval(() => void load(), 30_000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, []);

  const auctionsText = useAnimatedNumber(stats?.auctionsToday ?? 0, {
    format: (n) => Math.round(n).toLocaleString()
  });
  const publishersText = useAnimatedNumber(stats?.activePublishers ?? 0, {
    format: (n) => Math.round(n).toLocaleString()
  });
  const campaignsText = useAnimatedNumber(stats?.activeCampaigns ?? 0, {
    format: (n) => Math.round(n).toLocaleString()
  });
  const avgCpmText = useAnimatedNumber(stats?.avgCpmLast7d ?? 0, {
    format: (n) => formatMoney(n)
  });

  return (
    <div style={{ minHeight: "100vh" }}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <div
        style={{
          backgroundColor: "#0a0e17",
          backgroundImage:
            "linear-gradient(to right, rgba(0,212,170,0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(0,212,170,0.05) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
          borderBottom: "1px solid rgba(26,35,50,0.6)"
        }}
      >
        <div className="portal-hub" style={{ paddingTop: 44, paddingBottom: 54 }}>
          <CookieConsentBanner />

          <div style={{ maxWidth: 980, margin: "0 auto" }}>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 10,
                padding: "8px 12px",
                borderRadius: 999,
                border: "1px solid rgba(0,212,170,0.35)",
                background: "rgba(0,212,170,0.07)",
                marginBottom: 16
              }}
            >
              <span style={{ color: "#00d4aa", fontWeight: 900 }}>MDE Exchange</span>
              <span style={{ color: "var(--text-muted)", fontSize: 12 }}>OpenRTB 2.6 · second-price · sub-100ms</span>
            </div>

            <h1
              style={{
                margin: 0,
                color: "var(--text-bright)",
                fontSize: "clamp(2.4rem, 4.2vw, 3.6rem)",
                letterSpacing: "-0.02em",
                lineHeight: 1.06,
                fontFamily: `${barlow900.style.fontFamily}, "JetBrains Mono", ui-monospace, monospace`,
                fontWeight: 900
              }}
            >
              The Ad Exchange Built for the Programmatic Era
            </h1>
            <p style={{ margin: "14px 0 0", color: "var(--text-muted)", fontSize: 15, lineHeight: 1.6, maxWidth: 760 }}>
              Real OpenRTB 2.6 auctions. Sub-100ms clearing. Second-price fairness. Built by the team behind $200M+ in programmatic revenue.
            </p>

            <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 22, alignItems: "center" }}>
              <Link
                href="/publisher/register"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "12px 18px",
                  borderRadius: 10,
                  background: "#00d4aa",
                  color: "#071018",
                  fontWeight: 900,
                  textDecoration: "none",
                  border: "1px solid #00d4aa55",
                  boxShadow: "0 10px 32px rgba(0,212,170,0.18)"
                }}
              >
                Start Monetizing →
              </Link>
              <Link
                href="/demand/create"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "12px 18px",
                  borderRadius: 10,
                  background: "transparent",
                  color: "#00d4aa",
                  fontWeight: 900,
                  textDecoration: "none",
                  border: "1px solid #00d4aa66"
                }}
              >
                Start Advertising →
              </Link>
            </div>

            <LiveStatBar stats={stats} />
          </div>
        </div>
      </div>

      <div className="portal-hub" style={{ paddingTop: 46, paddingBottom: 12 }}>
        <section style={{ marginBottom: 34 }}>
          <div style={{ display: "flex", gap: 12, alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap" }}>
            <div>
              <div style={{ color: "#00d4aa", fontWeight: 900, letterSpacing: "0.06em", textTransform: "uppercase", fontSize: 12 }}>
                How it works
              </div>
              <div style={{ color: "var(--text-bright)", fontWeight: 900, fontSize: 20, marginTop: 6 }}>
                Two flows. One exchange.
              </div>
            </div>
            <div style={{ color: "var(--text-muted)", fontSize: 12, maxWidth: 420, lineHeight: 1.6 }}>
              Built for real-time programmatic. Fast clearing, fair pricing, and transparent settlement data.
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(320px,1fr))", gap: 18, marginTop: 18 }}>
            <StepsColumn
              title="Publisher"
              steps={[
                { icon: "▦", label: "Register", desc: "Create your account and get ready for OpenRTB integration." },
                { icon: "🏷️", label: "Get Tag", desc: "Generate and embed the MDE tag on your pages." },
                { icon: "💰", label: "Earn", desc: "Your inventory competes in auctions—clearing in under 100ms." }
              ]}
            />
            <StepsColumn
              title="Advertiser"
              steps={[
                { icon: "⚡", label: "Create Campaign", desc: "Set bid, budget, targeting, and ad sizes." },
                { icon: "🎨", label: "Upload Creative", desc: "Add your images (JPG/PNG/WebP) and landing click URL." },
                { icon: "🚀", label: "Go Live", desc: "Activation happens automatically after review by the exchange." }
              ]}
            />
          </div>
        </section>

        <section style={{ marginBottom: 34 }}>
          <div style={{ color: "var(--text-bright)", fontWeight: 900, fontSize: 20, marginBottom: 12 }}>
            Features that win bids
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 12 }}>
            {[
              { title: "OpenRTB 2.6", icon: "⟐", desc: "Industry-standard bid protocol compatible with programmatic stacks." },
              { title: "Second-Price Auctions", icon: "≋", desc: "Fair market clearing with second-price mechanics." },
              { title: "<100ms Latency", icon: "⚡", desc: "Sub-100ms clearing for real-time responsiveness." },
              { title: "No Ads.txt Required", icon: "✓", desc: "Start immediately—ads.txt isn’t a hard gate for launch." },
              { title: "Real-time Analytics", icon: "◧", desc: "Live auction telemetry and performance reporting." },
              { title: "Self-Serve", icon: "⚙", desc: "No sales team required. Instant activation for approved seats." }
            ].map((f) => (
              <div key={f.title} className="card" style={{ padding: 16 }}>
                <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 12,
                      background: "#00d4aa12",
                      border: "1px solid #00d4aa55",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 16,
                      flexShrink: 0
                    }}
                  >
                    {f.icon}
                  </div>
                  <div>
                    <div style={{ color: "var(--text-bright)", fontWeight: 900, fontSize: 14 }}>{f.title}</div>
                    <div style={{ color: "var(--text-muted)", fontSize: 12, marginTop: 6, lineHeight: 1.6 }}>{f.desc}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section style={{ marginBottom: 34 }}>
          <div style={{ color: "var(--text-bright)", fontWeight: 900, fontSize: 20, marginBottom: 12 }}>
            Live exchange stats
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 12 }}>
            {[
              { k: "Total auctions processed", v: auctionsText },
              { k: "Active publishers", v: publishersText },
              { k: "Active campaigns", v: campaignsText },
              { k: "Average eCPM", v: avgCpmText }
            ].map((x) => (
              <div key={x.k} className="portal-card" style={{ padding: 16, borderColor: "#00d4aa33" }}>
                <div style={{ color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", fontSize: 10 }}>
                  {x.k}
                </div>
                <div style={{ color: "#00d4aa", fontWeight: 900, fontSize: 26, marginTop: 8 }}>{x.v}</div>
              </div>
            ))}
          </div>
        </section>

        <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(320px,1fr))", gap: 14, marginBottom: 46 }}>
          <div
            className="portal-card"
            style={{
              padding: 18,
              borderColor: "#2ecc71",
              background: "linear-gradient(145deg, rgba(46,204,113,0.08), transparent)"
            }}
          >
            <div style={{ fontSize: 12, color: "#2ecc71", fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.06em" }}>
              Publisher
            </div>
            <div style={{ marginTop: 8, color: "var(--text-bright)", fontWeight: 900, fontSize: 22 }}>
              Ready to monetize?
            </div>
            <div style={{ marginTop: 10, color: "var(--text-muted)", fontSize: 12, lineHeight: 1.6 }}>
              Takes 2 minutes to register. No ads.txt required to start.
            </div>
            <div style={{ marginTop: 16 }}>
              <Link
                href="/publisher/register"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "12px 16px",
                  borderRadius: 10,
                  background: "#2ecc71",
                  border: "1px solid rgba(46,204,113,0.5)",
                  color: "#071018",
                  fontWeight: 900,
                  textDecoration: "none"
                }}
              >
                Register as Publisher →
              </Link>
            </div>
          </div>

          <div
            className="portal-card"
            style={{
              padding: 18,
              borderColor: "#00d4aa",
              background: "linear-gradient(145deg, rgba(0,212,170,0.10), transparent)"
            }}
          >
            <div style={{ fontSize: 12, color: "#00d4aa", fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.06em" }}>
              Advertiser
            </div>
            <div style={{ marginTop: 8, color: "var(--text-bright)", fontWeight: 900, fontSize: 22 }}>
              Ready to advertise?
            </div>
            <div style={{ marginTop: 10, color: "var(--text-muted)", fontSize: 12, lineHeight: 1.6 }}>
              Upload your creative and go live in minutes.
            </div>
            <div style={{ marginTop: 16 }}>
              <Link
                href="/demand/create"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "12px 16px",
                  borderRadius: 10,
                  background: "#00d4aa",
                  border: "1px solid rgba(0,212,170,0.5)",
                  color: "#071018",
                  fontWeight: 900,
                  textDecoration: "none"
                }}
              >
                Create Campaign →
              </Link>
            </div>
          </div>
        </section>

        <footer style={{ paddingBottom: 34, color: "var(--text-muted)", fontSize: 12 }}>
          <div style={{ display: "flex", gap: 16, flexWrap: "wrap", alignItems: "center", justifyContent: "center", marginBottom: 10 }}>
            <Link href="/privacy" style={{ color: "var(--text-muted)" }}>Privacy Policy</Link>
            <a href="https://adsgupta.com/terms" style={{ color: "var(--text-muted)" }}>Terms</a>
            <Link href="/docs" style={{ color: "var(--text-muted)" }}>Documentation</Link>
            <Link href="/status" style={{ color: "var(--text-muted)" }}>Status</Link>
            <a href="mailto:hello@adsgupta.com" style={{ color: "var(--text-muted)" }}>Contact</a>
          </div>
          <div style={{ textAlign: "center" }}>© 2026 MDE Exchange — exchange.adsgupta.com</div>
        </footer>
      </div>
    </div>
  );
}

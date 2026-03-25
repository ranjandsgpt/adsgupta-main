"use client";

import { CookieConsentBanner } from "@/components/cookie-consent-banner";
import Link from "next/link";
import { useMemo, useState } from "react";

const ECPM_TABLE: Record<string, Record<string, number>> = {
  usa: {
    finance: 8.5,
    technology: 6.2,
    news: 3.8,
    sports: 4.2,
    entertainment: 4.0,
    shopping: 5.0,
    travel: 4.6,
    other: 4.5,
    default: 4.5
  },
  uk: { finance: 7.2, technology: 5.4, news: 3.2, other: 3.8, default: 3.8 },
  india: { technology: 1.8, finance: 2.1, news: 0.9, other: 1.2, default: 1.2 },
  europe: { finance: 5.5, technology: 4.2, other: 3.2, default: 3.2 },
  sea: { other: 1.5, default: 1.5 },
  global: { other: 2.8, default: 2.8 }
};

const FILL_RATE = 0.65;
const AD_VIEWABILITY = 0.6;

function logSliderToPV(v: number): number {
  const min = Math.log(10_000);
  const max = Math.log(100_000_000);
  return Math.round(Math.exp(min + (v / 100) * (max - min)));
}

function estimate(monthlyPV: number, adsPerPage: number, geo: string, category: string) {
  const g = ECPM_TABLE[geo] ?? ECPM_TABLE.global;
  const ecpm = g[category] ?? g.default ?? 2.5;
  const monthlyImpressions = monthlyPV * adsPerPage * FILL_RATE * AD_VIEWABILITY;
  const monthlyRevenue = (monthlyImpressions / 1000) * ecpm;
  return { monthlyRevenue, monthlyImpressions, ecpm, fillRate: FILL_RATE };
}

export default function PublisherEstimatePage() {
  const [slider, setSlider] = useState(50);
  const [adsPerPage, setAdsPerPage] = useState(2);
  const [geo, setGeo] = useState("usa");
  const [category, setCategory] = useState("technology");

  const monthlyPV = useMemo(() => logSliderToPV(slider), [slider]);
  const result = useMemo(
    () => estimate(monthlyPV, adsPerPage, geo, category),
    [monthlyPV, adsPerPage, geo, category]
  );

  const low = result.monthlyRevenue * 0.7;
  const high = result.monthlyRevenue * 1.3;

  return (
    <div style={{ maxWidth: 640, margin: "0 auto", padding: 24 }}>
      <CookieConsentBanner />
      <h1 style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 22, color: "var(--text-bright)", marginBottom: 8 }}>
        How much can you earn with MDE Exchange?
      </h1>
      <p style={{ color: "var(--text-muted)", fontSize: 13, marginBottom: 28 }}>
        Adjust the inputs — estimates update live. No account required.
      </p>

      <div className="card" style={{ marginBottom: 16 }}>
        <label style={{ display: "block", fontSize: 11, color: "var(--text-muted)", marginBottom: 8 }}>
          Monthly page views: {monthlyPV.toLocaleString()}
        </label>
        <input
          type="range"
          min={0}
          max={100}
          value={slider}
          onChange={(e) => setSlider(Number(e.target.value))}
          style={{ width: "100%" }}
        />
      </div>

      <div className="card" style={{ marginBottom: 16 }}>
        <label style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 8, display: "block" }}>
          Ad units per page
        </label>
        <select
          value={adsPerPage}
          onChange={(e) => setAdsPerPage(Number(e.target.value))}
          style={{ width: "100%", padding: 8 }}
        >
          {[1, 2, 3, 4, 5].map((n) => (
            <option key={n} value={n}>
              {n}
            </option>
          ))}
        </select>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
        <div className="card">
          <label style={{ fontSize: 11, color: "var(--text-muted)", display: "block", marginBottom: 8 }}>
            Primary geography
          </label>
          <select value={geo} onChange={(e) => setGeo(e.target.value)} style={{ width: "100%", padding: 8 }}>
            <option value="india">India</option>
            <option value="usa">USA</option>
            <option value="uk">UK</option>
            <option value="europe">Europe</option>
            <option value="sea">Southeast Asia</option>
            <option value="global">Global mix</option>
          </select>
        </div>
        <div className="card">
          <label style={{ fontSize: 11, color: "var(--text-muted)", display: "block", marginBottom: 8 }}>
            Content category
          </label>
          <select value={category} onChange={(e) => setCategory(e.target.value)} style={{ width: "100%", padding: 8 }}>
            <option value="technology">Technology</option>
            <option value="news">News</option>
            <option value="entertainment">Entertainment</option>
            <option value="finance">Finance</option>
            <option value="sports">Sports</option>
            <option value="shopping">Shopping</option>
            <option value="travel">Travel</option>
            <option value="other">Other</option>
          </select>
        </div>
      </div>

      <div
        className="card"
        style={{
          borderColor: "#0066cc44",
          textAlign: "center",
          padding: "28px 20px"
        }}
      >
        <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 8 }}>Estimated monthly revenue (USD)</div>
        <div style={{ fontSize: 36, fontWeight: 800, color: "var(--accent)", fontFamily: "'JetBrains Mono', monospace" }}>
          ${result.monthlyRevenue.toLocaleString(undefined, { maximumFractionDigits: 0 })}
        </div>
        <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 12 }}>
          Range ≈ ${low.toFixed(0)} – ${high.toFixed(0)} (±30%)
        </div>
        <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 16, lineHeight: 1.6 }}>
          ~{Math.round(result.monthlyImpressions).toLocaleString()} impressions/mo · eCPM ${result.ecpm.toFixed(2)} · Fill{" "}
          {(result.fillRate * 100).toFixed(0)}% (assumed) · Viewability {(AD_VIEWABILITY * 100).toFixed(0)}% (assumed)
        </div>
      </div>

      <p style={{ fontSize: 11, color: "var(--text-muted)", margin: "16px 0" }}>
        Estimates based on industry averages. Actual revenue depends on your audience and content.
      </p>

      <Link
        href="/publisher/register"
        className="portal-card"
        style={{ display: "block", textAlign: "center", padding: 16, textDecoration: "none", marginBottom: 12 }}
      >
        Start earning this month — Register as a publisher →
      </Link>
    </div>
  );
}

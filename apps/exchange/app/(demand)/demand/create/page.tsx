"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

export default function DemandCreatePage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [campaignName, setCampaignName] = useState("");
  const [advertiser, setAdvertiser] = useState("");
  const [bidPrice, setBidPrice] = useState("2.50");
  const [dailyBudget, setDailyBudget] = useState("100");
  const [contactEmail, setContactEmail] = useState("");
  const [campaignId, setCampaignId] = useState<string | null>(null);
  const [clickUrl, setClickUrl] = useState("https://");
  const [creativeName, setCreativeName] = useState("banner");
  const [file, setFile] = useState<File | null>(null);
  const [creative, setCreative] = useState<Record<string, unknown> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submitStep1(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: campaignName,
          advertiser,
          bid_price: Number(bidPrice),
          daily_budget: dailyBudget ? Number(dailyBudget) : null,
          contact_email: contactEmail
        })
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Failed to create campaign");
        setLoading(false);
        return;
      }
      setCampaignId(data.id);
      setStep(2);
    } catch {
      setError("Network error");
    }
    setLoading(false);
  }

  async function submitStep2(e: FormEvent) {
    e.preventDefault();
    if (!campaignId || !file) {
      setError("Please choose a JPG or PNG image.");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append("campaign_id", campaignId);
      fd.append("name", creativeName);
      fd.append("type", "image");
      fd.append("click_url", clickUrl);
      fd.append("file", file);
      const res = await fetch("/api/creatives", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Upload failed");
        setLoading(false);
        return;
      }
      setCreative(data);
      setStep(3);
    } catch {
      setError("Network error");
    }
    setLoading(false);
  }

  return (
    <div style={{ maxWidth: 520 }}>
      <h1 style={{ color: "var(--text-bright)", marginTop: 0 }}>Create demand</h1>
      <p style={{ fontSize: 12, color: "var(--text-muted)" }}>
        Step {step} of 3 · Campaign stays <strong>pending</strong> until an admin activates it.
      </p>

      {step === 1 && (
        <form onSubmit={submitStep1} className="card" style={{ marginTop: 16 }}>
          <label style={{ fontSize: 11, color: "var(--text-muted)" }}>Campaign name *</label>
          <input value={campaignName} onChange={(e) => setCampaignName(e.target.value)} required />
          <div style={{ height: 10 }} />
          <label style={{ fontSize: 11, color: "var(--text-muted)" }}>Advertiser name *</label>
          <input value={advertiser} onChange={(e) => setAdvertiser(e.target.value)} required />
          <div style={{ height: 10 }} />
          <label style={{ fontSize: 11, color: "var(--text-muted)" }}>Bid CPM (USD) *</label>
          <input
            type="number"
            step="0.0001"
            min="0"
            value={bidPrice}
            onChange={(e) => setBidPrice(e.target.value)}
            required
          />
          <div style={{ height: 10 }} />
          <label style={{ fontSize: 11, color: "var(--text-muted)" }}>Daily budget (USD)</label>
          <input
            type="number"
            step="0.01"
            min="0"
            value={dailyBudget}
            onChange={(e) => setDailyBudget(e.target.value)}
          />
          <div style={{ height: 10 }} />
          <label style={{ fontSize: 11, color: "var(--text-muted)" }}>Contact email *</label>
          <input
            type="email"
            value={contactEmail}
            onChange={(e) => setContactEmail(e.target.value)}
            required
          />
          {error && <p style={{ color: "#ff4757", fontSize: 12, marginTop: 10 }}>{error}</p>}
          <div style={{ height: 14 }} />
          <button type="submit" disabled={loading}>
            {loading ? "Saving…" : "Continue"}
          </button>
        </form>
      )}

      {step === 2 && campaignId && (
        <form onSubmit={submitStep2} className="card" style={{ marginTop: 16 }}>
          <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 8 }}>
            Campaign ID: <code style={{ color: "var(--accent)" }}>{campaignId}</code>
          </div>
          <label style={{ fontSize: 11, color: "var(--text-muted)" }}>Creative name *</label>
          <input value={creativeName} onChange={(e) => setCreativeName(e.target.value)} required />
          <div style={{ height: 10 }} />
          <label style={{ fontSize: 11, color: "var(--text-muted)" }}>Click URL *</label>
          <input value={clickUrl} onChange={(e) => setClickUrl(e.target.value)} required />
          <div style={{ height: 10 }} />
          <label style={{ fontSize: 11, color: "var(--text-muted)" }}>Image (JPG/PNG) *</label>
          <input
            type="file"
            accept="image/jpeg,image/png"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          />
          {error && <p style={{ color: "#ff4757", fontSize: 12, marginTop: 10 }}>{error}</p>}
          <div style={{ height: 14 }} />
          <button type="submit" disabled={loading}>
            {loading ? "Uploading…" : "Upload & continue"}
          </button>
        </form>
      )}

      {step === 3 && campaignId && creative && (
        <div className="card" style={{ marginTop: 16 }}>
          <h2 style={{ fontSize: 15, color: "var(--text-bright)", marginTop: 0 }}>You&apos;re registered</h2>
          <p style={{ fontSize: 12, color: "var(--text-muted)" }}>
            Campaign <code style={{ color: "var(--accent)" }}>{campaignId}</code> is pending activation.
          </p>
          {typeof creative.image_url === "string" && creative.image_url ? (
            <div style={{ marginTop: 12 }}>
              <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 6 }}>Preview</div>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={creative.image_url}
                alt="Creative"
                style={{ maxWidth: "100%", borderRadius: 6, border: "1px solid var(--border)" }}
              />
            </div>
          ) : null}
          <div style={{ marginTop: 16 }}>
            <button
              type="button"
              onClick={() =>
                router.push(`/demand/dashboard?email=${encodeURIComponent(contactEmail)}`)
              }
            >
              Open dashboard
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

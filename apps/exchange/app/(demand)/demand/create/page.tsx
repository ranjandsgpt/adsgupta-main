"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

const SIZE_OPTS = ["300x250", "728x90", "160x600", "320x50", "300x600"] as const;

export default function DemandCreatePage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [campaignName, setCampaignName] = useState("");
  const [advertiserName, setAdvertiserName] = useState("");
  const [advertiserEmail, setAdvertiserEmail] = useState("");
  const [bidPrice, setBidPrice] = useState("2.50");
  const [dailyBudget, setDailyBudget] = useState("100");
  const [sizesPick, setSizesPick] = useState<Record<string, boolean>>({
    "300x250": true,
    "728x90": false,
    "160x600": false,
    "320x50": false,
    "300x600": false
  });
  const [campaignId, setCampaignId] = useState<string | null>(null);
  const [clickUrl, setClickUrl] = useState("https://");
  const [creativeName, setCreativeName] = useState("banner");
  const [creativeSize, setCreativeSize] = useState("300x250");
  const [file, setFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [creative, setCreative] = useState<Record<string, unknown> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const targetSizes: string[] = SIZE_OPTS.filter((s) => sizesPick[s]);

  async function submitStep1(e: FormEvent) {
    e.preventDefault();
    if (targetSizes.length === 0) {
      setError("Pick at least one target size.");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          campaign_name: campaignName,
          advertiser_name: advertiserName,
          advertiser_email: advertiserEmail,
          bid_price: Number(bidPrice),
          daily_budget: dailyBudget ? Number(dailyBudget) : null,
          target_sizes: targetSizes
        })
      });
      const data = await res.json();
      if (!res.ok) {
        setError(typeof data.error === "string" ? data.error : "Failed to create campaign");
        setLoading(false);
        return;
      }
      setCampaignId(data.id as string);
      setCreativeSize(targetSizes[0] ?? "300x250");
      setStep(2);
    } catch {
      setError("Network error");
    }
    setLoading(false);
  }

  async function submitStep2(e: FormEvent) {
    e.preventDefault();
    if (!campaignId || !file) {
      setError("Please choose an image (max 2MB).");
      return;
    }
    if (!targetSizes.includes(creativeSize)) {
      setError("Creative size must match a selected campaign size.");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append("campaign_id", campaignId);
      fd.append("name", creativeName);
      fd.append("type", "banner");
      fd.append("size", creativeSize);
      fd.append("click_url", clickUrl);
      fd.append("file", file);
      const res = await fetch("/api/creatives", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) {
        setError(typeof data.error === "string" ? data.error : "Upload failed");
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
    <div style={{ maxWidth: 560 }}>
      <h1 style={{ color: "var(--text-bright)", marginTop: 0 }}>Create campaign</h1>
      <p style={{ fontSize: 12, color: "var(--text-muted)" }}>
        Step {step} of 3 · Stays <strong>pending</strong> until an admin activates.
      </p>

      {step === 1 && (
        <form onSubmit={submitStep1} className="card" style={{ marginTop: 16 }}>
          <label style={{ fontSize: 11, color: "var(--text-muted)" }}>Advertiser / company name *</label>
          <input value={advertiserName} onChange={(e) => setAdvertiserName(e.target.value)} required />
          <div style={{ height: 10 }} />
          <label style={{ fontSize: 11, color: "var(--text-muted)" }}>Contact email *</label>
          <input type="email" value={advertiserEmail} onChange={(e) => setAdvertiserEmail(e.target.value)} required />
          <div style={{ height: 10 }} />
          <label style={{ fontSize: 11, color: "var(--text-muted)" }}>Campaign name *</label>
          <input value={campaignName} onChange={(e) => setCampaignName(e.target.value)} required />
          <div style={{ height: 10 }} />
          <label style={{ fontSize: 11, color: "var(--text-muted)" }}>Bid price CPM ($) *</label>
          <input type="number" step="0.0001" min="0" value={bidPrice} onChange={(e) => setBidPrice(e.target.value)} required />
          <p style={{ fontSize: 11, color: "var(--text-muted)", margin: "6px 0 0" }}>
            You pay per 1,000 impressions. Higher bid = more wins.
          </p>
          <div style={{ height: 10 }} />
          <label style={{ fontSize: 11, color: "var(--text-muted)" }}>Daily budget ($)</label>
          <input type="number" step="0.01" min="0" value={dailyBudget} onChange={(e) => setDailyBudget(e.target.value)} />
          <div style={{ height: 10 }} />
          <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 6 }}>Target sizes *</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {SIZE_OPTS.map((s) => (
              <label key={s} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, cursor: "pointer" }}>
                <input
                  type="checkbox"
                  checked={sizesPick[s]}
                  onChange={(e) => setSizesPick((p) => ({ ...p, [s]: e.target.checked }))}
                />
                {s}
              </label>
            ))}
          </div>
          {error && <p style={{ color: "#ff4757", fontSize: 12, marginTop: 10 }}>{error}</p>}
          <div style={{ height: 14 }} />
          <button type="submit" disabled={loading}>
            {loading ? "Saving…" : "Continue →"}
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
          <label style={{ fontSize: 11, color: "var(--text-muted)" }}>Click destination URL *</label>
          <input value={clickUrl} onChange={(e) => setClickUrl(e.target.value)} required />
          <div style={{ height: 10 }} />
          <label style={{ fontSize: 11, color: "var(--text-muted)" }}>Creative size * (must match campaign)</label>
          <select value={creativeSize} onChange={(e) => setCreativeSize(e.target.value)}>
            {targetSizes.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <div style={{ height: 10 }} />
          <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 6 }}>Upload JPG / PNG / GIF / WebP (max 2MB)</div>
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragOver(false);
              const f = e.dataTransfer.files?.[0];
              if (f) setFile(f);
            }}
            style={{
              border: `2px dashed ${dragOver ? "var(--accent)" : "var(--border)"}`,
              borderRadius: 8,
              padding: 24,
              textAlign: "center",
              fontSize: 12,
              color: "var(--text-muted)",
              marginBottom: 10
            }}
          >
            Drag &amp; drop here or pick a file
            <div style={{ height: 10 }} />
            <input
              type="file"
              accept="image/jpeg,image/png,image/gif,image/webp"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            />
          </div>
          {file && (
            <div style={{ fontSize: 11, color: "var(--accent)", marginBottom: 8 }}>Selected: {file.name}</div>
          )}
          {file && typeof window !== "undefined" && file.type.startsWith("image/") && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={URL.createObjectURL(file)} alt="Preview" style={{ maxWidth: "100%", maxHeight: 160, borderRadius: 6 }} />
          )}
          {error && <p style={{ color: "#ff4757", fontSize: 12, marginTop: 10 }}>{error}</p>}
          <div style={{ height: 14 }} />
          <button type="submit" disabled={loading}>
            {loading ? "Uploading…" : "Submit Creative →"}
          </button>
        </form>
      )}

      {step === 3 && campaignId && creative && (
        <div className="card" style={{ marginTop: 16, textAlign: "center" }}>
          <div style={{ fontSize: 42, color: "#2ecc71", marginBottom: 8 }}>✓</div>
          <h2 style={{ fontSize: 16, color: "var(--text-bright)", marginTop: 0 }}>You&apos;re registered</h2>
          <p style={{ fontSize: 12, color: "var(--text-muted)" }}>
            Campaign ID{" "}
            <code style={{ color: "var(--accent)", fontSize: 13 }}>{campaignId}</code>
          </p>
          <p style={{ fontSize: 12, color: "#ffd32a", fontWeight: 700 }}>Pending Activation</p>
          <p style={{ fontSize: 12, color: "var(--text-muted)", lineHeight: 1.5 }}>
            Your campaign is under review. We&apos;ll activate it within 24 hours. You&apos;ll see impressions once live.
          </p>
          {typeof creative.image_url === "string" && creative.image_url ? (
            <div style={{ marginTop: 12 }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={creative.image_url}
                alt="Creative"
                style={{ maxWidth: 280, borderRadius: 6, border: "1px solid var(--border)" }}
              />
            </div>
          ) : null}
          <div style={{ marginTop: 18 }}>
            <button type="button" onClick={() => router.push(`/demand/dashboard?email=${encodeURIComponent(advertiserEmail)}`)}>
              View Dashboard →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

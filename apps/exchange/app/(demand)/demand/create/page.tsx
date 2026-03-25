"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";

const STORAGE_CAMPAIGN = "demand_campaign_id";
const STORAGE_EMAIL = "demand_advertiser_email";

const SIZE_OPTS = [
  { id: "300x250", label: "300×250 (Recommended)" },
  { id: "728x90", label: "728×90" },
  { id: "160x600", label: "160×600" },
  { id: "320x50", label: "320×50" },
  { id: "300x600", label: "300×600" },
  { id: "970x250", label: "970×250" }
] as const;

const GEO_OPTS = [
  { code: "IN", label: "India (IN)" },
  { code: "US", label: "United States (US)" },
  { code: "GB", label: "United Kingdom (GB)" },
  { code: "AU", label: "Australia (AU)" },
  { code: "CA", label: "Canada (CA)" },
  { code: "SG", label: "Singapore (SG)" }
] as const;

const DEVICE_OPTS = [
  { id: "desktop", label: "Desktop" },
  { id: "mobile", label: "Mobile" },
  { id: "tablet", label: "Tablet" },
  { id: "ctv", label: "CTV" }
] as const;

const ENV_OPTS = [
  { id: "web", label: "Web" },
  { id: "app", label: "Mobile App" },
  { id: "ctv", label: "CTV" }
] as const;

type CreativeRow = {
  id: string;
  image_url: string | null;
  size: string;
  name: string;
  status: string;
};

function todayISO() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function readImageDims(f: File): Promise<{ w: number; h: number }> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(f);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve({ w: img.naturalWidth, h: img.naturalHeight });
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("decode"));
    };
    img.src = url;
  });
}

function uploadCreativeMultipart(
  fd: FormData,
  onProgress: (pct: number) => void
): Promise<{ ok: boolean; status: number; data: unknown }> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", "/api/creatives");
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) onProgress(Math.round((e.loaded / e.total) * 100));
    };
    xhr.onload = () => {
      let data: unknown = null;
      try {
        data = xhr.responseText ? JSON.parse(xhr.responseText) : null;
      } catch {
        data = { raw: xhr.responseText };
      }
      resolve({ ok: xhr.status >= 200 && xhr.status < 300, status: xhr.status, data });
    };
    xhr.onerror = () => reject(new Error("Network error"));
    xhr.send(fd);
  });
}

function DemandCreateInner() {
  const router = useRouter();
  const sp = useSearchParams();
  const addCreative = sp.get("add_creative") === "1";
  const qCamp = sp.get("campaign_id") ?? sp.get("campaignId");
  const qEmail = sp.get("email");

  const [step, setStep] = useState(1);
  const [campaignName, setCampaignName] = useState("");
  const [advertiserName, setAdvertiserName] = useState("");
  const [advertiserEmail, setAdvertiserEmail] = useState("");
  const [bidPrice, setBidPrice] = useState("2.50");
  const [dailyBudget, setDailyBudget] = useState("50");
  const [startDate, setStartDate] = useState(todayISO());
  const [endDate, setEndDate] = useState("");
  const [allCountries, setAllCountries] = useState(true);
  const [geoPick, setGeoPick] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(GEO_OPTS.map((g) => [g.code, false])) as Record<string, boolean>
  );
  const [sizesPick, setSizesPick] = useState<Record<string, boolean>>(() => ({
    "300x250": true,
    "728x90": false,
    "160x600": false,
    "320x50": false,
    "300x600": false,
    "970x250": false
  }));
  const [envPick, setEnvPick] = useState<Record<string, boolean>>({
    web: true,
    app: false,
    ctv: false
  });
  const [devicePick, setDevicePick] = useState<Record<string, boolean>>({
    desktop: true,
    mobile: true,
    tablet: false,
    ctv: false
  });

  const [campaignId, setCampaignId] = useState<string | null>(null);
  const [clickUrl, setClickUrl] = useState("https://");
  const [creativeName, setCreativeName] = useState("");
  const [pickedSize, setPickedSize] = useState("300x250");
  const [file, setFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [uploaded, setUploaded] = useState<CreativeRow[]>([]);
  const [fileDims, setFileDims] = useState<{ w: number; h: number } | null>(null);
  const [dimensionWarn, setDimensionWarn] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploadPct, setUploadPct] = useState(0);
  const [confirmPulse, setConfirmPulse] = useState(0);
  const [summaryCamp, setSummaryCamp] = useState<Record<string, unknown> | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const targetSizes = useMemo((): string[] => SIZE_OPTS.map((s) => s.id).filter((id) => sizesPick[id]), [sizesPick]);
  const targetEnvs = useMemo(() => ENV_OPTS.map((e) => e.id).filter((id) => envPick[id]), [envPick]);
  const targetDevices = useMemo(() => DEVICE_OPTS.map((d) => d.id).filter((id) => devicePick[id]), [devicePick]);
  const targetGeosBody = useMemo(() => {
    if (allCountries) return ["all"];
    return GEO_OPTS.map((g) => g.code).filter((c) => geoPick[c]);
  }, [allCountries, geoPick]);

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const sid = typeof window !== "undefined" ? sessionStorage.getItem(STORAGE_CAMPAIGN) : null;
    const em = typeof window !== "undefined" ? sessionStorage.getItem(STORAGE_EMAIL) : null;
    if (addCreative && qCamp && qEmail) {
      setCampaignId(qCamp);
      setAdvertiserEmail(qEmail);
      setStep(2);
      if (typeof window !== "undefined") {
        sessionStorage.setItem(STORAGE_CAMPAIGN, qCamp);
        sessionStorage.setItem(STORAGE_EMAIL, qEmail);
      }
      void fetch(`/api/campaigns/${qCamp}`)
        .then((r) => r.json())
        .then((c: Record<string, unknown>) => {
          const ts = c?.target_sizes as string[] | undefined;
          if (ts?.length) {
            setSizesPick((prev) => {
              const n = { ...prev };
              for (const k of Object.keys(n)) n[k] = ts.includes(k);
              return n;
            });
            setPickedSize(ts[0] ?? "300x250");
          }
          const nm = c?.campaign_name ?? c?.name;
          if (nm) setCampaignName(String(nm));
        })
        .catch(() => {});
      return;
    }
    if (sid && em && !addCreative) {
      setCampaignId(sid);
      setAdvertiserEmail(em);
    }
  }, [addCreative, qCamp, qEmail]);

  useEffect(() => {
    if (step !== 2 || !campaignId || !advertiserEmail) return;
    let cancelled = false;
    void fetch(
      `/api/creatives?campaign_id=${encodeURIComponent(campaignId)}&email=${encodeURIComponent(advertiserEmail)}`
    )
      .then((r) => r.json())
      .then((list) => {
        if (!cancelled && Array.isArray(list)) setUploaded(list as CreativeRow[]);
      });
    return () => {
      cancelled = true;
    };
  }, [step, campaignId, advertiserEmail]);

  useEffect(() => {
    if (!file) {
      setFileDims(null);
      setDimensionWarn(null);
      setPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    void readImageDims(file)
      .then(({ w, h }) => {
        setFileDims({ w, h });
        const tag = `${w}x${h}`;
        if (!targetSizes.includes(tag)) {
          setDimensionWarn(`Image size ${w}x${h} doesn't match your selected sizes. Ad may be distorted.`);
        } else {
          setDimensionWarn(null);
        }
      })
      .catch(() => {
        setFileDims(null);
        setDimensionWarn(null);
      });
    return () => {
      URL.revokeObjectURL(url);
    };
  }, [file, targetSizes]);

  useEffect(() => {
    if (step !== 3 || !campaignId || !advertiserEmail) return;
    let cancelled = false;
    void (async () => {
      try {
        const [cRes, crRes] = await Promise.all([
          fetch(`/api/campaigns/${campaignId}`),
          fetch(
            `/api/creatives?campaign_id=${encodeURIComponent(campaignId)}&email=${encodeURIComponent(advertiserEmail)}`
          )
        ]);
        const c = cRes.ok ? await cRes.json() : null;
        const cr = crRes.ok ? await crRes.json() : [];
        if (!cancelled) {
          setSummaryCamp(c as Record<string, unknown>);
          setUploaded(Array.isArray(cr) ? (cr as CreativeRow[]) : []);
        }
      } catch {
        /* ignore */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [step, campaignId, advertiserEmail]);

  useEffect(() => {
    if (step === 3) {
      setConfirmPulse(0);
      const t = requestAnimationFrame(() => setConfirmPulse(1));
      return () => cancelAnimationFrame(t);
    }
  }, [step]);

  const acceptFile = useCallback((f: File | null | undefined) => {
    if (!f) return;
    if (f.size > 2 * 1024 * 1024) {
      setError("File must be 2MB or smaller.");
      return;
    }
    const ok = ["image/jpeg", "image/png", "image/gif", "image/webp"].includes(f.type);
    if (!ok) {
      setError("Only JPG, PNG, GIF, or WebP are allowed.");
      return;
    }
    setError(null);
    setFile(f);
    setCreativeName(f.name.replace(/\.[^/.]+$/, ""));
  }, []);

  async function submitStep1(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (targetSizes.length === 0) {
      setError("Select at least one target ad size.");
      return;
    }
    if (targetEnvs.length === 0) {
      setError("Select at least one target environment.");
      return;
    }
    if (targetDevices.length === 0) {
      setError("Select at least one device type.");
      return;
    }
    if (!allCountries && targetGeosBody.length === 0) {
      setError("Select countries or enable “All countries”.");
      return;
    }
    const bid = Number(bidPrice);
    const budget = Number(dailyBudget);
    if (!Number.isFinite(bid) || bid < 0.1) {
      setError("Bid CPM must be at least $0.10.");
      return;
    }
    if (!Number.isFinite(budget) || budget < 5) {
      setError("Daily budget must be at least $5.");
      return;
    }
    const em = advertiserEmail.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(em)) {
      setError("Enter a valid contact email.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          campaign_name: campaignName.trim(),
          advertiser_name: advertiserName.trim(),
          advertiser_email: em,
          bid_price: bid,
          daily_budget: budget,
          target_sizes: targetSizes,
          target_environments: targetEnvs,
          target_devices: targetDevices,
          target_geos: targetGeosBody,
          start_date: startDate || null,
          end_date: endDate || null
        })
      });
      const data = (await res.json()) as { id?: string; error?: string };
      if (!res.ok) {
        setError(typeof data.error === "string" ? data.error : "Failed to create campaign");
        setLoading(false);
        return;
      }
      const id = data.id as string;
      setCampaignId(id);
      sessionStorage.setItem(STORAGE_CAMPAIGN, id);
      sessionStorage.setItem(STORAGE_EMAIL, em);
      setPickedSize(targetSizes[0] ?? "300x250");
      setUploaded([]);
      setStep(2);
    } catch {
      setError("Network error");
    }
    setLoading(false);
  }

  async function doUpload(e?: FormEvent) {
    e?.preventDefault();
    if (!campaignId || !file || !advertiserEmail) {
      setError("Choose an image and ensure your session is valid.");
      return;
    }
    const cu = clickUrl.trim();
    if (!cu.startsWith("http://") && !cu.startsWith("https://")) {
      setError("Click URL must start with http:// or https://");
      return;
    }
    setError(null);
    setLoading(true);
    setUploadPct(0);
    try {
      const fd = new FormData();
      fd.append("campaign_id", campaignId);
      fd.append("advertiser_email", advertiserEmail);
      fd.append("name", creativeName.trim() || file.name);
      fd.append("type", "banner");
      fd.append("size", pickedSize);
      fd.append("click_url", cu);
      fd.append("file", file);
      const { ok, data, status } = await uploadCreativeMultipart(fd, setUploadPct);
      const row = data as CreativeRow & { error?: string };
      if (!ok) {
        setError(typeof row?.error === "string" ? row.error : `Upload failed (${status})`);
        setLoading(false);
        return;
      }
      setUploaded((prev) => [row, ...prev]);
      setFile(null);
      setCreativeName("");
      setUploadPct(0);
    } catch {
      setError("Network error");
    }
    setLoading(false);
  }

  function goReview() {
    if (uploaded.length === 0) {
      setError("Upload at least one creative before review.");
      return;
    }
    setError(null);
    setStep(3);
  }

  function copyId() {
    if (!campaignId) return;
    void navigator.clipboard.writeText(campaignId);
  }

  const [pw, ph] = pickedSize.split("x").map((n) => Number(n));
  const previewScale = pw && ph ? Math.min(280 / pw, 220 / ph, 1) : 1;
  const outlineW = pw * previewScale;
  const outlineH = ph * previewScale;

  return (
    <div style={{ maxWidth: 620 }}>
      <h1 style={{ color: "var(--text-bright)", marginTop: 0 }}>Create campaign</h1>
      <p style={{ fontSize: 12, color: "var(--text-muted)" }}>
        Step {step} of 3 · <span style={{ color: "#ffd32a" }}>Pending review</span> until the exchange activates your line item.
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
          <label style={{ fontSize: 11, color: "var(--text-muted)" }}>Bid price CPM (USD) *</label>
          <input type="number" step="0.01" min={0.1} value={bidPrice} onChange={(e) => setBidPrice(e.target.value)} required />
          <p style={{ fontSize: 11, color: "var(--text-muted)", margin: "6px 0 0" }}>
            Higher bid = more impressions won. Industry avg: $2–5 CPM.
          </p>

          <div style={{ height: 10 }} />
          <label style={{ fontSize: 11, color: "var(--text-muted)" }}>Daily budget (USD) *</label>
          <input type="number" step="0.01" min={5} value={dailyBudget} onChange={(e) => setDailyBudget(e.target.value)} required />

          <div style={{ height: 14 }} />
          <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 6 }}>Target ad sizes *</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {SIZE_OPTS.map((s) => (
              <label key={s.id} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, cursor: "pointer" }}>
                <input
                  type="checkbox"
                  checked={sizesPick[s.id]}
                  onChange={(e) => setSizesPick((p) => ({ ...p, [s.id]: e.target.checked }))}
                />
                {s.label}
              </label>
            ))}
          </div>

          <div style={{ height: 14 }} />
          <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 6 }}>Target environments *</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {ENV_OPTS.map((s) => (
              <label key={s.id} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, cursor: "pointer" }}>
                <input
                  type="checkbox"
                  checked={envPick[s.id]}
                  onChange={(e) => setEnvPick((p) => ({ ...p, [s.id]: e.target.checked }))}
                />
                {s.label}
              </label>
            ))}
          </div>

          <div style={{ height: 14 }} />
          <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 6 }}>Geo targeting</div>
          <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, cursor: "pointer", marginBottom: 8 }}>
            <input
              type="checkbox"
              checked={allCountries}
              onChange={(e) => {
                setAllCountries(e.target.checked);
                if (e.target.checked) setGeoPick(Object.fromEntries(GEO_OPTS.map((g) => [g.code, false])) as Record<string, boolean>);
              }}
            />
            All countries
          </label>
          {!allCountries && (
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {GEO_OPTS.map((g) => (
                <label key={g.code} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, cursor: "pointer" }}>
                  <input
                    type="checkbox"
                    checked={geoPick[g.code]}
                    onChange={(e) =>
                      setGeoPick((p) => ({
                        ...p,
                        [g.code]: e.target.checked
                      }))
                    }
                  />
                  {g.label}
                </label>
              ))}
            </div>
          )}

          <div style={{ height: 14 }} />
          <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 6 }}>Device targeting *</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {DEVICE_OPTS.map((s) => (
              <label key={s.id} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, cursor: "pointer" }}>
                <input
                  type="checkbox"
                  checked={devicePick[s.id]}
                  onChange={(e) => setDevicePick((p) => ({ ...p, [s.id]: e.target.checked }))}
                />
                {s.label}
              </label>
            ))}
          </div>

          <div style={{ height: 14 }} />
          <label style={{ fontSize: 11, color: "var(--text-muted)" }}>Start date (optional)</label>
          <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />

          <div style={{ height: 10 }} />
          <label style={{ fontSize: 11, color: "var(--text-muted)" }}>End date (optional)</label>
          <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />

          {error && <p style={{ color: "#ff4757", fontSize: 12, marginTop: 10 }}>{error}</p>}
          <div style={{ height: 14 }} />
          <button type="submit" disabled={loading}>
            {loading ? "Saving…" : "Continue to Creative Upload →"}
          </button>
        </form>
      )}

      {step === 2 && campaignId && (
        <div className="card" style={{ marginTop: 16 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text-bright)", marginBottom: 6 }}>{campaignName || "Your campaign"}</div>
          <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 14 }}>
            Campaign ID <code style={{ color: "#00d4aa" }}>{campaignId}</code>
          </div>

          <form
            onSubmit={doUpload}
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragOver(false);
              acceptFile(e.dataTransfer.files?.[0]);
            }}
          >
            <div
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter") fileInputRef.current?.click();
              }}
              onClick={() => fileInputRef.current?.click()}
              style={{
                border: `2px dashed ${dragOver ? "#00d4aa" : "var(--border)"}`,
                borderRadius: 10,
                padding: 32,
                textAlign: "center",
                cursor: "pointer",
                marginBottom: 14
              }}
            >
              <div style={{ fontSize: 14, color: "var(--text-bright)", fontWeight: 600, marginBottom: 8 }}>
                Drop your creative here or click to browse
              </div>
              <div style={{ fontSize: 11, color: "var(--text-muted)" }}>JPG, PNG, GIF, WebP · max 2MB</div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/gif,image/webp"
                style={{ display: "none" }}
                onChange={(e) => acceptFile(e.target.files?.[0])}
              />
            </div>

            {file && previewUrl && (
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 8 }}>
                  Preview ({pickedSize} outline){fileDims ? ` · Detected ${fileDims.w}x${fileDims.h}` : ""}
                </div>
                <div
                  style={{
                    position: "relative",
                    width: outlineW,
                    height: outlineH,
                    border: "2px solid #00d4aa",
                    borderRadius: 6,
                    overflow: "hidden",
                    background: "#0c1018"
                  }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={previewUrl}
                    alt=""
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      display: "block"
                    }}
                  />
                </div>
                <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 6 }}>
                  {file.name} · {(file.size / 1024).toFixed(1)} KB
                </div>
                {dimensionWarn && (
                  <p style={{ color: "#ffd32a", fontSize: 11, marginTop: 8, lineHeight: 1.45 }}>{dimensionWarn}</p>
                )}
              </div>
            )}

            <label style={{ fontSize: 11, color: "var(--text-muted)" }}>Displayed size slot *</label>
            <select value={pickedSize} onChange={(e) => setPickedSize(e.target.value)}>
              {targetSizes.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>

            <div style={{ height: 10 }} />
            <label style={{ fontSize: 11, color: "var(--text-muted)" }}>Creative name</label>
            <input value={creativeName} onChange={(e) => setCreativeName(e.target.value)} placeholder="Auto-filled from file" />

            <div style={{ height: 10 }} />
            <label style={{ fontSize: 11, color: "var(--text-muted)" }}>Click destination URL *</label>
            <input value={clickUrl} onChange={(e) => setClickUrl(e.target.value)} required placeholder="https://your-site.com/landing" />
            <p style={{ fontSize: 11, color: "var(--text-muted)", margin: "6px 0 0" }}>Where should users go when they click your ad?</p>

            {uploadPct > 0 && uploadPct < 100 && (
              <div style={{ marginTop: 12 }}>
                <div style={{ height: 6, borderRadius: 3, background: "#1a222e", overflow: "hidden" }}>
                  <div style={{ width: `${uploadPct}%`, height: "100%", background: "#00d4aa", transition: "width 0.15s ease" }} />
                </div>
                <div style={{ fontSize: 10, color: "var(--text-muted)", marginTop: 4 }}>Uploading {uploadPct}%</div>
              </div>
            )}

            {error && <p style={{ color: "#ff4757", fontSize: 12, marginTop: 10 }}>{error}</p>}
            <div style={{ height: 14 }} />
            <button type="submit" disabled={loading || !file}>
              {loading ? "Uploading…" : "Upload creative"}
            </button>
          </form>

          {uploaded.length > 0 && (
            <div style={{ marginTop: 22 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#2ecc71", marginBottom: 10, display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 18 }}>✓</span> Uploaded creatives
              </div>
              <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                {uploaded.map((cr) => (
                  <div key={cr.id} style={{ width: 120 }}>
                    {cr.image_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={cr.image_url} alt="" style={{ width: "100%", borderRadius: 6, border: "1px solid var(--border)" }} />
                    ) : null}
                    <div style={{ fontSize: 10, color: "var(--text-muted)", marginTop: 4 }}>{cr.size}</div>
                  </div>
                ))}
              </div>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 16 }}>
                <button type="button" className="secondary" onClick={() => fileInputRef.current?.click()}>
                  Add another creative
                </button>
                <button type="button" onClick={goReview}>
                  Continue to Review →
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {step === 3 && campaignId && (
        <div className="card" style={{ marginTop: 16 }}>
          <div
            style={{
              fontSize: 56,
              color: "#2ecc71",
              textAlign: "center",
              lineHeight: 1,
              marginBottom: 8,
              transform: confirmPulse ? "scale(1)" : "scale(0.4)",
              opacity: confirmPulse ? 1 : 0,
              transition: "transform 0.45s cubic-bezier(.34,1.56,.64,1), opacity 0.35s ease"
            }}
          >
            ✓
          </div>
          <h2 style={{ fontSize: 18, color: "var(--text-bright)", marginTop: 0, textAlign: "center" }}>Campaign submitted</h2>
          <div style={{ textAlign: "center", marginBottom: 16 }}>
            <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 6 }}>Campaign ID</div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, flexWrap: "wrap" }}>
              <code
                style={{
                  fontSize: "clamp(1rem, 3vw, 1.25rem)",
                  fontFamily: "'JetBrains Mono', ui-monospace, monospace",
                  fontWeight: 800,
                  color: "#00d4aa",
                  wordBreak: "break-all"
                }}
              >
                {campaignId}
              </code>
              <button type="button" className="secondary" style={{ fontSize: 11 }} onClick={copyId}>
                Copy
              </button>
            </div>
          </div>

          {uploaded.length > 0 && (
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "center", marginBottom: 20 }}>
              {uploaded.map((cr) =>
                cr.image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img key={cr.id} src={cr.image_url} alt="" style={{ width: 96, borderRadius: 6, border: "1px solid var(--border)" }} />
                ) : null
              )}
            </div>
          )}

          <table style={{ width: "100%", fontSize: 12, borderCollapse: "collapse", marginBottom: 16 }}>
            <tbody>
              {[
                ["Advertiser", String(summaryCamp?.advertiser_name ?? advertiserName ?? "—")],
                ["Campaign name", String(summaryCamp?.campaign_name ?? campaignName ?? "—")],
                ["Bid CPM", `$${String(summaryCamp?.bid_price ?? bidPrice)}`],
                ["Daily budget", `$${String(summaryCamp?.daily_budget ?? dailyBudget)}`],
                ["Sizes", (summaryCamp?.target_sizes as string[])?.join(", ") || targetSizes.join(", ")],
                ["Status", "Pending Review"]
              ].map(([k, v]) => (
                <tr key={k} style={{ borderBottom: "1px solid var(--border)" }}>
                  <td style={{ padding: "8px 6px", color: "var(--text-muted)", width: "38%" }}>{k}</td>
                  <td style={{ padding: "8px 6px", color: "var(--text-bright)", fontWeight: 600 }}>{v}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <p style={{ fontSize: 13, color: "var(--text-muted)", lineHeight: 1.6, margin: "0 0 20px" }}>
            Your campaign is under review by the exchange team. Typical activation time: 2–24 hours. You will receive an email confirmation
            when your campaign goes live.
          </p>

          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <Link
              href="/demand/create"
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "10px 16px",
                borderRadius: 8,
                border: "1px solid var(--border)",
                fontSize: 13,
                color: "var(--text-bright)",
                textDecoration: "none"
              }}
              onClick={() => {
                sessionStorage.removeItem(STORAGE_CAMPAIGN);
                sessionStorage.removeItem(STORAGE_EMAIL);
              }}
            >
              Create Another Campaign
            </Link>
            <button type="button" onClick={() => router.push(`/demand/dashboard?email=${encodeURIComponent(advertiserEmail)}`)}>
              View Campaign Dashboard →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function DemandCreatePage() {
  return (
    <Suspense fallback={<p style={{ color: "var(--text-muted)" }}>Loading…</p>}>
      <DemandCreateInner />
    </Suspense>
  );
}

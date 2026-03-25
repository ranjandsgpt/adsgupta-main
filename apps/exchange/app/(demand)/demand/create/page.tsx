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
  const [previewUrlBySize, setPreviewUrlBySize] = useState<Record<string, string>>({});
  const [dimensionWarnBySize, setDimensionWarnBySize] = useState<Record<string, string>>({});
  const [dragOverSize, setDragOverSize] = useState<string | null>(null);
  const [uploaded, setUploaded] = useState<CreativeRow[]>([]);
  const [uploadPct, setUploadPct] = useState(0);
  const [confirmPulse, setConfirmPulse] = useState(0);
  const [summaryCamp, setSummaryCamp] = useState<Record<string, unknown> | null>(null);
  const [freqCapDay, setFreqCapDay] = useState("0");
  const [freqCapSession, setFreqCapSession] = useState("0");
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [bidHint, setBidHint] = useState("");
  const [estDailyImp, setEstDailyImp] = useState<number | null>(null);
  const [filesBySize, setFilesBySize] = useState<Record<string, File | null>>({});
  const [clickBySize, setClickBySize] = useState<Record<string, string>>({});
  const nameTouched = useRef(false);
  const previewRef = useRef<Record<string, string>>({});
  const multiFileRefs = useRef<Record<string, HTMLInputElement | null>>({});

  useEffect(() => {
    previewRef.current = previewUrlBySize;
  }, [previewUrlBySize]);
  useEffect(() => {
    return () => {
      Object.values(previewRef.current).forEach((u) => URL.revokeObjectURL(u));
    };
  }, []);

  const targetSizes = useMemo((): string[] => SIZE_OPTS.map((s) => s.id).filter((id) => sizesPick[id]), [sizesPick]);

  useEffect(() => {
    if (nameTouched.current || !advertiserName.trim()) return;
    const sz = targetSizes[0] ?? "300x250";
    const now = new Date();
    const my = now.toLocaleString("en-US", { month: "long", year: "numeric" });
    const sug = `${advertiserName.trim()} — ${sz} — ${my}`;
    setCampaignName((prev) => (prev.trim() ? prev : sug));
  }, [advertiserName, targetSizes]);

  useEffect(() => {
    const bid = Number(bidPrice);
    if (!Number.isFinite(bid) || bid <= 0) {
      setBidHint("");
      setEstDailyImp(null);
      return;
    }
    if (bid < 0.5) setBidHint("Low — may have very limited reach.");
    else if (bid < 1) setBidHint("Moderate — suitable for broad awareness.");
    else if (bid < 3) setBidHint("Competitive — good reach across most inventory.");
    else if (bid <= 5) setBidHint("Strong — priority access to premium inventory.");
    else setBidHint("Premium — highest priority in all auctions.");
    const t = setTimeout(() => {
      void fetch(`/api/public/bid-estimate?bid=${encodeURIComponent(String(bid))}`)
        .then((r) => r.json())
        .then((j: { estimatedDailyImpressions?: number }) => {
          if (typeof j.estimatedDailyImpressions === "number") setEstDailyImp(j.estimatedDailyImpressions);
        })
        .catch(() => setEstDailyImp(null));
    }, 350);
    return () => clearTimeout(t);
  }, [bidPrice]);
  const targetEnvs = useMemo(() => ENV_OPTS.map((e) => e.id).filter((id) => envPick[id]), [envPick]);
  const targetDevices = useMemo(() => DEVICE_OPTS.map((d) => d.id).filter((id) => devicePick[id]), [devicePick]);
  const targetGeosBody = useMemo(() => {
    if (allCountries) return ["all"];
    return GEO_OPTS.map((g) => g.code).filter((c) => geoPick[c]);
  }, [allCountries, geoPick]);

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function hydrateFromCampaign(c: Record<string, unknown>) {
    const nm = c?.campaign_name ?? c?.name;
    if (nm) setCampaignName(String(nm));
    if (c?.advertiser_name) setAdvertiserName(String(c.advertiser_name));
    if (c?.bid_price != null) setBidPrice(String(c.bid_price));
    if (c?.daily_budget != null) setDailyBudget(String(c.daily_budget));
    if (c?.freq_cap_day != null) setFreqCapDay(String(c.freq_cap_day));
    if (c?.freq_cap_session != null) setFreqCapSession(String(c.freq_cap_session));
    const ts = c?.target_sizes as string[] | undefined;
    if (ts?.length) {
      setSizesPick((prev) => {
        const n = { ...prev };
        for (const k of Object.keys(n)) n[k] = ts.includes(k);
        return n;
      });
    }
  }

  useEffect(() => {
    const sid = typeof window !== "undefined" ? sessionStorage.getItem(STORAGE_CAMPAIGN) : null;
    const emStore = typeof window !== "undefined" ? sessionStorage.getItem(STORAGE_EMAIL) : null;

    if (qCamp && qEmail) {
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
          hydrateFromCampaign(c);
        })
        .catch(() => {});
      return;
    }

    if (sid && emStore && !qCamp) {
      setCampaignId(sid);
      setAdvertiserEmail(emStore);
      void fetch(`/api/campaigns/${sid}`)
        .then((r) => r.json())
        .then((c: Record<string, unknown>) => {
          hydrateFromCampaign(c);
          const st = String(c?.status ?? "");
          if (st === "draft" || st === "pending") setStep(2);
        })
        .catch(() => {});
    }
  }, [qCamp, qEmail]);

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

  const acceptFileForSize = useCallback((size: string, f: File | null | undefined) => {
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
    setPreviewUrlBySize((prev) => {
      if (prev[size]) URL.revokeObjectURL(prev[size]);
      const url = URL.createObjectURL(f);
      return { ...prev, [size]: url };
    });
    setFilesBySize((p) => ({ ...p, [size]: f }));
    void readImageDims(f)
      .then(({ w, h }) => {
        const tag = `${w}x${h}`;
        if (tag !== size) {
          setDimensionWarnBySize((dw) => ({
            ...dw,
            [size]: `Image is ${w}×${h}; this slot expects ${size}. It may look cropped or distorted.`
          }));
        } else {
          setDimensionWarnBySize((dw) => ({ ...dw, [size]: "" }));
        }
      })
      .catch(() => {
        setDimensionWarnBySize((dw) => ({ ...dw, [size]: "" }));
      });
  }, []);

  async function saveDraftPartial() {
    setError(null);
    const em = advertiserEmail.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(em)) {
      setError("Enter a valid contact email to save draft.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/campaigns/draft", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          advertiser_name: advertiserName.trim() || "Advertiser",
          advertiser_email: em,
          campaign_name: campaignName.trim() || "Draft campaign",
          bid_price: Number(bidPrice) || 0.5,
          daily_budget: Number(dailyBudget) || 10,
          target_sizes: targetSizes.length ? targetSizes : ["300x250"],
          target_geos: targetGeosBody,
          target_environments: targetEnvs,
          target_devices: targetDevices,
          start_date: startDate || null,
          end_date: endDate || null,
          freq_cap_day: Number(freqCapDay) || 0,
          freq_cap_session: Number(freqCapSession) || 0
        })
      });
      const data = (await res.json()) as { id?: string; error?: string };
      if (!res.ok) {
        setError(typeof data.error === "string" ? data.error : "Draft save failed");
        setLoading(false);
        return;
      }
      if (data.id) {
        setCampaignId(data.id);
        sessionStorage.setItem(STORAGE_CAMPAIGN, data.id);
        sessionStorage.setItem(STORAGE_EMAIL, em);
      }
      setError(null);
      alert("Draft saved. Resume anytime from the demand dashboard (draft campaigns) or continue this wizard.");
    } catch {
      setError("Network error");
    }
    setLoading(false);
  }

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
          end_date: endDate || null,
          freq_cap_day: Number(freqCapDay) || 0,
          freq_cap_session: Number(freqCapSession) || 0
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
      setUploaded([]);
      setFilesBySize({});
      setClickBySize({});
      setPreviewUrlBySize((prev) => {
        Object.values(prev).forEach((u) => URL.revokeObjectURL(u));
        return {};
      });
      setDimensionWarnBySize({});
      setStep(2);
    } catch {
      setError("Network error");
    }
    setLoading(false);
  }

  async function uploadOne(size: string, file: File): Promise<boolean> {
    if (!campaignId || !advertiserEmail) return false;
    const cu = (clickBySize[size]?.trim() || clickUrl.trim());
    if (!cu.startsWith("http://") && !cu.startsWith("https://")) {
      setError(`Click URL for ${size} must start with http:// or https://`);
      return false;
    }
    setUploadPct(0);
    const fd = new FormData();
    fd.append("campaign_id", campaignId);
    fd.append("advertiser_email", advertiserEmail);
    fd.append("name", `${file.name.replace(/\.[^/.]+$/, "")} (${size})`);
    fd.append("type", "banner");
    fd.append("size", size);
    fd.append("click_url", cu);
    fd.append("file", file);
    const { ok, data, status } = await uploadCreativeMultipart(fd, setUploadPct);
    const row = data as CreativeRow & { error?: string };
    if (!ok) {
      setError(typeof row?.error === "string" ? row.error : `Upload failed (${status})`);
      return false;
    }
    setUploaded((prev) => [row, ...prev]);
    setFilesBySize((p) => ({ ...p, [size]: null }));
    setPreviewUrlBySize((prev) => {
      if (prev[size]) URL.revokeObjectURL(prev[size]);
      const { [size]: _, ...rest } = prev;
      return rest;
    });
    setUploadPct(0);
    return true;
  }

  async function goReview() {
    if (!campaignId || !advertiserEmail) return;
    setError(null);
    setLoading(true);
    try {
      const pending = targetSizes.flatMap((s) => (filesBySize[s] ? [[s, filesBySize[s]!] as const] : []));
      for (const [size, file] of pending) {
        const ok = await uploadOne(size, file);
        if (!ok) {
          setLoading(false);
          return;
        }
      }
      const crRes = await fetch(
        `/api/creatives?campaign_id=${encodeURIComponent(campaignId)}&email=${encodeURIComponent(advertiserEmail)}`
      );
      const list = (await crRes.json()) as CreativeRow[];
      const arr = Array.isArray(list) ? list : [];
      setUploaded(arr);
      if (arr.length === 0) {
        setError("Upload at least one creative for a target size before review.");
        setLoading(false);
        return;
      }
      setStep(3);
    } catch {
      setError("Network error");
    }
    setLoading(false);
  }

  function copyId() {
    if (!campaignId) return;
    void navigator.clipboard.writeText(campaignId);
  }

  const previewCreative = step === 3 ? (uploaded.find((cr) => cr.size === "300x250") ?? uploaded[0]) : null;

  return (
    <div style={{ maxWidth: step === 3 ? 760 : 620 }}>
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
          <input
            value={campaignName}
            onChange={(e) => {
              nameTouched.current = true;
              setCampaignName(e.target.value);
            }}
            required
          />

          <div style={{ height: 10 }} />
          <label style={{ fontSize: 11, color: "var(--text-muted)" }}>Bid price CPM (USD) *</label>
          <input type="number" step="0.01" min={0.1} value={bidPrice} onChange={(e) => setBidPrice(e.target.value)} required />
          {bidHint && (
            <p style={{ fontSize: 11, color: "#4a9eff", margin: "6px 0 0", fontWeight: 600 }}>
              {bidHint}{" "}
              {estDailyImp != null && (
                <span style={{ color: "var(--text-muted)", fontWeight: 400 }}>
                  · Estimated ~{estDailyImp.toLocaleString()} winning clears/day at this bid (exchange 7d sample).
                </span>
              )}
            </p>
          )}
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

          <button
            type="button"
            className="secondary"
            style={{ marginTop: 16, fontSize: 11 }}
            onClick={() => setAdvancedOpen((o) => !o)}
          >
            {advancedOpen ? "▼" : "▶"} Advanced targeting (frequency caps)
          </button>
          {advancedOpen && (
            <div style={{ marginTop: 12, padding: 12, border: "1px solid var(--border)", borderRadius: 8 }}>
              <p style={{ fontSize: 10, color: "var(--text-muted)", margin: "0 0 10px", lineHeight: 1.5 }}>
                Limit how often one browser sees your ads (client-enforced caps). 0 = unlimited. Recommended display:
                3–5/day.
              </p>
              <label style={{ fontSize: 11, color: "var(--text-muted)" }}>Daily frequency cap</label>
              <input type="number" min={0} value={freqCapDay} onChange={(e) => setFreqCapDay(e.target.value)} />
              <div style={{ height: 8 }} />
              <label style={{ fontSize: 11, color: "var(--text-muted)" }}>Session frequency cap</label>
              <input type="number" min={0} value={freqCapSession} onChange={(e) => setFreqCapSession(e.target.value)} />
            </div>
          )}

          {error && <p style={{ color: "#ff4757", fontSize: 12, marginTop: 10 }}>{error}</p>}
          <div style={{ height: 14 }} />
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <button type="submit" disabled={loading}>
              {loading ? "Saving…" : "Continue to Creative Upload →"}
            </button>
            <button
              type="button"
              className="secondary"
              disabled={loading}
              onClick={() => void saveDraftPartial()}
            >
              Save as draft
            </button>
          </div>
        </form>
      )}

      {step === 2 && campaignId && (
        <div className="card" style={{ marginTop: 16 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text-bright)", marginBottom: 6 }}>{campaignName || "Your campaign"}</div>
          <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 14 }}>
            Campaign ID <code style={{ color: "#0066cc" }}>{campaignId}</code>
          </div>

          <p style={{ fontSize: 12, color: "var(--text-muted)", lineHeight: 1.55, marginTop: 0 }}>
            Upload one creative per target size. Matching dimensions improves fill and avoids distortion across publisher placements.
          </p>

          <label style={{ fontSize: 11, color: "var(--text-muted)" }}>Default click URL</label>
          <input value={clickUrl} onChange={(e) => setClickUrl(e.target.value)} placeholder="https://your-site.com/landing" />
          <p style={{ fontSize: 11, color: "var(--text-muted)", margin: "6px 0 16px" }}>
            Used when a size-specific URL is left empty.
          </p>

          {targetSizes.map((size) => {
            const [pw, ph] = size.split("x").map((n) => Number(n));
            const previewScale = pw && ph ? Math.min(200 / pw, 160 / ph, 1) : 1;
            const outlineW = pw * previewScale;
            const outlineH = ph * previewScale;
            const local = filesBySize[size];
            const prev = previewUrlBySize[size];
            const up = uploaded.some((c) => c.size === size);
            return (
              <div
                key={size}
                style={{
                  marginBottom: 20,
                  paddingBottom: 20,
                  borderBottom: "1px solid var(--border)"
                }}
              >
                <div style={{ fontSize: 12, fontWeight: 700, color: "#a855f7", marginBottom: 10 }}>Creative for {size}</div>
                <div
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") multiFileRefs.current[size]?.click();
                  }}
                  onClick={() => multiFileRefs.current[size]?.click()}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragOverSize(size);
                  }}
                  onDragLeave={() => setDragOverSize((d) => (d === size ? null : d))}
                  onDrop={(e) => {
                    e.preventDefault();
                    setDragOverSize(null);
                    acceptFileForSize(size, e.dataTransfer.files?.[0]);
                  }}
                  style={{
                    border: `2px dashed ${dragOverSize === size ? "#0066cc" : "var(--border)"}`,
                    borderRadius: 10,
                    padding: 20,
                    textAlign: "center",
                    cursor: "pointer",
                    marginBottom: 10
                  }}
                >
                  <div style={{ fontSize: 12, color: "var(--text-bright)", fontWeight: 600 }}>Drop image or click to choose · {size}</div>
                  <div style={{ fontSize: 10, color: "var(--text-muted)", marginTop: 4 }}>JPG, PNG, GIF, WebP · max 2MB</div>
                  <input
                    ref={(el) => {
                      multiFileRefs.current[size] = el;
                    }}
                    type="file"
                    accept="image/jpeg,image/png,image/gif,image/webp"
                    style={{ display: "none" }}
                    onChange={(e) => acceptFileForSize(size, e.target.files?.[0])}
                  />
                </div>

                {prev && local && (
                  <div style={{ marginBottom: 10 }}>
                    <div style={{ fontSize: 10, color: "var(--text-muted)", marginBottom: 6 }}>Preview</div>
                    <div
                      style={{
                        position: "relative",
                        width: outlineW,
                        height: outlineH,
                        border: "2px solid #0066cc",
                        borderRadius: 6,
                        overflow: "hidden",
                        background: "#0c1018"
                      }}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={prev} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                    </div>
                    <div style={{ fontSize: 10, color: "var(--text-muted)", marginTop: 4 }}>
                      {local.name} · {(local.size / 1024).toFixed(1)} KB
                    </div>
                    {dimensionWarnBySize[size] ? (
                      <p style={{ color: "#ffd32a", fontSize: 10, marginTop: 6, lineHeight: 1.45 }}>{dimensionWarnBySize[size]}</p>
                    ) : null}
                  </div>
                )}

                <label style={{ fontSize: 11, color: "var(--text-muted)" }}>Click URL for this size (optional)</label>
                <input
                  value={clickBySize[size] ?? ""}
                  onChange={(e) => setClickBySize((p) => ({ ...p, [size]: e.target.value }))}
                  placeholder="Uses default click URL if empty"
                />

                {up && (
                  <p style={{ fontSize: 11, color: "#2ecc71", marginTop: 10, fontWeight: 600 }}>✓ Uploaded for this size</p>
                )}
              </div>
            );
          })}

          {uploadPct > 0 && uploadPct < 100 && (
            <div style={{ marginTop: 12 }}>
              <div style={{ height: 6, borderRadius: 3, background: "#1a222e", overflow: "hidden" }}>
                <div style={{ width: `${uploadPct}%`, height: "100%", background: "#0066cc", transition: "width 0.15s ease" }} />
              </div>
              <div style={{ fontSize: 10, color: "var(--text-muted)", marginTop: 4 }}>Uploading {uploadPct}%</div>
            </div>
          )}

          {error && <p style={{ color: "#ff4757", fontSize: 12, marginTop: 10 }}>{error}</p>}

          {uploaded.length > 0 && (
            <div style={{ marginTop: 18 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#2ecc71", marginBottom: 10 }}>On server</div>
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
            </div>
          )}

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 22 }}>
            <button type="button" disabled={loading} onClick={() => void goReview()}>
              {loading ? "Uploading…" : "Continue to Review →"}
            </button>
            <button type="button" className="secondary" disabled={loading} onClick={() => void saveDraftPartial()}>
              Save as draft
            </button>
            <button
              type="button"
              className="secondary"
              disabled={loading}
              onClick={() => router.push(`/demand/dashboard?email=${encodeURIComponent(advertiserEmail)}`)}
            >
              Dashboard
            </button>
          </div>
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
                  color: "#0066cc",
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

          {previewCreative?.image_url ? (
            <div
              style={{
                marginBottom: 24,
                padding: 16,
                borderRadius: 12,
                border: "1px solid var(--border)",
                background: "linear-gradient(180deg, rgba(0,212,170,0.06), transparent)"
              }}
            >
              <h3 style={{ fontSize: 13, fontWeight: 800, color: "var(--text-bright)", margin: "0 0 6px" }}>Preview your ad</h3>
              <p style={{ fontSize: 11, color: "var(--text-muted)", margin: "0 0 14px", lineHeight: 1.5 }}>
                Mock news article page. Your creative appears in the sidebar MPU ({previewCreative.size}) — similar to many publisher sites.
              </p>
              <div
                style={{
                  display: "flex",
                  gap: 14,
                  alignItems: "flex-start",
                  flexWrap: "wrap",
                  background: "#d4cfc4",
                  borderRadius: 8,
                  padding: 14,
                  boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.08)"
                }}
              >
                <div style={{ flex: "1 1 220px", minWidth: 200 }}>
                  <div
                    style={{
                      fontFamily: "Georgia, 'Times New Roman', serif",
                      fontSize: 22,
                      fontWeight: 800,
                      color: "#1a1510",
                      lineHeight: 1.2,
                      marginBottom: 8
                    }}
                  >
                    Morning Digest: Markets Open Steady
                  </div>
                  <div style={{ fontSize: 10, color: "#5c5348", marginBottom: 10 }}>By Staff Correspondent · Business</div>
                  <div style={{ fontSize: 11, color: "#3d352c", lineHeight: 1.55 }}>
                    <p style={{ margin: "0 0 8px" }}>
                      Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna
                      aliqua. Ut enim ad minim veniam, quis nostrud exercitation.
                    </p>
                    <p style={{ margin: 0 }}>
                      Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint
                      occaecat cupidatat non proident.
                    </p>
                  </div>
                </div>
                <aside
                  style={{
                    flex: "0 0 312px",
                    width: 312,
                    background: "#c8c2b6",
                    padding: 10,
                    borderRadius: 6,
                    border: "1px solid rgba(0,0,0,0.12)"
                  }}
                >
                  <div style={{ fontSize: 9, color: "#5c5348", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>
                    Sponsored
                  </div>
                  <div
                    style={{
                      width: 300,
                      height: 250,
                      background: "#fff",
                      border: "1px solid rgba(0,0,0,0.15)",
                      borderRadius: 4,
                      overflow: "hidden",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center"
                    }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={previewCreative.image_url}
                      alt=""
                      style={{
                        maxWidth: previewCreative.size === "300x250" ? 300 : 280,
                        maxHeight: previewCreative.size === "300x250" ? 250 : 200,
                        width: "auto",
                        height: "auto",
                        objectFit: "contain"
                      }}
                    />
                  </div>
                  <div style={{ fontSize: 9, color: "#5c5348", marginTop: 8, lineHeight: 1.4 }}>
                    Your live creative may be resized to fit strict slot dimensions (e.g. 300×250 MPU).
                  </div>
                </aside>
              </div>
            </div>
          ) : null}

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
            <button type="button" className="secondary" disabled={loading} onClick={() => void saveDraftPartial()}>
              Save as draft
            </button>
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

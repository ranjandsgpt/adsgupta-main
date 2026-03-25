"use client";

import type { CampaignIntelligencePayload } from "@/lib/campaign-intelligence";
import type { ABTestResults } from "@/lib/campaign-ab-results";
import { useCallback, useEffect, useState } from "react";

type Creative = {
  id: string;
  name: string;
  size: string;
  image_url: string | null;
  status: string;
  ab_group?: string | null;
  ab_weight?: string | number | null;
};

type Camp = Record<string, unknown> & { id: string; bid_price?: string | number };

function WinRateGauge({ pct }: { pct: number }) {
  const p = Math.max(0, Math.min(100, pct));
  const r = 36;
  const cx = 48;
  const cy = 46;
  const start = { x: cx - r, y: cy };
  const end = { x: cx + r, y: cy };
  const d = `M ${start.x} ${start.y} A ${r} ${r} 0 0 1 ${end.x} ${end.y}`;
  const len = Math.PI * r;
  const dash = (p / 100) * len;
  const gid = `wg-${Math.round(p)}`;
  return (
    <svg width={96} height={56} viewBox="0 0 96 56" aria-label={`Win rate ${p.toFixed(0)} percent`}>
      <path d={d} fill="none" stroke="#1a2332" strokeWidth={8} strokeLinecap="round" />
      <path
        d={d}
        fill="none"
        stroke={`url(#${gid})`}
        strokeWidth={8}
        strokeLinecap="round"
        strokeDasharray={`${dash} ${len}`}
      />
      <defs>
        <linearGradient id={gid} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#4a9eff" />
          <stop offset="100%" stopColor="#00d4aa" />
        </linearGradient>
      </defs>
      <text x={cx} y={cy + 14} textAnchor="middle" fill="var(--text-bright)" fontSize={12} fontWeight={800}>
        {p.toFixed(0)}%
      </text>
    </svg>
  );
}

export function DemandCampaignTools({
  campaign,
  creatives,
  email,
  onRefresh,
  patchCampaign,
  patchCreative,
  busyId
}: {
  campaign: Camp;
  creatives: Creative[];
  email: string;
  onRefresh: () => Promise<void>;
  patchCampaign: (id: string, body: Record<string, unknown>) => Promise<void>;
  patchCreative: (id: string, body: Record<string, unknown>) => Promise<void>;
  busyId: string | null;
}) {
  const id = campaign.id;
  const [open, setOpen] = useState(false);
  const [intel, setIntel] = useState<CampaignIntelligencePayload | null>(null);
  const [ab, setAb] = useState<ABTestResults | null>(null);
  const [intelErr, setIntelErr] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [abWeightA, setAbWeightA] = useState(50);

  const load = useCallback(async () => {
    setIntelErr(null);
    try {
      const q = `?email=${encodeURIComponent(email)}`;
      const [ir, ar] = await Promise.all([
        fetch(`/api/campaign-intelligence/${encodeURIComponent(id)}${q}`),
        fetch(`/api/campaign-ab-results/${encodeURIComponent(id)}${q}`)
      ]);
      const ij = await ir.json();
      const aj = await ar.json();
      if (ir.ok) setIntel(ij as CampaignIntelligencePayload);
      else setIntelErr(typeof ij.error === "string" ? ij.error : "Intelligence unavailable");
      if (ar.ok) {
        const results = aj as ABTestResults;
        setAb(results);
        const va = results.variants.find((v) => v.group === "a");
        if (va) setAbWeightA(va.weight);
      }
    } catch {
      setIntelErr("Network error");
    }
  }, [email, id]);

  useEffect(() => {
    if (open) void load();
  }, [open, load]);

  useEffect(() => {
    const va = ab?.variants.find((v) => v.group === "a");
    if (va != null) setAbWeightA(va.weight);
  }, [ab]);

  async function applyAutoOptimize() {
    setBusy("opt");
    try {
      const res = await fetch(`/api/campaigns/${encodeURIComponent(id)}/auto-optimize`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ advertiser_email: email })
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        setIntelErr(typeof (j as { error?: string }).error === "string" ? (j as { error: string }).error : "Optimize failed");
      } else await onRefresh();
    } finally {
      setBusy(null);
    }
  }

  async function acceptRecommendedBid() {
    if (!intel) return;
    await patchCampaign(id, { bid_price: intel.bidRecommendation.recommendedBid });
    await load();
  }

  async function declareWinner(creativeId: string) {
    setBusy("win");
    try {
      const res = await fetch(`/api/campaigns/${encodeURIComponent(id)}/ab-declare-winner`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ creative_id: creativeId, advertiser_email: email })
      });
      if (res.ok) {
        await onRefresh();
        await load();
      }
    } finally {
      setBusy(null);
    }
  }

  async function runAbAutoPause() {
    setBusy("ab");
    try {
      await fetch(`/api/campaigns/${encodeURIComponent(id)}/ab-auto-pause`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ advertiser_email: email })
      });
      await onRefresh();
      await load();
    } finally {
      setBusy(null);
    }
  }

  async function syncAbWeights(wA: number) {
    const a = Math.round(Math.max(0, Math.min(100, wA)));
    const b = 100 - a;
    const va = creatives.find((c) => (c.ab_group ?? "a").toLowerCase() === "a");
    const vb = creatives.find((c) => (c.ab_group ?? "b").toLowerCase() === "b");
    if (va) await patchCreative(va.id, { advertiser_email: email, ab_weight: a });
    if (vb) await patchCreative(vb.id, { advertiser_email: email, ab_weight: b });
    setAbWeightA(a);
    await load();
  }

  const maxHourly = Math.max(1, ...(intel?.hourlyPerformance.map((h) => h.impressions) ?? [1]));

  return (
    <div style={{ marginTop: 12, borderTop: "1px solid var(--border)", paddingTop: 12 }}>
      <button type="button" className="secondary" style={{ fontSize: 11 }} onClick={() => setOpen((o) => !o)}>
        {open ? "▼ Hide intelligence & A/B" : "▶ Intelligence & A/B testing"}
      </button>

      {open && (
        <div style={{ marginTop: 14, display: "grid", gap: 16 }}>
          <div className="card" style={{ borderColor: "#4a9eff44" }}>
            <div style={{ fontWeight: 800, fontSize: 12, color: "#4a9eff", marginBottom: 10 }}>Campaign intelligence (7 days)</div>
            {intelErr && <p style={{ color: "#ff4757", fontSize: 11 }}>{intelErr}</p>}
            {intel && (
              <>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 16, alignItems: "center" }}>
                  <WinRateGauge pct={intel.performance.winRate} />
                  <div style={{ fontSize: 11, color: "var(--text-muted)", lineHeight: 1.6 }}>
                    <div>
                      Wins: <strong style={{ color: "var(--text-bright)" }}>{intel.performance.totalBidsWon}</strong> · Pool
                      auctions (matching sizes):{" "}
                      <strong style={{ color: "var(--text-bright)" }}>{intel.performance.totalBidsEntered}</strong>
                    </div>
                    <div>
                      Avg win bid ${intel.performance.avgWinningBid.toFixed(2)} · Competitor avg $
                      {intel.performance.avgCompetitorBid.toFixed(2)}
                    </div>
                  </div>
                </div>

                <div
                  style={{
                    marginTop: 14,
                    padding: 12,
                    borderRadius: 8,
                    background: "#00d4aa10",
                    border: "1px solid #00d4aa33"
                  }}
                >
                  <div style={{ fontSize: 10, color: "var(--text-muted)", marginBottom: 6 }}>Bid recommendation</div>
                  <div style={{ fontSize: 13, color: "var(--text-bright)" }}>
                    Current <strong>${intel.bidRecommendation.currentBid.toFixed(2)}</strong> → Suggested{" "}
                    <strong style={{ color: "var(--accent)" }}>${intel.bidRecommendation.recommendedBid.toFixed(2)}</strong>
                  </div>
                  <p style={{ fontSize: 11, color: "var(--text-muted)", margin: "8px 0", lineHeight: 1.5 }}>
                    {intel.bidRecommendation.reasoning} Projected win rate ~{intel.bidRecommendation.projectedWinRate.toFixed(0)}%, ~$
                    {intel.bidRecommendation.projectedDailySpend.toFixed(2)}/day spend at suggested CPM (modeled).
                  </p>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    <button
                      type="button"
                      style={{ fontSize: 11 }}
                      disabled={busy === "opt" || Math.abs(intel.bidRecommendation.recommendedBid - intel.bidRecommendation.currentBid) < 0.02}
                      onClick={() => void applyAutoOptimize()}
                    >
                      {busy === "opt" ? "Applying…" : "Accept (auto-optimize + history)"}
                    </button>
                    <button type="button" className="secondary" style={{ fontSize: 11 }} onClick={() => void acceptRecommendedBid()}>
                      Set bid to suggested
                    </button>
                  </div>
                </div>

                {intel.bestPerformingUnits.length > 0 && (
                  <div style={{ marginTop: 12 }}>
                    <div style={{ fontSize: 10, color: "var(--text-muted)", marginBottom: 6 }}>Best-performing units</div>
                    <ul style={{ margin: 0, paddingLeft: 16, fontSize: 11, color: "var(--text-muted)" }}>
                      {intel.bestPerformingUnits.slice(0, 6).map((u) => (
                        <li key={u.unitId} style={{ marginBottom: 4 }}>
                          <strong style={{ color: "var(--text-bright)" }}>{u.publisherDomain}</strong> · {u.impressions} imps · win
                          share {u.winRate.toFixed(0)}%
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div style={{ marginTop: 14 }}>
                  <div style={{ fontSize: 10, color: "var(--text-muted)", marginBottom: 8 }}>Hourly impressions (UTC, 7 days)</div>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(24, 1fr)",
                      gap: 2,
                      maxWidth: 480
                    }}
                  >
                    {intel.hourlyPerformance.map((h) => (
                      <div
                        key={h.hour}
                        title={`${h.hour}:00 · ${h.impressions} imps`}
                        style={{
                          height: 28,
                          borderRadius: 2,
                          background: `rgba(0,212,170,${0.15 + (h.impressions / maxHourly) * 0.85})`
                        }}
                      />
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>

          <div className="card" style={{ borderColor: "#a855f744" }}>
            <div style={{ fontWeight: 800, fontSize: 12, color: "#a855f7", marginBottom: 10 }}>A/B test</div>
            {ab && (
              <>
                <label style={{ fontSize: 11, display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                  <input
                    type="checkbox"
                    checked={ab.testActive}
                    disabled={busyId === id}
                    onChange={(e) => void patchCampaign(id, { ab_test_active: e.target.checked })}
                  />
                  Enable A/B test (weighted creative rotation)
                </label>
                <label style={{ fontSize: 11, display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                  <input
                    type="checkbox"
                    checked={Boolean(campaign.ab_auto_pause_loser)}
                    disabled={busyId === id}
                    onChange={(e) => void patchCampaign(id, { ab_auto_pause_loser: e.target.checked })}
                  />
                  Auto-pause loser when confidence &gt; 95%
                </label>

                <div style={{ fontSize: 10, color: "var(--text-muted)", marginBottom: 4 }}>
                  Traffic to A / B (weights should sum ~100 across variants)
                </div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={abWeightA}
                  disabled={creatives.length < 2}
                  onChange={(e) => {
                    const v = Number(e.target.value);
                    setAbWeightA(v);
                    void syncAbWeights(v);
                  }}
                  style={{ width: "100%", maxWidth: 280 }}
                />
                <div style={{ fontSize: 10, marginBottom: 12 }}>
                  A: {abWeightA}% · B: {100 - abWeightA}%
                </div>

                <div style={{ fontSize: 10, color: "var(--text-muted)", marginBottom: 8 }}>Assign variant per creative</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {creatives
                    .filter((c) => c.status === "active" || c.status === "approved")
                    .map((cr) => (
                      <div key={cr.id} style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                        <span style={{ fontSize: 10, width: 120, overflow: "hidden", textOverflow: "ellipsis" }}>{cr.name}</span>
                        <select
                          style={{ fontSize: 11, padding: 4 }}
                          value={(cr.ab_group ?? "a").toLowerCase() === "b" ? "b" : "a"}
                          onChange={async (e) => {
                            await patchCreative(cr.id, { advertiser_email: email, ab_group: e.target.value });
                            await onRefresh();
                            await load();
                          }}
                        >
                          <option value="a">A</option>
                          <option value="b">B</option>
                        </select>
                      </div>
                    ))}
                </div>

                <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                  {ab.variants.map((v) => (
                    <div key={v.creativeId} style={{ width: 140 }}>
                      {v.imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={v.imageUrl} alt="" style={{ width: "100%", borderRadius: 6, border: "1px solid var(--border)" }} />
                      ) : (
                        <div style={{ height: 80, background: "#0c1018", borderRadius: 6 }} />
                      )}
                      <div style={{ fontSize: 10, marginTop: 4 }}>
                        {v.group.toUpperCase()} · CTR {v.ctr.toFixed(2)}% · {v.impressions} imps
                      </div>
                      {ab.confidence >= 95 && ab.winner === v.creativeId && (
                        <div style={{ fontSize: 10, color: "#2ecc71", fontWeight: 800 }}>Winner</div>
                      )}
                    </div>
                  ))}
                </div>

                <p style={{ fontSize: 11, color: "var(--text-muted)", margin: "12px 0", lineHeight: 1.5 }}>
                  {ab.recommendation} {ab.minimumSampleReached ? "" : "(Need ~1000 imps per variant for strong read.)"}
                </p>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {ab.winner && ab.confidence >= 95 && (
                    <button type="button" style={{ fontSize: 11 }} disabled={busy === "win"} onClick={() => void declareWinner(ab.winner!)}>
                      Declare statistical winner
                    </button>
                  )}
                  <button type="button" className="secondary" style={{ fontSize: 11 }} disabled={busy === "ab"} onClick={() => void runAbAutoPause()}>
                    Run auto-pause check
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

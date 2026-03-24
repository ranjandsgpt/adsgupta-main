"use client";

import { DemandAnalyticsTab } from "@/components/demand-analytics-tab";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useMemo, useState } from "react";

type Campaign = Record<string, unknown> & {
  id: string;
  campaign_name?: string;
  name?: string;
  advertiser_name?: string;
  advertiser?: string;
  bid_price: string | number;
  daily_budget?: string | number | null;
  status: string;
  impressions_today?: number;
  spend_today?: string | number;
  remaining_budget_today?: number | null;
  target_sizes?: string[] | null;
  target_geos?: string[] | null;
  target_devices?: string[] | null;
  target_environments?: string[] | null;
  target_domains?: string[] | null;
};

type Creative = {
  id: string;
  campaign_id: string;
  name: string;
  size: string;
  image_url: string | null;
  click_url: string | null;
  status: string;
  impression_count?: number;
  click_count?: number;
};

function chip(label: string) {
  return (
    <span
      key={label}
      style={{
        display: "inline-block",
        fontSize: 10,
        padding: "3px 8px",
        borderRadius: 999,
        background: "#00d4aa18",
        color: "#00d4aa",
        margin: "2px 4px 2px 0",
        border: "1px solid #00d4aa44"
      }}
    >
      {label}
    </span>
  );
}

function TargetingChips({ c }: { c: Campaign }) {
  const parts: string[] = [];
  const sz = c.target_sizes;
  if (sz?.length) parts.push(`Sizes: ${sz.join(", ")}`);
  const env = c.target_environments;
  if (env?.length) parts.push(`Env: ${env.join(", ")}`);
  const geo = c.target_geos;
  if (geo?.length) parts.push(`Geo: ${geo.join(", ")}`);
  const dev = c.target_devices;
  if (dev?.length) parts.push(`Device: ${dev.join(", ")}`);
  const dom = c.target_domains;
  if (dom?.length) parts.push(`Domains: ${dom.length} allowlisted`);
  if (!parts.length) return null;
  return (
    <div style={{ marginTop: 10 }}>
      <div style={{ fontSize: 10, color: "var(--text-muted)", marginBottom: 4 }}>Targeting</div>
      <div>{parts.map((p) => chip(p))}</div>
    </div>
  );
}

function Inner() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email");
  const [rows, setRows] = useState<Campaign[]>([]);
  const [creativesByCamp, setCreativesByCamp] = useState<Record<string, Creative[]>>({});
  const [error, setError] = useState<string | null>(null);
  const [bidModal, setBidModal] = useState<Campaign | null>(null);
  const [bidInput, setBidInput] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [tab, setTab] = useState<"campaigns" | "analytics" | "creatives">("campaigns");

  const refresh = useCallback(async () => {
    if (!email) return;
    setError(null);
    try {
      const [cRes, crRes] = await Promise.all([
        fetch(`/api/campaigns?email=${encodeURIComponent(email)}`),
        fetch(`/api/creatives?email=${encodeURIComponent(email)}`)
      ]);
      const cData = await cRes.json();
      const crData = await crRes.json();
      if (!cRes.ok) {
        setError(typeof (cData as { error?: string }).error === "string" ? (cData as { error: string }).error : "Failed to load");
        return;
      }
      if (!crRes.ok) {
        setError(typeof (crData as { error?: string }).error === "string" ? (crData as { error: string }).error : "Failed to load creatives");
        return;
      }
      const list = Array.isArray(cData) ? (cData as Campaign[]) : [];
      setRows(list);
      const allCr = Array.isArray(crData) ? (crData as Creative[]) : [];
      const map: Record<string, Creative[]> = {};
      for (const cr of allCr) {
        if (!map[cr.campaign_id]) map[cr.campaign_id] = [];
        map[cr.campaign_id].push(cr);
      }
      setCreativesByCamp(map);
    } catch {
      setError("Network error");
    }
  }, [email]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const totals = useMemo(() => {
    let impr = 0;
    let spend = 0;
    let active = 0;
    for (const r of rows) {
      impr += Number(r.impressions_today ?? 0);
      spend += Number(r.spend_today ?? 0);
      if (r.status === "active") active += 1;
    }
    return { impr, spend, active };
  }, [rows]);

  const hasAnyCreative = useMemo(
    () => rows.some((r) => (creativesByCamp[r.id] ?? []).length > 0),
    [rows, creativesByCamp]
  );

  async function patchCampaign(id: string, body: Record<string, unknown>) {
    if (!email) return;
    setBusyId(id);
    try {
      const res = await fetch(`/api/campaigns/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ advertiser_email: email, ...body })
      });
      if (!res.ok) {
        const j = await res.json();
        setError(typeof j.error === "string" ? j.error : "Update failed");
      } else void refresh();
    } catch {
      setError("Network error");
    }
    setBusyId(null);
  }

  async function patchCreative(id: string, body: Record<string, unknown>) {
    if (!email) return;
    setBusyId(`cr-${id}`);
    try {
      const res = await fetch(`/api/creatives/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ advertiser_email: email, ...body })
      });
      if (!res.ok) {
        const j = await res.json();
        setError(typeof j.error === "string" ? j.error : "Update failed");
      } else void refresh();
    } catch {
      setError("Network error");
    }
    setBusyId(null);
  }

  async function deleteCreative(id: string) {
    if (!email) return;
    if (!confirm("Remove this creative? It will be archived and removed from rotation.")) return;
    setBusyId(`del-${id}`);
    try {
      const res = await fetch(`/api/creatives/${id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ advertiser_email: email })
      });
      if (!res.ok) {
        const j = await res.json();
        setError(typeof j.error === "string" ? j.error : "Delete failed");
      } else void refresh();
    } catch {
      setError("Network error");
    }
    setBusyId(null);
  }

  function statusColor(st: string) {
    if (st === "active") return "#2ecc71";
    if (st === "pending") return "#ffd32a";
    return "var(--text-muted)";
  }

  if (!email) {
    return (
      <p style={{ color: "var(--text-muted)" }}>
        Add <code>?email=</code> to view campaigns.{" "}
        <Link href="/demand/create" style={{ color: "var(--accent)" }}>
          Create your first campaign
        </Link>
      </p>
    );
  }

  return (
    <div>
      <h1 style={{ color: "var(--text-bright)", marginTop: 0 }}>Campaign dashboard</h1>
      <p style={{ fontSize: 12, color: "var(--text-muted)" }}>
        Signed in view for <strong style={{ color: "var(--text-bright)" }}>{email}</strong>
      </p>
      {error && (
        <p style={{ color: "#ff4757", fontSize: 13 }}>
          {error}{" "}
          <button type="button" className="secondary" style={{ fontSize: 11 }} onClick={() => setError(null)}>
            Dismiss
          </button>
        </p>
      )}

      <div style={{ display: "flex", gap: 8, marginTop: 16, marginBottom: 8, flexWrap: "wrap" }}>
        {(
          [
            ["campaigns", "Campaigns"],
            ["analytics", "Analytics"],
            ["creatives", "Creatives"]
          ] as const
        ).map(([key, label]) => (
          <button
            key={key}
            type="button"
            className={tab === key ? undefined : "secondary"}
            style={{ fontSize: 12 }}
            onClick={() => setTab(key)}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === "campaigns" && (
        <>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))",
              gap: 12,
              marginTop: 12,
              marginBottom: 28
            }}
          >
            {[
              { k: "Active campaigns", v: String(totals.active) },
              { k: "Impressions today", v: totals.impr.toLocaleString() },
              { k: "Spend today (USD)", v: `$${totals.spend.toFixed(2)}` }
            ].map((x) => (
              <div key={x.k} className="portal-card" style={{ padding: 14, borderColor: "#00d4aa33" }}>
                <div style={{ fontSize: 10, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.04em" }}>{x.k}</div>
                <div style={{ fontSize: 22, fontWeight: 800, color: "#00d4aa", marginTop: 6 }}>{x.v}</div>
              </div>
            ))}
          </div>

          <div style={{ display: "grid", gap: 18 }}>
            {rows.map((r) => {
          const title = String(r.campaign_name ?? r.name ?? r.id);
          const adv = String(r.advertiser_name ?? r.advertiser ?? "—");
          const creatives = creativesByCamp[r.id] ?? [];
          const impr = Number(r.impressions_today ?? 0);
          const spend = Number(r.spend_today ?? 0);
          const rem = r.remaining_budget_today;
          const canToggle = r.status === "active" || r.status === "paused";
          return (
            <div key={r.id} className="card" style={{ borderLeft: "3px solid var(--accent)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
                <div>
                  <div style={{ fontWeight: 700, color: "var(--text-bright)", fontSize: 15 }}>{title}</div>
                  <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{adv}</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 12, color: "var(--text-bright)" }}>
                    CPM ${r.bid_price} · Budget ${r.daily_budget ?? "—"}/day
                  </div>
                  <div
                    style={{
                      marginTop: 6,
                      fontSize: 10,
                      fontWeight: 700,
                      color: statusColor(r.status),
                      textTransform: "uppercase",
                      letterSpacing: "0.06em"
                    }}
                  >
                    {r.status}
                  </div>
                </div>
              </div>

              <div style={{ marginTop: 12, fontSize: 12, color: "var(--text-muted)", display: "flex", flexWrap: "wrap", gap: 16 }}>
                <span>
                  Impressions won today:{" "}
                  <strong style={{ color: "var(--text-bright)" }}>{impr.toLocaleString()}</strong>
                </span>
                <span>
                  Spend today: <strong style={{ color: "var(--text-bright)" }}>${spend.toFixed(2)}</strong>
                </span>
                <span>
                  Remaining daily budget:{" "}
                  <strong style={{ color: "var(--text-bright)" }}>
                    {rem != null ? `$${Number(rem).toFixed(2)}` : "—"}
                  </strong>
                </span>
              </div>

              <TargetingChips c={r} />

              <div style={{ marginTop: 14, display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
                <Link
                  href={`/demand/create?add_creative=1&campaign_id=${encodeURIComponent(r.id)}&email=${encodeURIComponent(email)}`}
                  style={{ fontSize: 11, color: "var(--accent)", fontWeight: 600 }}
                >
                  + Add creative
                </Link>
                <button
                  type="button"
                  className="secondary"
                  style={{ fontSize: 11 }}
                  disabled={busyId === r.id}
                  onClick={() => {
                    setBidModal(r);
                    setBidInput(String(r.bid_price ?? ""));
                  }}
                >
                  Edit bid
                </button>
                {canToggle && (
                  <button
                    type="button"
                    className="secondary"
                    style={{ fontSize: 11 }}
                    disabled={busyId === r.id}
                    onClick={() =>
                      void patchCampaign(r.id, { status: r.status === "active" ? "paused" : "active" })
                    }
                  >
                    {r.status === "active" ? "Pause" : "Resume"}
                  </button>
                )}
              </div>

              {creatives.length > 0 && (
                <div style={{ marginTop: 16 }}>
                  <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 8 }}>Creatives</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    {creatives.map((cr) => {
                      const ic = Number(cr.impression_count ?? 0);
                      const cc = Number(cr.click_count ?? 0);
                      const ctr = ic > 0 ? (cc / ic) * 100 : 0;
                      return (
                        <div
                          key={cr.id}
                          style={{
                            display: "flex",
                            gap: 12,
                            flexWrap: "wrap",
                            padding: 10,
                            borderRadius: 8,
                            border: "1px solid var(--border)",
                            alignItems: "flex-start"
                          }}
                        >
                          <div style={{ width: 72, flexShrink: 0 }}>
                            {cr.image_url ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={cr.image_url}
                                alt=""
                                style={{ width: "100%", borderRadius: 4, border: "1px solid var(--border)" }}
                              />
                            ) : (
                              <div style={{ height: 56, background: "#0c1018", borderRadius: 4 }} />
                            )}
                            <div style={{ fontSize: 9, color: "var(--text-muted)", marginTop: 4 }}>{cr.size}</div>
                          </div>
                          <div style={{ flex: 1, minWidth: 200 }}>
                            <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-bright)" }}>{cr.name}</div>
                            <div style={{ marginTop: 6, fontSize: 10, display: "flex", flexWrap: "wrap", gap: 8 }}>
                              <span style={{ background: "#1a3a52", padding: "2px 6px", borderRadius: 4 }}>Imp {ic}</span>
                              <span style={{ background: "#1a3a52", padding: "2px 6px", borderRadius: 4 }}>Click {cc}</span>
                              <span style={{ background: "#1a3a52", padding: "2px 6px", borderRadius: 4 }}>CTR {ctr.toFixed(2)}%</span>
                              <span style={{ color: statusColor(cr.status), fontWeight: 700 }}>{cr.status}</span>
                            </div>
                            <label style={{ fontSize: 9, color: "var(--text-muted)", display: "block", marginTop: 8 }}>Click URL</label>
                            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
                              <input
                                style={{ flex: 1, minWidth: 180, fontSize: 11 }}
                                defaultValue={cr.click_url ?? ""}
                                key={cr.id + (cr.click_url ?? "")}
                                id={`url-${cr.id}`}
                              />
                              <button
                                type="button"
                                className="secondary"
                                style={{ fontSize: 10 }}
                                disabled={busyId === `cr-${cr.id}`}
                                onClick={() => {
                                  const el = document.getElementById(`url-${cr.id}`) as HTMLInputElement | null;
                                  const v = el?.value?.trim() ?? "";
                                  if (!v) return;
                                  void patchCreative(cr.id, { click_url: v });
                                }}
                              >
                                Save URL
                              </button>
                              <button
                                type="button"
                                className="secondary"
                                style={{ fontSize: 10 }}
                                disabled={busyId === `cr-${cr.id}` || cr.status === "archived"}
                                onClick={() =>
                                  void patchCreative(cr.id, {
                                    status: cr.status === "active" ? "paused" : "active"
                                  })
                                }
                              >
                                {cr.status === "active" ? "Pause" : "Resume"}
                              </button>
                              <button
                                type="button"
                                className="secondary"
                                style={{ fontSize: 10, color: "#ff6b6b" }}
                                disabled={busyId === `del-${cr.id}`}
                                onClick={() => void deleteCreative(cr.id)}
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
            })}
          </div>

          {rows.length === 0 && !error && (
            <div style={{ marginTop: 32, textAlign: "center", padding: 32, color: "var(--text-muted)" }}>
              No campaigns yet.{" "}
              <Link href="/demand/create" style={{ color: "#00d4aa", fontWeight: 700 }}>
                Create your first campaign →
              </Link>
            </div>
          )}
        </>
      )}

      {tab === "analytics" && <DemandAnalyticsTab email={email} />}

      {tab === "creatives" && (
        <div style={{ display: "grid", gap: 18 }}>
          {rows.map((r) => {
            const creatives = creativesByCamp[r.id] ?? [];
            if (creatives.length === 0) return null;
            const title = String(r.campaign_name ?? r.name ?? r.id);
            return (
              <div key={r.id} className="card" style={{ borderLeft: "3px solid var(--accent)" }}>
                <div style={{ fontWeight: 700, color: "var(--text-bright)", marginBottom: 12 }}>{title}</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {creatives.map((cr) => {
                    const ic = Number(cr.impression_count ?? 0);
                    const cc = Number(cr.click_count ?? 0);
                    const ctr = ic > 0 ? (cc / ic) * 100 : 0;
                    return (
                      <div
                        key={cr.id}
                        style={{
                          display: "flex",
                          gap: 12,
                          flexWrap: "wrap",
                          padding: 10,
                          borderRadius: 8,
                          border: "1px solid var(--border)",
                          alignItems: "flex-start"
                        }}
                      >
                        <div style={{ width: 72, flexShrink: 0 }}>
                          {cr.image_url ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={cr.image_url}
                              alt=""
                              style={{ width: "100%", borderRadius: 4, border: "1px solid var(--border)" }}
                            />
                          ) : (
                            <div style={{ height: 56, background: "#0c1018", borderRadius: 4 }} />
                          )}
                          <div style={{ fontSize: 9, color: "var(--text-muted)", marginTop: 4 }}>{cr.size}</div>
                        </div>
                        <div style={{ flex: 1, minWidth: 200 }}>
                          <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-bright)" }}>{cr.name}</div>
                          <div style={{ marginTop: 6, fontSize: 10, display: "flex", flexWrap: "wrap", gap: 8 }}>
                            <span style={{ background: "#1a3a52", padding: "2px 6px", borderRadius: 4 }}>Imp {ic}</span>
                            <span style={{ background: "#1a3a52", padding: "2px 6px", borderRadius: 4 }}>Click {cc}</span>
                            <span style={{ background: "#1a3a52", padding: "2px 6px", borderRadius: 4 }}>CTR {ctr.toFixed(2)}%</span>
                            <span style={{ color: statusColor(cr.status), fontWeight: 700 }}>{cr.status}</span>
                          </div>
                          <label style={{ fontSize: 9, color: "var(--text-muted)", display: "block", marginTop: 8 }}>Click URL</label>
                          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
                            <input
                              style={{ flex: 1, minWidth: 180, fontSize: 11 }}
                              defaultValue={cr.click_url ?? ""}
                              key={cr.id + (cr.click_url ?? "")}
                              id={`url-cr-tab-${cr.id}`}
                            />
                            <button
                              type="button"
                              className="secondary"
                              style={{ fontSize: 10 }}
                              disabled={busyId === `cr-${cr.id}`}
                              onClick={() => {
                                const el = document.getElementById(`url-cr-tab-${cr.id}`) as HTMLInputElement | null;
                                const v = el?.value?.trim() ?? "";
                                if (!v) return;
                                void patchCreative(cr.id, { click_url: v });
                              }}
                            >
                              Save URL
                            </button>
                            <button
                              type="button"
                              className="secondary"
                              style={{ fontSize: 10 }}
                              disabled={busyId === `cr-${cr.id}` || cr.status === "archived"}
                              onClick={() =>
                                void patchCreative(cr.id, {
                                  status: cr.status === "active" ? "paused" : "active"
                                })
                              }
                            >
                              {cr.status === "active" ? "Pause" : "Resume"}
                            </button>
                            <button
                              type="button"
                              className="secondary"
                              style={{ fontSize: 10, color: "#ff6b6b" }}
                              disabled={busyId === `del-${cr.id}`}
                              onClick={() => void deleteCreative(cr.id)}
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
          {!hasAnyCreative && !error && (
            <p style={{ color: "var(--text-muted)", fontSize: 13 }}>
              No creatives yet. Add creatives from the Campaigns tab or when creating a campaign.
            </p>
          )}
        </div>
      )}

      {bidModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.65)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 50,
            padding: 16
          }}
          role="dialog"
          aria-modal
        >
          <div className="card" style={{ maxWidth: 400, width: "100%" }}>
            <h3 style={{ marginTop: 0 }}>Edit bid (CPM USD)</h3>
            <input type="number" step="0.01" min={0.1} value={bidInput} onChange={(e) => setBidInput(e.target.value)} />
            <div style={{ display: "flex", gap: 10, marginTop: 16, justifyContent: "flex-end" }}>
              <button type="button" className="secondary" onClick={() => setBidModal(null)}>
                Cancel
              </button>
              <button
                type="button"
                disabled={busyId === bidModal.id}
                onClick={() => {
                  const n = Number(bidInput);
                  if (!Number.isFinite(n) || n < 0.1) return;
                  void patchCampaign(bidModal.id, { bid_price: n });
                  setBidModal(null);
                }}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function DemandDashboardPage() {
  return (
    <Suspense fallback={<p style={{ color: "var(--text-muted)" }}>Loading…</p>}>
      <Inner />
    </Suspense>
  );
}

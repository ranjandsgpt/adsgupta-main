"use client";

import { AdminToast } from "@/components/admin-toast";
import { Fragment, useCallback, useEffect, useState } from "react";

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
  creative_count?: number;
  created_at?: string;
  rejection_reason?: string | null;
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
};

function timeAgo(iso: string): string {
  const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}

export default function AdminDemandCampaignsPage() {
  const [rows, setRows] = useState<Campaign[]>([]);
  const [creatives, setCreatives] = useState<Creative[]>([]);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [bidEdit, setBidEdit] = useState<Record<string, string>>({});
  const [rejectCamp, setRejectCamp] = useState<Campaign | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [imgZoom, setImgZoom] = useState<string | null>(null);
  const [deleteCamp, setDeleteCamp] = useState<Campaign | null>(null);

  const load = useCallback(async () => {
    try {
      const [cr, cam] = await Promise.all([
        fetch("/api/creatives", { credentials: "include" }),
        fetch("/api/campaigns", { credentials: "include" })
      ]);
      const cj = await cr.json();
      const km = await cam.json();
      if (!cam.ok) {
        setError(km.error ?? "Failed to load campaigns");
        return;
      }
      setRows(Array.isArray(km) ? km : []);
      if (cr.ok && Array.isArray(cj)) setCreatives(cj);
    } catch {
      setError("Network error");
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function patchCampaign(id: string, body: Record<string, unknown>) {
    setBusy(id);
    setError(null);
    try {
      const res = await fetch(`/api/campaigns/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(body)
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Failed");
        return;
      }
      if (body.status === "active") setToast("Campaign is now live — auctions begin immediately");
      if (body.status === "rejected") setToast("Campaign rejected");
      await load();
    } catch {
      setError("Network error");
    } finally {
      setBusy(null);
    }
  }

  async function deleteCampaign(id: string) {
    setBusy(id);
    try {
      const res = await fetch(`/api/campaigns/${id}`, { method: "DELETE", credentials: "include" });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "Delete failed");
        return;
      }
      setToast("Campaign deleted");
      await load();
    } catch {
      setError("Network error");
    } finally {
      setBusy(null);
    }
  }

  async function patchCreative(id: string, body: Record<string, unknown>) {
    setBusy(`cr-${id}`);
    try {
      await fetch(`/api/creatives/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(body)
      });
      await load();
    } catch {
      setError("Network error");
    }
    setBusy(null);
  }

  const pending = rows.filter((r) => r.status === "pending");
  const crFor = (cid: string) => creatives.filter((c) => c.campaign_id === cid);

  return (
    <div>
      <AdminToast message={toast} onClear={() => setToast(null)} />
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 style={{ color: "var(--text-bright)", margin: 0 }}>Demand Management</h1>
          <p style={{ fontSize: 12, color: "var(--text-muted)", margin: "6px 0 0" }}>Total campaigns: {rows.length}</p>
        </div>
        <button type="button" onClick={() => (window.location.href = "/demand/create")}>
          Add Campaign
        </button>
      </div>

      {pending.length > 0 && (
        <div
          style={{
            marginTop: 16,
            padding: 14,
            borderRadius: 8,
            background: "#ffd32a18",
            border: "1px solid #ffd32a55"
          }}
        >
          <div style={{ fontWeight: 700, color: "#ffd32a", marginBottom: 10 }}>{pending.length} campaigns pending activation</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {pending.map((r) => {
              const title = String(r.campaign_name ?? r.name ?? r.id);
              const adv = String(r.advertiser_name ?? r.advertiser ?? "—");
              const thumbs = crFor(r.id).slice(0, 4);
              return (
                <div
                  key={r.id}
                  style={{
                    padding: 12,
                    background: "#0c1018",
                    borderRadius: 6,
                    display: "flex",
                    flexWrap: "wrap",
                    gap: 12,
                    justifyContent: "space-between",
                    alignItems: "center"
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 700, color: "var(--text-bright)" }}>{title}</div>
                    <div style={{ fontSize: 11, color: "var(--text-muted)" }}>
                      {adv} · CPM ${r.bid_price} · Budget ${r.daily_budget ?? "—"} · {crFor(r.id).length} creatives ·{" "}
                      {r.created_at ? timeAgo(String(r.created_at)) : "—"}
                    </div>
                    <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
                      {thumbs.map((c) =>
                        c.image_url ? (
                          <button
                            key={c.id}
                            type="button"
                            onClick={() => setImgZoom(c.image_url)}
                            style={{ padding: 0, border: "1px solid var(--border)", borderRadius: 4, background: "none", cursor: "pointer" }}
                          >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={c.image_url} alt="" style={{ width: 48, height: 48, objectFit: "cover", display: "block" }} />
                          </button>
                        ) : null
                      )}
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button type="button" disabled={busy === r.id} style={{ background: "#2ecc7122", borderColor: "#2ecc7155", color: "#2ecc71" }} onClick={() => patchCampaign(r.id, { status: "active" })}>
                      Activate
                    </button>
                    <button type="button" disabled={busy === r.id} style={{ background: "#ff475722", borderColor: "#ff475755", color: "#ff4757" }} onClick={() => setRejectCamp(r)}>
                      Reject
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {error && <p style={{ color: "#ff4757", fontSize: 12, marginTop: 12 }}>{error}</p>}

      <div style={{ overflow: "auto", marginTop: 16 }}>
        <table className="table">
          <thead>
            <tr>
              <th>Campaign</th>
              <th>Advertiser</th>
              <th>Bid</th>
              <th>Budget</th>
              <th>Creatives</th>
              <th>Status</th>
              <th>Impr today</th>
              <th>Spend</th>
              <th>Remaining</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => {
              const title = String(r.campaign_name ?? r.name ?? r.id);
              const adv = String(r.advertiser_name ?? r.advertiser ?? "—");
              const ncr = crFor(r.id).length;
              const st = String(r.status);
              const color = st === "active" ? "#2ecc71" : st === "paused" || st === "rejected" ? "#ff4757" : "#ffd32a";
              return (
                <Fragment key={r.id}>
                  <tr>
                    <td>{title}</td>
                    <td style={{ fontSize: 11 }}>{adv}</td>
                    <td style={{ whiteSpace: "nowrap" }}>
                      <input
                        style={{ width: 72, fontSize: 11 }}
                        value={bidEdit[r.id] ?? String(r.bid_price)}
                        onChange={(e) => setBidEdit((m) => ({ ...m, [r.id]: e.target.value }))}
                      />
                      <button
                        type="button"
                        style={{ fontSize: 10, marginLeft: 4 }}
                        onClick={() => {
                          const v = Number(bidEdit[r.id] ?? r.bid_price);
                          if (!Number.isFinite(v) || v < 0.1) return;
                          void patchCampaign(r.id, { bid_price: v });
                        }}
                      >
                        Save
                      </button>
                    </td>
                    <td>{r.daily_budget ?? "—"}</td>
                    <td>
                      <button type="button" className="link-button" onClick={() => setExpanded(expanded === r.id ? null : r.id)}>
                        {ncr} · {expanded === r.id ? "hide" : "view"}
                      </button>
                    </td>
                    <td style={{ color, fontWeight: 700, fontSize: 11 }}>{st}</td>
                    <td>{r.impressions_today ?? "—"}</td>
                    <td style={{ fontSize: 11 }}>{r.spend_today != null ? `$${Number(r.spend_today).toFixed(2)}` : "—"}</td>
                    <td style={{ fontSize: 11 }}>
                      {r.remaining_budget_today != null ? `$${Number(r.remaining_budget_today).toFixed(2)}` : "—"}
                    </td>
                    <td style={{ whiteSpace: "nowrap", fontSize: 11 }}>
                      {st === "active" && (
                        <button type="button" disabled={busy === r.id} onClick={() => patchCampaign(r.id, { status: "paused" })}>
                          Pause
                        </button>
                      )}
                      {(st === "paused" || st === "pending") && (
                        <button type="button" disabled={busy === r.id} onClick={() => patchCampaign(r.id, { status: "active" })} style={{ marginLeft: 6 }}>
                          Resume
                        </button>
                      )}
                      <button type="button" className="link-button" style={{ marginLeft: 8, color: "#ff4757" }} onClick={() => setDeleteCamp(r)}>
                        Delete
                      </button>
                    </td>
                  </tr>
                  {expanded === r.id && (
                    <tr>
                      <td colSpan={10} style={{ background: "#0c1018", padding: 12 }}>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
                          {crFor(r.id).map((c) => (
                            <div key={c.id} style={{ width: 160 }}>
                              {c.image_url ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={c.image_url} alt="" style={{ width: "100%", borderRadius: 4 }} />
                              ) : (
                                <div style={{ height: 90, background: "#080c14" }} />
                              )}
                              <div style={{ fontSize: 9, color: "var(--text-muted)", marginTop: 4 }}>{c.size}</div>
                              <div style={{ fontSize: 9, wordBreak: "break-all" }}>{c.click_url ?? "—"}</div>
                              <div style={{ fontSize: 9 }}>Imp: {c.impression_count ?? 0}</div>
                              <button type="button" style={{ fontSize: 10, marginTop: 4 }} onClick={() => patchCreative(c.id, { status: c.status === "active" ? "paused" : "active" })}>
                                {c.status === "active" ? "Pause creative" : "Resume"}
                              </button>
                            </div>
                          ))}
                          {crFor(r.id).length === 0 && <span style={{ fontSize: 11, color: "var(--text-muted)" }}>No creatives</span>}
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              );
            })}
          </tbody>
        </table>
      </div>

      {rejectCamp && (
        <div
          style={{ position: "fixed", inset: 0, background: "#000a", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 120 }}
          onClick={() => setRejectCamp(null)}
        >
          <div className="card" style={{ width: 420 }} onClick={(e) => e.stopPropagation()}>
            <div style={{ fontWeight: 700, marginBottom: 8 }}>Reject campaign</div>
            <textarea
              style={{ width: "100%", minHeight: 80, fontSize: 12 }}
              placeholder="Reason (optional)"
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
            />
            <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
              <button
                type="button"
                style={{ background: "#ff475722", color: "#ff4757" }}
                onClick={() =>
                  void (async () => {
                    const id = rejectCamp.id;
                    await patchCampaign(id, { status: "rejected", rejection_reason: rejectReason });
                    setRejectCamp(null);
                    setRejectReason("");
                  })()
                }
              >
                Reject
              </button>
              <button type="button" className="secondary" onClick={() => setRejectCamp(null)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteCamp && (
        <div
          style={{ position: "fixed", inset: 0, background: "#000a", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 120 }}
          onClick={() => setDeleteCamp(null)}
        >
          <div className="card" style={{ width: 400 }} onClick={(e) => e.stopPropagation()}>
            <div style={{ fontWeight: 700, color: "#ff4757", marginBottom: 8 }}>Delete campaign?</div>
            <p style={{ fontSize: 12, color: "var(--text-muted)" }}>Permanently remove {String(deleteCamp.campaign_name ?? deleteCamp.name)}?</p>
            <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
              <button type="button" style={{ background: "#ff475722", color: "#ff4757" }} onClick={() => void deleteCampaign(deleteCamp.id).then(() => setDeleteCamp(null))}>
                Delete
              </button>
              <button type="button" className="secondary" onClick={() => setDeleteCamp(null)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {imgZoom && (
        <div
          style={{ position: "fixed", inset: 0, background: "#000c", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 130 }}
          onClick={() => setImgZoom(null)}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={imgZoom} alt="" style={{ maxWidth: "90vw", maxHeight: "90vh" }} />
        </div>
      )}
    </div>
  );
}

"use client";

import { AdminToast } from "@/components/admin-toast";
import { Fragment, useCallback, useEffect, useState } from "react";

type Campaign = Record<string, unknown> & {
  id: string;
  campaign_name?: string;
  name?: string;
  advertiser_name?: string;
  advertiser?: string;
  bid_price: string;
  daily_budget?: string | null;
  status: string;
};

type Creative = {
  id: string;
  campaign_id: string;
  name: string;
  size: string;
  image_url: string | null;
  click_url: string | null;
  status: string;
};

export default function AdminDemandCampaignsPage() {
  const [rows, setRows] = useState<Campaign[]>([]);
  const [creatives, setCreatives] = useState<Creative[]>([]);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

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

  async function patchCampaign(id: string, status: string) {
    setBusy(id);
    setError(null);
    try {
      const res = await fetch(`/api/campaigns/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ status })
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Failed");
        setBusy(null);
        return;
      }
      if (status === "active") setToast("Campaign live — auctions begin immediately");
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
      <h1 style={{ color: "var(--text-bright)", marginTop: 0 }}>Campaign &amp; Creative Management</h1>
      {pending.length > 0 && (
        <div style={{ marginBottom: 12 }}>
          <span style={{ background: "#ffd32a18", border: "1px solid #ffd32a55", color: "#ffd32a", padding: "4px 10px", borderRadius: 4, fontSize: 11 }}>
            {pending.length} pending campaigns
          </span>
        </div>
      )}
      {error && <p style={{ color: "#ff4757", fontSize: 12 }}>{error}</p>}
      <div style={{ overflow: "auto" }}>
        <table className="table">
          <thead>
            <tr>
              <th>Campaign</th>
              <th>Advertiser</th>
              <th>Bid</th>
              <th>Budget</th>
              <th>Creatives</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => {
              const title = String(r.campaign_name ?? r.name ?? r.id);
              const adv = String(r.advertiser_name ?? r.advertiser ?? "—");
              const ncr = crFor(r.id).length;
              return (
                <Fragment key={r.id}>
                  <tr>
                    <td>{title}</td>
                    <td style={{ fontSize: 11 }}>{adv}</td>
                    <td>{r.bid_price}</td>
                    <td>{r.daily_budget ?? "—"}</td>
                    <td>
                      <button type="button" className="link-button" onClick={() => setExpanded(expanded === r.id ? null : r.id)}>
                        {ncr} · {expanded === r.id ? "hide" : "view"}
                      </button>
                    </td>
                    <td style={{ color: r.status === "active" ? "#2ecc71" : r.status === "paused" ? "#ff4757" : "#ffd32a" }}>{r.status}</td>
                    <td style={{ whiteSpace: "nowrap" }}>
                      {r.status === "pending" && (
                        <button type="button" disabled={busy === r.id} onClick={() => patchCampaign(r.id, "active")}>
                          Activate
                        </button>
                      )}
                      {r.status === "active" && (
                        <button type="button" disabled={busy === r.id} onClick={() => patchCampaign(r.id, "paused")}>
                          Pause
                        </button>
                      )}
                      {r.status === "paused" && (
                        <button type="button" disabled={busy === r.id} onClick={() => patchCampaign(r.id, "active")}>
                          Resume
                        </button>
                      )}
                    </td>
                  </tr>
                  {expanded === r.id && (
                    <tr>
                      <td colSpan={7} style={{ background: "#0c1018" }}>
                        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", padding: 8 }}>
                          {crFor(r.id).map((c) => (
                            <div key={c.id} style={{ width: 140 }}>
                              {c.image_url ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={c.image_url} alt="" style={{ width: "100%", borderRadius: 4 }} />
                              ) : (
                                <div style={{ height: 80, background: "#080c14" }} />
                              )}
                              <div style={{ fontSize: 9, color: "var(--text-muted)", marginTop: 4 }}>{c.size}</div>
                              <a href={c.click_url ?? "#"} style={{ fontSize: 9, color: "var(--accent)", wordBreak: "break-all" }} target="_blank" rel="noreferrer">
                                click
                              </a>
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
      <p style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 16 }}>
        Upload additional creatives via the self-serve flow or extend this screen with an upload modal later.
      </p>
    </div>
  );
}

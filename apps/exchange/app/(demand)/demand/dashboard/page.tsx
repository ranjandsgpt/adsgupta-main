"use client";

import { DemandCampaignTools } from "@/components/demand-campaign-tools";
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
  ab_test_active?: boolean;
  ab_auto_pause_loser?: boolean;
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
  scan_passed?: boolean | null;
  scan_issues?: string[] | null;
  scan_warnings?: string[] | null;
  ab_group?: string | null;
  ab_weight?: string | number | null;
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
        background: "#0066cc18",
        color: "#0066cc",
        margin: "2px 4px 2px 0",
        border: "1px solid #0066cc44"
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
  else parts.push("Geo: All countries");
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
  const [tab, setTab] = useState<"campaigns" | "analytics" | "creatives" | "bulk" | "audience">("campaigns");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkCsv, setBulkCsv] = useState("");
  const [bulkResult, setBulkResult] = useState<{
    inserted: number;
    skipped: number;
    errors: Array<{ row: number; field: string; message: string }>;
  } | null>(null);
  const [audienceSegs, setAudienceSegs] = useState<
    Array<{ publisherId: string; name: string; domain: string; estimatedReach: number; eventCount: number }>
  >([]);

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

  useEffect(() => {
    if (tab !== "audience" || !email) return;
    let cancelled = false;
    void fetch("/api/audience/segments")
      .then((r) => r.json())
      .then((j: { segments?: typeof audienceSegs }) => {
        if (!cancelled && j.segments && Array.isArray(j.segments)) setAudienceSegs(j.segments);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [tab, email]);

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

  const draftRows = useMemo(() => rows.filter((r) => r.status === "draft"), [rows]);

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

  function toggleSelect(cid: string) {
    setSelectedIds((prev) => (prev.includes(cid) ? prev.filter((x) => x !== cid) : [...prev, cid]));
  }

  async function bulkSetStatus(st: string) {
    if (!email || selectedIds.length === 0) return;
    setBusyId("bulk");
    try {
      const res = await fetch("/api/campaigns/bulk-status", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: selectedIds, status: st, advertiser_email: email })
      });
      const j = await res.json();
      if (!res.ok) setError(typeof j.error === "string" ? j.error : "Bulk update failed");
      else {
        setSelectedIds([]);
        void refresh();
      }
    } catch {
      setError("Network error");
    }
    setBusyId(null);
  }

  async function duplicateCampaign(cid: string) {
    if (!email) return;
    setBusyId(cid);
    try {
      const res = await fetch(`/api/campaigns/${encodeURIComponent(cid)}/duplicate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ advertiser_email: email })
      });
      const j = (await res.json()) as { id?: string; error?: string };
      if (!res.ok) setError(typeof j.error === "string" ? j.error : "Duplicate failed");
      else void refresh();
    } catch {
      setError("Network error");
    }
    setBusyId(null);
  }

  async function submitBulkCsv() {
    if (!email || !bulkCsv.trim()) return;
    setBusyId("bulkcsv");
    setBulkResult(null);
    try {
      const res = await fetch("/api/campaigns/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ csv: bulkCsv, advertiser_email: email })
      });
      const j = await res.json();
      if (!res.ok) setError(typeof j.error === "string" ? j.error : "Import failed");
      else {
        setBulkResult(j as typeof bulkResult);
        void refresh();
      }
    } catch {
      setError("Network error");
    }
    setBusyId(null);
  }

  async function rescanCreative(id: string) {
    setBusyId(`scan-${id}`);
    try {
      const res = await fetch(`/api/creatives/${id}/scan`, { method: "POST", credentials: "include" });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        setError(typeof (j as { error?: string }).error === "string" ? (j as { error: string }).error : "Rescan failed");
        return;
      }
      void refresh();
    } catch {
      setError("Network error");
    } finally {
      setBusyId(null);
    }
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
            ["creatives", "Creatives"],
            ["bulk", "Bulk import"],
            ["audience", "Audience"]
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
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 12, alignItems: "center" }}>
            <a
              className="secondary"
              style={{ fontSize: 11, padding: "8px 12px", display: "inline-block" }}
              href={email ? `/api/campaigns/export?email=${encodeURIComponent(email)}` : "#"}
              target="_blank"
              rel="noreferrer"
            >
              Export CSV
            </a>
            <button type="button" className="secondary" style={{ fontSize: 11 }} disabled={selectedIds.length === 0} onClick={() => void bulkSetStatus("paused")}>
              Pause selected
            </button>
            <button type="button" className="secondary" style={{ fontSize: 11 }} disabled={selectedIds.length === 0} onClick={() => void bulkSetStatus("active")}>
              Resume selected
            </button>
          </div>

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
              <div key={x.k} className="portal-card" style={{ padding: 14, borderColor: "#0066cc33" }}>
                <div style={{ fontSize: 10, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.04em" }}>{x.k}</div>
                <div style={{ fontSize: 22, fontWeight: 800, color: "#0066cc", marginTop: 6 }}>{x.v}</div>
              </div>
            ))}
          </div>

          {draftRows.length > 0 && (
            <div className="card" style={{ marginBottom: 20, borderColor: "#ffd32a44" }}>
              <div style={{ fontSize: 12, fontWeight: 800, color: "#ffd32a", marginBottom: 10, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                Draft campaigns
              </div>
              <ul style={{ margin: 0, padding: 0, listStyle: "none" }}>
                {draftRows.map((d) => (
                  <li
                    key={d.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: 12,
                      padding: "10px 0",
                      borderBottom: "1px solid var(--border)",
                      fontSize: 13
                    }}
                  >
                    <span style={{ color: "var(--text-bright)", fontWeight: 600 }}>{String(d.campaign_name ?? d.name ?? d.id)}</span>
                    <Link
                      href={`/demand/create?campaign_id=${encodeURIComponent(d.id)}&email=${encodeURIComponent(email)}`}
                      style={{ color: "#0066cc", fontWeight: 700, textDecoration: "none", whiteSpace: "nowrap" }}
                    >
                      Complete setup →
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}

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
              <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 12, alignItems: "flex-start" }}>
                <label style={{ display: "flex", alignItems: "flex-start", gap: 10, cursor: "pointer", margin: 0 }}>
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(r.id)}
                    onChange={() => toggleSelect(r.id)}
                    style={{ marginTop: 4 }}
                  />
                  <div>
                  <div style={{ fontWeight: 700, color: "var(--text-bright)", fontSize: 15 }}>{title}</div>
                  <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{adv}</div>
                  </div>
                </label>
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
                <button type="button" className="secondary" style={{ fontSize: 11 }} disabled={busyId === r.id} onClick={() => void duplicateCampaign(r.id)}>
                  Duplicate
                </button>
              </div>

              <DemandCampaignTools
                campaign={r}
                creatives={creatives}
                email={email!}
                onRefresh={refresh}
                patchCampaign={patchCampaign}
                patchCreative={patchCreative}
                busyId={busyId}
              />

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
                              <span
                                style={{
                                  background:
                                    cr.status === "flagged"
                                      ? "#ff475722"
                                      : cr.scan_passed === false
                                        ? "#ff8c4222"
                                        : "#2ecc7122",
                                  padding: "2px 6px",
                                  borderRadius: 4,
                                  fontWeight: 700,
                                  color:
                                    cr.status === "flagged" ? "#ff4757" : cr.scan_passed === false ? "#ff8c42" : "#2ecc71"
                                }}
                              >
                                {cr.status === "flagged" ? "Scan: flagged" : cr.scan_passed === false ? "Scan: issue" : "Scan: passed"}
                              </span>
                            </div>
                            {(cr.scan_issues?.length ?? 0) > 0 && (
                              <ul style={{ margin: "8px 0 0", paddingLeft: 18, fontSize: 10, color: "#ff8c42" }}>
                                {(cr.scan_issues ?? []).map((x) => (
                                  <li key={x}>{x}</li>
                                ))}
                              </ul>
                            )}
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
                                style={{ fontSize: 10 }}
                                disabled={busyId === `scan-${cr.id}` || !cr.image_url}
                                onClick={() => void rescanCreative(cr.id)}
                              >
                                Rescan
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
              <Link href="/demand/create" style={{ color: "#0066cc", fontWeight: 700 }}>
                Create your first campaign →
              </Link>
            </div>
          )}
        </>
      )}

      {tab === "bulk" && email && (
        <div className="card" style={{ marginTop: 12 }}>
          <div style={{ fontWeight: 800, marginBottom: 8 }}>Bulk CSV import</div>
          <p style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 12 }}>
            Columns: campaign_name, advertiser_name, advertiser_email, bid_price_cpm, daily_budget_usd, target_sizes,
            start_date, end_date. Rows must use your dashboard email as advertiser_email.
          </p>
          <button
            type="button"
            className="secondary"
            style={{ fontSize: 11, marginBottom: 12 }}
            onClick={() =>
              setBulkCsv(
                "campaign_name,advertiser_name,advertiser_email,bid_price_cpm,daily_budget_usd,target_sizes,start_date,end_date\nExample line,Acme,acme@test.com,2.50,100,300x250|728x90,,"
              )
            }
          >
            Load CSV template
          </button>
          <textarea
            value={bulkCsv}
            onChange={(e) => setBulkCsv(e.target.value)}
            rows={10}
            style={{ width: "100%", fontFamily: "monospace", fontSize: 11 }}
            placeholder="Paste CSV..."
          />
          <div style={{ marginTop: 12, display: "flex", gap: 8, flexWrap: "wrap" }}>
            <button type="button" disabled={busyId === "bulkcsv" || !bulkCsv.trim()} onClick={() => void submitBulkCsv()}>
              {busyId === "bulkcsv" ? "Importing…" : "Import all"}
            </button>
          </div>
          {bulkResult && (
            <div style={{ marginTop: 16, fontSize: 12 }}>
              <p>
                Imported <strong>{bulkResult.inserted}</strong>, skipped <strong>{bulkResult.skipped}</strong>.
              </p>
              {bulkResult.errors.length > 0 && (
                <table className="table" style={{ marginTop: 8, fontSize: 11 }}>
                  <thead>
                    <tr>
                      <th>Row</th>
                      <th>Field</th>
                      <th>Error</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bulkResult.errors.slice(0, 30).map((e, i) => (
                      <tr key={i}>
                        <td>{e.row}</td>
                        <td>{e.field}</td>
                        <td>{e.message}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </div>
      )}

      {tab === "audience" && (
        <div style={{ marginTop: 12 }}>
          <p style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 12 }}>
            Retargeting pixels: publishers firing <code>/api/pixel/[publisherId]</code>. Add events to campaign targeting (Geo / domains)
            in a future release — for now copy publisher IDs into notes.
          </p>
          <div style={{ display: "grid", gap: 10 }}>
            {audienceSegs.length === 0 && <p style={{ color: "var(--text-muted)", fontSize: 12 }}>No pixel segments yet.</p>}
            {audienceSegs.map((s) => (
              <div key={s.publisherId} className="card" style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
                <div>
                  <strong style={{ color: "var(--text-bright)" }}>{s.name}</strong>
                  <div style={{ fontSize: 11, color: "var(--text-muted)" }}>
                    {s.domain} · ~{s.estimatedReach.toLocaleString()} reach · {s.eventCount} events
                  </div>
                  <code style={{ fontSize: 10 }}>{s.publisherId}</code>
                </div>
                <button
                  type="button"
                  className="secondary"
                  style={{ fontSize: 10 }}
                  onClick={() => void navigator.clipboard.writeText(s.publisherId)}
                >
                  Copy publisher ID
                </button>
              </div>
            ))}
          </div>
        </div>
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
                            <span
                              style={{
                                background:
                                  cr.status === "flagged"
                                    ? "#ff475722"
                                    : cr.scan_passed === false
                                      ? "#ff8c4222"
                                      : "#2ecc7122",
                                padding: "2px 6px",
                                borderRadius: 4,
                                fontWeight: 700,
                                color:
                                  cr.status === "flagged" ? "#ff4757" : cr.scan_passed === false ? "#ff8c42" : "#2ecc71"
                              }}
                            >
                              {cr.status === "flagged" ? "Scan: flagged" : cr.scan_passed === false ? "Scan: issue" : "Scan: passed"}
                            </span>
                          </div>
                          {(cr.scan_issues?.length ?? 0) > 0 && (
                            <ul style={{ margin: "8px 0 0", paddingLeft: 18, fontSize: 10, color: "#ff8c42" }}>
                              {(cr.scan_issues ?? []).map((x) => (
                                <li key={x}>{x}</li>
                              ))}
                            </ul>
                          )}
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
                              style={{ fontSize: 10 }}
                              disabled={busyId === `scan-${cr.id}` || !cr.image_url}
                              onClick={() => void rescanCreative(cr.id)}
                            >
                              Rescan
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

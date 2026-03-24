"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

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

function Inner() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email");
  const [rows, setRows] = useState<Campaign[]>([]);
  const [creativesByCamp, setCreativesByCamp] = useState<Record<string, Creative[]>>({});
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!email) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/campaigns?email=${encodeURIComponent(email)}`);
        const data = await res.json();
        if (cancelled) return;
        if (!res.ok) {
          setError(typeof data.error === "string" ? data.error : "Failed to load");
          return;
        }
        const list = Array.isArray(data) ? (data as Campaign[]) : [];
        setRows(list);
        const map: Record<string, Creative[]> = {};
        await Promise.all(
          list.map(async (c) => {
            const cr = await fetch(
              `/api/creatives?campaign_id=${encodeURIComponent(c.id)}&email=${encodeURIComponent(email ?? "")}`
            );
            if (cr.ok) {
              const j = await cr.json();
              map[c.id] = Array.isArray(j) ? j : [];
            }
          })
        );
        if (!cancelled) setCreativesByCamp(map);
      } catch {
        if (!cancelled) setError("Network error");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [email]);

  if (!email) {
    return (
      <p style={{ color: "var(--text-muted)" }}>
        Add <code>?email=</code> to view campaigns.{" "}
        <Link href="/demand/create" style={{ color: "var(--accent)" }}>
          Create a campaign
        </Link>
      </p>
    );
  }

  return (
    <div>
      <h1 style={{ color: "var(--text-bright)", marginTop: 0 }}>Demand dashboard</h1>
      <p style={{ fontSize: 12, color: "var(--text-muted)" }}>Email: {email}</p>
      {error && <p style={{ color: "#ff4757" }}>{error}</p>}
      <div style={{ display: "grid", gap: 16, marginTop: 20 }}>
        {rows.map((r) => {
          const title = String(r.campaign_name ?? r.name ?? r.id);
          const adv = String(r.advertiser_name ?? r.advertiser ?? "—");
          const creatives = creativesByCamp[r.id] ?? [];
          return (
            <div key={r.id} className="card" style={{ borderLeft: "3px solid var(--accent)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
                <div>
                  <div style={{ fontWeight: 700, color: "var(--text-bright)" }}>{title}</div>
                  <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{adv}</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 11, color: "var(--text-muted)" }}>CPM ${r.bid_price}</div>
                  <div style={{ fontSize: 11, color: "var(--text-muted)" }}>
                    Budget ${r.daily_budget ?? "—"} / day
                  </div>
                  <div
                    style={{
                      marginTop: 6,
                      fontSize: 10,
                      fontWeight: 700,
                      color: r.status === "active" ? "#2ecc71" : "#ffd32a",
                      textTransform: "uppercase"
                    }}
                  >
                    {r.status}
                  </div>
                </div>
              </div>
              <div style={{ marginTop: 10, fontSize: 11, color: "var(--text-muted)" }}>
                Impressions won · <span style={{ color: "var(--text-bright)" }}>—</span> · est. spend ·{" "}
                <span style={{ color: "var(--text-bright)" }}>—</span>
              </div>
              <div style={{ marginTop: 12 }}>
                <Link href={`/demand/create`} style={{ fontSize: 11, color: "var(--accent)" }}>
                  + Add creative (new wizard)
                </Link>
              </div>
              {creatives.length > 0 && (
                <div style={{ marginTop: 12, display: "flex", gap: 10, flexWrap: "wrap" }}>
                  {creatives.map((cr) => (
                    <div key={cr.id} style={{ width: 120 }}>
                      {cr.image_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={cr.image_url} alt="" style={{ width: "100%", borderRadius: 4, border: "1px solid var(--border)" }} />
                      ) : (
                        <div style={{ height: 80, background: "#0c1018", borderRadius: 4 }} />
                      )}
                      <div style={{ fontSize: 9, color: "var(--text-muted)", marginTop: 4 }}>{cr.size}</div>
                      <div style={{ fontSize: 9, color: "#2ecc71" }}>{cr.status}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
      {rows.length === 0 && !error && (
        <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 16 }}>No campaigns yet.</p>
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

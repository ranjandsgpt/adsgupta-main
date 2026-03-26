"use client";

import { useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";

type Row = {
  id: string;
  auction_id: string;
  created_at: string;
  ad_unit_id: string | null;
  publisher_id: string | null;
  winning_campaign_id: string | null;
  winning_creative_id: string | null;
  winning_bid: string | null;
  floor_price: string | null;
  bid_count: string | null;
  cleared: boolean;
  page_url: string | null;
  country: string | null;
  campaign_name: string | null;
};

export default function DemandOpenRtbLogPage() {
  const { data: session } = useSession();
  const email = (session?.user?.campaignEmail ?? session?.user?.email ?? "").toLowerCase();

  const [rows, setRows] = useState<Row[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function run() {
      if (!email) return;
      setError(null);
      const res = await fetch(`/api/demand/openrtb-log?email=${encodeURIComponent(email)}`, { credentials: "include" });
      const j = await res.json();
      if (!res.ok) {
        setError((j as any)?.error || "Failed");
        setRows([]);
        return;
      }
      setRows((j as any)?.rows ?? []);
    }
    void run();
  }, [email]);

  const visible = useMemo(() => rows.slice(0, 200), [rows]);

  return (
    <div className="page-content" style={{ paddingTop: 24, paddingBottom: 40 }}>
      <h1 style={{ margin: 0, fontSize: 18, color: "var(--text-bright)" }}>OpenRTB Bid Requests Log</h1>
      <p style={{ margin: "6px 0 0", fontSize: 12, color: "var(--text-muted)" }}>
        Last 200 cleared auctions for your campaigns (winner-side only).
      </p>

      {error ? (
        <div className="card" style={{ marginTop: 12 }}>
          <div style={{ padding: 14, color: "#ff8f8f" }}>{error}</div>
        </div>
      ) : null}

      <div className="card" style={{ marginTop: 12, overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
          <thead>
            <tr style={{ textAlign: "left", color: "var(--text-muted)" }}>
              {["Time", "Campaign", "Cleared", "Bid", "Floor", "Bids", "Country", "Page"].map((h) => (
                <th key={h} style={{ padding: "10px 12px", borderBottom: "1px solid var(--border)", fontWeight: 800 }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {visible.map((r) => (
              <tr key={r.id}>
                <td style={{ padding: "10px 12px", borderBottom: "1px solid var(--border)", whiteSpace: "nowrap" }}>
                  {r.created_at}
                </td>
                <td style={{ padding: "10px 12px", borderBottom: "1px solid var(--border)" }}>
                  {r.campaign_name ?? r.winning_campaign_id ?? "—"}
                </td>
                <td style={{ padding: "10px 12px", borderBottom: "1px solid var(--border)" }}>
                  {r.cleared ? "yes" : "no"}
                </td>
                <td style={{ padding: "10px 12px", borderBottom: "1px solid var(--border)" }}>{r.winning_bid ?? "—"}</td>
                <td style={{ padding: "10px 12px", borderBottom: "1px solid var(--border)" }}>{r.floor_price ?? "—"}</td>
                <td style={{ padding: "10px 12px", borderBottom: "1px solid var(--border)" }}>{r.bid_count ?? "—"}</td>
                <td style={{ padding: "10px 12px", borderBottom: "1px solid var(--border)" }}>{r.country ?? "—"}</td>
                <td style={{ padding: "10px 12px", borderBottom: "1px solid var(--border)", maxWidth: 420 }}>
                  <span style={{ color: "var(--text-muted)" }}>{r.page_url ?? "—"}</span>
                </td>
              </tr>
            ))}
            {visible.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ padding: 14, color: "var(--text-muted)" }}>
                  No auctions yet
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}


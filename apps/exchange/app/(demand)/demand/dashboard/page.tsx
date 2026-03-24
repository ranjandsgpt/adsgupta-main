"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

type Campaign = {
  id: string;
  name: string;
  advertiser: string;
  bid_price: string;
  status: string;
  contact_email: string | null;
  created_at: string;
};

function Inner() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email");
  const [rows, setRows] = useState<Campaign[]>([]);
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
          setError(data.error ?? "Failed to load");
          return;
        }
        setRows(Array.isArray(data) ? data : []);
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
        Add <code>?email=</code> to view your campaigns.{" "}
        <a href="/demand/create" style={{ color: "var(--accent)" }}>
          Create a campaign
        </a>
      </p>
    );
  }

  return (
    <div>
      <h1 style={{ color: "var(--text-bright)", marginTop: 0 }}>Demand dashboard</h1>
      <p style={{ fontSize: 12, color: "var(--text-muted)" }}>Contact: {email}</p>
      {error && <p style={{ color: "#ff4757" }}>{error}</p>}
      <div style={{ marginTop: 16, overflow: "auto" }}>
        <table className="table">
          <thead>
            <tr>
              <th>Campaign</th>
              <th>Advertiser</th>
              <th>CPM</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id}>
                <td style={{ fontFamily: "monospace", fontSize: 11 }}>{r.name}</td>
                <td>{r.advertiser}</td>
                <td>{r.bid_price}</td>
                <td style={{ color: r.status === "active" ? "#2ecc71" : "#ffd32a" }}>{r.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {rows.length === 0 && !error && (
          <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 8 }}>No campaigns yet.</p>
        )}
      </div>
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

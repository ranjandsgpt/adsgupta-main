"use client";

import { useEffect, useState } from "react";

export default function SubscribersAdminClient() {
  const [rows, setRows] = useState([]);
  const [filter, setFilter] = useState("active");
  const [loading, setLoading] = useState(true);

  function load() {
    setLoading(true);
    const q = filter === "all" ? "" : `?status=${filter}`;
    fetch(`/api/subscribers${q}`)
      .then((r) => r.json())
      .then((d) => setRows(d.subscribers || []))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
  }, [filter]);

  function exportCsv() {
    const q = filter === "all" ? "" : `?status=${encodeURIComponent(filter)}`;
    window.open(`/api/subscribers/export${q}`, "_blank", "noopener,noreferrer");
  }

  const total = rows.length;
  const active = rows.filter((r) => r.status === "active").length;

  return (
    <div>
      <h1 className="hero-title" style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>
        Subscribers
      </h1>
      <p style={{ color: "var(--ads-text-muted)", marginBottom: "1rem" }}>
        Total: {total} · Active (filtered): {active}
      </p>

      <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginBottom: "1rem" }}>
        <select value={filter} onChange={(e) => setFilter(e.target.value)} className="header-btn">
          <option value="active">Active</option>
          <option value="all">All statuses</option>
        </select>
        <button type="button" className="header-btn header-btn-primary" onClick={exportCsv}>
          Export CSV
        </button>
      </div>

      {loading ? (
        <p style={{ color: "var(--ads-text-muted)" }}>Loading…</p>
      ) : (
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.88rem" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.1)", textAlign: "left" }}>
              <th style={{ padding: "0.5rem" }}>Email</th>
              <th style={{ padding: "0.5rem" }}>Status</th>
              <th style={{ padding: "0.5rem" }}>Source</th>
              <th style={{ padding: "0.5rem" }}>Date</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                <td style={{ padding: "0.5rem" }}>{r.email}</td>
                <td style={{ padding: "0.5rem" }}>{r.status}</td>
                <td style={{ padding: "0.5rem" }}>{r.source || "—"}</td>
                <td style={{ padding: "0.5rem" }}>{r.created_at ? new Date(r.created_at).toLocaleString() : "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

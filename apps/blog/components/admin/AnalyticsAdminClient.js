"use client";

import { useEffect, useState } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  BarChart,
  Bar,
} from "recharts";

export default function AnalyticsAdminClient() {
  const [data, setData] = useState(null);
  const [err, setErr] = useState("");

  useEffect(() => {
    fetch("/api/admin/analytics/summary")
      .then((r) => r.json())
      .then((d) => {
        if (d.error) throw new Error(d.error);
        setData(d);
      })
      .catch((e) => setErr(e.message || "Failed"));
  }, []);

  if (err) return <p style={{ color: "#f87171" }}>{err}</p>;
  if (!data) return <p style={{ color: "var(--ads-text-muted)" }}>Loading…</p>;

  return (
    <div>
      <h1 className="hero-title" style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>
        Analytics
      </h1>
      <p style={{ color: "var(--ads-text-muted)", marginBottom: "1.5rem" }}>Last 30 days · views from /archives/[slug] tracking</p>

      <div style={{ width: "100%", height: 280, marginBottom: "2rem" }}>
        <ResponsiveContainer>
          <LineChart data={data.series || []}>
            <XAxis dataKey="date" stroke="#64748b" fontSize={11} />
            <YAxis stroke="#64748b" fontSize={11} />
            <Tooltip contentStyle={{ background: "#111827", border: "1px solid #334155" }} />
            <Line type="monotone" dataKey="views" stroke="#06b6d4" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <h2 style={{ fontSize: "1.1rem", marginBottom: "0.75rem" }}>Top posts</h2>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.88rem", marginBottom: "2rem" }}>
        <thead>
          <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.1)", textAlign: "left" }}>
            <th style={{ padding: "0.5rem" }}>Title</th>
            <th style={{ padding: "0.5rem" }}>Views</th>
          </tr>
        </thead>
        <tbody>
          {(data.topPosts || []).map((p) => (
            <tr key={p.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
              <td style={{ padding: "0.5rem" }}>{p.title}</td>
              <td style={{ padding: "0.5rem" }}>{p.views}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "1rem" }}>
        <div style={{ height: 220 }}>
          <h3 style={{ fontSize: "0.95rem", marginBottom: "0.5rem" }}>Traffic sources</h3>
          <ResponsiveContainer>
            <BarChart data={data.sources || []}>
              <XAxis dataKey="name" stroke="#64748b" fontSize={10} />
              <YAxis stroke="#64748b" fontSize={10} />
              <Tooltip contentStyle={{ background: "#111827", border: "1px solid #334155" }} />
              <Bar dataKey="value" fill="#06b6d4" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div style={{ height: 220 }}>
          <h3 style={{ fontSize: "0.95rem", marginBottom: "0.5rem" }}>Devices</h3>
          <ResponsiveContainer>
            <BarChart data={data.devices || []}>
              <XAxis dataKey="name" stroke="#64748b" fontSize={10} />
              <YAxis stroke="#64748b" fontSize={10} />
              <Tooltip contentStyle={{ background: "#111827", border: "1px solid #334155" }} />
              <Bar dataKey="value" fill="#22d3ee" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

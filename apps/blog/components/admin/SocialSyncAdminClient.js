"use client";

import { useEffect, useState } from "react";

export default function SocialSyncAdminClient() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/social-syncs")
      .then((r) => r.json())
      .then((d) => setItems(d.items || []))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <h1 className="hero-title" style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>
        Social Sync
      </h1>
      <p style={{ color: "var(--ads-text-muted)", marginBottom: "1rem" }}>
        OAuth connections are stored on your profile. Sync log shows cross-post attempts (expand with automation later).
      </p>

      {loading ? (
        <p style={{ color: "var(--ads-text-muted)" }}>Loading…</p>
      ) : (
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.88rem" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.1)", textAlign: "left" }}>
              <th style={{ padding: "0.5rem" }}>Post</th>
              <th style={{ padding: "0.5rem" }}>Platform</th>
              <th style={{ padding: "0.5rem" }}>Status</th>
              <th style={{ padding: "0.5rem" }}>Date</th>
              <th style={{ padding: "0.5rem" }}>Link</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ padding: "1rem", color: "var(--ads-text-muted)" }}>
                  No sync events yet.
                </td>
              </tr>
            ) : (
              items.map((r) => (
                <tr key={r.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                  <td style={{ padding: "0.5rem" }}>{r.post_title}</td>
                  <td style={{ padding: "0.5rem" }}>{r.platform}</td>
                  <td style={{ padding: "0.5rem" }}>{r.status}</td>
                  <td style={{ padding: "0.5rem" }}>{r.created_at ? new Date(r.created_at).toLocaleString() : "—"}</td>
                  <td style={{ padding: "0.5rem" }}>
                    {r.platform_post_id ? (
                      <a href={r.platform_post_id} target="_blank" rel="noreferrer" style={{ color: "#06b6d4" }}>
                        Open
                      </a>
                    ) : (
                      "—"
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      )}
    </div>
  );
}

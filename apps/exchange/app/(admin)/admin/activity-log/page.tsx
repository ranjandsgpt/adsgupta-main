"use client";

import { useCallback, useEffect, useState } from "react";

type LogRow = {
  id: string;
  admin_email: string;
  action_type: string;
  entity_type: string;
  entity_id: string | null;
  old_value: string | null;
  new_value: string | null;
  created_at: string;
};

function toCsv(rows: LogRow[]): string {
  const headers = [
    "created_at",
    "admin_email",
    "action_type",
    "entity_type",
    "entity_id",
    "old_value",
    "new_value"
  ];
  const esc = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  const lines = [
    headers.join(","),
    ...rows.map((r) =>
      [
        r.created_at,
        r.admin_email,
        r.action_type,
        r.entity_type,
        r.entity_id ?? "",
        r.old_value ?? "",
        r.new_value ?? ""
      ].map(esc).join(",")
    )
  ];
  return lines.join("\n");
}

export default function AdminActivityLogPage() {
  const [rows, setRows] = useState<LogRow[]>([]);
  const [err, setErr] = useState<string | null>(null);

  const [adminEmail, setAdminEmail] = useState("");
  const [actionType, setActionType] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setErr(null);
    try {
      const sp = new URLSearchParams();
      if (adminEmail.trim()) sp.set("admin_email", adminEmail.trim());
      if (actionType.trim()) sp.set("action_type", actionType.trim());
      if (from.trim()) sp.set("from", from.trim());
      if (to.trim()) sp.set("to", to.trim());
      const r = await fetch(`/api/admin/activity-log?${sp.toString()}`, { credentials: "include" });
      const j = await r.json();
      if (!r.ok) setErr((j as { error?: string }).error ?? "Failed to load");
      else setRows(Array.isArray(j) ? (j as LogRow[]) : []);
    } catch {
      setErr("Network error");
    } finally {
      setLoading(false);
    }
  }, [adminEmail, actionType, from, to]);

  useEffect(() => {
    void load();
  }, [load]);

  const exportCsv = () => {
    const csv = toCsv(rows);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `admin-activity-log-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
        <h1 style={{ margin: 0, color: "var(--text-bright)", fontSize: 20 }}>Admin Activity Log</h1>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <button type="button" className="secondary" onClick={() => void load()} disabled={loading}>
            {loading ? "Loading…" : "Retry"}
          </button>
          <button type="button" className="secondary" onClick={exportCsv} disabled={rows.length === 0}>
            Export CSV
          </button>
        </div>
      </div>

      <p style={{ margin: "10px 0 16px", fontSize: 12, color: "var(--text-muted)" }}>
        Filter by admin email, action type, and date range.
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(190px,1fr))", gap: 12, marginBottom: 16 }}>
        <div>
          <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 6 }}>Admin email</div>
          <input value={adminEmail} onChange={(e) => setAdminEmail(e.target.value)} placeholder="admin@company.com" />
        </div>
        <div>
          <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 6 }}>Action type</div>
          <input value={actionType} onChange={(e) => setActionType(e.target.value)} placeholder="publisher_status_update" />
        </div>
        <div>
          <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 6 }}>From</div>
          <input value={from} onChange={(e) => setFrom(e.target.value)} placeholder="2026-03-01" />
        </div>
        <div>
          <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 6 }}>To</div>
          <input value={to} onChange={(e) => setTo(e.target.value)} placeholder="2026-03-25" />
        </div>
      </div>

      {err ? (
        <p style={{ color: "#ff4757", fontSize: 12 }}>{err}</p>
      ) : (
        <div style={{ overflow: "auto", border: "1px solid var(--border)", borderRadius: 10 }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
            <thead>
              <tr>
                {["Time", "Admin", "Action", "Entity", "Entity ID"].map((h) => (
                  <th key={h} style={{ textAlign: "left", padding: "10px 12px", borderBottom: "1px solid var(--border)", color: "var(--text-muted)" }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id}>
                  <td style={{ padding: "10px 12px", borderBottom: "1px solid #e2e8f033" }}>{r.created_at}</td>
                  <td style={{ padding: "10px 12px", borderBottom: "1px solid #e2e8f033" }}>{r.admin_email}</td>
                  <td style={{ padding: "10px 12px", borderBottom: "1px solid #e2e8f033" }}>{r.action_type}</td>
                  <td style={{ padding: "10px 12px", borderBottom: "1px solid #e2e8f033" }}>{r.entity_type}</td>
                  <td style={{ padding: "10px 12px", borderBottom: "1px solid #e2e8f033" }}>{r.entity_id ?? "—"}</td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={5} style={{ padding: 16, color: "var(--text-muted)" }}>
                    No activity found for the selected filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <p style={{ marginTop: 18, fontSize: 12, color: "var(--text-muted)" }}>
        Tip: Use filters to quickly narrow to a specific publisher or campaign id.
      </p>
    </div>
  );
}


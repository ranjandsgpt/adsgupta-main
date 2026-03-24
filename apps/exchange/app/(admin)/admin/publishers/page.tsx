"use client";

import { AdminToast } from "@/components/admin-toast";
import { useCallback, useEffect, useState } from "react";

type Publisher = {
  id: string;
  name: string;
  domain: string;
  contact_email: string | null;
  status: string;
  created_at: string;
};

export default function AdminPublishersPage() {
  const [rows, setRows] = useState<Publisher[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/publishers", { credentials: "include" });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Failed to load");
        return;
      }
      setRows(Array.isArray(data) ? data : []);
    } catch {
      setError("Network error");
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function activate(id: string) {
    setBusy(id);
    setError(null);
    try {
      const res = await fetch(`/api/publishers/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ status: "active" })
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Activate failed");
        setBusy(null);
        return;
      }
      setToast("Publisher is now live");
      await load();
    } catch {
      setError("Network error");
    }
    setBusy(null);
  }

  return (
    <div>
      <AdminToast message={toast} onClear={() => setToast(null)} />
      <h1 style={{ color: "var(--text-bright)", marginTop: 0 }}>Publishers</h1>
      <p style={{ fontSize: 12, color: "var(--text-muted)" }}>
        Self-registered publishers start as <code>pending</code>. Activate to allow ad units and tags.
      </p>
      {error && <p style={{ color: "#ff4757", fontSize: 12 }}>{error}</p>}
      <div style={{ marginTop: 16, overflow: "auto" }}>
        <table className="table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Domain</th>
              <th>Email</th>
              <th>Status</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id}>
                <td>{r.name}</td>
                <td style={{ fontSize: 11 }}>{r.domain}</td>
                <td style={{ fontSize: 11 }}>{r.contact_email ?? "—"}</td>
                <td style={{ color: r.status === "active" ? "#2ecc71" : "#ffd32a" }}>{r.status}</td>
                <td>
                  {r.status !== "active" && (
                    <button
                      type="button"
                      disabled={busy === r.id}
                      onClick={() => activate(r.id)}
                    >
                      {busy === r.id ? "…" : "Activate"}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

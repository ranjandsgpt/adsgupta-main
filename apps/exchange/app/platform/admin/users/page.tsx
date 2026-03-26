"use client";

import { useEffect, useMemo, useState } from "react";

type PlatformUserRow = {
  id: string;
  email: string;
  name: string;
  role: string;
  status: string;
  publisher_ids: string[] | null;
  campaign_email: string | null;
  invited_by: string | null;
  last_login_at: string | null;
  created_at: string;
  deleted_at: string | null;
};

type ApiPayload = {
  users: PlatformUserRow[];
  stats: { total: number; active: number; publishers: number; advertisers: number; pending: number };
};

function badgeStyle(kind: "admin" | "publisher" | "advertiser" | "status") {
  const base: React.CSSProperties = {
    fontSize: 10,
    fontWeight: 900,
    padding: "4px 10px",
    borderRadius: 999,
    textTransform: "uppercase",
    letterSpacing: "0.04em",
    border: "1px solid var(--border)"
  };
  if (kind === "admin") return { ...base, background: "#1a56db22", color: "#1a56db", borderColor: "#1a56db55" };
  if (kind === "publisher") return { ...base, background: "#2ecc7122", color: "#2ecc71", borderColor: "#2ecc7155" };
  if (kind === "advertiser") return { ...base, background: "#a855f722", color: "#a855f7", borderColor: "#a855f755" };
  return base;
}

export default function PlatformUsersPage() {
  const [data, setData] = useState<ApiPayload | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function load() {
    setError(null);
    setLoading(true);
    try {
      const r = await fetch("/api/platform-users", { credentials: "include" });
      const j = (await r.json()) as ApiPayload;
      if (!r.ok) throw new Error((j as any)?.error || `HTTP ${r.status}`);
      setData(j);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      setData(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  const users = data?.users ?? [];
  const stats = data?.stats;

  const activeUsers = useMemo(() => users.filter((u) => !u.deleted_at), [users]);

  return (
    <div className="page-content" style={{ paddingTop: 24, paddingBottom: 40 }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 18, color: "var(--text-bright)" }}>User Management</h1>
          <p style={{ margin: "6px 0 0", fontSize: 12, color: "var(--text-muted)" }}>
            Manage roles, access, and activation.
          </p>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button type="button" className="btn-secondary" onClick={() => void load()} disabled={loading}>
            {loading ? "Refreshing…" : "Refresh"}
          </button>
          <button
            type="button"
            className="btn-primary"
            onClick={async () => {
              const name = prompt("Invite name");
              if (!name) return;
              const email = prompt("Invite email");
              if (!email) return;
              const role = prompt("Role (publisher|advertiser)", "publisher") || "publisher";
              const res = await fetch("/api/platform-users/invite", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ name, email, role })
              });
              const j = await res.json();
              if (!res.ok) {
                alert((j as any)?.error || "Invite failed");
                return;
              }
              await load();
            }}
          >
            + Invite User
          </button>
        </div>
      </div>

      {stats ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 10, marginTop: 14 }}>
          {[
            ["Total Users", stats.total],
            ["Active", stats.active],
            ["Publishers", stats.publishers],
            ["Advertisers", stats.advertisers],
            ["Pending", stats.pending]
          ].map(([label, val]) => (
            <div key={String(label)} className="card" style={{ padding: 14 }}>
              <div style={{ fontSize: 12, fontWeight: 900, color: "var(--text)" }}>{val}</div>
              <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{label}</div>
            </div>
          ))}
        </div>
      ) : null}

      {error ? (
        <div style={{ marginTop: 14 }} className="card">
          <div style={{ padding: 14, color: "#ff8f8f" }}>{error}</div>
        </div>
      ) : null}

      <div className="card" style={{ marginTop: 14, overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
          <thead>
            <tr style={{ textAlign: "left", color: "var(--text-muted)" }}>
              {["Name / Email", "Role", "Portal Access", "Publisher Access", "Status", "Last Login", "Actions"].map((h) => (
                <th key={h} style={{ padding: "10px 12px", borderBottom: "1px solid var(--border)", fontWeight: 800 }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {activeUsers.map((u) => {
              const role = u.role === "admin" ? "admin" : u.role === "publisher" ? "publisher" : "advertiser";
              const portal =
                role === "admin" ? "All portals" : role === "publisher" ? "Publisher only" : "Demand only";
              const pubAccess =
                role === "publisher"
                  ? (u.publisher_ids ?? []).join(", ") || "—"
                  : role === "admin"
                    ? "All publishers"
                    : "—";
              return (
                <tr key={u.id}>
                  <td style={{ padding: "10px 12px", borderBottom: "1px solid var(--border)" }}>
                    <div style={{ fontWeight: 900, color: "var(--text)" }}>{u.name}</div>
                    <div style={{ color: "var(--text-muted)", fontSize: 11 }}>{u.email}</div>
                  </td>
                  <td style={{ padding: "10px 12px", borderBottom: "1px solid var(--border)" }}>
                    <span style={badgeStyle(role)}>{role}</span>
                  </td>
                  <td style={{ padding: "10px 12px", borderBottom: "1px solid var(--border)" }}>{portal}</td>
                  <td style={{ padding: "10px 12px", borderBottom: "1px solid var(--border)" }}>{pubAccess}</td>
                  <td style={{ padding: "10px 12px", borderBottom: "1px solid var(--border)" }}>
                    <span style={badgeStyle("status")}>{u.status}</span>
                  </td>
                  <td style={{ padding: "10px 12px", borderBottom: "1px solid var(--border)" }}>
                    <span style={{ color: "var(--text-muted)" }}>{u.last_login_at ?? "—"}</span>
                  </td>
                  <td style={{ padding: "10px 12px", borderBottom: "1px solid var(--border)" }}>
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                      {u.status === "pending" ? (
                        <button
                          type="button"
                          className="btn-secondary"
                          onClick={async () => {
                            await fetch(`/api/platform-users/${encodeURIComponent(u.id)}`, {
                              method: "PATCH",
                              headers: { "Content-Type": "application/json" },
                              credentials: "include",
                              body: JSON.stringify({ status: "active" })
                            });
                            await load();
                          }}
                        >
                          Activate
                        </button>
                      ) : null}
                      <button
                        type="button"
                        className="btn-ghost"
                        onClick={async () => {
                          const next = prompt("Set status (active|pending|suspended)", u.status) || u.status;
                          await fetch(`/api/platform-users/${encodeURIComponent(u.id)}`, {
                            method: "PATCH",
                            headers: { "Content-Type": "application/json" },
                            credentials: "include",
                            body: JSON.stringify({ status: next })
                          });
                          await load();
                        }}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        className="btn-ghost"
                        onClick={async () => {
                          if (!confirm("Soft delete this user?")) return;
                          await fetch(`/api/platform-users/${encodeURIComponent(u.id)}`, {
                            method: "DELETE",
                            credentials: "include"
                          });
                          await load();
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {activeUsers.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ padding: 14, color: "var(--text-muted)" }}>
                  No users
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}


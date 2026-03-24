"use client";

import { AdminToast } from "@/components/admin-toast";
import { FormEvent, Fragment, useCallback, useEffect, useMemo, useState } from "react";

type Publisher = {
  id: string;
  name: string;
  domain: string;
  contact_email: string | null;
  status: string;
  created_at: string;
  ad_units_count?: number;
  impressions_today?: number;
  revenue_today?: string | null;
  ads_txt_checked_at?: string | null;
  ads_txt_status?: string | null;
};

type AdUnit = { id: string; name: string; sizes: string[]; status: string; publisher_id?: string };

const PAGE = 20;

function timeAgo(iso: string): string {
  const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60) return `${s}s ago`;
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}

function badgeColor(st: string) {
  if (st === "active") return "#2ecc71";
  if (st === "pending") return "#ffd32a";
  return "#ff4757";
}

function adsTxtCell(r: Publisher) {
  const st = r.ads_txt_status;
  const label = st === "ok" ? "✓" : st === "missing" ? "✗" : "?";
  const title = r.ads_txt_checked_at
    ? `Last check: ${new Date(r.ads_txt_checked_at).toLocaleString()}`
    : "Not checked yet";
  const color = st === "ok" ? "#2ecc71" : st === "missing" ? "#ff4757" : "#ffd32a";
  return (
    <span style={{ color, fontWeight: 800, cursor: "default" }} title={title}>
      {label}
    </span>
  );
}

export default function AdminPublishersPage() {
  const [rows, setRows] = useState<Publisher[]>([]);
  const [unitsByPub, setUnitsByPub] = useState<Record<string, AdUnit[]>>({});
  const [expanded, setExpanded] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [modal, setModal] = useState(false);
  const [editPub, setEditPub] = useState<Publisher | null>(null);
  const [deletePub, setDeletePub] = useState<Publisher | null>(null);
  const [addName, setAddName] = useState("");
  const [addDomain, setAddDomain] = useState("");
  const [addEmail, setAddEmail] = useState("");
  const [newName, setNewName] = useState("");
  const [newDomain, setNewDomain] = useState("");
  const [newEmail, setNewEmail] = useState("");

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

  const pending = useMemo(() => rows.filter((r) => r.status === "pending"), [rows]);
  const slice = useMemo(() => {
    const start = page * PAGE;
    return rows.slice(start, start + PAGE);
  }, [rows, page]);
  const totalPages = Math.max(1, Math.ceil(rows.length / PAGE));

  async function loadUnits(pubId: string) {
    const res = await fetch(`/api/inventory`, { credentials: "include" });
    if (res.ok) {
      const all = await res.json();
      const list = (Array.isArray(all) ? all : []) as AdUnit[];
      setUnitsByPub((m) => ({
        ...m,
        [pubId]: list.filter((u) => u.publisher_id === pubId)
      }));
    }
  }

  async function toggleUnits(id: string) {
    if (expanded === id) {
      setExpanded(null);
      return;
    }
    setExpanded(id);
    await loadUnits(id);
  }

  async function patchStatus(id: string, status: string) {
    setBusy(id);
    setError(null);
    try {
      const res = await fetch(`/api/publishers/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ status })
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Update failed");
        setBusy(null);
        return;
      }
      setToast(
        status === "active"
          ? "Publisher activated — welcome email sent"
          : status === "suspended"
            ? "Publisher suspended"
            : "Updated"
      );
      await load();
    } catch {
      setError("Network error");
    }
    setBusy(null);
  }

  async function saveEdit(e: FormEvent) {
    e.preventDefault();
    if (!editPub) return;
    setBusy(editPub.id);
    try {
      const res = await fetch(`/api/publishers/${editPub.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          name: newName,
          domain: newDomain,
          contact_email: newEmail || null
        })
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Failed");
        setBusy(null);
        return;
      }
      setToast("Publisher updated");
      setEditPub(null);
      await load();
    } catch {
      setError("Network error");
    }
    setBusy(null);
  }

  async function addPublisher(e: FormEvent) {
    e.preventDefault();
    setError(null);
    const res = await fetch("/api/publishers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ name: addName, domain: addDomain, contact_email: addEmail || null, status: "pending" })
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "Failed");
      return;
    }
    setToast(`Publisher ID: ${data.id}`);
    setModal(false);
    setAddName("");
    setAddDomain("");
    setAddEmail("");
    await load();
  }

  async function confirmDelete() {
    if (!deletePub) return;
    setBusy(deletePub.id);
    try {
      const res = await fetch(`/api/publishers/${deletePub.id}`, { method: "DELETE", credentials: "include" });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "Delete failed");
        setBusy(null);
        return;
      }
      setToast("Publisher deleted");
      setDeletePub(null);
      await load();
    } catch {
      setError("Network error");
    }
    setBusy(null);
  }

  return (
    <div>
      <AdminToast message={toast} onClear={() => setToast(null)} />
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 style={{ color: "var(--text-bright)", margin: 0 }}>Publisher Management</h1>
          <p style={{ fontSize: 12, color: "var(--text-muted)", margin: "6px 0 0" }}>
            Total: {rows.length} publishers
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setAddName("");
            setAddDomain("");
            setAddEmail("");
            setModal(true);
          }}
        >
          Add Publisher
        </button>
      </div>

      {pending.length > 0 && (
        <div
          style={{
            marginTop: 16,
            padding: 14,
            borderRadius: 8,
            background: "#ffd32a18",
            border: "1px solid #ffd32a55"
          }}
        >
          <div style={{ fontWeight: 700, color: "#ffd32a", marginBottom: 10 }}>{pending.length} publishers pending activation</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {pending.map((p) => (
              <div
                key={p.id}
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  alignItems: "center",
                  gap: 10,
                  justifyContent: "space-between",
                  padding: 10,
                  background: "#0c1018",
                  borderRadius: 6
                }}
              >
                <div>
                  <div style={{ fontWeight: 700, color: "var(--text-bright)" }}>{p.name}</div>
                  <div style={{ fontSize: 11, color: "var(--text-muted)" }}>
                    {p.domain} · {p.contact_email ?? "—"} · {timeAgo(p.created_at)}
                  </div>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button type="button" disabled={busy === p.id} onClick={() => patchStatus(p.id, "active")} style={{ background: "#2ecc7122", borderColor: "#2ecc7155", color: "#2ecc71" }}>
                    Activate
                  </button>
                  <button
                    type="button"
                    disabled={busy === p.id}
                    onClick={() => patchStatus(p.id, "suspended")}
                    style={{ background: "#ff475722", borderColor: "#ff475755", color: "#ff4757" }}
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {error && <p style={{ color: "#ff4757", fontSize: 12, marginTop: 12 }}>{error}</p>}

      <div style={{ overflow: "auto", marginTop: 16 }}>
        <table className="table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Domain</th>
              <th>Email</th>
              <th>Units</th>
              <th>Impr today</th>
              <th>Revenue today</th>
              <th>Status</th>
              <th title="ads.txt verification">ads.txt</th>
              <th>Created</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {slice.map((r) => (
              <Fragment key={r.id}>
                <tr>
                  <td>{r.name}</td>
                  <td style={{ fontSize: 11 }}>{r.domain}</td>
                  <td style={{ fontSize: 11 }}>{r.contact_email ?? "—"}</td>
                  <td>{r.ad_units_count ?? "—"}</td>
                  <td>{r.impressions_today ?? "—"}</td>
                  <td style={{ fontSize: 11 }}>
                    {r.revenue_today != null ? `$${Number(r.revenue_today).toFixed(4)}` : "—"}
                  </td>
                  <td>
                    <span style={{ color: badgeColor(r.status), fontWeight: 700, fontSize: 11 }}>{r.status}</span>
                  </td>
                  <td style={{ textAlign: "center" }}>{adsTxtCell(r)}</td>
                  <td style={{ fontSize: 10 }}>{String(r.created_at).slice(0, 10)}</td>
                  <td style={{ whiteSpace: "nowrap", fontSize: 11 }}>
                    <button type="button" className="link-button" onClick={() => toggleUnits(r.id)}>
                      {expanded === r.id ? "Hide" : "View"} units
                    </button>
                    <button
                      type="button"
                      className="link-button"
                      style={{ marginLeft: 8 }}
                      onClick={() => {
                        setEditPub(r);
                        setNewName(r.name);
                        setNewDomain(r.domain);
                        setNewEmail(r.contact_email ?? "");
                      }}
                    >
                      Edit
                    </button>
                    {r.status === "pending" && (
                      <button type="button" disabled={busy === r.id} style={{ marginLeft: 8 }} onClick={() => patchStatus(r.id, "active")}>
                        Activate
                      </button>
                    )}
                    {r.status === "active" && (
                      <button type="button" disabled={busy === r.id} style={{ marginLeft: 8, color: "#ff4757" }} onClick={() => patchStatus(r.id, "suspended")}>
                        Suspend
                      </button>
                    )}
                    {r.status === "suspended" && (
                      <button type="button" disabled={busy === r.id} style={{ marginLeft: 8 }} onClick={() => patchStatus(r.id, "active")}>
                        Activate
                      </button>
                    )}
                    <button type="button" className="link-button" style={{ marginLeft: 8, color: "#ff4757" }} onClick={() => setDeletePub(r)}>
                      Delete
                    </button>
                  </td>
                </tr>
                {expanded === r.id && (
                  <tr>
                    <td colSpan={10} style={{ background: "#0c1018", fontSize: 11 }}>
                      <div style={{ marginBottom: 6, color: "var(--text-muted)" }}>
                        Publisher ID: <code style={{ color: "var(--accent)" }}>{r.id}</code>
                      </div>
                      {(unitsByPub[r.id] ?? []).length === 0 ? (
                        <span style={{ color: "var(--text-muted)" }}>No units</span>
                      ) : (
                        <table className="table" style={{ margin: 0 }}>
                          <thead>
                            <tr>
                              <th>Unit</th>
                              <th>Sizes</th>
                              <th>Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            {(unitsByPub[r.id] ?? []).map((u) => (
                              <tr key={u.id}>
                                <td>{u.name}</td>
                                <td>{(u.sizes ?? []).join(", ")}</td>
                                <td>{u.status}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      )}
                    </td>
                  </tr>
                )}
              </Fragment>
            ))}
          </tbody>
        </table>
      </div>

      {rows.length > PAGE && (
        <div style={{ display: "flex", gap: 12, alignItems: "center", marginTop: 14, fontSize: 12 }}>
          <button type="button" className="secondary" disabled={page <= 0} onClick={() => setPage((p) => Math.max(0, p - 1))}>
            Prev
          </button>
          <span style={{ color: "var(--text-muted)" }}>
            Page {page + 1} / {totalPages}
          </span>
          <button type="button" className="secondary" disabled={page >= totalPages - 1} onClick={() => setPage((p) => p + 1)}>
            Next
          </button>
        </div>
      )}

      {modal && (
        <div
          style={{ position: "fixed", inset: 0, background: "#000a", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 120 }}
          onClick={() => setModal(false)}
        >
          <div className="card" style={{ width: 440 }} onClick={(e) => e.stopPropagation()}>
            <div style={{ fontWeight: 700, color: "#4a9eff", marginBottom: 12 }}>Add publisher</div>
            <p style={{ fontSize: 11, color: "var(--text-muted)" }}>Publisher ID is auto-generated (UUID).</p>
            <form onSubmit={addPublisher}>
              <label style={{ fontSize: 10, color: "var(--text-muted)" }}>Name *</label>
              <input value={addName} onChange={(e) => setAddName(e.target.value)} required />
              <div style={{ height: 8 }} />
              <label style={{ fontSize: 10, color: "var(--text-muted)" }}>Domain *</label>
              <input value={addDomain} onChange={(e) => setAddDomain(e.target.value)} required />
              <div style={{ height: 8 }} />
              <label style={{ fontSize: 10, color: "var(--text-muted)" }}>Email</label>
              <input type="email" value={addEmail} onChange={(e) => setAddEmail(e.target.value)} />
              <div style={{ height: 14, display: "flex", gap: 8 }}>
                <button type="submit">Save</button>
                <button type="button" className="link-button" onClick={() => setModal(false)}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {editPub && (
        <div
          style={{ position: "fixed", inset: 0, background: "#000a", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 120 }}
          onClick={() => setEditPub(null)}
        >
          <div className="card" style={{ width: 440 }} onClick={(e) => e.stopPropagation()}>
            <div style={{ fontWeight: 700, marginBottom: 12 }}>Edit publisher</div>
            <form onSubmit={saveEdit}>
              <label style={{ fontSize: 10, color: "var(--text-muted)" }}>Name</label>
              <input value={newName} onChange={(e) => setNewName(e.target.value)} required />
              <div style={{ height: 8 }} />
              <label style={{ fontSize: 10, color: "var(--text-muted)" }}>Domain</label>
              <input value={newDomain} onChange={(e) => setNewDomain(e.target.value)} required />
              <div style={{ height: 8 }} />
              <label style={{ fontSize: 10, color: "var(--text-muted)" }}>Email</label>
              <input type="email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} />
              <div style={{ height: 14, display: "flex", gap: 8 }}>
                <button type="submit" disabled={busy === editPub.id}>
                  Save
                </button>
                <button type="button" className="link-button" onClick={() => setEditPub(null)}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deletePub && (
        <div
          style={{ position: "fixed", inset: 0, background: "#000a", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 120 }}
          onClick={() => setDeletePub(null)}
        >
          <div className="card" style={{ width: 400 }} onClick={(e) => e.stopPropagation()}>
            <div style={{ fontWeight: 700, color: "#ff4757", marginBottom: 8 }}>Delete publisher?</div>
            <p style={{ fontSize: 12, color: "var(--text-muted)" }}>This removes {deletePub.name} and cannot be undone.</p>
            <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
              <button type="button" style={{ background: "#ff475722", borderColor: "#ff4757", color: "#ff4757" }} onClick={confirmDelete}>
                Delete
              </button>
              <button type="button" className="secondary" onClick={() => setDeletePub(null)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import { AdminToast } from "@/components/admin-toast";
import { FormEvent, Fragment, useCallback, useEffect, useState } from "react";

type Publisher = {
  id: string;
  name: string;
  domain: string;
  contact_email: string | null;
  status: string;
  created_at: string;
};

type AdUnit = { id: string; name: string; sizes: string[]; status: string; publisher_id?: string };

export default function AdminPublishersPage() {
  const [rows, setRows] = useState<Publisher[]>([]);
  const [unitsByPub, setUnitsByPub] = useState<Record<string, AdUnit[]>>({});
  const [expanded, setExpanded] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [modal, setModal] = useState(false);
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
          ? "Publisher activated — ads will now serve for their units"
          : "Publisher suspended"
      );
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
      body: JSON.stringify({ name: newName, domain: newDomain, contact_email: newEmail || null, status: "pending" })
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "Failed");
      return;
    }
    setModal(false);
    setNewName("");
    setNewDomain("");
    setNewEmail("");
    await load();
  }

  const pending = rows.filter((r) => r.status === "pending");

  return (
    <div>
      <AdminToast message={toast} onClear={() => setToast(null)} />
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
        <h1 style={{ color: "var(--text-bright)", margin: 0 }}>Publisher Management</h1>
        <button type="button" onClick={() => setModal(true)}>
          Add Publisher
        </button>
      </div>
      <p style={{ fontSize: 12, color: "var(--text-muted)" }}>
        Pending publishers need activation before auction can serve on their inventory.
      </p>
      {pending.length > 0 && (
        <div style={{ marginBottom: 16, fontSize: 11 }}>
          <span style={{ background: "#ffd32a18", border: "1px solid #ffd32a55", color: "#ffd32a", padding: "4px 10px", borderRadius: 4 }}>
            {pending.length} pending
          </span>
        </div>
      )}
      {error && <p style={{ color: "#ff4757", fontSize: 12 }}>{error}</p>}
      <div style={{ overflow: "auto" }}>
        <table className="table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Domain</th>
              <th>Email</th>
              <th>Ad Units</th>
              <th>Status</th>
              <th>Created</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <Fragment key={r.id}>
                <tr>
                  <td>{r.name}</td>
                  <td style={{ fontSize: 11 }}>{r.domain}</td>
                  <td style={{ fontSize: 11 }}>{r.contact_email ?? "—"}</td>
                  <td>
                    <button type="button" className="link-button" onClick={() => toggleUnits(r.id)}>
                      {expanded === r.id ? "Hide" : "View"} units
                    </button>
                  </td>
                  <td style={{ color: r.status === "active" ? "#2ecc71" : r.status === "pending" ? "#ffd32a" : "#ff4757" }}>
                    {r.status}
                  </td>
                  <td style={{ fontSize: 10 }}>{String(r.created_at).slice(0, 10)}</td>
                  <td style={{ whiteSpace: "nowrap" }}>
                    {r.status === "pending" && (
                      <button type="button" disabled={busy === r.id} onClick={() => patchStatus(r.id, "active")}>
                        {busy === r.id ? "…" : "Activate"}
                      </button>
                    )}
                    {r.status === "active" && (
                      <button
                        type="button"
                        style={{ marginLeft: 6, color: "#ff4757", borderColor: "#ff475755" }}
                        disabled={busy === r.id}
                        onClick={() => patchStatus(r.id, "suspended")}
                      >
                        Suspend
                      </button>
                    )}
                  </td>
                </tr>
                {expanded === r.id && (
                  <tr>
                    <td colSpan={7} style={{ background: "#0c1018", fontSize: 11 }}>
                      {(unitsByPub[r.id] ?? []).length === 0 ? (
                        <span style={{ color: "var(--text-muted)" }}>No units</span>
                      ) : (
                        <ul style={{ margin: 0, paddingLeft: 18 }}>
                          {(unitsByPub[r.id] ?? []).map((u) => (
                            <li key={u.id}>
                              {u.name} · {(u.sizes ?? []).join(", ")} · {u.status}
                            </li>
                          ))}
                        </ul>
                      )}
                    </td>
                  </tr>
                )}
              </Fragment>
            ))}
          </tbody>
        </table>
      </div>

      {modal && (
        <div
          style={{ position: "fixed", inset: 0, background: "#000a", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 120 }}
          onClick={() => setModal(false)}
        >
          <div className="card" style={{ width: 440 }} onClick={(e) => e.stopPropagation()}>
            <div style={{ fontWeight: 700, color: "#4a9eff", marginBottom: 12 }}>Add publisher</div>
            <form onSubmit={addPublisher}>
              <label style={{ fontSize: 10, color: "var(--text-muted)" }}>Name *</label>
              <input value={newName} onChange={(e) => setNewName(e.target.value)} required />
              <div style={{ height: 8 }} />
              <label style={{ fontSize: 10, color: "var(--text-muted)" }}>Domain *</label>
              <input value={newDomain} onChange={(e) => setNewDomain(e.target.value)} required />
              <div style={{ height: 8 }} />
              <label style={{ fontSize: 10, color: "var(--text-muted)" }}>Email</label>
              <input type="email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} />
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
    </div>
  );
}

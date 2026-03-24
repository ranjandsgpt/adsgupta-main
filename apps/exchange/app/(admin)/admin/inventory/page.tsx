"use client";

import { FormEvent, useEffect, useState } from "react";

type Unit = {
  id: string;
  publisher_id: string;
  name: string;
  sizes: string[];
  ad_type: string;
  environment: string;
  floor_price: string;
  status: string;
};

type Publisher = { id: string; name: string; domain: string };

export default function AdminInventoryPage() {
  const [units, setUnits] = useState<Unit[]>([]);
  const [publishers, setPublishers] = useState<Publisher[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [pubId, setPubId] = useState("");
  const [name, setName] = useState("new_unit");
  const [size, setSize] = useState("300x250");
  const [adType, setAdType] = useState("display");
  const [env, setEnv] = useState("web");
  const [floor, setFloor] = useState("0.50");

  async function load() {
    try {
      const [u, p] = await Promise.all([
        fetch("/api/inventory", { credentials: "include" }),
        fetch("/api/publishers", { credentials: "include" })
      ]);
      const uj = await u.json();
      const pj = await p.json();
      if (!u.ok) setError(uj.error ?? "Units failed");
      else setUnits(Array.isArray(uj) ? uj : []);
      if (p.ok && Array.isArray(pj)) {
        setPublishers(pj);
        setPubId((prev) => prev || pj[0]?.id || "");
      }
    } catch {
      setError("Network error");
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function addUnit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    const res = await fetch("/api/inventory", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        publisher_id: pubId,
        name,
        sizes: [size],
        ad_type: adType,
        environment: env,
        floor_price: Number(floor)
      })
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "Failed");
      return;
    }
    await load();
  }

  async function patchUnit(id: string, status: string) {
    await fetch(`/api/inventory/${id}`, {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status })
    });
    await load();
  }

  const pubName = (id: string) => publishers.find((p) => p.id === id)?.domain ?? id.slice(0, 8);

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
        <h1 style={{ color: "var(--text-bright)", margin: 0 }}>Inventory Management</h1>
      </div>
      <p style={{ fontSize: 12, color: "var(--text-muted)" }}>All ad units across publishers.</p>
      {error && <p style={{ color: "#ff4757", fontSize: 12 }}>{error}</p>}

      <div
        style={{
          fontSize: 11,
          fontWeight: 700,
          color: "var(--text-muted)",
          letterSpacing: 1.2,
          textTransform: "uppercase",
          margin: "20px 0 10px"
        }}
      >
        AD UNITS ({units.length})
      </div>
      <div style={{ overflow: "auto" }}>
        <table className="table">
          <thead>
            <tr>
              <th>Unit</th>
              <th>Publisher</th>
              <th>Sizes</th>
              <th>Type</th>
              <th>Env</th>
              <th>Floor</th>
              <th>Status</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {units.map((u) => (
              <tr key={u.id}>
                <td style={{ fontWeight: 600 }}>{u.name}</td>
                <td style={{ fontSize: 10 }}>{pubName(u.publisher_id)}</td>
                <td style={{ fontSize: 10 }}>{(u.sizes ?? []).join(", ")}</td>
                <td>{u.ad_type}</td>
                <td>{u.environment}</td>
                <td>{u.floor_price}</td>
                <td style={{ color: u.status === "active" ? "#2ecc71" : "#ffd32a" }}>{u.status}</td>
                <td>
                  <button type="button" className="link-button" onClick={() => patchUnit(u.id, u.status === "active" ? "paused" : "active")}>
                    {u.status === "active" ? "Pause" : "Resume"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <form onSubmit={addUnit} className="card" style={{ marginTop: 24, maxWidth: 480 }}>
        <div style={{ fontWeight: 700, color: "#4a9eff", marginBottom: 12 }}>+ New ad unit</div>
        <label style={{ fontSize: 10, color: "var(--text-muted)" }}>Publisher</label>
        <select value={pubId} onChange={(e) => setPubId(e.target.value)}>
          {publishers.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name} ({p.domain})
            </option>
          ))}
        </select>
        <div style={{ height: 8 }} />
        <label style={{ fontSize: 10, color: "var(--text-muted)" }}>Name</label>
        <input value={name} onChange={(e) => setName(e.target.value)} required />
        <div style={{ height: 8 }} />
        <label style={{ fontSize: 10, color: "var(--text-muted)" }}>Size</label>
        <select value={size} onChange={(e) => setSize(e.target.value)}>
          {["300x250", "728x90", "160x600", "320x50", "300x600"].map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <div style={{ height: 8 }} />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          <div>
            <label style={{ fontSize: 10, color: "var(--text-muted)" }}>Ad type</label>
            <select value={adType} onChange={(e) => setAdType(e.target.value)}>
              <option value="display">display</option>
              <option value="video">video</option>
              <option value="native">native</option>
            </select>
          </div>
          <div>
            <label style={{ fontSize: 10, color: "var(--text-muted)" }}>Environment</label>
            <select value={env} onChange={(e) => setEnv(e.target.value)}>
              <option value="web">web</option>
              <option value="app">app</option>
              <option value="ctv">ctv</option>
            </select>
          </div>
        </div>
        <div style={{ height: 8 }} />
        <label style={{ fontSize: 10, color: "var(--text-muted)" }}>Floor CPM</label>
        <input value={floor} onChange={(e) => setFloor(e.target.value)} type="number" step="0.0001" />
        <div style={{ height: 12 }} />
        <button type="submit">Create unit</button>
      </form>
    </div>
  );
}

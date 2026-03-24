"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

export default function PublisherRegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [domain, setDomain] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/publishers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, domain, contact_email: contactEmail || null })
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Registration failed");
        setLoading(false);
        return;
      }
      router.push(`/publisher/dashboard?id=${encodeURIComponent(data.id)}`);
    } catch {
      setError("Network error");
    }
    setLoading(false);
  }

  return (
    <div style={{ maxWidth: 480 }}>
      <h1 style={{ color: "var(--text-bright)", marginTop: 0 }}>Publisher registration</h1>
      <p style={{ fontSize: 12, color: "var(--text-muted)", lineHeight: 1.5 }}>
        Submit your site. You will receive a publisher ID immediately. An exchange admin must activate
        your account before tags go live.
      </p>
      <form onSubmit={onSubmit} className="card" style={{ marginTop: 16 }}>
        <label style={{ fontSize: 11, color: "var(--text-muted)" }}>Publisher name *</label>
        <div style={{ height: 6 }} />
        <input value={name} onChange={(e) => setName(e.target.value)} required />
        <div style={{ height: 12 }} />
        <label style={{ fontSize: 11, color: "var(--text-muted)" }}>Domain *</label>
        <div style={{ height: 6 }} />
        <input
          value={domain}
          onChange={(e) => setDomain(e.target.value)}
          placeholder="example.com"
          required
        />
        <div style={{ height: 12 }} />
        <label style={{ fontSize: 11, color: "var(--text-muted)" }}>Contact email</label>
        <div style={{ height: 6 }} />
        <input
          type="email"
          value={contactEmail}
          onChange={(e) => setContactEmail(e.target.value)}
          placeholder="ops@example.com"
        />
        {error && (
          <p style={{ color: "#ff4757", fontSize: 12, marginTop: 10 }}>{error}</p>
        )}
        <div style={{ height: 16 }} />
        <button type="submit" disabled={loading}>
          {loading ? "Submitting…" : "Register"}
        </button>
      </form>
    </div>
  );
}

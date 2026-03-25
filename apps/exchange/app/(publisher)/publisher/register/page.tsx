"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";

import { isValidEmail, normalizeDomain } from "@/lib/domain";

type RegRow = { id: string; name: string; status: string };

export default function PublisherRegisterPage() {
  const [name, setName] = useState("");
  const [domain, setDomain] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [fmtDisplay, setFmtDisplay] = useState(true);
  const [fmtVideo, setFmtVideo] = useState(false);
  const [fmtNative, setFmtNative] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<RegRow | null>(null);
  const [copied, setCopied] = useState(false);

  function validateClient(): string | null {
    if (!name.trim()) return "Publisher / company name is required.";
    const d = normalizeDomain(domain);
    if (!d) return "Enter a valid domain (e.g. example.com).";
    if (!isValidEmail(contactEmail)) return "Enter a valid contact email.";
    if (!fmtDisplay && !fmtVideo && !fmtNative) return "Select at least one primary ad format.";
    return null;
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    const v = validateClient();
    if (v) {
      setError(v);
      return;
    }
    setLoading(true);
    try {
      const primary_formats: string[] = [];
      if (fmtDisplay) primary_formats.push("display");
      if (fmtVideo) primary_formats.push("video");
      if (fmtNative) primary_formats.push("native");
      const res = await fetch("/api/publishers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          domain: domain.trim(),
          contact_email: contactEmail.trim(),
          primary_formats
        })
      });
      const data = await res.json();
      if (!res.ok) {
        const msg =
          typeof data.error === "string" ? data.error : typeof data.message === "string" ? data.message : "Registration failed";
        setError(msg);
        setLoading(false);
        return;
      }
      setSuccess({ id: data.id, name: data.name, status: data.status ?? "pending" });
    } catch {
      setError("Network error");
    }
    setLoading(false);
  }

  async function copyId(id: string) {
    try {
      await navigator.clipboard.writeText(id);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setError("Could not copy to clipboard");
    }
  }

  if (success) {
    return (
      <div style={{ maxWidth: 520 }}>
        <h1 style={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 800, color: "var(--text-bright)", marginTop: 0 }}>
          You&apos;re registered
        </h1>
        <p style={{ fontSize: 13, color: "var(--text-muted)", lineHeight: 1.6 }}>
          Save your publisher ID. You&apos;ll need it for the dashboard and ad tags.
        </p>
        <div className="card" style={{ marginTop: 20 }}>
          <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 8 }}>Publisher ID</div>
          <div
            style={{
              fontSize: "clamp(1.125rem, 3vw, 1.5rem)",
                color: "#0066cc",
              fontFamily: "'JetBrains Mono', ui-monospace, monospace",
              wordBreak: "break-all",
              fontWeight: 800,
              letterSpacing: "-0.02em"
            }}
          >
            {success.id}
          </div>
          <button type="button" style={{ marginTop: 14 }} onClick={() => copyId(success.id)}>
            {copied ? "Copied!" : "Copy ID"}
          </button>
          <div style={{ marginTop: 16, display: "flex", alignItems: "center", gap: 8 }}>
            <span
              style={{
                fontSize: 10,
                fontWeight: 800,
                textTransform: "uppercase",
                letterSpacing: "0.04em",
                color: "#ffffff",
                background: "#ffd32a",
                padding: "4px 10px",
                borderRadius: 4
              }}
            >
              Pending Activation
            </span>
          </div>
          <p style={{ fontSize: 12, color: "var(--text-muted)", lineHeight: 1.6, marginTop: 16, marginBottom: 0 }}>
            The MDE exchange team will review and activate your account. You will receive ad tags once activated.
          </p>
        </div>
        <div style={{ marginTop: 24 }}>
          <Link href={`/publisher/dashboard?id=${encodeURIComponent(success.id)}`}>
            <span
              style={{
                display: "inline-block",
                padding: "10px 18px",
                background: "#0066cc22",
                border: "1px solid #0066cc55",
                color: "var(--accent)",
                borderRadius: 6,
                fontSize: 13,
                fontWeight: 700,
                fontFamily: "'JetBrains Mono', monospace"
              }}
            >
              View Your Dashboard →
            </span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 520 }}>
      <h1 style={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 800, color: "var(--text-bright)", marginTop: 0 }}>
        Register as publisher
      </h1>
      <p style={{ fontSize: 12, color: "var(--text-muted)", lineHeight: 1.55 }}>
        Submit your site for review. Fields marked * are required before you can continue.
      </p>

      {error && (
        <div
          style={{
            marginTop: 16,
            padding: "12px 14px",
            background: "#ff475718",
            border: "1px solid #ff475755",
            borderRadius: 8,
            color: "#ff8f8f",
            fontSize: 12
          }}
        >
          {error}
        </div>
      )}

      <form onSubmit={onSubmit} className="card" style={{ marginTop: 18 }}>
        <label style={{ fontSize: 11, color: "var(--text-muted)" }}>Publisher / Company Name *</label>
        <div style={{ height: 6 }} />
        <input value={name} onChange={(e) => setName(e.target.value)} autoComplete="organization" />
        <div style={{ height: 14 }} />
        <label style={{ fontSize: 11, color: "var(--text-muted)" }}>Website Domain *</label>
        <div style={{ height: 6 }} />
        <input
          value={domain}
          onChange={(e) => setDomain(e.target.value)}
          placeholder="example.com"
          autoComplete="url"
        />
        <div style={{ height: 14 }} />
        <label style={{ fontSize: 11, color: "var(--text-muted)" }}>Contact Email *</label>
        <div style={{ height: 6 }} />
        <input
          type="email"
          value={contactEmail}
          onChange={(e) => setContactEmail(e.target.value)}
          placeholder="ops@example.com"
          autoComplete="email"
        />
        <div style={{ height: 14 }} />
        <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 8 }}>Primary ad format *</div>
        <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, marginBottom: 8, cursor: "pointer" }}>
          <input type="checkbox" checked={fmtDisplay} onChange={(e) => setFmtDisplay(e.target.checked)} />
          Display
        </label>
        <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, marginBottom: 8, cursor: "pointer" }}>
          <input type="checkbox" checked={fmtVideo} onChange={(e) => setFmtVideo(e.target.checked)} />
          Video
        </label>
        <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, cursor: "pointer" }}>
          <input type="checkbox" checked={fmtNative} onChange={(e) => setFmtNative(e.target.checked)} />
          Native
        </label>
        <div style={{ height: 18 }} />
        <button type="submit" disabled={loading}>
          {loading ? "Submitting…" : "Submit registration"}
        </button>
      </form>
    </div>
  );
}

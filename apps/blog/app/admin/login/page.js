"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const from = searchParams.get("from") || "/admin";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "Login failed");
        setLoading(false);
        return;
      }
      router.push(from);
      router.refresh();
    } catch {
      setError("Login failed");
      setLoading(false);
    }
  }

  return (
    <div className="shell" style={{ maxWidth: "420px", marginTop: "4rem" }}>
      <h1 className="hero-title" style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>
        Admin Login
      </h1>
      <p className="hero-description" style={{ marginBottom: "1.5rem" }}>
        BlogAI CMS — AdsGupta
      </p>
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        <label style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
          <span style={{ fontSize: "0.85rem", color: "var(--ads-text-muted)" }}>Email</span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            className="header-btn"
            style={{ borderRadius: "0.5rem", padding: "0.5rem 0.75rem", border: "1px solid rgba(255,255,255,0.1)", textTransform: "none" }}
          />
        </label>
        <label style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
          <span style={{ fontSize: "0.85rem", color: "var(--ads-text-muted)" }}>Password</span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
            className="header-btn"
            style={{ borderRadius: "0.5rem", padding: "0.5rem 0.75rem", border: "1px solid rgba(255,255,255,0.1)", textTransform: "none" }}
          />
        </label>
        {error && <p style={{ color: "#f87171", fontSize: "0.875rem" }}>{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="header-btn header-btn-primary"
          style={{ marginTop: "0.5rem" }}
        >
          {loading ? "Signing in…" : "Sign in"}
        </button>
      </form>
      <p style={{ marginTop: "1.5rem", fontSize: "0.8rem", color: "var(--ads-text-muted)" }}>
        <Link href="/archives">← Back to Archives</Link>
      </p>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense fallback={<div className="shell" style={{ marginTop: "4rem", color: "var(--ads-text-muted)" }}>Loading…</div>}>
      <LoginForm />
    </Suspense>
  );
}

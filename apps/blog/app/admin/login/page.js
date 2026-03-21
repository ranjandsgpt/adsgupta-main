"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { signIn } from "next-auth/react";

const bg = "#0f1115";
const accent = "#06b6d4";
const muted = "rgba(255,255,255,0.65)";
const border = "rgba(255,255,255,0.12)";

function LoginInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const from = searchParams.get("from") || "/admin";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await signIn("credentials", {
        email: email.trim(),
        password,
        redirect: false,
      });
      if (res?.error) {
        setError("Invalid email or password.");
        setLoading(false);
        return;
      }
      router.push(from);
      router.refresh();
    } catch (err) {
      setError(err.message || "Login failed");
    }
    setLoading(false);
  }

  return (
    <div
      style={{
        minHeight: "70vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "flex-start",
        paddingTop: "2rem",
        paddingBottom: "3rem",
        background: bg,
      }}
    >
      <div style={{ width: "100%", maxWidth: "420px", padding: "0 1rem" }}>
        <h1
          style={{
            fontSize: "1.5rem",
            fontWeight: 700,
            marginBottom: "0.35rem",
            color: "#f8fafc",
          }}
        >
          AdsGupta Blog CMS
        </h1>
        <p style={{ fontSize: "0.9rem", color: muted, marginBottom: "1.5rem" }}>
          Sign in with your author account.
        </p>

        <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <label style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
            <span style={{ fontSize: "0.8rem", color: muted }}>Email</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              style={inputStyle(border)}
            />
          </label>
          <label style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
            <span style={{ fontSize: "0.8rem", color: muted }}>Password</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              style={inputStyle(border)}
            />
          </label>
          {error && <p style={{ color: "#f87171", fontSize: "0.875rem", margin: 0 }}>{error}</p>}
          <button
            type="submit"
            disabled={loading}
            style={{
              ...primaryBtn(accent),
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>

        <p style={{ marginTop: "1.75rem", fontSize: "0.8rem", color: muted }}>
          <Link href="/archives" style={{ color: accent }}>
            ← Back to blog
          </Link>
        </p>
      </div>
    </div>
  );
}

function inputStyle(border) {
  return {
    borderRadius: "0.5rem",
    padding: "0.55rem 0.75rem",
    border: `1px solid ${border}`,
    background: "rgba(255,255,255,0.04)",
    color: "#f8fafc",
    outline: "none",
    fontSize: "0.95rem",
  };
}

function primaryBtn(accent) {
  return {
    marginTop: "0.25rem",
    padding: "0.65rem 1rem",
    borderRadius: "0.5rem",
    border: "none",
    background: accent,
    color: "#0f1115",
    fontWeight: 700,
    cursor: "pointer",
  };
}

export default function AdminLoginPage() {
  return (
    <Suspense
      fallback={
        <div className="shell" style={{ marginTop: "4rem", color: "rgba(255,255,255,0.65)", background: bg }}>
          Loading…
        </div>
      }
    >
      <LoginInner />
    </Suspense>
  );
}

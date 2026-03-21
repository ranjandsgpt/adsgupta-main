"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { createBrowserSupabaseClient } from "../../../lib/supabase.js";

const bg = "#0f1115";
const accent = "#06b6d4";
const muted = "rgba(255,255,255,0.65)";
const border = "rgba(255,255,255,0.12)";

function LoginInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const from = searchParams.get("from") || "/admin";
  const oauthError = searchParams.get("error");

  const [tab, setTab] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [loading, setLoading] = useState(false);

  function getClient() {
    try {
      return createBrowserSupabaseClient();
    } catch (e) {
      throw new Error("Supabase is not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.");
    }
  }

  async function handleLogin(e) {
    e.preventDefault();
    setError("");
    setInfo("");
    setLoading(true);
    try {
      const supabase = getClient();
      const { error: err } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
      if (err) {
        setError(err.message || "Login failed");
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

  async function handleRegister(e) {
    e.preventDefault();
    setError("");
    setInfo("");
    if (password !== confirm) {
      setError("Passwords do not match");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }
    setLoading(true);
    try {
      const supabase = getClient();
      const { data, error: err } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            full_name: fullName.trim(),
            username: username.trim().replace(/^@/, ""),
          },
        },
      });
      if (err) {
        setError(err.message || "Registration failed");
        setLoading(false);
        return;
      }
      if (data.session) {
        router.push(from);
        router.refresh();
      } else {
        setInfo("Check your email to confirm your account, then sign in.");
      }
    } catch (err) {
      setError(err.message || "Registration failed");
    }
    setLoading(false);
  }

  async function handleGoogle() {
    setError("");
    setInfo("");
    try {
      const supabase = getClient();
      const origin = typeof window !== "undefined" ? window.location.origin : "";
      const { error: err } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${origin}/auth/callback?next=${encodeURIComponent(from)}`,
        },
      });
      if (err) setError(err.message || "Google sign-in failed");
    } catch (err) {
      setError(err.message || "Google sign-in failed");
    }
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
          Sign in with your author account (Supabase).
        </p>

        {oauthError && (
          <p style={{ color: "#f87171", fontSize: "0.875rem", marginBottom: "1rem" }}>
            {oauthError === "oauth" && "Google sign-in was cancelled or failed."}
            {oauthError === "session" && "Could not complete session. Try again."}
            {oauthError === "config" && "Supabase is not configured on the server."}
            {!["oauth", "session", "config"].includes(oauthError) && "Something went wrong."}
          </p>
        )}

        <div
          style={{
            display: "flex",
            gap: "0.5rem",
            marginBottom: "1.25rem",
            borderBottom: `1px solid ${border}`,
            paddingBottom: "0.25rem",
          }}
        >
          {["login", "register"].map((id) => (
            <button
              key={id}
              type="button"
              onClick={() => {
                setTab(id);
                setError("");
                setInfo("");
              }}
              style={{
                flex: 1,
                padding: "0.6rem 0.75rem",
                borderRadius: "0.5rem",
                border: "none",
                cursor: "pointer",
                fontWeight: 600,
                fontSize: "0.9rem",
                background: tab === id ? `${accent}22` : "transparent",
                color: tab === id ? accent : muted,
                borderBottom: tab === id ? `2px solid ${accent}` : "2px solid transparent",
              }}
            >
              {id === "login" ? "Login" : "Register"}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={handleGoogle}
          className="header-btn"
          style={{
            width: "100%",
            marginBottom: "1rem",
            borderRadius: "0.5rem",
            padding: "0.65rem 1rem",
            border: `1px solid ${border}`,
            background: "rgba(255,255,255,0.04)",
            color: "#f8fafc",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "0.5rem",
          }}
        >
          <span style={{ fontSize: "1.1rem" }} aria-hidden>
            G
          </span>
          Continue with Google
        </button>

        <div style={{ textAlign: "center", color: muted, fontSize: "0.75rem", marginBottom: "1rem" }}>
          or {tab === "login" ? "sign in" : "register"} with email
        </div>

        {tab === "login" ? (
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
            {info && <p style={{ color: accent, fontSize: "0.875rem", margin: 0 }}>{info}</p>}
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
        ) : (
          <form onSubmit={handleRegister} style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
            <label style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
              <span style={{ fontSize: "0.8rem", color: muted }}>Full name</span>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                autoComplete="name"
                style={inputStyle(border)}
              />
            </label>
            <label style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
              <span style={{ fontSize: "0.8rem", color: muted }}>Username</span>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                autoComplete="username"
                style={inputStyle(border)}
              />
            </label>
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
                autoComplete="new-password"
                minLength={8}
                style={inputStyle(border)}
              />
            </label>
            <label style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
              <span style={{ fontSize: "0.8rem", color: muted }}>Confirm password</span>
              <input
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                required
                autoComplete="new-password"
                style={inputStyle(border)}
              />
            </label>
            {error && <p style={{ color: "#f87171", fontSize: "0.875rem", margin: 0 }}>{error}</p>}
            {info && <p style={{ color: accent, fontSize: "0.875rem", margin: 0 }}>{info}</p>}
            <button type="submit" disabled={loading} style={{ ...primaryBtn(accent), opacity: loading ? 0.7 : 1 }}>
              {loading ? "Creating account…" : "Create account"}
            </button>
          </form>
        )}

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

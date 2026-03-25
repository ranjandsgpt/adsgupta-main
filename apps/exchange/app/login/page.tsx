"use client";

import { signIn } from "next-auth/react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";

function LoginForm() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/admin";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  return (
    <div className="page-content" style={{ display: "flex", justifyContent: "center", paddingTop: 48 }}>
      <div className="card" style={{ width: "100%", maxWidth: 400, padding: 24 }}>
        <h1 style={{ margin: "0 0 6px", fontSize: 16, fontWeight: 600, color: "var(--text)" }}>Sign in to AdsGupta</h1>
        <p style={{ fontSize: 12, color: "var(--muted)", margin: "0 0 20px" }}>Exchange Admin access</p>
        <label>Email</label>
        <div style={{ height: 6 }} />
        <input placeholder="you@company.com" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
        <div style={{ height: 12 }} />
        <label>Password</label>
        <div style={{ height: 6 }} />
        <input
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
        />
        {error ? <p style={{ color: "var(--red)", fontSize: 12, marginTop: 10 }}>{error}</p> : null}
        <div style={{ height: 16 }} />
        <button
          type="button"
          className="btn-primary"
          style={{ width: "100%", justifyContent: "center" }}
          disabled={submitting}
          onClick={async () => {
            setError(null);
            setSubmitting(true);
            try {
              const res = await signIn("credentials", {
                email,
                password,
                redirect: false,
                callbackUrl
              });
              if (res?.error) {
                setError("Invalid credentials or wrong portal user.");
                setSubmitting(false);
                return;
              }
              window.location.assign(callbackUrl);
            } catch {
              setError("Network error");
              setSubmitting(false);
            }
          }}
        >
          {submitting ? "Signing in…" : "Sign In"}
        </button>
        <div style={{ height: 16 }} />
        <Link href="/" className="btn-ghost" style={{ display: "inline-flex", paddingLeft: 0 }}>
          ← Back to Platform
        </Link>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="page-content" style={{ paddingTop: 48 }}>
          <div className="card" style={{ maxWidth: 400, margin: "0 auto", padding: 24 }}>
            Loading…
          </div>
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}

"use client";

import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { Suspense, useMemo, useState } from "react";

function LoginForm() {
  const searchParams = useSearchParams();
  const portal = searchParams.get("portal") ?? "admin";
  const callbackUrl = searchParams.get("callbackUrl") ?? "/admin";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const title = useMemo(() => {
    if (portal === "publisher") return "Publisher sign-in";
    if (portal === "demand") return "Demand sign-in";
    return "Exchange admin sign-in";
  }, [portal]);

  return (
    <div style={{ maxWidth: 440, margin: "80px auto", padding: "0 16px" }}>
      <div className="card">
        <h1 style={{ marginTop: 0, color: "var(--text-bright)" }}>{title}</h1>
        <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 0 }}>
          Portal: <code>{portal}</code>
        </p>
        <label style={{ fontSize: 11, color: "var(--text-muted)" }}>Email</label>
        <div style={{ height: 6 }} />
        <input placeholder="you@company.com" value={email} onChange={(e) => setEmail(e.target.value)} />
        <div style={{ height: 12 }} />
        <label style={{ fontSize: 11, color: "var(--text-muted)" }}>Password</label>
        <div style={{ height: 6 }} />
        <input
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {error && (
          <p style={{ color: "#ff4757", fontSize: 12, marginTop: 10 }}>{error}</p>
        )}
        <div style={{ height: 14 }} />
        <button
          type="button"
          onClick={async () => {
            setError(null);
            const res = await signIn("credentials", {
              email,
              password,
              redirect: false,
              callbackUrl
            });
            if (res?.error) {
              setError("Invalid credentials or wrong portal user.");
              return;
            }
            window.location.assign(callbackUrl);
          }}
        >
          Sign in
        </button>
        <div style={{ height: 12 }} />
        <LinkAllPortals />
      </div>
    </div>
  );
}

function LinkAllPortals() {
  return (
    <a href="/" style={{ fontSize: 12, color: "var(--text-muted)" }}>
      ← All portals
    </a>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div style={{ maxWidth: 440, margin: "80px auto", padding: 16 }} className="card">
          Loading…
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}

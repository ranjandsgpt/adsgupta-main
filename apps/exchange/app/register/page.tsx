"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

type RoleChoice = "publisher" | "advertiser";

function RoleCard(props: {
  role: RoleChoice;
  active: boolean;
  title: string;
  desc: string;
  onPick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={props.onPick}
      className="card"
      style={{
        textAlign: "left",
        padding: 16,
        cursor: "pointer",
        borderColor: props.active ? "var(--accent)" : "var(--border)",
        boxShadow: props.active ? "0 0 0 1px rgba(0,102,204,0.35)" : undefined
      }}
    >
      <div style={{ fontWeight: 900, color: "var(--text-bright)" }}>{props.title}</div>
      <div style={{ fontSize: 12, color: "var(--text-muted)", lineHeight: 1.55, marginTop: 6 }}>{props.desc}</div>
    </button>
  );
}

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [role, setRole] = useState<RoleChoice>("publisher");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const canContinue = useMemo(() => {
    if (step === 1) return true;
    if (step === 2) return Boolean(name.trim() && email.trim() && password.length >= 8);
    return true;
  }, [step, name, email, password]);

  async function submit() {
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/platform-users/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role,
          name: name.trim(),
          email: email.trim(),
          password
        })
      });
      const j = (await res.json()) as any;
      if (!res.ok) {
        setError(typeof j?.error === "string" ? j.error : "Registration failed");
        setSubmitting(false);
        return;
      }
      setSuccess(true);
      setStep(3);
    } catch {
      setError("Network error");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="page-content" style={{ maxWidth: 720, margin: "0 auto", paddingTop: 40, paddingBottom: 56 }}>
      <div style={{ marginBottom: 14 }}>
        <Link href="/" style={{ color: "var(--accent)", fontSize: 12 }}>
          ← Back
        </Link>
      </div>

      <h1 style={{ margin: "0 0 8px", fontSize: 22, color: "var(--text-bright)" }}>Create your account</h1>
      <p style={{ margin: "0 0 18px", fontSize: 13, color: "var(--text-muted)", lineHeight: 1.6 }}>
        Step {step} of 3
      </p>

      {error ? (
        <div
          style={{
            padding: "10px 12px",
            borderRadius: 8,
            background: "#ff475718",
            border: "1px solid #ff475755",
            color: "#ff8f8f",
            fontSize: 12,
            marginBottom: 14
          }}
        >
          {error}
        </div>
      ) : null}

      {step === 1 ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 12 }}>
          <RoleCard
            role="publisher"
            active={role === "publisher"}
            title="Publisher"
            desc="Monetize your inventory. Create ad units and deploy tags."
            onPick={() => setRole("publisher")}
          />
          <RoleCard
            role="advertiser"
            active={role === "advertiser"}
            title="Advertiser"
            desc="Run campaigns across publisher inventory."
            onPick={() => setRole("advertiser")}
          />
        </div>
      ) : null}

      {step === 2 ? (
        <div className="card" style={{ padding: 18 }}>
          <label style={{ fontSize: 11, color: "var(--text-muted)" }}>Name *</label>
          <div style={{ height: 6 }} />
          <input value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" />
          <div style={{ height: 14 }} />

          <label style={{ fontSize: 11, color: "var(--text-muted)" }}>Email *</label>
          <div style={{ height: 6 }} />
          <input value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
          <div style={{ height: 14 }} />

          <label style={{ fontSize: 11, color: "var(--text-muted)" }}>Password *</label>
          <div style={{ height: 6 }} />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
            placeholder="Minimum 8 characters"
          />
          <p style={{ margin: "8px 0 0", fontSize: 11, color: "var(--text-muted)" }}>
            Accounts start as <strong>pending</strong> until an admin activates them.
          </p>
        </div>
      ) : null}

      {step === 3 ? (
        <div className="card" style={{ padding: 18 }}>
          <div style={{ fontWeight: 900, color: "var(--text-bright)", marginBottom: 6 }}>Account created</div>
          <div style={{ fontSize: 12, color: "var(--text-muted)", lineHeight: 1.6 }}>
            Account created. An admin will activate your account shortly.
          </div>
          <div style={{ marginTop: 14, display: "flex", gap: 12, flexWrap: "wrap" }}>
            <Link href="/login" className="btn-primary">
              Sign in →
            </Link>
            <button
              type="button"
              className="btn-secondary"
              onClick={() => {
                if (role === "publisher") router.push("/publisher/register");
                else router.push("/demand/create");
              }}
            >
              Continue
            </button>
          </div>
        </div>
      ) : null}

      <div style={{ marginTop: 16, display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
        {step > 1 && step < 3 ? (
          <button
            type="button"
            className="btn-ghost"
            onClick={() => {
              setError(null);
              setStep((s) => (s === 2 ? 1 : 1));
            }}
          >
            ← Back
          </button>
        ) : (
          <span />
        )}

        {step < 3 ? (
          <button
            type="button"
            className="btn-primary"
            disabled={!canContinue || submitting}
            onClick={async () => {
              if (step === 1) setStep(2);
              else if (step === 2) await submit();
            }}
          >
            {step === 2 ? (submitting ? "Creating…" : "Create account") : "Continue →"}
          </button>
        ) : null}
      </div>

      {!success ? (
        <p style={{ marginTop: 18, fontSize: 12, color: "var(--text-muted)" }}>
          Already have an account?{" "}
          <Link href="/login" style={{ color: "var(--accent)" }}>
            Sign in
          </Link>
        </p>
      ) : null}
    </div>
  );
}


"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { FormEvent, Suspense, useCallback, useEffect, useState } from "react";

type Unit = { id: string; name: string; status: string; floor_price: string };

type TestRow = {
  name: string;
  status: "pass" | "fail" | "warn";
  message: string;
  detail?: Record<string, unknown>;
};

function TesterInner() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const [publisherId, setPublisherId] = useState(id ?? "");
  const [units, setUnits] = useState<Unit[]>([]);
  const [adUnitId, setAdUnitId] = useState("");
  const [testUrl, setTestUrl] = useState("https://");
  const [loadingUnits, setLoadingUnits] = useState(false);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{
    tests: TestRow[];
    overallBanner: string;
    overallStatus: string;
    recommendations: string[];
    quickLinks: { contactActivation: boolean; demandStats: string; dashboard: string };
  } | null>(null);

  const loadUnits = useCallback(async () => {
    if (!publisherId.trim()) return;
    setLoadingUnits(true);
    setError(null);
    try {
      const res = await fetch(`/api/inventory?publisherId=${encodeURIComponent(publisherId.trim())}`, {
        credentials: "include"
      });
      const data = await res.json();
      if (!res.ok) throw new Error(typeof data.error === "string" ? data.error : "Failed to load units");
      const list = (Array.isArray(data) ? data : []) as Unit[];
      setUnits(list.filter((u) => u.status === "active"));
      if (list[0]?.id) setAdUnitId(list[0].id);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error");
    }
    setLoadingUnits(false);
  }, [publisherId]);

  useEffect(() => {
    if (id) setPublisherId(id);
  }, [id]);

  async function runTest(e: FormEvent) {
    e.preventDefault();
    setRunning(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch("/api/publisher/test-integration", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          publisherId: publisherId.trim(),
          adUnitId,
          testUrl: testUrl.trim()
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(typeof data.error === "string" ? data.error : "Test failed");
      setResult(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error");
    }
    setRunning(false);
  }

  const bannerColor =
    result?.overallStatus === "ready"
      ? "#2ecc71"
      : result?.overallStatus === "warnings"
        ? "#ffd32a"
        : result
          ? "#ff4757"
          : "var(--border)";

  return (
    <div style={{ maxWidth: 720 }}>
      <h1 style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 22, color: "var(--text-bright)", marginBottom: 6 }}>
        Integration Tester
      </h1>
      <p style={{ color: "var(--text-muted)", fontSize: 13, marginBottom: 24 }}>
        Verify your MDE tag is correctly installed on your website before going live.
      </p>

      <form onSubmit={runTest} className="card" style={{ marginBottom: 20 }}>
        <div style={{ marginBottom: 14 }}>
          <label style={{ fontSize: 11, color: "var(--text-muted)", display: "block", marginBottom: 6 }}>Step 1 — Publisher ID</label>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <input
              value={publisherId}
              onChange={(e) => setPublisherId(e.target.value)}
              placeholder="UUID"
              style={{ flex: 1, minWidth: 200, padding: 8 }}
            />
            <button type="button" className="secondary" disabled={loadingUnits} onClick={() => void loadUnits()}>
              {loadingUnits ? "Loading…" : "Load my units"}
            </button>
          </div>
        </div>

        <div style={{ marginBottom: 14 }}>
          <label style={{ fontSize: 11, color: "var(--text-muted)", display: "block", marginBottom: 6 }}>Step 2 — Ad unit</label>
          <select value={adUnitId} onChange={(e) => setAdUnitId(e.target.value)} style={{ width: "100%", padding: 8 }}>
            {units.length === 0 ? (
              <option value="">Load units first</option>
            ) : (
              units.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name} ({u.id.slice(0, 8)}…)
                </option>
              ))
            )}
          </select>
        </div>

        <div style={{ marginBottom: 14 }}>
          <label style={{ fontSize: 11, color: "var(--text-muted)", display: "block", marginBottom: 6 }}>
            Step 3 — URL where you placed the tag
          </label>
          <input
            value={testUrl}
            onChange={(e) => setTestUrl(e.target.value)}
            placeholder="https://yoursite.com/page"
            style={{ width: "100%", padding: 8 }}
          />
        </div>

        <button type="submit" disabled={running || !publisherId || !adUnitId}>
          {running ? "Running…" : "Run test"}
        </button>
      </form>

      {error && <p style={{ color: "#ff4757", fontSize: 13 }}>{error}</p>}

      {result && (
        <>
          <div
            className="card"
            style={{
              marginBottom: 16,
              borderColor: bannerColor + "66",
              background: bannerColor + "14"
            }}
          >
            <strong style={{ color: bannerColor }}>Overall: {result.overallBanner}</strong>
          </div>

          <div style={{ marginBottom: 16 }}>
            {result.tests.map((t) => (
              <div
                key={t.name}
                className="card"
                style={{
                  marginBottom: 8,
                  display: "flex",
                  gap: 10,
                  alignItems: "flex-start",
                  borderLeft: `4px solid ${
                    t.status === "pass" ? "#2ecc71" : t.status === "warn" ? "#ffd32a" : "#ff4757"
                  }`
                }}
              >
                <span style={{ fontSize: 16 }}>{t.status === "pass" ? "✓" : t.status === "warn" ? "⚠" : "✗"}</span>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 12 }}>{t.name}</div>
                  <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{t.message}</div>
                </div>
              </div>
            ))}
          </div>

          {result.recommendations.length > 0 && (
            <div className="card" style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 11, fontWeight: 700, marginBottom: 8 }}>Recommendations</div>
              <ul style={{ margin: 0, paddingLeft: 18, fontSize: 12, color: "var(--text-muted)" }}>
                {result.recommendations.map((r, i) => (
                  <li key={i} style={{ marginBottom: 6 }}>
                    {r}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div style={{ fontSize: 12, display: "flex", flexDirection: "column", gap: 8 }}>
            {result.quickLinks.contactActivation && (
              <span>
                Account not active? Contact the exchange team to activate →{" "}
                <a href="mailto:ranjan@adsgupta.com" style={{ color: "var(--accent)" }}>
                  ranjan@adsgupta.com
                </a>
              </span>
            )}
            <Link href={result.quickLinks.demandStats} style={{ color: "var(--accent)" }}>
              View public exchange stats and demand →
            </Link>
            <Link href={result.quickLinks.dashboard} style={{ color: "var(--accent)" }}>
              Open publisher dashboard →
            </Link>
          </div>
        </>
      )}

      <p style={{ marginTop: 24, fontSize: 12 }}>
        <Link href={id ? `/publisher/dashboard?id=${encodeURIComponent(id)}` : "/publisher/dashboard"} style={{ color: "var(--accent)" }}>
          ← Back to dashboard
        </Link>
      </p>
    </div>
  );
}

export default function IntegrationTesterPage() {
  return (
    <Suspense fallback={<p style={{ color: "var(--text-muted)" }}>Loading…</p>}>
      <TesterInner />
    </Suspense>
  );
}

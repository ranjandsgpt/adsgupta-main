"use client";

import { useMemo, useState } from "react";

type Step = {
  step: string;
  status: "pass" | "fail" | "skip";
  durationMs: number;
  detail: string;
};

type E2ETestResult = {
  passed: boolean;
  steps: Step[];
  totalDurationMs: number;
  summary: string;
};

export function AdminE2eRunner({ secret }: { secret: string }) {
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<E2ETestResult | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const auctionStep = useMemo(() => result?.steps.find((s) => s.step.toLowerCase().includes("auction")), [result]);

  const run = async () => {
    if (!secret) {
      setErr("DB_INIT_SECRET is not configured on the server.");
      return;
    }
    setRunning(true);
    setErr(null);
    try {
      const r = await fetch(`/api/test/e2e?secret=${encodeURIComponent(secret)}`, { method: "GET" });
      const j = (await r.json()) as E2ETestResult;
      setResult(j);
    } catch {
      setErr("Network error");
    } finally {
      setRunning(false);
    }
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
        <h1 style={{ margin: 0, color: "var(--text-bright)", fontSize: 20 }}>Integration Test</h1>
        <button type="button" onClick={() => void run()} disabled={running} className="secondary" style={{ fontSize: 12 }}>
          {running ? "Running…" : "Run Integration Test"}
        </button>
      </div>

      <p style={{ margin: "10px 0 16px", fontSize: 12, color: "var(--text-muted)" }}>
        Programmatically validates publishers → campaigns → creatives → auction → win notice → impression logging.
      </p>

      {err ? <p style={{ color: "#ff4757", fontSize: 12 }}>{err}</p> : null}

      {result ? (
        <div style={{ marginTop: 14 }}>
          <div style={{ color: result.passed ? "#2ecc71" : "#ff4757", fontWeight: 900, marginBottom: 8 }}>
            {result.passed ? "✅ Passed" : "❌ Failed"} · {Math.round(result.totalDurationMs)}ms
          </div>
          <div style={{ color: "var(--text-muted)", fontSize: 12, marginBottom: 14 }}>{result.summary}</div>

          {auctionStep?.status === "fail" ? (
            <div style={{ marginBottom: 14 }}>
              <a href="/admin/auction-log" style={{ color: "var(--accent)", fontWeight: 800 }}>
                Auction step failed — open auction log →
              </a>
            </div>
          ) : null}

          <div style={{ overflow: "auto", border: "1px solid var(--border)", borderRadius: 10 }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
              <thead>
                <tr>
                  {["Step", "Status", "Duration", "Detail"].map((h) => (
                    <th
                      key={h}
                      style={{
                        textAlign: "left",
                        padding: "10px 12px",
                        borderBottom: "1px solid var(--border)",
                        color: "var(--text-muted)"
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {result.steps.map((s) => (
                  <tr key={s.step}>
                    <td style={{ padding: "10px 12px", borderBottom: "1px solid #e2e8f033", width: 340 }}>{s.step}</td>
                    <td
                      style={{
                        padding: "10px 12px",
                        borderBottom: "1px solid #e2e8f033",
                        color: s.status === "pass" ? "#2ecc71" : s.status === "fail" ? "#ff4757" : "var(--text-muted)",
                        fontWeight: 900
                      }}
                    >
                      {s.status}
                    </td>
                    <td style={{ padding: "10px 12px", borderBottom: "1px solid #e2e8f033" }}>{s.durationMs}ms</td>
                    <td style={{ padding: "10px 12px", borderBottom: "1px solid #e2e8f033", color: "var(--text-muted)" }}>
                      {s.detail}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}
    </div>
  );
}


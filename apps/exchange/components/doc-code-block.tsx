"use client";

import { useCallback, useMemo, useState } from "react";

export function DocCodeBlock({ code, language }: { code: string; language?: string }) {
  const [copied, setCopied] = useState(false);
  const prettyLang = useMemo(() => language ?? "text", [language]);

  const onCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1200);
    } catch {
      // ignore copy failures
    }
  }, [code]);

  return (
    <div
      style={{
        border: "1px solid var(--border)",
        borderRadius: 10,
        overflow: "hidden",
        background: "#0c1018",
        marginTop: 12
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 10,
          padding: "8px 10px",
          borderBottom: "1px solid #e2e8f0"
        }}
      >
        <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{prettyLang}</div>
        <button
          type="button"
          className="secondary"
          onClick={() => void onCopy()}
          style={{
            fontSize: 11,
            padding: "6px 10px",
            background: copied ? "#2ecc7118" : undefined,
            borderColor: copied ? "#2ecc7177" : undefined,
            color: copied ? "#2ecc71" : undefined
          }}
        >
          {copied ? "Copied ✓" : "Copy"}
        </button>
      </div>
      <pre style={{ margin: 0, padding: 12, overflowX: "auto" }}>
        <code style={{ fontFamily: "JetBrains Mono, ui-monospace, monospace", fontSize: 12 }}>{code}</code>
      </pre>
    </div>
  );
}


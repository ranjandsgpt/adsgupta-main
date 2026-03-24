export default function AdminAiPage() {
  const caps = [
    ["✦ Format Generator", "Prompt → HTML/CSS creative scaffolding", "#ff6b9d"],
    ["◉ Contextual Signals", "IAB taxonomy from page content", "#4a9eff"],
    ["△ Dynamic Floors", "ML-optimized floors per impression", "#2ecc71"],
    ["◧ Layout Optimizer", "Placement & refresh experiments", "#ff8c42"]
  ] as const;
  return (
    <div>
      <h1 style={{ color: "var(--text-bright)", marginTop: 0 }}>AI Studio</h1>
      <p style={{ color: "var(--text-muted)", fontSize: 12, marginBottom: 20 }}>
        Natural-language tools · static shell until models are wired.
      </p>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        {caps.map(([t, d, c]) => (
          <div key={String(t)} className="card" style={{ borderLeft: `3px solid ${c}` }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: c }}>{t}</div>
            <div style={{ fontSize: 10, color: "var(--text-muted)", marginTop: 4 }}>{d}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

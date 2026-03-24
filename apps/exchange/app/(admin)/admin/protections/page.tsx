export default function AdminProtectionsPage() {
  const blocks = [
    ["Advertiser URL Blocking", "Block specific advertiser domains", "47 domains blocked", "#ff4757"],
    ["Category Blocking", "IAB categories", "Gambling, Alcohol", "#ff8c42"],
    ["IVT Detection", "GIVT + SIVT", "Blocked: 3.2%", "#2ecc71"],
    ["GDPR / TCF 2.2", "CMP integration", "Enabled", "#4a9eff"]
  ] as const;
  return (
    <div>
      <h1 style={{ color: "var(--text-bright)", marginTop: 0 }}>Protections &amp; Brand Safety</h1>
      <p style={{ color: "var(--text-muted)", fontSize: 12, marginBottom: 20 }}>
        UI shell matching exchange reference · wire policies to enforcement later.
      </p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(260px,1fr))", gap: 10 }}>
        {blocks.map(([t, d, v, c]) => (
          <div key={String(t)} className="card" style={{ borderLeft: `3px solid ${c}` }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: c }}>{t}</div>
            <div style={{ fontSize: 10, color: "var(--text-muted)", marginTop: 4 }}>{d}</div>
            <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-bright)", marginTop: 6 }}>{v}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function AdminSettingsPage() {
  const rows = [
    ["Network Name", "MyExchange (MDE)"],
    ["Primary Currency", "USD"],
    ["OpenRTB Endpoint", "https://exchange.adsgupta.com/api/openrtb/auction"],
    ["Ad Tag CDN", "https://exchange.adsgupta.com/mde.js"]
  ] as const;
  return (
    <div>
      <h1 style={{ color: "var(--text-bright)", marginTop: 0 }}>Network Settings</h1>
      <p style={{ color: "var(--text-muted)", fontSize: 12, marginBottom: 16 }}>
        Static reference view · connect identity and API keys here later.
      </p>
      <div className="card" style={{ maxWidth: 560 }}>
        {rows.map(([k, v]) => (
          <div
            key={String(k)}
            style={{
              display: "flex",
              justifyContent: "space-between",
              padding: "10px 0",
              borderBottom: "1px solid #1a233233",
              fontSize: 11
            }}
          >
            <span style={{ color: "var(--text-muted)" }}>{k}</span>
            <span style={{ color: "var(--text-bright)", fontFamily: "monospace", textAlign: "right" }}>{v}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

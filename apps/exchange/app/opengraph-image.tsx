import { ImageResponse } from "next/og";

export const runtime = "edge";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "#ffffff",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 56
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div
            style={{
              color: "#ffffff",
              fontSize: 64,
              fontWeight: 900,
              letterSpacing: "-0.02em",
              fontFamily: "JetBrains Mono, ui-monospace, monospace"
            }}
          >
            MDE Exchange
          </div>
          <div
            style={{
              color: "#1a202c",
              fontSize: 26,
              fontWeight: 700,
              fontFamily: "JetBrains Mono, ui-monospace, monospace",
              lineHeight: 1.2
            }}
          >
            Real-Time OpenRTB Ad Exchange
          </div>
        </div>
        <div style={{ height: 10, width: "100%", background: "#0066cc", borderRadius: 6 }} />
      </div>
    ),
    { width: 1200, height: 630 }
  );
}


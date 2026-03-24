export function LoadErrorBanner({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <div
      className="card"
      style={{
        marginBottom: 16,
        borderColor: "#ff475755",
        background: "#ff475708",
        color: "#ff8a94",
        fontSize: 12,
        lineHeight: 1.5
      }}
      role="alert"
    >
      <strong style={{ color: "#ff4757" }}>Dashboard data unavailable</strong>
      <div style={{ marginTop: 6, fontFamily: "monospace", fontSize: 11, wordBreak: "break-word" }}>
        {message}
      </div>
    </div>
  );
}

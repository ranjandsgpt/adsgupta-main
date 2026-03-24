export const dynamic = "force-dynamic";

export default function DemandCreativesPage() {
  return (
    <div>
      <h1 style={{ color: "var(--text-bright)", marginTop: 0 }}>Creatives</h1>
      <p style={{ color: "var(--text-muted)", fontSize: 12 }}>
        Upload and traffick assets via <code>/api/creatives</code> (multipart for Blob storage).
      </p>
    </div>
  );
}

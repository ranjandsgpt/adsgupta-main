export const dynamic = "force-dynamic";

export default function AdminTagsPage() {
  return (
    <div>
      <h1 style={{ color: "var(--text-bright)", marginTop: 0 }}>Tag generator</h1>
      <p style={{ color: "var(--text-muted)", fontSize: 12 }}>
        Produce embed code that loads <code>/mde.js</code> and calls <code>mde.init</code> /{" "}
        <code>mde.defineSlot</code> / <code>mde.display</code> against{" "}
        <code>https://exchange.adsgupta.com/api/openrtb/auction</code>.
      </p>
    </div>
  );
}

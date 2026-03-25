export const dynamic = "force-dynamic";

/** Uptime monitor probe — keep minimal (<5ms typical). */
export async function GET() {
  return Response.json(
    { ok: true, ts: Date.now() },
    { headers: { "Cache-Control": "no-store" } }
  );
}

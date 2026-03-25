import { sql } from "@/lib/db";

async function hmacSha256(secret: string, body: string): Promise<string> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(body));
  return Array.from(new Uint8Array(signature))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/** Non-blocking: schedules webhook delivery after the current tick. */
export function fireWebhooksAsync(event: string, payload: object): void {
  const run = () => void fireWebhooks(event, payload);
  if (typeof setImmediate === "function") setImmediate(run);
  else setTimeout(run, 0);
}

async function fireWebhooks(event: string, payload: object): Promise<void> {
  try {
    const hooks = await sql<{
      id: string;
      url: string;
      secret: string | null;
      failure_count: string | null;
    }>`
      SELECT id, url, secret, failure_count::text AS failure_count
      FROM webhooks
      WHERE active = true AND ${event} = ANY(events)
    `;
    for (const hook of hooks.rows) {
      try {
        const body = JSON.stringify({
          event,
          timestamp: new Date().toISOString(),
          data: payload
        });
        const sig = hook.secret ? await hmacSha256(hook.secret, body) : undefined;
        const res = await fetch(hook.url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-MDE-Event": event,
            ...(sig ? { "X-MDE-Signature-256": `sha256=${sig}` } : {})
          },
          body,
          signal: AbortSignal.timeout(5000)
        });
        if (res.ok) {
          await sql`UPDATE webhooks SET failure_count = 0, last_triggered_at = now() WHERE id = ${hook.id}`;
        } else {
          const r = await sql<{ fc: string }>`
            UPDATE webhooks
            SET failure_count = COALESCE(failure_count, 0) + 1
            WHERE id = ${hook.id}
            RETURNING failure_count::text AS fc
          `;
          const fc = Number(r.rows[0]?.fc ?? 0);
          if (fc >= 10) await sql`UPDATE webhooks SET active = false WHERE id = ${hook.id}`;
        }
      } catch (e) {
        console.error("[webhook]", hook.url, e instanceof Error ? e.message : e);
      }
    }
  } catch (e) {
    console.error("[webhooks/load]", e instanceof Error ? e.message : e);
  }
}

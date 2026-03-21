import { isPostgresConfigured } from "./cms-runtime.js";
import { sql } from "./db.js";

/** First active inline ad from Postgres `ad_slots`. */
export async function getInlineMonetizationScript() {
  if (!isPostgresConfigured()) return "";
  try {
    const { rows } = await sql`
      SELECT ad_code FROM ad_slots
      WHERE active = true AND placement = 'inline'
      LIMIT 1
    `;
    if (rows?.[0]?.ad_code) return String(rows[0].ad_code);
  } catch {
    /* ignore */
  }
  return "";
}

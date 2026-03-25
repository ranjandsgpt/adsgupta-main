export const dynamic = "force-dynamic";
import { sql } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const secret = process.env.CRON_SECRET;
  if (secret && authHeader !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await Promise.all([
      sql`UPDATE publishers SET impressions_today = 0, revenue_today = 0`,
      sql`UPDATE campaigns SET impressions_today = 0, spend_today = 0`,
      sql`UPDATE ad_units SET impressions_today = 0, revenue_today = 0`,
      sql`UPDATE campaigns SET status = 'active' WHERE status = 'budget_exhausted'`,
      sql`
        UPDATE campaigns c SET win_rate_7d = (
          SELECT (COUNT(*) FILTER (WHERE cleared = true))::float / NULLIF(COUNT(*), 0) * 100
          FROM auction_log
          WHERE winning_campaign_id = c.id AND created_at > now() - interval '7 days'
        )
      `,
      sql`DELETE FROM segment_memberships WHERE expires_at < now()`,
      sql`
        UPDATE user_profiles SET
          recency_days = GREATEST(0, FLOOR(EXTRACT(epoch FROM (now() - last_seen)) / 86400)::int),
          frequency_7d = COALESCE((
            SELECT COUNT(*)::int FROM signal_events se
            WHERE se.user_id = user_profiles.user_id AND se.created_at > now() - interval '7 days'
          ), 0)
      `
    ]);

    console.log("[cron/daily-reset] completed at", new Date().toISOString());
    return NextResponse.json({ ok: true, resetAt: new Date().toISOString() });
  } catch (e) {
    console.error("[cron/daily-reset]", e instanceof Error ? e.message : e);
    return NextResponse.json({ error: e instanceof Error ? e.message : String(e) }, { status: 500 });
  }
}

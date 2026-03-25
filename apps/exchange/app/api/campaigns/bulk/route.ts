export const dynamic = "force-dynamic";
import { cacheDelete } from "@/lib/cache";
import { demandAdvertiserFilter } from "@/lib/demand-scope";
import { sql } from "@/lib/db";
import { json } from "@/lib/http";
import { forbidden, getAuthFromRequest, unauthorized } from "@/lib/require-auth";
import { validateCpm, validateEmail } from "@/lib/validate";
import { NextRequest } from "next/server";

function parseCsv(text: string): Record<string, string>[] {
  const lines = text.trim().split("\n").filter(Boolean);
  if (lines.length < 2) return [];
  const headers = lines[0]!.split(",").map((h) => h.trim().toLowerCase().replace(/ /g, "_"));
  return lines.slice(1).map((line) => {
    const values = line.split(",");
    return Object.fromEntries(headers.map((h, i) => [h, values[i]?.trim() ?? ""]));
  });
}

export async function POST(request: NextRequest) {
  const auth = await getAuthFromRequest(request);
  const body = await request.json().catch(() => ({}));
  const text = typeof body.csv === "string" ? body.csv : "";
  if (!text.trim()) return json({ error: "csv text required" }, 400);

  const emailLock =
    !auth && typeof body.advertiser_email === "string"
      ? String(body.advertiser_email).trim().toLowerCase()
      : "";

  if (!auth) {
    if (!emailLock || !validateEmail(emailLock)) return unauthorized();
  } else if (auth.role === "publisher") {
    return forbidden();
  } else if (auth.role !== "demand" && auth.role !== "admin") {
    return forbidden();
  }

  const rows = parseCsv(text);
  const errors: Array<{ row: number; field: string; message: string }> = [];
  let inserted = 0;

  const advLock = auth ? demandAdvertiserFilter(auth) : null;

  for (let i = 0; i < rows.length; i++) {
    const r = rows[i]!;
    const rowNum = i + 2;
    const name = r.campaign_name ?? r.campaignname;
    const adv = r.advertiser_name ?? r.advertisername;
    const em = r.advertiser_email ?? r.advertiseremail;
    const bid = Number(r.bid_price_cpm ?? r.bid_price);
    const budget = Number(r.daily_budget_usd ?? r.daily_budget);
    const sizesRaw = r.target_sizes ?? "";
    const sizes = sizesRaw.split(/[|;]/).map((s) => s.trim()).filter(Boolean);
    const start = r.start_date || null;
    const end = r.end_date || null;

    if (!name || !adv) {
      errors.push({ row: rowNum, field: "campaign_name", message: "Missing name or advertiser" });
      continue;
    }
    if (advLock && adv !== advLock) {
      errors.push({ row: rowNum, field: "advertiser_name", message: "Does not match seat" });
      continue;
    }
    if (!em || !validateEmail(em)) {
      errors.push({ row: rowNum, field: "advertiser_email", message: "Invalid email" });
      continue;
    }
    if (!auth && String(em).trim().toLowerCase() !== emailLock) {
      errors.push({ row: rowNum, field: "advertiser_email", message: "Must match bulk advertiser_email" });
      continue;
    }
    if (!Number.isFinite(bid) || !validateCpm(bid)) {
      errors.push({ row: rowNum, field: "bid_price_cpm", message: "Invalid CPM" });
      continue;
    }
    if (!Number.isFinite(budget) || budget < 1) {
      errors.push({ row: rowNum, field: "daily_budget_usd", message: "Budget >= 1" });
      continue;
    }
    if (sizes.length === 0) {
      errors.push({ row: rowNum, field: "target_sizes", message: "Need sizes" });
      continue;
    }

    try {
      await sql`
        INSERT INTO campaigns (
          advertiser_name, advertiser_email, campaign_name, bid_price, daily_budget,
          target_sizes, target_devices, target_environments, status, name, advertiser, contact_email,
          start_date, end_date
        )
        VALUES (
          ${adv}, ${em}, ${name}, ${bid}, ${budget}, ${sizes},
          ARRAY['desktop','mobile']::text[],
          ARRAY['web']::text[],
          'pending',
          ${name}, ${adv}, ${em},
          ${start || null},
          ${end || null}
        )
      `;
      inserted++;
    } catch (e) {
      errors.push({ row: rowNum, field: "insert", message: e instanceof Error ? e.message : "Insert failed" });
    }
  }

  cacheDelete("campaigns:active");
  return json({ inserted, skipped: rows.length - inserted, errors });
}

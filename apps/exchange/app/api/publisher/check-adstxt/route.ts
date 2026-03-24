export const dynamic = "force-dynamic";
import { formatPublisherAdsTxtLine } from "@/lib/ads-txt-line";
import { sql } from "@/lib/db";
import { json } from "@/lib/http";
import { forbidden, getAuthFromRequest, unauthorized } from "@/lib/require-auth";
import { NextRequest } from "next/server";

function normDomain(d: string): string {
  return d
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, "")
    .split("/")[0]!
    .replace(/^www\./, "");
}

export async function GET(request: NextRequest) {
  const auth = await getAuthFromRequest(request);
  if (!auth) return unauthorized();

  const domain = request.nextUrl.searchParams.get("domain")?.trim() ?? "";
  const publisherId = request.nextUrl.searchParams.get("publisherId")?.trim() ?? "";
  if (!domain || !publisherId) {
    return json({ error: "domain and publisherId are required" }, 400);
  }
  if (auth.role === "publisher" && auth.publisherId !== publisherId) return forbidden();
  if (auth.role !== "publisher" && auth.role !== "admin") return forbidden();

  const pub = await sql<{ id: string; domain: string }>`
    SELECT id, domain FROM publishers WHERE id = ${publisherId} LIMIT 1
  `;
  const p = pub.rows[0];
  if (!p) return json({ error: "Publisher not found" }, 404);

  const expectedLine = formatPublisherAdsTxtLine(publisherId);
  const host = normDomain(domain);
  const regDom = normDomain(p.domain);
  if (host !== regDom) {
    return json({
      status: "warn",
      message: "Domain does not match your registered publisher domain — check is skipped for safety",
      registeredDomain: p.domain,
      checkedAt: new Date().toISOString()
    });
  }

  const url = `https://${host}/ads.txt`;
  let text = "";
  let fetchOk = false;
  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 8000);
    const res = await fetch(url, {
      signal: ctrl.signal,
      headers: { Accept: "text/plain,*/*" },
      redirect: "follow"
    });
    clearTimeout(t);
    fetchOk = res.ok;
    if (res.ok) text = await res.text();
  } catch {
    fetchOk = false;
  }

  const now = new Date().toISOString();
  const hasLine =
    text.includes(expectedLine) ||
    (text.includes(publisherId) &&
      text.includes("exchange.adsgupta.com") &&
      text.includes("mde-exchange-001"));

  let status: "ok" | "missing" | "unknown";
  let message: string;

  if (!fetchOk || !text) {
    status = "unknown";
    message = "Could not fetch ads.txt — domain may not be live yet or blocked.";
  } else if (hasLine) {
    status = "ok";
    message = "MDE entry found in ads.txt.";
  } else {
    status = "missing";
    message = "MDE entry missing — add the line from the Supply Chain tab.";
  }

  try {
    await sql`
      UPDATE publishers
      SET ads_txt_checked_at = now()::timestamptz,
          ads_txt_status = ${status}
      WHERE id = ${publisherId}
    `;
  } catch (e) {
    console.error("[check-adstxt] update failed:", e);
  }

  return json({
    status,
    message,
    url,
    expectedLine,
    checkedAt: now
  });
}

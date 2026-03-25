export const dynamic = "force-dynamic";
import { runAuction } from "@/lib/auction-engine";
import { sql } from "@/lib/db";
import { json } from "@/lib/http";
import { buildPublisherTagSnippet, validateTagSnippetWellFormed } from "@/lib/publisher-tag-snippet";
import { forbidden, getAuthFromRequest, unauthorized } from "@/lib/require-auth";
import type { OpenRTB26Imp } from "@/lib/openrtb-types";
import { randomUUID } from "crypto";
import { NextRequest } from "next/server";

type TestStatus = "pass" | "fail" | "warn";

type TestRow = { name: string; status: TestStatus; message: string; detail?: Record<string, unknown> };

function overallFromTests(tests: TestRow[]): "pass" | "warn" | "fail" {
  if (tests.some((t) => t.status === "fail")) return "fail";
  if (tests.some((t) => t.status === "warn")) return "warn";
  return "pass";
}

export async function POST(request: NextRequest) {
  const auth = await getAuthFromRequest(request);
  if (!auth) return unauthorized();

  let body: { publisherId?: string; adUnitId?: string; testUrl?: string };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return json({ error: "Invalid JSON" }, 400);
  }

  const publisherId = String(body.publisherId ?? "").trim();
  const adUnitId = String(body.adUnitId ?? "").trim();
  const testUrl = String(body.testUrl ?? "").trim();

  if (!publisherId || !adUnitId || !testUrl) {
    return json({ error: "publisherId, adUnitId, and testUrl are required" }, 400);
  }

  if (auth.role === "publisher" && auth.publisherId !== publisherId) return forbidden();
  if (auth.role !== "publisher" && auth.role !== "admin") return forbidden();

  let urlOk = false;
  try {
    const u = new URL(testUrl);
    urlOk = u.protocol === "http:" || u.protocol === "https:";
  } catch {
    urlOk = false;
  }
  if (!urlOk) {
    return json({ error: "testUrl must be a valid http(s) URL" }, 400);
  }

  const tests: TestRow[] = [];
  const recommendations: string[] = [];

  const pub = await sql<{ id: string; status: string; name: string }>`
    SELECT id, status, name FROM publishers WHERE id = ${publisherId} LIMIT 1
  `;
  const p = pub.rows[0];
  if (!p) {
    tests.push({ name: "Publisher account", status: "fail", message: "Publisher not found" });
  } else if (p.status !== "active") {
    tests.push({
      name: "Publisher account",
      status: "fail",
      message: `Publisher status is “${p.status}”, not active`,
      detail: { status: p.status }
    });
    recommendations.push("Contact the exchange team to activate your account before going live.");
  } else {
    tests.push({ name: "Publisher account", status: "pass", message: "Publisher exists and is active" });
  }

  const unitRes = await sql<{
    id: string;
    name: string;
    publisher_id: string;
    status: string;
    floor_price: string;
    sizes: string[];
  }>`
    SELECT id, name, publisher_id, status, floor_price::text, sizes
    FROM ad_units WHERE id = ${adUnitId} LIMIT 1
  `;
  const unit = unitRes.rows[0];
  if (!unit || unit.publisher_id !== publisherId) {
    tests.push({ name: "Ad unit", status: "fail", message: "Ad unit not found for this publisher" });
  } else if (unit.status !== "active") {
    tests.push({
      name: "Ad unit",
      status: "fail",
      message: `Ad unit is ${unit.status}`,
      detail: { floor_price: unit.floor_price }
    });
  } else {
    tests.push({
      name: "Ad unit",
      status: "pass",
      message: "Ad unit is active",
      detail: { floor_price: Number(unit.floor_price), name: unit.name }
    });
    const fp = Number(unit.floor_price);
    if (fp > 5) {
      tests.push({
        name: "Floor price sanity",
        status: "warn",
        message: `Floor ${fp} is high — may reduce fill`,
        detail: { floor_price: fp }
      });
      recommendations.push("Consider lowering floor price on the dashboard if fill is low.");
    }
  }

  let auctionDetail: Record<string, unknown> = {};
  if (p?.status === "active" && unit && unit.publisher_id === publisherId && unit.status === "active") {
    const firstSize = unit.sizes[0] ?? "300x250";
    const [sw, sh] = firstSize.split("x");
    const w = Number(sw) || 300;
    const h = Number(sh) || 250;
    const imp: OpenRTB26Imp = {
      id: "1",
      tagid: adUnitId,
      bidfloor: Number(unit.floor_price) || 0.5,
      banner: { format: [{ w, h }] },
      secure: testUrl.startsWith("https:") ? 1 : 0
    };
    const openrtbId = randomUUID();
    try {
      const out = await runAuction(openrtbId, adUnitId, imp, testUrl, 0, {
        site: { page: testUrl, domain: new URL(testUrl).hostname },
        device: { ua: "MDE-Integration-Tester/1.0" }
      });
      const bidCount = out?.bidCount ?? 0;
      const filled = !!out?.winner;
      auctionDetail = {
        bidCount,
        winningBid: out?.winner?.clearingPrice ?? null,
        fill: filled
      };
      if (!out) {
        tests.push({ name: "Auction simulation", status: "fail", message: "Auction did not complete", detail: auctionDetail });
      } else if (bidCount === 0) {
        tests.push({
          name: "Auction simulation",
          status: "warn",
          message: "No bids cleared the floor — no eligible demand at this time",
          detail: auctionDetail
        });
      } else {
        tests.push({
          name: "Auction simulation",
          status: "pass",
          message: filled ? `Auction ran: ${bidCount} bid(s), winner cleared` : `Auction ran: ${bidCount} bid(s) but no winner`,
          detail: auctionDetail
        });
      }
    } catch (e) {
      tests.push({
        name: "Auction simulation",
        status: "fail",
        message: e instanceof Error ? e.message : "Auction error"
      });
    }
  } else {
    tests.push({ name: "Auction simulation", status: "fail", message: "Skipped — fix publisher or ad unit first" });
  }

  let eligible = 0;
  if (unit?.sizes?.length) {
    const elig = await sql<{ c: string }>`
      SELECT COUNT(DISTINCT c.id)::text AS c
      FROM campaigns c
      INNER JOIN creatives cr ON cr.campaign_id = c.id
      WHERE c.status = 'active'
        AND (c.start_date IS NULL OR c.start_date <= CURRENT_DATE)
        AND (c.end_date IS NULL OR c.end_date >= CURRENT_DATE)
        AND cr.status IN ('active', 'approved')
        AND cr.size = ANY(${unit.sizes})
        AND (COALESCE(cr.scan_passed, true) = true OR cr.status = 'approved')
    `;
    eligible = Number(elig.rows[0]?.c ?? 0);
  }
  if (eligible === 0) {
    tests.push({
      name: "Active demand",
      status: "warn",
      message: "No active campaigns with creatives matching this unit’s IAB sizes",
      detail: { eligibleCampaigns: 0 }
    });
    const sz = unit?.sizes?.join(", ") ?? "";
    recommendations.push(
      `No active demand for this unit’s sizes (${sz}). Create or activate campaigns targeting those sizes, or view demand on the public demand page.`
    );
  } else {
    tests.push({
      name: "Active demand",
      status: "pass",
      message: `${eligible} campaign(s) could serve this inventory`,
      detail: { eligibleCampaigns: eligible }
    });
  }

  if (unit && p) {
    const snippet = buildPublisherTagSnippet(publisherId, {
      id: unit.id,
      name: unit.name,
      sizes: unit.sizes,
      floor_price: unit.floor_price
    });
    const v = validateTagSnippetWellFormed(publisherId, unit.id, snippet);
    tests.push({
      name: "Tag generation",
      status: v.ok ? "pass" : "fail",
      message: v.ok ? "Generated tag is well-formed" : v.issues.join("; "),
      detail: { issues: v.issues }
    });
  } else {
    tests.push({ name: "Tag generation", status: "fail", message: "Could not validate tag" });
  }

  const overall = overallFromTests(tests);
  let overallStatus: string;
  let banner: string;
  if (overall === "pass") {
    overallStatus = "ready";
    banner = "Ready to serve ads";
  } else if (overall === "warn") {
    overallStatus = "warnings";
    banner = "Check warnings before going live";
  } else {
    overallStatus = "blocked";
    banner = "Fix issues before going live";
  }

  const payload = {
    tests,
    overallStatus,
    overallBanner: banner,
    recommendations,
    quickLinks: {
      contactActivation: p?.status !== "active",
      demandStats: "/stats",
      dashboard: `/publisher/dashboard?id=${encodeURIComponent(publisherId)}`
    }
  };

  try {
    await sql`
      INSERT INTO integration_tests (publisher_id, ad_unit_id, test_url, results)
      VALUES (${publisherId}, ${adUnitId}, ${testUrl}, ${JSON.stringify(payload)}::jsonb)
    `;
  } catch (e) {
    console.error("[test-integration] log insert failed:", e);
  }

  return json(payload);
}

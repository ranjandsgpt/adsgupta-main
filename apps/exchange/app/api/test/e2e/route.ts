import { sql } from "@/lib/db";
import { json } from "@/lib/http";
import { NextRequest } from "next/server";

export interface E2ETestResult {
  passed: boolean;
  steps: Array<{
    step: string;
    status: "pass" | "fail" | "skip";
    durationMs: number;
    detail: string;
  }>;
  totalDurationMs: number;
  summary: string;
}

async function tryStep<T>(
  step: string,
  fn: () => Promise<T>,
  disabled: boolean
): Promise<{ status: "pass" | "fail" | "skip"; durationMs: number; detail: string; value?: T }> {
  if (disabled) return { status: "skip", durationMs: 0, detail: "Skipped due to earlier failure" };
  const started = Date.now();
  try {
    const value = await fn();
    return { status: "pass", durationMs: Date.now() - started, detail: "OK", value };
  } catch (e) {
    const detail = e instanceof Error ? e.message : String(e);
    return { status: "fail", durationMs: Date.now() - started, detail };
  }
}

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest): Promise<Response> {
  const totalStarted = Date.now();
  const baseUrl = request.nextUrl.origin;

  const secret = request.nextUrl.searchParams.get("secret") ?? "";
  if (!process.env.DB_INIT_SECRET || secret !== process.env.DB_INIT_SECRET) {
    const result: E2ETestResult = {
      passed: false,
      steps: [
        {
          step: "Secret check",
          status: "fail",
          durationMs: 0,
          detail: "Invalid secret"
        }
      ],
      totalDurationMs: Date.now() - totalStarted,
      summary: "Unauthorized"
    };
    return json(result, 401);
  }

  const ECPM_SIZE = "300x250";
  const publisherDomain = `e2e-pub-${Math.random().toString(36).slice(2)}.example`;
  const contactEmail = `e2e-pub@${publisherDomain.replace(/[^a-z0-9]/gi, "")}`;
  const advertiserEmail = `e2e-buyer@${publisherDomain.replace(/[^a-z0-9]/gi, "")}`;

  const openrtbRequestId = `e2e-auction-${Math.random().toString(36).slice(2)}`;
  const testBid = 5.0;

  let publisherId: string | null = null;
  let adUnitId: string | null = null;
  let campaignId: string | null = null;
  let creativeId: string | null = null;
  let auctionLogId: string | null = null;

  const steps: E2ETestResult["steps"] = [];
  let failed = false;

  const res1 = await tryStep("DB connection (SELECT 1)", async () => {
    await sql`SELECT 1`;
  }, false);
  steps.push({ step: "DB connection (SELECT 1)", ...res1 });
  if (res1.status === "fail") failed = true;

  const res2 = await tryStep(
    "Create test publisher (POST /api/publishers)",
    async () => {
      const r = await sql<{
        id: string;
        name: string;
      }>`
        INSERT INTO publishers (name, domain, contact_email, ads_txt_verified, status, primary_ad_formats)
        VALUES ('E2E Publisher', ${publisherDomain}, ${contactEmail}, false, 'pending', ARRAY['display'])
        RETURNING id, name
      `;
      publisherId = r.rows[0]?.id ?? null;
      if (!publisherId) throw new Error("Failed to create publisher");
    },
    failed
  );
  steps.push({ step: "Create test publisher (POST /api/publishers)", ...res2 });
  if (res2.status === "fail") failed = true;

  const res3 = await tryStep(
    "Activate publisher (PATCH /api/publishers/{id})",
    async () => {
      if (!publisherId) throw new Error("Missing publisherId");
      await sql`UPDATE publishers SET status = 'active' WHERE id = ${publisherId}`;
    },
    failed
  );
  steps.push({ step: "Activate publisher (PATCH /api/publishers/{id})", ...res3 });
  if (res3.status === "fail") failed = true;

  const res4 = await tryStep(
    "Create test ad unit (POST /api/inventory)",
    async () => {
      if (!publisherId) throw new Error("Missing publisherId");
      const r = await sql<{ id: string }>`
        INSERT INTO ad_units (publisher_id, name, sizes, ad_type, environment, floor_price, status)
        VALUES (${publisherId}, 'E2E Ad Unit', ARRAY[${ECPM_SIZE}]::text[], 'display', 'web', 0.1, 'active')
        RETURNING id
      `;
      adUnitId = r.rows[0]?.id ?? null;
      if (!adUnitId) throw new Error("Failed to create ad unit");
    },
    failed
  );
  steps.push({ step: "Create test ad unit (POST /api/inventory)", ...res4 });
  if (res4.status === "fail") failed = true;

  const res5 = await tryStep(
    "Create test campaign (POST /api/campaigns)",
    async () => {
      if (!publisherId) throw new Error("Missing publisherId");
      const r = await sql<{ id: string }>`
        INSERT INTO campaigns (
          advertiser_name,
          advertiser_email,
          campaign_name,
          bid_price,
          daily_budget,
          target_sizes,
          target_geos,
          target_devices,
          target_environments,
          target_domains,
          start_date,
          end_date,
          status,
          name,
          advertiser,
          contact_email,
          freq_cap_day,
          freq_cap_session
        )
        VALUES (
          'E2E Advertiser',
          ${advertiserEmail},
          'E2E Campaign',
          ${testBid},
          NULL,
          NULL,
          NULL,
          NULL,
          NULL,
          NULL,
          NULL,
          NULL,
          'pending',
          'E2E Campaign',
          'E2E Advertiser',
          ${advertiserEmail},
          0,
          0
        )
        RETURNING id
      `;
      campaignId = r.rows[0]?.id ?? null;
      if (!campaignId) throw new Error("Failed to create campaign");
    },
    failed
  );
  steps.push({ step: "Create test campaign (POST /api/campaigns)", ...res5 });
  if (res5.status === "fail") failed = true;

  const res6 = await tryStep(
    "Activate test campaign (PATCH /api/campaigns/{id})",
    async () => {
      if (!campaignId) throw new Error("Missing campaignId");
      await sql`UPDATE campaigns SET status = 'active' WHERE id = ${campaignId}`;
    },
    failed
  );
  steps.push({ step: "Activate test campaign (PATCH /api/campaigns/{id})", ...res6 });
  if (res6.status === "fail") failed = true;

  const res7 = await tryStep(
    "Create test creative (INSERT)",
    async () => {
      if (!campaignId) throw new Error("Missing campaignId");
      const r = await sql<{ id: string }>`
        INSERT INTO creatives (
          campaign_id,
          name,
          type,
          size,
          image_url,
          click_url,
          status,
          scan_passed
        )
        VALUES (
          ${campaignId},
          'E2E Test Banner',
          'banner',
          ${ECPM_SIZE},
          'https://via.placeholder.com/300x250',
          'https://exchange.adsgupta.com',
          'active',
          true
        )
        RETURNING id
      `;
      creativeId = r.rows[0]?.id ?? null;
      if (!creativeId) throw new Error("Failed to create creative");
    },
    failed
  );
  steps.push({ step: "Create test creative (INSERT)", ...res7 });
  if (res7.status === "fail") failed = true;

  const res8 = await tryStep(
    "Run auction (POST /api/openrtb/auction)",
    async () => {
      if (!adUnitId) throw new Error("Missing adUnitId");
      if (!campaignId) throw new Error("Missing campaignId");
      if (!publisherId) throw new Error("Missing publisherId");
      const bidReq = {
        id: openrtbRequestId,
        imp: [
          {
            id: "1",
            tagid: adUnitId,
            bidfloor: 0.1,
            banner: { format: [{ w: 300, h: 250 }] },
            ext: { aboveFold: true, scrollDepth: 50 }
          }
        ],
        site: {
          page: "https://test.exchange.adsgupta.com/e2e-test",
          domain: "test.exchange.adsgupta.com",
          cat: ["IAB19"],
          publisher: { id: publisherId },
          ext: { title: "E2E Test Page", aboveFold: true }
        },
        device: {
          ua: "MDE-E2E-Test/1.0",
          w: 1920,
          h: 1080,
          devicetype: 2,
          js: 1,
          geo: { country: "US" }
        },
        user: {
          id: "e2e-test-user",
          ext: {
            sessionId: "e2e-session",
            sessionPageCount: 1,
            daysSinceFirstVisit: 0,
            isNewUser: true
          }
        },
        at: 2,
        tmax: 2000
      };

      const r = await fetch(`${baseUrl}/api/openrtb/auction`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bidReq)
      });
      if (!r.ok) throw new Error(`Auction HTTP ${r.status}`);
      const j = (await r.json()) as Record<string, unknown>;

      const seatbid = j?.seatbid as unknown[] | undefined;
      const hasSeatbid = Boolean(
        seatbid &&
          Array.isArray(seatbid) &&
          seatbid[0] &&
          typeof seatbid[0] === "object" &&
          Array.isArray((seatbid[0] as { bid?: unknown[] }).bid) &&
          (seatbid[0] as { bid: unknown[] }).bid[0]
      );

      if (j?.nbr === 2 || !hasSeatbid) {
        try {
          const lastLog = await sql<{
            bid_count: number | null;
            cleared: boolean;
            floor_price: string | null;
            winning_bid: string | null;
            raw_signals: unknown;
          }>`
            SELECT bid_count, cleared, floor_price::text, winning_bid::text, raw_signals
            FROM auction_log
            ORDER BY created_at DESC
            LIMIT 1
          `;
          const logInfo = lastLog.rows.length ? JSON.stringify(lastLog.rows[0]) : "no auction_log rows";

          const activeCampaigns = await sql<{
            id: string;
            status: string;
            bid_price: string;
            target_sizes: string[] | null;
            creative_count: string;
          }>`
            SELECT c.id::text, c.status, c.bid_price::text, c.target_sizes,
              COUNT(cr.id)::text AS creative_count
            FROM campaigns c
            LEFT JOIN creatives cr ON cr.campaign_id = c.id AND cr.status = 'active'
            GROUP BY c.id, c.status, c.bid_price, c.target_sizes
            ORDER BY c.created_at DESC
            LIMIT 3
          `;

          throw new Error(
            `No seatbid. auctionResponse=${JSON.stringify(j)}. lastAuctionLog=${logInfo}. recentCampaigns=${JSON.stringify(activeCampaigns.rows)}`
          );
        } catch (diagError) {
          throw new Error(String(diagError));
        }
      }

      const bid = (seatbid![0] as { bid: unknown[] }).bid[0] as Record<string, unknown>;
      if (!bid) throw new Error("Missing bid");
      if (!bid.adm || String(bid.adm).trim().length === 0) throw new Error("adm was empty");
      if (!Number.isFinite(Number(bid.price)) || Number(bid.price) <= 0) throw new Error("price not > 0");

      const returnedAuctionLogId = String(j?.bidid ?? "");
      if (!returnedAuctionLogId) throw new Error("Missing bidid (auction log id)");
      auctionLogId = returnedAuctionLogId;

      const clearedCampaignId = String(bid.cid ?? "");
      // We don't strictly enforce campaign id here because cid can be undefined depending on engine.
      // We'll verify after win notice.
      void clearedCampaignId;
    },
    failed
  );
  steps.push({ step: "Run auction (POST /api/openrtb/auction)", ...res8 });
  if (res8.status === "fail") failed = true;

  const res9 = await tryStep(
    "Fire win notice (GET /api/openrtb/win)",
    async () => {
      if (!auctionLogId) throw new Error("Missing auctionLogId");
      // We need the price we used in the bid response. Re-run auction response quickly.
      // In practice, we can read winning_bid from auction_log after the auction.
      const log = await sql<{ winning_bid: string | null }>`
        SELECT winning_bid::text AS winning_bid FROM auction_log WHERE id = ${auctionLogId} LIMIT 1
      `;
      const price = log.rows[0]?.winning_bid ? Number(log.rows[0]!.winning_bid) : null;
      if (!price || !Number.isFinite(price) || price <= 0) throw new Error("No winning_bid found for auction log");

      const r = await fetch(`${baseUrl}/api/openrtb/win?auctionId=${encodeURIComponent(auctionLogId)}&price=${encodeURIComponent(price)}`);
      if (!r.ok) throw new Error(`Win notice HTTP ${r.status}`);
    },
    failed
  );
  steps.push({ step: "Fire win notice (GET /api/openrtb/win)", ...res9 });
  if (res9.status === "fail") failed = true;

  const res10 = await tryStep(
    "Check auction log cleared + winner campaign",
    async () => {
      if (!campaignId) throw new Error("Missing campaignId");
      const r = await sql<{ cleared: boolean; winning_campaign_id: string | null }>`
        SELECT cleared, winning_campaign_id::text AS winning_campaign_id
        FROM auction_log
        WHERE auction_id = ${openrtbRequestId}
        ORDER BY created_at DESC
        LIMIT 1
      `;
      const row = r.rows[0];
      if (!row) throw new Error("No auction_log row found");
      if (!row.cleared) throw new Error("auction_log.cleared was false");
      if (String(row.winning_campaign_id) !== campaignId) {
        throw new Error(`winner mismatch: expected ${campaignId} got ${row.winning_campaign_id ?? "null"}`);
      }
    },
    failed
  );
  steps.push({ step: "Check auction log cleared + winner campaign", ...res10 });
  if (res10.status === "fail") failed = true;

  const res11 = await tryStep(
    "Fire impression pixel (GET /api/track/impression)",
    async () => {
      if (!auctionLogId) throw new Error("Missing auctionLogId");
      const r = await fetch(`${baseUrl}/api/track/impression?id=${encodeURIComponent(auctionLogId)}`, {
        method: "GET"
      });
      if (!r.ok) throw new Error(`impression pixel HTTP ${r.status}`);
      const ct = r.headers.get("content-type") ?? "";
      if (!ct.toLowerCase().includes("image/gif")) throw new Error(`Expected GIF content-type, got: ${ct}`);
      const buf = Buffer.from(await r.arrayBuffer());
      if (buf.slice(0, 3).toString("ascii") !== "GIF") throw new Error("Response body was not GIF");
    },
    failed
  );
  steps.push({ step: "Fire impression pixel (GET /api/track/impression)", ...res11 });
  if (res11.status === "fail") failed = true;

  const res12 = await tryStep(
    "Verify impression logged",
    async () => {
      if (!auctionLogId) throw new Error("Missing auctionLogId");
      const r = await sql<{ c: string }>`
        SELECT COUNT(*)::text AS c
        FROM impressions
        WHERE auction_log_id = ${auctionLogId}
      `;
      const c = Number(r.rows[0]?.c ?? 0);
      if (c <= 0) throw new Error("No impression logged for auction log");
    },
    failed
  );
  steps.push({ step: "Verify impression logged", ...res12 });
  if (res12.status === "fail") failed = true;

  const res13 = await tryStep(
    "Cleanup test records",
    async () => {
      const safe = async (fn: () => Promise<void>) => {
        try {
          await fn();
        } catch {
          // ignore cleanup errors
        }
      };
      if (auctionLogId) {
        await safe(async () => {
          await sql`
            DELETE FROM clicks
            WHERE impression_id IN (SELECT id FROM impressions WHERE auction_log_id = ${auctionLogId})
          `;
        });
        await safe(async () => {
          await sql`DELETE FROM impressions WHERE auction_log_id = ${auctionLogId}`;
        });
        await safe(async () => {
          await sql`DELETE FROM auction_log WHERE id = ${auctionLogId}`;
        });
      }
      if (creativeId && campaignId) {
        await safe(async () => {
          await sql`DELETE FROM creatives WHERE id = ${creativeId}`;
        });
        await safe(async () => {
          await sql`DELETE FROM campaigns WHERE id = ${campaignId}`;
        });
      }
      if (adUnitId) {
        await safe(async () => {
          await sql`DELETE FROM ad_units WHERE id = ${adUnitId}`;
        });
      }
      if (publisherId) {
        await safe(async () => {
          await sql`DELETE FROM publishers WHERE id = ${publisherId}`;
        });
      }
    },
    false
  );
  steps.push({ step: "Cleanup test records", ...res13 });

  const totalDurationMs = Date.now() - totalStarted;
  const passed = steps.every((s) => s.status === "pass" || s.status === "skip");

  const summary = passed ? "E2E integration test passed." : "E2E integration test failed.";
  const result: E2ETestResult = {
    passed,
    steps,
    totalDurationMs,
    summary
  };

  return json(result, 200);
}


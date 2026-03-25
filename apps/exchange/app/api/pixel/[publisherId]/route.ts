export const dynamic = "force-dynamic";
import { sql } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

const GIF = Buffer.from(
  "R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7",
  "base64"
);

export async function GET(request: NextRequest, { params }: { params: { publisherId: string } }) {
  const publisherId = params.publisherId?.trim() ?? "";
  const pageUrl = request.nextUrl.searchParams.get("url")?.trim() ?? "";
  const sessionId = request.nextUrl.searchParams.get("sid")?.trim() ?? "";

  if (publisherId) {
    try {
      await sql`
        INSERT INTO retargeting_events (publisher_id, page_url, session_id)
        VALUES (${publisherId}, ${pageUrl || null}, ${sessionId || null})
      `;
    } catch (e) {
      console.error("[pixel]", e);
    }
  }

  return new NextResponse(GIF, {
    headers: {
      "Content-Type": "image/gif",
      "Cache-Control": "no-store, no-cache, must-revalidate",
      "Content-Length": String(GIF.length)
    }
  });
}

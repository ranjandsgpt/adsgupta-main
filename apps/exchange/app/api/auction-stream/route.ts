export const dynamic = "force-dynamic";
import { getAuctionRowsAfter, getAuctionStreamCursor } from "@/lib/auction-stream-queries";
import { forbidden, getAuthFromRequest, unauthorized } from "@/lib/require-auth";
import { sseClientConnected, sseClientDisconnected } from "@/lib/sse-metrics";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const auth = await getAuthFromRequest(request);
  if (!auth) return unauthorized();
  if (auth.role !== "admin") return forbidden();

  const publisherId = request.nextUrl.searchParams.get("publisherId")?.trim() || null;
  const encoder = new TextEncoder();
  let cursor = await getAuctionStreamCursor(publisherId);
  let timer: ReturnType<typeof setInterval> | undefined;

  const stream = new ReadableStream({
    async start(controller) {
      sseClientConnected();
      const send = (data: object) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
      };
      send({ type: "connected", ts: Date.now(), cursor: cursor?.id ?? null });

      timer = setInterval(async () => {
        try {
          if (!cursor) {
            const c = await getAuctionStreamCursor(publisherId);
            if (c) cursor = c;
            return;
          }
          const { rows, next } = await getAuctionRowsAfter(cursor, publisherId);
          cursor = next;
          for (const row of rows) {
            send({ type: "auction", row });
          }
        } catch (e) {
          send({ type: "error", message: String(e) });
        }
      }, 2000);

      request.signal.addEventListener("abort", () => {
        if (timer) clearInterval(timer);
        sseClientDisconnected();
      });
    },
    cancel() {
      if (timer) clearInterval(timer);
      sseClientDisconnected();
    }
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive"
    }
  });
}

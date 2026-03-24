import { NextResponse } from "next/server";
import { getClientIp, rateLimit } from "@/lib/rate-limiter";

export function rateLimitResponse(
  request: Request,
  prefix: string,
  limit: number,
  windowMs: number
): NextResponse | null {
  const ip = getClientIp(request);
  const r = rateLimit(`${prefix}:${ip}`, limit, windowMs);
  if (r.allowed) return null;
  const retryAfter = Math.max(1, Math.ceil((r.resetAt - Date.now()) / 1000));
  return NextResponse.json(
    { error: "rate_limit_exceeded", retryAfter },
    { status: 429, headers: { "Retry-After": String(retryAfter) } }
  );
}

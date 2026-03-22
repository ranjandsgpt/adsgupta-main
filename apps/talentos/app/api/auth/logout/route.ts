import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getDb } from "@/lib/mongodb";
import { getSessionTokenFromRequest, sessionCookieOptions } from "@/lib/auth";

export async function POST(request: NextRequest) {
  const token = getSessionTokenFromRequest(request);
  if (token && !token.startsWith("eyJ")) {
    try {
      const db = await getDb();
      await db.collection("user_sessions").deleteOne({ session_token: token });
    } catch {
      /* ignore */
    }
  }

  const res = NextResponse.json({ message: "Logged out successfully" });
  res.cookies.set("session_token", "", { ...sessionCookieOptions(), maxAge: 0 });
  return res;
}

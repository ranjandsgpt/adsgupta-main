import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { sessionCookieOptions } from "@/lib/auth";

export async function POST(request: NextRequest) {
  void request;

  const res = NextResponse.json({ message: "Logged out successfully" });
  res.cookies.set("session_token", "", { ...sessionCookieOptions(), maxAge: 0 });
  return res;
}

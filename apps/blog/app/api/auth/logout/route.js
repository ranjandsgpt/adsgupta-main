import { NextResponse } from "next/server";

/** @deprecated use GET /api/auth/signout from NextAuth */
export async function POST() {
  const base = process.env.NEXTAUTH_URL || "http://localhost:3000";
  return NextResponse.redirect(`${base}/api/auth/signout?callbackUrl=${encodeURIComponent(`${base}/admin/login`)}`);
}

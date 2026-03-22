import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getCurrentUserFromRequest } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUserFromRequest(request);
    return NextResponse.json(user);
  } catch {
    return NextResponse.json({ detail: "Not authenticated" }, { status: 401 });
  }
}

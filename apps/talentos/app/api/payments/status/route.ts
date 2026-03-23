import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getCurrentUserFromRequest } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const sessionUser = await getCurrentUserFromRequest(request);
    const user = await prisma.user.findUnique({ where: { id: sessionUser.user_id } });
    if (!user) return NextResponse.json({ detail: "Not authenticated" }, { status: 401 });
    return NextResponse.json({
      plan: user.isSubscribed ? "pro" : "free",
      isSubscribed: Boolean(user.isSubscribed),
      credits: user.credits,
    });
  } catch {
    return NextResponse.json({ detail: "Not authenticated" }, { status: 401 });
  }
}

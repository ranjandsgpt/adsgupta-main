import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_request: Request, { params }: { params: { userId: string } }) {
  try {
    const user = await prisma.user.findUnique({ where: { id: params.userId } });
    if (!user) {
      return NextResponse.json({ detail: "User not found" }, { status: 404 });
    }
    return NextResponse.json({
      is_pro: user.isSubscribed ?? false,
      credits: user.credits ?? 3,
      razorpay_sub_id: null,
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ detail: String(e) }, { status: 500 });
  }
}

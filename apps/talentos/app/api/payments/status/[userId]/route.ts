import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";

export async function GET(_request: Request, { params }: { params: { userId: string } }) {
  try {
    const db = await getDb();
    const user = await db.collection("users").findOne({ user_id: params.userId }, { projection: { _id: 0, password_hash: 0 } });
    if (!user) {
      return NextResponse.json({ detail: "User not found" }, { status: 404 });
    }
    return NextResponse.json({
      is_pro: user.is_pro ?? false,
      credits: user.credits ?? 3,
      razorpay_sub_id: user.razorpay_sub_id ?? null,
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ detail: String(e) }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";

export async function GET(_request: Request, { params }: { params: { userId: string } }) {
  try {
    const db = await getDb();
    const payments = await db
      .collection("payments")
      .find({ user_id: params.userId }, { projection: { _id: 0 } })
      .sort({ created_at: -1 })
      .limit(50)
      .toArray();
    return NextResponse.json({ payments });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ detail: String(e) }, { status: 500 });
  }
}

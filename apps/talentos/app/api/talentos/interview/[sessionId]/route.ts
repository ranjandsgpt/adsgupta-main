import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";

export async function GET(_request: Request, { params }: { params: { sessionId: string } }) {
  try {
    const db = await getDb();
    const session = await db.collection("interview_sessions").findOne(
      { session_id: params.sessionId },
      { projection: { _id: 0 } }
    );
    if (!session) {
      return NextResponse.json({ detail: "Session not found" }, { status: 404 });
    }
    return NextResponse.json(session);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ detail: String(e) }, { status: 500 });
  }
}

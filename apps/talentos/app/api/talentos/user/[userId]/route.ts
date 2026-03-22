import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { deleteUserData } from "@/lib/talentos-service";

export async function DELETE(_request: Request, { params }: { params: { userId: string } }) {
  try {
    const db = await getDb();
    const result = await deleteUserData(db, params.userId);
    return NextResponse.json(result);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ detail: String(e) }, { status: 500 });
  }
}

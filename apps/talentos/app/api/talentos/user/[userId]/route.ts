import { NextResponse } from "next/server";
import { deleteUserData } from "@/lib/talentos-service";

export async function DELETE(_request: Request, { params }: { params: { userId: string } }) {
  try {
    const result = await deleteUserData(params.userId);
    return NextResponse.json(result);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ detail: String(e) }, { status: 500 });
  }
}

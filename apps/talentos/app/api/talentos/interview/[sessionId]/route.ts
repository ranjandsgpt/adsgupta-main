import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_request: Request, { params }: { params: { sessionId: string } }) {
  try {
    const session = await prisma.interview.findUnique({ where: { id: params.sessionId } });
    if (!session) {
      return NextResponse.json({ detail: "Session not found" }, { status: 404 });
    }
    return NextResponse.json({
      session_id: session.id,
      user_id: session.userId,
      status: session.status,
      transcript: (session.messages as { transcript?: unknown[] } | null)?.transcript ?? [],
      question_index: (session.messages as { question_index?: number } | null)?.question_index ?? 0,
      mode: session.persona,
      scores: session.scores,
      filler_words: session.fillerWords,
      created_at: session.createdAt.toISOString(),
      updated_at: session.updatedAt.toISOString(),
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ detail: String(e) }, { status: 500 });
  }
}

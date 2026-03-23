import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { PERSONAS } from "@/lib/interview-personas";

export async function GET(_request: Request, { params }: { params: { sessionId: string } }) {
  try {
    const interview = await prisma.interview.findUnique({ where: { id: params.sessionId } });
    if (!interview) {
      return NextResponse.json({ detail: "Interview not found" }, { status: 404 });
    }
    const personaKey = interview.persona as keyof typeof PERSONAS;
    return NextResponse.json({
      id: interview.id,
      userId: interview.userId,
      analysisId: interview.analysisId,
      persona: personaKey,
      personaProfile: PERSONAS[personaKey] ?? PERSONAS.hiring_manager,
      difficulty: interview.difficulty,
      status: interview.status,
      messages: (interview.messages as unknown[]) ?? [],
      scores: interview.scores,
      fillerWords: interview.fillerWords,
      createdAt: interview.createdAt.toISOString(),
      updatedAt: interview.updatedAt.toISOString(),
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ detail: String(e) }, { status: 500 });
  }
}

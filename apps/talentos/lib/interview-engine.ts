import type { Prisma } from "@prisma/client";
import { prisma } from "./prisma";
import { generateLLMResponse } from "./llm";
import { PERSONAS, type PersonaKey } from "./interview-personas";

type ChatMessage = {
  role: "interviewer" | "candidate" | "system";
  content: string;
  timestamp: string;
  category?: string;
  difficulty?: number;
  evaluationCriteria?: string;
  evaluation?: {
    situation: number;
    task: number;
    action: number;
    result: number;
    total: number;
    feedback: string;
  };
};

function parseJson<T>(text: string): T {
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) throw new Error("Invalid LLM response");
  return JSON.parse(match[0]) as T;
}

function normalizePersona(persona: string): PersonaKey {
  if (persona in PERSONAS) return persona as PersonaKey;
  return "hiring_manager";
}

function transcriptToQaHistory(messages: ChatMessage[]): string {
  return messages
    .map((m) => `${m.role.toUpperCase()}: ${m.content}`)
    .join("\n");
}

export async function startInterview(analysisId: string, persona: string, userId: string) {
  const selected = normalizePersona(persona);
  const personaData = PERSONAS[selected];

  const analysis = await prisma.analysis.findUnique({
    where: { id: analysisId },
    include: { resume: true },
  });
  if (!analysis) throw new Error("ANALYSIS_NOT_FOUND");
  if (analysis.userId !== userId) throw new Error("UNAUTHORIZED");

  const prompt = `You are ${personaData.name}, a ${personaData.title}. You are conducting a ${personaData.roundName} for the role of ${analysis.roleName} at ${analysis.companyName ?? "Target Company"}.

The candidate's resume shows: ${analysis.resume.rawText.slice(0, 1400)}
The job requires: ${analysis.jobDescription.slice(0, 1400)}
The candidate's gaps are: ${JSON.stringify(analysis.gaps)}

Your interviewing style: ${personaData.style}
Focus areas: ${personaData.focusAreas.join(", ")}

Generate your opening statement (1-2 sentences introducing yourself and the round) and your first question. The question must be relevant to this specific role and this specific candidate — NOT generic.

Return JSON:
{
  "opening": "your opening statement",
  "question": "your first question",
  "questionCategory": "Technical|Behavioral|Situational|Culture",
  "questionDifficulty": 1-5,
  "evaluationCriteria": "what you're looking for in a good answer"
}`;

  const llm = await generateLLMResponse(
    "You are an expert interviewer. Return strict JSON only.",
    prompt,
    true
  );
  const initial = parseJson<{
    opening: string;
    question: string;
    questionCategory: "Technical" | "Behavioral" | "Situational" | "Culture";
    questionDifficulty: number;
    evaluationCriteria: string;
  }>(llm);

  const now = new Date().toISOString();
  const messages: ChatMessage[] = [
    { role: "interviewer", content: initial.opening, timestamp: now, category: "Culture", difficulty: 1 },
    {
      role: "interviewer",
      content: initial.question,
      timestamp: now,
      category: initial.questionCategory,
      difficulty: Math.max(1, Math.min(5, Number(initial.questionDifficulty || 2))),
      evaluationCriteria: initial.evaluationCriteria,
    },
  ];

  const interview = await prisma.interview.create({
    data: {
      userId,
      analysisId,
      persona: selected,
      difficulty: Math.max(1, Math.min(5, Number(initial.questionDifficulty || 2))),
      status: "active",
      messages: messages as Prisma.InputJsonValue,
      scores: { runningAverage: 0, answeredCount: 0 } as Prisma.InputJsonValue,
    },
  });

  return {
    interviewId: interview.id,
    persona: selected,
    interviewer: personaData,
    opening: initial.opening,
    firstQuestion: initial.question,
    questionCategory: initial.questionCategory,
    questionDifficulty: initial.questionDifficulty,
    evaluationCriteria: initial.evaluationCriteria,
    messages,
  };
}

export async function processAnswer(interviewId: string, userAnswer: string) {
  const interview = await prisma.interview.findUnique({
    where: { id: interviewId },
    include: { analysis: { include: { resume: true } } },
  });
  if (!interview) throw new Error("INTERVIEW_NOT_FOUND");
  if (!interview.analysis) throw new Error("ANALYSIS_NOT_FOUND");
  if (interview.status === "completed") throw new Error("ALREADY_COMPLETED");

  const personaData = PERSONAS[normalizePersona(interview.persona)];
  const messages = ((interview.messages as ChatMessage[]) ?? []).slice();
  const history = transcriptToQaHistory(messages);

  const response = await generateLLMResponse(
    "You are a realistic human interviewer. Return strict JSON only.",
    `You are ${personaData.name} conducting an interview.
Interview history so far:
${history}

The candidate just answered your last question with:
"${userAnswer}"

Evaluate their answer and decide what to do next.

EVALUATION — Score on STAR method:
- Situation: Did they set context? (0-25)
- Task: Did they define their role? (0-25)
- Action: Did they explain what THEY did specifically? (0-25)
- Result: Did they share outcomes with metrics? (0-25)

FOLLOW-UP LOGIC:
- If the answer was vague or lacked specifics → ask a probing follow-up on the same topic
- If they mentioned something interesting → dig deeper ("You mentioned X, tell me more about...")
- If the answer was strong → move to next topic, increase difficulty
- If you've covered 6+ questions → begin wrapping up

Return JSON:
{
  "evaluation": {
    "situation": number 0-25,
    "task": number 0-25,
    "action": number 0-25,
    "result": number 0-25,
    "total": number 0-100,
    "feedback": "1-2 sentences of specific feedback on their answer"
  },
  "nextAction": "follow_up|new_question|wrap_up",
  "response": "Your natural conversational response as the interviewer — acknowledge their answer briefly, then ask the next question. Sound human, not robotic.",
  "nextQuestion": "the follow-up or new question",
  "questionCategory": "Technical|Behavioral|Situational|Culture",
  "questionDifficulty": 1-5
}`,
    true
  );

  const parsed = parseJson<{
    evaluation: {
      situation: number;
      task: number;
      action: number;
      result: number;
      total: number;
      feedback: string;
    };
    nextAction: "follow_up" | "new_question" | "wrap_up";
    response: string;
    nextQuestion: string;
    questionCategory: "Technical" | "Behavioral" | "Situational" | "Culture";
    questionDifficulty: number;
  }>(response);

  const now = new Date().toISOString();
  const scoreState = (interview.scores as { runningAverage?: number; answeredCount?: number } | null) ?? {};
  const answeredCount = (scoreState.answeredCount ?? 0) + 1;
  const runningAverage = ((scoreState.runningAverage ?? 0) * (answeredCount - 1) + parsed.evaluation.total) / answeredCount;

  let nextDifficulty = Math.max(1, Math.min(5, Number(parsed.questionDifficulty || interview.difficulty)));
  if (runningAverage > 80) nextDifficulty = Math.min(5, nextDifficulty + 1);
  if (runningAverage < 40) nextDifficulty = Math.max(1, nextDifficulty - 1);

  const candidateMessage: ChatMessage = {
    role: "candidate",
    content: userAnswer,
    timestamp: now,
    evaluation: parsed.evaluation,
  };

  const interviewerMessage: ChatMessage = {
    role: "interviewer",
    content: parsed.response,
    timestamp: now,
    category: parsed.questionCategory,
    difficulty: nextDifficulty,
  };

  const finalMessages = [...messages, candidateMessage, interviewerMessage];
  await prisma.interview.update({
    where: { id: interviewId },
    data: {
      messages: finalMessages as Prisma.InputJsonValue,
      difficulty: nextDifficulty,
      status: parsed.nextAction === "wrap_up" ? "ready_to_end" : "active",
      scores: {
        runningAverage,
        answeredCount,
        lastEvaluation: parsed.evaluation,
      } as Prisma.InputJsonValue,
    },
  });

  return {
    interviewId,
    evaluation: parsed.evaluation,
    nextAction: parsed.nextAction,
    response: parsed.response,
    nextQuestion: parsed.nextQuestion,
    questionCategory: parsed.questionCategory,
    questionDifficulty: nextDifficulty,
    runningAverage,
  };
}

export async function endInterview(interviewId: string) {
  const interview = await prisma.interview.findUnique({
    where: { id: interviewId },
    include: { analysis: true },
  });
  if (!interview) throw new Error("INTERVIEW_NOT_FOUND");

  const messages = (interview.messages as ChatMessage[]) ?? [];
  const transcript = transcriptToQaHistory(messages);

  const reportRaw = await generateLLMResponse(
    "You are an interview assessor. Return strict JSON only.",
    `Here is the full interview transcript:
${transcript}

Generate a comprehensive interview performance report.

Return JSON:
{
  "overallScore": number 0-100,
  "starScores": { "situation": avg, "task": avg, "action": avg, "result": avg },
  "strengths": ["top 3 things they did well with specific examples from their answers"],
  "improvements": ["top 3 areas to improve with specific advice"],
  "bestAnswer": { "question": "...", "answer": "...", "whyGood": "..." },
  "weakestAnswer": { "question": "...", "answer": "...", "betterVersion": "a rewritten ideal answer" },
  "fillerWordEstimate": "estimated frequency based on transcript patterns",
  "communicationStyle": "analytical|storyteller|concise|verbose",
  "readinessLevel": "Not Ready|Needs Work|Almost There|Interview Ready|Outstanding",
  "topAdvice": "single most important piece of advice for this candidate"
}`,
    true
  );

  const report = parseJson<{
    overallScore: number;
    starScores: { situation: number; task: number; action: number; result: number };
    strengths: string[];
    improvements: string[];
    bestAnswer: { question: string; answer: string; whyGood: string };
    weakestAnswer: { question: string; answer: string; betterVersion: string };
    fillerWordEstimate: string;
    communicationStyle: string;
    readinessLevel: string;
    topAdvice: string;
  }>(reportRaw);

  await prisma.interview.update({
    where: { id: interviewId },
    data: {
      status: "completed",
      scores: report as Prisma.InputJsonValue,
    },
  });

  return report;
}

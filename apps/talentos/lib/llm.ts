import Anthropic from "@anthropic-ai/sdk";
import { GoogleGenerativeAI } from "@google/generative-ai";
import Groq from "groq-sdk";

const apiKey = process.env.GEMINI_API_KEY || process.env.Gemini_API_Key || process.env.GEMINI_API_key || "";
const genAI = new GoogleGenerativeAI(apiKey);

export function hasLlm(): boolean {
  return Boolean(apiKey || process.env.ANTHROPIC_API_KEY || process.env.GROQ_API_KEY);
}

function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => setTimeout(() => reject(new Error(`${label} timed out`)), ms)),
  ]);
}

function fallbackMockJson(systemPrompt: string, userPrompt: string): string {
  const combined = `${systemPrompt}\n${userPrompt}`.toLowerCase();
  if (combined.includes("candidate full name") || combined.includes("resume analyst")) {
    return JSON.stringify({
      name: "Resume Candidate",
      currentRole: "Professional",
      experienceYears: 3,
      skills: { technical: [], soft: ["communication"], tools: [], certifications: [] },
      experience: [],
      education: [],
      proofPoints: ["Resume uploaded successfully — AI analysis temporarily unavailable. Please try again in a moment."],
      summary: "AI analysis temporarily unavailable. Please try again in a moment.",
    });
  }

  if (combined.includes("compare this resume against this job description") || combined.includes("hiring expert")) {
    const mock = {
      matchScore: 72,
      roleName: "Based on your resume",
      companyName: "Target Company",
      strengths: ["Resume uploaded successfully — AI analysis temporarily unavailable. Please try again in a moment."],
      gaps: [],
      questions: [],
      interviewQuestions: [],
      summary: "AI analysis temporarily unavailable. Please try again in a moment.",
      prepAdvice: "Please retry in a moment for detailed, personalized feedback.",
    };
    return JSON.stringify(mock);
  }

  return JSON.stringify({
    message: "AI analysis temporarily unavailable. Please try again in a moment.",
  });
}

export async function generateLLMResponse(
  systemPrompt: string,
  userPrompt: string,
  jsonMode?: boolean
): Promise<string> {
  if (!apiKey && !process.env.ANTHROPIC_API_KEY && !process.env.GROQ_API_KEY) {
    if (jsonMode) return fallbackMockJson(systemPrompt, userPrompt);
    return "AI features require configuration";
  }

  const errors: string[] = [];

  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      generationConfig: jsonMode ? { responseMimeType: "application/json" } : undefined,
    });
    const result = await withTimeout(model.generateContent(`${systemPrompt}\n\n${userPrompt}`), 25000, "Gemini Flash");
    const text = result.response.text();
    if (!text) throw new Error("Empty Gemini Flash response");
    return text;
  } catch (e) {
    errors.push(`Gemini Flash: ${e instanceof Error ? e.message : String(e)}`);
  }

  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-pro",
      generationConfig: jsonMode ? { responseMimeType: "application/json" } : undefined,
    });
    const result = await withTimeout(model.generateContent(`${systemPrompt}\n\n${userPrompt}`), 25000, "Gemini Pro");
    const text = result.response.text();
    if (!text) throw new Error("Empty Gemini Pro response");
    return text;
  } catch (e) {
    errors.push(`Gemini Pro: ${e instanceof Error ? e.message : String(e)}`);
  }

  try {
    const key = process.env.ANTHROPIC_API_KEY;
    if (!key) throw new Error("ANTHROPIC_API_KEY missing");
    const anthropic = new Anthropic({ apiKey: key });
    const message = await withTimeout(
      anthropic.messages.create({
        model: process.env.ANTHROPIC_MODEL || "claude-3-5-haiku-latest",
        max_tokens: 1024,
        system: systemPrompt,
        messages: [{ role: "user", content: userPrompt }],
      }),
      25000,
      "Anthropic Claude"
    );
    const text = message.content
      .filter((p) => p.type === "text")
      .map((p) => p.text)
      .join("\n")
      .trim();
    if (!text) throw new Error("Empty Anthropic response");
    return text;
  } catch (e) {
    errors.push(`Anthropic: ${e instanceof Error ? e.message : String(e)}`);
  }

  try {
    const key = process.env.GROQ_API_KEY;
    if (!key) throw new Error("GROQ_API_KEY missing");
    const groq = new Groq({ apiKey: key });
    const completion = await withTimeout(
      groq.chat.completions.create({
        model: "llama-3.1-8b-instant",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.2,
      }),
      25000,
      "Groq Llama 3.1 8B"
    );
    const text = completion.choices[0]?.message?.content?.trim() || "";
    if (!text) throw new Error("Empty Groq response");
    return text;
  } catch (e) {
    errors.push(`Groq: ${e instanceof Error ? e.message : String(e)}`);
  }

  // eslint-disable-next-line no-console
  console.error("[llm/fallback-chain] all providers failed", errors);
  if (jsonMode) return fallbackMockJson(systemPrompt, userPrompt);
  return "AI analysis temporarily unavailable. Please try again in a moment.";
}

import Anthropic from "@anthropic-ai/sdk";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.Gemini_API_Key || "");

export function hasLlm(): boolean {
  return Boolean(process.env.Gemini_API_Key || process.env.ANTHROPIC_API_KEY);
}

export async function generateLLMResponse(
  systemPrompt: string,
  userPrompt: string,
  jsonMode?: boolean
): Promise<string> {
  try {
    const model = genAI.getGenerativeModel({
      model: process.env.GEMINI_MODEL || "gemini-1.5-flash",
      generationConfig: jsonMode ? { responseMimeType: "application/json" } : undefined,
    });
    const result = await model.generateContent(`${systemPrompt}\n\n${userPrompt}`);
    return result.response.text();
  } catch (geminiError) {
    const key = process.env.ANTHROPIC_API_KEY;
    if (!key) throw geminiError;
    const anthropic = new Anthropic({ apiKey: key });
    const message = await anthropic.messages.create({
      model: process.env.ANTHROPIC_MODEL || "claude-3-5-haiku-latest",
      max_tokens: 1024,
      system: systemPrompt,
      messages: [{ role: "user", content: userPrompt }],
    });
    const text = message.content
      .filter((p) => p.type === "text")
      .map((p) => p.text)
      .join("\n")
      .trim();
    if (!text) throw new Error("Empty LLM response");
    return text;
  }
}

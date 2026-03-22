import OpenAI from "openai";

const model = process.env.OPENAI_MODEL ?? "gpt-4o";

export function hasLlm(): boolean {
  return Boolean(process.env.OPENAI_API_KEY);
}

export async function callLlm(
  prompt: string,
  systemMessage = "You are a helpful career coach."
): Promise<string | null> {
  const key = process.env.OPENAI_API_KEY;
  if (!key) return null;

  const client = new OpenAI({ apiKey: key });
  const completion = await client.chat.completions.create({
    model,
    messages: [
      { role: "system", content: systemMessage },
      { role: "user", content: prompt },
    ],
  });
  const text = completion.choices[0]?.message?.content;
  return text ?? null;
}

/**
 * Minimal Gemini text generation for blog CMS (same env as apps/pousali: GEMINI_API_KEY).
 */
export async function geminiGenerateText(prompt, { system } = {}) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured");
  }
  const model = process.env.GEMINI_MODEL || "gemini-2.0-flash";
  const full = system ? `${system.trim()}\n\n${prompt.trim()}` : prompt.trim();
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ role: "user", parts: [{ text: full }] }],
    }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data?.error?.message || `Gemini HTTP ${res.status}`);
  }
  const text = data.candidates?.[0]?.content?.parts?.map((p) => p.text).join("") || "";
  if (!text) throw new Error("Empty Gemini response");
  return text.trim();
}

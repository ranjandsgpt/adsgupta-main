/**
 * Shared Gemini actions for /api/admin/ai and /api/ai/*.
 */
import { geminiGenerateText } from "./gemini-blog.js";

function parseJsonLoose(text) {
  const cleaned = String(text || "")
    .replace(/^```json\s*/i, "")
    .replace(/```$/m, "")
    .trim();
  try {
    return JSON.parse(cleaned);
  } catch {
    return {};
  }
}

/** Map REST-style names to internal action keys */
export function normalizeAiAction(raw) {
  const a = String(raw || "").trim();
  const map = {
    "generate-post": "full_article",
    "seo-meta": "seo",
    "seo-analyze": "seo",
    "test-headlines": "headline_test",
    "generate-tags": "generate_tags",
  };
  if (map[a]) return map[a];
  return a.replace(/-/g, "_");
}

/**
 * @returns {Promise<{ status: number, body: object }>}
 */
export async function runAiAction(body) {
  const action = normalizeAiAction(body.action);

  try {
    if (action === "full_article") {
      const title = body.title?.trim() || "Untitled";
      const text = await geminiGenerateText(
        `Write a long-form blog article in Markdown (use ## headings, lists where useful). Topic/title: ${title}. Keywords: ${body.keywords || "general"}.`,
        {
          system:
            "You are an expert B2B marketing and ad tech writer for AdsGupta. Be substantive, skimmable, and factual.",
        }
      );
      return { status: 200, body: { content: text } };
    }

    if (action === "improve") {
      const selection = body.selection?.trim();
      if (!selection) return { status: 400, body: { error: "No selection" } };
      const text = await geminiGenerateText(
        `Rewrite and improve this paragraph for clarity and punch (Markdown inline allowed):\n\n${selection}`,
        { system: "You are a careful editor. Preserve meaning; tighten prose." }
      );
      return { status: 200, body: { text } };
    }

    if (action === "seo") {
      const title = body.title?.trim() || "";
      const content = (body.content || "").slice(0, 12000);
      const text = await geminiGenerateText(
        `Given this blog draft, return JSON only with keys: seo_title (max 60 chars), seo_description (max 160 chars), suggested_slug (kebab-case).\nTitle: ${title}\n\nContent excerpt:\n${content}`,
        { system: "Return valid JSON only, no markdown fences." }
      );
      let parsed = parseJsonLoose(text);
      if (!parsed.seo_title) parsed = { seo_title: title, seo_description: "", suggested_slug: "" };
      return { status: 200, body: parsed };
    }

    if (action === "excerpt") {
      const content = body.content?.trim() || "";
      const text = await geminiGenerateText(
        `Write a compelling 1–2 sentence excerpt (max 220 chars) for this article body:\n\n${content.slice(0, 8000)}`,
        { system: "Be concise. No quotes around output." }
      );
      return { status: 200, body: { excerpt: text.slice(0, 280) } };
    }

    if (action === "linkedin_post") {
      const content = (body.content || "").slice(0, 12000);
      const text = await geminiGenerateText(
        `Turn this article into a LinkedIn post (1300 chars max, short paragraphs, 3-5 hashtags at end):\n\n${content}`,
        { system: "Professional B2B voice. No markdown headings." }
      );
      return { status: 200, body: { text } };
    }

    if (action === "twitter_thread") {
      const content = (body.content || "").slice(0, 8000);
      const text = await geminiGenerateText(
        `Create a Twitter/X thread (numbered tweets 1/, 2/, ... max 260 chars each, 5-8 tweets) summarizing:\n\n${content}`,
        { system: "Punchy. One idea per tweet." }
      );
      return { status: 200, body: { text } };
    }

    if (action === "instagram_caption") {
      const content = (body.content || "").slice(0, 6000);
      const text = await geminiGenerateText(
        `Write an Instagram caption + emoji + 8-12 hashtags for this article theme:\n\n${content}`,
        { system: "Brand-safe. Engaging." }
      );
      return { status: 200, body: { text } };
    }

    if (action === "headline_test") {
      const h = [body.h1, body.h2, body.h3].filter(Boolean).join(" | ");
      const text = await geminiGenerateText(
        `Pick the single best headline for CTR from these three (reply with one line: the winner + 1 sentence why):\n${h}`,
        { system: "Be decisive." }
      );
      return { status: 200, body: { result: text } };
    }

    if (action === "readability") {
      const content = (body.content || "").slice(0, 12000);
      const text = await geminiGenerateText(
        `Score readability 1-10 and give 3 bullet suggestions to improve clarity for this draft:\n\n${content}`,
        { system: "Constructive editor." }
      );
      return { status: 200, body: { feedback: text } };
    }

    if (action === "generate_tags") {
      const title = body.title?.trim() || "";
      const content = (body.content || "").slice(0, 8000);
      const text = await geminiGenerateText(
        `Suggest 5-8 short topic tags (single words or two-word phrases) for this article. Return JSON only: {"tags":["tag1","tag2",...]}\nTitle: ${title}\n\nExcerpt:\n${content}`,
        { system: "Return valid JSON only." }
      );
      const parsed = parseJsonLoose(text);
      const tags = Array.isArray(parsed.tags) ? parsed.tags.map(String).filter(Boolean) : [];
      return { status: 200, body: { tags } };
    }

    if (action === "repurpose") {
      const content = (body.content || "").slice(0, 12000);
      const text = await geminiGenerateText(
        `Repurpose this article into: (1) a 3-bullet executive summary, (2) one LinkedIn hook (2 sentences), (3) one email subject line + preview text. Use clear section labels.\n\n${content}`,
        { system: "B2B AdsGupta voice. Skimmable." }
      );
      return { status: 200, body: { text } };
    }

    if (action === "generate_image") {
      const title = body.title?.trim() || "Blog post";
      const prompt = await geminiGenerateText(
        `Write one detailed image generation prompt (English) for a cover image for this article. No quotes; describe style, mood, composition. Max 400 chars.\nTitle: ${title}\nKeywords: ${body.keywords || ""}`,
        { system: "Photoreal or modern editorial illustration style suitable for AdTech B2B." }
      );
      return {
        status: 200,
        body: {
          prompt: prompt.slice(0, 500),
          note:
            "Use this prompt in Imagen, Midjourney, or your design tool. Automatic image bytes are not returned (no image API key in env).",
          imageUrl: null,
        },
      };
    }

    return { status: 400, body: { error: "Unknown action" } };
  } catch (e) {
    return { status: 500, body: { error: e.message || "AI failed" } };
  }
}

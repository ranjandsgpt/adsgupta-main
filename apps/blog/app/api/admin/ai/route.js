import { NextResponse } from "next/server";
import { getUser } from "../../../../lib/auth.js";
import { geminiGenerateText } from "../../../../lib/gemini-blog.js";

export async function POST(request) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await request.json();
    const action = body.action;

    if (action === "full_article") {
      const title = body.title?.trim() || "Untitled";
      const text = await geminiGenerateText(
        `Write a long-form blog article in Markdown (use ## headings, lists where useful). Topic/title: ${title}. Keywords: ${body.keywords || "general"}.`,
        {
          system:
            "You are an expert B2B marketing and ad tech writer for AdsGupta. Be substantive, skimmable, and factual.",
        }
      );
      return NextResponse.json({ content: text });
    }

    if (action === "improve") {
      const selection = body.selection?.trim();
      if (!selection) return NextResponse.json({ error: "No selection" }, { status: 400 });
      const text = await geminiGenerateText(
        `Rewrite and improve this paragraph for clarity and punch (Markdown inline allowed):\n\n${selection}`,
        { system: "You are a careful editor. Preserve meaning; tighten prose." }
      );
      return NextResponse.json({ text });
    }

    if (action === "seo") {
      const title = body.title?.trim() || "";
      const content = (body.content || "").slice(0, 12000);
      const text = await geminiGenerateText(
        `Given this blog draft, return JSON only with keys: seo_title (max 60 chars), seo_description (max 160 chars), suggested_slug (kebab-case).\nTitle: ${title}\n\nContent excerpt:\n${content}`,
        { system: "Return valid JSON only, no markdown fences." }
      );
      let parsed = {};
      try {
        parsed = JSON.parse(text.replace(/^```json\s*/i, "").replace(/```$/, "").trim());
      } catch {
        parsed = { seo_title: title, seo_description: "", suggested_slug: "" };
      }
      return NextResponse.json(parsed);
    }

    if (action === "excerpt") {
      const content = body.content?.trim() || "";
      const text = await geminiGenerateText(
        `Write a compelling 1–2 sentence excerpt (max 220 chars) for this article body:\n\n${content.slice(0, 8000)}`,
        { system: "Be concise. No quotes around output." }
      );
      return NextResponse.json({ excerpt: text.slice(0, 280) });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (e) {
    return NextResponse.json({ error: e.message || "AI failed" }, { status: 500 });
  }
}

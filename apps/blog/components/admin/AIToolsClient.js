"use client";

import { useState } from "react";

export default function AIToolsClient() {
  const [topic, setTopic] = useState("");
  const [keywords, setKeywords] = useState("");
  const [content, setContent] = useState("");
  const [out, setOut] = useState("");
  const [h1, setH1] = useState("");
  const [h2, setH2] = useState("");
  const [h3, setH3] = useState("");
  const [busy, setBusy] = useState(false);

  async function run(action, extra = {}) {
    setBusy(true);
    setOut("");
    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, title: topic, content, keywords, ...extra }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Failed");
      if (data.tags) setOut(JSON.stringify(data.tags, null, 2));
      else if (data.seo_title || data.seo_description)
        setOut(JSON.stringify({ seo_title: data.seo_title, seo_description: data.seo_description, suggested_slug: data.suggested_slug }, null, 2));
      else if (data.prompt) setOut(`${data.prompt}\n\n${data.note || ""}`);
      else if (data.excerpt) setOut(data.excerpt);
      else setOut(data.text || data.content || data.result || data.feedback || JSON.stringify(data));
    } catch (e) {
      setOut(e.message || "Error");
    }
    setBusy(false);
  }

  async function runPath(pathAction, extra = {}) {
    setBusy(true);
    setOut("");
    try {
      const res = await fetch(`/api/ai/${pathAction}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: topic, content, keywords, ...extra }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Failed");
      if (data.tags) setOut(JSON.stringify(data.tags, null, 2));
      else if (data.prompt) setOut(`${data.prompt}\n\n${data.note || ""}`);
      else if (data.excerpt) setOut(data.excerpt);
      else setOut(data.text || data.content || JSON.stringify(data));
    } catch (e) {
      setOut(e.message || "Error");
    }
    setBusy(false);
  }

  return (
    <div style={{ maxWidth: "900px" }}>
      <h1 className="hero-title" style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>
        AI Tools
      </h1>
      <p style={{ color: "var(--ads-text-muted)", marginBottom: "1.5rem" }}>Powered by Gemini (GEMINI_API_KEY) — also available as REST: POST /api/ai and POST /api/ai/[action]</p>

      <section style={{ marginBottom: "2rem", padding: "1rem", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "0.65rem" }}>
        <h2 style={{ fontSize: "1.05rem", marginBottom: "0.75rem" }}>Blog generator</h2>
        <input
          placeholder="Topic / title"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          className="header-btn"
          style={{ width: "100%", marginBottom: "0.5rem", borderRadius: "0.4rem", padding: "0.45rem" }}
        />
        <input
          placeholder="Keywords"
          value={keywords}
          onChange={(e) => setKeywords(e.target.value)}
          className="header-btn"
          style={{ width: "100%", marginBottom: "0.5rem", borderRadius: "0.4rem", padding: "0.45rem" }}
        />
        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem" }}>
          <button type="button" className="header-btn header-btn-primary" disabled={busy} onClick={() => run("full_article")}>
            Generate draft (Markdown)
          </button>
          <button type="button" className="header-btn header-btn-ghost" disabled={busy} onClick={() => runPath("generate-post")}>
            via /api/ai/generate-post
          </button>
        </div>
      </section>

      <section style={{ marginBottom: "2rem", padding: "1rem", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "0.65rem" }}>
        <h2 style={{ fontSize: "1.05rem", marginBottom: "0.75rem" }}>SEO & tags</h2>
        <textarea
          placeholder="Article body (Markdown)…"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={6}
          className="header-btn"
          style={{ width: "100%", fontFamily: "monospace", marginBottom: "0.5rem", borderRadius: "0.4rem", padding: "0.45rem" }}
        />
        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem" }}>
          <button type="button" className="header-btn header-btn-primary" disabled={busy} onClick={() => run("seo")}>
            SEO meta (JSON)
          </button>
          <button type="button" className="header-btn header-btn-ghost" disabled={busy} onClick={() => runPath("seo-meta")}>
            /api/ai/seo-meta
          </button>
          <button type="button" className="header-btn header-btn-ghost" disabled={busy} onClick={() => run("generate_tags")}>
            Generate tags
          </button>
          <button type="button" className="header-btn header-btn-ghost" disabled={busy} onClick={() => run("excerpt")}>
            Excerpt
          </button>
          <button type="button" className="header-btn header-btn-ghost" disabled={busy} onClick={() => runPath("generate-image")}>
            Cover image prompt
          </button>
        </div>
      </section>

      <section style={{ marginBottom: "2rem", padding: "1rem", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "0.65rem" }}>
        <h2 style={{ fontSize: "1.05rem", marginBottom: "0.75rem" }}>Content repurposer</h2>
        <textarea
          placeholder="Paste article Markdown…"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={8}
          className="header-btn"
          style={{ width: "100%", fontFamily: "monospace", marginBottom: "0.5rem", borderRadius: "0.4rem", padding: "0.45rem" }}
        />
        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem" }}>
          <button type="button" className="header-btn header-btn-ghost" disabled={busy} onClick={() => run("linkedin_post")}>
            LinkedIn post
          </button>
          <button type="button" className="header-btn header-btn-ghost" disabled={busy} onClick={() => run("twitter_thread")}>
            Twitter thread
          </button>
          <button type="button" className="header-btn header-btn-ghost" disabled={busy} onClick={() => run("instagram_caption")}>
            Instagram caption
          </button>
          <button type="button" className="header-btn header-btn-ghost" disabled={busy} onClick={() => run("repurpose")}>
            Repurpose pack
          </button>
          <button type="button" className="header-btn header-btn-ghost" disabled={busy} onClick={() => run("readability")}>
            Readability check
          </button>
        </div>
      </section>

      <section style={{ marginBottom: "2rem", padding: "1rem", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "0.65rem" }}>
        <h2 style={{ fontSize: "1.05rem", marginBottom: "0.75rem" }}>Headline tester</h2>
        <input placeholder="Headline A" value={h1} onChange={(e) => setH1(e.target.value)} className="header-btn" style={{ width: "100%", marginBottom: "0.35rem" }} />
        <input placeholder="Headline B" value={h2} onChange={(e) => setH2(e.target.value)} className="header-btn" style={{ width: "100%", marginBottom: "0.35rem" }} />
        <input placeholder="Headline C" value={h3} onChange={(e) => setH3(e.target.value)} className="header-btn" style={{ width: "100%", marginBottom: "0.5rem" }} />
        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem" }}>
          <button type="button" className="header-btn header-btn-primary" disabled={busy} onClick={() => run("headline_test", { h1, h2, h3 })}>
            Score headlines
          </button>
          <button type="button" className="header-btn header-btn-ghost" disabled={busy} onClick={() => runPath("test-headlines", { h1, h2, h3 })}>
            /api/ai/test-headlines
          </button>
        </div>
      </section>

      {out && (
        <pre
          style={{
            whiteSpace: "pre-wrap",
            padding: "1rem",
            background: "rgba(0,0,0,0.3)",
            borderRadius: "0.5rem",
            fontSize: "0.88rem",
          }}
        >
          {out}
        </pre>
      )}
    </div>
  );
}

"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

function buildExcerpt(text, query, length = 260) {
  if (!text) return "";
  const lower = text.toLowerCase();
  const q = query.toLowerCase();
  const idx = lower.indexOf(q);

  if (idx === -1) {
    return text.slice(0, length) + (text.length > length ? "…" : "");
  }

  const start = Math.max(0, idx - Math.floor(length / 3));
  const end = Math.min(text.length, start + length);
  const snippet = text.slice(start, end);
  return (start > 0 ? "…" : "") + snippet + (end < text.length ? "…" : "");
}

function searchArticles(articles, query) {
  const q = query.trim().toLowerCase();
  if (!q) return [];

  const scored = articles.map((article) => {
    const haystack =
      (article.title || "") +
      " " +
      (article.description || "") +
      " " +
      (article.content || "");
    const lower = haystack.toLowerCase();

    if (!lower.includes(q)) return { article, score: 0 };

    const occurrences = lower.split(q).length - 1;
    const firstIndex = lower.indexOf(q);
    const score = occurrences * 10 + Math.max(0, 2000 - firstIndex);
    return { article, score };
  });

  return scored
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map((item) => item.article);
}

export default function AIAssistant({ articles }) {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);

  const hasKnowledge = useMemo(
    () => Array.isArray(articles) && articles.length > 0,
    [articles]
  );

  function handleAsk(e) {
    e.preventDefault();
    const question = input.trim();
    if (!question) return;

    const userMessage = { role: "user", content: question };
    const relevant = hasKnowledge ? searchArticles(articles, question) : [];

    const assistantMessage = {
      role: "assistant",
      content: relevant.length
        ? "Here are some passages from the Archives that are closest to your question."
        : "I couldn&apos;t find a direct match in the current Archives, but more essays are coming online soon.",
      results: relevant,
      query: question,
    };

    setMessages((prev) => [...prev, userMessage, assistantMessage]);
    setInput("");
  }

  return (
    <>
      <button
        type="button"
        className="ai-assistant-toggle"
        onClick={() => setOpen((v) => !v)}
      >
        <span className="ai-toggle-dot" />
        <span>Ask AdsGupta AI</span>
      </button>

      {open && (
        <section className="ai-assistant-panel" aria-label="AdsGupta AI chat">
          <header className="ai-assistant-header">
            <div>
              <p className="ai-assistant-title">AdsGupta AI</p>
              <p className="ai-assistant-subtitle">
                Knowledge assistant for the Archives
              </p>
            </div>
            <button
              type="button"
              className="ai-assistant-close"
              onClick={() => setOpen(false)}
              aria-label="Close assistant"
            >
              ×
            </button>
          </header>

          <div className="ai-assistant-body">
            <div className="ai-assistant-messages">
              {messages.length === 0 && (
                <div className="ai-assistant-empty">
                  <p className="ai-assistant-empty-title">
                    Ask the Archives about ad-tech.
                  </p>
                  <p className="ai-assistant-empty-text">
                    Try questions like:
                  </p>
                  <ul>
                    <li>What is neural pathing?</li>
                    <li>What are AdsGupta views on native advertising?</li>
                    <li>
                      What trends are shaping programmatic advertising right
                      now?
                    </li>
                  </ul>
                </div>
              )}

              {messages.map((msg, idx) => {
                if (msg.role === "user") {
                  return (
                    <div key={idx} className="ai-message ai-message-user">
                      <p>{msg.content}</p>
                    </div>
                  );
                }

                return (
                  <div key={idx} className="ai-message ai-message-assistant">
                    <p>{msg.content}</p>
                    {msg.results && msg.results.length > 0 && (
                      <div className="ai-results">
                        {msg.results.map((article) => (
                          <article
                            key={article.slug}
                            className="ai-result-card"
                          >
                            <p className="ai-result-title">{article.title}</p>
                            <p className="ai-result-snippet">
                              {buildExcerpt(
                                article.content || article.description || "",
                                msg.query
                              )}
                            </p>
                            <Link
                              href={`/archives/${article.slug}`}
                              className="ai-result-link"
                            >
                              Open article
                            </Link>
                          </article>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <form className="ai-assistant-input-row" onSubmit={handleAsk}>
              <input
                type="text"
                placeholder="Ask about auctions, marketplaces, or neural pathing…"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="ai-assistant-input"
              />
              <button type="submit" className="ai-assistant-send">
                Send
              </button>
            </form>
          </div>
        </section>
      )}
    </>
  );
}


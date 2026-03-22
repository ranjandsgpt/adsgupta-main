"use client";

import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import "@uiw/react-md-editor/markdown-editor.css";

const MDEditor = dynamic(() => import("@uiw/react-md-editor"), { ssr: false });

const CATEGORIES = [
  "Neural Philosophical",
  "Marketplace Protocols",
  "AdTech Infrastructure",
  "Revenue Engineering",
  "Programmatic Strategy",
  "Media Buying Systems",
  "General",
];

const BG = "#0f1115";
const ACCENT = "#06b6d4";
const MUTED = "rgba(255,255,255,0.65)";
const BORDER = "rgba(255,255,255,0.12)";

function slugFromTitle(t) {
  return String(t || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 120);
}

export default function ArticleEditor({ mode, postId }) {
  const router = useRouter();
  const [loading, setLoading] = useState(mode === "edit");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [aiOpen, setAiOpen] = useState(false);
  const [profile, setProfile] = useState(null);

  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  const [content, setContent] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [tags, setTags] = useState("");
  const [status, setStatus] = useState("draft");
  const [scheduledAt, setScheduledAt] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [featured, setFeatured] = useState(false);
  const [seoTitle, setSeoTitle] = useState("");
  const [seoDescription, setSeoDescription] = useState("");
  const [ogImage, setOgImage] = useState("");
  const [publishToBlog, setPublishToBlog] = useState(true);
  const [publishToRanjan, setPublishToRanjan] = useState(false);
  const [publishToPousali, setPublishToPousali] = useState(false);
  const [crossLinkedin, setCrossLinkedin] = useState(false);
  const [crossInstagram, setCrossInstagram] = useState(false);
  const [crossFacebook, setCrossFacebook] = useState(false);
  const [crossTwitter, setCrossTwitter] = useState(false);

  const wordCount = useMemo(() => content.split(/\s+/).filter(Boolean).length, [content]);
  const readMinutes = Math.max(1, Math.ceil(wordCount / 220));

  useEffect(() => {
    fetch("/api/admin/profile")
      .then((r) => r.json())
      .then((p) => {
        setProfile(p);
        if (mode === "new" && p) {
          const s = p.subdomain;
          setPublishToRanjan(s === "ranjan" || s === "both");
          setPublishToPousali(s === "pousali" || s === "both");
        }
      })
      .catch(() => {});
  }, [mode]);

  useEffect(() => {
    if (mode !== "edit" || !postId) return;
    fetch(`/api/posts/${postId}`)
      .then((r) => {
        if (!r.ok) throw new Error("Not found");
        return r.json();
      })
      .then((p) => {
        setTitle(p.title || "");
        setSubtitle(p.subtitle || "");
        setSlug(p.slug || "");
        setSlugTouched(true);
        setContent(p.content || "");
        setExcerpt(p.excerpt || "");
        setCategory(p.category || CATEGORIES[0]);
        setTags(Array.isArray(p.tags) ? p.tags.join(", ") : "");
        setStatus(p.status || "draft");
        setScheduledAt(p.scheduled_at ? p.scheduled_at.slice(0, 16) : "");
        setCoverImage(p.cover_image || "");
        setFeatured(!!p.featured);
        setSeoTitle(p.seo_title || "");
        setSeoDescription(p.seo_description || "");
        setOgImage(p.og_image || "");
        setPublishToBlog(p.publish_to_blog !== false);
        setPublishToRanjan(!!p.publish_to_ranjan);
        setPublishToPousali(!!p.publish_to_pousali);
        setCrossLinkedin(!!p.crosspost_linkedin);
        setCrossInstagram(!!p.crosspost_instagram);
        setCrossFacebook(!!p.crosspost_facebook);
        setCrossTwitter(!!p.crosspost_twitter);
      })
      .catch(() => setError("Could not load post"))
      .finally(() => setLoading(false));
  }, [mode, postId]);

  useEffect(() => {
    if (!slugTouched && title) setSlug(slugFromTitle(title));
  }, [title, slugTouched]);

  const payload = () => ({
    title,
    subtitle,
    slug: slug || slugFromTitle(title),
    content,
    excerpt,
    category,
    tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
    status,
    scheduled_at: status === "scheduled" && scheduledAt ? new Date(scheduledAt).toISOString() : null,
    published_at: status === "published" ? new Date().toISOString() : null,
    cover_image: coverImage || null,
    featured,
    seo_title: seoTitle || null,
    seo_description: seoDescription || null,
    og_image: ogImage || null,
    read_time_minutes: readMinutes,
    publish_to_blog: true,
    publish_to_ranjan,
    publish_to_pousali,
    crosspost_linkedin: crossLinkedin,
    crosspost_instagram: crossInstagram,
    crosspost_facebook: crossFacebook,
    crosspost_twitter: crossTwitter,
  });

  async function saveDraft() {
    setError("");
    setSaving(true);
    try {
      const body = { ...payload(), status: "draft" };
      if (mode === "new") {
        const res = await fetch("/api/posts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data.error || "Save failed");
        router.push(`/admin/posts/${data.id}/edit`);
        router.refresh();
      } else {
        const res = await fetch(`/api/posts/${postId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        if (!res.ok) throw new Error("Save failed");
        router.refresh();
      }
    } catch (e) {
      setError(e.message || "Save failed");
    }
    setSaving(false);
  }

  async function publish() {
    setError("");
    setSaving(true);
    try {
      const body = { ...payload(), status: status === "scheduled" ? "scheduled" : "published" };
      if (mode === "new") {
        const res = await fetch("/api/posts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data.error || "Publish failed");
        await afterPublish(data.id);
        router.push(`/admin/posts/${data.id}/edit`);
        router.refresh();
      } else {
        const res = await fetch(`/api/posts/${postId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        if (!res.ok) throw new Error("Publish failed");
        await afterPublish(postId);
        router.refresh();
      }
    } catch (e) {
      setError(e.message || "Publish failed");
    }
    setSaving(false);
  }

  async function afterPublish(id) {
    try {
      await fetch("/api/sync-subdomains", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId: id }),
      });
    } catch {
      /* non-fatal */
    }
  }

  async function uploadCover(e) {
    const f = e.target.files?.[0];
    if (!f) return;
    const fd = new FormData();
    fd.append("file", f);
    const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
    const data = await res.json().catch(() => ({}));
    if (res.ok && data.url) setCoverImage(data.url);
    else setError(data.error || "Upload failed");
  }

  async function runAi(action, extra = {}) {
    setError("");
    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, title, content, ...extra }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "AI failed");
      if (action === "full_article") setContent(data.content || "");
      if (action === "improve" && data.text) {
        setContent((c) => c.replace(extra.selection || "", data.text));
      }
      if (action === "seo") {
        if (data.seo_title) setSeoTitle(data.seo_title);
        if (data.seo_description) setSeoDescription(data.seo_description);
        if (data.suggested_slug) setSlug(data.suggested_slug);
      }
      if (action === "excerpt" && data.excerpt) setExcerpt(data.excerpt);
    } catch (e) {
      setError(e.message || "AI failed");
    }
  }

  if (loading) {
    return <p style={{ color: MUTED }}>Loading…</p>;
  }

  const socialDisabled = {
    in: !profile?.instagram_token,
    li: !profile?.linkedin_token,
    fb: !profile?.facebook_token,
    tw: !profile?.twitter_token,
  };

  return (
    <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) 340px", gap: "1.5rem", alignItems: "start" }}>
      <div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", marginBottom: "1rem", alignItems: "center" }}>
          <Link href="/admin/posts" className="header-btn header-btn-ghost">
            ← Back
          </Link>
          <button type="button" className="header-btn header-btn-ghost" disabled={saving} onClick={saveDraft}>
            Save Draft
          </button>
          <button type="button" className="header-btn header-btn-primary" disabled={saving} onClick={publish}>
            {status === "scheduled" ? "Schedule" : "Publish"}
          </button>
          {(mode === "edit" && slug) || mode === "edit" ? (
            <Link
              href={slug ? `/archives/${slug}` : "#"}
              target="_blank"
              rel="noreferrer"
              className="header-btn header-btn-ghost"
              onClick={(e) => {
                if (!slug) e.preventDefault();
              }}
            >
              Preview
            </Link>
          ) : null}
        </div>

        {error && <p style={{ color: "#f87171", marginBottom: "0.75rem" }}>{error}</p>}

        <label style={{ display: "block", marginBottom: "0.75rem" }}>
          <span style={{ fontSize: "0.8rem", color: MUTED }}>Title</span>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="header-btn"
            style={{ display: "block", width: "100%", fontSize: "1.35rem", fontWeight: 700, marginTop: "0.25rem", borderRadius: "0.5rem", padding: "0.5rem", border: `1px solid ${BORDER}`, background: "rgba(255,255,255,0.04)", color: "#fff" }}
          />
        </label>

        <label style={{ display: "block", marginBottom: "0.75rem" }}>
          <span style={{ fontSize: "0.8rem", color: MUTED }}>Subtitle</span>
          <input
            value={subtitle}
            onChange={(e) => setSubtitle(e.target.value)}
            className="header-btn"
            style={{ display: "block", width: "100%", marginTop: "0.25rem", borderRadius: "0.5rem", padding: "0.45rem", border: `1px solid ${BORDER}`, background: "rgba(255,255,255,0.04)", color: "#fff" }}
          />
        </label>

        <label style={{ display: "block", marginBottom: "0.75rem" }}>
          <span style={{ fontSize: "0.8rem", color: MUTED }}>Slug</span>
          <input
            value={slug}
            onChange={(e) => {
              setSlugTouched(true);
              setSlug(e.target.value);
            }}
            className="header-btn"
            style={{ display: "block", width: "100%", marginTop: "0.25rem", borderRadius: "0.5rem", padding: "0.45rem", border: `1px solid ${BORDER}`, background: "rgba(255,255,255,0.04)", color: "#fff" }}
          />
        </label>

        <div data-color-mode="dark" style={{ marginBottom: "1rem" }}>
          <MDEditor value={content} onChange={setContent} height={420} visibleDragbar={false} />
        </div>

        <label style={{ display: "block", marginBottom: "0.75rem" }}>
          <span style={{ fontSize: "0.8rem", color: MUTED }}>Tags (comma-separated)</span>
          <input
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            className="header-btn"
            style={{ display: "block", width: "100%", marginTop: "0.25rem", borderRadius: "0.5rem", padding: "0.45rem", border: `1px solid ${BORDER}`, background: "rgba(255,255,255,0.04)", color: "#fff" }}
          />
        </label>

        <label style={{ display: "block", marginBottom: "0.75rem" }}>
          <span style={{ fontSize: "0.8rem", color: MUTED }}>Excerpt</span>
          <textarea
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
            rows={3}
            className="header-btn"
            style={{ display: "block", width: "100%", marginTop: "0.25rem", borderRadius: "0.5rem", padding: "0.45rem", border: `1px solid ${BORDER}`, background: "rgba(255,255,255,0.04)", color: "#fff" }}
          />
        </label>
      </div>

      <aside style={{ position: "sticky", top: "1rem", background: BG, border: `1px solid ${BORDER}`, borderRadius: "0.75rem", padding: "1rem", fontSize: "0.88rem" }}>
        <h3 style={{ margin: "0 0 0.75rem", color: ACCENT, fontSize: "0.95rem" }}>Settings</h3>

        <label style={{ display: "block", marginBottom: "0.65rem" }}>
          <span style={{ color: MUTED }}>Category</span>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            style={{ display: "block", width: "100%", marginTop: "0.2rem", borderRadius: "0.4rem", padding: "0.4rem", border: `1px solid ${BORDER}`, background: "rgba(255,255,255,0.06)", color: "#fff" }}
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>

        <label style={{ display: "block", marginBottom: "0.65rem" }}>
          <span style={{ color: MUTED }}>Status</span>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            style={{ display: "block", width: "100%", marginTop: "0.2rem", borderRadius: "0.4rem", padding: "0.4rem", border: `1px solid ${BORDER}`, background: "rgba(255,255,255,0.06)", color: "#fff" }}
          >
            <option value="draft">Draft</option>
            <option value="published">Published</option>
            <option value="scheduled">Scheduled</option>
            <option value="archived">Archived</option>
          </select>
        </label>

        {status === "scheduled" && (
          <label style={{ display: "block", marginBottom: "0.65rem" }}>
            <span style={{ color: MUTED }}>Schedule at</span>
            <input
              type="datetime-local"
              value={scheduledAt}
              onChange={(e) => setScheduledAt(e.target.value)}
              style={{ display: "block", width: "100%", marginTop: "0.2rem", borderRadius: "0.4rem", padding: "0.4rem", border: `1px solid ${BORDER}`, background: "rgba(255,255,255,0.06)", color: "#fff" }}
            />
          </label>
        )}

        <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.75rem", cursor: "pointer" }}>
          <input type="checkbox" checked={featured} onChange={(e) => setFeatured(e.target.checked)} />
          Featured
        </label>

        <div style={{ marginBottom: "0.75rem" }}>
          <span style={{ color: MUTED }}>Cover image</span>
          {coverImage && (
            <div style={{ marginTop: "0.35rem" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={coverImage} alt="" style={{ maxWidth: "100%", borderRadius: "0.5rem" }} />
            </div>
          )}
          <input type="file" accept="image/*" onChange={uploadCover} style={{ marginTop: "0.35rem", fontSize: "0.8rem" }} />
        </div>

        <h4 style={{ margin: "1rem 0 0.5rem", color: MUTED, fontSize: "0.8rem" }}>SEO</h4>
        <label style={{ display: "block", marginBottom: "0.5rem" }}>
          <span style={{ color: MUTED }}>SEO title</span>
          <input
            value={seoTitle}
            onChange={(e) => setSeoTitle(e.target.value)}
            style={{ display: "block", width: "100%", marginTop: "0.2rem", borderRadius: "0.4rem", padding: "0.35rem", border: `1px solid ${BORDER}`, background: "rgba(255,255,255,0.04)", color: "#fff" }}
          />
        </label>
        <label style={{ display: "block", marginBottom: "0.5rem" }}>
          <span style={{ color: MUTED }}>Meta description</span>
          <textarea
            value={seoDescription}
            onChange={(e) => setSeoDescription(e.target.value)}
            rows={3}
            style={{ display: "block", width: "100%", marginTop: "0.2rem", borderRadius: "0.4rem", padding: "0.35rem", border: `1px solid ${BORDER}`, background: "rgba(255,255,255,0.04)", color: "#fff" }}
          />
        </label>
        <label style={{ display: "block", marginBottom: "0.75rem" }}>
          <span style={{ color: MUTED }}>OG image URL</span>
          <input
            value={ogImage}
            onChange={(e) => setOgImage(e.target.value)}
            style={{ display: "block", width: "100%", marginTop: "0.2rem", borderRadius: "0.4rem", padding: "0.35rem", border: `1px solid ${BORDER}`, background: "rgba(255,255,255,0.04)", color: "#fff" }}
          />
        </label>

        <p style={{ color: MUTED, marginBottom: "0.75rem" }}>
          Words: {wordCount} · Read time: {readMinutes} min
        </p>

        <h4 style={{ margin: "0.75rem 0 0.5rem", color: ACCENT, fontSize: "0.85rem" }}>Distribution</h4>
        <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.35rem", opacity: 0.85 }}>
          <input type="checkbox" checked disabled />
          blog.adsgupta.com (always on)
        </label>
        <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.35rem", cursor: "pointer" }}>
          <input type="checkbox" checked={publishToRanjan} onChange={(e) => setPublishToRanjan(e.target.checked)} />
          ranjan.adsgupta.com/blog
        </label>
        <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.75rem", cursor: "pointer" }}>
          <input type="checkbox" checked={publishToPousali} onChange={(e) => setPublishToPousali(e.target.checked)} />
          pousali.adsgupta.com/blog
        </label>

        <h4 style={{ margin: "0.5rem 0", color: ACCENT, fontSize: "0.85rem" }}>Cross-post</h4>
        <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.3rem", opacity: socialDisabled.li ? 0.45 : 1 }}>
          <input type="checkbox" checked={crossLinkedin} disabled={socialDisabled.li} onChange={(e) => setCrossLinkedin(e.target.checked)} />
          LinkedIn {!profile?.linkedin_token && "(not connected)"}
        </label>
        <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.3rem", opacity: socialDisabled.in ? 0.45 : 1 }}>
          <input type="checkbox" checked={crossInstagram} disabled={socialDisabled.in} onChange={(e) => setCrossInstagram(e.target.checked)} />
          Instagram {!profile?.instagram_token && "(not connected)"}
        </label>
        <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.3rem", opacity: socialDisabled.fb ? 0.45 : 1 }}>
          <input type="checkbox" checked={crossFacebook} disabled={socialDisabled.fb} onChange={(e) => setCrossFacebook(e.target.checked)} />
          Facebook {!profile?.facebook_token && "(not connected)"}
        </label>
        <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.75rem", opacity: socialDisabled.tw ? 0.45 : 1 }}>
          <input type="checkbox" checked={crossTwitter} disabled={socialDisabled.tw} onChange={(e) => setCrossTwitter(e.target.checked)} />
          X / Twitter {!profile?.twitter_token && "(not connected)"}
        </label>

        <details open={aiOpen} onToggle={(e) => setAiOpen(e.target.open)} style={{ marginTop: "0.75rem", borderTop: `1px solid ${BORDER}`, paddingTop: "0.75rem" }}>
          <summary style={{ cursor: "pointer", color: ACCENT, fontWeight: 600 }}>AI tools (Gemini)</summary>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem", marginTop: "0.5rem" }}>
            <button type="button" className="header-btn header-btn-ghost" onClick={() => runAi("full_article", { keywords: tags })}>
              Generate article from title
            </button>
            <button type="button" className="header-btn header-btn-ghost" onClick={() => runAi("seo")}>
              Generate SEO meta
            </button>
            <button type="button" className="header-btn header-btn-ghost" onClick={() => runAi("excerpt")}>
              Generate excerpt
            </button>
          </div>
        </details>
      </aside>
    </div>
  );
}

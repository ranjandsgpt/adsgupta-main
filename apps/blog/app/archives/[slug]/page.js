import { notFound } from "next/navigation";
import PostCard from "../../../components/PostCard";
import MonetizationInjector from "../../../components/MonetizationInjector";
import { getPostBySlug, getPostSlugs, getAllPosts, injectMonetizationSlot } from "../../../lib/posts";
import { getMonetizationScripts } from "../../../lib/db.js";

export async function generateStaticParams() {
  return await getPostSlugs();
}

export async function generateMetadata({ params }) {
  const { slug } = params;

  try {
    const post = await getPostBySlug(slug);
    if (!post) return { title: "Article not found" };
    const { meta } = post;
    const title = meta.ogTitle || meta.title;
    const description = meta.ogDescription || meta.description;
    const url = `https://blog.adsgupta.com/archives/${post.slug}`;
    const images = meta.ogImage ? [{ url: meta.ogImage }] : undefined;

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        type: "article",
        url,
        images,
      },
      alternates: {
        canonical: url,
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
        images: images?.map((img) => img.url),
      },
    };
  } catch {
    return {
      title: "Article not found",
    };
  }
}

export default async function ArchivePostPage({ params }) {
  const { slug } = params;

  let post;
  try {
    post = await getPostBySlug(slug);
  } catch {
    notFound();
  }
  if (!post) notFound();

  let scriptHtml = "";
  try {
    const scripts = getMonetizationScripts();
    if (scripts && scripts[0]) scriptHtml = scripts[0].script || "";
  } catch (_) {}
  const { contentHtml: contentWithSlot } = injectMonetizationSlot(post.contentHtml, scriptHtml, 3);

  const { meta, readingTime } = post;
  const {
    title,
    category,
    source,
    date,
    description,
    author,
    showCta,
    ctaLabel,
    ctaUrl,
  } = meta;

  const allPosts = await getAllPosts();
  const relatedByCategory = allPosts.filter(
    (p) => p.slug !== slug && p.meta?.category === category
  );
  const fallbackRelated = allPosts.filter((p) => p.slug !== slug);
  const related =
    relatedByCategory.length >= 3
      ? relatedByCategory.slice(0, 3)
      : fallbackRelated.slice(0, 3);

  const canonicalUrl = `https://blog.adsgupta.com/archives/${slug}`;
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: title,
    description,
    author: {
      "@type": "Organization",
      name: "AdsGupta",
    },
    publisher: {
      "@type": "Organization",
      name: "AdsGupta",
    },
    datePublished: date || undefined,
    dateModified: date || undefined,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": canonicalUrl,
    },
    url: canonicalUrl,
  };

  return (
    <div className="shell post-layout">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <header className="post-header">
        <p className="hero-kicker">The Archives · {category || "Essay"}</p>
        <h1 className="post-title">{title}</h1>
        {description && (
          <p className="hero-description" style={{ marginTop: "1.25rem" }}>
            {description}
          </p>
        )}
        <div className="post-meta-row">
          {author && (
            <span className="meta-pill">
              By {author}
            </span>
          )}
          {category && <span className="chip chip-muted">{category}</span>}
          {readingTime?.text && (
            <span className="meta-pill">{readingTime.text}</span>
          )}
          {source && (
            <span className="chip chip-source chip-source-adsgupta">
              <span style={{ opacity: 0.8 }}>Source</span>&nbsp;·&nbsp;{source}
            </span>
          )}
          {date && (
            <span className="meta-pill">
              {new Date(date).toLocaleDateString(undefined, {
                year: "numeric",
                month: "short",
                day: "numeric",
              })}
            </span>
          )}
        </div>
      </header>

      <article
        className="prose"
        dangerouslySetInnerHTML={{ __html: contentWithSlot }}
      />
      <MonetizationInjector scriptHtml={scriptHtml} />

      <section className="ad-slot ad-slot-inline">
        <p className="ad-slot-label">
          Reserved: Inline article placement for high-signal creative.
        </p>
      </section>

      {showCta && (
        <div className="cta-block">
          <div className="cta-inner">
            <p className="cta-kicker">Monetization Protocol</p>
            <h2 className="cta-title">
              Run an Ad Audit with the Neural Engine
            </h2>
            <p className="cta-description">
              Benchmark your creative, auctions, and marketplace structure
              against AdsGupta&apos;s neural models. See exactly where you are
              leaving performance on the table.
            </p>
            <a
              href={ctaUrl}
              target="_blank"
              rel="noreferrer"
              className="chip chip-accent"
            >
              {ctaLabel}
            </a>
            <a
              href="https://demoai.adsgupta.com"
              target="_blank"
              rel="noreferrer"
              className="chip chip-muted cta-secondary"
            >
              Run your Amazon audit with AdsGupta AI
            </a>
          </div>
        </div>
      )}

      {related.length > 0 && (
        <section className="related-section">
          <div className="related-header">
            <p className="hero-kicker">Related in the Archives</p>
            <h2 className="related-title">More signals you might like</h2>
          </div>
          <div className="related-grid">
            {related.map((relatedPost) => (
              <PostCard key={relatedPost.slug} post={relatedPost} />
            ))}
          </div>
        </section>
      )}

      <section className="ad-slot ad-slot-footer">
        <p className="ad-slot-label">
          Reserved: Footer placement for marketplace or tooling partners.
        </p>
      </section>
    </div>
  );
}

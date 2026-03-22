import Link from "next/link";

function formatDate(date) {
  if (!date) return "";
  try {
    return new Date(date).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return "";
  }
}

export default function ArticleCard({
  post,
  accent = "#00D4FF",
  categoryLabel,
  variant = "default",
  rank,
}) {
  const { slug, excerpt, meta, readingTime } = post;
  const { title, category, date } = meta || {};
  const tag = categoryLabel || category || "Article";

  if (variant === "featured") {
    return (
      <article className="pub-card pub-card--featured">
        <Link
          href={`/archives/${slug}`}
          className="pub-card__link"
          style={{ "--pub-accent": accent }}
        >
          <span
            className="pub-card__tag"
            style={{ background: `${accent}22`, color: accent, borderColor: `${accent}55` }}
          >
            {tag}
          </span>
          <h2 className="pub-card__headline pub-card__headline--featured">{title}</h2>
          {excerpt && <p className="pub-card__excerpt">{excerpt}</p>}
          <div className="pub-card__meta">
            {formatDate(date) && <span>{formatDate(date)}</span>}
            {readingTime?.text && <span>{readingTime.text}</span>}
          </div>
        </Link>
      </article>
    );
  }

  if (variant === "compact") {
    return (
      <article className="pub-card pub-card--compact">
        <Link
          href={`/archives/${slug}`}
          className="pub-card__link pub-card__link--row"
          style={{ "--pub-accent": accent }}
        >
          <span className="pub-card__num" aria-hidden>
            {rank != null ? String(rank).padStart(2, "0") : "—"}
          </span>
          <div className="pub-card__compact-body">
            <span
              className="pub-card__tag pub-card__tag--sm"
              style={{ background: `${accent}22`, color: accent, borderColor: `${accent}44` }}
            >
              {tag}
            </span>
            <h3 className="pub-card__headline pub-card__headline--compact">{title}</h3>
            <div className="pub-card__meta pub-card__meta--sm">
              {formatDate(date) && <span>{formatDate(date)}</span>}
              {readingTime?.text && <span>{readingTime.text}</span>}
            </div>
          </div>
        </Link>
      </article>
    );
  }

  return (
    <article className="pub-card">
      <Link href={`/archives/${slug}`} className="pub-card__link" style={{ "--pub-accent": accent }}>
        <span
          className="pub-card__tag"
          style={{ background: `${accent}22`, color: accent, borderColor: `${accent}55` }}
        >
          {tag}
        </span>
        <h3 className="pub-card__headline">{title}</h3>
        {excerpt && <p className="pub-card__excerpt">{excerpt}</p>}
        <div className="pub-card__meta">
          {formatDate(date) && <span>{formatDate(date)}</span>}
          {readingTime?.text && <span>{readingTime.text}</span>}
        </div>
      </Link>
    </article>
  );
}

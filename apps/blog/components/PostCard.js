import Link from "next/link";

function getSourceChipClasses(source) {
  if (!source) return "chip chip-source";
  const normalized = source.toLowerCase();

  if (normalized.includes("linkedin")) {
    return "chip chip-source chip-source-linkedin";
  }
  if (normalized.includes("blogspot") || normalized.includes("blogger")) {
    return "chip chip-source chip-source-blogspot";
  }
  if (normalized.includes("adsgupta")) {
    return "chip chip-source chip-source-adsgupta";
  }
  return "chip chip-source";
}

export default function PostCard({ post }) {
  const { slug, excerpt, meta, readingTime } = post;
  const { title, category, source, date } = meta;

  const sourceClasses = getSourceChipClasses(source);

  return (
    <article className="masonry-item">
      <Link href={`/archives/${slug}`} className="card">
        <div className="card-meta">
          {source && (
            <span className={sourceClasses}>
              <span style={{ opacity: 0.8 }}>Source</span>&nbsp;·&nbsp;{source}
            </span>
          )}
          {category && <span className="chip chip-muted">{category}</span>}
          {date && (
            <span className="meta-pill">
              {new Date(date).toLocaleDateString(undefined, {
                year: "numeric",
                month: "short",
                day: "numeric",
              })}
            </span>
          )}
          {readingTime?.text && (
            <span className="meta-pill">{readingTime.text}</span>
          )}
        </div>
        <h3 className="card-title">{title}</h3>
        {excerpt && <p className="card-excerpt">{excerpt}</p>}
      </Link>
    </article>
  );
}


/** JSON-safe post row for public /api/posts responses. */
export function serializePublicPost(row) {
  if (!row) return null;
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    subtitle: row.subtitle,
    content: row.content,
    excerpt: row.excerpt,
    category: row.category,
    tags: row.tags,
    status: row.status,
    author_email: row.author_email,
    author_name: row.author_name,
    seo_title: row.seo_title,
    seo_description: row.seo_description,
    og_image: row.og_image,
    cover_image: row.cover_image,
    published_at: row.published_at ? String(row.published_at) : null,
    updated_at: row.updated_at ? String(row.updated_at) : null,
    read_time_minutes: row.read_time_minutes,
    publish_to_blog: row.publish_to_blog,
    publish_to_ranjan: row.publish_to_ranjan,
    publish_to_pousali: row.publish_to_pousali,
  };
}

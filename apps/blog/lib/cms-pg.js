/**
 * CMS data layer — Neon Postgres via `lib/db.js` `sql`.
 */
import { sql } from "./db.js";
import { slugify } from "./slugify.js";

function wordsToReadTime(content) {
  const words = String(content || "")
    .split(/\s+/)
    .filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 220));
}

function parseTags(row) {
  if (!row?.tags) return [];
  if (Array.isArray(row.tags)) return row.tags.map(String).filter(Boolean);
  try {
    const j = JSON.parse(row.tags);
    return Array.isArray(j) ? j.map(String) : [];
  } catch {
    return String(row.tags)
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
  }
}

export function mapPostRow(row, authorLabel) {
  if (!row) return null;
  const tags = parseTags(row);
  const published = row.published_at || (row.status === "published" ? row.updated_at : null);
  return {
    id: row.id,
    author_id: row.author_email,
    slug: row.slug,
    title: row.title,
    subtitle: row.subtitle,
    content: row.content,
    excerpt: row.excerpt,
    cover_image: row.cover_image,
    category: row.category,
    tags,
    status: row.status,
    author_email: row.author_email,
    author_name: row.author_name,
    author: authorLabel || row.author_name || row.author_email || "—",
    seo_title: row.seo_title,
    seo_description: row.seo_description,
    og_image: row.og_image,
    read_time_minutes: row.read_time_minutes,
    featured: row.featured,
    scheduled_at: row.scheduled_at,
    published_at: row.published_at,
    publish_to_blog: row.publish_to_blog !== false,
    publish_to_ranjan: !!row.publish_to_ranjan,
    publish_to_pousali: !!row.publish_to_pousali,
    crosspost_linkedin: !!row.crosspost_linkedin,
    crosspost_instagram: !!row.crosspost_instagram,
    crosspost_facebook: !!row.crosspost_facebook,
    crosspost_twitter: !!row.crosspost_twitter,
    created_at: row.created_at,
    updated_at: row.updated_at,
    source: "AdsGupta",
    external_url: "",
    publish_date: published ? String(published).slice(0, 10) : null,
    reading_time: row.read_time_minutes,
    meta: { title: row.title, date: published },
  };
}

export function distributionDefaultsFromSubdomain(subdomain) {
  const s = subdomain;
  return {
    publish_to_blog: true,
    publish_to_ranjan: s === "ranjan" || s === "both",
    publish_to_pousali: s === "pousali" || s === "both",
  };
}

export async function getDashboardStats(authorEmail) {
  const { rows: posts } = await sql`
    SELECT status FROM posts WHERE author_email = ${authorEmail}
  `;
  const list = posts || [];
  const total = list.length;
  const published = list.filter((p) => p.status === "published").length;
  const drafts = list.filter((p) => p.status === "draft").length;
  const scheduled = list.filter((p) => p.status === "scheduled").length;
  const archived = list.filter((p) => p.status === "archived").length;

  let viewCount = 0;
  const { rows: vc } = await sql`
    SELECT COUNT(*)::int AS c FROM analytics_events e
    INNER JOIN posts p ON e.post_id = p.id
    WHERE e.event_type = 'view' AND p.author_email = ${authorEmail}
  `;
  viewCount = vc[0]?.c ?? 0;

  const { rows: sc } = await sql`SELECT COUNT(*)::int AS c FROM subscribers WHERE status = 'active'`;
  const subCount = sc[0]?.c ?? 0;

  const { rows: adRows } = await sql`SELECT COUNT(*)::int AS c FROM ad_slots WHERE active = true`;
  const adSlotsActive = adRows[0]?.c ?? 0;

  return {
    total_posts: total,
    published,
    drafts,
    scheduled,
    archived,
    views: viewCount,
    subscribers: subCount,
    revenue_cents: 0,
    ad_slots_active: adSlotsActive,
  };
}

export async function listRecentPosts(authorEmail, limit = 8) {
  const { rows } = await sql`
    SELECT * FROM posts WHERE author_email = ${authorEmail}
    ORDER BY updated_at DESC NULLS LAST LIMIT ${limit}
  `;
  return rows || [];
}

export async function listPostsForAdmin(authorEmail, opts = {}) {
  const { status, q } = opts;
  let rows;
  if (status && status !== "all") {
    if (q && String(q).trim()) {
      const term = `%${String(q).trim()}%`;
      const { rows: r } = await sql`
        SELECT * FROM posts WHERE author_email = ${authorEmail} AND status = ${status}
        AND (title ILIKE ${term} OR slug ILIKE ${term})
        ORDER BY updated_at DESC NULLS LAST
      `;
      rows = r;
    } else {
      const { rows: r } = await sql`
        SELECT * FROM posts WHERE author_email = ${authorEmail} AND status = ${status}
        ORDER BY updated_at DESC NULLS LAST
      `;
      rows = r;
    }
  } else if (q && String(q).trim()) {
    const term = `%${String(q).trim()}%`;
    const { rows: r } = await sql`
      SELECT * FROM posts WHERE author_email = ${authorEmail}
      AND (title ILIKE ${term} OR slug ILIKE ${term})
      ORDER BY updated_at DESC NULLS LAST
    `;
    rows = r;
  } else {
    const { rows: r } = await sql`
      SELECT * FROM posts WHERE author_email = ${authorEmail}
      ORDER BY updated_at DESC NULLS LAST
    `;
    rows = r;
  }
  return (rows || []).map((row) => mapPostRow(row, authorEmail));
}

export async function getPostById(authorEmail, id) {
  const { rows } = await sql`
    SELECT * FROM posts WHERE id = ${id}::uuid AND author_email = ${authorEmail} LIMIT 1
  `;
  const row = rows[0];
  if (!row) return null;
  return mapPostRow(row, authorEmail);
}

function tagsToArray(tags) {
  if (Array.isArray(tags)) return tags.map(String).filter(Boolean);
  if (typeof tags === "string" && tags.trim()) {
    try {
      const j = JSON.parse(tags);
      if (Array.isArray(j)) return j.map(String);
    } catch {
      return tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);
    }
  }
  return [];
}

function buildInsertPayload(body, authorEmail, authorName, distDefaults) {
  const slug = body.slug?.trim() || slugify(body.title || "post");
  const content = body.content ?? "";
  const readTime = body.read_time_minutes ?? wordsToReadTime(content);
  const d = distDefaults || {};
  const st = body.status || "draft";
  return {
    slug,
    title: body.title?.trim() || "Untitled",
    subtitle: body.subtitle || null,
    content,
    excerpt: body.excerpt || null,
    cover_image: body.cover_image || null,
    category: body.category || null,
    tags: tagsToArray(body.tags),
    status: st,
    author_email: authorEmail,
    author_name: authorName || null,
    seo_title: body.seo_title || null,
    seo_description: body.seo_description || null,
    og_image: body.og_image || null,
    read_time_minutes: readTime,
    featured: !!body.featured,
    scheduled_at: body.scheduled_at || null,
    published_at:
      st === "published" ? body.published_at || new Date().toISOString() : body.published_at || null,
    publish_to_blog: body.publish_to_blog ?? d.publish_to_blog ?? true,
    publish_to_ranjan: body.publish_to_ranjan ?? d.publish_to_ranjan ?? false,
    publish_to_pousali: body.publish_to_pousali ?? d.publish_to_pousali ?? false,
    crosspost_linkedin: !!body.crosspost_linkedin,
    crosspost_instagram: !!body.crosspost_instagram,
    crosspost_facebook: !!body.crosspost_facebook,
    crosspost_twitter: !!body.crosspost_twitter,
  };
}

export async function createPost(authorEmail, body, subdomain, authorName) {
  const defaults = distributionDefaultsFromSubdomain(subdomain);
  const p = buildInsertPayload(body, authorEmail, authorName, {
    publish_to_blog: body.publish_to_blog ?? defaults.publish_to_blog,
    publish_to_ranjan: body.publish_to_ranjan ?? defaults.publish_to_ranjan,
    publish_to_pousali: body.publish_to_pousali ?? defaults.publish_to_pousali,
  });
  const { rows } = await sql`
    INSERT INTO posts (
      slug, title, subtitle, content, excerpt, cover_image, category, tags, status, author_email, author_name,
      seo_title, seo_description, og_image, read_time_minutes, featured, scheduled_at, published_at,
      publish_to_blog, publish_to_ranjan, publish_to_pousali,
      crosspost_linkedin, crosspost_instagram, crosspost_facebook, crosspost_twitter
    ) VALUES (
      ${p.slug}, ${p.title}, ${p.subtitle}, ${p.content}, ${p.excerpt}, ${p.cover_image}, ${p.category}, ${p.tags},
      ${p.status}, ${p.author_email}, ${p.author_name}, ${p.seo_title}, ${p.seo_description}, ${p.og_image}, ${p.read_time_minutes},
      ${p.featured}, ${p.scheduled_at}, ${p.published_at},
      ${p.publish_to_blog}, ${p.publish_to_ranjan}, ${p.publish_to_pousali},
      ${p.crosspost_linkedin}, ${p.crosspost_instagram}, ${p.crosspost_facebook}, ${p.crosspost_twitter}
    )
    RETURNING id
  `;
  return rows[0].id;
}

export async function updatePost(authorEmail, id, body) {
  const existing = await getPostById(authorEmail, id);
  if (!existing) return null;
  const content = body.content ?? existing.content;
  const readTime = body.read_time_minutes ?? wordsToReadTime(content);
  const st = body.status ?? existing.status;
  const tagsArr =
    body.tags !== undefined ? tagsToArray(body.tags) : tagsToArray(existing.tags || []);

  await sql`
    UPDATE posts SET
      title = ${body.title ?? existing.title},
      subtitle = ${body.subtitle ?? existing.subtitle},
      slug = ${body.slug?.trim() || existing.slug},
      content = ${content},
      excerpt = ${body.excerpt ?? existing.excerpt},
      cover_image = ${body.cover_image ?? existing.cover_image},
      category = ${body.category ?? existing.category},
      tags = ${tagsArr},
      author_name = ${body.author_name ?? existing.author_name},
      status = ${st},
      seo_title = ${body.seo_title ?? existing.seo_title},
      seo_description = ${body.seo_description ?? existing.seo_description},
      og_image = ${body.og_image ?? existing.og_image},
      read_time_minutes = ${readTime},
      featured = ${body.featured ?? existing.featured},
      scheduled_at = ${body.scheduled_at !== undefined ? body.scheduled_at : existing.scheduled_at},
      published_at = ${
        st === "published"
          ? body.published_at || existing.published_at || new Date().toISOString()
          : body.published_at !== undefined
            ? body.published_at
            : existing.published_at
      },
      publish_to_blog = ${body.publish_to_blog ?? existing.publish_to_blog},
      publish_to_ranjan = ${body.publish_to_ranjan ?? existing.publish_to_ranjan},
      publish_to_pousali = ${body.publish_to_pousali ?? existing.publish_to_pousali},
      crosspost_linkedin = ${body.crosspost_linkedin ?? existing.crosspost_linkedin},
      crosspost_instagram = ${body.crosspost_instagram ?? existing.crosspost_instagram},
      crosspost_facebook = ${body.crosspost_facebook ?? existing.crosspost_facebook},
      crosspost_twitter = ${body.crosspost_twitter ?? existing.crosspost_twitter},
      updated_at = NOW()
    WHERE id = ${id}::uuid AND author_email = ${authorEmail}
  `;
  return true;
}

export async function deletePost(authorEmail, id) {
  const { rows } = await sql`
    DELETE FROM posts WHERE id = ${id}::uuid AND author_email = ${authorEmail} RETURNING id
  `;
  return rows.length > 0;
}

export async function duplicatePost(authorEmail, id, subdomain) {
  const row = await getPostById(authorEmail, id);
  if (!row) return null;
  const newSlug = `${row.slug}-copy-${Date.now().toString(36)}`.slice(0, 120);
  return createPost(
    authorEmail,
    {
      title: `${row.title} (copy)`,
      slug: newSlug,
      content: row.content,
      excerpt: row.excerpt,
      category: row.category,
      tags: row.tags,
      status: "draft",
      subtitle: row.subtitle,
      cover_image: row.cover_image,
      seo_title: row.seo_title,
      seo_description: row.seo_description,
      og_image: row.og_image,
      featured: false,
      publish_to_blog: row.publish_to_blog,
      publish_to_ranjan: row.publish_to_ranjan,
      publish_to_pousali: row.publish_to_pousali,
    },
    subdomain,
    row.author_name || authorEmail
  );
}

export async function bulkSetStatus(authorEmail, ids, status) {
  if (!ids?.length) return 0;
  const pub = status === "published" ? new Date().toISOString() : null;
  let total = 0;
  for (const raw of ids) {
    const id = String(raw);
    const { rows } = await sql`
      UPDATE posts SET
        status = ${status},
        published_at = ${status === "published" ? pub : null},
        updated_at = NOW()
      WHERE author_email = ${authorEmail} AND id = ${id}::uuid
      RETURNING id
    `;
    total += rows.length;
  }
  return total;
}

export async function bulkDelete(authorEmail, ids) {
  if (!ids?.length) return 0;
  let total = 0;
  for (const raw of ids) {
    const id = String(raw);
    const { rows } = await sql`
      DELETE FROM posts WHERE author_email = ${authorEmail} AND id = ${id}::uuid RETURNING id
    `;
    total += rows.length;
  }
  return total;
}

export async function listPublishedBlogPosts({ limit = 50, offset = 0 } = {}) {
  const { rows } = await sql`
    SELECT * FROM posts
    WHERE status = 'published' AND publish_to_blog = true
    ORDER BY published_at DESC NULLS LAST
    LIMIT ${limit} OFFSET ${offset}
  `;
  return rows || [];
}

export async function listPostsBySubdomain(subdomain, { limit = 50, offset = 0 } = {}) {
  if (subdomain === "ranjan") {
    const { rows } = await sql`
      SELECT * FROM posts
      WHERE status = 'published' AND publish_to_ranjan = true
      ORDER BY published_at DESC NULLS LAST
      LIMIT ${limit} OFFSET ${offset}
    `;
    return rows || [];
  }
  if (subdomain === "pousali") {
    const { rows } = await sql`
      SELECT * FROM posts
      WHERE status = 'published' AND publish_to_pousali = true
      ORDER BY published_at DESC NULLS LAST
      LIMIT ${limit} OFFSET ${offset}
    `;
    return rows || [];
  }
  return [];
}

export async function searchPublishedPosts(query, { limit = 30 } = {}) {
  const qq = String(query).trim();
  if (!qq) return [];
  const term = `%${qq}%`;
  const { rows } = await sql`
    SELECT slug, title, excerpt, category, published_at FROM posts
    WHERE status = 'published' AND publish_to_blog = true
    AND (title ILIKE ${term} OR excerpt ILIKE ${term})
    LIMIT ${limit}
  `;
  return rows || [];
}

export async function getPublishedPostBySlug(slug) {
  const { rows } = await sql`
    SELECT * FROM posts
    WHERE slug = ${slug} AND status = 'published' AND publish_to_blog = true
    LIMIT 1
  `;
  return rows[0] || null;
}

/** Public API: single post by slug for ranjan / pousali surfaces (not main blog feed). */
export async function getPublishedPostBySlugForSubdomain(slug, subdomain) {
  const s = String(subdomain || "").toLowerCase();
  if (s === "ranjan") {
    const { rows } = await sql`
      SELECT * FROM posts
      WHERE slug = ${slug} AND status = 'published' AND publish_to_ranjan = true
      LIMIT 1
    `;
    return rows[0] || null;
  }
  if (s === "pousali") {
    const { rows } = await sql`
      SELECT * FROM posts
      WHERE slug = ${slug} AND status = 'published' AND publish_to_pousali = true
      LIMIT 1
    `;
    return rows[0] || null;
  }
  return getPublishedPostBySlug(slug);
}

export async function slugExists(slug) {
  const { rows } = await sql`SELECT 1 FROM posts WHERE slug = ${slug} LIMIT 1`;
  return (rows || []).length > 0;
}

export async function getPostBySlugAdmin(authorEmail, slug) {
  const { rows } = await sql`
    SELECT * FROM posts WHERE slug = ${slug} AND author_email = ${authorEmail} LIMIT 1
  `;
  const row = rows[0];
  if (!row) return null;
  return mapPostRow(row, authorEmail);
}

export async function listMedia(authorEmail) {
  const { rows } = await sql`
    SELECT * FROM media WHERE uploaded_by = ${authorEmail}
    ORDER BY created_at DESC NULLS LAST
  `;
  return rows || [];
}

export async function insertMediaRow(authorEmail, row) {
  const { rows } = await sql`
    INSERT INTO media (filename, url, alt_text, width, height, size_bytes, uploaded_by)
    VALUES (
      ${row.filename ?? null},
      ${row.url},
      ${row.alt_text ?? null},
      ${row.width ?? null},
      ${row.height ?? null},
      ${row.size_bytes ?? null},
      ${authorEmail}
    )
    RETURNING id
  `;
  return rows[0].id;
}

export async function deleteMediaRow(authorEmail, id) {
  const { rows } = await sql`
    DELETE FROM media WHERE id = ${id}::uuid AND uploaded_by = ${authorEmail} RETURNING id
  `;
  return rows.length > 0;
}

export async function listAdSlots() {
  const { rows } = await sql`
    SELECT * FROM ad_slots ORDER BY created_at DESC NULLS LAST
  `;
  return rows || [];
}

export async function insertAdSlot(row) {
  const { rows } = await sql`
    INSERT INTO ad_slots (name, placement, ad_code, active)
    VALUES (${row.name}, ${row.placement}, ${row.ad_code}, ${row.active !== false})
    RETURNING id
  `;
  return rows[0].id;
}

export async function updateAdSlot(id, patch) {
  const { rows: ex } = await sql`SELECT * FROM ad_slots WHERE id = ${id}::uuid LIMIT 1`;
  const e = ex[0];
  if (!e) return false;
  const name = patch.name !== undefined ? patch.name : e.name;
  const placement = patch.placement !== undefined ? patch.placement : e.placement;
  const ad_code = patch.ad_code !== undefined ? patch.ad_code : e.ad_code;
  const active = patch.active !== undefined ? patch.active : e.active;
  const { rows } = await sql`
    UPDATE ad_slots SET name = ${name}, placement = ${placement}, ad_code = ${ad_code}, active = ${active}
    WHERE id = ${id}::uuid
    RETURNING id
  `;
  return rows.length > 0;
}

export async function deleteAdSlot(id) {
  const { rows } = await sql`DELETE FROM ad_slots WHERE id = ${id}::uuid RETURNING id`;
  return rows.length > 0;
}

export async function listSocialSyncs(authorEmail, limit = 100) {
  const { rows } = await sql`
    SELECT s.*, p.title AS post_title FROM social_syncs s
    INNER JOIN posts p ON p.id = s.post_id
    WHERE p.author_email = ${authorEmail}
    ORDER BY s.created_at DESC NULLS LAST
    LIMIT ${limit}
  `;
  return (rows || []).map((r) => ({
    ...r,
    post_title: r.post_title || "—",
  }));
}

/** Stub / future real cross-post — logs intent in social_syncs */
export async function insertSocialSync(postId, platform, { status = "stub", platformPostId = null, errorMessage = null } = {}) {
  await sql`
    INSERT INTO social_syncs (post_id, platform, status, platform_post_id, published_at, error_message)
    VALUES (
      ${postId}::uuid,
      ${platform},
      ${status},
      ${platformPostId},
      ${status === "published" ? new Date().toISOString() : null},
      ${errorMessage}
    )
  `;
}

/** One stub row per post+platform (avoids duplicates on re-publish). */
export async function ensureSocialSyncStub(postId, platform, message = "Cross-post not yet wired to OAuth APIs (logged for dashboard).") {
  const { rows } = await sql`
    SELECT id FROM social_syncs WHERE post_id = ${postId}::uuid AND platform = ${platform} LIMIT 1
  `;
  if (rows?.length) return false;
  await insertSocialSync(postId, platform, { status: "stub", errorMessage: message });
  return true;
}

export async function listPublishedCategories() {
  const { rows } = await sql`
    SELECT category, COUNT(*)::int AS count
    FROM posts
    WHERE status = 'published' AND publish_to_blog = true
      AND category IS NOT NULL AND TRIM(category) <> ''
    GROUP BY category
    ORDER BY count DESC, category ASC
  `;
  return rows || [];
}

export async function insertSubscriber(email, source) {
  const em = email.toLowerCase().trim();
  await sql`
    INSERT INTO subscribers (email, status, source)
    VALUES (${em}, 'active', ${source || "footer"})
    ON CONFLICT (email) DO NOTHING
  `;
  return true;
}

export async function listSubscribers({ status } = {}) {
  if (status) {
    const { rows } = await sql`
      SELECT * FROM subscribers WHERE status = ${status}
      ORDER BY created_at DESC NULLS LAST
    `;
    return rows || [];
  }
  const { rows } = await sql`
    SELECT * FROM subscribers ORDER BY created_at DESC NULLS LAST
  `;
  return rows || [];
}

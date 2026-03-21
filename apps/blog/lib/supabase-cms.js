/**
 * Supabase CMS data layer (posts, profiles, stats, media metadata).
 * Requires RLS-friendly authenticated Supabase client from Route Handlers / Server Components.
 */

import { slugify } from "./db.js";

function wordsToReadTime(content) {
  const words = String(content || "")
    .split(/\s+/)
    .filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 220));
}

/** Map DB row to API shape expected by admin UI (overlaps with legacy SQLite post). */
export function mapPostRow(row, author) {
  if (!row) return null;
  const published =
    row.published_at ||
    (row.status === "published" ? row.updated_at : null);
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    subtitle: row.subtitle,
    content: row.content,
    excerpt: row.excerpt,
    cover_image: row.cover_image,
    category: row.category,
    tags: row.tags || [],
    status: row.status,
    author_id: row.author_id,
    author: author?.full_name || author?.username || "—",
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
    // legacy-shaped fields for older components
    source: "AdsGupta",
    external_url: "",
    publish_date: published ? String(published).slice(0, 10) : null,
    reading_time: row.read_time_minutes,
    meta: { title: row.title, date: published },
  };
}

export async function getProfile(supabase, userId) {
  const { data, error } = await supabase.from("profiles").select("*").eq("id", userId).maybeSingle();
  if (error) throw error;
  return data;
}

/** Distribution defaults from profiles.subdomain for new posts. */
export function distributionDefaultsFromProfile(profile) {
  const s = profile?.subdomain;
  return {
    publish_to_blog: true,
    publish_to_ranjan: s === "ranjan" || s === "both",
    publish_to_pousali: s === "pousali" || s === "both",
  };
}

export async function getDashboardStats(supabase, userId) {
  const { data: posts, error } = await supabase
    .from("posts")
    .select("id, status")
    .eq("author_id", userId);
  if (error) throw error;
  const list = posts || [];
  const total = list.length;
  const published = list.filter((p) => p.status === "published").length;
  const drafts = list.filter((p) => p.status === "draft").length;
  const scheduled = list.filter((p) => p.status === "scheduled").length;
  const archived = list.filter((p) => p.status === "archived").length;

  let viewCount = 0;
  const ids = list.map((p) => p.id);
  if (ids.length > 0) {
    const { count } = await supabase
      .from("analytics_events")
      .select("*", { count: "exact", head: true })
      .eq("event_type", "view")
      .in("post_id", ids);
    viewCount = count ?? 0;
  }

  let subCount = 0;
  const { count: sc } = await supabase
    .from("subscribers")
    .select("*", { count: "exact", head: true })
    .eq("status", "active");
  subCount = sc ?? 0;

  return {
    total_posts: total,
    published,
    drafts,
    scheduled,
    archived,
    views: viewCount,
    subscribers: subCount,
    revenue_cents: 0,
  };
}

export async function listRecentPosts(supabase, userId, limit = 8) {
  const { data, error } = await supabase
    .from("posts")
    .select("*")
    .eq("author_id", userId)
    .order("updated_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data || [];
}

export async function listPostsForAdmin(supabase, userId, opts = {}) {
  const { status, q } = opts;
  let qy = supabase.from("posts").select("*").eq("author_id", userId).order("updated_at", { ascending: false });
  if (status && status !== "all") {
    qy = qy.eq("status", status);
  }
  if (q && String(q).trim()) {
    const qq = String(q).trim();
    qy = qy.ilike("title", `%${qq}%`);
  }
  const { data, error } = await qy;
  if (error) throw error;
  const rows = data || [];
  const author = await getProfile(supabase, userId);
  return rows.map((row) => mapPostRow(row, author));
}

export async function getPostById(supabase, userId, id) {
  const { data, error } = await supabase.from("posts").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  if (!data || data.author_id !== userId) return null;
  const author = await getProfile(supabase, data.author_id);
  return mapPostRow(data, author);
}

export async function getPostBySlugAdmin(supabase, userId, slug) {
  const { data, error } = await supabase.from("posts").select("*").eq("slug", slug).maybeSingle();
  if (error) throw error;
  if (!data || data.author_id !== userId) return null;
  const author = await getProfile(supabase, data.author_id);
  return mapPostRow(data, author);
}

function buildInsertPayload(body, authorId, defaults) {
  const slug = body.slug?.trim() || slugify(body.title || "post");
  const content = body.content ?? "";
  const readTime = body.read_time_minutes ?? wordsToReadTime(content);
  const dist = defaults || {};
  const st = body.status || "draft";
  return {
    slug,
    title: body.title?.trim() || "Untitled",
    subtitle: body.subtitle || null,
    content,
    excerpt: body.excerpt || null,
    cover_image: body.cover_image || null,
    category: body.category || null,
    tags: Array.isArray(body.tags) ? body.tags : typeof body.tags === "string" ? body.tags.split(",").map((t) => t.trim()).filter(Boolean) : [],
    status: st,
    author_id: authorId,
    seo_title: body.seo_title || null,
    seo_description: body.seo_description || null,
    og_image: body.og_image || null,
    read_time_minutes: readTime,
    featured: !!body.featured,
    scheduled_at: body.scheduled_at || null,
    published_at:
      st === "published" ? body.published_at || new Date().toISOString() : body.published_at || null,
    publish_to_blog: body.publish_to_blog ?? dist.publish_to_blog ?? true,
    publish_to_ranjan: body.publish_to_ranjan ?? dist.publish_to_ranjan ?? false,
    publish_to_pousali: body.publish_to_pousali ?? dist.publish_to_pousali ?? false,
    crosspost_linkedin: !!body.crosspost_linkedin,
    crosspost_instagram: !!body.crosspost_instagram,
    crosspost_facebook: !!body.crosspost_facebook,
    crosspost_twitter: !!body.crosspost_twitter,
  };
}

export async function createPost(supabase, userId, body, profile) {
  const defaults = distributionDefaultsFromProfile(profile);
  const payload = buildInsertPayload(body, userId, {
    publish_to_blog: body.publish_to_blog ?? defaults.publish_to_blog,
    publish_to_ranjan: body.publish_to_ranjan ?? defaults.publish_to_ranjan,
    publish_to_pousali: body.publish_to_pousali ?? defaults.publish_to_pousali,
  });
  const { data, error } = await supabase.from("posts").insert(payload).select("id").single();
  if (error) throw error;
  return data.id;
}

export async function updatePost(supabase, userId, id, body) {
  const existing = await getPostById(supabase, userId, id);
  if (!existing) return null;
  const content = body.content ?? existing.content;
  const readTime = body.read_time_minutes ?? wordsToReadTime(content);
  const patch = {
    title: body.title ?? existing.title,
    subtitle: body.subtitle ?? existing.subtitle,
    slug: body.slug?.trim() || existing.slug,
    content,
    excerpt: body.excerpt ?? existing.excerpt,
    cover_image: body.cover_image ?? existing.cover_image,
    category: body.category ?? existing.category,
    tags: Array.isArray(body.tags) ? body.tags : existing.tags,
    status: body.status ?? existing.status,
    seo_title: body.seo_title ?? existing.seo_title,
    seo_description: body.seo_description ?? existing.seo_description,
    og_image: body.og_image ?? existing.og_image,
    read_time_minutes: readTime,
    featured: body.featured ?? existing.featured,
    scheduled_at: body.scheduled_at !== undefined ? body.scheduled_at : existing.scheduled_at,
    published_at:
      (body.status ?? existing.status) === "published"
        ? body.published_at || existing.published_at || new Date().toISOString()
        : body.published_at !== undefined
          ? body.published_at
          : existing.published_at,
    publish_to_blog: body.publish_to_blog ?? existing.publish_to_blog,
    publish_to_ranjan: body.publish_to_ranjan ?? existing.publish_to_ranjan,
    publish_to_pousali: body.publish_to_pousali ?? existing.publish_to_pousali,
    crosspost_linkedin: body.crosspost_linkedin ?? existing.crosspost_linkedin,
    crosspost_instagram: body.crosspost_instagram ?? existing.crosspost_instagram,
    crosspost_facebook: body.crosspost_facebook ?? existing.crosspost_facebook,
    crosspost_twitter: body.crosspost_twitter ?? existing.crosspost_twitter,
  };
  const { error } = await supabase.from("posts").update(patch).eq("id", id).eq("author_id", userId);
  if (error) throw error;
  return true;
}

export async function deletePost(supabase, userId, id) {
  const { error, count } = await supabase.from("posts").delete({ count: "exact" }).eq("id", id).eq("author_id", userId);
  if (error) throw error;
  return (count ?? 0) > 0;
}

export async function duplicatePost(supabase, userId, id) {
  const row = await getPostById(supabase, userId, id);
  if (!row) return null;
  const profile = await getProfile(supabase, userId);
  const newSlug = `${row.slug}-copy-${Date.now().toString(36)}`.slice(0, 120);
  return createPost(
    supabase,
    userId,
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
    profile
  );
}

export async function bulkSetStatus(supabase, userId, ids, status) {
  if (!ids?.length) return 0;
  const { data, error } = await supabase
    .from("posts")
    .update({
      status,
      published_at: status === "published" ? new Date().toISOString() : null,
    })
    .in("id", ids)
    .eq("author_id", userId)
    .select("id");
  if (error) throw error;
  return data?.length ?? 0;
}

export async function bulkDelete(supabase, userId, ids) {
  if (!ids?.length) return 0;
  const { error, count } = await supabase.from("posts").delete({ count: "exact" }).in("id", ids).eq("author_id", userId);
  if (error) throw error;
  return count ?? 0;
}

/** Public: posts for main blog */
export async function listPublishedBlogPosts(supabase, { limit = 50, offset = 0 } = {}) {
  const { data, error } = await supabase
    .from("posts")
    .select("*")
    .eq("status", "published")
    .eq("publish_to_blog", true)
    .order("published_at", { ascending: false })
    .range(offset, offset + limit - 1);
  if (error) throw error;
  return data || [];
}

export async function listPostsBySubdomain(supabase, subdomain, { limit = 50, offset = 0 } = {}) {
  const col = subdomain === "ranjan" ? "publish_to_ranjan" : subdomain === "pousali" ? "publish_to_pousali" : null;
  if (!col) return [];
  const { data, error } = await supabase
    .from("posts")
    .select("*")
    .eq("status", "published")
    .eq(col, true)
    .order("published_at", { ascending: false })
    .range(offset, offset + limit - 1);
  if (error) throw error;
  return data || [];
}

export async function searchPublishedPosts(supabase, query, { limit = 30 } = {}) {
  const qq = String(query).trim();
  if (!qq) return [];
  const { data, error } = await supabase
    .from("posts")
    .select("slug, title, excerpt, category, published_at")
    .eq("status", "published")
    .eq("publish_to_blog", true)
    .or(`title.ilike.%${qq}%,excerpt.ilike.%${qq}%`)
    .limit(limit);
  if (error) throw error;
  return data || [];
}

export async function getPublishedPostBySlug(supabase, slug) {
  const { data, error } = await supabase
    .from("posts")
    .select("*")
    .eq("slug", slug)
    .eq("status", "published")
    .eq("publish_to_blog", true)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function listMedia(supabase, userId) {
  const { data, error } = await supabase
    .from("media")
    .select("*")
    .eq("uploaded_by", userId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function insertMediaRow(supabase, userId, row) {
  const { data, error } = await supabase
    .from("media")
    .insert({
      ...row,
      uploaded_by: userId,
    })
    .select("id")
    .single();
  if (error) throw error;
  return data.id;
}

export async function deleteMediaRow(supabase, userId, id) {
  const { error } = await supabase.from("media").delete().eq("id", id).eq("uploaded_by", userId);
  if (error) throw error;
  return true;
}

export async function listAdSlots(supabase) {
  const { data, error } = await supabase.from("ad_slots").select("*").order("created_at", { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function insertAdSlot(supabase, row) {
  const { data, error } = await supabase.from("ad_slots").insert(row).select("id").single();
  if (error) throw error;
  return data.id;
}

export async function updateAdSlot(supabase, id, patch) {
  const clean = Object.fromEntries(Object.entries(patch).filter(([, v]) => v !== undefined));
  const { error } = await supabase.from("ad_slots").update(clean).eq("id", id);
  if (error) throw error;
  return true;
}

export async function deleteAdSlot(supabase, id) {
  const { error } = await supabase.from("ad_slots").delete().eq("id", id);
  if (error) throw error;
  return true;
}

export async function listSocialSyncs(supabase, userId, limit = 100) {
  const { data: posts } = await supabase.from("posts").select("id, title").eq("author_id", userId);
  const ids = (posts || []).map((p) => p.id);
  if (!ids.length) return [];
  const { data, error } = await supabase
    .from("social_syncs")
    .select("*")
    .in("post_id", ids)
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  const titleById = Object.fromEntries((posts || []).map((p) => [p.id, p.title]));
  return (data || []).map((r) => ({ ...r, post_title: titleById[r.post_id] || "—" }));
}

export async function insertSubscriber(supabase, email, source) {
  const { error } = await supabase.from("subscribers").insert({
    email: email.toLowerCase().trim(),
    status: "active",
    source: source || "footer",
  });
  if (error) {
    const msg = String(error.message || "").toLowerCase();
    if (msg.includes("duplicate") || msg.includes("unique")) return true;
    throw error;
  }
  return true;
}

export async function listSubscribers(supabase, { status } = {}) {
  let q = supabase.from("subscribers").select("*").order("created_at", { ascending: false });
  if (status) q = q.eq("status", status);
  const { data, error } = await q;
  if (error) throw error;
  return data || [];
}

import { sql } from "./db.js";

/**
 * Creates CMS tables on Neon Postgres (run via GET /api/db-init or `node scripts/init-db.js`).
 */
export async function createTables() {
  await sql`
    CREATE TABLE IF NOT EXISTS posts (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      slug TEXT UNIQUE NOT NULL,
      title TEXT NOT NULL,
      subtitle TEXT,
      content TEXT,
      excerpt TEXT,
      cover_image TEXT,
      category TEXT,
      tags TEXT[] DEFAULT ARRAY[]::TEXT[],
      status TEXT DEFAULT 'draft',
      author_email TEXT,
      author_name TEXT,
      seo_title TEXT,
      seo_description TEXT,
      og_image TEXT,
      read_time_minutes INT,
      featured BOOLEAN DEFAULT FALSE,
      scheduled_at TIMESTAMPTZ,
      published_at TIMESTAMPTZ,
      publish_to_blog BOOLEAN DEFAULT TRUE,
      publish_to_ranjan BOOLEAN DEFAULT FALSE,
      publish_to_pousali BOOLEAN DEFAULT FALSE,
      crosspost_linkedin BOOLEAN DEFAULT FALSE,
      crosspost_instagram BOOLEAN DEFAULT FALSE,
      crosspost_facebook BOOLEAN DEFAULT FALSE,
      crosspost_twitter BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS media (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      filename TEXT,
      url TEXT,
      alt_text TEXT,
      width INT,
      height INT,
      size_bytes INT,
      uploaded_by TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS social_syncs (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
      platform TEXT,
      status TEXT DEFAULT 'pending',
      platform_post_id TEXT,
      published_at TIMESTAMPTZ,
      error_message TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS analytics_events (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
      event_type TEXT,
      session_id TEXT,
      referrer TEXT,
      country TEXT,
      device TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS ad_slots (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name TEXT,
      placement TEXT,
      ad_code TEXT,
      active BOOLEAN DEFAULT TRUE,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS subscribers (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      email TEXT UNIQUE NOT NULL,
      status TEXT DEFAULT 'active',
      source TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
  `;

  await sql`CREATE INDEX IF NOT EXISTS idx_posts_slug ON posts(slug);`;
  await sql`CREATE INDEX IF NOT EXISTS idx_posts_status ON posts(status);`;
  await sql`CREATE INDEX IF NOT EXISTS idx_posts_author ON posts(author_email);`;
  await sql`CREATE INDEX IF NOT EXISTS idx_analytics_post ON analytics_events(post_id);`;

  return { ok: true };
}

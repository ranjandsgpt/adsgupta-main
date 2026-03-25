import { sql } from "@/lib/db";

/**
 * Idempotent schema for the exchange. Each statement runs separately (Neon prefers one statement per call).
 */
export async function createTables() {
  try {
    await sql`CREATE EXTENSION IF NOT EXISTS pgcrypto`;

    await sql`
      CREATE TABLE IF NOT EXISTS publishers (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name TEXT NOT NULL,
        domain TEXT NOT NULL,
        contact_email TEXT,
        status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'suspended')),
        created_at TIMESTAMPTZ DEFAULT now()
      )
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS ad_units (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        publisher_id UUID REFERENCES publishers(id) ON DELETE CASCADE,
        name TEXT NOT NULL,
        sizes TEXT[] NOT NULL,
        ad_type TEXT NOT NULL CHECK (ad_type IN ('display', 'video', 'native')),
        environment TEXT NOT NULL CHECK (environment IN ('web', 'app', 'ctv')),
        floor_price NUMERIC(10,4) DEFAULT 0.50,
        status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'archived')),
        created_at TIMESTAMPTZ DEFAULT now()
      )
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS campaigns (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        advertiser_name TEXT NOT NULL,
        advertiser_email TEXT,
        campaign_name TEXT NOT NULL,
        bid_price NUMERIC(10,4) NOT NULL,
        daily_budget NUMERIC(12,2),
        target_sizes TEXT[],
        status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'paused')),
        created_at TIMESTAMPTZ DEFAULT now()
      )
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS creatives (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE,
        name TEXT NOT NULL,
        type TEXT NOT NULL DEFAULT 'banner' CHECK (type IN ('banner')),
        size TEXT NOT NULL,
        image_url TEXT,
        click_url TEXT,
        status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused')),
        created_at TIMESTAMPTZ DEFAULT now()
      )
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS auction_log (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        auction_id TEXT NOT NULL,
        ad_unit_id UUID REFERENCES ad_units(id),
        publisher_id UUID REFERENCES publishers(id),
        winning_campaign_id UUID REFERENCES campaigns(id),
        winning_creative_id UUID REFERENCES creatives(id),
        winning_bid NUMERIC(10,4),
        floor_price NUMERIC(10,4),
        bid_count INTEGER DEFAULT 0,
        cleared BOOLEAN DEFAULT false,
        page_url TEXT,
        created_at TIMESTAMPTZ DEFAULT now()
      )
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS impressions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        auction_id TEXT NOT NULL,
        auction_log_id UUID REFERENCES auction_log(id) ON DELETE SET NULL,
        ad_unit_id UUID REFERENCES ad_units(id),
        campaign_id UUID REFERENCES campaigns(id),
        creative_id UUID REFERENCES creatives(id),
        winning_bid NUMERIC(10,4),
        page_url TEXT,
        created_at TIMESTAMPTZ DEFAULT now()
      )
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS clicks (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        impression_id UUID REFERENCES impressions(id) ON DELETE SET NULL,
        campaign_id UUID REFERENCES campaigns(id),
        click_url TEXT,
        created_at TIMESTAMPTZ DEFAULT now()
      )
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS pricing_rules (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name TEXT NOT NULL,
        floor_cpm NUMERIC(10,4) NOT NULL,
        applies_to_sizes TEXT[],
        applies_to_env TEXT,
        active BOOLEAN DEFAULT true,
        created_at TIMESTAMPTZ DEFAULT now()
      )
    `;

    // ── Migrations from older shapes (safe no-ops if columns missing) ─────────
    await sql`ALTER TABLE publishers ADD COLUMN IF NOT EXISTS ads_txt_verified BOOLEAN DEFAULT false`;
    await sql`ALTER TABLE publishers ADD COLUMN IF NOT EXISTS primary_ad_formats TEXT[]`;

    await sql`ALTER TABLE ad_units DROP CONSTRAINT IF EXISTS ad_units_status_check`;
    await sql`
      ALTER TABLE ad_units ADD CONSTRAINT ad_units_status_check
      CHECK (status IN ('active', 'paused', 'archived'))
    `;

    await sql`ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS name TEXT`;
    await sql`ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS advertiser TEXT`;
    await sql`ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS contact_email TEXT`;
    await sql`ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS budget NUMERIC(12,2)`;
    await sql`ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS target_geos TEXT[]`;
    await sql`ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS target_devices TEXT[]`;
    await sql`ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS target_domains TEXT[]`;
    await sql`ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS target_environments TEXT[]`;
    await sql`ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS start_date DATE`;
    await sql`ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS end_date DATE`;
    await sql`ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS advertiser_name TEXT`;
    await sql`ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS advertiser_email TEXT`;
    await sql`ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS campaign_name TEXT`;

    await sql`
      UPDATE campaigns SET
        advertiser_name = COALESCE(NULLIF(advertiser_name, ''), advertiser, 'Advertiser'),
        advertiser_email = COALESCE(NULLIF(advertiser_email, ''), contact_email),
        campaign_name = COALESCE(NULLIF(campaign_name, ''), name, 'Campaign')
      WHERE advertiser_name IS NULL OR advertiser_name = ''
         OR campaign_name IS NULL OR campaign_name = ''
    `;

    await sql`ALTER TABLE creatives ADD COLUMN IF NOT EXISTS html_snippet TEXT`;
    await sql`ALTER TABLE creatives ADD COLUMN IF NOT EXISTS vast_url TEXT`;
    await sql`ALTER TABLE auction_log ADD COLUMN IF NOT EXISTS user_agent TEXT`;

    await sql`ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS rejection_reason TEXT`;
    await sql`ALTER TABLE campaigns DROP CONSTRAINT IF EXISTS campaigns_status_check`;
    await sql`
      ALTER TABLE campaigns ADD CONSTRAINT campaigns_status_check
      CHECK (status IN ('pending', 'active', 'paused', 'rejected'))
    `;

    await sql`ALTER TABLE pricing_rules ADD COLUMN IF NOT EXISTS rule_type TEXT DEFAULT 'unified'`;

    await sql`UPDATE creatives SET size = '300x250' WHERE size IS NULL OR size = ''`;

    await sql`ALTER TABLE creatives DROP CONSTRAINT IF EXISTS creatives_status_check`;
    await sql`
      ALTER TABLE creatives ADD CONSTRAINT creatives_status_check
      CHECK (status IN ('active', 'paused', 'archived'))
    `;

    await sql`ALTER TABLE impressions ADD COLUMN IF NOT EXISTS auction_log_id UUID REFERENCES auction_log(id) ON DELETE SET NULL`;
    await sql`
      CREATE UNIQUE INDEX IF NOT EXISTS impressions_auction_log_id_uidx
      ON impressions (auction_log_id)
      WHERE auction_log_id IS NOT NULL
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS dsps (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name TEXT NOT NULL,
        endpoint_url TEXT NOT NULL,
        auth_token TEXT,
        bid_timeout_ms INTEGER NOT NULL DEFAULT 150,
        active BOOLEAN NOT NULL DEFAULT true,
        created_at TIMESTAMPTZ DEFAULT now()
      )
    `;

    await sql`ALTER TABLE auction_log ADD COLUMN IF NOT EXISTS demand_source TEXT`;
    await sql`ALTER TABLE auction_log ADD COLUMN IF NOT EXISTS device_ip TEXT`;
    await sql`ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS advertiser_domain TEXT`;
    await sql`ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS iab_cat TEXT[]`;
    await sql`ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS creative_api INTEGER[]`;

    await sql`ALTER TABLE auction_log ADD COLUMN IF NOT EXISTS privacy_suppressed BOOLEAN DEFAULT false`;
    await sql`ALTER TABLE auction_log ADD COLUMN IF NOT EXISTS is_ivt BOOLEAN DEFAULT false`;

    await sql`ALTER TABLE creatives ADD COLUMN IF NOT EXISTS scan_passed BOOLEAN DEFAULT true`;
    await sql`ALTER TABLE creatives ADD COLUMN IF NOT EXISTS scan_issues TEXT[]`;
    await sql`ALTER TABLE creatives ADD COLUMN IF NOT EXISTS scan_warnings TEXT[]`;
    await sql`ALTER TABLE creatives ADD COLUMN IF NOT EXISTS scanned_at TIMESTAMPTZ`;

    await sql`ALTER TABLE creatives DROP CONSTRAINT IF EXISTS creatives_status_check`;
    await sql`
      ALTER TABLE creatives ADD CONSTRAINT creatives_status_check
      CHECK (status IN ('active', 'paused', 'archived', 'flagged', 'approved'))
    `;

    await sql`ALTER TABLE publishers ADD COLUMN IF NOT EXISTS ads_txt_checked_at TIMESTAMPTZ`;
    await sql`ALTER TABLE publishers ADD COLUMN IF NOT EXISTS ads_txt_status TEXT`;

    await sql`
      CREATE TABLE IF NOT EXISTS integration_tests (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        publisher_id UUID REFERENCES publishers(id) ON DELETE SET NULL,
        ad_unit_id UUID REFERENCES ad_units(id) ON DELETE SET NULL,
        test_url TEXT,
        results JSONB,
        created_at TIMESTAMPTZ DEFAULT now()
      )
    `;

    await sql`ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS freq_cap_day INTEGER DEFAULT 0`;
    await sql`ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS freq_cap_session INTEGER DEFAULT 0`;
    await sql`ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS ab_test_active BOOLEAN DEFAULT false`;
    await sql`ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS ab_winner_creative_id UUID REFERENCES creatives(id) ON DELETE SET NULL`;
    await sql`ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS ab_auto_pause_loser BOOLEAN DEFAULT false`;

    await sql`ALTER TABLE creatives ADD COLUMN IF NOT EXISTS ab_group TEXT DEFAULT 'a'`;
    await sql`ALTER TABLE creatives ADD COLUMN IF NOT EXISTS ab_weight INTEGER DEFAULT 50`;

    await sql`ALTER TABLE campaigns DROP CONSTRAINT IF EXISTS campaigns_status_check`;
    await sql`
      ALTER TABLE campaigns ADD CONSTRAINT campaigns_status_check
      CHECK (status IN ('pending', 'active', 'paused', 'rejected', 'draft'))
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS bid_history (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE,
        old_bid NUMERIC(10,4) NOT NULL,
        new_bid NUMERIC(10,4) NOT NULL,
        reason TEXT,
        created_at TIMESTAMPTZ DEFAULT now()
      )
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS retargeting_events (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        publisher_id UUID REFERENCES publishers(id) ON DELETE CASCADE,
        page_url TEXT,
        session_id TEXT,
        created_at TIMESTAMPTZ DEFAULT now()
      )
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS admin_activity_log (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        admin_email TEXT NOT NULL,
        action_type TEXT NOT NULL,
        entity_type TEXT NOT NULL,
        entity_id TEXT,
        old_value TEXT,
        new_value TEXT,
        created_at TIMESTAMPTZ DEFAULT now()
      )
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS admin_notifications (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        type TEXT NOT NULL,
        message TEXT NOT NULL,
        entity_type TEXT,
        entity_id TEXT,
        read BOOLEAN DEFAULT false,
        created_at TIMESTAMPTZ DEFAULT now()
      )
    `;
  } catch (e) {
    console.error("[db-init] createTables failed:", e);
    throw e;
  }
}

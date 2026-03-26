import { sql } from "@/lib/db";

/**
 * Idempotent schema for the exchange. Each statement runs separately (Neon prefers one statement per call).
 * @returns Count of `public` base tables after migrations (for GET /api/db-init `tablesCreated`).
 */
export async function createTables(): Promise<number> {
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
        target_geos TEXT[],
        target_devices TEXT[],
        target_environments TEXT[],
        target_domains TEXT[],
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
        size TEXT NOT NULL DEFAULT '300x250',
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
        country TEXT,
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
    await sql`ALTER TABLE publishers ADD COLUMN IF NOT EXISTS primary_ad_formats TEXT[] DEFAULT '{}'`;
    await sql`ALTER TABLE publishers ADD COLUMN IF NOT EXISTS auction_type TEXT DEFAULT 'first_price'`;

    await sql`ALTER TABLE ad_units DROP CONSTRAINT IF EXISTS ad_units_status_check`;
    await sql`
      ALTER TABLE ad_units ADD CONSTRAINT ad_units_status_check
      CHECK (status IN ('active', 'paused', 'archived'))
    `;
    await sql`ALTER TABLE ad_units ADD COLUMN IF NOT EXISTS auction_type TEXT DEFAULT 'first_price'`;

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
    await sql`ALTER TABLE creatives ALTER COLUMN size SET DEFAULT '300x250'`;

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
    // Required contract: unique index with this exact name.
    await sql`
      CREATE UNIQUE INDEX IF NOT EXISTS impressions_auction_log_id_idx
      ON impressions (auction_log_id)
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

    await sql`ALTER TABLE auction_log ADD COLUMN IF NOT EXISTS demand_source TEXT DEFAULT 'internal'`;
    await sql`ALTER TABLE auction_log ALTER COLUMN demand_source SET DEFAULT 'internal'`;
    await sql`ALTER TABLE auction_log ADD COLUMN IF NOT EXISTS device_ip TEXT`;
    await sql`ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS advertiser_domain TEXT`;
    await sql`ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS iab_cat TEXT[]`;
    await sql`ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS creative_api INTEGER[]`;

    await sql`ALTER TABLE auction_log ADD COLUMN IF NOT EXISTS privacy_suppressed BOOLEAN DEFAULT false`;
    await sql`ALTER TABLE auction_log ADD COLUMN IF NOT EXISTS is_ivt BOOLEAN DEFAULT false`;
    await sql`ALTER TABLE auction_log ALTER COLUMN privacy_suppressed SET DEFAULT false`;
    await sql`ALTER TABLE auction_log ALTER COLUMN is_ivt SET DEFAULT false`;

    await sql`ALTER TABLE creatives ADD COLUMN IF NOT EXISTS scan_passed BOOLEAN DEFAULT true`;
    await sql`ALTER TABLE creatives ADD COLUMN IF NOT EXISTS scan_issues TEXT[]`;
    await sql`ALTER TABLE creatives ADD COLUMN IF NOT EXISTS scan_warnings TEXT[]`;
    await sql`ALTER TABLE creatives ADD COLUMN IF NOT EXISTS scanned_at TIMESTAMPTZ`;
    await sql`ALTER TABLE creatives ALTER COLUMN scan_passed SET DEFAULT true`;

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
    await sql`ALTER TABLE campaigns ALTER COLUMN freq_cap_day SET DEFAULT 0`;
    await sql`ALTER TABLE campaigns ALTER COLUMN freq_cap_session SET DEFAULT 0`;
    await sql`ALTER TABLE campaigns ALTER COLUMN ab_test_active SET DEFAULT false`;
    await sql`ALTER TABLE campaigns ALTER COLUMN ab_auto_pause_loser SET DEFAULT false`;

    await sql`ALTER TABLE creatives ADD COLUMN IF NOT EXISTS ab_group TEXT DEFAULT 'a'`;
    await sql`ALTER TABLE creatives ADD COLUMN IF NOT EXISTS ab_weight INTEGER DEFAULT 50`;
    await sql`ALTER TABLE creatives ALTER COLUMN ab_group SET DEFAULT 'a'`;
    await sql`ALTER TABLE creatives ALTER COLUMN ab_weight SET DEFAULT 50`;

    await sql`ALTER TABLE campaigns DROP CONSTRAINT IF EXISTS campaigns_status_check`;
    await sql`
      ALTER TABLE campaigns ADD CONSTRAINT campaigns_status_check
      CHECK (status IN ('pending', 'active', 'paused', 'rejected', 'draft'))
    `;
    await sql`ALTER TABLE campaigns ALTER COLUMN status SET DEFAULT 'pending'`;
    await sql`ALTER TABLE creatives ALTER COLUMN status SET DEFAULT 'active'`;
    await sql`ALTER TABLE publishers ALTER COLUMN status SET DEFAULT 'pending'`;

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

    /* Signal layer — idempotent extensions (SYSTEM 1) */
    await sql`ALTER TABLE auction_log ADD COLUMN IF NOT EXISTS raw_signals JSONB`;

    await sql`
      CREATE TABLE IF NOT EXISTS signal_events (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        session_id TEXT,
        user_id TEXT,
        publisher_id UUID REFERENCES publishers(id) ON DELETE SET NULL,
        ad_unit_id UUID REFERENCES ad_units(id) ON DELETE SET NULL,
        event_type TEXT NOT NULL,
        url TEXT,
        referrer TEXT,
        country TEXT,
        region TEXT,
        city TEXT,
        device_type TEXT,
        os TEXT,
        browser TEXT,
        connection_type TEXT,
        iab_categories TEXT[],
        above_fold BOOLEAN,
        scroll_depth INTEGER,
        time_on_page INTEGER,
        session_page_count INTEGER,
        days_since_first_visit INTEGER,
        is_new_user BOOLEAN,
        timezone TEXT,
        screen_width INTEGER,
        screen_height INTEGER,
        device_pixel_ratio NUMERIC(5, 2),
        is_mobile BOOLEAN,
        is_proxy BOOLEAN,
        is_datacenter BOOLEAN,
        consent_given BOOLEAN,
        raw_signals JSONB,
        auction_id TEXT REFERENCES auction_log(auction_id) ON DELETE SET NULL,
        created_at TIMESTAMPTZ DEFAULT now()
      )
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS user_profiles (
        user_id TEXT PRIMARY KEY,
        first_seen TIMESTAMPTZ DEFAULT now(),
        last_seen TIMESTAMPTZ DEFAULT now(),
        total_page_views INTEGER DEFAULT 0,
        total_sessions INTEGER DEFAULT 0,
        total_impressions INTEGER DEFAULT 0,
        total_clicks INTEGER DEFAULT 0,
        countries TEXT[],
        cities TEXT[],
        devices TEXT[],
        browsers TEXT[],
        iab_interests TEXT[],
        iab_frequencies JSONB,
        publisher_ids TEXT[],
        recency_days INTEGER,
        frequency_7d INTEGER,
        frequency_30d INTEGER,
        audience_segments TEXT[],
        raw_profile JSONB
      )
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS audience_segments (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name TEXT NOT NULL,
        description TEXT,
        type TEXT NOT NULL,
        rules JSONB NOT NULL,
        user_count INTEGER DEFAULT 0,
        publisher_id UUID REFERENCES publishers(id) ON DELETE SET NULL,
        is_public BOOLEAN DEFAULT false,
        estimated_cpm_uplift NUMERIC(5, 2),
        status TEXT DEFAULT 'active',
        created_at TIMESTAMPTZ DEFAULT now()
      )
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS segment_memberships (
        user_id TEXT NOT NULL,
        segment_id UUID NOT NULL REFERENCES audience_segments(id) ON DELETE CASCADE,
        added_at TIMESTAMPTZ DEFAULT now(),
        expires_at TIMESTAMPTZ,
        score NUMERIC(5, 2),
        PRIMARY KEY (user_id, segment_id)
      )
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS conversion_events (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id TEXT,
        session_id TEXT,
        campaign_id UUID REFERENCES campaigns(id) ON DELETE SET NULL,
        creative_id UUID REFERENCES creatives(id) ON DELETE SET NULL,
        impression_id UUID REFERENCES impressions(id) ON DELETE SET NULL,
        click_id UUID REFERENCES clicks(id) ON DELETE SET NULL,
        conversion_type TEXT,
        conversion_value NUMERIC(10, 2),
        currency TEXT DEFAULT 'USD',
        time_to_convert_minutes INTEGER,
        attribution_window_days INTEGER DEFAULT 30,
        attributed_to_impression BOOLEAN,
        attributed_to_click BOOLEAN,
        raw_data JSONB,
        created_at TIMESTAMPTZ DEFAULT now()
      )
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS attribution_touchpoints (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        conversion_id UUID REFERENCES conversion_events(id) ON DELETE CASCADE,
        touchpoint_type TEXT,
        impression_id UUID,
        click_id UUID,
        campaign_id UUID,
        creative_id UUID,
        position INTEGER,
        is_first_touch BOOLEAN DEFAULT false,
        is_last_touch BOOLEAN DEFAULT false,
        time_before_conversion_hours NUMERIC(10, 2),
        attribution_weight NUMERIC(5, 4),
        created_at TIMESTAMPTZ DEFAULT now()
      )
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS pixel_events (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        pixel_id TEXT NOT NULL,
        campaign_id UUID REFERENCES campaigns(id) ON DELETE SET NULL,
        user_id TEXT,
        session_id TEXT,
        event_type TEXT,
        url TEXT,
        event_value NUMERIC(10, 2),
        raw_data JSONB,
        created_at TIMESTAMPTZ DEFAULT now()
      )
    `;

    /* ── Backend wiring pass: columns + tables for stats, signals, rollups ───── */
    await sql`ALTER TABLE signal_events DROP CONSTRAINT IF EXISTS signal_events_auction_id_fkey`;

    await sql`ALTER TABLE auction_log ADD COLUMN IF NOT EXISTS region TEXT`;
    await sql`ALTER TABLE auction_log ADD COLUMN IF NOT EXISTS device_type TEXT`;
    await sql`ALTER TABLE auction_log ADD COLUMN IF NOT EXISTS iab_categories TEXT[]`;
    await sql`ALTER TABLE auction_log ADD COLUMN IF NOT EXISTS above_fold BOOLEAN`;
    await sql`ALTER TABLE auction_log ADD COLUMN IF NOT EXISTS processing_ms NUMERIC(8,2)`;

    await sql`ALTER TABLE impressions ADD COLUMN IF NOT EXISTS user_id TEXT`;
    await sql`ALTER TABLE impressions ADD COLUMN IF NOT EXISTS session_id TEXT`;
    await sql`ALTER TABLE impressions ADD COLUMN IF NOT EXISTS page_url TEXT`;
    await sql`ALTER TABLE impressions ADD COLUMN IF NOT EXISTS country TEXT`;
    await sql`ALTER TABLE impressions ADD COLUMN IF NOT EXISTS device_type TEXT`;

    await sql`ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS impressions_today INTEGER DEFAULT 0`;
    await sql`ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS spend_today NUMERIC(10,4) DEFAULT 0`;
    await sql`ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS total_impressions INTEGER DEFAULT 0`;
    await sql`ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS total_spend NUMERIC(12,4) DEFAULT 0`;
    await sql`ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS win_rate_7d NUMERIC(5,2)`;
    await sql`ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS last_impression_at TIMESTAMPTZ`;
    await sql`ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS audience_targeting JSONB DEFAULT '{}'::jsonb`;
    await sql`ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS content_targeting JSONB DEFAULT '{}'::jsonb`;
    await sql`ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS temporal_targeting JSONB DEFAULT '{}'::jsonb`;

    await sql`ALTER TABLE creatives ADD COLUMN IF NOT EXISTS impressions INTEGER DEFAULT 0`;
    await sql`ALTER TABLE creatives ADD COLUMN IF NOT EXISTS clicks INTEGER DEFAULT 0`;
    await sql`ALTER TABLE creatives ADD COLUMN IF NOT EXISTS last_served_at TIMESTAMPTZ`;

    await sql`ALTER TABLE ad_units ADD COLUMN IF NOT EXISTS impressions_today INTEGER DEFAULT 0`;
    await sql`ALTER TABLE ad_units ADD COLUMN IF NOT EXISTS revenue_today NUMERIC(10,4) DEFAULT 0`;
    await sql`ALTER TABLE ad_units ADD COLUMN IF NOT EXISTS fill_rate_7d NUMERIC(5,2)`;

    await sql`ALTER TABLE publishers ADD COLUMN IF NOT EXISTS impressions_today INTEGER DEFAULT 0`;
    await sql`ALTER TABLE publishers ADD COLUMN IF NOT EXISTS revenue_today NUMERIC(10,4) DEFAULT 0`;
    await sql`ALTER TABLE publishers ADD COLUMN IF NOT EXISTS total_revenue NUMERIC(12,4) DEFAULT 0`;
    await sql`ALTER TABLE publishers ADD COLUMN IF NOT EXISTS health_score INTEGER DEFAULT 0`;

    await sql`ALTER TABLE campaigns DROP CONSTRAINT IF EXISTS campaigns_status_check`;
    await sql`
      ALTER TABLE campaigns ADD CONSTRAINT campaigns_status_check
      CHECK (status IN ('pending', 'active', 'paused', 'rejected', 'draft', 'budget_exhausted'))
    `;

    await sql`ALTER TABLE pricing_rules ADD COLUMN IF NOT EXISTS applies_to_geos TEXT[] DEFAULT '{}'`;
    await sql`ALTER TABLE pricing_rules ADD COLUMN IF NOT EXISTS priority INTEGER DEFAULT 0`;

    await sql`ALTER TABLE audience_segments ALTER COLUMN type SET DEFAULT 'behavioral'`;
    await sql`ALTER TABLE segment_memberships ALTER COLUMN score SET DEFAULT 50`;

    await sql`ALTER TABLE user_profiles ALTER COLUMN iab_frequencies SET DEFAULT '{}'::jsonb`;

    await sql`
      CREATE TABLE IF NOT EXISTS line_items (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE,
        name TEXT NOT NULL,
        type TEXT NOT NULL DEFAULT 'standard',
        priority INTEGER DEFAULT 8,
        status TEXT DEFAULT 'draft',
        cost_type TEXT DEFAULT 'cpm',
        rate NUMERIC(10,4) NOT NULL,
        daily_budget NUMERIC(10,2),
        lifetime_budget NUMERIC(12,2),
        daily_impression_goal INTEGER,
        delivery_type TEXT DEFAULT 'even',
        start_date TIMESTAMPTZ,
        end_date TIMESTAMPTZ,
        freq_cap_impressions INTEGER DEFAULT 0,
        freq_cap_time_unit TEXT DEFAULT 'day',
        geo_targeting JSONB DEFAULT '{}'::jsonb,
        device_targeting JSONB DEFAULT '{}'::jsonb,
        audience_targeting JSONB DEFAULT '{}'::jsonb,
        content_targeting JSONB DEFAULT '{}'::jsonb,
        temporal_targeting JSONB DEFAULT '{}'::jsonb,
        custom_targeting JSONB DEFAULT '{}'::jsonb,
        viewability_threshold INTEGER DEFAULT 0,
        creative_rotation TEXT DEFAULT 'optimized',
        impressions_served INTEGER DEFAULT 0,
        spend_so_far NUMERIC(12,4) DEFAULT 0,
        created_at TIMESTAMPTZ DEFAULT now()
      )
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS deals (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        deal_id TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL,
        type TEXT NOT NULL DEFAULT 'private_auction',
        status TEXT DEFAULT 'pending',
        publisher_id UUID REFERENCES publishers(id),
        buyer_email TEXT,
        buyer_dsp TEXT,
        ad_unit_ids UUID[] DEFAULT '{}',
        sizes TEXT[] DEFAULT '{}',
        floor_cpm NUMERIC(10,4),
        fixed_cpm NUMERIC(10,4),
        currency TEXT DEFAULT 'USD',
        daily_impression_goal INTEGER,
        impressions_delivered INTEGER DEFAULT 0,
        spend_delivered NUMERIC(12,4) DEFAULT 0,
        start_date DATE,
        end_date DATE,
        priority INTEGER DEFAULT 5,
        bid_count_24h INTEGER DEFAULT 0,
        win_count_24h INTEGER DEFAULT 0,
        last_bid_at TIMESTAMPTZ,
        created_at TIMESTAMPTZ DEFAULT now()
      )
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS dsp_partners (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name TEXT NOT NULL,
        endpoint_url TEXT NOT NULL,
        timeout_ms INTEGER DEFAULT 150,
        qps_limit INTEGER DEFAULT 500,
        status TEXT DEFAULT 'active',
        auth_type TEXT DEFAULT 'none',
        auth_credentials JSONB DEFAULT '{}'::jsonb,
        bid_adjustments JSONB DEFAULT '{}'::jsonb,
        allowed_ad_types TEXT[] DEFAULT '{banner}',
        max_bid_cpm NUMERIC(10,4) DEFAULT 50,
        total_bids_7d INTEGER DEFAULT 0,
        total_wins_7d INTEGER DEFAULT 0,
        total_revenue_7d NUMERIC(12,4) DEFAULT 0,
        avg_latency_ms INTEGER DEFAULT 0,
        timeout_rate_7d NUMERIC(5,2) DEFAULT 0,
        created_at TIMESTAMPTZ DEFAULT now()
      )
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS api_keys (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name TEXT NOT NULL,
        key_hash TEXT NOT NULL UNIQUE,
        key_prefix TEXT NOT NULL,
        scopes TEXT[] DEFAULT '{read}',
        rate_limit_per_hour INTEGER DEFAULT 1000,
        requests_today INTEGER DEFAULT 0,
        last_used_at TIMESTAMPTZ,
        expires_at TIMESTAMPTZ,
        created_by TEXT,
        created_at TIMESTAMPTZ DEFAULT now()
      )
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS webhooks (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        url TEXT NOT NULL,
        events TEXT[] NOT NULL,
        secret TEXT,
        active BOOLEAN DEFAULT true,
        failure_count INTEGER DEFAULT 0,
        last_triggered_at TIMESTAMPTZ,
        created_at TIMESTAMPTZ DEFAULT now()
      )
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS revenue_daily (
        date DATE NOT NULL,
        publisher_id UUID,
        ad_unit_id UUID,
        impressions INTEGER DEFAULT 0,
        clicks INTEGER DEFAULT 0,
        revenue NUMERIC(12,4) DEFAULT 0,
        bid_requests INTEGER DEFAULT 0,
        fill_rate NUMERIC(5,2),
        avg_cpm NUMERIC(10,4),
        country TEXT DEFAULT 'ALL',
        device_type TEXT DEFAULT 'ALL',
        demand_source TEXT DEFAULT 'ALL',
        PRIMARY KEY (date, publisher_id, ad_unit_id, country, device_type, demand_source)
      )
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS campaign_perf_daily (
        date DATE NOT NULL,
        campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
        impressions INTEGER DEFAULT 0,
        clicks INTEGER DEFAULT 0,
        conversions INTEGER DEFAULT 0,
        spend NUMERIC(12,4) DEFAULT 0,
        bids_entered INTEGER DEFAULT 0,
        bids_won INTEGER DEFAULT 0,
        avg_winning_cpm NUMERIC(10,4),
        country TEXT DEFAULT 'ALL',
        device_type TEXT DEFAULT 'ALL',
        PRIMARY KEY (date, campaign_id, country, device_type)
      )
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS prebid_adapters (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        adapter_id TEXT UNIQUE NOT NULL,
        display_name TEXT,
        supported_media_types TEXT[] DEFAULT '{banner}',
        avg_latency_ms INTEGER DEFAULT 200,
        documentation_url TEXT,
        param_schema JSONB DEFAULT '{}'::jsonb,
        created_at TIMESTAMPTZ DEFAULT now()
      )
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS publisher_prebid_configs (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        publisher_id UUID REFERENCES publishers(id),
        adapter_id TEXT NOT NULL,
        params JSONB NOT NULL DEFAULT '{}'::jsonb,
        status TEXT DEFAULT 'active',
        timeout_ms INTEGER DEFAULT 1000,
        impressions_7d INTEGER DEFAULT 0,
        revenue_7d NUMERIC(10,4) DEFAULT 0,
        win_rate_7d NUMERIC(5,2),
        created_at TIMESTAMPTZ DEFAULT now()
      )
    `;

    const cnt = await sql<{ c: string }>`
      SELECT COUNT(*)::text AS c
      FROM information_schema.tables
      WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
    `;
    return Number(cnt.rows[0]?.c ?? 0);
  } catch (e) {
    console.error("[db-init] createTables failed:", e);
    throw e;
  }
}

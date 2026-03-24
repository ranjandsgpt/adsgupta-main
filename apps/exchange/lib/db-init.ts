import { sql } from "@/lib/db";

export async function createTables() {
  await sql`
    CREATE EXTENSION IF NOT EXISTS pgcrypto;

    CREATE TABLE IF NOT EXISTS publishers (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name TEXT NOT NULL,
      domain TEXT NOT NULL,
      contact_email TEXT,
      ads_txt_verified BOOLEAN DEFAULT false,
      status TEXT DEFAULT 'active',
      created_at TIMESTAMPTZ DEFAULT now()
    );

    CREATE TABLE IF NOT EXISTS ad_units (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      publisher_id UUID REFERENCES publishers(id),
      name TEXT NOT NULL,
      sizes TEXT[] NOT NULL,
      ad_type TEXT NOT NULL,
      environment TEXT NOT NULL,
      floor_price NUMERIC(10,4) DEFAULT 0.50,
      status TEXT DEFAULT 'active',
      created_at TIMESTAMPTZ DEFAULT now()
    );

    CREATE TABLE IF NOT EXISTS campaigns (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name TEXT NOT NULL,
      advertiser TEXT NOT NULL,
      budget NUMERIC(12,2),
      daily_budget NUMERIC(10,2),
      bid_price NUMERIC(10,4) NOT NULL,
      target_sizes TEXT[],
      target_geos TEXT[],
      target_devices TEXT[],
      status TEXT DEFAULT 'active',
      start_date DATE,
      end_date DATE,
      created_at TIMESTAMPTZ DEFAULT now()
    );

    CREATE TABLE IF NOT EXISTS creatives (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      campaign_id UUID REFERENCES campaigns(id),
      name TEXT NOT NULL,
      type TEXT NOT NULL,
      size TEXT,
      click_url TEXT,
      image_url TEXT,
      html_snippet TEXT,
      vast_url TEXT,
      status TEXT DEFAULT 'active',
      created_at TIMESTAMPTZ DEFAULT now()
    );

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
      user_agent TEXT,
      country TEXT,
      page_url TEXT,
      created_at TIMESTAMPTZ DEFAULT now()
    );

    CREATE TABLE IF NOT EXISTS impressions (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      auction_id TEXT NOT NULL,
      ad_unit_id UUID REFERENCES ad_units(id),
      campaign_id UUID REFERENCES campaigns(id),
      creative_id UUID REFERENCES creatives(id),
      winning_bid NUMERIC(10,4),
      page_url TEXT,
      created_at TIMESTAMPTZ DEFAULT now()
    );

    CREATE TABLE IF NOT EXISTS clicks (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      impression_id UUID REFERENCES impressions(id),
      campaign_id UUID REFERENCES campaigns(id),
      click_url TEXT,
      created_at TIMESTAMPTZ DEFAULT now()
    );

    CREATE TABLE IF NOT EXISTS pricing_rules (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name TEXT NOT NULL,
      floor_cpm NUMERIC(10,4) NOT NULL,
      applies_to_sizes TEXT[],
      applies_to_env TEXT,
      active BOOLEAN DEFAULT true,
      created_at TIMESTAMPTZ DEFAULT now()
    );
  `;
}

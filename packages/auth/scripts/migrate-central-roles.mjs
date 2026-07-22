#!/usr/bin/env node
/**
 * Run Neon central roles migration against AUTH_DATABASE_URL / POSTGRES_URL.
 *
 * Product tools: exchange | marketplace | blog | talentos
 * Hub: platform
 * Legacy pousali / audit-tool / amazon-audit → marketplace
 */
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { neon } from '@neondatabase/serverless';
import { randomUUID } from 'crypto';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');

function loadEnvFile(path) {
  try {
    const text = readFileSync(path, 'utf8');
    for (const line of text.split('\n')) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const eq = trimmed.indexOf('=');
      if (eq < 0) continue;
      const key = trimmed.slice(0, eq);
      let val = trimmed.slice(eq + 1);
      if (
        (val.startsWith('"') && val.endsWith('"')) ||
        (val.startsWith("'") && val.endsWith("'"))
      ) {
        val = val.slice(1, -1);
      }
      if (!process.env[key]) process.env[key] = val;
    }
  } catch {
    // optional
  }
}

loadEnvFile('/tmp/adsgupta-central-auth.env');
loadEnvFile(resolve(root, '../../apps/exchange/.env.production.local'));

const url =
  process.env.AUTH_DATABASE_URL ||
  process.env.POSTGRES_URL ||
  process.env.DATABASE_URL;

if (!url) {
  console.error('Missing AUTH_DATABASE_URL / POSTGRES_URL');
  process.exit(1);
}

const sql = neon(url);

async function consolidateLegacySlugs() {
  for (const legacy of ['pousali', 'audit-tool', 'amazon-audit']) {
    await sql`
      UPDATE user_app_roles AS legacy
      SET app_slug = 'marketplace', updated_at = NOW()
      WHERE legacy.app_slug = ${legacy}
        AND NOT EXISTS (
          SELECT 1 FROM user_app_roles m
          WHERE m.user_id = legacy.user_id AND m.app_slug = 'marketplace'
        )
    `;
    await sql`DELETE FROM user_app_roles WHERE app_slug = ${legacy}`;
  }
  console.log('Consolidated legacy pousali/audit-tool/amazon-audit → marketplace');
}

async function main() {
  console.log('Applying DDL…');
  await sql`
    CREATE TABLE IF NOT EXISTS central_users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      name TEXT,
      password_hash TEXT,
      image TEXT,
      email_verified TIMESTAMPTZ,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS user_app_roles (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES central_users(id) ON DELETE CASCADE,
      app_slug TEXT NOT NULL,
      role TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'active',
      meta JSONB NOT NULL DEFAULT '{}'::jsonb,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      UNIQUE (user_id, app_slug)
    )
  `;
  await sql`CREATE INDEX IF NOT EXISTS user_app_roles_app_slug_idx ON user_app_roles (app_slug)`;
  await sql`CREATE INDEX IF NOT EXISTS user_app_roles_user_id_idx ON user_app_roles (user_id)`;
  await sql`
    CREATE TABLE IF NOT EXISTS blog_subscribers (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      status TEXT NOT NULL DEFAULT 'active',
      source TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
  await sql`CREATE INDEX IF NOT EXISTS blog_subscribers_status_idx ON blog_subscribers (status)`;
  console.log('DDL ok');

  await consolidateLegacySlugs();

  let migratedUsers = 0;
  let migratedRoles = 0;
  try {
    const userRows = await sql`
      INSERT INTO central_users (id, email, name, password_hash, created_at, updated_at)
      SELECT
        id::text,
        lower(email),
        NULLIF(trim(name), ''),
        password_hash,
        COALESCE(created_at, NOW()),
        NOW()
      FROM platform_users
      WHERE deleted_at IS NULL
      ON CONFLICT (email) DO UPDATE SET
        password_hash = COALESCE(central_users.password_hash, EXCLUDED.password_hash),
        name = COALESCE(central_users.name, EXCLUDED.name),
        updated_at = NOW()
      RETURNING id
    `;
    migratedUsers = userRows.length;

    const roleRows = await sql`
      INSERT INTO user_app_roles (id, user_id, app_slug, role, status, meta, created_at, updated_at)
      SELECT
        gen_random_uuid()::text,
        cu.id,
        'exchange',
        CASE
          WHEN pu.role IN ('admin', 'publisher', 'advertiser', 'demand') THEN pu.role
          ELSE 'publisher'
        END,
        COALESCE(NULLIF(pu.status, ''), 'active'),
        jsonb_build_object(
          'publisher_ids', COALESCE(to_jsonb(pu.publisher_ids), '[]'::jsonb),
          'campaign_email', pu.campaign_email,
          'platform_user_id', pu.id::text
        ),
        NOW(),
        NOW()
      FROM platform_users pu
      JOIN central_users cu ON cu.email = lower(pu.email)
      WHERE pu.deleted_at IS NULL
      ON CONFLICT (user_id, app_slug) DO UPDATE SET
        role = EXCLUDED.role,
        status = EXCLUDED.status,
        meta = user_app_roles.meta || EXCLUDED.meta,
        updated_at = NOW()
      RETURNING id
    `;
    migratedRoles = roleRows.length;
    console.log(`Migrated platform_users: ${migratedUsers} users, ${migratedRoles} roles`);
  } catch (err) {
    console.warn('platform_users migrate skipped:', err.message || err);
  }

  const seeds = [];
  for (let i = 1; i <= 5; i++) {
    const email = process.env[`ADMIN_USER_${i}_EMAIL`]?.trim().toLowerCase();
    const password = process.env[`ADMIN_USER_${i}_PASSWORD`];
    const name =
      process.env[`ADMIN_USER_${i}_NAME`]?.trim() ||
      (email ? email.split('@')[0] : null);
    const subdomain = process.env[`ADMIN_USER_${i}_SUBDOMAIN`]?.trim();
    if (email && password && !email.startsWith('eyJ')) {
      seeds.push({
        email,
        password,
        name,
        subdomain,
        apps: [
          { slug: 'platform', role: 'admin' },
          { slug: 'blog', role: 'admin' },
          { slug: 'marketplace', role: 'admin' },
        ],
      });
    }
  }
  const exEmail = process.env.EXCHANGE_ADMIN_EMAIL?.trim().toLowerCase();
  const exPass = process.env.EXCHANGE_ADMIN_PASSWORD;
  if (exEmail && exPass && !exEmail.startsWith('eyJ')) {
    const existing = seeds.find((s) => s.email === exEmail);
    if (existing) {
      if (!existing.apps.some((a) => a.slug === 'exchange')) {
        existing.apps.push({ slug: 'exchange', role: 'admin' });
      }
    } else {
      seeds.push({
        email: exEmail,
        password: exPass,
        name: exEmail.split('@')[0],
        apps: [
          { slug: 'platform', role: 'admin' },
          { slug: 'exchange', role: 'admin' },
        ],
      });
    }
  }

  let seeded = 0;
  for (const seed of seeds) {
    const passwordPlain = seed.password || null;
    const now = new Date().toISOString();
    if (passwordPlain) {
      await sql`
        INSERT INTO central_users (id, email, name, password_hash, created_at, updated_at)
        VALUES (${randomUUID()}, ${seed.email}, ${seed.name}, ${passwordPlain}, ${now}, ${now})
        ON CONFLICT (email) DO UPDATE SET
          password_hash = EXCLUDED.password_hash,
          name = COALESCE(EXCLUDED.name, central_users.name),
          updated_at = EXCLUDED.updated_at
      `;
    } else {
      await sql`
        INSERT INTO central_users (id, email, name, password_hash, created_at, updated_at)
        VALUES (${randomUUID()}, ${seed.email}, ${seed.name}, NULL, ${now}, ${now})
        ON CONFLICT (email) DO UPDATE SET
          name = COALESCE(EXCLUDED.name, central_users.name),
          updated_at = EXCLUDED.updated_at
      `;
    }
    const rows = await sql`SELECT id FROM central_users WHERE email = ${seed.email} LIMIT 1`;
    const userId = rows[0].id;
    for (const app of seed.apps) {
      const meta =
        app.slug === 'blog' && seed.subdomain
          ? JSON.stringify({ subdomain: seed.subdomain })
          : '{}';
      await sql`
        INSERT INTO user_app_roles (id, user_id, app_slug, role, status, meta, created_at, updated_at)
        VALUES (${randomUUID()}, ${userId}, ${app.slug}, ${app.role}, 'active', ${meta}::jsonb, ${now}, ${now})
        ON CONFLICT (user_id, app_slug) DO UPDATE SET
          role = EXCLUDED.role,
          status = 'active',
          meta = CASE WHEN EXCLUDED.meta = '{}'::jsonb THEN user_app_roles.meta ELSE user_app_roles.meta || EXCLUDED.meta END,
          updated_at = EXCLUDED.updated_at
      `;
      seeded += 1;
    }
    console.log(`Seeded ${seed.email} apps=${seed.apps.map((a) => a.slug).join(',')}`);
  }

  const counts = await sql`
    SELECT
      (SELECT COUNT(*)::int FROM central_users) AS users,
      (SELECT COUNT(*)::int FROM user_app_roles) AS roles,
      (SELECT COUNT(*)::int FROM blog_subscribers) AS subscribers
  `;
  console.log('Done.', { ...counts[0], seededRoleRows: seeded });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

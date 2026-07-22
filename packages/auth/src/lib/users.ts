import { neon, type NeonQueryFunction } from '@neondatabase/serverless';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { randomUUID } from 'crypto';
import type { CentralUser } from '../types/user';
import {
  ensureRolesSchema,
  migratePlatformUsersToRoles,
  seedEnvAdminsToRoles,
} from './roles';

type Sql = NeonQueryFunction<false, false>;

function getSql(): Sql | null {
  const url =
    process.env.AUTH_DATABASE_URL ||
    process.env.POSTGRES_URL ||
    process.env.DATABASE_URL;
  if (!url) return null;
  return neon(url);
}

function getSupabaseAdmin(): SupabaseClient | null {
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false } });
}

let schemaReady = false;
let platformMergeReady = false;
let rolesBootstrapReady = false;

async function ensureSchema(sql: Sql) {
  if (schemaReady) return;
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
  schemaReady = true;
}

/**
 * One-time / idempotent merge: copy Exchange `platform_users` into `central_users`.
 * Existing central passwords win; missing hashes are filled from Exchange.
 */
async function mergePlatformUsersIntoCentral(sql: Sql) {
  if (platformMergeReady) return;
  try {
    await sql`
      INSERT INTO central_users (id, email, name, password_hash, created_at, updated_at)
      SELECT
        id::text,
        lower(email),
        NULLIF(trim(name), ''),
        password_hash,
        COALESCE(created_at, NOW()),
        NOW()
      FROM platform_users
      WHERE password_hash IS NOT NULL
        AND deleted_at IS NULL
      ON CONFLICT (email) DO UPDATE SET
        password_hash = COALESCE(central_users.password_hash, EXCLUDED.password_hash),
        name = COALESCE(central_users.name, EXCLUDED.name),
        updated_at = NOW()
    `;
  } catch (err) {
    // platform_users may not exist on every DB — ignore
    const message = err instanceof Error ? err.message : String(err);
    if (!/platform_users|does not exist|relation/i.test(message)) {
      console.warn('[adsgupta/auth] platform_users merge skipped:', message);
    }
  }
  platformMergeReady = true;
}

async function prepareSql(sql: Sql) {
  await ensureSchema(sql);
  await mergePlatformUsersIntoCentral(sql);
  if (!rolesBootstrapReady) {
    try {
      await ensureRolesSchema(sql);
      await migratePlatformUsersToRoles(sql);
      await seedEnvAdminsToRoles(sql);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.warn('[adsgupta/auth] roles bootstrap skipped:', message);
    }
    rolesBootstrapReady = true;
  }
}

function mapRow(row: Record<string, unknown>): CentralUser {
  return {
    id: String(row.id),
    email: String(row.email),
    name: (row.name as string) ?? null,
    passwordHash: (row.password_hash as string) ?? null,
    image: (row.image as string) ?? null,
    emailVerified: row.email_verified ? new Date(String(row.email_verified)) : null,
    createdAt: new Date(String(row.created_at)),
    updatedAt: new Date(String(row.updated_at)),
  };
}

async function findPlatformUserByEmail(
  sql: Sql,
  email: string
): Promise<(CentralUser & { status?: string }) | null> {
  try {
    const rows = await sql`
      SELECT
        id::text AS id,
        lower(email) AS email,
        name,
        password_hash,
        status,
        created_at,
        COALESCE(last_login_at, created_at, NOW()) AS updated_at
      FROM platform_users
      WHERE lower(email) = ${email}
        AND deleted_at IS NULL
      LIMIT 1
    `;
    if (!rows[0]) return null;
    const row = rows[0] as Record<string, unknown>;
    return {
      ...mapRow({
        ...row,
        email_verified: null,
        image: null,
      }),
      status: row.status ? String(row.status) : undefined,
    };
  } catch {
    return null;
  }
}

/** Import a single Exchange user into central_users (idempotent). */
async function importPlatformUser(sql: Sql, user: CentralUser): Promise<CentralUser> {
  const now = new Date().toISOString();
  await sql`
    INSERT INTO central_users (id, email, name, password_hash, created_at, updated_at)
    VALUES (
      ${user.id},
      ${user.email},
      ${user.name},
      ${user.passwordHash},
      ${user.createdAt.toISOString()},
      ${now}
    )
    ON CONFLICT (email) DO UPDATE SET
      password_hash = COALESCE(central_users.password_hash, EXCLUDED.password_hash),
      name = COALESCE(central_users.name, EXCLUDED.name),
      updated_at = EXCLUDED.updated_at
  `;
  const imported = await findUserByEmailCentralOnly(sql, user.email);
  return imported || user;
}

async function findUserByEmailCentralOnly(
  sql: Sql,
  email: string
): Promise<CentralUser | null> {
  const rows = await sql`SELECT * FROM central_users WHERE email = ${email} LIMIT 1`;
  if (!rows[0]) return null;
  return mapRow(rows[0] as Record<string, unknown>);
}

export function isAuthStoreConfigured(): boolean {
  return Boolean(getSql() || getSupabaseAdmin());
}

export async function findUserByEmail(email: string): Promise<CentralUser | null> {
  const normalized = email.trim().toLowerCase();
  const sql = getSql();
  if (sql) {
    await prepareSql(sql);
    const central = await findUserByEmailCentralOnly(sql, normalized);
    if (central?.passwordHash) return central;

    const platform = await findPlatformUserByEmail(sql, normalized);
    if (
      platform?.passwordHash &&
      platform.status !== 'suspended' &&
      platform.status !== 'deleted'
    ) {
      // Import so subsequent logins hit central_users (Exchange password works everywhere)
      return importPlatformUser(sql, platform);
    }

    // OAuth-only central user without password, or inactive platform user
    if (central) return central;
    return null;
  }

  const supabase = getSupabaseAdmin();
  if (!supabase) return null;
  const { data, error } = await supabase
    .from('central_users')
    .select('*')
    .eq('email', normalized)
    .maybeSingle();
  if (error || !data) return null;
  return mapRow(data as Record<string, unknown>);
}

/**
 * Insert or update a password user (used when importing blog/env admins into central_users).
 */
export async function upsertPasswordUser(input: {
  email: string;
  passwordHash: string;
  name?: string | null;
}): Promise<CentralUser> {
  const email = input.email.trim().toLowerCase();
  const name = input.name?.trim() || null;
  const existing = await findUserByEmail(email);
  if (existing?.passwordHash) {
    // Keep existing hash unless caller is explicitly re-syncing via updateUserPassword
    if (existing.passwordHash === input.passwordHash) return existing;
    await updateUserPassword(email, input.passwordHash);
    return (await findUserByEmail(email)) || { ...existing, passwordHash: input.passwordHash };
  }
  if (existing && !existing.passwordHash) {
    await updateUserPassword(email, input.passwordHash);
    return (await findUserByEmail(email)) || { ...existing, passwordHash: input.passwordHash };
  }
  return createUser(input);
}

export async function createUser(input: {
  email: string;
  passwordHash: string;
  name?: string | null;
}): Promise<CentralUser> {
  const id = randomUUID();
  const email = input.email.trim().toLowerCase();
  const name = input.name?.trim() || null;
  const now = new Date();

  const sql = getSql();
  if (sql) {
    await prepareSql(sql);
    await sql`
      INSERT INTO central_users (id, email, name, password_hash, created_at, updated_at)
      VALUES (${id}, ${email}, ${name}, ${input.passwordHash}, ${now.toISOString()}, ${now.toISOString()})
      ON CONFLICT (email) DO UPDATE SET
        password_hash = EXCLUDED.password_hash,
        name = COALESCE(EXCLUDED.name, central_users.name),
        updated_at = EXCLUDED.updated_at
    `;
    const row = await findUserByEmailCentralOnly(sql, email);
    if (row) return row;
    return {
      id,
      email,
      name,
      passwordHash: input.passwordHash,
      image: null,
      emailVerified: null,
      createdAt: now,
      updatedAt: now,
    };
  }

  const supabase = getSupabaseAdmin();
  if (!supabase) {
    throw new Error(
      'Auth database is not configured. Set AUTH_DATABASE_URL (or POSTGRES_URL) or SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY.'
    );
  }

  const { data, error } = await supabase
    .from('central_users')
    .insert({
      id,
      email,
      name,
      password_hash: input.passwordHash,
      created_at: now.toISOString(),
      updated_at: now.toISOString(),
    })
    .select('*')
    .single();

  if (error || !data) {
    throw new Error(error?.message || 'Failed to create user');
  }
  return mapRow(data as Record<string, unknown>);
}

export async function updateUserPassword(email: string, passwordHash: string): Promise<boolean> {
  const normalized = email.trim().toLowerCase();
  const sql = getSql();
  if (sql) {
    await prepareSql(sql);
    const rows = await sql`
      UPDATE central_users
      SET password_hash = ${passwordHash}, updated_at = ${new Date().toISOString()}
      WHERE email = ${normalized}
      RETURNING id
    `;

    // Keep Exchange credentials in sync when the same Neon DB is shared
    try {
      await sql`
        UPDATE platform_users
        SET password_hash = ${passwordHash}
        WHERE lower(email) = ${normalized}
          AND deleted_at IS NULL
      `;
    } catch {
      // platform_users optional
    }

    if (rows.length > 0) return true;

    // Password reset for Exchange-only user: import then update
    const platform = await findPlatformUserByEmail(sql, normalized);
    if (!platform) return false;
    await importPlatformUser(sql, { ...platform, passwordHash });
    return true;
  }

  const supabase = getSupabaseAdmin();
  if (!supabase) return false;
  const { data, error } = await supabase
    .from('central_users')
    .update({ password_hash: passwordHash, updated_at: new Date().toISOString() })
    .eq('email', normalized)
    .select('id');
  return !error && Boolean(data?.length);
}

export async function upsertOAuthUser(input: {
  email: string;
  name?: string | null;
  image?: string | null;
}): Promise<CentralUser> {
  const existing = await findUserByEmail(input.email);
  if (existing) {
    // Preserve password from Exchange merge; only fill missing profile fields
    return existing;
  }

  // OAuth users may have no password; store a null hash via SQL/Supabase
  const id = randomUUID();
  const email = input.email.trim().toLowerCase();
  const name = input.name?.trim() || null;
  const image = input.image || null;
  const now = new Date();

  const sql = getSql();
  if (sql) {
    await prepareSql(sql);
    await sql`
      INSERT INTO central_users (id, email, name, password_hash, image, email_verified, created_at, updated_at)
      VALUES (${id}, ${email}, ${name}, NULL, ${image}, ${now.toISOString()}, ${now.toISOString()}, ${now.toISOString()})
      ON CONFLICT (email) DO UPDATE SET
        name = COALESCE(EXCLUDED.name, central_users.name),
        image = COALESCE(EXCLUDED.image, central_users.image),
        updated_at = EXCLUDED.updated_at
    `;
    const user = await findUserByEmailCentralOnly(sql, email);
    if (!user) throw new Error('Failed to upsert OAuth user');
    return user;
  }

  const supabase = getSupabaseAdmin();
  if (!supabase) {
    // Allow Google login without DB — ephemeral identity in JWT only
    return {
      id,
      email,
      name,
      passwordHash: null,
      image,
      emailVerified: now,
      createdAt: now,
      updatedAt: now,
    };
  }

  const { data, error } = await supabase
    .from('central_users')
    .upsert(
      {
        id,
        email,
        name,
        image,
        email_verified: now.toISOString(),
        created_at: now.toISOString(),
        updated_at: now.toISOString(),
      },
      { onConflict: 'email' }
    )
    .select('*')
    .single();

  if (error || !data) {
    return {
      id,
      email,
      name,
      passwordHash: null,
      image,
      emailVerified: now,
      createdAt: now,
      updatedAt: now,
    };
  }
  return mapRow(data as Record<string, unknown>);
}

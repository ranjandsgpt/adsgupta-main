import { neon, type NeonQueryFunction } from '@neondatabase/serverless';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { randomUUID } from 'crypto';
import type { CentralUser } from '../types/user';

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

export function isAuthStoreConfigured(): boolean {
  return Boolean(getSql() || getSupabaseAdmin());
}

export async function findUserByEmail(email: string): Promise<CentralUser | null> {
  const normalized = email.trim().toLowerCase();
  const sql = getSql();
  if (sql) {
    await ensureSchema(sql);
    const rows = await sql`SELECT * FROM central_users WHERE email = ${normalized} LIMIT 1`;
    if (!rows[0]) return null;
    return mapRow(rows[0] as Record<string, unknown>);
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
    await ensureSchema(sql);
    await sql`
      INSERT INTO central_users (id, email, name, password_hash, created_at, updated_at)
      VALUES (${id}, ${email}, ${name}, ${input.passwordHash}, ${now.toISOString()}, ${now.toISOString()})
    `;
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
    await ensureSchema(sql);
    const rows = await sql`
      UPDATE central_users
      SET password_hash = ${passwordHash}, updated_at = ${new Date().toISOString()}
      WHERE email = ${normalized}
      RETURNING id
    `;
    return rows.length > 0;
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
  if (existing) return existing;

  // OAuth users may have no password; store a null hash via SQL/Supabase
  const id = randomUUID();
  const email = input.email.trim().toLowerCase();
  const name = input.name?.trim() || null;
  const image = input.image || null;
  const now = new Date();

  const sql = getSql();
  if (sql) {
    await ensureSchema(sql);
    await sql`
      INSERT INTO central_users (id, email, name, password_hash, image, email_verified, created_at, updated_at)
      VALUES (${id}, ${email}, ${name}, NULL, ${image}, ${now.toISOString()}, ${now.toISOString()}, ${now.toISOString()})
      ON CONFLICT (email) DO UPDATE SET
        name = COALESCE(EXCLUDED.name, central_users.name),
        image = COALESCE(EXCLUDED.image, central_users.image),
        updated_at = EXCLUDED.updated_at
    `;
    const user = await findUserByEmail(email);
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

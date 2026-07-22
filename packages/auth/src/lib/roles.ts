import { neon, type NeonQueryFunction } from '@neondatabase/serverless';
import { randomUUID } from 'crypto';
import bcrypt from 'bcryptjs';
import { listEnvAdmins } from './env-admins';

type Sql = NeonQueryFunction<false, false>;

/**
 * Product tools (customer-facing): exchange, marketplace, blog, talentos.
 * `platform` is the hub admin surface only — not a customer tool.
 * `audit-tool` is a legacy alias for marketplace (Amazon audit); prefer `marketplace`.
 * Pousali is a brand/site host for marketplace audit UI — never a separate app_slug.
 */
export type AppSlug =
  | 'exchange'
  | 'blog'
  | 'marketplace'
  | 'talentos'
  | 'platform'
  | 'audit-tool';

/** Canonical customer tools + hub. */
export const PRODUCT_APP_SLUGS = [
  'exchange',
  'marketplace',
  'blog',
  'talentos',
] as const;

export const ALL_ASSIGNABLE_APP_SLUGS = [
  'platform',
  ...PRODUCT_APP_SLUGS,
] as const;

/** Map legacy / host slugs onto product tools. */
export function normalizeAppSlug(slug: string): string {
  const s = slug.trim().toLowerCase();
  if (s === 'pousali' || s === 'amazon-audit' || s === 'audit-tool') {
    return 'marketplace';
  }
  return s;
}

export type UserAppRole = {
  id: string;
  userId: string;
  appSlug: string;
  role: string;
  status: string;
  meta: Record<string, unknown>;
  createdAt?: string;
  updatedAt?: string;
};

export type CentralUserListItem = {
  id: string;
  email: string;
  name: string | null;
  hasPassword: boolean;
  image: string | null;
  createdAt: string;
  updatedAt: string;
  roles: UserAppRole[];
};

function getSql(): Sql | null {
  const url =
    process.env.AUTH_DATABASE_URL ||
    process.env.POSTGRES_URL ||
    process.env.DATABASE_URL;
  if (!url) return null;
  return neon(url);
}

let rolesSchemaReady = false;

export async function ensureRolesSchema(sql?: Sql): Promise<Sql | null> {
  const client = sql || getSql();
  if (!client) return null;
  if (rolesSchemaReady) return client;

  await client`
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
  await client`
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
  await client`CREATE INDEX IF NOT EXISTS user_app_roles_app_slug_idx ON user_app_roles (app_slug)`;
  await client`CREATE INDEX IF NOT EXISTS user_app_roles_user_id_idx ON user_app_roles (user_id)`;
  await client`
    CREATE TABLE IF NOT EXISTS blog_subscribers (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      status TEXT NOT NULL DEFAULT 'active',
      source TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
  await client`CREATE INDEX IF NOT EXISTS blog_subscribers_status_idx ON blog_subscribers (status)`;

  // Consolidate legacy pousali / audit-tool rows into marketplace (pousali is a brand host, not a tool).
  await consolidateLegacyAppSlugs(client);

  rolesSchemaReady = true;
  return client;
}

async function consolidateLegacyAppSlugs(client: Sql): Promise<void> {
  for (const legacy of ['pousali', 'audit-tool', 'amazon-audit'] as const) {
    try {
      await client`
        UPDATE user_app_roles AS legacy
        SET app_slug = 'marketplace', updated_at = NOW()
        WHERE legacy.app_slug = ${legacy}
          AND NOT EXISTS (
            SELECT 1 FROM user_app_roles m
            WHERE m.user_id = legacy.user_id AND m.app_slug = 'marketplace'
          )
      `;
      await client`
        DELETE FROM user_app_roles WHERE app_slug = ${legacy}
      `;
    } catch {
      // table may be empty / race on first boot
    }
  }
}

function mapRole(row: Record<string, unknown>): UserAppRole {
  const metaRaw = row.meta;
  let meta: Record<string, unknown> = {};
  if (metaRaw && typeof metaRaw === 'object' && !Array.isArray(metaRaw)) {
    meta = metaRaw as Record<string, unknown>;
  } else if (typeof metaRaw === 'string') {
    try {
      meta = JSON.parse(metaRaw) as Record<string, unknown>;
    } catch {
      meta = {};
    }
  }
  return {
    id: String(row.id),
    userId: String(row.user_id),
    appSlug: String(row.app_slug),
    role: String(row.role),
    status: String(row.status || 'active'),
    meta,
    createdAt: row.created_at ? String(row.created_at) : undefined,
    updatedAt: row.updated_at ? String(row.updated_at) : undefined,
  };
}

/** Migrate Exchange platform_users → central_users + user_app_roles (idempotent). */
export async function migratePlatformUsersToRoles(sql?: Sql): Promise<{
  users: number;
  roles: number;
}> {
  const client = await ensureRolesSchema(sql);
  if (!client) return { users: 0, roles: 0 };

  let users = 0;
  let roles = 0;
  try {
    const userRows = await client`
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
    users = userRows.length;

    const roleRows = await client`
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
    roles = roleRows.length;
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    if (!/platform_users|does not exist|relation/i.test(message)) {
      throw err;
    }
  }
  return { users, roles };
}

/**
 * Seed env ADMIN_USER_* and optional EXCHANGE_ADMIN into central_users + roles.
 * Passwords are hashed; never stored plaintext.
 */
export async function seedEnvAdminsToRoles(sql?: Sql): Promise<number> {
  const client = await ensureRolesSchema(sql);
  if (!client) return 0;

  type Seed = {
    email: string;
    password?: string;
    name: string;
    subdomain?: string;
    apps: Array<{ slug: AppSlug; role: string }>;
  };

  const seeds: Seed[] = [];

  for (const admin of listEnvAdmins()) {
    const subdomain =
      process.env[
        `ADMIN_USER_${listEnvAdmins().indexOf(admin) + 1}_SUBDOMAIN`
      ]?.trim() || undefined;
    seeds.push({
      email: admin.email,
      password: admin.password,
      name: admin.name,
      subdomain,
      apps: [
        { slug: 'platform', role: 'admin' },
        { slug: 'blog', role: 'admin' },
        { slug: 'marketplace', role: 'admin' },
      ],
    });
  }

  // Explicit ADMIN_USER_* subdomain mapping (index-based above can be wrong with AdsGupta aliases)
  for (let i = 1; i <= 5; i++) {
    const email = process.env[`ADMIN_USER_${i}_EMAIL`]?.trim().toLowerCase();
    const password = process.env[`ADMIN_USER_${i}_PASSWORD`];
    const name =
      process.env[`ADMIN_USER_${i}_NAME`]?.trim() ||
      (email ? email.split('@')[0] : `Admin ${i}`);
    const subdomain = process.env[`ADMIN_USER_${i}_SUBDOMAIN`]?.trim();
    if (!email) continue;
    const existing = seeds.find((s) => s.email === email);
    if (existing) {
      existing.subdomain = subdomain || existing.subdomain;
      if (password) existing.password = password;
      existing.name = name || existing.name;
      if (!existing.apps.some((a) => a.slug === 'marketplace')) {
        existing.apps.push({ slug: 'marketplace', role: 'admin' });
      }
    } else {
      seeds.push({
        email,
        password: password || undefined,
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

  const exchangeAdmin = process.env.EXCHANGE_ADMIN_EMAIL?.trim().toLowerCase();
  const exchangePassword = process.env.EXCHANGE_ADMIN_PASSWORD;
  if (exchangeAdmin) {
    const existing = seeds.find((s) => s.email === exchangeAdmin);
    if (existing) {
      if (!existing.apps.some((a) => a.slug === 'exchange')) {
        existing.apps.push({ slug: 'exchange', role: 'admin' });
      }
      if (!existing.apps.some((a) => a.slug === 'platform')) {
        existing.apps.push({ slug: 'platform', role: 'admin' });
      }
      if (exchangePassword) existing.password = existing.password || exchangePassword;
    } else {
      seeds.push({
        email: exchangeAdmin,
        password: exchangePassword || undefined,
        name: exchangeAdmin.split('@')[0] || 'Exchange Admin',
        apps: [
          { slug: 'platform', role: 'admin' },
          { slug: 'exchange', role: 'admin' },
        ],
      });
    }
  }

  let seeded = 0;
  for (const seed of seeds) {
    const id = randomUUID();
    const now = new Date().toISOString();
    let passwordHash: string | null = null;
    if (seed.password) {
      passwordHash = await bcrypt.hash(seed.password, 12);
    }

    if (passwordHash) {
      await client`
        INSERT INTO central_users (id, email, name, password_hash, created_at, updated_at)
        VALUES (${id}, ${seed.email}, ${seed.name}, ${passwordHash}, ${now}, ${now})
        ON CONFLICT (email) DO UPDATE SET
          password_hash = COALESCE(central_users.password_hash, EXCLUDED.password_hash),
          name = COALESCE(EXCLUDED.name, central_users.name),
          updated_at = EXCLUDED.updated_at
      `;
    } else {
      await client`
        INSERT INTO central_users (id, email, name, password_hash, created_at, updated_at)
        VALUES (${id}, ${seed.email}, ${seed.name}, NULL, ${now}, ${now})
        ON CONFLICT (email) DO UPDATE SET
          name = COALESCE(EXCLUDED.name, central_users.name),
          updated_at = EXCLUDED.updated_at
      `;
    }

    const userRows = await client`
      SELECT id FROM central_users WHERE email = ${seed.email} LIMIT 1
    `;
    const userId = String((userRows[0] as { id: string }).id);

    for (const app of seed.apps) {
      const meta =
        app.slug === 'blog' && seed.subdomain
          ? JSON.stringify({ subdomain: seed.subdomain })
          : '{}';
      await client`
        INSERT INTO user_app_roles (id, user_id, app_slug, role, status, meta, created_at, updated_at)
        VALUES (
          ${randomUUID()},
          ${userId},
          ${app.slug},
          ${app.role},
          'active',
          ${meta}::jsonb,
          ${now},
          ${now}
        )
        ON CONFLICT (user_id, app_slug) DO UPDATE SET
          role = EXCLUDED.role,
          status = 'active',
          meta = CASE
            WHEN EXCLUDED.meta = '{}'::jsonb THEN user_app_roles.meta
            ELSE user_app_roles.meta || EXCLUDED.meta
          END,
          updated_at = EXCLUDED.updated_at
      `;
      seeded += 1;
    }

    // Write-through exchange admin into platform_users when applicable
    if (seed.apps.some((a) => a.slug === 'exchange') && passwordHash) {
      try {
        await client`
          INSERT INTO platform_users (email, name, role, status, password_hash, invited_by)
          VALUES (${seed.email}, ${seed.name}, 'admin', 'active', ${passwordHash}, 'central-seed')
          ON CONFLICT (email) DO UPDATE SET
            password_hash = COALESCE(platform_users.password_hash, EXCLUDED.password_hash),
            role = CASE WHEN platform_users.role = 'admin' THEN platform_users.role ELSE EXCLUDED.role END,
            status = CASE WHEN platform_users.status = 'suspended' THEN platform_users.status ELSE 'active' END
        `;
      } catch {
        // platform_users optional
      }
    }
  }

  return seeded;
}

export async function listCentralUsersWithRoles(limit = 200): Promise<CentralUserListItem[]> {
  const client = await ensureRolesSchema();
  if (!client) return [];

  const users = await client`
    SELECT
      id,
      email,
      name,
      (password_hash IS NOT NULL) AS has_password,
      image,
      created_at::text,
      updated_at::text
    FROM central_users
    ORDER BY created_at DESC
    LIMIT ${limit}
  `;

  const roles = await client`
    SELECT id, user_id, app_slug, role, status, meta, created_at::text, updated_at::text
    FROM user_app_roles
  `;
  const byUser = new Map<string, UserAppRole[]>();
  for (const row of roles) {
    const mapped = mapRole(row as Record<string, unknown>);
    const list = byUser.get(mapped.userId) || [];
    list.push(mapped);
    byUser.set(mapped.userId, list);
  }

  return users.map((u) => {
    const row = u as Record<string, unknown>;
    return {
      id: String(row.id),
      email: String(row.email),
      name: (row.name as string) ?? null,
      hasPassword: Boolean(row.has_password),
      image: (row.image as string) ?? null,
      createdAt: String(row.created_at),
      updatedAt: String(row.updated_at),
      roles: byUser.get(String(row.id)) || [],
    };
  });
}

export async function getRolesForUserId(userId: string): Promise<UserAppRole[]> {
  const client = await ensureRolesSchema();
  if (!client) return [];
  const rows = await client`
    SELECT id, user_id, app_slug, role, status, meta, created_at::text, updated_at::text
    FROM user_app_roles
    WHERE user_id = ${userId}
  `;
  return rows.map((r) => mapRole(r as Record<string, unknown>));
}

export async function getRolesForEmail(email: string): Promise<UserAppRole[]> {
  const client = await ensureRolesSchema();
  if (!client) return [];
  const normalized = email.trim().toLowerCase();
  const rows = await client`
    SELECT r.id, r.user_id, r.app_slug, r.role, r.status, r.meta, r.created_at::text, r.updated_at::text
    FROM user_app_roles r
    JOIN central_users u ON u.id = r.user_id
    WHERE u.email = ${normalized}
  `;
  return rows.map((r) => mapRole(r as Record<string, unknown>));
}

export async function getAppRoleForEmail(
  email: string,
  appSlug: AppSlug | string
): Promise<UserAppRole | null> {
  const roles = await getRolesForEmail(email);
  const canonical = normalizeAppSlug(appSlug);
  return (
    roles.find((r) => normalizeAppSlug(r.appSlug) === canonical && r.status === 'active') ||
    null
  );
}

export async function upsertUserAppRole(input: {
  userId?: string;
  email?: string;
  appSlug: string;
  role: string;
  status?: string;
  meta?: Record<string, unknown>;
}): Promise<UserAppRole | null> {
  const client = await ensureRolesSchema();
  if (!client) return null;

  let userId = input.userId;
  if (!userId && input.email) {
    const email = input.email.trim().toLowerCase();
    const rows = await client`SELECT id FROM central_users WHERE email = ${email} LIMIT 1`;
    if (!rows[0]) return null;
    userId = String((rows[0] as { id: string }).id);
  }
  if (!userId) return null;

  const appSlug = normalizeAppSlug(input.appSlug);
  const status = input.status || 'active';
  const metaJson = JSON.stringify(input.meta || {});
  const now = new Date().toISOString();
  const rows = await client`
    INSERT INTO user_app_roles (id, user_id, app_slug, role, status, meta, created_at, updated_at)
    VALUES (${randomUUID()}, ${userId}, ${appSlug}, ${input.role}, ${status}, ${metaJson}::jsonb, ${now}, ${now})
    ON CONFLICT (user_id, app_slug) DO UPDATE SET
      role = EXCLUDED.role,
      status = EXCLUDED.status,
      meta = CASE
        WHEN EXCLUDED.meta = '{}'::jsonb THEN user_app_roles.meta
        ELSE user_app_roles.meta || EXCLUDED.meta
      END,
      updated_at = EXCLUDED.updated_at
    RETURNING id, user_id, app_slug, role, status, meta, created_at::text, updated_at::text
  `;

  const role = mapRole(rows[0] as Record<string, unknown>);

  // Write-through to platform_users for exchange
  if (appSlug === 'exchange') {
    await syncExchangePlatformUser(userId, role, client);
  }

  return role;
}

/** Keep Exchange platform_users in sync with user_app_roles (temporary dual-write). */
export async function syncExchangePlatformUser(
  userId: string,
  role: UserAppRole,
  sql?: Sql
): Promise<void> {
  const client = sql || (await ensureRolesSchema());
  if (!client) return;

  try {
    const users = await client`
      SELECT email, name, password_hash FROM central_users WHERE id = ${userId} LIMIT 1
    `;
    if (!users[0]) return;
    const u = users[0] as {
      email: string;
      name: string | null;
      password_hash: string | null;
    };
    const publisherIds = Array.isArray(role.meta.publisher_ids)
      ? (role.meta.publisher_ids as unknown[]).map(String)
      : [];
    const campaignEmail =
      typeof role.meta.campaign_email === 'string' ? role.meta.campaign_email : null;
    const exchangeRole =
      role.role === 'admin' || role.role === 'publisher' || role.role === 'advertiser'
        ? role.role
        : 'publisher';

    await client`
      INSERT INTO platform_users (email, name, role, status, password_hash, publisher_ids, campaign_email, invited_by)
      VALUES (
        ${u.email},
        ${u.name || u.email.split('@')[0]},
        ${exchangeRole},
        ${role.status},
        ${u.password_hash},
        ${publisherIds.length ? publisherIds : null}::uuid[],
        ${campaignEmail},
        'central-roles'
      )
      ON CONFLICT (email) DO UPDATE SET
        name = COALESCE(EXCLUDED.name, platform_users.name),
        role = EXCLUDED.role,
        status = EXCLUDED.status,
        password_hash = COALESCE(platform_users.password_hash, EXCLUDED.password_hash),
        publisher_ids = COALESCE(EXCLUDED.publisher_ids, platform_users.publisher_ids),
        campaign_email = COALESCE(EXCLUDED.campaign_email, platform_users.campaign_email),
        deleted_at = CASE WHEN EXCLUDED.status = 'suspended' THEN COALESCE(platform_users.deleted_at, now()) ELSE NULL END
    `;
  } catch {
    // platform_users may be absent
  }
}

export async function updateCentralUserProfile(input: {
  userId: string;
  name?: string | null;
}): Promise<boolean> {
  const client = await ensureRolesSchema();
  if (!client) return false;
  if (input.name === undefined) return true;
  const rows = await client`
    UPDATE central_users
    SET name = ${input.name}, updated_at = ${new Date().toISOString()}
    WHERE id = ${input.userId}
    RETURNING id
  `;
  return rows.length > 0;
}

export async function listBlogSubscribers(input?: {
  status?: string;
  limit?: number;
}): Promise<
  Array<{
    id: string;
    email: string;
    status: string;
    source: string | null;
    createdAt: string;
  }>
> {
  const client = await ensureRolesSchema();
  if (!client) return [];
  const limit = input?.limit ?? 500;
  if (input?.status) {
    const rows = await client`
      SELECT id, email, status, source, created_at::text
      FROM blog_subscribers
      WHERE status = ${input.status}
      ORDER BY created_at DESC NULLS LAST
      LIMIT ${limit}
    `;
    return rows.map((r) => {
      const row = r as Record<string, unknown>;
      return {
        id: String(row.id),
        email: String(row.email),
        status: String(row.status),
        source: (row.source as string) ?? null,
        createdAt: String(row.created_at),
      };
    });
  }
  const rows = await client`
    SELECT id, email, status, source, created_at::text
    FROM blog_subscribers
    ORDER BY created_at DESC NULLS LAST
    LIMIT ${limit}
  `;
  return rows.map((r) => {
    const row = r as Record<string, unknown>;
    return {
      id: String(row.id),
      email: String(row.email),
      status: String(row.status),
      source: (row.source as string) ?? null,
      createdAt: String(row.created_at),
    };
  });
}

export async function upsertBlogSubscriber(
  email: string,
  source?: string,
  status = 'active'
): Promise<boolean> {
  const client = await ensureRolesSchema();
  if (!client) return false;
  const normalized = email.trim().toLowerCase();
  if (!normalized.includes('@')) return false;
  const now = new Date().toISOString();
  await client`
    INSERT INTO blog_subscribers (id, email, status, source, created_at, updated_at)
    VALUES (${randomUUID()}, ${normalized}, ${status}, ${source || null}, ${now}, ${now})
    ON CONFLICT (email) DO UPDATE SET
      status = EXCLUDED.status,
      source = COALESCE(EXCLUDED.source, blog_subscribers.source),
      updated_at = EXCLUDED.updated_at
  `;
  return true;
}

export async function updateBlogSubscriberStatus(
  id: string,
  status: string
): Promise<boolean> {
  const client = await ensureRolesSchema();
  if (!client) return false;
  const rows = await client`
    UPDATE blog_subscribers
    SET status = ${status}, updated_at = ${new Date().toISOString()}
    WHERE id = ${id}
    RETURNING id
  `;
  return rows.length > 0;
}

/** Platform admin: DB role first, env ADMIN_USER_* fallback. */
export async function isPlatformAdmin(email: string | null | undefined): Promise<boolean> {
  if (!email) return false;
  const normalized = email.trim().toLowerCase();

  for (let i = 1; i <= 5; i++) {
    const adminEmail = process.env[`ADMIN_USER_${i}_EMAIL`]?.trim().toLowerCase();
    if (adminEmail && adminEmail === normalized) return true;
  }

  const role = await getAppRoleForEmail(normalized, 'platform');
  return Boolean(role && role.role === 'admin' && role.status === 'active');
}

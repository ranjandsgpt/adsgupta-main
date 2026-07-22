-- Central AdsGupta roles + blog newsletter (Neon exchange-db)
CREATE TABLE IF NOT EXISTS central_users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  password_hash TEXT,
  image TEXT,
  email_verified TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

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
);

CREATE INDEX IF NOT EXISTS user_app_roles_app_slug_idx ON user_app_roles (app_slug);
CREATE INDEX IF NOT EXISTS user_app_roles_user_id_idx ON user_app_roles (user_id);

CREATE TABLE IF NOT EXISTS blog_subscribers (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  source TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS blog_subscribers_status_idx ON blog_subscribers (status);

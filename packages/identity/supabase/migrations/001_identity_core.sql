-- Run in Supabase SQL editor.
-- Then: Auth → Hooks → Custom Access Token Hook → public.custom_access_token_hook
-- Enable asymmetric JWT signing keys (Auth → JWT Settings).

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------

CREATE TYPE public.app_role AS ENUM ('admin', 'subscriber', 'freebie');

CREATE TYPE public.member_status AS ENUM (
  'pending_approval',
  'awaiting_payment',
  'active',
  'expired',
  'rejected',
  'suspended'
);

CREATE TYPE public.payment_status AS ENUM (
  'created',
  'authorized',
  'captured',
  'failed',
  'refunded'
);

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------

CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE public.apps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE public.memberships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  app_id UUID NOT NULL REFERENCES public.apps (id) ON DELETE CASCADE,
  role public.app_role NOT NULL DEFAULT 'subscriber',
  status public.member_status NOT NULL DEFAULT 'awaiting_payment',
  track TEXT NOT NULL CHECK (track IN ('freebie', 'subscriber')),
  approved_at TIMESTAMPTZ,
  rejected_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, app_id)
);

CREATE TABLE public.plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  app_id UUID NOT NULL REFERENCES public.apps (id) ON DELETE CASCADE,
  slug TEXT NOT NULL,
  name TEXT NOT NULL,
  amount_paise INTEGER NOT NULL CHECK (amount_paise > 0),
  duration_hours INTEGER NOT NULL CHECK (duration_hours > 0),
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (app_id, slug)
);

CREATE TABLE public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  app_id UUID NOT NULL REFERENCES public.apps (id) ON DELETE CASCADE,
  plan_id UUID REFERENCES public.plans (id) ON DELETE SET NULL,
  razorpay_order_id TEXT UNIQUE,
  razorpay_payment_id TEXT UNIQUE,
  razorpay_qr_id TEXT,
  amount_paise INTEGER NOT NULL CHECK (amount_paise > 0),
  currency TEXT NOT NULL DEFAULT 'INR',
  method TEXT,
  status public.payment_status NOT NULL DEFAULT 'created',
  captured_at TIMESTAMPTZ,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE public.entitlements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  app_id UUID NOT NULL REFERENCES public.apps (id) ON DELETE CASCADE,
  source_payment_id UUID UNIQUE REFERENCES public.payments (id) ON DELETE SET NULL,
  source_payment TEXT UNIQUE,
  granted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  revoked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE public.invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  app_id UUID NOT NULL REFERENCES public.apps (id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role public.app_role NOT NULL DEFAULT 'subscriber',
  token TEXT NOT NULL UNIQUE,
  invited_by UUID REFERENCES auth.users (id) ON DELETE SET NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  accepted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE public.webhook_events (
  id TEXT PRIMARY KEY,
  provider TEXT NOT NULL DEFAULT 'razorpay',
  payload JSONB NOT NULL,
  processed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE public.audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id UUID REFERENCES auth.users (id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  target_type TEXT,
  target_id TEXT,
  app_id UUID REFERENCES public.apps (id) ON DELETE SET NULL,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE public.freebie_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  app_id UUID NOT NULL REFERENCES public.apps (id) ON DELETE CASCADE,
  usage_date DATE NOT NULL DEFAULT CURRENT_DATE,
  count INTEGER NOT NULL DEFAULT 0 CHECK (count >= 0),
  UNIQUE (user_id, app_id, usage_date)
);

-- ---------------------------------------------------------------------------
-- Indexes
-- ---------------------------------------------------------------------------

CREATE INDEX profiles_email_idx ON public.profiles (email);
CREATE INDEX memberships_user_id_idx ON public.memberships (user_id);
CREATE INDEX memberships_app_id_idx ON public.memberships (app_id);
CREATE INDEX memberships_status_idx ON public.memberships (status);
CREATE INDEX entitlements_user_app_idx ON public.entitlements (user_id, app_id);
CREATE INDEX entitlements_expires_at_idx ON public.entitlements (expires_at)
  WHERE revoked_at IS NULL;
CREATE INDEX payments_user_id_idx ON public.payments (user_id);
CREATE INDEX payments_app_id_idx ON public.payments (app_id);
CREATE INDEX payments_status_idx ON public.payments (status);
CREATE INDEX payments_razorpay_qr_id_idx ON public.payments (razorpay_qr_id);
CREATE INDEX invitations_email_idx ON public.invitations (email);
CREATE INDEX invitations_token_idx ON public.invitations (token);
CREATE INDEX audit_log_app_created_idx ON public.audit_log (app_id, created_at DESC);
CREATE INDEX audit_log_actor_idx ON public.audit_log (actor_id);
CREATE INDEX freebie_usage_user_app_date_idx ON public.freebie_usage (user_id, app_id, usage_date);

-- ---------------------------------------------------------------------------
-- Seed data
-- ---------------------------------------------------------------------------

INSERT INTO public.apps (slug, name)
VALUES
  ('audit-tool', 'Amazon Audit Tool'),
  ('exchange', 'AdsGupta Exchange'),
  ('blog', 'AdsGupta Blog')
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.plans (app_id, slug, name, amount_paise, duration_hours, active)
SELECT a.id, 'pass-72h', '72-hour pass', 50000, 72, TRUE
FROM public.apps a
WHERE a.slug = 'audit-tool'
ON CONFLICT (app_id, slug) DO UPDATE
SET
  amount_paise = EXCLUDED.amount_paise,
  duration_hours = EXCLUDED.duration_hours,
  active = EXCLUDED.active;

-- ---------------------------------------------------------------------------
-- Helpers & triggers
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER profiles_set_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER memberships_set_updated_at
  BEFORE UPDATE ON public.memberships
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER payments_set_updated_at
  BEFORE UPDATE ON public.payments
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.email, ''),
    COALESCE(
      NEW.raw_user_meta_data ->> 'full_name',
      NEW.raw_user_meta_data ->> 'name'
    ),
    NEW.raw_user_meta_data ->> 'avatar_url'
  )
  ON CONFLICT (id) DO UPDATE
  SET
    email = EXCLUDED.email,
    full_name = COALESCE(EXCLUDED.full_name, public.profiles.full_name),
    avatar_url = COALESCE(EXCLUDED.avatar_url, public.profiles.avatar_url),
    updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE OR REPLACE FUNCTION public.is_app_admin(p_user_id UUID, p_app_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.memberships m
    WHERE m.user_id = p_user_id
      AND m.app_id = p_app_id
      AND m.role = 'admin'
      AND m.status = 'active'
  );
$$;

CREATE OR REPLACE FUNCTION public.is_app_admin_by_slug(p_user_id UUID, p_app_slug TEXT)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.memberships m
    JOIN public.apps a ON a.id = m.app_id
    WHERE m.user_id = p_user_id
      AND a.slug = p_app_slug
      AND m.role = 'admin'
      AND m.status = 'active'
  );
$$;

-- ---------------------------------------------------------------------------
-- Custom Access Token Hook
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.custom_access_token_hook(event JSONB)
RETURNS JSONB
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  original_claims JSONB;
  new_claims JSONB;
  user_uuid UUID;
  membership_claims JSONB;
BEGIN
  user_uuid := (event ->> 'user_id')::UUID;
  original_claims := event -> 'claims';

  SELECT COALESCE(
    jsonb_agg(
      jsonb_build_object(
        'app', a.slug,
        'role', m.role,
        'status', m.status,
        'track', m.track
      )
      ORDER BY a.slug
    ),
    '[]'::jsonb
  )
  INTO membership_claims
  FROM public.memberships m
  JOIN public.apps a ON a.id = m.app_id
  WHERE m.user_id = user_uuid;

  new_claims := jsonb_set(
    original_claims,
    '{identity}',
    jsonb_build_object('memberships', membership_claims),
    TRUE
  );

  RETURN jsonb_set(event, '{claims}', new_claims, TRUE);
END;
$$;

GRANT USAGE ON SCHEMA public TO supabase_auth_admin;
GRANT EXECUTE ON FUNCTION public.custom_access_token_hook(JSONB) TO supabase_auth_admin;
REVOKE EXECUTE ON FUNCTION public.custom_access_token_hook(JSONB)
  FROM authenticated, anon, public;

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.apps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.entitlements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.webhook_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.freebie_usage ENABLE ROW LEVEL SECURITY;

CREATE POLICY profiles_select_own ON public.profiles
  FOR SELECT TO authenticated USING (id = auth.uid());
CREATE POLICY profiles_update_own ON public.profiles
  FOR UPDATE TO authenticated USING (id = auth.uid()) WITH CHECK (id = auth.uid());

CREATE POLICY apps_select_authenticated ON public.apps
  FOR SELECT TO authenticated USING (TRUE);

CREATE POLICY memberships_select_own ON public.memberships
  FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY memberships_select_admin ON public.memberships
  FOR SELECT TO authenticated USING (public.is_app_admin(auth.uid(), app_id));
CREATE POLICY memberships_update_admin ON public.memberships
  FOR UPDATE TO authenticated
  USING (public.is_app_admin(auth.uid(), app_id))
  WITH CHECK (public.is_app_admin(auth.uid(), app_id));

CREATE POLICY plans_select_active ON public.plans
  FOR SELECT TO authenticated USING (active = TRUE);
CREATE POLICY plans_select_admin ON public.plans
  FOR SELECT TO authenticated USING (public.is_app_admin(auth.uid(), app_id));

CREATE POLICY entitlements_select_own ON public.entitlements
  FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY entitlements_select_admin ON public.entitlements
  FOR SELECT TO authenticated USING (public.is_app_admin(auth.uid(), app_id));

CREATE POLICY payments_select_own ON public.payments
  FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY payments_select_admin ON public.payments
  FOR SELECT TO authenticated USING (public.is_app_admin(auth.uid(), app_id));

CREATE POLICY invitations_admin_all ON public.invitations
  FOR ALL TO authenticated
  USING (public.is_app_admin(auth.uid(), app_id))
  WITH CHECK (public.is_app_admin(auth.uid(), app_id));

CREATE POLICY invitations_select_by_email ON public.invitations
  FOR SELECT TO authenticated
  USING (lower(email) = lower(COALESCE(auth.jwt() ->> 'email', '')));

CREATE POLICY audit_log_select_admin ON public.audit_log
  FOR SELECT TO authenticated
  USING (app_id IS NULL OR public.is_app_admin(auth.uid(), app_id));
CREATE POLICY audit_log_insert_own ON public.audit_log
  FOR INSERT TO authenticated
  WITH CHECK (actor_id = auth.uid() OR actor_id IS NULL);

CREATE POLICY freebie_usage_select_own ON public.freebie_usage
  FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY freebie_usage_select_admin ON public.freebie_usage
  FOR SELECT TO authenticated USING (public.is_app_admin(auth.uid(), app_id));

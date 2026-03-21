-- AdsGupta Blog CMS — run in Supabase SQL Editor (same project as apps/pousali).
-- Extensions (Supabase usually has these enabled)
-- create extension if not exists pgcrypto;

-- User profiles (extends Supabase auth.users)
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  username text unique,
  full_name text,
  avatar_url text,
  bio text,
  role text default 'author', -- 'admin', 'author', 'editor'
  subdomain text, -- 'ranjan', 'pousali', 'both', null
  linkedin_token text,
  instagram_token text,
  facebook_token text,
  twitter_token text,
  created_at timestamptz default now()
);

-- Posts
create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  subtitle text,
  content text,
  excerpt text,
  cover_image text,
  category text,
  tags text[],
  status text default 'draft', -- 'draft', 'published', 'scheduled', 'archived'
  author_id uuid references public.profiles(id),
  seo_title text,
  seo_description text,
  og_image text,
  read_time_minutes int,
  featured boolean default false,
  scheduled_at timestamptz,
  published_at timestamptz,
  -- Distribution settings
  publish_to_blog boolean default true,
  publish_to_ranjan boolean default false,
  publish_to_pousali boolean default false,
  crosspost_linkedin boolean default false,
  crosspost_instagram boolean default false,
  crosspost_facebook boolean default false,
  crosspost_twitter boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Media library
create table if not exists public.media (
  id uuid primary key default gen_random_uuid(),
  filename text,
  url text,
  alt_text text,
  width int,
  height int,
  size_bytes int,
  uploaded_by uuid references public.profiles(id),
  created_at timestamptz default now()
);

-- Social sync log
create table if not exists public.social_syncs (
  id uuid primary key default gen_random_uuid(),
  post_id uuid references public.posts(id) on delete cascade,
  platform text, -- 'linkedin', 'instagram', 'facebook', 'twitter'
  status text, -- 'pending', 'published', 'failed'
  platform_post_id text,
  published_at timestamptz,
  error_message text,
  created_at timestamptz default now()
);

-- Analytics events
create table if not exists public.analytics_events (
  id uuid primary key default gen_random_uuid(),
  post_id uuid references public.posts(id) on delete set null,
  event_type text, -- 'view', 'read', 'share', 'click'
  session_id text,
  referrer text,
  country text,
  device text,
  created_at timestamptz default now()
);

-- Ad slots
create table if not exists public.ad_slots (
  id uuid primary key default gen_random_uuid(),
  name text,
  placement text, -- 'inline', 'header', 'footer', 'sidebar'
  ad_code text,
  active boolean default true,
  created_at timestamptz default now()
);

-- Newsletter subscribers
create table if not exists public.subscribers (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  status text default 'active',
  source text,
  created_at timestamptz default now()
);

-- Auto-create profile on signup (uses raw_user_meta_data from signUp)
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, username, full_name)
  values (
    new.id,
    nullif(trim(new.raw_user_meta_data ->> 'username'), ''),
    nullif(trim(new.raw_user_meta_data ->> 'full_name'), '')
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- updated_at trigger for posts
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists posts_updated_at on public.posts;
create trigger posts_updated_at
  before update on public.posts
  for each row execute procedure public.set_updated_at();

-- Row Level Security
alter table public.profiles enable row level security;
alter table public.posts enable row level security;
alter table public.media enable row level security;
alter table public.social_syncs enable row level security;
alter table public.analytics_events enable row level security;
alter table public.ad_slots enable row level security;
alter table public.subscribers enable row level security;

-- Profiles: readable for public (author display); users update own row
drop policy if exists "Profiles are viewable by everyone" on public.profiles;
create policy "Profiles are viewable by everyone"
  on public.profiles for select
  using (true);

drop policy if exists "Users update own profile" on public.profiles;
create policy "Users update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Posts: public reads published blog posts; authors full access to own rows
drop policy if exists "Public read published blog posts" on public.posts;
create policy "Public read published blog posts"
  on public.posts for select
  using (status = 'published' and publish_to_blog = true);

drop policy if exists "Authors manage own posts" on public.posts;
create policy "Authors manage own posts"
  on public.posts for all
  using (auth.uid() = author_id)
  with check (auth.uid() = author_id);

-- Media: owner + public read URLs (optional tighten later)
drop policy if exists "Users manage own media" on public.media;
create policy "Users manage own media"
  on public.media for all
  using (auth.uid() = uploaded_by)
  with check (auth.uid() = uploaded_by);

drop policy if exists "Public read media" on public.media;
create policy "Public read media"
  on public.media for select
  using (true);

-- Social syncs: authors see own via post ownership (simplified: authenticated read own post's syncs later)
drop policy if exists "Authenticated full access social_syncs" on public.social_syncs;
create policy "Authenticated full access social_syncs"
  on public.social_syncs for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- Analytics: insert for tracking; read for admins later
drop policy if exists "Anyone can insert analytics" on public.analytics_events;
create policy "Anyone can insert analytics"
  on public.analytics_events for insert
  with check (true);

drop policy if exists "Authenticated read analytics" on public.analytics_events;
create policy "Authenticated read analytics"
  on public.analytics_events for select
  using (auth.role() = 'authenticated');

-- Ad slots: admin TBD; allow read for public embed (optional)
drop policy if exists "Authenticated manage ad_slots" on public.ad_slots;
create policy "Authenticated manage ad_slots"
  on public.ad_slots for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- Subscribers: public can subscribe
drop policy if exists "Anyone can subscribe" on public.subscribers;
create policy "Anyone can subscribe"
  on public.subscribers for insert
  with check (true);

drop policy if exists "Authenticated read subscribers" on public.subscribers;
create policy "Authenticated read subscribers"
  on public.subscribers for select
  using (auth.role() = 'authenticated');

-- Storage: create bucket `blog-media` in Supabase Dashboard (public or signed URLs).

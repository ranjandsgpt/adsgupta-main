-- Run after schema.sql so anon clients can read published posts for ranjan/pousali subdomains via GET /api/posts?subdomain=
-- (Policies are OR'd for SELECT.)

drop policy if exists "Public read published ranjan posts" on public.posts;
create policy "Public read published ranjan posts"
  on public.posts for select
  using (status = 'published' and publish_to_ranjan = true);

drop policy if exists "Public read published pousali posts" on public.posts;
create policy "Public read published pousali posts"
  on public.posts for select
  using (status = 'published' and publish_to_pousali = true);

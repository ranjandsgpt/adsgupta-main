-- Create bucket in Dashboard: Storage → New bucket → name: blog-media → Public (for direct URLs in CMS)
-- Optional: policies if bucket is private (use signed URLs instead).

insert into storage.buckets (id, name, public)
values ('blog-media', 'blog-media', true)
on conflict (id) do nothing;

-- Allow authenticated users to upload into their own folder (prefix = auth.uid())
create policy "Users upload own folder"
  on storage.objects for insert
  with check (
    bucket_id = 'blog-media'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Users update own objects"
  on storage.objects for update
  using (bucket_id = 'blog-media' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "Users delete own objects"
  on storage.objects for delete
  using (bucket_id = 'blog-media' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "Public read blog-media"
  on storage.objects for select
  using (bucket_id = 'blog-media');

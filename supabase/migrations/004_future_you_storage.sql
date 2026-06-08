-- Future You private storage bucket + RLS (build checklist step 5).
-- Object paths: users/{user_id}/... (source selfies, generated images).
-- Safe to run multiple times.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'future-you',
  'future-you',
  false,
  10485760, -- 10 MB
  array['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Future You: users read own objects" on storage.objects;
drop policy if exists "Future You: users insert own objects" on storage.objects;
drop policy if exists "Future You: users update own objects" on storage.objects;
drop policy if exists "Future You: users delete own objects" on storage.objects;

-- Authenticated users may only access objects under users/{their_uid}/ in this bucket.
create policy "Future You: users read own objects"
  on storage.objects for select
  to authenticated
  using (
    bucket_id = 'future-you'
    and (storage.foldername(name))[1] = 'users'
    and (storage.foldername(name))[2] = auth.uid()::text
  );

create policy "Future You: users insert own objects"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'future-you'
    and (storage.foldername(name))[1] = 'users'
    and (storage.foldername(name))[2] = auth.uid()::text
  );

create policy "Future You: users update own objects"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'future-you'
    and (storage.foldername(name))[1] = 'users'
    and (storage.foldername(name))[2] = auth.uid()::text
  )
  with check (
    bucket_id = 'future-you'
    and (storage.foldername(name))[1] = 'users'
    and (storage.foldername(name))[2] = auth.uid()::text
  );

create policy "Future You: users delete own objects"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'future-you'
    and (storage.foldername(name))[1] = 'users'
    and (storage.foldername(name))[2] = auth.uid()::text
  );

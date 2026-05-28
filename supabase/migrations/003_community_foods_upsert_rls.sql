-- Ensure upsert (INSERT ... ON CONFLICT DO UPDATE) passes RLS for authenticated users.
-- Safe to run multiple times.

drop policy if exists "Authenticated users can update community foods" on public.community_foods;

create policy "Authenticated users can update community foods"
  on public.community_foods for update
  to authenticated
  using (true)
  with check (submitted_by = auth.uid());

-- Security fix: restrict community_foods UPDATE to the row owner.
-- Previously the UPDATE policy used `USING (true)`, letting any authenticated
-- user modify any shared food row (data poisoning). Barcode contributions from
-- the client are fire-and-forget upserts, so a denied cross-user update simply
-- leaves the existing row untouched (logged, non-blocking).
-- Safe to run multiple times.

drop policy if exists "Authenticated users can update community foods" on public.community_foods;

create policy "Authenticated users can update community foods"
  on public.community_foods for update
  to authenticated
  using (submitted_by = auth.uid())
  with check (submitted_by = auth.uid());

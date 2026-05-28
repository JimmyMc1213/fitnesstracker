-- Shared barcode foods contributed by scans (Open Food Facts lookups).
-- Safe to run multiple times.

create table if not exists public.community_foods (
  barcode text primary key,
  name text not null,
  brand text,
  serving_label text not null,
  serving_grams numeric not null,
  cal integer not null default 0,
  protein numeric not null default 0,
  carbs numeric not null default 0,
  fat numeric not null default 0,
  submitted_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists community_foods_submitted_by_idx on public.community_foods (submitted_by);

alter table public.community_foods enable row level security;

drop policy if exists "Authenticated users can read community foods" on public.community_foods;
drop policy if exists "Authenticated users can insert community foods" on public.community_foods;
drop policy if exists "Authenticated users can update community foods" on public.community_foods;

create policy "Authenticated users can read community foods"
  on public.community_foods for select
  to authenticated
  using (true);

create policy "Authenticated users can insert community foods"
  on public.community_foods for insert
  to authenticated
  with check (submitted_by = auth.uid());

create policy "Authenticated users can update community foods"
  on public.community_foods for update
  to authenticated
  using (true);

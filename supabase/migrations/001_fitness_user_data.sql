-- Run in Supabase SQL editor or via CLI. Stores one JSON blob per authenticated user.
-- Safe to run multiple times (drops policies first if they exist).

create table if not exists public.fitness_user_data (
  user_id uuid primary key references auth.users (id) on delete cascade,
  payload jsonb not null default '{}'::jsonb,
  updated_at_ms bigint not null default 0
);

create index if not exists fitness_user_data_updated_idx on public.fitness_user_data (updated_at_ms desc);

alter table public.fitness_user_data enable row level security;

drop policy if exists "Users can read own fitness row" on public.fitness_user_data;
drop policy if exists "Users can insert own fitness row" on public.fitness_user_data;
drop policy if exists "Users can update own fitness row" on public.fitness_user_data;

create policy "Users can read own fitness row"
  on public.fitness_user_data for select
  using (auth.uid() = user_id);

create policy "Users can insert own fitness row"
  on public.fitness_user_data for insert
  with check (auth.uid() = user_id);

create policy "Users can update own fitness row"
  on public.fitness_user_data for update
  using (auth.uid() = user_id);

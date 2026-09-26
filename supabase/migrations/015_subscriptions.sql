-- Server-authoritative subscription state, including admin overrides.
-- The admin dashboard upserts this table (store = admin_override). The app
-- reads the signed-in user's row to skip the paywall. Safe to run multiple times.

create table if not exists public.subscriptions (
  user_id uuid primary key references auth.users (id) on delete cascade,
  entitlement text not null default 'pro',
  is_active boolean not null default false,
  product_id text,
  store text,
  expires_at timestamptz,
  rc_event_id text,
  raw jsonb,
  updated_at timestamptz not null default now()
);

create index if not exists subscriptions_active_idx
  on public.subscriptions (user_id)
  where is_active;

alter table public.subscriptions enable row level security;

-- Users can read their own subscription row. Writes are service-role only.
drop policy if exists "Users can read own subscription" on public.subscriptions;

create policy "Users can read own subscription"
  on public.subscriptions for select
  using (auth.uid() = user_id);

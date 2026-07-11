-- Server-side subscription entitlements, sourced from RevenueCat webhooks.
-- The revenuecat-webhook edge function upserts rows via the service role; this is the
-- authoritative record used to gate paid features (e.g. Future You full-resolution result).
-- Clients read their own row; only the service role may write.
-- Safe to run multiple times.

create table if not exists public.future_you_entitlements (
  user_id uuid primary key references auth.users (id) on delete cascade,
  entitlement_id text not null default 'pro',
  is_active boolean not null default false,
  product_id text,
  store text,
  environment text,
  period_type text,
  expires_at timestamptz,
  original_app_user_id text,
  last_event_type text,
  last_event_at timestamptz,
  updated_at timestamptz not null default now()
);

create index if not exists future_you_entitlements_active_idx
  on public.future_you_entitlements (user_id)
  where is_active;

alter table public.future_you_entitlements enable row level security;

-- Read-only for the owning user. Writes happen exclusively via the service role
-- (RevenueCat webhook), which bypasses RLS — so no insert/update/delete policies exist.
drop policy if exists "Users can read own entitlement" on public.future_you_entitlements;

create policy "Users can read own entitlement"
  on public.future_you_entitlements for select
  to authenticated
  using (auth.uid() = user_id);

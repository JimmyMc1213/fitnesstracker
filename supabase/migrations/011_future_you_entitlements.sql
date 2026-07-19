-- Server-side pro entitlement (RevenueCat webhook + sync-pro-entitlement).
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
  on public.future_you_entitlements (is_active, expires_at);

alter table public.future_you_entitlements enable row level security;

-- Clients never read/write directly; edge functions use service role.
revoke all on public.future_you_entitlements from anon, authenticated;

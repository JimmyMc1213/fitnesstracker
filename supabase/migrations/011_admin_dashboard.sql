-- Admin dashboard: integration credentials + audit log.
-- Both tables are service-role only (no user-facing policies). RLS is enabled
-- with no policies, so the anon/auth keys can never read or write them; the
-- admin app reaches them exclusively via the service-role key on the server.
-- Safe to run multiple times.

create table if not exists public.admin_integrations (
  provider text primary key,
  enabled boolean not null default false,
  credentials jsonb not null default '{}'::jsonb,
  config jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.admin_integrations enable row level security;

create table if not exists public.admin_audit_log (
  id uuid primary key default gen_random_uuid(),
  admin_email text not null,
  action text not null,
  target_type text,
  target_id text,
  detail text,
  before jsonb,
  after jsonb,
  created_at timestamptz not null default now()
);

create index if not exists admin_audit_log_created_idx
  on public.admin_audit_log (created_at desc);

create index if not exists admin_audit_log_target_idx
  on public.admin_audit_log (target_type, target_id);

alter table public.admin_audit_log enable row level security;

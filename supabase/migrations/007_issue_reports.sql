-- In-app user issue reports (Settings → Report a problem).
-- Edge function inserts rows (service role). Safe to run multiple times.

create table if not exists public.issue_reports (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  category text not null,
  message text,
  app_version text,
  platform text,
  device_model text,
  linear_issue_id text,
  linear_issue_url text,
  created_at timestamptz not null default now(),
  constraint issue_reports_category_check
    check (category in ('bug', 'feature', 'other'))
);

create index if not exists issue_reports_user_created_idx
  on public.issue_reports (user_id, created_at desc);

alter table public.issue_reports enable row level security;

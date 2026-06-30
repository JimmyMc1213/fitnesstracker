-- Moderation status for admin triage of Future You reports and issue reports.
-- Lets the admin dashboard mark items resolved/dismissed (vs the prior
-- insert-only tables). Safe to run multiple times.

alter table public.future_you_reports
  add column if not exists status text not null default 'open',
  add column if not exists resolved_at timestamptz,
  add column if not exists resolved_by text;

alter table public.issue_reports
  add column if not exists status text not null default 'open',
  add column if not exists resolved_at timestamptz,
  add column if not exists resolved_by text;

create index if not exists future_you_reports_status_idx
  on public.future_you_reports (status, created_at desc);

create index if not exists issue_reports_status_idx
  on public.issue_reports (status, created_at desc);

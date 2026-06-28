-- Link Future You quality reports to Linear issues (edge function creates issues).
-- Safe to run multiple times.

alter table public.future_you_reports
  add column if not exists linear_issue_id text,
  add column if not exists linear_issue_url text;

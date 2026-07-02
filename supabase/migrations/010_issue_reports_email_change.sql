-- Allow email-change category for Settings → You → email change requests.

alter table public.issue_reports
  drop constraint if exists issue_reports_category_check;

alter table public.issue_reports
  add constraint issue_reports_category_check
  check (category in ('bug', 'feature', 'other', 'email-change'));

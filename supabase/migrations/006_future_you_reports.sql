-- Future You user reports (build checklist step 26).
-- Edge function inserts rows (service role). Safe to run multiple times.

create table if not exists public.future_you_reports (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  job_id uuid references public.future_you_jobs (id) on delete set null,
  context text not null,
  category text not null,
  message text,
  created_at timestamptz not null default now(),
  constraint future_you_reports_context_check
    check (context in ('onboarding_success', 'home')),
  constraint future_you_reports_category_check
    check (category in ('not_accurate', 'offensive', 'unrealistic', 'other'))
);

create index if not exists future_you_reports_user_created_idx
  on public.future_you_reports (user_id, created_at desc);

alter table public.future_you_reports enable row level security;

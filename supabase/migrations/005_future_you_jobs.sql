-- Future You generation jobs (build checklist step 6).
-- Edge functions create/update rows (service role). Clients read own rows or poll via edge fn.
-- Safe to run multiple times.

create table if not exists public.future_you_jobs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  status text not null default 'queued',
  motivation_id text not null,
  source_photo_path text,
  result_photo_path text,
  error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint future_you_jobs_status_check
    check (status in ('queued', 'generating', 'ready', 'failed'))
);

create index if not exists future_you_jobs_user_created_idx
  on public.future_you_jobs (user_id, created_at desc);

-- One in-flight job per user during onboarding (queued or generating).
create unique index if not exists future_you_jobs_one_active_per_user
  on public.future_you_jobs (user_id)
  where status in ('queued', 'generating');

alter table public.future_you_jobs enable row level security;

drop policy if exists "Users can read own future you jobs" on public.future_you_jobs;

create policy "Users can read own future you jobs"
  on public.future_you_jobs for select
  to authenticated
  using (auth.uid() = user_id);

-- Future You: store the mainline model's auto-revised prompt for an audit trail
-- (maskless Responses-API generation pipeline). Safe to run multiple times.

alter table public.future_you_jobs
  add column if not exists revised_prompt text;

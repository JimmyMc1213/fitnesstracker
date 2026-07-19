-- Security fix: durable, cross-instance rate limiting for food-search.
-- The edge function's in-memory limiter resets per cold start and is not shared
-- across instances. This adds a Postgres-backed sliding window keyed by user,
-- exposed via a SECURITY DEFINER function so clients cannot tamper with counters.
-- The edge function calls this and falls back to its in-memory limiter if the
-- function is unavailable, so search never hard-fails on a DB hiccup.
-- Safe to run multiple times.

create table if not exists public.food_search_rate_limits (
  user_id uuid primary key references auth.users (id) on delete cascade,
  window_start_ms bigint not null,
  count integer not null default 0
);

alter table public.food_search_rate_limits enable row level security;
-- No policies: the table is only ever touched by the SECURITY DEFINER function
-- below, never directly by client roles.

create or replace function public.check_food_search_rate_limit(
  p_max integer,
  p_window_ms bigint
) returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_now bigint := (extract(epoch from clock_timestamp()) * 1000)::bigint;
  v_uid uuid := auth.uid();
  v_row public.food_search_rate_limits%rowtype;
begin
  if v_uid is null then
    return false;
  end if;

  select * into v_row
  from public.food_search_rate_limits
  where user_id = v_uid
  for update;

  if not found or (v_now - v_row.window_start_ms) >= p_window_ms then
    insert into public.food_search_rate_limits (user_id, window_start_ms, count)
    values (v_uid, v_now, 1)
    on conflict (user_id) do update
      set window_start_ms = v_now, count = 1;
    return true;
  end if;

  if v_row.count >= p_max then
    return false;
  end if;

  update public.food_search_rate_limits
    set count = count + 1
  where user_id = v_uid;

  return true;
end;
$$;

revoke all on function public.check_food_search_rate_limit(integer, bigint) from public;
grant execute on function public.check_food_search_rate_limit(integer, bigint) to authenticated;

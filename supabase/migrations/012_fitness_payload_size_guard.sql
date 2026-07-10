-- Security fix: enforce the fitness sync payload size limit server-side.
-- The client caps payloads at ~2 MB (MAX_FITNESS_PAYLOAD_BYTES), but that guard
-- is client-only and `fitness_user_data` is written directly via RLS. A malicious
-- client could otherwise write arbitrarily large blobs. The DB ceiling is set to
-- 4 MB — comfortably above the compliant ~2 MB client cap so legitimate syncs are
-- never rejected, while still bounding abuse.
-- Safe to run multiple times.

create or replace function public.enforce_fitness_payload_size()
returns trigger
language plpgsql
as $$
begin
  if octet_length(new.payload::text) > 4194304 then
    raise exception 'fitness payload too large'
      using errcode = 'check_violation';
  end if;
  return new;
end;
$$;

drop trigger if exists fitness_user_data_payload_size on public.fitness_user_data;

create trigger fitness_user_data_payload_size
  before insert or update on public.fitness_user_data
  for each row execute function public.enforce_fitness_payload_size();

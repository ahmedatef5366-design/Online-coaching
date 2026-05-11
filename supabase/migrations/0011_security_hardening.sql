-- =============================================================================
-- Security hardening (Phase 10)
-- =============================================================================
-- This migration closes three privilege-escalation gaps that the original
-- RLS policies did not cover:
--
--   1. `profiles_self_update` lets a user UPDATE their own profile row.
--      Because Postgres RLS gates the row, not individual columns, a
--      logged-in client could change `role` to 'admin' from the browser:
--
--        await supabase
--          .from('profiles')
--          .update({ role: 'admin' })
--          .eq('id', userId);
--
--      → instant privilege escalation. This migration adds a BEFORE
--      UPDATE trigger that blocks `role` changes unless the caller is
--      either the service role (auth.uid() is null) or already an admin.
--
--   2. `clients_self_update` lets a client UPDATE their own clients row.
--      Same shape: a client could set `subscription_status = 'active'`
--      and `subscription_ends_at` to a far-future date, bypassing the
--      subscription gate enforced in middleware. The trigger here blocks
--      changes to subscription / admin-managed columns for non-admins.
--
--   3. `handle_new_user` reads `role` from `raw_user_meta_data`. If the
--      Supabase project ever enables anon self-signup, a hostile user
--      could call `supabase.auth.signUp({ email, password, options: {
--      data: { role: 'admin' }}})` and the trigger would dutifully
--      create them a profile with role='admin'. We pin the trigger to
--      always insert `role = 'client'`; admin role must be assigned
--      explicitly by service-role code (bootstrap script / createNewClient).
--
-- All changes are idempotent.
-- -----------------------------------------------------------------------------

-- ---------------------------------------------------------------------------
-- 1. profiles.role guard
-- ---------------------------------------------------------------------------
create or replace function public.guard_profile_role_update()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  -- Service-role / migration / trigger-from-trigger context — auth.uid()
  -- has no JWT and returns null. Allow.
  if auth.uid() is null then
    return new;
  end if;
  -- Admins may change anyone's role (e.g. promote/demote).
  if public.is_admin() then
    return new;
  end if;
  -- Non-admins must not modify the role column at all.
  if old.role is distinct from new.role then
    raise exception using
      errcode = '42501',
      message = 'permission denied: only admins can change role';
  end if;
  return new;
end;
$$;

drop trigger if exists trg_profiles_guard_role on public.profiles;
create trigger trg_profiles_guard_role
  before update on public.profiles
  for each row execute function public.guard_profile_role_update();

-- ---------------------------------------------------------------------------
-- 2. clients admin-managed columns guard
-- ---------------------------------------------------------------------------
create or replace function public.guard_clients_admin_columns()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  -- Service-role / migration context — allow.
  if auth.uid() is null then
    return new;
  end if;
  -- Admins may change everything.
  if public.is_admin() then
    return new;
  end if;
  -- Non-admins (clients editing their own row) cannot touch
  -- admin-managed columns. We compare each column with `is distinct
  -- from` so NULL → NULL transitions are correctly treated as "no
  -- change".
  if old.user_id                is distinct from new.user_id
     or old.subscription_status    is distinct from new.subscription_status
     or old.subscription_starts_at is distinct from new.subscription_starts_at
     or old.subscription_ends_at   is distinct from new.subscription_ends_at
     or old.last_payment_at        is distinct from new.last_payment_at
     or old.last_payment_id        is distinct from new.last_payment_id
     or old.is_archived            is distinct from new.is_archived
     or old.coach_notes            is distinct from new.coach_notes
  then
    raise exception using
      errcode = '42501',
      message = 'permission denied: admin-managed columns on clients';
  end if;
  return new;
end;
$$;

drop trigger if exists trg_clients_guard_admin_columns on public.clients;
create trigger trg_clients_guard_admin_columns
  before update on public.clients
  for each row execute function public.guard_clients_admin_columns();

-- ---------------------------------------------------------------------------
-- 3. handle_new_user — always default role='client'
-- ---------------------------------------------------------------------------
-- The function previously honoured `raw_user_meta_data ->> 'role'`,
-- letting anyone who could call supabase.auth.signUp() request
-- role='admin' via the metadata payload. Self-signup is disabled at the
-- application layer today, but the database trigger should be safe even
-- if the Supabase project ever flips signup back on.
--
-- Admin role is assigned by privileged code paths only (the
-- bootstrap-admin script and the createNewClient server action, both of
-- which run with the service-role key and explicitly upsert the profile
-- row with the desired role afterwards).
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, role, full_name)
  values (
    new.id,
    new.email,
    'client',
    coalesce(new.raw_user_meta_data ->> 'full_name', split_part(new.email, '@', 1))
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- 4. Length caps on coaching_applications text fields
-- ---------------------------------------------------------------------------
-- The public form accepts anonymous inserts (anon RLS). Several text
-- columns had no length limit at the DB level, so a single submission
-- could ship a multi-megabyte blob and slowly bloat the table. The cap
-- here matches the server-action validator and is intentionally
-- generous (4 KB per long-form field, 200 chars for short ones).
--
-- Wrapped in DO blocks so re-runs are no-ops.
do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'coaching_applications_motivation_text_len'
  ) then
    alter table public.coaching_applications
      add constraint coaching_applications_motivation_text_len
      check (motivation_text is null or length(motivation_text) <= 4000);
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'coaching_applications_previous_results_text_len'
  ) then
    alter table public.coaching_applications
      add constraint coaching_applications_previous_results_text_len
      check (previous_results_text is null or length(previous_results_text) <= 4000);
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'coaching_applications_injuries_or_conditions_len'
  ) then
    alter table public.coaching_applications
      add constraint coaching_applications_injuries_or_conditions_len
      check (injuries_or_conditions is null or length(injuries_or_conditions) <= 2000);
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'coaching_applications_medications_len'
  ) then
    alter table public.coaching_applications
      add constraint coaching_applications_medications_len
      check (medications is null or length(medications) <= 2000);
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'coaching_applications_allergies_len'
  ) then
    alter table public.coaching_applications
      add constraint coaching_applications_allergies_len
      check (allergies is null or length(allergies) <= 1000);
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'coaching_applications_surgeries_text_len'
  ) then
    alter table public.coaching_applications
      add constraint coaching_applications_surgeries_text_len
      check (surgeries_text is null or length(surgeries_text) <= 2000);
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'coaching_applications_dietary_restrictions_len'
  ) then
    alter table public.coaching_applications
      add constraint coaching_applications_dietary_restrictions_len
      check (dietary_restrictions is null or length(dietary_restrictions) <= 1000);
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'coaching_applications_foods_disliked_len'
  ) then
    alter table public.coaching_applications
      add constraint coaching_applications_foods_disliked_len
      check (foods_disliked is null or length(foods_disliked) <= 1000);
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'coaching_applications_current_diet_summary_len'
  ) then
    alter table public.coaching_applications
      add constraint coaching_applications_current_diet_summary_len
      check (current_diet_summary is null or length(current_diet_summary) <= 2000);
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'coaching_applications_available_equipment_text_len'
  ) then
    alter table public.coaching_applications
      add constraint coaching_applications_available_equipment_text_len
      check (available_equipment_text is null or length(available_equipment_text) <= 1000);
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'coaching_applications_occupation_len'
  ) then
    alter table public.coaching_applications
      add constraint coaching_applications_occupation_len
      check (occupation is null or length(occupation) <= 200);
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'coaching_applications_notes_len'
  ) then
    alter table public.coaching_applications
      add constraint coaching_applications_notes_len
      check (notes is null or length(notes) <= 4000);
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'coaching_applications_full_name_len'
  ) then
    alter table public.coaching_applications
      add constraint coaching_applications_full_name_len
      check (length(full_name) between 1 and 200);
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'coaching_applications_email_len'
  ) then
    alter table public.coaching_applications
      add constraint coaching_applications_email_len
      check (length(email) between 3 and 200);
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'coaching_applications_phone_len'
  ) then
    alter table public.coaching_applications
      add constraint coaching_applications_phone_len
      check (length(phone) between 1 and 40);
  end if;
end $$;

-- ---------------------------------------------------------------------------
-- 5. Storage bucket — server-side size + MIME enforcement
-- ---------------------------------------------------------------------------
-- The client-side gallery already enforces 8 MB + an image-type
-- allowlist, but a determined uploader can hit the Supabase storage API
-- directly with the publishable key. Set the bucket's
-- `file_size_limit` and `allowed_mime_types` so the server rejects
-- oversize or non-image uploads at the edge.
update storage.buckets
   set file_size_limit = 10 * 1024 * 1024,  -- 10 MB
       allowed_mime_types = array[
         'image/jpeg',
         'image/png',
         'image/webp',
         'image/heic',
         'image/heif'
       ]
 where id = 'progress-photos';

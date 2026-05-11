-- =============================================================================
-- Security hardening pass 2
-- =============================================================================
-- This follows up the privilege-escalation fixes in 0011 with three more
-- column-level write-protection gaps the original RLS policies left open:
--
--   1. `messages_update_read` lets the recipient mark a thread as read,
--      but Postgres RLS gates the row, not which column changes. A
--      client could call
--
--        await supabase
--          .from('messages')
--          .update({ body: 'tampered' })
--          .eq('client_id', mineId)
--          .neq('sender_id', myUserId);
--
--      and silently rewrite every admin message in their own thread.
--      The trigger below allows only `read_at` to change in non-admin
--      / non-sender updates.
--
--   2. `profiles_self_update` extended to also lock `email`, `id`, and
--      `created_at`. Authentication uses `auth.users.email` so changing
--      `profiles.email` does not give login access, but it does desync
--      the admin UI and lets a client impersonate another address in
--      lists / inbox previews. `created_at` is informational and should
--      not be back-dateable.
--
--   3. `recompute_client_subscription` is `security definer` and was
--      EXECUTE-able by `public` (Postgres default). Tighten to
--      authenticated + service_role only — anon visitors have no
--      legitimate reason to call it, and the function is the only RPC
--      that triggers the subscription guard trigger code path.
--
-- All changes are idempotent.
-- -----------------------------------------------------------------------------

-- ---------------------------------------------------------------------------
-- 1. messages — only `read_at` may change on UPDATE for non-admins.
-- ---------------------------------------------------------------------------
create or replace function public.guard_messages_update()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  -- Service-role / migration context.
  if auth.uid() is null then
    return new;
  end if;
  -- Admins may rewrite anything (used for moderation in the future).
  if public.is_admin() then
    return new;
  end if;

  -- Non-admins must not change identity / authorship / payload columns.
  -- The only legitimate write here is flipping read_at from null → now()
  -- via markThreadRead(). Anything else is tampering with the other
  -- party's message.
  if old.id          is distinct from new.id
     or old.client_id is distinct from new.client_id
     or old.sender_id is distinct from new.sender_id
     or old.body      is distinct from new.body
     or old.created_at is distinct from new.created_at
  then
    raise exception using
      errcode = '42501',
      message = 'permission denied: only read_at may change';
  end if;

  -- Once a message is marked read, the receipt is final.
  if old.read_at is not null and new.read_at is distinct from old.read_at then
    raise exception using
      errcode = '42501',
      message = 'permission denied: read_at is immutable once set';
  end if;

  return new;
end;
$$;

drop trigger if exists trg_guard_messages_update on public.messages;
create trigger trg_guard_messages_update
  before update on public.messages
  for each row execute function public.guard_messages_update();

-- ---------------------------------------------------------------------------
-- 2. profiles — extend the role guard to also block email / id /
--    created_at tampering by non-admins. Replaces 0011's narrower
--    role-only function with one that covers every admin-managed
--    column on the row.
-- ---------------------------------------------------------------------------
create or replace function public.guard_profile_role_update()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    return new;
  end if;
  if public.is_admin() then
    return new;
  end if;

  if old.role is distinct from new.role then
    raise exception using
      errcode = '42501',
      message = 'permission denied: only admins can change role';
  end if;
  if old.id is distinct from new.id then
    raise exception using
      errcode = '42501',
      message = 'permission denied: id is immutable';
  end if;
  if old.email is distinct from new.email then
    raise exception using
      errcode = '42501',
      message = 'permission denied: email is managed via auth.users';
  end if;
  if old.created_at is distinct from new.created_at then
    raise exception using
      errcode = '42501',
      message = 'permission denied: created_at is immutable';
  end if;

  return new;
end;
$$;

-- 0011 already attached this trigger; recreate idempotently so the
-- updated function body is bound.
drop trigger if exists trg_guard_profile_role_update on public.profiles;
create trigger trg_guard_profile_role_update
  before update on public.profiles
  for each row execute function public.guard_profile_role_update();

-- ---------------------------------------------------------------------------
-- 3. Tighten EXECUTE on the security-definer subscription helper. Default
--    Postgres grants EXECUTE to `public`; revoke and grant only to the
--    roles that actually need it.
-- ---------------------------------------------------------------------------
revoke all on function public.recompute_client_subscription(uuid) from public;
grant execute on function public.recompute_client_subscription(uuid)
  to authenticated, service_role;

-- =============================================================================
-- Messages — in-app chat between coach (admin) and client
-- =============================================================================
-- Conversation grain: one per `clients.id`. Either side can post, both sides
-- read everything in their own thread. Coach (admin) sees a list of all
-- threads with unread counts; client sees only their own.
-- -----------------------------------------------------------------------------

create table if not exists public.messages (
  id          uuid primary key default gen_random_uuid(),
  client_id   uuid not null references public.clients(id) on delete cascade,
  sender_id   uuid not null references public.profiles(id) on delete cascade,
  body        text not null check (length(body) between 1 and 4000),
  created_at  timestamptz not null default now(),
  read_at     timestamptz
);

create index if not exists idx_messages_client_created
  on public.messages (client_id, created_at);
create index if not exists idx_messages_unread
  on public.messages (client_id) where read_at is null;
create index if not exists idx_messages_sender
  on public.messages (sender_id);

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------
alter table public.messages enable row level security;

-- Helper: rows in this thread are visible to the owning client OR any admin.
drop policy if exists "messages_read" on public.messages;
create policy "messages_read"
  on public.messages
  for select
  to authenticated
  using (
    exists (
      select 1 from public.clients c
      where c.id = messages.client_id
        and c.user_id = auth.uid()
    )
    or exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );

-- Insert rules:
--   * sender_id must be the calling user (no spoofing)
--   * either: the user is the owning client, OR the user is an admin
drop policy if exists "messages_insert" on public.messages;
create policy "messages_insert"
  on public.messages
  for insert
  to authenticated
  with check (
    sender_id = auth.uid()
    and (
      exists (
        select 1 from public.clients c
        where c.id = messages.client_id
          and c.user_id = auth.uid()
      )
      or exists (
        select 1 from public.profiles p
        where p.id = auth.uid() and p.role = 'admin'
      )
    )
  );

-- Update rules — only used to flip read_at, and only by the *recipient*.
-- (Postgres RLS policies operate row-by-row, so we restrict updates to
-- rows where the sender is *not* the caller, but the caller still belongs
-- to the conversation.)
drop policy if exists "messages_update_read" on public.messages;
create policy "messages_update_read"
  on public.messages
  for update
  to authenticated
  using (
    sender_id <> auth.uid()
    and (
      exists (
        select 1 from public.clients c
        where c.id = messages.client_id
          and c.user_id = auth.uid()
      )
      or exists (
        select 1 from public.profiles p
        where p.id = auth.uid() and p.role = 'admin'
      )
    )
  )
  with check (
    sender_id <> auth.uid()
    and (
      exists (
        select 1 from public.clients c
        where c.id = messages.client_id
          and c.user_id = auth.uid()
      )
      or exists (
        select 1 from public.profiles p
        where p.id = auth.uid() and p.role = 'admin'
      )
    )
  );

-- No delete policy → deletes are forbidden by default under RLS.

-- ---------------------------------------------------------------------------
-- Realtime — enable change-data-capture on the messages table so the
-- Supabase Realtime extension streams INSERT events to subscribed clients.
-- Wrapped in DO so re-runs against an existing publication are no-ops.
-- ---------------------------------------------------------------------------
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'messages'
  ) then
    execute 'alter publication supabase_realtime add table public.messages';
  end if;
exception when undefined_object then
  -- supabase_realtime publication not present (e.g. local dev without
  -- the realtime extension) — ignore.
  null;
end $$;

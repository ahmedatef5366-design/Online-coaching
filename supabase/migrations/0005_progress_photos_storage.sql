-- =============================================================================
-- Storage bucket for progress photos (private; RLS-scoped to owner client + admins)
-- =============================================================================

insert into storage.buckets (id, name, public)
values ('progress-photos', 'progress-photos', false)
on conflict (id) do nothing;

-- Helper: extract client_id from object path "<client_id>/<filename>"
create or replace function public.storage_path_client_id(path text)
returns uuid
language sql
immutable
as $$
  select (split_part(path, '/', 1))::uuid;
$$;

-- ---------------------------------------------------------------------------
-- Policies
-- ---------------------------------------------------------------------------
drop policy if exists progress_photos_select on storage.objects;
create policy progress_photos_select
  on storage.objects for select
  using (
    bucket_id = 'progress-photos'
    and (
      public.is_admin()
      or public.current_client_id() = public.storage_path_client_id(name)
    )
  );

drop policy if exists progress_photos_insert on storage.objects;
create policy progress_photos_insert
  on storage.objects for insert
  with check (
    bucket_id = 'progress-photos'
    and (
      public.is_admin()
      or public.current_client_id() = public.storage_path_client_id(name)
    )
  );

drop policy if exists progress_photos_delete on storage.objects;
create policy progress_photos_delete
  on storage.objects for delete
  using (
    bucket_id = 'progress-photos'
    and (
      public.is_admin()
      or public.current_client_id() = public.storage_path_client_id(name)
    )
  );

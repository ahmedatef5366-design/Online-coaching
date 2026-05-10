-- =============================================================================
-- Row-Level Security policies
-- =============================================================================
-- Each protected table is enabled with RLS. The general pattern is:
--   * The owning client can read/write their own rows.
--   * Admins (profiles.role = 'admin') can read/write all rows.
--   * Public-facing tables (food_database, published site_content) are
--     readable by anon for landing-page consumption.
-- -----------------------------------------------------------------------------

-- helper: is current user an admin?
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

-- helper: client_id owned by the current auth user
create or replace function public.current_client_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select id from public.clients where user_id = auth.uid();
$$;

-- ---------------------------------------------------------------------------
-- profiles
-- ---------------------------------------------------------------------------
alter table public.profiles enable row level security;

drop policy if exists profiles_self_read on public.profiles;
create policy profiles_self_read
  on public.profiles for select
  using (id = auth.uid() or public.is_admin());

drop policy if exists profiles_self_update on public.profiles;
create policy profiles_self_update
  on public.profiles for update
  using (id = auth.uid() or public.is_admin())
  with check (id = auth.uid() or public.is_admin());

drop policy if exists profiles_admin_insert on public.profiles;
create policy profiles_admin_insert
  on public.profiles for insert
  with check (public.is_admin());

-- ---------------------------------------------------------------------------
-- clients
-- ---------------------------------------------------------------------------
alter table public.clients enable row level security;

drop policy if exists clients_self_read on public.clients;
create policy clients_self_read
  on public.clients for select
  using (user_id = auth.uid() or public.is_admin());

drop policy if exists clients_admin_write on public.clients;
create policy clients_admin_write
  on public.clients for all
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists clients_self_update on public.clients;
create policy clients_self_update
  on public.clients for update
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- ---------------------------------------------------------------------------
-- workout_plans / workout_days / exercises  (admin-managed, client-readable)
-- ---------------------------------------------------------------------------
alter table public.workout_plans enable row level security;
alter table public.workout_days enable row level security;
alter table public.exercises enable row level security;

drop policy if exists workout_plans_read on public.workout_plans;
create policy workout_plans_read on public.workout_plans for select
  using (
    public.is_admin()
    or client_id = public.current_client_id()
  );

drop policy if exists workout_plans_admin_write on public.workout_plans;
create policy workout_plans_admin_write on public.workout_plans for all
  using (public.is_admin()) with check (public.is_admin());

drop policy if exists workout_days_read on public.workout_days;
create policy workout_days_read on public.workout_days for select
  using (
    public.is_admin()
    or exists (
      select 1 from public.workout_plans p
      where p.id = workout_days.plan_id
        and p.client_id = public.current_client_id()
    )
  );

drop policy if exists workout_days_admin_write on public.workout_days;
create policy workout_days_admin_write on public.workout_days for all
  using (public.is_admin()) with check (public.is_admin());

drop policy if exists exercises_read on public.exercises;
create policy exercises_read on public.exercises for select
  using (
    public.is_admin()
    or exists (
      select 1
      from public.workout_days d
      join public.workout_plans p on p.id = d.plan_id
      where d.id = exercises.day_id
        and p.client_id = public.current_client_id()
    )
  );

drop policy if exists exercises_admin_write on public.exercises;
create policy exercises_admin_write on public.exercises for all
  using (public.is_admin()) with check (public.is_admin());

-- ---------------------------------------------------------------------------
-- workout_logs  (client-owned)
-- ---------------------------------------------------------------------------
alter table public.workout_logs enable row level security;

drop policy if exists workout_logs_owner on public.workout_logs;
create policy workout_logs_owner on public.workout_logs for all
  using (client_id = public.current_client_id() or public.is_admin())
  with check (client_id = public.current_client_id() or public.is_admin());

-- ---------------------------------------------------------------------------
-- nutrition_plans / meals  (admin-managed, client-readable)
-- ---------------------------------------------------------------------------
alter table public.nutrition_plans enable row level security;
alter table public.meals enable row level security;

drop policy if exists nutrition_plans_read on public.nutrition_plans;
create policy nutrition_plans_read on public.nutrition_plans for select
  using (public.is_admin() or client_id = public.current_client_id());

drop policy if exists nutrition_plans_admin_write on public.nutrition_plans;
create policy nutrition_plans_admin_write on public.nutrition_plans for all
  using (public.is_admin()) with check (public.is_admin());

drop policy if exists meals_read on public.meals;
create policy meals_read on public.meals for select
  using (
    public.is_admin()
    or exists (
      select 1 from public.nutrition_plans np
      where np.id = meals.plan_id
        and np.client_id = public.current_client_id()
    )
  );

drop policy if exists meals_admin_write on public.meals;
create policy meals_admin_write on public.meals for all
  using (public.is_admin()) with check (public.is_admin());

-- ---------------------------------------------------------------------------
-- food_database  (everyone reads, admins manage)
-- ---------------------------------------------------------------------------
alter table public.food_database enable row level security;

drop policy if exists food_db_read_all on public.food_database;
create policy food_db_read_all on public.food_database for select using (true);

drop policy if exists food_db_admin_write on public.food_database;
create policy food_db_admin_write on public.food_database for all
  using (public.is_admin()) with check (public.is_admin());

-- ---------------------------------------------------------------------------
-- food_logs / body_measurements / weight_logs / progress_photos / daily_checkins
--   (client-owned)
-- ---------------------------------------------------------------------------
alter table public.food_logs enable row level security;
alter table public.body_measurements enable row level security;
alter table public.weight_logs enable row level security;
alter table public.progress_photos enable row level security;
alter table public.daily_checkins enable row level security;

create or replace function public.assert_owner_or_admin(target_client uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select target_client = public.current_client_id() or public.is_admin();
$$;

drop policy if exists food_logs_owner on public.food_logs;
create policy food_logs_owner on public.food_logs for all
  using (public.assert_owner_or_admin(client_id))
  with check (public.assert_owner_or_admin(client_id));

drop policy if exists body_measurements_owner on public.body_measurements;
create policy body_measurements_owner on public.body_measurements for all
  using (public.assert_owner_or_admin(client_id))
  with check (public.assert_owner_or_admin(client_id));

drop policy if exists weight_logs_owner on public.weight_logs;
create policy weight_logs_owner on public.weight_logs for all
  using (public.assert_owner_or_admin(client_id))
  with check (public.assert_owner_or_admin(client_id));

drop policy if exists progress_photos_owner on public.progress_photos;
create policy progress_photos_owner on public.progress_photos for all
  using (public.assert_owner_or_admin(client_id))
  with check (public.assert_owner_or_admin(client_id));

drop policy if exists daily_checkins_owner on public.daily_checkins;
create policy daily_checkins_owner on public.daily_checkins for all
  using (public.assert_owner_or_admin(client_id))
  with check (public.assert_owner_or_admin(client_id));

-- ---------------------------------------------------------------------------
-- site_content  (anyone reads published; only admins write)
-- ---------------------------------------------------------------------------
alter table public.site_content enable row level security;

drop policy if exists site_content_public_read on public.site_content;
create policy site_content_public_read
  on public.site_content for select
  using (is_published = true or public.is_admin());

drop policy if exists site_content_admin_write on public.site_content;
create policy site_content_admin_write
  on public.site_content for all
  using (public.is_admin()) with check (public.is_admin());

-- =============================================================================
-- Coaching platform — initial schema (Phase 1)
-- =============================================================================
-- Conventions:
--   * UUID primary keys generated with gen_random_uuid()
--   * timestamptz for all timestamps; updated_at maintained via trigger
--   * "profiles" extends auth.users (Supabase native auth) with role + name
--   * "clients" holds coaching-specific personal info per client user
-- -----------------------------------------------------------------------------

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------
do $$ begin
  create type public.user_role as enum ('admin', 'client');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.experience_level as enum ('beginner', 'intermediate', 'advanced');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.training_goal as enum (
    'fat_loss', 'muscle_gain', 'recomposition', 'athletic_performance'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.nutrition_mode as enum ('fixed', 'flexible');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.workout_done_status as enum ('yes', 'partial', 'no');
exception when duplicate_object then null; end $$;

-- ---------------------------------------------------------------------------
-- updated_at trigger helper
-- ---------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- profiles  (1:1 with auth.users)
-- ---------------------------------------------------------------------------
create table if not exists public.profiles (
  id                uuid primary key references auth.users(id) on delete cascade,
  email             text not null unique,
  role              public.user_role not null default 'client',
  full_name         text,
  preferred_locale  text not null default 'en',
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

drop trigger if exists trg_profiles_updated_at on public.profiles;
create trigger trg_profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- Auto-create a profile row when a new auth.users row is inserted.
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
    coalesce((new.raw_user_meta_data ->> 'role')::public.user_role, 'client'),
    coalesce(new.raw_user_meta_data ->> 'full_name', split_part(new.email, '@', 1))
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- clients  (coaching-specific personal info)
-- ---------------------------------------------------------------------------
create table if not exists public.clients (
  id                  uuid primary key default gen_random_uuid(),
  user_id             uuid not null unique references public.profiles(id) on delete cascade,
  age                 int,
  height_cm           numeric(5,1),
  starting_weight_kg  numeric(5,2),
  experience_level    public.experience_level,
  goal                public.training_goal,
  health_notes        text,
  start_date          date,
  target_date         date,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

drop trigger if exists trg_clients_updated_at on public.clients;
create trigger trg_clients_updated_at
  before update on public.clients
  for each row execute function public.set_updated_at();

create index if not exists idx_clients_user_id on public.clients(user_id);

-- ---------------------------------------------------------------------------
-- Workout plans
-- ---------------------------------------------------------------------------
create table if not exists public.workout_plans (
  id          uuid primary key default gen_random_uuid(),
  client_id   uuid not null references public.clients(id) on delete cascade,
  name        text not null,
  is_active   boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create index if not exists idx_workout_plans_client on public.workout_plans(client_id);
drop trigger if exists trg_workout_plans_updated_at on public.workout_plans;
create trigger trg_workout_plans_updated_at
  before update on public.workout_plans
  for each row execute function public.set_updated_at();

create table if not exists public.workout_days (
  id          uuid primary key default gen_random_uuid(),
  plan_id     uuid not null references public.workout_plans(id) on delete cascade,
  day_number  int not null,
  day_name    text not null,
  unique (plan_id, day_number)
);
create index if not exists idx_workout_days_plan on public.workout_days(plan_id);

create table if not exists public.exercises (
  id            uuid primary key default gen_random_uuid(),
  day_id        uuid not null references public.workout_days(id) on delete cascade,
  name          text not null,
  sets          int not null,
  reps          text not null,            -- "8-12" or "10" — kept as text for ranges
  rest_seconds  int not null default 90,
  notes         text,
  video_url     text,
  display_order int not null default 0,
  created_at    timestamptz not null default now()
);
create index if not exists idx_exercises_day on public.exercises(day_id);

-- Logged set performance per workout
create table if not exists public.workout_logs (
  id            uuid primary key default gen_random_uuid(),
  client_id     uuid not null references public.clients(id) on delete cascade,
  exercise_id   uuid not null references public.exercises(id) on delete cascade,
  log_date      date not null default current_date,
  set_number    int not null,
  weight_kg     numeric(6,2),
  reps_done     int,
  created_at    timestamptz not null default now()
);
create index if not exists idx_workout_logs_client_date
  on public.workout_logs(client_id, log_date);

-- ---------------------------------------------------------------------------
-- Nutrition
-- ---------------------------------------------------------------------------
create table if not exists public.nutrition_plans (
  id              uuid primary key default gen_random_uuid(),
  client_id       uuid not null references public.clients(id) on delete cascade,
  mode            public.nutrition_mode not null default 'flexible',
  calories_target int,
  protein_target  int,
  carbs_target    int,
  fat_target      int,
  is_active       boolean not null default true,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);
create index if not exists idx_nutrition_plans_client on public.nutrition_plans(client_id);
drop trigger if exists trg_nutrition_plans_updated_at on public.nutrition_plans;
create trigger trg_nutrition_plans_updated_at
  before update on public.nutrition_plans
  for each row execute function public.set_updated_at();

-- Fixed-mode meals (food_items stored as JSON array of {name, grams, kcal, p, c, f})
create table if not exists public.meals (
  id          uuid primary key default gen_random_uuid(),
  plan_id     uuid not null references public.nutrition_plans(id) on delete cascade,
  meal_type   text not null,            -- breakfast | lunch | dinner | snack | etc.
  food_items  jsonb not null default '[]'::jsonb,
  display_order int not null default 0
);
create index if not exists idx_meals_plan on public.meals(plan_id);

-- Shared food database used by flexible-mode logging
create table if not exists public.food_database (
  id                    uuid primary key default gen_random_uuid(),
  name                  text not null unique,
  name_ar               text,
  calories_per_100g     numeric(6,2) not null,
  protein_per_100g      numeric(6,2) not null,
  carbs_per_100g        numeric(6,2) not null,
  fat_per_100g          numeric(6,2) not null,
  is_custom             boolean not null default false,
  created_by            uuid references public.profiles(id) on delete set null,
  created_at            timestamptz not null default now()
);

-- Per-day flexible-mode food logging
create table if not exists public.food_logs (
  id                  uuid primary key default gen_random_uuid(),
  client_id           uuid not null references public.clients(id) on delete cascade,
  food_id             uuid not null references public.food_database(id) on delete restrict,
  log_date            date not null default current_date,
  weight_grams        numeric(7,1) not null,
  calculated_calories numeric(7,2) not null,
  calculated_protein  numeric(6,2) not null,
  calculated_carbs    numeric(6,2) not null,
  calculated_fat      numeric(6,2) not null,
  meal_type           text,
  created_at          timestamptz not null default now()
);
create index if not exists idx_food_logs_client_date
  on public.food_logs(client_id, log_date);

-- ---------------------------------------------------------------------------
-- Body tracking
-- ---------------------------------------------------------------------------
create table if not exists public.body_measurements (
  id                  uuid primary key default gen_random_uuid(),
  client_id           uuid not null references public.clients(id) on delete cascade,
  measured_on         date not null default current_date,
  weight_kg           numeric(5,2),
  waist_cm            numeric(5,2),
  chest_cm            numeric(5,2),
  shoulders_cm        numeric(5,2),
  hips_cm             numeric(5,2),
  left_arm_cm         numeric(5,2),
  right_arm_cm        numeric(5,2),
  left_thigh_cm       numeric(5,2),
  right_thigh_cm      numeric(5,2),
  body_fat_percent    numeric(4,1),
  created_at          timestamptz not null default now(),
  unique (client_id, measured_on)
);
create index if not exists idx_body_measurements_client
  on public.body_measurements(client_id, measured_on desc);

create table if not exists public.weight_logs (
  id          uuid primary key default gen_random_uuid(),
  client_id   uuid not null references public.clients(id) on delete cascade,
  log_date    date not null default current_date,
  weight_kg   numeric(5,2) not null,
  created_at  timestamptz not null default now(),
  unique (client_id, log_date)
);
create index if not exists idx_weight_logs_client
  on public.weight_logs(client_id, log_date desc);

create table if not exists public.progress_photos (
  id          uuid primary key default gen_random_uuid(),
  client_id   uuid not null references public.clients(id) on delete cascade,
  taken_on    date not null default current_date,
  storage_path text not null,           -- path inside the "progress-photos" storage bucket
  note        text,
  created_at  timestamptz not null default now()
);
create index if not exists idx_progress_photos_client
  on public.progress_photos(client_id, taken_on desc);

-- ---------------------------------------------------------------------------
-- Daily check-in / compliance self-rating
-- ---------------------------------------------------------------------------
create table if not exists public.daily_checkins (
  id                  uuid primary key default gen_random_uuid(),
  client_id           uuid not null references public.clients(id) on delete cascade,
  checkin_date        date not null default current_date,
  workout_done        public.workout_done_status not null,
  workout_sets_done   int,
  diet_compliance     int,                 -- 0..100
  cardio_done         boolean not null default false,
  cardio_minutes      int,
  sleep_quality       int,                 -- 1..5
  sleep_hours         numeric(3,1),
  client_note         text,
  created_at          timestamptz not null default now(),
  unique (client_id, checkin_date),
  constraint diet_compliance_range
    check (diet_compliance is null or diet_compliance between 0 and 100),
  constraint sleep_quality_range
    check (sleep_quality is null or sleep_quality between 1 and 5)
);
create index if not exists idx_daily_checkins_client
  on public.daily_checkins(client_id, checkin_date desc);

-- ---------------------------------------------------------------------------
-- Site content (landing page CMS)
-- ---------------------------------------------------------------------------
create table if not exists public.site_content (
  id            uuid primary key default gen_random_uuid(),
  section_key   text not null unique,
  content_json  jsonb not null default '{}'::jsonb,
  is_published  boolean not null default true,
  updated_at    timestamptz not null default now()
);
drop trigger if exists trg_site_content_updated_at on public.site_content;
create trigger trg_site_content_updated_at
  before update on public.site_content
  for each row execute function public.set_updated_at();

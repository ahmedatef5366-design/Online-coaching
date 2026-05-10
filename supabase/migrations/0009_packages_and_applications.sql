-- =============================================================================
-- Coaching platform — packages + applications (Phase 8)
-- =============================================================================
-- Adds two unrelated-but-co-located features:
--
--   1. `packages` — a sales catalog displayed on the public landing page and
--      managed by admins. Replaces the CMS-driven "pricing" section as the
--      source of truth for what plans the public can sign up for.
--
--   2. `coaching_applications` — public intake form submissions. Anonymous
--      visitors can POST a row (RLS allows insert from anon); admins read
--      and update them to track lead → client conversion.
--
-- Idempotent — safe to re-run on a project that already has these tables.
-- -----------------------------------------------------------------------------

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------
do $$ begin
  create type public.billing_period as enum (
    'monthly', 'quarterly', 'biannual', 'yearly', 'one_time'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.application_status as enum (
    'new', 'contacted', 'in_review', 'accepted', 'rejected', 'archived'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.activity_level as enum (
    'sedentary', 'light', 'moderate', 'active', 'very_active'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.training_location as enum ('home', 'gym', 'both');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.contact_method as enum ('whatsapp', 'phone', 'email');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.gender as enum ('male', 'female', 'other');
exception when duplicate_object then null; end $$;

-- ---------------------------------------------------------------------------
-- packages
-- ---------------------------------------------------------------------------
create table if not exists public.packages (
  id              uuid primary key default gen_random_uuid(),
  slug            text not null unique,
  name_en         text not null,
  name_ar         text not null,
  description_en  text not null default '',
  description_ar  text not null default '',
  price           numeric(10, 2) not null default 0,
  currency        text not null default 'USD',
  billing_period  public.billing_period not null default 'monthly',
  features_en     text[] not null default '{}'::text[],
  features_ar     text[] not null default '{}'::text[],
  cta_label_en    text,
  cta_label_ar    text,
  is_featured     boolean not null default false,
  is_active       boolean not null default true,
  display_order   int not null default 0,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

drop trigger if exists trg_packages_updated_at on public.packages;
create trigger trg_packages_updated_at
  before update on public.packages
  for each row execute function public.set_updated_at();

create index if not exists idx_packages_active_order
  on public.packages(is_active, display_order);

-- ---------------------------------------------------------------------------
-- coaching_applications
-- ---------------------------------------------------------------------------
create table if not exists public.coaching_applications (
  id                       uuid primary key default gen_random_uuid(),

  -- contact
  full_name                text not null,
  email                    text not null,
  phone                    text not null,
  country                  text,
  city                     text,
  preferred_contact        public.contact_method not null default 'whatsapp',
  best_contact_time        text,

  -- demographics + measurements
  age                      int,
  gender                   public.gender,
  height_cm                numeric(5, 1),
  weight_kg                numeric(5, 2),
  body_fat_percent         numeric(4, 1),

  -- goals
  goal                     public.training_goal,
  target_weight_kg         numeric(5, 2),
  target_date              date,
  motivation_text          text,

  -- experience
  experience_level         public.experience_level,
  previous_coaching        boolean not null default false,
  previous_results_text    text,

  -- training preferences
  training_days_per_week   int,
  training_location        public.training_location,
  available_equipment_text text,
  preferred_training_time  text,

  -- health
  injuries_or_conditions   text,
  medications              text,
  allergies                text,
  surgeries_text           text,

  -- nutrition
  dietary_restrictions     text,
  foods_disliked           text,
  current_diet_summary     text,
  water_intake_liters      numeric(4, 1),

  -- lifestyle
  occupation               text,
  daily_activity_level     public.activity_level,
  sleep_hours_avg          numeric(3, 1),
  stress_level             int,
  smokes                   boolean not null default false,

  -- selection + admin
  package_id               uuid references public.packages(id) on delete set null,
  notes                    text,
  locale                   text not null default 'en',
  status                   public.application_status not null default 'new',
  admin_notes              text,
  contacted_at             timestamptz,
  converted_client_id      uuid references public.clients(id) on delete set null,

  created_at               timestamptz not null default now(),
  updated_at               timestamptz not null default now(),

  constraint stress_level_range
    check (stress_level is null or stress_level between 1 and 5),
  constraint training_days_range
    check (training_days_per_week is null or training_days_per_week between 0 and 14)
);

drop trigger if exists trg_coaching_applications_updated_at on public.coaching_applications;
create trigger trg_coaching_applications_updated_at
  before update on public.coaching_applications
  for each row execute function public.set_updated_at();

create index if not exists idx_coaching_applications_status_created
  on public.coaching_applications(status, created_at desc);

create index if not exists idx_coaching_applications_package
  on public.coaching_applications(package_id);

-- ---------------------------------------------------------------------------
-- RLS — packages: anon reads active rows, admins manage all
-- ---------------------------------------------------------------------------
alter table public.packages enable row level security;

drop policy if exists packages_public_read on public.packages;
create policy packages_public_read
  on public.packages for select
  using (is_active = true or public.is_admin());

drop policy if exists packages_admin_write on public.packages;
create policy packages_admin_write
  on public.packages for all
  using (public.is_admin())
  with check (public.is_admin());

-- ---------------------------------------------------------------------------
-- RLS — coaching_applications: anyone can submit (insert), admins manage
-- ---------------------------------------------------------------------------
alter table public.coaching_applications enable row level security;

drop policy if exists coaching_applications_anon_insert on public.coaching_applications;
create policy coaching_applications_anon_insert
  on public.coaching_applications for insert
  with check (
    -- forbid inserting privileged/admin-managed columns from the public form
    status = 'new'
    and admin_notes is null
    and contacted_at is null
    and converted_client_id is null
  );

drop policy if exists coaching_applications_admin_read on public.coaching_applications;
create policy coaching_applications_admin_read
  on public.coaching_applications for select
  using (public.is_admin());

drop policy if exists coaching_applications_admin_update on public.coaching_applications;
create policy coaching_applications_admin_update
  on public.coaching_applications for update
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists coaching_applications_admin_delete on public.coaching_applications;
create policy coaching_applications_admin_delete
  on public.coaching_applications for delete
  using (public.is_admin());

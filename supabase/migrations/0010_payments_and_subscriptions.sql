-- =============================================================================
-- Coaching platform — manual payments + subscription lifecycle (Phase 9)
-- =============================================================================
-- There is NO online payment gateway. Clients pay the coach directly via
-- Vodafone Cash (or any other off-site method); the admin records the
-- receipt inside the app and that record is the source of truth for the
-- client's subscription.
--
-- Model:
--   * `payments`           — one row per receipt logged by the admin.
--                            Holds amount, method, optional proof image,
--                            and the billing window the payment covers.
--                            Can be linked to either a client or an
--                            application (before conversion).
--   * `clients.subscription_*` — denormalised summary of where the client
--                            sits in their plan: active / expired / never
--                            paid, current end date, last payment id.
--
-- Confirming a payment (via the admin action `confirmPayment`) advances
-- the linked client's subscription_ends_at by the payment's duration and
-- sets their status accordingly.
--
-- Idempotent — safe to re-run.
-- -----------------------------------------------------------------------------

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------
do $$ begin
  create type public.payment_status as enum (
    'pending', 'confirmed', 'rejected', 'refunded'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.payment_method as enum (
    'vodafone_cash', 'instapay', 'bank_transfer', 'cash', 'other'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.subscription_status as enum (
    'none', 'trialing', 'active', 'expiring_soon', 'expired', 'suspended'
  );
exception when duplicate_object then null; end $$;

-- ---------------------------------------------------------------------------
-- clients — subscription lifecycle columns
-- ---------------------------------------------------------------------------
alter table public.clients
  add column if not exists subscription_status        public.subscription_status not null default 'none',
  add column if not exists subscription_starts_at     date,
  add column if not exists subscription_ends_at       date,
  add column if not exists last_payment_at            timestamptz,
  add column if not exists last_payment_id            uuid;

create index if not exists idx_clients_subscription_ends_at
  on public.clients(subscription_ends_at);
create index if not exists idx_clients_subscription_status
  on public.clients(subscription_status);

-- ---------------------------------------------------------------------------
-- payments
-- ---------------------------------------------------------------------------
create table if not exists public.payments (
  id                 uuid primary key default gen_random_uuid(),

  -- linkage (either client_id OR application_id must be set; enforced below)
  client_id          uuid references public.clients(id) on delete set null,
  application_id     uuid references public.coaching_applications(id) on delete set null,
  package_id         uuid references public.packages(id) on delete set null,

  -- money
  amount             numeric(10, 2) not null,
  currency           text not null default 'EGP',
  method             public.payment_method not null default 'vodafone_cash',

  -- proof / reference
  reference_number   text,                              -- e.g. Vodafone Cash txn reference
  sender_phone       text,                              -- phone used to send the money
  receipt_url        text,                              -- storage path for the screenshot (optional)

  -- billing window this payment covers (driven by package or admin override)
  period_start       date,
  period_end         date,
  duration_days      int,                               -- redundant with period_end-period_start; kept for quick maths

  -- bookkeeping
  status             public.payment_status not null default 'pending',
  paid_at            timestamptz,                       -- when the client actually sent the money
  confirmed_at       timestamptz,                       -- when the admin confirmed in-app
  confirmed_by       uuid references public.profiles(id) on delete set null,

  notes              text,                              -- free-form admin notes
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now(),

  constraint payments_target_present
    check (client_id is not null or application_id is not null),
  constraint payments_amount_positive
    check (amount >= 0),
  constraint payments_duration_positive
    check (duration_days is null or duration_days > 0),
  constraint payments_period_consistent
    check (
      (period_start is null and period_end is null)
      or (period_start is not null and period_end is not null and period_end >= period_start)
    )
);

-- Retroactive foreign key from clients.last_payment_id → payments.id
-- (couldn't be declared inline because payments didn't exist yet).
do $$ begin
  alter table public.clients
    add constraint clients_last_payment_fk
    foreign key (last_payment_id) references public.payments(id) on delete set null;
exception when duplicate_object then null; end $$;

drop trigger if exists trg_payments_updated_at on public.payments;
create trigger trg_payments_updated_at
  before update on public.payments
  for each row execute function public.set_updated_at();

create index if not exists idx_payments_client_created
  on public.payments(client_id, created_at desc);
create index if not exists idx_payments_application_created
  on public.payments(application_id, created_at desc);
create index if not exists idx_payments_status_created
  on public.payments(status, created_at desc);

-- ---------------------------------------------------------------------------
-- Helper: recompute a client's subscription status from their most recent
-- confirmed payment. Called from action code after insert/confirm/reject,
-- and also from a nightly cron to roll clients into `expiring_soon`/
-- `expired` automatically without another admin action.
-- ---------------------------------------------------------------------------
create or replace function public.recompute_client_subscription(
  target_client uuid
) returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  latest record;
  new_status public.subscription_status;
  today date := current_date;
begin
  select p.id, p.paid_at, p.period_start, p.period_end
    into latest
    from public.payments p
   where p.client_id = target_client
     and p.status = 'confirmed'
   order by coalesce(p.period_end, current_date) desc,
            coalesce(p.confirmed_at, p.created_at) desc
   limit 1;

  if latest.id is null then
    update public.clients
       set subscription_status     = 'none',
           subscription_starts_at  = null,
           subscription_ends_at    = null,
           last_payment_at         = null,
           last_payment_id         = null
     where id = target_client;
    return;
  end if;

  if latest.period_end is null then
    new_status := 'active';
  elsif latest.period_end < today then
    new_status := 'expired';
  elsif latest.period_end <= today + 7 then
    new_status := 'expiring_soon';
  else
    new_status := 'active';
  end if;

  update public.clients
     set subscription_status    = new_status,
         subscription_starts_at = coalesce(latest.period_start, subscription_starts_at),
         subscription_ends_at   = latest.period_end,
         last_payment_at        = latest.paid_at,
         last_payment_id        = latest.id
   where id = target_client;
end;
$$;

-- ---------------------------------------------------------------------------
-- RLS — admins manage payments; clients can read their own (read-only).
-- ---------------------------------------------------------------------------
alter table public.payments enable row level security;

drop policy if exists payments_admin_all on public.payments;
create policy payments_admin_all
  on public.payments for all
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists payments_client_read_own on public.payments;
create policy payments_client_read_own
  on public.payments for select
  using (
    public.is_admin()
    or (client_id is not null and client_id = public.current_client_id())
  );

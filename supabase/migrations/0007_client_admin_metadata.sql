-- =============================================================================
-- Coaching platform — client admin metadata (Phase 7, restored)
-- =============================================================================
-- Original 0007 migration was missing from the tree (numbering skipped
-- from 0006 to 0008). This re-establishes it with purely additive, admin-
-- facing columns on `clients` that existing code may reference.
--
-- Idempotent: safe to re-run on projects that already have the columns.
-- -----------------------------------------------------------------------------

alter table public.clients
  add column if not exists phone              text,
  add column if not exists whatsapp_phone     text,
  add column if not exists coach_notes        text,
  add column if not exists is_archived        boolean not null default false;

create index if not exists idx_clients_archived
  on public.clients(is_archived);

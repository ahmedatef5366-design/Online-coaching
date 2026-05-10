-- =============================================================================
-- Phase 7 — Plan-level coach notes
-- =============================================================================
-- The master prompt asks for two extra free-text fields per workout plan:
--   * general_notes  — coaching cues shown alongside the plan
--   * attention_notes — important things the client must pay attention to,
--                       rendered as a highlighted callout in the client app
-- Both are nullable so existing rows remain valid; no backfill needed.
-- -----------------------------------------------------------------------------

alter table public.workout_plans
  add column if not exists general_notes text,
  add column if not exists attention_notes text;

/**
 * Shared validators for the public coaching-application form.
 *
 * Kept out of `actions.ts` (which is annotated `"use server"`) so that
 * Vitest can import the constants directly. Next.js requires every
 * export from a `"use server"` file to be an async function, which would
 * otherwise force us to wrap a constant table in a redundant async
 * accessor just to make it testable.
 *
 * The length caps here are mirrored as CHECK constraints in
 * `supabase/migrations/0011_security_hardening.sql`. Keeping both in
 * sync means oversize payloads are rejected at both the validator and
 * the database, so the public anon RLS policy cannot be abused to bloat
 * the table by hitting Supabase REST directly.
 */

export const APPLICATION_TEXT_LIMITS = {
  full_name: 200,
  email: 200,
  phone: 40,
  country: 100,
  city: 100,
  best_contact_time: 200,
  motivation_text: 4000,
  previous_results_text: 4000,
  available_equipment_text: 1000,
  preferred_training_time: 200,
  injuries_or_conditions: 2000,
  medications: 2000,
  allergies: 1000,
  surgeries_text: 2000,
  dietary_restrictions: 1000,
  foods_disliked: 1000,
  current_diet_summary: 2000,
  occupation: 200,
  notes: 4000,
} as const;

export type ApplicationTextField = keyof typeof APPLICATION_TEXT_LIMITS;

/**
 * Trim and cap a free-form field to its allowed length. Returns `null`
 * for empty / non-string values so the row column can stay NULL instead
 * of holding an empty string.
 */
export function capApplicationText(
  value: unknown,
  field: ApplicationTextField,
): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (trimmed === "") return null;
  return trimmed.slice(0, APPLICATION_TEXT_LIMITS[field]);
}

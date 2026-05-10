/**
 * Resolve the Supabase project URL + browser-safe key from either the
 * modern (`NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, `sb_publishable_*`) or
 * the legacy (`NEXT_PUBLIC_SUPABASE_ANON_KEY`, JWT) env var names.
 *
 * Both keys are equivalent for browser-side use and Supabase still accepts
 * either format. Using a single resolver keeps the rest of the codebase
 * agnostic to which naming convention the project happens to use.
 */

export function getSupabaseUrl(): string {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!url) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL. Add it to .env.local — see .env.local.example.",
    );
  }
  return url;
}

export function getSupabasePublishableKey(): string {
  const key =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!key) {
    throw new Error(
      "Missing Supabase publishable key. Set NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY (modern) or NEXT_PUBLIC_SUPABASE_ANON_KEY (legacy) in .env.local.",
    );
  }
  return key;
}

export function getSupabaseServiceRoleKey(): string {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) {
    throw new Error(
      "Missing SUPABASE_SERVICE_ROLE_KEY. This is server-only and bypasses RLS — never expose it to the browser.",
    );
  }
  return key;
}

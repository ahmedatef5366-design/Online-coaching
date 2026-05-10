/**
 * Validate a redirect target supplied by an untrusted source (e.g. the
 * `?redirect=` query parameter on the login page).
 *
 * Returns the value only when it is a same-origin path. This prevents
 * open-redirect attacks where an attacker crafts a URL like
 *   /login?redirect=https://evil.example/phishing
 * and steals the user's session by sending them off-site after sign-in.
 *
 * Accepted:
 *   - "/admin/dashboard"
 *   - "/client/progress?tab=weight"
 *
 * Rejected (returns null):
 *   - absolute URLs ("https://...", "http://...", "//evil.example/...")
 *   - protocol-relative paths ("//foo")
 *   - schemed paths ("javascript:alert(1)", "data:...", "mailto:...")
 *   - empty / whitespace
 */
export function safeRedirectPath(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  // Must be an absolute path on this origin.
  if (!trimmed.startsWith("/")) return null;
  // Reject protocol-relative URLs ("//evil.example/...").
  if (trimmed.startsWith("//")) return null;
  // Reject backslash-prefixed paths some browsers normalise to "//...".
  if (trimmed.startsWith("/\\")) return null;
  return trimmed;
}

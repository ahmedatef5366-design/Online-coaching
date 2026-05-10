/**
 * Return the URL only when it parses as an http(s) URL. This is used
 * before passing user-supplied values into `<a href>` to prevent
 * `javascript:`, `data:`, `vbscript:`, etc. URIs from being rendered.
 *
 * React's auto-escaping does NOT block these schemes — it only logs a
 * dev-mode warning starting in React 16.9. Sanitising at render time is
 * the safe, framework-agnostic approach.
 */
export function safeHttpUrl(value: string | null | undefined): string | null {
  if (!value) return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  let parsed: URL;
  try {
    parsed = new URL(trimmed);
  } catch {
    return null;
  }
  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") return null;
  return parsed.toString();
}

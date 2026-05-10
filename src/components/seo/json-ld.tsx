// Inline `application/ld+json` script tag.
// Use sparingly — one or two structured-data blocks per page is enough.

/**
 * Escape characters that would otherwise let an attacker break out of the
 * surrounding `<script>` tag if the data ever contains them. JSON.stringify
 * does NOT escape `<`, `>`, `&`, U+2028, or U+2029 by default — all of
 * which are valid inside JSON strings but unsafe inside an HTML script
 * context. The data on this site is admin-controlled today, but the cost
 * of defense-in-depth is tiny.
 */
function escapeJsonForScript(json: string): string {
  return json
    .replace(/</g, "\\u003C")
    .replace(/>/g, "\\u003E")
    .replace(/&/g, "\\u0026")
    .replace(/\u2028/g, "\\u2028")
    .replace(/\u2029/g, "\\u2029");
}

export function JsonLd({ data }: { data: object }) {
  const json = escapeJsonForScript(JSON.stringify(data));
  return (
    <script
      type="application/ld+json"
      // dangerouslySetInnerHTML is the documented Next.js pattern for JSON-LD
      // because React escapes < and > inside text content otherwise. We
      // pre-escape the `<`/`>`/`&` sequences ourselves so a stray
      // `</script>` in any field cannot terminate the surrounding tag.
      dangerouslySetInnerHTML={{ __html: json }}
    />
  );
}

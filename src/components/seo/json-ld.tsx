// Inline `application/ld+json` script tag.
// Use sparingly — one or two structured-data blocks per page is enough.
export function JsonLd({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      // dangerouslySetInnerHTML is the documented Next.js pattern for JSON-LD
      // because React escapes < and > inside text content otherwise.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

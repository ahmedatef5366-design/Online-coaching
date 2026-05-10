/**
 * Best-effort YouTube URL → video-ID parser.
 *
 * Supports the three formats coaches typically paste in:
 *   - https://www.youtube.com/watch?v=<id>
 *   - https://youtu.be/<id>
 *   - https://www.youtube.com/embed/<id>
 *   - https://www.youtube.com/shorts/<id>
 *
 * Returns null for anything that isn't a YouTube URL, so callers can
 * fall back to rendering a plain link (e.g. for Vimeo/Drive/etc.).
 */
const ID_PATTERN = /^[A-Za-z0-9_-]{6,15}$/;

export function getYouTubeId(url: string | null | undefined): string | null {
  if (!url) return null;
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return null;
  }
  const host = parsed.hostname.replace(/^www\./, "");

  if (host === "youtu.be") {
    const id = parsed.pathname.slice(1);
    return ID_PATTERN.test(id) ? id : null;
  }

  if (host === "youtube.com" || host === "m.youtube.com") {
    if (parsed.pathname === "/watch") {
      const id = parsed.searchParams.get("v");
      return id && ID_PATTERN.test(id) ? id : null;
    }
    const segments = parsed.pathname.split("/").filter(Boolean);
    if (
      segments.length === 2 &&
      (segments[0] === "embed" || segments[0] === "shorts")
    ) {
      const id = segments[1];
      return ID_PATTERN.test(id) ? id : null;
    }
  }

  return null;
}

export function getYouTubeEmbedUrl(
  url: string | null | undefined,
): string | null {
  const id = getYouTubeId(url);
  return id ? `https://www.youtube-nocookie.com/embed/${id}` : null;
}

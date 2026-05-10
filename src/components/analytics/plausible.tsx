import Script from "next/script";

/**
 * Plausible analytics tag. Opt-in via env:
 *   NEXT_PUBLIC_PLAUSIBLE_DOMAIN   the domain registered in Plausible
 *   NEXT_PUBLIC_PLAUSIBLE_SRC      optional override of the script URL
 *                                  (defaults to plausible.io's edge)
 *
 * When NEXT_PUBLIC_PLAUSIBLE_DOMAIN is unset the component renders
 * nothing — no network calls, no cookies. This is intentional so that
 * previews and local dev don't ping production analytics.
 */
export function PlausibleAnalytics() {
  const domain = process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN;
  if (!domain) return null;
  const src =
    process.env.NEXT_PUBLIC_PLAUSIBLE_SRC ?? "https://plausible.io/js/script.js";
  return (
    <Script
      strategy="afterInteractive"
      src={src}
      data-domain={domain}
      defer
    />
  );
}

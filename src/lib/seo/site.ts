// Resolve the public site URL with a fallback chain so SEO metadata,
// canonical URLs, OpenGraph tags, sitemap.xml, robots.txt, and email links
// always point to the real public origin — even if NEXT_PUBLIC_SITE_URL is
// not configured.
//
// Priority:
//   1. NEXT_PUBLIC_SITE_URL — explicit override (recommended for production)
//   2. RENDER_EXTERNAL_URL  — auto-injected by Render at runtime
//      (https://render.com/docs/environment-variables)
//   3. https://${VERCEL_URL} — auto-injected by Vercel at runtime
//      (https://vercel.com/docs/projects/environment-variables/system-environment-variables)
//   4. http://localhost:3000 — local dev fallback
function pickRawUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (explicit) return explicit;

  const render = process.env.RENDER_EXTERNAL_URL?.trim();
  if (render) return render;

  const vercel = process.env.VERCEL_URL?.trim();
  if (vercel) {
    // VERCEL_URL is the host only ("my-app.vercel.app"), no scheme.
    return vercel.startsWith("http://") || vercel.startsWith("https://")
      ? vercel
      : `https://${vercel}`;
  }

  return "http://localhost:3000";
}

export function siteUrl(): string {
  return pickRawUrl().replace(/\/+$/, "");
}

export const SITE_NAME = "Coaching Platform";
export const SITE_DEFAULT_TITLE =
  "Coaching Platform — personalized online fitness & nutrition coaching";
export const SITE_DEFAULT_DESCRIPTION =
  "Personalized online fitness and nutrition coaching with weekly check-ins, training plans, and 1:1 support. Apply in minutes.";

// Static keyword list for the root layout. Search engines mostly ignore the
// keywords meta tag now, but a curated set still helps internal SEO tooling
// and AI-driven crawlers.
export const SITE_KEYWORDS = [
  "online coaching",
  "fitness coaching",
  "nutrition coaching",
  "personal trainer",
  "diet plan",
  "weight loss coach",
  "muscle gain",
  "تدريب أونلاين",
  "كوتشينج لياقة",
  "تغذية أونلاين",
  "مدرب شخصي",
  "خطة تمرين",
  "مدرب لياقة في مصر",
];

// Resolve the public site URL with a sensible fallback for local dev.
// Set NEXT_PUBLIC_SITE_URL in production (no trailing slash).
export function siteUrl(): string {
  const raw =
    process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  return raw.replace(/\/+$/, "");
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

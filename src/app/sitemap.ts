import type { MetadataRoute } from "next";
import { listActivePackages } from "@/lib/packages/queries";
import { siteUrl } from "@/lib/seo/site";

// Sitemap published at /sitemap.xml. Includes static pages and any active
// package detail entries (we only have a single /packages page today, so
// active packages contribute via fragment anchors when useful).
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteUrl();
  const now = new Date();

  const staticEntries: MetadataRoute.Sitemap = [
    { url: `${base}/`, lastModified: now, changeFrequency: "weekly", priority: 1 },
    {
      url: `${base}/packages`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${base}/apply`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${base}/privacy`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${base}/terms`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${base}/refund-policy`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${base}/login`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.2,
    },
  ];

  // Surface active packages as deep links into the catalogue page so
  // crawlers index each package's slug. We don't render a per-package page
  // yet — the slug fragment is a hint until we do.
  let packageEntries: MetadataRoute.Sitemap = [];
  try {
    const packages = await listActivePackages();
    packageEntries = packages.map((p) => ({
      url: `${base}/packages#${p.slug}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    }));
  } catch {
    // Supabase may be unreachable during build (e.g. preview deploys
    // without DB env vars). Returning the static entries is still useful.
    packageEntries = [];
  }

  return [...staticEntries, ...packageEntries];
}

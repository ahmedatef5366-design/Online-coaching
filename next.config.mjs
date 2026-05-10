import { withSentryConfig } from "@sentry/nextjs";

// Default response headers applied to every route. These are the
// industry-standard "low blast-radius" security headers that protect against
// clickjacking, MIME sniffing, and over-broad referrer leakage. We
// deliberately do NOT add a Content-Security-Policy here — Next.js inlines
// scripts in dev and the project relies on a few third-party origins
// (Supabase, Sentry, Resend, youtube-nocookie). Adding a strict CSP without
// auditing every origin would break the app, so it is left as a follow-up.
const securityHeaders = [
  // Tell browsers to keep using HTTPS for two years and pre-load. Only
  // emitted in production responses; on http://localhost the browser ignores
  // it.
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  // Block <iframe> framing of the app from other origins (clickjacking).
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  // Disable MIME sniffing (defense-in-depth against XSS via wrong types).
  { key: "X-Content-Type-Options", value: "nosniff" },
  // Send the origin only on cross-origin navigations, never the full path.
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // Disable powerful browser features the app does not use.
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=()",
  },
  // Cross-origin opener / resource isolation hardening.
  { key: "X-DNS-Prefetch-Control", value: "on" },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    // CMS rows let admins paste arbitrary image URLs (transformation photos,
    // hero backgrounds). We allow Supabase Storage for client-uploaded
    // assets, plus a small set of common CDNs the marketing team uses. To
    // accept additional image hosts in production, set
    // NEXT_PUBLIC_IMAGE_HOSTS to a comma-separated list of hostnames.
    remotePatterns: [
      // Supabase Storage object URLs (any project).
      { protocol: "https", hostname: "*.supabase.co" },
      { protocol: "https", hostname: "*.supabase.in" },
      // Common image CDNs used by the CMS.
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "i.imgur.com" },
      { protocol: "https", hostname: "res.cloudinary.com" },
      ...(process.env.NEXT_PUBLIC_IMAGE_HOSTS ?? "")
        .split(",")
        .map((h) => h.trim())
        .filter(Boolean)
        .map((hostname) => ({ protocol: "https", hostname })),
    ],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
};

// Only wrap when a Sentry DSN is configured so local builds don't depend on
// Sentry env vars. When wrapped, Sentry uploads source maps if
// SENTRY_AUTH_TOKEN is set; otherwise it skips upload silently.
const sentryEnabled = Boolean(
  process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN,
);

export default sentryEnabled
  ? withSentryConfig(nextConfig, {
      // Sentry org / project for source map upload. Pulled from env so the
      // values aren't hard-coded in the repo.
      org: process.env.SENTRY_ORG,
      project: process.env.SENTRY_PROJECT,
      // Suppress Sentry build logs unless an upload happens.
      silent: !process.env.CI,
      // Disable source map upload entirely when no auth token is set.
      sourcemaps: { disable: !process.env.SENTRY_AUTH_TOKEN },
      // Don't tunnel events through a Next.js route by default — keeps the
      // setup simple. Flip on if you need to evade ad blockers.
      tunnelRoute: undefined,
      // Hides source map upload progress from Vercel/Render build logs.
      hideSourceMaps: true,
      disableLogger: true,
      // Use the edge runtime instrumentation hook.
      automaticVercelMonitors: false,
    })
  : nextConfig;

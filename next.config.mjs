import { withSentryConfig } from "@sentry/nextjs";

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // CMS rows let admins paste arbitrary image URLs (transformation photos,
    // hero backgrounds). Allow any HTTPS host through next/image; storage
    // domains will be restricted as we add Phase 5 upload UI.
    remotePatterns: [
      { protocol: "https", hostname: "**" },
    ],
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

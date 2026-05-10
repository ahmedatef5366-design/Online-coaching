// Next.js calls register() once per worker. We forward to the matching
// Sentry runtime config; both files are no-ops when SENTRY_DSN is unset.
export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    await import("../sentry.server.config");
  }
  if (process.env.NEXT_RUNTIME === "edge") {
    await import("../sentry.edge.config");
  }
}

// Forward Next.js request errors to Sentry. The exported name changed
// from onRequestError → captureRequestError in @sentry/nextjs v8+.
export { captureRequestError as onRequestError } from "@sentry/nextjs";

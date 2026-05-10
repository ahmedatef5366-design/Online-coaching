// Sentry server (Node runtime) configuration. The init call is a no-op
// when SENTRY_DSN is unset, so this file is safe to ship without breaking
// local dev or environments that haven't enabled monitoring yet.
import * as Sentry from "@sentry/nextjs";

const dsn = process.env.SENTRY_DSN ?? process.env.NEXT_PUBLIC_SENTRY_DSN;

if (dsn) {
  Sentry.init({
    dsn,
    tracesSampleRate: Number(process.env.SENTRY_TRACES_SAMPLE_RATE ?? 0.1),
    environment: process.env.SENTRY_ENVIRONMENT ?? "development",
    release: process.env.SENTRY_RELEASE,
    sendDefaultPii: false,
  });
}

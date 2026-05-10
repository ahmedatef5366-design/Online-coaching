import { defineConfig, devices } from "@playwright/test";

const baseURL = process.env.E2E_BASE_URL ?? "http://localhost:3000";

/**
 * Playwright config used by `pnpm e2e` and CI.
 *
 * The webServer block boots the Next.js dev server before tests run; if a
 * server is already listening on port 3000 (e.g. a developer left one up)
 * Playwright will reuse it.
 *
 * Tests live in /e2e and are gated behind real Supabase env vars — see
 * `e2e/landing.spec.ts` for the pattern that allows tests to run against a
 * fully-configured environment but skip cleanly otherwise.
 */
export default defineConfig({
  testDir: "./e2e",
  timeout: 30_000,
  expect: { timeout: 5_000 },
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? "github" : "list",
  use: {
    baseURL,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
  ],
  webServer: process.env.E2E_BASE_URL
    ? undefined
    : {
        command: "pnpm dev",
        url: baseURL,
        reuseExistingServer: !process.env.CI,
        timeout: 60_000,
      },
});

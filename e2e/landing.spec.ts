import { expect, test } from "@playwright/test";

/**
 * Smoke test for the public landing page.
 *
 * The marketing page is statically rendered from the `site_content` table,
 * so this test runs against any environment with a working DB. It asserts
 * the basic shell renders and that the primary "Log in" CTA is present and
 * points at /login (since public self-signup is disabled).
 */
test("landing page renders with a Log in CTA", async ({ page }) => {
  const response = await page.goto("/");
  expect(response?.ok()).toBeTruthy();

  // Header CTA — present on every public page.
  const headerLogin = page.getByRole("link", { name: /^log in$/i }).first();
  await expect(headerLogin).toBeVisible();
  await expect(headerLogin).toHaveAttribute("href", "/login");
});

test("/signup redirects to /login", async ({ page }) => {
  await page.goto("/signup");
  await expect(page).toHaveURL(/\/login$/);
});

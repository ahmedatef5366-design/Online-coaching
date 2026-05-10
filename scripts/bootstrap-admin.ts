/**
 * Bootstrap a Supabase admin user.
 *
 * Usage:
 *   ADMIN_EMAIL=you@example.com ADMIN_PASSWORD='********' \
 *     pnpm db:bootstrap-admin
 *
 * Requires NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in the
 * environment (or in a loaded .env.local). Re-running with the same email
 * is a no-op aside from re-asserting the admin role on the profile row.
 */

import { createClient } from "@supabase/supabase-js";
import fs from "node:fs";
import path from "node:path";

function loadDotEnvLocal() {
  const file = path.resolve(process.cwd(), ".env.local");
  if (!fs.existsSync(file)) return;
  const text = fs.readFileSync(file, "utf-8");
  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;
    const eq = line.indexOf("=");
    if (eq < 0) continue;
    const key = line.slice(0, eq).trim();
    let value = line.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (!(key in process.env)) process.env[key] = value;
  }
}

async function main() {
  loadDotEnvLocal();

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  const fullName = process.env.ADMIN_FULL_NAME ?? "Coach";

  if (!url || !serviceKey) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in env.",
    );
  }
  if (!email || !password) {
    throw new Error("Set ADMIN_EMAIL and ADMIN_PASSWORD in env.");
  }

  const supabase = createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  // 1. Try to create the user (idempotent — handle "already exists").
  const { data: created, error: createErr } =
    await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: fullName, role: "admin" },
    });

  let userId: string | undefined = created?.user?.id;

  if (createErr && !/already.*registered|already.*exists/i.test(createErr.message)) {
    throw createErr;
  }

  if (!userId) {
    // Already existed — look up the id by listing.
    const { data: list, error: listErr } =
      await supabase.auth.admin.listUsers({ perPage: 200 });
    if (listErr) throw listErr;
    const found = list.users.find(
      (u) => u.email?.toLowerCase() === email.toLowerCase(),
    );
    if (!found) throw new Error("Could not locate existing admin user.");
    userId = found.id;
  }

  // 2. Force-set role + name on the profile row.
  const { error: profileErr } = await supabase
    .from("profiles")
    .upsert(
      { id: userId, email, role: "admin", full_name: fullName },
      { onConflict: "id" },
    );
  if (profileErr) throw profileErr;

  console.log(`Admin ready: ${email} (${userId})`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

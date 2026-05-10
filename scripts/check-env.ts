/**
 * Pre-deploy env sanity check.
 *
 * Usage:
 *   pnpm tsx scripts/check-env.ts
 *
 * Reports which required / optional env vars are set, redacts values, and
 * exits with code 1 if any *required* var is missing — handy as a
 * smoke-test step you can tack on before `next build` in a CI pipeline.
 */

import fs from "node:fs";
import path from "node:path";

interface EnvSpec {
  key: string;
  required: boolean;
  description: string;
}

const ENV_SPEC: EnvSpec[] = [
  // --- Required for app to boot ---------------------------------------
  {
    key: "NEXT_PUBLIC_SUPABASE_URL",
    required: true,
    description: "Supabase project URL",
  },
  {
    key: "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
    required: false,
    description: "Browser-safe Supabase key (modern). One of this or ANON_KEY required.",
  },
  {
    key: "NEXT_PUBLIC_SUPABASE_ANON_KEY",
    required: false,
    description: "Browser-safe Supabase key (legacy). One of this or PUBLISHABLE_KEY required.",
  },
  {
    key: "SUPABASE_SERVICE_ROLE_KEY",
    required: true,
    description: "Server-only Supabase key — bypasses RLS",
  },
  {
    key: "NEXT_PUBLIC_SITE_URL",
    required: true,
    description: "Absolute public URL of the deployment (used for auth redirects + OG)",
  },

  // --- Recommended (features degrade gracefully if missing) -----------
  {
    key: "NEXT_PUBLIC_COACH_VODAFONE_NUMBER",
    required: false,
    description: "Coach's Vodafone Cash number — shown in WhatsApp payment template",
  },
  {
    key: "NEXT_PUBLIC_COACH_NAME",
    required: false,
    description: "Coach display name — used in WhatsApp message signature",
  },
  {
    key: "NEXT_PUBLIC_TURNSTILE_SITE_KEY",
    required: false,
    description: "Cloudflare Turnstile widget key. Set together with TURNSTILE_SECRET_KEY.",
  },
  {
    key: "TURNSTILE_SECRET_KEY",
    required: false,
    description: "Cloudflare Turnstile server-side verification key.",
  },
  {
    key: "NEXT_PUBLIC_PLAUSIBLE_DOMAIN",
    required: false,
    description: "Domain registered on Plausible for analytics.",
  },
  {
    key: "RESEND_API_KEY",
    required: false,
    description: "Resend API key (optional — not used by current flows).",
  },
  {
    key: "NEXT_PUBLIC_SENTRY_DSN",
    required: false,
    description: "Sentry DSN for error tracking.",
  },
];

function redact(value: string): string {
  if (value.length <= 8) return "***";
  return `${value.slice(0, 4)}…${value.slice(-4)} (${value.length} chars)`;
}

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

function main() {
  loadDotEnvLocal();

  console.log("🔍 Checking environment variables...\n");

  const missing: string[] = [];
  let criticalFailures = 0;

  for (const spec of ENV_SPEC) {
    const value = process.env[spec.key];
    if (value) {
      console.log(`  ✅ ${spec.key} = ${redact(value)}`);
    } else if (spec.required) {
      console.log(`  ❌ ${spec.key} MISSING (required)`);
      console.log(`       ${spec.description}`);
      missing.push(spec.key);
      criticalFailures += 1;
    } else {
      console.log(`  ⚪ ${spec.key} not set (optional)`);
    }
  }

  // Special case: either the modern or legacy Supabase browser key must
  // be set. Both flagged `required: false` above individually, so verify
  // at least one is present.
  const hasBrowserKey =
    !!process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!hasBrowserKey) {
    console.log(
      "\n  ❌ MISSING browser-safe Supabase key:",
      "set NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY (preferred)",
      "or NEXT_PUBLIC_SUPABASE_ANON_KEY (legacy).",
    );
    criticalFailures += 1;
  }

  // Turnstile: if one half is set, the other must be too.
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
  const secretKey = process.env.TURNSTILE_SECRET_KEY;
  if ((siteKey && !secretKey) || (!siteKey && secretKey)) {
    console.log(
      "\n  ⚠️  Turnstile is half-configured. Set BOTH NEXT_PUBLIC_TURNSTILE_SITE_KEY",
      "and TURNSTILE_SECRET_KEY, or unset both. Half-configured breaks /apply.",
    );
    criticalFailures += 1;
  }

  console.log();
  if (criticalFailures > 0) {
    console.log(
      `❌ ${criticalFailures} issue(s) found. See DEPLOY.md for setup instructions.`,
    );
    process.exit(1);
  }
  console.log("✅ All required env vars are set. Safe to deploy.");
}

main();

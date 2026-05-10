# Coaching Platform

A full-stack online coaching platform: a public CMS-driven landing page,
an admin dashboard for coaches, and a mobile-first client portal.

> **Status:** Phases 1–7 are live: foundation, CMS-driven landing page,
> client management + workout plan builder, nutrition (fixed + flexible
> IIFYM), body tracking + progress photos + daily check-ins, polish, and
> coach notes (plan-level general + attention) with YouTube video
> embeds and a 7-day rolling-average overlay on the weight chart.

## Tech stack

- **Next.js 14** (App Router, React Server Components) + **TypeScript**
- **Tailwind CSS** + custom shadcn-style UI primitives
- **Supabase** — Postgres, Auth, Storage (server + browser clients via `@supabase/ssr`)
- **next-intl**-style i18n (English + Arabic with RTL)
- **Recharts** for charts (used in later phases)

## Getting started

### 1. Install

```bash
pnpm install
```

### 2. Configure environment

Copy the template and fill in your Supabase credentials:

```bash
cp .env.local.example .env.local
```

| Var                                                         | Where to find it                                                       |
| ----------------------------------------------------------- | ---------------------------------------------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`                                  | Supabase dashboard → Settings → API → Project URL                      |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` *(or `…_ANON_KEY`)*  | Browser-safe key (`sb_publishable_*` for modern projects, JWT `anon` for legacy) |
| `SUPABASE_SERVICE_ROLE_KEY`                                 | Server-only secret key (`sb_secret_*` or JWT `service_role`) — bypasses RLS |
| `NEXT_PUBLIC_SITE_URL`                                      | Public origin used for OAuth/email redirects                           |

### 3. Apply the database schema

The migrations under `supabase/migrations/` are idempotent. Apply them with
either the Supabase CLI (`supabase db push`) or paste them in order into
the SQL editor in the Supabase dashboard:

1. `0001_init.sql` — tables, enums, triggers
2. `0002_rls.sql` — row-level security policies
3. `0003_seed_food_db.sql` — starter food database
4. `0004_seed_site_content.sql` — default landing-page CMS content
5. `0005_progress_photos_storage.sql` — private photos bucket + policies
6. `0006_workout_plan_coach_notes.sql` — plan-level coach notes columns
7. `0008_messages.sql` — coach ↔ client in-app messaging (RLS + Realtime)
8. `0009_packages_and_applications.sql` — sales packages catalog + public coaching application form (RLS)

### 4. Create your admin user

```bash
ADMIN_EMAIL=you@example.com ADMIN_PASSWORD='********' \
  pnpm db:bootstrap-admin
```

This uses the service-role key to create an auth user and force the
`profiles.role` to `admin`.

### 5. Run the app

```bash
pnpm dev
```

The landing page is at <http://localhost:3000>. After logging in:
- `role = admin` → redirected to `/admin/dashboard`
- `role = client` → redirected to `/client/dashboard`

## Project layout

```
src/
  app/
    (public)/         Public landing page + layout
    (auth)/           Login + signup
    admin/            Admin dashboard (sidebar layout)
    client/           Client portal (mobile-first, bottom-nav)
  components/
    ui/               Tailwind primitives (Button, Input, Card, …)
    auth/             Login / signup / logout
    admin/            Admin shell components
    client/           Client shell components
  lib/
    supabase/         Browser, server, middleware Supabase clients
    i18n/             Locale config + message lookup
  types/
    database.ts       Hand-written DB row/insert/update types
supabase/
  migrations/         SQL migrations (apply in order)
messages/
  en.json | ar.json   UI translations
```

## Auth model

- Single `/login` page handled by `LoginForm`.
- After sign-in, `profiles.role` decides the destination.
- `src/middleware.ts` (delegates to `lib/supabase/middleware.ts`) refreshes
  the Supabase session on every request and enforces role boundaries on
  `/admin/*` and `/client/*`.

## i18n + RTL

- `src/lib/i18n/locale-cookie.ts` reads/writes `cp_locale` (`en` | `ar`).
- `<html dir>` is set in `src/app/layout.tsx` based on the cookie.
- The `LocaleSwitcher` component flips the cookie and refreshes the route.
- Messages live in `messages/en.json` and `messages/ar.json`.

## Scripts

| Command                   | What it does                                   |
| ------------------------- | ---------------------------------------------- |
| `pnpm dev`                | Start the Next.js dev server                   |
| `pnpm build`              | Production build                               |
| `pnpm start`              | Start the built app                            |
| `pnpm lint`               | ESLint                                         |
| `pnpm typecheck`          | `tsc --noEmit`                                 |
| `pnpm format`             | Prettier (write)                               |
| `pnpm test`               | Vitest unit tests (one-shot)                   |
| `pnpm test:watch`         | Vitest in watch mode                           |
| `pnpm e2e`                | Playwright e2e tests (boots dev server)        |
| `pnpm e2e:install`        | Install the Chromium browser Playwright needs  |
| `pnpm db:bootstrap-admin` | Provision an admin user (service key)          |

## Deploying to Render

The repo ships a `render.yaml` blueprint. From the Render dashboard
choose **New → Blueprint**, point it at the repo and Render will create
a web service with the right build/start commands. You still need to
fill in these env vars in the Render UI before the first deploy:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (or `…_ANON_KEY`)
- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_SITE_URL` — your `https://<service>.onrender.com` URL

Then, in the Supabase dashboard under **Authentication → URL
Configuration**, add the same Render URL to "Site URL" and "Redirect
URLs" so confirmation / reset links land on the deployed app instead of
`http://localhost:3000`.

## Roadmap

- **Phase 1 (this PR)** — Foundation: schema, auth, base shells, i18n.
- **Phase 2** — Public landing page CMS: read `site_content` rows, admin editor.
- **Phase 3** — Workout plan builder + client workout view + set logger + rest timer.
- **Phase 4** — Nutrition (fixed + flexible IIFYM) + food database UI.
- **Phase 5** — Body measurements, weight log, progress photos, daily check-in, admin monitoring dashboard with charts.
- **Phase 6** — Polish: animations, mobile niceties, notifications, weekly summary email.
- **Phase 7** — Coach plan-level notes (general + attention callout), YouTube video embeds in the client workout, and a 7-day rolling-average overlay on the weight chart.

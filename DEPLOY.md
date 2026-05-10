# Deployment guide — Render + Supabase

This file is the one-stop checklist for getting the app live. It
assumes a fresh Supabase project and a fresh Render account — skip
the bits you've already done.

**Total time the first time:** 30–45 minutes.
**Cost:** $0 (free tiers of Supabase + Render).

---

## 0. One-time sanity check

Before you start, make sure the repo is in a clean state:

- The default branch is `main`.
- All the migrations in `supabase/migrations/` are committed.
- `render.yaml` exists at the repo root (it does — we ship one).

---

## 1. Create the Supabase project

1. Go to <https://app.supabase.com> → **New project**.
2. Choose a name (`coaching` is fine), a strong DB password (save it
   in a password manager), and a region close to your users. For
   Egypt/MENA clients: **Frankfurt (eu-central-1)**.
3. Wait ~2 minutes for the project to provision.

### 1.1 Grab the credentials

From **Project settings → API** you need three values:

| Variable | Where on the page | What it is |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | **Project URL** | Public Postgrest URL |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | **API keys → Publishable (`sb_publishable_*`)** | Browser-safe key |
| `SUPABASE_SERVICE_ROLE_KEY` | **API keys → Secret (`sb_secret_*`)** | Server-only, bypasses RLS |

> Legacy projects still show JWT-style `anon` and `service_role` keys —
> both work; the code falls back automatically.

Keep them in a note — you'll paste them into Render in step 4.

### 1.2 Run the migrations

In Supabase dashboard → **SQL editor**, open each file from
`supabase/migrations/` in **numerical order** and run it. Every file is
idempotent so reruns are safe.

```
0001_init.sql
0002_rls.sql
0003_seed_food_db.sql
0004_seed_site_content.sql
0005_progress_photos_storage.sql
0006_workout_plan_coach_notes.sql
0007_client_admin_metadata.sql
0008_messages.sql
0009_packages_and_applications.sql
0010_payments_and_subscriptions.sql
```

Faster alternative if you have the Supabase CLI:

```bash
supabase link --project-ref <ref-from-url>
supabase db push
```

### 1.3 Configure auth redirects

**Authentication → URL Configuration:**

- **Site URL:** `https://<your-render-service>.onrender.com`
  (you won't know this yet — put a placeholder, come back in step 5).
- **Additional redirect URLs:**
  - `https://<your-render-service>.onrender.com/**`
  - `http://localhost:3000/**` (so dev keeps working)

### 1.4 Create the Storage bucket for progress photos

The migration creates `progress_photos` as a **private** bucket with RLS.
Double-check it exists under **Storage** — you shouldn't need to touch it.

---

## 2. Fork / push the code to GitHub

Render pulls from GitHub, so the repo needs to be on a Git host Render
can reach. If you pushed the `chore/render-deployment-prep` branch and
merged it to `main`, you're done — Render will deploy whatever is on
`main`.

---

## 3. Create the Render service (Blueprint)

1. Go to <https://dashboard.render.com> → **New → Blueprint**.
2. Connect your GitHub account if you haven't already, then pick the
   `Online-coaching` repo.
3. Render detects `render.yaml` automatically. Click **Apply**.
4. The service name defaults to `coaching-platform` and the region is
   `frankfurt` — both come from `render.yaml` and you can leave them.

At this point Render will **fail the first deploy** because the env
vars haven't been set yet. That's expected — move on to step 4.

---

## 4. Fill in environment variables on Render

Go to the service → **Environment** tab → **Add Environment Variable**.

### 4.1 Required (the app won't boot without these)

| Key | Value |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | From step 1.1 |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | From step 1.1 |
| `SUPABASE_SERVICE_ROLE_KEY` | From step 1.1 (**secret — never expose**) |
| `NEXT_PUBLIC_SITE_URL` | `https://<your-service>.onrender.com` |

### 4.2 Strongly recommended

| Key | Value | Why |
|---|---|---|
| `NEXT_PUBLIC_COACH_VODAFONE_NUMBER` | e.g. `+201001234567` | Shown inside the WhatsApp payment-instructions deep-link |
| `NEXT_PUBLIC_COACH_NAME` | e.g. `Ahmed` | Signature on WhatsApp messages |

### 4.3 Optional

| Key | When to set it |
|---|---|
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` + `TURNSTILE_SECRET_KEY` | Once you start getting spam on `/apply`. Create a widget at <https://dash.cloudflare.com> → Turnstile. **Set both or neither** — setting only one breaks submissions. |
| `NEXT_PUBLIC_PLAUSIBLE_DOMAIN` | If you register the domain on <https://plausible.io> |
| `RESEND_API_KEY` + `EMAIL_FROM` | Future email features; currently unused |
| `NEXT_PUBLIC_SENTRY_DSN` + `SENTRY_DSN` | Error monitoring from <https://sentry.io> |

Save → Render will redeploy automatically.

---

## 5. First successful deploy — then come back to Supabase

Once the build turns green (4–6 minutes on the free tier):

1. Copy your service URL (e.g. `https://coaching-platform.onrender.com`).
2. Return to **Supabase → Authentication → URL Configuration** and
   replace the placeholder Site URL + redirect URLs with the real one.
3. **Redeploy Render** one more time so
   `NEXT_PUBLIC_SITE_URL` is baked in correctly. (Render → service →
   Manual deploy → Deploy latest commit.)

---

## 6. Create your first admin user

The admin user is the **only** way to reach `/admin/*` — there is no
public signup. Two options:

### Option A — one-shot from your laptop (recommended)

```bash
# From the repo root, after cloning and installing deps:
cp .env.local.example .env.local
# Fill in the same values you set on Render:
#   NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
#
# Then:
ADMIN_EMAIL=you@example.com \
ADMIN_PASSWORD='a-strong-password' \
ADMIN_FULL_NAME='Your Name' \
  pnpm db:bootstrap-admin
```

The script creates the auth user, sets `profiles.role = 'admin'` and is
safe to re-run (idempotent).

### Option B — manual, from the Supabase dashboard

1. **Authentication → Users → Add user** (set email + password, check
   "Auto-confirm user").
2. **Table editor → profiles**, find the row for the new user, set
   `role` to `admin`.

---

## 7. Verify the deploy

Open these URLs in a browser:

| URL | Expected |
|---|---|
| `https://<service>.onrender.com/` | Public landing page renders |
| `https://<service>.onrender.com/api/health` | JSON `{"status":"ok",...}` |
| `https://<service>.onrender.com/apply` | The 6-step coaching application form |
| `https://<service>.onrender.com/login` | Login form |

Then log in as your admin user → you should land on `/admin/dashboard`.

---

## 8. Custom domain (optional, free)

1. In Render → service → **Settings → Custom Domains → Add**.
2. Add a CNAME on your DNS provider pointing the subdomain to the
   Render target Render shows you.
3. After the cert is issued (~10 minutes), update:
   - `NEXT_PUBLIC_SITE_URL` on Render → your custom URL
   - Supabase → Site URL + redirect URLs → your custom URL

---

## 9. Going live checklist

Before you share the URL with real clients:

- [ ] All 10 migrations applied
- [ ] Admin user created (`/admin/dashboard` loads)
- [ ] `NEXT_PUBLIC_SITE_URL` matches the real domain
- [ ] Supabase redirect URLs updated
- [ ] At least one **package** seeded under `/admin/packages`
- [ ] Homepage CMS edited under `/admin/site-content` (the seeded copy
      is placeholder)
- [ ] Vodafone Cash number set on Render (`NEXT_PUBLIC_COACH_VODAFONE_NUMBER`)
- [ ] Submit a test application at `/apply` to confirm the flow works
- [ ] Record a test payment in `/admin/payments/new` and confirm it
      activates the linked client

---

## 10. Free-tier gotchas (Render)

- **Spin-down after 15 min idle.** First request after idle takes
  ~30 seconds. For a coaching site this is fine; clients open the
  portal a few times a day. Upgrade to the Starter plan ($7/mo) if
  always-on matters.
- **512 MB RAM.** Next.js 14 builds + runs comfortably in this budget,
  but adding heavy packages (ffmpeg, puppeteer, etc.) can push it over.
- **No persistent disk on the free tier.** All uploaded files must go
  through Supabase Storage (which the app already does).

---

## 11. Troubleshooting

### Build fails with `MODULE_NOT_FOUND @supabase/ssr`

Your pnpm version on Render doesn't match the lockfile. `render.yaml`
pins `pnpm@9.15.1` — if you've edited `pnpm-lock.yaml` locally with a
newer pnpm, either re-lock with 9.15.1 or bump the version in
`render.yaml`.

### Login loops / redirects forever

Supabase redirect URLs don't include your Render URL. Re-check step 5.

### `/admin/payments` is empty but I expect rows

Make sure migration **0010** ran. Open Supabase → Table editor and
verify the `payments` table exists.

### All new applications fail with "CAPTCHA verification failed"

You set `NEXT_PUBLIC_TURNSTILE_SITE_KEY` but not `TURNSTILE_SECRET_KEY`
(or the secret is from a different widget). Set both from the same
widget or unset both.

### The coach-side WhatsApp link doesn't include my number

Set `NEXT_PUBLIC_COACH_VODAFONE_NUMBER` on Render and redeploy. It's a
build-time `NEXT_PUBLIC_*` var, so changing it requires a rebuild, not
just a restart.

# Site Gap Analysis — what to add to make it world-class

This document captures everything I think is **missing** from the platform
today, prioritised so you know where to invest next. The PR that ships
alongside this report adds the **packages catalog** and **client intake
form** — those two items are no longer in the gap list below.

> Rule of thumb: ship anything in **P0** before you start charging real
> money, and anything in **P1** before you scale beyond your first 50
> clients.

---

## P0 — Must-have for a real, paid product

### 1. Payments
- Today the `/apply` form collects leads but the platform has no way to
  charge them. Add **Stripe Checkout / Subscriptions** for the global market
  and **Paymob** or **Fawry** for the Egyptian / GCC market (these are the
  ones clients actually have working credit cards / wallets for).
- Wire `coaching_applications` → upon admin "accept", trigger a Stripe
  Checkout session and email the client a payment link. Store
  `stripe_customer_id` on the client and `stripe_subscription_id` per
  package.
- Webhooks endpoint at `/api/stripe/webhook` to update subscription status
  on `customer.subscription.updated`, `invoice.payment_failed`, etc.

### 2. Transactional email
- Right now, when an admin creates a client account, the temp password is
  shown to the admin and they manually share it. That doesn't scale and
  is fragile.
- Add **Resend** (cheap, works well with Next.js) for:
  - Application received → confirmation to client
  - Application accepted → welcome email + login link / payment link
  - Weekly check-in reminder (cron job, see section 8)
  - Password reset (Supabase Auth ships this but you need an SMTP/Resend
    config in Supabase Dashboard → Auth → Email Templates).

### 3. Privacy / Terms / Refund pages
- The footer link `Terms` currently points to `/terms` which does not
  exist. Same for `/privacy`. This is a hard requirement for both
  Stripe / Paymob onboarding and the Egyptian Personal Data Protection
  Law (Law 151/2020).
- Add `/privacy`, `/terms`, `/refund-policy` as MDX pages or hard-coded
  routes. Translate to Arabic.

### 4. SEO basics
- The root `layout.tsx` does not currently expose `metadata` with
  `openGraph`, `twitter`, or a `keywords` array. Add per-page metadata
  for `/`, `/packages`, `/apply`, plus a global Open Graph image.
- Add `app/sitemap.ts` and `app/robots.ts` (Next 14 handles both natively).
- Add JSON-LD structured data to the landing page (`Organization`,
  `Service`) and to each package (`Offer`).

### 5. Analytics
- Zero visibility into traffic / conversion. Add either **Plausible**
  (privacy-friendly, no cookie banner needed) or **PostHog** (event
  tracking + session replay). Critical funnel events:
  - `landing_view`
  - `package_clicked`
  - `apply_started`
  - `apply_step_completed` (one per step)
  - `apply_submitted`
  - `client_logged_in`

### 6. Error monitoring
- Add **Sentry** (`@sentry/nextjs`). Right now silent failures in server
  actions (`console.error`) are invisible in production. With Sentry you
  get release tracking, source maps, and email/Slack alerts.

---

## P1 — High-impact features for growth

### 7. WhatsApp Business API
- The single most important channel for the Egyptian / GCC market.
  Today the admin gets a `wa.me/...` link which opens a personal chat;
  this doesn't scale once you have many clients.
- Integrate **WhatsApp Business Cloud API** (free tier from Meta) so:
  - Application confirmation auto-sent on submit
  - Weekly check-in reminders
  - Coach can reply from the admin panel — messages stored on
    `messages` table and synced to WhatsApp via webhook.
- Alternative: **Twilio WhatsApp** (easier API, $$).

### 8. Scheduled jobs
- No cron exists today. Use **Vercel Cron** (free) or **Upstash QStash**
  for:
  - Daily 9pm: send check-in reminder to clients who haven't logged today
  - Weekly Sunday: regenerate weekly progress reports for admin
  - Monthly: send "you're 7 days from your target date" nudges

### 9. Calendar / scheduling
- Add `bookings` table + `/schedule` page where clients can book a 15-min
  intro call. Integrate **Cal.com embed** (open-source) or **Google
  Calendar API**. Show coach availability in the client's local timezone.

### 10. Onboarding wizard for new clients
- Today after admin creates a client, the client logs in to a mostly
  empty dashboard. Add a 3-step welcome wizard:
  1. Confirm your details
  2. Set your check-in reminder time
  3. Take baseline progress photos

### 11. Mobile experience polish
- The client portal is responsive but not "app-feeling". Add:
  - **PWA manifest** (already partially configured — verify
    `apple-touch-icon`, `theme-color`, `display: standalone`)
  - Offline page for check-in (use IndexedDB queue, sync on reconnect)
  - Push notifications via OneSignal or Web Push API

### 12. Content marketing surface
- Add `/blog` powered by **Contentlayer** + MDX or simply by extending
  `site_content` to support article-shaped JSON. Topics: workout science,
  nutrition myths, success stories. SEO is the cheapest path to traffic.

### 13. FAQ + Testimonials at depth
- Hero-area testimonials exist but there's no dedicated `/testimonials`
  page or video-testimonial slot. Add:
  - Video testimonial uploads (Supabase storage public bucket)
  - Before/after gallery (with consent)
  - `/faq` page rendering the existing `faqs` CMS section in full.

---

## P2 — Operational / infrastructure

### 14. CI/CD
- No `.github/workflows/` directory. Add a workflow that runs on every
  PR:
  ```yaml
  - lint
  - typecheck
  - test (vitest)
  - build
  ```
- Add **Husky + lint-staged** so formatting runs locally before commit.
  (Repo currently has no pre-commit hooks at all.)

### 15. E2E tests
- `@playwright/test` is in devDependencies but no tests exist. Add
  smoke tests for:
  - Public landing renders
  - `/apply` happy path submits successfully
  - Admin login → applications list visible
  - Client login → dashboard renders

### 16. Database backups
- Supabase free tier doesn't include PITR. Either upgrade to Pro ($25/mo
  for 7-day PITR) or schedule a daily `pg_dump` to S3/R2.

### 17. Image optimization
- The hero image is loaded via `next/image` but other places (testimonial
  avatars, package thumbnails) use `<img>` or external URLs. Audit and
  migrate to `next/image` everywhere; add explicit `width`/`height`.

### 18. Internationalization completeness
- About 70% of strings are localized. The remaining inline English-only
  strings are in admin-only views — fine for launch since only you see
  them, but should be cleaned up before adding a second admin or coach.

### 19. Multi-coach support
- Schema is single-coach today (no `coach_id` on clients). When you grow,
  add a `coaches` table and relate clients/applications to a coach.

---

## P3 — Security hardening

### 20. 2FA for admin
- Supabase supports MFA — enable for admin role. Add a setup banner the
  first time an admin logs in without MFA.

### 21. Audit log
- Today there is no record of who changed what. Add an `audit_log` table
  populated by a Postgres trigger on `clients`, `packages`, and
  `coaching_applications`. Lets you debug "why did this client's plan
  disappear?".

### 22. Account lockout
- Login currently doesn't lock after N failed attempts. Add IP-based
  rate limiting on `/login` server action using the existing
  `checkRateLimit` utility.

### 23. CAPTCHA on /apply
- The form has IP-based rate limiting (3/hour) but no CAPTCHA. Once you
  start getting traffic, spam will follow. Add **Cloudflare Turnstile**
  (free, privacy-friendly).

### 24. Secrets rotation runbook
- Document how to rotate `SUPABASE_SERVICE_ROLE_KEY` and Stripe keys
  without downtime.

---

## P4 — Nice-to-haves

### 25. Apple Health / Google Fit / Fitbit integration
- Auto-pull steps, sleep, weight from clients' wearables instead of
  manual check-in.

### 26. Gamification
- Streaks, badges, leaderboard among same-coach clients.

### 27. AI assistant
- "Ask the coach AI" chatbot for FAQs (cheap deflection).
- Auto-summarise weekly progress for the admin.

### 28. Native mobile app
- Wrap the client portal in **Expo** or **Capacitor** for iOS/Android
  app store presence + push notifications.

### 29. Referral program
- Clients earn a free month for every referral that converts. Track via
  unique signup code on the application form.

### 30. Multi-currency
- Today every package is in a single currency. Auto-convert based on
  user IP / locale, or expose explicit per-currency packages.

---

## Quick wins you can ship in a weekend

If you only have one weekend, do these in order — each is small and
moves the needle:

1. Add `/privacy` and `/terms` static pages (1h)
2. Add per-page `metadata` exports + `app/sitemap.ts` + `app/robots.ts` (2h)
3. Add **Plausible** analytics script to `app/layout.tsx` (15min)
4. Add **Sentry** Next.js integration (30min)
5. Wire up **Resend** for the application-received auto-reply email (2h)
6. Add **Cloudflare Turnstile** to `/apply` (1h)

Total: ~7 hours of work for a meaningful jump in trustworthiness +
observability + spam protection.

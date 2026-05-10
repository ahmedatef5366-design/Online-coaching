import Link from "next/link";
import {
  Activity,
  Apple,
  Award,
  Camera,
  CheckCircle2,
  Dumbbell,
  Heart,
  MessageCircle,
  Sparkles,
  Star,
  Target,
  Users,
  Zap,
  type LucideIcon,
} from "lucide-react";
import Image from "next/image";
import { loadAllSections } from "@/lib/cms/loader";
import { pickLocaleText } from "@/lib/cms/sections";
import { readLocaleFromCookie } from "@/lib/i18n/locale-cookie";
import { Reveal } from "@/components/ui/reveal";
import { listActivePackages } from "@/lib/packages/queries";
import { formatBillingPeriod } from "@/lib/packages/format";
import type {
  CtaFooterContent,
  FeaturesContent,
  HeroContent,
  HowItWorksContent,
  PricingContent,
  TestimonialsContent,
} from "@/lib/cms/sections";

// Map of icon names referenced from CMS rows → concrete Lucide components.
// Add new icons here as you expand the CMS picker.
const ICONS: Record<string, LucideIcon> = {
  Activity,
  Apple,
  Award,
  Camera,
  Dumbbell,
  Heart,
  MessageCircle,
  Sparkles,
  Star,
  Target,
  Users,
  Zap,
};

function resolveIcon(name: string | undefined): LucideIcon {
  if (!name) return Sparkles;
  return ICONS[name] ?? Sparkles;
}

export default async function LandingPage() {
  const locale = readLocaleFromCookie();
  const [sections, packages] = await Promise.all([
    loadAllSections(),
    listActivePackages(),
  ]);

  // Build a key → published-content lookup for ergonomic access below.
  // Sections that are unpublished are skipped here so they don't render.
  const published = new Map(
    sections.filter((s) => s.isPublished).map((s) => [s.key, s.content]),
  );

  const hero = published.get("hero") as HeroContent | undefined;
  const features = published.get("features") as FeaturesContent | undefined;
  const howItWorks = published.get("how_it_works") as
    | HowItWorksContent
    | undefined;
  const testimonials = published.get("testimonials") as
    | TestimonialsContent
    | undefined;
  const pricing = published.get("pricing") as PricingContent | undefined;
  const pricingPublished = sections.find((s) => s.key === "pricing")
    ?.isPublished;
  const ctaFooter = published.get("cta_footer") as CtaFooterContent | undefined;

  return (
    <div className="relative">
      {/* Hero --------------------------------------------------------------- */}
      {hero && (
        <section className="relative overflow-hidden">
          {hero.background_url ? (
            <Image
              src={hero.background_url}
              alt=""
              fill
              priority
              sizes="100vw"
              className="pointer-events-none object-cover opacity-30"
            />
          ) : (
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_50%_at_50%_0%,rgba(163,230,53,0.15),transparent_70%),radial-gradient(50%_40%_at_80%_60%,rgba(249,115,22,0.10),transparent_70%)]"
            />
          )}
          <div className="container relative flex min-h-[80vh] flex-col items-start justify-center gap-6 py-24">
            <Reveal>
              <p className="rounded-full border border-border bg-card px-3 py-1 text-xs uppercase tracking-widest text-muted-foreground">
                {locale === "ar"
                  ? "كوتشينج أونلاين · شخصي"
                  : "Online coaching · 1-on-1"}
              </p>
            </Reveal>
            <Reveal delay={0.05}>
              <h1 className="max-w-3xl font-display text-5xl font-extrabold leading-[1.05] tracking-tight md:text-7xl">
                {pickLocaleText(hero, "headline", locale) ||
                  "Build the body you actually want."}
              </h1>
            </Reveal>
            <Reveal delay={0.1}>
              <p className="max-w-xl text-lg text-muted-foreground">
                {pickLocaleText(hero, "subheadline", locale)}
              </p>
            </Reveal>
            <Reveal delay={0.15} className="flex flex-wrap items-center gap-3">
              <Link
                href="/apply"
                className="rounded-md bg-primary px-6 py-3 text-base font-semibold text-primary-foreground transition-all hover:scale-[1.02] hover:bg-primary/90"
              >
                {pickLocaleText(hero, "cta_text", locale) ||
                  "Start your journey"}
              </Link>
              <Link
                href="#how-it-works"
                className="rounded-md border border-border px-5 py-3 text-sm font-medium text-muted-foreground hover:text-foreground"
              >
                {locale === "ar" ? "إزاي بيشتغل" : "How it works"}
              </Link>
            </Reveal>
          </div>
        </section>
      )}

      {/* Features ----------------------------------------------------------- */}
      {features && features.items.length > 0 && (
        <section className="border-y border-border/60 bg-card/40 py-16">
          <div className="container">
            <h2 className="mb-10 font-display text-3xl font-bold md:text-4xl">
              {locale === "ar"
                ? "كل اللي محتاجه، من غير زيادة."
                : "Everything you need, nothing you don't."}
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {features.items.map((item, i) => {
                const Icon = resolveIcon(item.icon);
                const title = pickLocaleText(item, "title", locale);
                const desc = pickLocaleText(item, "desc", locale);
                return (
                  <Reveal
                    key={`${title}-${i}`}
                    delay={i * 0.06}
                    className="rounded-xl border border-border bg-background/40 p-5"
                  >
                    <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-md bg-primary/10 text-primary">
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="mb-2 font-semibold">{title}</h3>
                    <p className="text-sm text-muted-foreground">{desc}</p>
                  </Reveal>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* How it works ------------------------------------------------------- */}
      {howItWorks && howItWorks.steps.length > 0 && (
        <section id="how-it-works" className="py-16">
          <div className="container">
            <h2 className="mb-10 font-display text-3xl font-bold md:text-4xl">
              {locale === "ar" ? "إزاي بيشتغل" : "How it works"}
            </h2>
            <ol className="grid gap-4 sm:grid-cols-3">
              {howItWorks.steps.map((step, i) => {
                const title = pickLocaleText(step, "title", locale);
                const desc = pickLocaleText(step, "desc", locale);
                return (
                  <Reveal
                    as="li"
                    key={`${title}-${i}`}
                    delay={i * 0.08}
                    className="rounded-xl border border-border bg-card/60 p-6"
                  >
                    <div className="mb-3 inline-flex h-8 w-8 items-center justify-center rounded-full bg-primary font-bold text-primary-foreground">
                      {i + 1}
                    </div>
                    <h3 className="mb-1 text-lg font-semibold">{title}</h3>
                    <p className="text-sm text-muted-foreground">{desc}</p>
                  </Reveal>
                );
              })}
            </ol>
          </div>
        </section>
      )}

      {/* Testimonials ------------------------------------------------------- */}
      {testimonials && testimonials.items.length > 0 && (
        <section className="border-t border-border/60 py-16">
          <div className="container">
            <h2 className="mb-10 font-display text-3xl font-bold md:text-4xl">
              {locale === "ar" ? "تحولات حقيقية" : "Real transformations"}
            </h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {testimonials.items.map((t, i) => {
                const quote = pickLocaleText(t, "quote", locale);
                return (
                  <article
                    key={`${t.name}-${i}`}
                    className="flex flex-col gap-4 rounded-xl border border-border bg-card/40 p-5"
                  >
                    {(t.before_url || t.after_url) && (
                      <div className="grid grid-cols-2 gap-2">
                        {t.before_url && (
                          <div className="relative aspect-square overflow-hidden rounded-md border border-border/60">
                            <Image
                              src={t.before_url}
                              alt={`${t.name} before`}
                              fill
                              sizes="(min-width: 1024px) 200px, 50vw"
                              className="object-cover"
                            />
                            <span className="absolute bottom-1 left-1 rounded bg-background/80 px-1.5 py-0.5 text-[10px] uppercase tracking-wider">
                              {locale === "ar" ? "قبل" : "Before"}
                            </span>
                          </div>
                        )}
                        {t.after_url && (
                          <div className="relative aspect-square overflow-hidden rounded-md border border-primary/40">
                            <Image
                              src={t.after_url}
                              alt={`${t.name} after`}
                              fill
                              sizes="(min-width: 1024px) 200px, 50vw"
                              className="object-cover"
                            />
                            <span className="absolute bottom-1 left-1 rounded bg-primary/90 px-1.5 py-0.5 text-[10px] uppercase tracking-wider text-primary-foreground">
                              {locale === "ar" ? "بعد" : "After"}
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                    <div className="flex items-center gap-1">
                      {Array.from({ length: 5 }).map((_, k) => (
                        <Star
                          key={k}
                          className={
                            k < (t.rating ?? 5)
                              ? "h-4 w-4 fill-primary text-primary"
                              : "h-4 w-4 text-muted-foreground/40"
                          }
                        />
                      ))}
                    </div>
                    <blockquote className="text-sm text-muted-foreground">
                      “{quote}”
                    </blockquote>
                    <p className="text-sm font-semibold">{t.name}</p>
                  </article>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Pricing ------------------------------------------------------------ */}
      {/*
       * Sourced from the `packages` admin table when at least one is active.
       * Falls back to the legacy CMS pricing tiers for backward compat. The
       * section can still be hidden via the CMS publish toggle.
       */}
      {pricingPublished !== false &&
        (packages.length > 0 ? (
          <section
            id="packages"
            className="border-t border-border/60 bg-card/30 py-16"
          >
            <div className="container">
              <div className="mb-10 flex flex-wrap items-end justify-between gap-3">
                <h2 className="font-display text-3xl font-bold md:text-4xl">
                  {locale === "ar"
                    ? "اختر الباقة المناسبة"
                    : "Pick the plan that fits"}
                </h2>
                <Link
                  href="/packages"
                  className="text-sm text-muted-foreground hover:text-foreground"
                >
                  {locale === "ar" ? "عرض كل التفاصيل ←" : "See full details →"}
                </Link>
              </div>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {packages.slice(0, 3).map((p, i) => {
                  const name = locale === "ar" ? p.name_ar : p.name_en;
                  const description =
                    locale === "ar" ? p.description_ar : p.description_en;
                  const featureList =
                    (locale === "ar" ? p.features_ar : p.features_en) ?? [];
                  const ctaLabel =
                    (locale === "ar" ? p.cta_label_ar : p.cta_label_en) ||
                    (locale === "ar" ? "قدّم دلوقتي" : "Apply now");
                  return (
                    <Reveal
                      key={p.id}
                      delay={i * 0.06}
                      className={
                        "relative flex flex-col gap-4 rounded-2xl border bg-background/40 p-6 " +
                        (p.is_featured
                          ? "border-primary/60 ring-1 ring-primary/40"
                          : "border-border")
                      }
                    >
                      {p.is_featured && (
                        <span className="absolute -top-3 inline-flex items-center gap-1 rounded-full bg-primary px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-primary-foreground">
                          <Sparkles className="h-3 w-3" />
                          {locale === "ar" ? "الأكثر طلباً" : "Most popular"}
                        </span>
                      )}
                      <div>
                        <h3 className="text-lg font-semibold">{name}</h3>
                        {description && (
                          <p className="mt-1 text-sm text-muted-foreground">
                            {description}
                          </p>
                        )}
                      </div>
                      <p className="font-display text-3xl font-bold">
                        {p.price > 0
                          ? p.price
                          : locale === "ar"
                            ? "مخصصة"
                            : "Custom"}
                        {p.price > 0 && (
                          <span className="ms-1 text-sm font-normal text-muted-foreground">
                            {p.currency}
                          </span>
                        )}
                        <span className="ms-2 text-xs font-normal text-muted-foreground">
                          {formatBillingPeriod(p.billing_period, locale)}
                        </span>
                      </p>
                      {featureList.length > 0 && (
                        <ul className="flex flex-col gap-2 text-sm">
                          {featureList.slice(0, 6).map((f, k) => (
                            <li key={k} className="flex items-start gap-2">
                              <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" />
                              <span>{f}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                      <Link
                        href={`/apply?package_id=${p.id}`}
                        className={
                          "mt-auto rounded-md px-4 py-2.5 text-center text-sm font-semibold transition-colors " +
                          (p.is_featured
                            ? "bg-primary text-primary-foreground hover:bg-primary/90"
                            : "border border-border bg-background hover:bg-accent/10")
                        }
                      >
                        {ctaLabel}
                      </Link>
                    </Reveal>
                  );
                })}
              </div>
            </div>
          </section>
        ) : (
          pricing &&
          pricing.tiers.length > 0 && (
            <section className="border-t border-border/60 bg-card/30 py-16">
              <div className="container">
                <h2 className="mb-10 font-display text-3xl font-bold md:text-4xl">
                  {locale === "ar"
                    ? "اختر الخطة المناسبة"
                    : "Pick the plan that fits"}
                </h2>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {pricing.tiers.map((tier, i) => {
                    const name = pickLocaleText(tier, "name", locale);
                    const featuresText = pickLocaleText(tier, "features", locale);
                    return (
                      <article
                        key={`${name}-${i}`}
                        className="flex flex-col gap-4 rounded-xl border border-border bg-background/40 p-6"
                      >
                        <h3 className="text-lg font-semibold">{name}</h3>
                        <p className="font-display text-3xl font-bold">
                          {tier.price}
                          <span className="ml-1 text-sm font-normal text-muted-foreground">
                            {tier.currency}
                          </span>
                        </p>
                        <ul className="flex flex-col gap-1 text-sm text-muted-foreground">
                          {featuresText
                            .split("\n")
                            .filter(Boolean)
                            .map((line, k) => (
                              <li key={k}>• {line}</li>
                            ))}
                        </ul>
                        <Link
                          href="/apply"
                          className="mt-2 rounded-md bg-primary px-4 py-2 text-center text-sm font-semibold text-primary-foreground"
                        >
                          {locale === "ar" ? "قدّم دلوقتي" : "Apply now"}
                        </Link>
                      </article>
                    );
                  })}
                </div>
              </div>
            </section>
          )
        ))}

      {/* CTA Footer --------------------------------------------------------- */}
      {ctaFooter && (
        <section className="border-t border-border/60 py-16">
          <div className="container flex flex-col items-start gap-4">
            <h2 className="font-display text-3xl font-bold md:text-4xl">
              {pickLocaleText(ctaFooter, "headline", locale)}
            </h2>
            <p className="max-w-xl text-muted-foreground">
              {pickLocaleText(ctaFooter, "subheadline", locale)}
            </p>
            <Link
              href="/apply"
              className="rounded-md bg-primary px-6 py-3 font-semibold text-primary-foreground"
            >
              {pickLocaleText(ctaFooter, "cta_text", locale) ||
                (locale === "ar" ? "قدّم دلوقتي" : "Apply now")}
            </Link>
          </div>
        </section>
      )}
    </div>
  );
}

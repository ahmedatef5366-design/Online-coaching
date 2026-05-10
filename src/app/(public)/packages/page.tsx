import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2, Sparkles } from "lucide-react";
import { listActivePackages } from "@/lib/packages/queries";
import { readLocaleFromCookie } from "@/lib/i18n/locale-cookie";
import { formatBillingPeriod } from "@/lib/packages/format";
import { JsonLd } from "@/components/seo/json-ld";
import { siteUrl, SITE_NAME } from "@/lib/seo/site";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Coaching packages",
  description:
    "Pick from monthly, quarterly, and custom online coaching packages — training programs, nutrition guidance, and 1:1 support.",
  alternates: { canonical: `${siteUrl()}/packages` },
  openGraph: {
    title: "Coaching packages",
    description:
      "Pick from monthly, quarterly, and custom online coaching packages.",
    url: `${siteUrl()}/packages`,
    type: "website",
  },
};

export default async function PackagesPage() {
  const locale = readLocaleFromCookie();
  const packages = await listActivePackages();
  const t = (en: string, ar: string) => (locale === "ar" ? ar : en);

  // Build structured data for each active package so search engines can
  // surface the offer (price, currency, name) directly in results.
  const offerJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: packages.map((p, idx) => ({
      "@type": "ListItem",
      position: idx + 1,
      item: {
        "@type": "Service",
        name: p.name_en,
        description: p.description_en ?? undefined,
        provider: { "@type": "Organization", name: SITE_NAME },
        offers: {
          "@type": "Offer",
          price: p.price,
          priceCurrency: p.currency,
          url: `${siteUrl()}/packages#${p.slug}`,
          availability: "https://schema.org/InStock",
        },
      },
    })),
  } as const;

  return (
    <div className="container py-16">
      {packages.length > 0 && <JsonLd data={offerJsonLd} />}
      <div className="mx-auto max-w-3xl text-center">
        <p className="mb-3 inline-flex items-center gap-1 rounded-full border border-border bg-card px-3 py-1 text-xs uppercase tracking-widest text-muted-foreground">
          <Sparkles className="h-3 w-3" />
          {t("Coaching packages", "باقات الكوتشينج")}
        </p>
        <h1 className="font-display text-4xl font-bold md:text-5xl">
          {t("Pick the plan that fits", "اختر الباقة المناسبة ليك")}
        </h1>
        <p className="mt-3 text-muted-foreground">
          {t(
            "Apply, talk to the coach, and start with a plan tailored to you.",
            "قدّم، اتكلم مع الكوتش، وابدأ بخطة معمولة عشانك إنت.",
          )}
        </p>
      </div>

      {packages.length === 0 ? (
        <div className="mx-auto mt-12 max-w-xl rounded-xl border border-dashed border-border bg-card/40 p-8 text-center text-sm text-muted-foreground">
          {t(
            "No packages are published yet. Check back soon — or apply directly to discuss a custom plan.",
            "مفيش باقات منشورة لسه. ارجع بعد شوية، أو قدّم على فورم الاشتراك ونتفق على خطة مخصصة.",
          )}
          <div className="mt-4">
            <Link
              href="/apply"
              className="inline-flex items-center gap-2 rounded-md bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
            >
              {t("Apply now", "قدّم دلوقتي")}
            </Link>
          </div>
        </div>
      ) : (
        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {packages.map((p) => {
            const name = locale === "ar" ? p.name_ar : p.name_en;
            const description =
              locale === "ar" ? p.description_ar : p.description_en;
            const features =
              (locale === "ar" ? p.features_ar : p.features_en) ?? [];
            const ctaLabel =
              (locale === "ar" ? p.cta_label_ar : p.cta_label_en) ||
              t("Apply now", "قدّم دلوقتي");
            return (
              <article
                key={p.id}
                className={
                  "relative flex flex-col gap-5 rounded-2xl border bg-card/50 p-6 shadow-sm transition-shadow hover:shadow-md " +
                  (p.is_featured
                    ? "border-primary/60 ring-1 ring-primary/40"
                    : "border-border")
                }
              >
                {p.is_featured && (
                  <span className="absolute -top-3 inline-flex items-center gap-1 rounded-full bg-primary px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-primary-foreground">
                    <Sparkles className="h-3 w-3" />
                    {t("Most popular", "الأكثر طلباً")}
                  </span>
                )}
                <div>
                  <h2 className="font-display text-xl font-semibold">{name}</h2>
                  {description && (
                    <p className="mt-1 text-sm text-muted-foreground">
                      {description}
                    </p>
                  )}
                </div>
                <div>
                  <p className="font-display text-3xl font-bold">
                    {p.price > 0 ? p.price : t("Custom", "مخصصة")}
                    {p.price > 0 && (
                      <span className="ms-1 align-baseline text-sm font-normal text-muted-foreground">
                        {p.currency}
                      </span>
                    )}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatBillingPeriod(p.billing_period, locale)}
                  </p>
                </div>
                {features.length > 0 && (
                  <ul className="flex flex-col gap-2 text-sm">
                    {features.map((f, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                )}
                <div className="mt-auto">
                  <Link
                    href={`/apply?package_id=${p.id}`}
                    className={
                      "block w-full rounded-md px-4 py-2.5 text-center text-sm font-semibold transition-colors " +
                      (p.is_featured
                        ? "bg-primary text-primary-foreground hover:bg-primary/90"
                        : "border border-border bg-background hover:bg-accent/10")
                    }
                  >
                    {ctaLabel}
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}

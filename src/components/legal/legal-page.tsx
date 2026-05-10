import Link from "next/link";
import type { Locale } from "@/lib/i18n/config";

export type LegalSection = {
  heading_en: string;
  heading_ar: string;
  body_en: string[];
  body_ar: string[];
};

export type LegalDocument = {
  title_en: string;
  title_ar: string;
  intro_en: string;
  intro_ar: string;
  effective_date_en: string;
  effective_date_ar: string;
  sections: LegalSection[];
};

export function LegalPage({
  locale,
  doc,
}: {
  locale: Locale;
  doc: LegalDocument;
}) {
  const t = (en: string, ar: string) => (locale === "ar" ? ar : en);
  const title = locale === "ar" ? doc.title_ar : doc.title_en;
  const intro = locale === "ar" ? doc.intro_ar : doc.intro_en;
  const effective =
    locale === "ar" ? doc.effective_date_ar : doc.effective_date_en;

  return (
    <div className="container max-w-3xl py-16">
      <p className="mb-3 text-xs uppercase tracking-widest text-muted-foreground">
        {effective}
      </p>
      <h1 className="font-display text-4xl font-bold md:text-5xl">{title}</h1>
      <p className="mt-4 text-muted-foreground">{intro}</p>

      <div
        role="note"
        className="mt-6 rounded-lg border border-yellow-500/40 bg-yellow-500/10 p-4 text-sm text-yellow-200"
      >
        {t(
          "Initial draft. Please review with a qualified lawyer before relying on this document for compliance or commercial use.",
          "مسودة أولية. لازم تتراجع مع محامٍ متخصص قبل الاعتماد عليها في الالتزام القانوني أو الاستخدام التجاري.",
        )}
      </div>

      <div className="mt-10 flex flex-col gap-8">
        {doc.sections.map((s, i) => {
          const heading = locale === "ar" ? s.heading_ar : s.heading_en;
          const body = locale === "ar" ? s.body_ar : s.body_en;
          return (
            <section
              key={`${i}-${heading}`}
              className="flex flex-col gap-3 border-t border-border/60 pt-6"
            >
              <h2 className="font-display text-xl font-semibold md:text-2xl">
                {i + 1}. {heading}
              </h2>
              {body.map((p, j) => (
                <p key={j} className="text-muted-foreground">
                  {p}
                </p>
              ))}
            </section>
          );
        })}
      </div>

      <div className="mt-12 flex flex-wrap gap-3 text-sm">
        <Link
          href="/privacy"
          className="rounded-md border border-border px-4 py-2 hover:text-foreground"
        >
          {t("Privacy", "الخصوصية")}
        </Link>
        <Link
          href="/terms"
          className="rounded-md border border-border px-4 py-2 hover:text-foreground"
        >
          {t("Terms", "الشروط")}
        </Link>
        <Link
          href="/refund-policy"
          className="rounded-md border border-border px-4 py-2 hover:text-foreground"
        >
          {t("Refund policy", "سياسة الاسترداد")}
        </Link>
      </div>
    </div>
  );
}

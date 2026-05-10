"use client";

import { LabeledField } from "./labeled-field";
import { SaveBar } from "./save-bar";
import { useSectionForm } from "./use-section-form";
import type { CtaFooterContent } from "@/lib/cms/sections";
import type { Locale } from "@/lib/i18n/config";

interface Props {
  initial: CtaFooterContent;
  locale: Locale;
}

export function CtaFooterEditor({ initial, locale }: Props) {
  const f = useSectionForm("cta_footer", initial);
  const t = (en: string, ar: string) => (locale === "ar" ? ar : en);

  return (
    <form onSubmit={f.submit} className="flex flex-col gap-6">
      <div className="grid gap-4 md:grid-cols-2">
        <LabeledField
          label={t("Headline (English)", "العنوان (إنجليزي)")}
          value={f.state.headline_en}
          onChange={(v) => f.patch("headline_en", v)}
        />
        <LabeledField
          label={t("Headline (Arabic)", "العنوان (عربي)")}
          value={f.state.headline_ar}
          onChange={(v) => f.patch("headline_ar", v)}
        />
        <LabeledField
          kind="textarea"
          label={t("Sub-headline (English)", "الوصف (إنجليزي)")}
          value={f.state.subheadline_en}
          onChange={(v) => f.patch("subheadline_en", v)}
        />
        <LabeledField
          kind="textarea"
          label={t("Sub-headline (Arabic)", "الوصف (عربي)")}
          value={f.state.subheadline_ar}
          onChange={(v) => f.patch("subheadline_ar", v)}
        />
        <LabeledField
          label={t("CTA button text (English)", "نص الزرار (إنجليزي)")}
          value={f.state.cta_text_en}
          onChange={(v) => f.patch("cta_text_en", v)}
        />
        <LabeledField
          label={t("CTA button text (Arabic)", "نص الزرار (عربي)")}
          value={f.state.cta_text_ar}
          onChange={(v) => f.patch("cta_text_ar", v)}
        />
      </div>
      <SaveBar
        locale={locale}
        status={f.status}
        error={f.error}
        disabled={!f.isDirty || f.isPending}
        onReset={f.isDirty ? f.reset : undefined}
      />
    </form>
  );
}

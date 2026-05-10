"use client";

import { LabeledField } from "./labeled-field";
import { SaveBar } from "./save-bar";
import { useSectionForm } from "./use-section-form";
import type { HeroContent } from "@/lib/cms/sections";
import type { Locale } from "@/lib/i18n/config";

interface Props {
  initial: HeroContent;
  locale: Locale;
}

export function HeroEditor({ initial, locale }: Props) {
  const f = useSectionForm("hero", initial);
  const t = (en: string, ar: string) => (locale === "ar" ? ar : en);

  return (
    <form onSubmit={f.submit} className="flex flex-col gap-6">
      <div className="grid gap-4 md:grid-cols-2">
        <LabeledField
          label={t("Headline (English)", "العنوان (إنجليزي)")}
          value={f.state.headline_en}
          onChange={(v) => f.patch("headline_en", v)}
          required
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
          rows={3}
        />
        <LabeledField
          kind="textarea"
          label={t("Sub-headline (Arabic)", "الوصف (عربي)")}
          value={f.state.subheadline_ar}
          onChange={(v) => f.patch("subheadline_ar", v)}
          rows={3}
        />
        <LabeledField
          label={t("CTA button text (English)", "نص الزرار (إنجليزي)")}
          value={f.state.cta_text_en}
          onChange={(v) => f.patch("cta_text_en", v)}
          required
        />
        <LabeledField
          label={t("CTA button text (Arabic)", "نص الزرار (عربي)")}
          value={f.state.cta_text_ar}
          onChange={(v) => f.patch("cta_text_ar", v)}
        />
        <LabeledField
          className="md:col-span-2"
          label={t(
            "Background image URL (optional)",
            "رابط صورة الخلفية (اختياري)",
          )}
          type="url"
          value={f.state.background_url}
          onChange={(v) => f.patch("background_url", v)}
          hint={t(
            "Paste an HTTPS image URL. Leave empty to use the default gradient.",
            "ضع رابط صورة HTTPS. اتركها فارغة للاستخدام الافتراضي.",
          )}
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

"use client";

import { LabeledField } from "./labeled-field";
import { SaveBar } from "./save-bar";
import { useSectionForm } from "./use-section-form";
import type { ThemeContent } from "@/lib/cms/sections";
import type { Locale } from "@/lib/i18n/config";

interface Props {
  initial: ThemeContent;
  locale: Locale;
}

export function ThemeEditor({ initial, locale }: Props) {
  const f = useSectionForm("theme", initial);
  const t = (en: string, ar: string) => (locale === "ar" ? ar : en);

  return (
    <form onSubmit={f.submit} className="flex flex-col gap-6">
      <div className="grid gap-4 md:grid-cols-3">
        <LabeledField
          kind="color"
          label={t("Primary color", "اللون الأساسي")}
          value={f.state.primary}
          onChange={(v) => f.patch("primary", v)}
          hint={t("Used for CTAs and accents.", "يستخدم في الأزرار والتمييزات.")}
        />
        <LabeledField
          kind="color"
          label={t("Accent color", "اللون الثانوي")}
          value={f.state.accent}
          onChange={(v) => f.patch("accent", v)}
          hint={t("Used for highlights.", "يستخدم في الإبرازات.")}
        />
        <LabeledField
          kind="color"
          label={t("Background color", "لون الخلفية")}
          value={f.state.background}
          onChange={(v) => f.patch("background", v)}
          hint={t("Page background.", "خلفية الصفحة.")}
        />
      </div>
      <p className="rounded-md border border-dashed border-border bg-background/40 p-3 text-xs text-muted-foreground">
        {t(
          "Colors are saved here for reference. Live theme application across the site is wired up in Phase 6 (Polish).",
          "الألوان بتتحفظ هنا. تطبيق الثيم الحي على الموقع هيتم في المرحلة الأخيرة من المشروع.",
        )}
      </p>
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

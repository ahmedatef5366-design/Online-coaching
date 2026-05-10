"use client";

import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LabeledField } from "./labeled-field";
import { SaveBar } from "./save-bar";
import { useSectionForm } from "./use-section-form";
import { ListItemCard, arrayMove } from "./list-item-card";
import type { HowItWorksContent, HowItWorksStep } from "@/lib/cms/sections";
import type { Locale } from "@/lib/i18n/config";

const EMPTY_STEP: HowItWorksStep = {
  title_en: "",
  title_ar: "",
  desc_en: "",
  desc_ar: "",
};

interface Props {
  initial: HowItWorksContent;
  locale: Locale;
}

export function HowItWorksEditor({ initial, locale }: Props) {
  const f = useSectionForm("how_it_works", initial);
  const t = (en: string, ar: string) => (locale === "ar" ? ar : en);
  const steps = f.state.steps;

  const updateStep = (idx: number, next: HowItWorksStep) => {
    const copy = [...steps];
    copy[idx] = next;
    f.patch("steps", copy);
  };

  return (
    <form onSubmit={f.submit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-3">
        {steps.map((step, idx) => (
          <ListItemCard
            key={idx}
            index={idx}
            total={steps.length}
            locale={locale}
            title={step.title_en || t(`Step ${idx + 1}`, `خطوة ${idx + 1}`)}
            onMoveUp={() => f.patch("steps", arrayMove(steps, idx, idx - 1))}
            onMoveDown={() => f.patch("steps", arrayMove(steps, idx, idx + 1))}
            onRemove={() =>
              f.patch(
                "steps",
                steps.filter((_, i) => i !== idx),
              )
            }
          >
            <LabeledField
              label={t("Title (English)", "العنوان (إنجليزي)")}
              value={step.title_en}
              onChange={(v) => updateStep(idx, { ...step, title_en: v })}
            />
            <LabeledField
              label={t("Title (Arabic)", "العنوان (عربي)")}
              value={step.title_ar}
              onChange={(v) => updateStep(idx, { ...step, title_ar: v })}
            />
            <LabeledField
              className="md:col-span-2"
              kind="textarea"
              label={t("Description (English)", "الوصف (إنجليزي)")}
              value={step.desc_en}
              onChange={(v) => updateStep(idx, { ...step, desc_en: v })}
              rows={2}
            />
            <LabeledField
              className="md:col-span-2"
              kind="textarea"
              label={t("Description (Arabic)", "الوصف (عربي)")}
              value={step.desc_ar}
              onChange={(v) => updateStep(idx, { ...step, desc_ar: v })}
              rows={2}
            />
          </ListItemCard>
        ))}
      </div>

      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => f.patch("steps", [...steps, EMPTY_STEP])}
      >
        <Plus className="h-4 w-4" />
        {t("Add step", "إضافة خطوة")}
      </Button>

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

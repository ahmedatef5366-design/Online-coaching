"use client";

import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LabeledField } from "./labeled-field";
import { SaveBar } from "./save-bar";
import { useSectionForm } from "./use-section-form";
import { ListItemCard, arrayMove } from "./list-item-card";
import type { FeatureItem, FeaturesContent } from "@/lib/cms/sections";
import type { Locale } from "@/lib/i18n/config";

const ICON_OPTIONS = [
  "Activity",
  "Apple",
  "Award",
  "Camera",
  "Dumbbell",
  "Heart",
  "MessageCircle",
  "Sparkles",
  "Star",
  "Target",
  "Users",
  "Zap",
];

const EMPTY_FEATURE: FeatureItem = {
  icon: "Sparkles",
  title_en: "",
  title_ar: "",
  desc_en: "",
  desc_ar: "",
};

interface Props {
  initial: FeaturesContent;
  locale: Locale;
}

export function FeaturesEditor({ initial, locale }: Props) {
  const f = useSectionForm("features", initial);
  const t = (en: string, ar: string) => (locale === "ar" ? ar : en);
  const items = f.state.items;

  const updateItem = (idx: number, next: FeatureItem) => {
    const copy = [...items];
    copy[idx] = next;
    f.patch("items", copy);
  };

  return (
    <form onSubmit={f.submit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-3">
        {items.map((item, idx) => (
          <ListItemCard
            key={idx}
            index={idx}
            total={items.length}
            locale={locale}
            title={
              item.title_en || t(`Feature ${idx + 1}`, `الميزة ${idx + 1}`)
            }
            onMoveUp={() => f.patch("items", arrayMove(items, idx, idx - 1))}
            onMoveDown={() => f.patch("items", arrayMove(items, idx, idx + 1))}
            onRemove={() =>
              f.patch(
                "items",
                items.filter((_, i) => i !== idx),
              )
            }
          >
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor={`icon-${idx}`}
                className="text-sm font-medium leading-none"
              >
                {t("Icon", "الأيقونة")}
              </label>
              <select
                id={`icon-${idx}`}
                value={item.icon}
                onChange={(e) =>
                  updateItem(idx, { ...item, icon: e.target.value })
                }
                className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                {ICON_OPTIONS.map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </select>
            </div>
            <div />
            <LabeledField
              label={t("Title (English)", "العنوان (إنجليزي)")}
              value={item.title_en}
              onChange={(v) => updateItem(idx, { ...item, title_en: v })}
            />
            <LabeledField
              label={t("Title (Arabic)", "العنوان (عربي)")}
              value={item.title_ar}
              onChange={(v) => updateItem(idx, { ...item, title_ar: v })}
            />
            <LabeledField
              className="md:col-span-2"
              kind="textarea"
              label={t("Description (English)", "الوصف (إنجليزي)")}
              value={item.desc_en}
              onChange={(v) => updateItem(idx, { ...item, desc_en: v })}
              rows={2}
            />
            <LabeledField
              className="md:col-span-2"
              kind="textarea"
              label={t("Description (Arabic)", "الوصف (عربي)")}
              value={item.desc_ar}
              onChange={(v) => updateItem(idx, { ...item, desc_ar: v })}
              rows={2}
            />
          </ListItemCard>
        ))}
      </div>

      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => f.patch("items", [...items, EMPTY_FEATURE])}
      >
        <Plus className="h-4 w-4" />
        {t("Add feature", "إضافة ميزة")}
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

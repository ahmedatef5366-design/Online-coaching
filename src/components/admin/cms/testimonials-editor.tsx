"use client";

import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LabeledField } from "./labeled-field";
import { SaveBar } from "./save-bar";
import { useSectionForm } from "./use-section-form";
import { ListItemCard, arrayMove } from "./list-item-card";
import type { TestimonialItem, TestimonialsContent } from "@/lib/cms/sections";
import type { Locale } from "@/lib/i18n/config";

const EMPTY_ITEM: TestimonialItem = {
  name: "",
  quote_en: "",
  quote_ar: "",
  rating: 5,
  before_url: "",
  after_url: "",
};

interface Props {
  initial: TestimonialsContent;
  locale: Locale;
}

export function TestimonialsEditor({ initial, locale }: Props) {
  const f = useSectionForm("testimonials", initial);
  const t = (en: string, ar: string) => (locale === "ar" ? ar : en);
  const items = f.state.items;

  const update = (idx: number, next: TestimonialItem) => {
    const copy = [...items];
    copy[idx] = next;
    f.patch("items", copy);
  };

  return (
    <form onSubmit={f.submit} className="flex flex-col gap-4">
      {items.length === 0 && (
        <p className="rounded-md border border-dashed border-border bg-background/40 p-6 text-center text-sm text-muted-foreground">
          {t(
            "No testimonials yet. Add one to start showcasing client transformations.",
            "مفيش آراء عملاء حالياً. ضيف رأي علشان تبدأ.",
          )}
        </p>
      )}

      <div className="flex flex-col gap-3">
        {items.map((item, idx) => (
          <ListItemCard
            key={idx}
            index={idx}
            total={items.length}
            locale={locale}
            title={item.name || t(`Testimonial ${idx + 1}`, `الرأي ${idx + 1}`)}
            onMoveUp={() => f.patch("items", arrayMove(items, idx, idx - 1))}
            onMoveDown={() => f.patch("items", arrayMove(items, idx, idx + 1))}
            onRemove={() =>
              f.patch(
                "items",
                items.filter((_, i) => i !== idx),
              )
            }
          >
            <LabeledField
              label={t("Client name", "اسم العميل")}
              value={item.name}
              onChange={(v) => update(idx, { ...item, name: v })}
            />
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor={`rating-${idx}`}
                className="text-sm font-medium leading-none"
              >
                {t("Rating (1-5)", "التقييم (١-٥)")}
              </label>
              <select
                id={`rating-${idx}`}
                value={item.rating}
                onChange={(e) =>
                  update(idx, { ...item, rating: Number(e.target.value) })
                }
                className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                {[1, 2, 3, 4, 5].map((n) => (
                  <option key={n} value={n}>
                    {"★".repeat(n)} ({n})
                  </option>
                ))}
              </select>
            </div>
            <LabeledField
              className="md:col-span-2"
              kind="textarea"
              label={t("Quote (English)", "النص (إنجليزي)")}
              value={item.quote_en}
              onChange={(v) => update(idx, { ...item, quote_en: v })}
              rows={3}
            />
            <LabeledField
              className="md:col-span-2"
              kind="textarea"
              label={t("Quote (Arabic)", "النص (عربي)")}
              value={item.quote_ar}
              onChange={(v) => update(idx, { ...item, quote_ar: v })}
              rows={3}
            />
            <LabeledField
              type="url"
              label={t("Before photo URL", "رابط صورة قبل")}
              value={item.before_url}
              onChange={(v) => update(idx, { ...item, before_url: v })}
            />
            <LabeledField
              type="url"
              label={t("After photo URL", "رابط صورة بعد")}
              value={item.after_url}
              onChange={(v) => update(idx, { ...item, after_url: v })}
            />
          </ListItemCard>
        ))}
      </div>

      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => f.patch("items", [...items, EMPTY_ITEM])}
      >
        <Plus className="h-4 w-4" />
        {t("Add testimonial", "إضافة رأي عميل")}
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

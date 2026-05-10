"use client";

import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LabeledField } from "./labeled-field";
import { SaveBar } from "./save-bar";
import { useSectionForm } from "./use-section-form";
import { ListItemCard, arrayMove } from "./list-item-card";
import type { PricingContent, PricingTier } from "@/lib/cms/sections";
import type { Locale } from "@/lib/i18n/config";

const EMPTY_TIER: PricingTier = {
  name_en: "",
  name_ar: "",
  price: "",
  currency: "USD",
  features_en: "",
  features_ar: "",
};

interface Props {
  initial: PricingContent;
  locale: Locale;
}

export function PricingEditor({ initial, locale }: Props) {
  const f = useSectionForm("pricing", initial);
  const t = (en: string, ar: string) => (locale === "ar" ? ar : en);
  const tiers = f.state.tiers;

  const update = (idx: number, next: PricingTier) => {
    const copy = [...tiers];
    copy[idx] = next;
    f.patch("tiers", copy);
  };

  return (
    <form onSubmit={f.submit} className="flex flex-col gap-4">
      {tiers.length === 0 && (
        <p className="rounded-md border border-dashed border-border bg-background/40 p-6 text-center text-sm text-muted-foreground">
          {t(
            "No pricing tiers yet. The pricing section will stay hidden until you add a tier or unhide it via the publish toggle.",
            "مفيش خطط أسعار. القسم مخفي لحد ما تضيف خطة.",
          )}
        </p>
      )}

      <div className="flex flex-col gap-3">
        {tiers.map((tier, idx) => (
          <ListItemCard
            key={idx}
            index={idx}
            total={tiers.length}
            locale={locale}
            title={tier.name_en || t(`Tier ${idx + 1}`, `الخطة ${idx + 1}`)}
            onMoveUp={() => f.patch("tiers", arrayMove(tiers, idx, idx - 1))}
            onMoveDown={() => f.patch("tiers", arrayMove(tiers, idx, idx + 1))}
            onRemove={() =>
              f.patch(
                "tiers",
                tiers.filter((_, i) => i !== idx),
              )
            }
          >
            <LabeledField
              label={t("Name (English)", "الاسم (إنجليزي)")}
              value={tier.name_en}
              onChange={(v) => update(idx, { ...tier, name_en: v })}
            />
            <LabeledField
              label={t("Name (Arabic)", "الاسم (عربي)")}
              value={tier.name_ar}
              onChange={(v) => update(idx, { ...tier, name_ar: v })}
            />
            <LabeledField
              label={t("Price", "السعر")}
              value={tier.price}
              onChange={(v) => update(idx, { ...tier, price: v })}
              placeholder="99"
            />
            <LabeledField
              label={t("Currency", "العملة")}
              value={tier.currency}
              onChange={(v) => update(idx, { ...tier, currency: v })}
              placeholder="USD"
            />
            <LabeledField
              className="md:col-span-2"
              kind="textarea"
              label={t("Features (one per line, English)", "المميزات (سطر لكل ميزة، إنجليزي)")}
              value={tier.features_en}
              onChange={(v) => update(idx, { ...tier, features_en: v })}
              rows={4}
            />
            <LabeledField
              className="md:col-span-2"
              kind="textarea"
              label={t("Features (one per line, Arabic)", "المميزات (سطر لكل ميزة، عربي)")}
              value={tier.features_ar}
              onChange={(v) => update(idx, { ...tier, features_ar: v })}
              rows={4}
            />
          </ListItemCard>
        ))}
      </div>

      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => f.patch("tiers", [...tiers, EMPTY_TIER])}
      >
        <Plus className="h-4 w-4" />
        {t("Add pricing tier", "إضافة خطة أسعار")}
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

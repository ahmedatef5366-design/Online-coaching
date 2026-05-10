"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  deletePackage,
  savePackage,
  type PackageInput,
} from "@/lib/packages/actions";
import { billingPeriodOptions } from "@/lib/packages/format";
import type { BillingPeriod, Package } from "@/types/database";
import type { Locale } from "@/lib/i18n/config";

interface Props {
  initial?: Package;
  locale: Locale;
}

interface FormState {
  slug: string;
  name_en: string;
  name_ar: string;
  description_en: string;
  description_ar: string;
  price: string;
  currency: string;
  billing_period: BillingPeriod;
  features_en: string;
  features_ar: string;
  cta_label_en: string;
  cta_label_ar: string;
  is_featured: boolean;
  is_active: boolean;
  display_order: string;
}

function fromInitial(initial?: Package): FormState {
  return {
    slug: initial?.slug ?? "",
    name_en: initial?.name_en ?? "",
    name_ar: initial?.name_ar ?? "",
    description_en: initial?.description_en ?? "",
    description_ar: initial?.description_ar ?? "",
    price: initial?.price !== undefined ? String(initial.price) : "0",
    currency: initial?.currency ?? "USD",
    billing_period: initial?.billing_period ?? "monthly",
    features_en: (initial?.features_en ?? []).join("\n"),
    features_ar: (initial?.features_ar ?? []).join("\n"),
    cta_label_en: initial?.cta_label_en ?? "",
    cta_label_ar: initial?.cta_label_ar ?? "",
    is_featured: initial?.is_featured ?? false,
    is_active: initial?.is_active ?? true,
    display_order:
      initial?.display_order !== undefined
        ? String(initial.display_order)
        : "0",
  };
}

export function PackageForm({ initial, locale }: Props) {
  const router = useRouter();
  const t = (en: string, ar: string) => (locale === "ar" ? ar : en);
  const [state, setState] = useState<FormState>(fromInitial(initial));
  const [isPending, startTransition] = useTransition();
  const [isDeleting, startDeleting] = useTransition();

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setState((prev) => ({ ...prev, [key]: value }));
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!state.name_en.trim() || !state.name_ar.trim()) {
      toast.error(t("Name (EN + AR) required", "الاسم (إنجليزي + عربي) مطلوب"));
      return;
    }
    startTransition(async () => {
      const payload: PackageInput = {
        ...(initial?.id ? { id: initial.id } : {}),
        slug: state.slug || undefined,
        name_en: state.name_en,
        name_ar: state.name_ar,
        description_en: state.description_en,
        description_ar: state.description_ar,
        price: state.price,
        currency: state.currency,
        billing_period: state.billing_period,
        features_en: state.features_en,
        features_ar: state.features_ar,
        cta_label_en: state.cta_label_en,
        cta_label_ar: state.cta_label_ar,
        is_featured: state.is_featured,
        is_active: state.is_active,
        display_order: state.display_order,
      };
      const res = await savePackage(payload);
      if (res.ok) {
        toast.success(t("Saved", "تم الحفظ"));
        router.push("/admin/packages");
        router.refresh();
      } else {
        toast.error(res.error ?? t("Save failed", "فشل الحفظ"));
      }
    });
  }

  function onDelete() {
    if (!initial?.id) return;
    if (
      !window.confirm(
        t("Delete this package?", "تحذف الباقة دي؟"),
      )
    )
      return;
    startDeleting(async () => {
      const res = await deletePackage(initial.id);
      if (res.ok) {
        toast.success(t("Deleted", "تم الحذف"));
        router.push("/admin/packages");
        router.refresh();
      } else {
        toast.error(res.error ?? t("Delete failed", "فشل الحذف"));
      }
    });
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-5">
      <section className="rounded-xl border border-border bg-card/40 p-5">
        <h2 className="mb-4 font-display text-lg font-semibold">
          {t("Identity", "البيانات الأساسية")}
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label>{t("Name (English)", "الاسم (إنجليزي)")} *</Label>
            <Input
              value={state.name_en}
              onChange={(e) => update("name_en", e.target.value)}
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label>{t("Name (Arabic)", "الاسم (عربي)")} *</Label>
            <Input
              value={state.name_ar}
              onChange={(e) => update("name_ar", e.target.value)}
              required
            />
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label>{t("Slug (auto if blank)", "الـSlug (أوتوماتيك لو فاضي)")}</Label>
            <Input
              value={state.slug}
              onChange={(e) => update("slug", e.target.value)}
              placeholder="starter-3-months"
            />
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label>{t("Short description (EN)", "وصف قصير (إنجليزي)")}</Label>
            <Textarea
              value={state.description_en}
              onChange={(e) => update("description_en", e.target.value)}
              rows={2}
            />
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label>{t("Short description (AR)", "وصف قصير (عربي)")}</Label>
            <Textarea
              value={state.description_ar}
              onChange={(e) => update("description_ar", e.target.value)}
              rows={2}
            />
          </div>
        </div>
      </section>

      <section className="rounded-xl border border-border bg-card/40 p-5">
        <h2 className="mb-4 font-display text-lg font-semibold">
          {t("Pricing", "السعر")}
        </h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-1.5">
            <Label>{t("Price", "السعر")}</Label>
            <Input
              type="number"
              step="0.01"
              value={state.price}
              onChange={(e) => update("price", e.target.value)}
              placeholder="0 for custom"
            />
          </div>
          <div className="space-y-1.5">
            <Label>{t("Currency", "العملة")}</Label>
            <Input
              value={state.currency}
              onChange={(e) => update("currency", e.target.value)}
              placeholder="USD"
            />
          </div>
          <div className="space-y-1.5">
            <Label>{t("Billing period", "المدة")}</Label>
            <select
              value={state.billing_period}
              onChange={(e) =>
                update("billing_period", e.target.value as BillingPeriod)
              }
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {billingPeriodOptions(locale).map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      <section className="rounded-xl border border-border bg-card/40 p-5">
        <h2 className="mb-1 font-display text-lg font-semibold">
          {t("Features", "المميزات")}
        </h2>
        <p className="mb-4 text-xs text-muted-foreground">
          {t(
            "One feature per line.",
            "ميزة في كل سطر.",
          )}
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label>{t("Features (EN)", "المميزات (إنجليزي)")}</Label>
            <Textarea
              rows={6}
              value={state.features_en}
              onChange={(e) => update("features_en", e.target.value)}
              placeholder="Custom workout plan&#10;Weekly check-ins&#10;Direct WhatsApp access"
            />
          </div>
          <div className="space-y-1.5">
            <Label>{t("Features (AR)", "المميزات (عربي)")}</Label>
            <Textarea
              rows={6}
              value={state.features_ar}
              onChange={(e) => update("features_ar", e.target.value)}
              placeholder="خطة تمرين مخصصة&#10;متابعة أسبوعية&#10;تواصل مباشر على واتساب"
            />
          </div>
        </div>
      </section>

      <section className="rounded-xl border border-border bg-card/40 p-5">
        <h2 className="mb-4 font-display text-lg font-semibold">
          {t("Display", "العرض")}
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label>{t("CTA label (EN)", "نص الزرار (إنجليزي)")}</Label>
            <Input
              value={state.cta_label_en}
              onChange={(e) => update("cta_label_en", e.target.value)}
              placeholder="Apply now"
            />
          </div>
          <div className="space-y-1.5">
            <Label>{t("CTA label (AR)", "نص الزرار (عربي)")}</Label>
            <Input
              value={state.cta_label_ar}
              onChange={(e) => update("cta_label_ar", e.target.value)}
              placeholder="قدّم دلوقتي"
            />
          </div>
          <div className="space-y-1.5">
            <Label>{t("Display order", "الترتيب")}</Label>
            <Input
              type="number"
              value={state.display_order}
              onChange={(e) => update("display_order", e.target.value)}
            />
          </div>
          <div className="flex items-end gap-4">
            <label className="inline-flex cursor-pointer items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={state.is_featured}
                onChange={(e) => update("is_featured", e.target.checked)}
                className="h-4 w-4"
              />
              {t("Featured (highlighted)", "مميزة (هيتعمل لها هايلايت)")}
            </label>
            <label className="inline-flex cursor-pointer items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={state.is_active}
                onChange={(e) => update("is_active", e.target.checked)}
                className="h-4 w-4"
              />
              {t("Active (visible to public)", "نشطة (مرئية للزوار)")}
            </label>
          </div>
        </div>
      </section>

      <div className="sticky bottom-0 -mx-6 -mb-6 flex items-center justify-between gap-3 border-t border-border/60 bg-card/80 px-6 py-3 backdrop-blur">
        <div>
          {initial?.id && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onDelete}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4" />
              )}
              {t("Delete", "حذف")}
            </Button>
          )}
        </div>
        <Button type="submit" disabled={isPending}>
          {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
          {t("Save package", "حفظ الباقة")}
        </Button>
      </div>
    </form>
  );
}

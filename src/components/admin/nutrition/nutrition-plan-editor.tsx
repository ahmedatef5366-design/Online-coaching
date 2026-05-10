"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { upsertNutritionPlan } from "@/lib/nutrition/actions";
import type { FoodDatabaseRow, NutritionMode } from "@/types/database";
import type { Locale } from "@/lib/i18n/config";
import type { PlanWithMeals } from "@/lib/nutrition/queries";
import { MealsEditor } from "./meals-editor";

interface Props {
  clientId: string;
  locale: Locale;
  plan: PlanWithMeals | null;
  foods: FoodDatabaseRow[];
}

export function NutritionPlanEditor({ clientId, locale, plan, foods }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [mode, setMode] = useState<NutritionMode>(
    plan?.plan.mode ?? "flexible",
  );
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSaved(false);
    const fd = new FormData(event.currentTarget);
    startTransition(async () => {
      const result = await upsertNutritionPlan({
        client_id: clientId,
        mode,
        calories_target: String(fd.get("calories_target") ?? ""),
        protein_target: String(fd.get("protein_target") ?? ""),
        carbs_target: String(fd.get("carbs_target") ?? ""),
        fat_target: String(fd.get("fat_target") ?? ""),
      });
      if (!result.ok) {
        setError(result.error ?? "Save failed.");
        return;
      }
      setSaved(true);
      router.refresh();
    });
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            {locale === "ar" ? "إعدادات الخطة" : "Plan settings"}
          </CardTitle>
          <CardDescription>
            {locale === "ar"
              ? "اختار الوضع وأهداف الماكروز اليومية للعميل."
              : "Pick a mode and the daily macro targets for this client."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="flex flex-wrap gap-3">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="radio"
                  name="mode"
                  value="flexible"
                  checked={mode === "flexible"}
                  onChange={() => setMode("flexible")}
                />
                {locale === "ar" ? "ماكروز مرنة (IIFYM)" : "Flexible (IIFYM)"}
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="radio"
                  name="mode"
                  value="fixed"
                  checked={mode === "fixed"}
                  onChange={() => setMode("fixed")}
                />
                {locale === "ar" ? "وجبات ثابتة" : "Fixed meal plan"}
              </label>
            </div>

            <div className="grid gap-3 sm:grid-cols-4">
              <div className="space-y-1">
                <Label htmlFor="calories_target">
                  {locale === "ar" ? "سعرات" : "Calories"}
                </Label>
                <Input
                  id="calories_target"
                  name="calories_target"
                  type="number"
                  min={0}
                  defaultValue={plan?.plan.calories_target ?? ""}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="protein_target">
                  {locale === "ar" ? "بروتين (جم)" : "Protein (g)"}
                </Label>
                <Input
                  id="protein_target"
                  name="protein_target"
                  type="number"
                  min={0}
                  defaultValue={plan?.plan.protein_target ?? ""}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="carbs_target">
                  {locale === "ar" ? "كارب (جم)" : "Carbs (g)"}
                </Label>
                <Input
                  id="carbs_target"
                  name="carbs_target"
                  type="number"
                  min={0}
                  defaultValue={plan?.plan.carbs_target ?? ""}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="fat_target">
                  {locale === "ar" ? "دهون (جم)" : "Fat (g)"}
                </Label>
                <Input
                  id="fat_target"
                  name="fat_target"
                  type="number"
                  min={0}
                  defaultValue={plan?.plan.fat_target ?? ""}
                />
              </div>
            </div>

            {error ? (
              <p className="text-sm text-destructive" role="alert">
                {error}
              </p>
            ) : null}
            {saved ? (
              <p className="text-sm text-primary">
                {locale === "ar" ? "تم الحفظ ✓" : "Saved ✓"}
              </p>
            ) : null}

            <div className="flex justify-end">
              <Button type="submit" disabled={isPending}>
                {isPending
                  ? locale === "ar"
                    ? "جاري الحفظ…"
                    : "Saving…"
                  : locale === "ar"
                    ? "حفظ الخطة"
                    : "Save plan"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {mode === "fixed" && plan ? (
        <MealsEditor
          clientId={clientId}
          locale={locale}
          planId={plan.plan.id}
          meals={plan.meals}
          foods={foods}
        />
      ) : null}
    </div>
  );
}

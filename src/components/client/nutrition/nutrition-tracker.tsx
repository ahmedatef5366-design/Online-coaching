"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { logFood, deleteFoodLog } from "@/lib/nutrition/actions";
import type { FoodDatabaseRow } from "@/types/database";
import type {
  FoodLogWithName,
  MacroTotals,
  PlanWithMeals,
} from "@/lib/nutrition/queries";
import type { Locale } from "@/lib/i18n/config";
import { useI18n } from "@/components/i18n-provider";

interface Props {
  locale: Locale;
  plan: PlanWithMeals | null;
  foods: FoodDatabaseRow[];
  logs: FoodLogWithName[];
  totals: MacroTotals;
  today: string;
}

export function ClientNutritionTracker({
  locale,
  plan,
  foods,
  logs,
  totals,
  today,
}: Props) {
  const { t } = useI18n();
  if (!plan) {
    return (
      <Card>
        <CardHeader>
          <CardDescription>{t("client.nutrition.no_plan")}</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (plan.plan.mode === "fixed") {
    return <FixedMealView plan={plan} totals={totals} />;
  }

  return (
    <FlexibleTracker
      locale={locale}
      plan={plan}
      foods={foods}
      logs={logs}
      totals={totals}
      today={today}
    />
  );
}

function FixedMealView({
  plan,
  totals,
}: {
  plan: PlanWithMeals;
  totals: MacroTotals;
}) {
  const { t } = useI18n();
  return (
    <div className="space-y-4">
      <MacroSummary
        targets={{
          calories: plan.plan.calories_target,
          protein: plan.plan.protein_target,
          carbs: plan.plan.carbs_target,
          fat: plan.plan.fat_target,
        }}
        totals={totals}
      />
      <div className="space-y-3">
        {plan.meals.length === 0 ? (
          <Card>
            <CardContent className="py-6 text-center text-sm text-muted-foreground">
              {t("client.nutrition.no_meals")}
            </CardContent>
          </Card>
        ) : (
          plan.meals.map((m) => {
            const sub = m.food_items.reduce(
              (a, f) => ({
                kcal: a.kcal + f.kcal,
                protein: a.protein + f.protein,
                carbs: a.carbs + f.carbs,
                fat: a.fat + f.fat,
              }),
              { kcal: 0, protein: 0, carbs: 0, fat: 0 },
            );
            return (
              <Card key={m.id}>
                <CardHeader>
                  <CardTitle className="text-base">{m.meal_type}</CardTitle>
                  <CardDescription>
                    {Math.round(sub.kcal)} kcal · P {Math.round(sub.protein)}g ·
                    C {Math.round(sub.carbs)}g · F {Math.round(sub.fat)}g
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-1 text-sm">
                    {m.food_items.map((f, i) => (
                      <li key={`${m.id}-${i}`}>
                        <span className="font-medium">{f.name}</span>{" "}
                        <span className="text-muted-foreground">
                          — {f.grams}g
                        </span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}

function FlexibleTracker({
  locale,
  plan,
  foods,
  logs,
  totals,
  today,
}: {
  locale: Locale;
  plan: PlanWithMeals;
  foods: FoodDatabaseRow[];
  logs: FoodLogWithName[];
  totals: MacroTotals;
  today: string;
}) {
  const { t } = useI18n();
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [pickedFoodId, setPickedFoodId] = useState<string>("");
  const [grams, setGrams] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return foods.slice(0, 25);
    return foods
      .filter(
        (f) =>
          f.name.toLowerCase().includes(q) ||
          (f.name_ar?.toLowerCase().includes(q) ?? false),
      )
      .slice(0, 25);
  }, [foods, query]);

  return (
    <div className="space-y-4">
      <MacroSummary
        targets={{
          calories: plan.plan.calories_target,
          protein: plan.plan.protein_target,
          carbs: plan.plan.carbs_target,
          fat: plan.plan.fat_target,
        }}
        totals={totals}
      />

      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            {t("client.nutrition.log_food")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t("client.nutrition.search_foods")}
          />
          <div className="grid gap-2 sm:grid-cols-[1fr_120px_auto]">
            <select
              value={pickedFoodId}
              onChange={(e) => setPickedFoodId(e.target.value)}
              className="h-10 rounded-md border border-input bg-background px-3 text-sm"
            >
              <option value="">{t("client.nutrition.pick_food")}</option>
              {filtered.map((f) => (
                <option key={f.id} value={f.id}>
                  {locale === "ar" && f.name_ar ? f.name_ar : f.name}
                </option>
              ))}
            </select>
            <Input
              type="number"
              min={1}
              placeholder={t("client.nutrition.grams")}
              value={grams}
              onChange={(e) => setGrams(e.target.value)}
            />
            <Button
              type="button"
              disabled={isPending || !pickedFoodId || !grams}
              onClick={() => {
                setError(null);
                startTransition(async () => {
                  const result = await logFood({
                    food_id: pickedFoodId,
                    weight_grams: grams,
                    log_date: today,
                  });
                  if (!result.ok) {
                    setError(result.error ?? "Could not log food.");
                    return;
                  }
                  setPickedFoodId("");
                  setGrams("");
                  router.refresh();
                });
              }}
            >
              {t("common.add")}
            </Button>
          </div>
          {error ? (
            <p className="text-sm text-destructive" role="alert">
              {error}
            </p>
          ) : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            {t("client.nutrition.today_log")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {logs.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              {t("client.nutrition.nothing_logged")}
            </p>
          ) : (
            <ul className="space-y-2">
              {logs.map((l) => (
                <li
                  key={l.id}
                  className="flex flex-wrap items-center gap-2 rounded-md border border-border/40 bg-card/60 p-2 text-sm"
                >
                  <div className="flex-1">
                    <p className="font-medium">
                      {locale === "ar" && l.food_name_ar
                        ? l.food_name_ar
                        : l.food_name}{" "}
                      <span className="text-muted-foreground">
                        — {l.weight_grams}g
                      </span>
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {Math.round(Number(l.calculated_calories))} kcal · P{" "}
                      {Math.round(Number(l.calculated_protein))}g · C{" "}
                      {Math.round(Number(l.calculated_carbs))}g · F{" "}
                      {Math.round(Number(l.calculated_fat))}g
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      startTransition(async () => {
                        await deleteFoodLog(l.id);
                        router.refresh();
                      });
                    }}
                    className="text-xs text-destructive hover:underline"
                  >
                    {t("common.remove")}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function MacroSummary({
  targets,
  totals,
}: {
  targets: {
    calories: number | null;
    protein: number | null;
    carbs: number | null;
    fat: number | null;
  };
  totals: MacroTotals;
}) {
  const { t } = useI18n();
  const entries: {
    key: string;
    label: string;
    value: number;
    target: number | null;
    color: string;
  }[] = [
    {
      key: "kcal",
      label: t("client.nutrition.macro_calories"),
      value: totals.calories,
      target: targets.calories,
      color: "hsl(var(--primary))",
    },
    {
      key: "p",
      label: t("client.nutrition.macro_protein"),
      value: totals.protein,
      target: targets.protein,
      color: "hsl(160 84% 45%)",
    },
    {
      key: "c",
      label: t("client.nutrition.macro_carbs"),
      value: totals.carbs,
      target: targets.carbs,
      color: "hsl(40 96% 55%)",
    },
    {
      key: "f",
      label: t("client.nutrition.macro_fat"),
      value: totals.fat,
      target: targets.fat,
      color: "hsl(340 80% 60%)",
    },
  ];

  return (
    <Card>
      <CardContent className="grid grid-cols-2 gap-4 py-4 sm:grid-cols-4">
        {entries.map((e) => (
          <MacroRing
            key={e.key}
            label={e.label}
            value={e.value}
            target={e.target}
            color={e.color}
          />
        ))}
      </CardContent>
    </Card>
  );
}

function MacroRing({
  label,
  value,
  target,
  color,
}: {
  label: string;
  value: number;
  target: number | null;
  color: string;
}) {
  const size = 80;
  const stroke = 6;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const ratio = target && target > 0 ? Math.min(1, value / target) : 0;
  const offset = c * (1 - ratio);
  const over = target !== null && value > target;
  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative">
        <svg
          width={size}
          height={size}
          className="-rotate-90"
          viewBox={`0 0 ${size} ${size}`}
        >
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            stroke="hsl(var(--border))"
            strokeWidth={stroke}
            fill="none"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            stroke={over ? "hsl(var(--destructive))" : color}
            strokeWidth={stroke}
            fill="none"
            strokeDasharray={c}
            strokeDashoffset={offset}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-xs">
          <span className="font-bold tabular-nums">{Math.round(value)}</span>
          {target ? (
            <span className="text-[10px] text-muted-foreground">
              / {Math.round(target)}
            </span>
          ) : null}
        </div>
      </div>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}

"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, X } from "lucide-react";
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
import { deleteMeal, upsertMeal } from "@/lib/nutrition/actions";
import type { FoodDatabaseRow, Meal, MealFoodItem } from "@/types/database";
import type { Locale } from "@/lib/i18n/config";

interface Props {
  clientId: string;
  locale: Locale;
  planId: string;
  meals: Meal[];
  foods: FoodDatabaseRow[];
}

export function MealsEditor({ clientId, locale, planId, meals, foods }: Props) {
  const [adding, setAdding] = useState(false);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">
          {locale === "ar" ? "وجبات الخطة" : "Meals"}
        </CardTitle>
        <CardDescription>
          {locale === "ar"
            ? "ضيف الوجبات بمكوناتها — الماكروز هتُحسب أوتوماتيك."
            : "Add each meal with its food items. Macros auto-calculate."}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {meals.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            {locale === "ar" ? "مفيش وجبات لسه." : "No meals yet."}
          </p>
        ) : (
          meals.map((m) => (
            <MealRow
              key={m.id}
              clientId={clientId}
              locale={locale}
              meal={m}
              foods={foods}
            />
          ))
        )}

        {adding ? (
          <MealForm
            clientId={clientId}
            locale={locale}
            planId={planId}
            foods={foods}
            onClose={() => setAdding(false)}
          />
        ) : (
          <button
            type="button"
            onClick={() => setAdding(true)}
            className="inline-flex items-center gap-1 rounded-md border border-border/60 bg-card/60 px-3 py-2 text-sm text-muted-foreground hover:bg-card hover:text-foreground"
          >
            <Plus className="h-4 w-4" />
            {locale === "ar" ? "إضافة وجبة" : "Add meal"}
          </button>
        )}
      </CardContent>
    </Card>
  );
}

function MealRow({
  clientId,
  locale,
  meal,
  foods,
}: {
  clientId: string;
  locale: Locale;
  meal: Meal;
  foods: FoodDatabaseRow[];
}) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const totals = mealTotals(meal.food_items);

  if (editing) {
    return (
      <MealForm
        clientId={clientId}
        locale={locale}
        planId={meal.plan_id}
        foods={foods}
        existing={meal}
        onClose={() => setEditing(false)}
      />
    );
  }

  return (
    <div className="rounded-md border border-border/60 bg-card/60 p-3">
      <div className="flex flex-wrap items-start gap-3">
        <div className="min-w-0 flex-1">
          <p className="font-medium">{meal.meal_type}</p>
          <p className="text-xs text-muted-foreground">
            {Math.round(totals.kcal)} kcal · P {Math.round(totals.protein)}g · C{" "}
            {Math.round(totals.carbs)}g · F {Math.round(totals.fat)}g
          </p>
          {meal.food_items.length > 0 ? (
            <ul className="mt-2 space-y-0.5 text-xs text-muted-foreground">
              {meal.food_items.map((f, i) => (
                <li key={`${meal.id}-${i}`}>
                  {f.name} — {f.grams}g
                </li>
              ))}
            </ul>
          ) : null}
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="rounded-md px-2 py-1 text-xs text-muted-foreground hover:bg-card hover:text-foreground"
          >
            {locale === "ar" ? "تعديل" : "Edit"}
          </button>
          <button
            type="button"
            disabled={isPending}
            onClick={() => {
              const ok = window.confirm(
                locale === "ar" ? "حذف الوجبة؟" : "Delete this meal?",
              );
              if (!ok) return;
              startTransition(async () => {
                const result = await deleteMeal(meal.id, clientId);
                if (!result.ok) {
                  setError(result.error ?? "Delete failed.");
                } else {
                  router.refresh();
                }
              });
            }}
            className="inline-flex h-7 w-7 items-center justify-center rounded-md text-destructive hover:bg-destructive/10"
            aria-label={locale === "ar" ? "حذف" : "Delete"}
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
      {error ? (
        <p className="mt-2 text-xs text-destructive" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}

function mealTotals(items: MealFoodItem[]) {
  return items.reduce(
    (acc, f) => ({
      kcal: acc.kcal + f.kcal,
      protein: acc.protein + f.protein,
      carbs: acc.carbs + f.carbs,
      fat: acc.fat + f.fat,
    }),
    { kcal: 0, protein: 0, carbs: 0, fat: 0 },
  );
}

function MealForm({
  clientId,
  locale,
  planId,
  foods,
  existing,
  onClose,
}: {
  clientId: string;
  locale: Locale;
  planId: string;
  foods: FoodDatabaseRow[];
  existing?: Meal;
  onClose: () => void;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [mealType, setMealType] = useState(existing?.meal_type ?? "Breakfast");
  const [items, setItems] = useState<MealFoodItem[]>(
    existing?.food_items ?? [],
  );
  const [error, setError] = useState<string | null>(null);

  const foodMap = useMemo(() => {
    const map = new Map<string, FoodDatabaseRow>();
    foods.forEach((f) => map.set(f.id, f));
    return map;
  }, [foods]);

  const [pickedFoodId, setPickedFoodId] = useState<string>("");
  const [grams, setGrams] = useState<string>("");

  function addItem() {
    if (!pickedFoodId || !grams) return;
    const food = foodMap.get(pickedFoodId);
    const g = Number(grams);
    if (!food || !Number.isFinite(g) || g <= 0) return;
    const factor = g / 100;
    const round = (n: number) => Math.round(n * 100) / 100;
    setItems((prev) => [
      ...prev,
      {
        name: food.name,
        grams: g,
        kcal: round(food.calories_per_100g * factor),
        protein: round(food.protein_per_100g * factor),
        carbs: round(food.carbs_per_100g * factor),
        fat: round(food.fat_per_100g * factor),
      },
    ]);
    setPickedFoodId("");
    setGrams("");
  }

  return (
    <div className="space-y-3 rounded-md border border-border/60 bg-card/80 p-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold">
          {existing
            ? locale === "ar"
              ? "تعديل وجبة"
              : "Edit meal"
            : locale === "ar"
              ? "وجبة جديدة"
              : "New meal"}
        </p>
        <button
          type="button"
          onClick={onClose}
          className="text-muted-foreground hover:text-foreground"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="space-y-1">
        <Label htmlFor="meal_type">
          {locale === "ar" ? "نوع الوجبة" : "Meal name"}
        </Label>
        <Input
          id="meal_type"
          value={mealType}
          onChange={(e) => setMealType(e.target.value)}
          placeholder={
            locale === "ar" ? "مثال: فطار / غداء" : "e.g. Breakfast / Lunch"
          }
        />
      </div>

      {items.length > 0 ? (
        <ul className="space-y-1">
          {items.map((it, i) => (
            <li
              key={`${it.name}-${i}`}
              className="flex items-center gap-2 rounded-md border border-border/40 bg-card/60 px-2 py-1 text-xs"
            >
              <span className="flex-1">
                {it.name} — {it.grams}g · {Math.round(it.kcal)} kcal
              </span>
              <button
                type="button"
                onClick={() =>
                  setItems((prev) => prev.filter((_, idx) => idx !== i))
                }
                className="text-destructive hover:underline"
              >
                {locale === "ar" ? "حذف" : "Remove"}
              </button>
            </li>
          ))}
        </ul>
      ) : null}

      <div className="grid gap-2 sm:grid-cols-[1fr_120px_auto]">
        <select
          value={pickedFoodId}
          onChange={(e) => setPickedFoodId(e.target.value)}
          className="h-10 rounded-md border border-input bg-background px-3 text-sm"
        >
          <option value="">
            {locale === "ar" ? "اختار صنف…" : "Pick a food…"}
          </option>
          {foods.map((f) => (
            <option key={f.id} value={f.id}>
              {locale === "ar" && f.name_ar ? f.name_ar : f.name}
            </option>
          ))}
        </select>
        <Input
          type="number"
          min={1}
          placeholder={locale === "ar" ? "جم" : "grams"}
          value={grams}
          onChange={(e) => setGrams(e.target.value)}
        />
        <Button type="button" variant="outline" onClick={addItem}>
          {locale === "ar" ? "إضافة" : "Add"}
        </Button>
      </div>

      {error ? (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}

      <div className="flex justify-end gap-2">
        <Button type="button" variant="ghost" onClick={onClose}>
          {locale === "ar" ? "إلغاء" : "Cancel"}
        </Button>
        <Button
          type="button"
          disabled={isPending}
          onClick={() => {
            setError(null);
            startTransition(async () => {
              const result = await upsertMeal({
                meal_id: existing?.id,
                plan_id: planId,
                client_id: clientId,
                meal_type: mealType,
                food_items: items,
              });
              if (!result.ok) {
                setError(result.error ?? "Save failed.");
                return;
              }
              onClose();
              router.refresh();
            });
          }}
        >
          {isPending
            ? locale === "ar"
              ? "جاري الحفظ…"
              : "Saving…"
            : existing
              ? locale === "ar"
                ? "حفظ"
                : "Save"
              : locale === "ar"
                ? "إضافة الوجبة"
                : "Add meal"}
        </Button>
      </div>
    </div>
  );
}

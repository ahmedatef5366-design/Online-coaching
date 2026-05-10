import "server-only";
import { createClient } from "@/lib/supabase/server";
import type {
  FoodDatabaseRow,
  FoodLog,
  Meal,
  MealFoodItem,
  NutritionPlan,
} from "@/types/database";

export interface PlanWithMeals {
  plan: NutritionPlan;
  meals: Meal[];
}

/** Active nutrition plan + nested meals (fixed mode) for one client. */
export async function getActiveNutritionPlan(
  clientId: string,
): Promise<PlanWithMeals | null> {
  const supabase = createClient();
  const { data: plan } = (await supabase
    .from("nutrition_plans")
    .select("*")
    .eq("client_id", clientId)
    .eq("is_active", true)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle()) as { data: NutritionPlan | null };
  if (!plan) return null;

  const { data: meals } = (await supabase
    .from("meals")
    .select("*")
    .eq("plan_id", plan.id)
    .order("display_order", { ascending: true })) as {
    data: (Omit<Meal, "food_items"> & { food_items: unknown })[] | null;
  };

  const parsed: Meal[] = (meals ?? []).map((m) => ({
    id: m.id,
    plan_id: m.plan_id,
    meal_type: m.meal_type,
    display_order: m.display_order,
    food_items: parseFoodItems(m.food_items),
  }));
  return { plan, meals: parsed };
}

function parseFoodItems(value: unknown): MealFoodItem[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((raw): MealFoodItem | null => {
      if (!raw || typeof raw !== "object") return null;
      const v = raw as Record<string, unknown>;
      const name = typeof v.name === "string" ? v.name : null;
      if (!name) return null;
      return {
        name,
        grams: Number(v.grams) || 0,
        kcal: Number(v.kcal) || 0,
        protein: Number(v.protein) || 0,
        carbs: Number(v.carbs) || 0,
        fat: Number(v.fat) || 0,
      };
    })
    .filter((x): x is MealFoodItem => x !== null);
}

/** Search food database by name fragment (admin and client). */
export async function searchFoods(
  query: string,
  limit = 25,
): Promise<FoodDatabaseRow[]> {
  const supabase = createClient();
  const trimmed = query.trim();
  let q = supabase
    .from("food_database")
    .select("*")
    .order("name", { ascending: true })
    .limit(limit);
  if (trimmed) {
    q = q.or(`name.ilike.%${trimmed}%,name_ar.ilike.%${trimmed}%`);
  }
  const { data } = (await q) as { data: FoodDatabaseRow[] | null };
  return data ?? [];
}

/** All foods, optionally only customs (admin DB editor). */
export async function listFoods(): Promise<FoodDatabaseRow[]> {
  const supabase = createClient();
  const { data } = (await supabase
    .from("food_database")
    .select("*")
    .order("name", { ascending: true })) as {
    data: FoodDatabaseRow[] | null;
  };
  return data ?? [];
}

/** Get the current client's food log for one day, joined with food name. */
export interface FoodLogWithName extends FoodLog {
  food_name: string;
  food_name_ar: string | null;
}

export async function getFoodLogForDate(
  clientId: string,
  logDate: string,
): Promise<FoodLogWithName[]> {
  const supabase = createClient();
  const { data: logs } = (await supabase
    .from("food_logs")
    .select("*")
    .eq("client_id", clientId)
    .eq("log_date", logDate)
    .order("created_at", { ascending: true })) as {
    data: FoodLog[] | null;
  };
  const list = logs ?? [];
  if (list.length === 0) return [];

  const foodIds = Array.from(new Set(list.map((l) => l.food_id)));
  const { data: foods } = (await supabase
    .from("food_database")
    .select("id, name, name_ar")
    .in("id", foodIds)) as {
    data: { id: string; name: string; name_ar: string | null }[] | null;
  };
  const byId = new Map<string, { name: string; name_ar: string | null }>();
  (foods ?? []).forEach((f) => byId.set(f.id, f));

  return list.map((l) => {
    const meta = byId.get(l.food_id);
    return {
      ...l,
      food_name: meta?.name ?? "—",
      food_name_ar: meta?.name_ar ?? null,
    };
  });
}

export interface MacroTotals {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export function totalsFromLogs(logs: FoodLogWithName[]): MacroTotals {
  return logs.reduce<MacroTotals>(
    (acc, l) => ({
      calories: acc.calories + Number(l.calculated_calories),
      protein: acc.protein + Number(l.calculated_protein),
      carbs: acc.carbs + Number(l.calculated_carbs),
      fat: acc.fat + Number(l.calculated_fat),
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 },
  );
}

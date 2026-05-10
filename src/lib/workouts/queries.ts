import "server-only";
import { createClient } from "@/lib/supabase/server";
import type {
  Exercise,
  WorkoutDay,
  WorkoutLog,
  WorkoutPlan,
} from "@/types/database";

export interface PlanWithDays {
  plan: WorkoutPlan;
  days: WorkoutDayWithExercises[];
}

export interface WorkoutDayWithExercises {
  day: WorkoutDay;
  exercises: Exercise[];
}

/** Active plan + nested days/exercises for one client. Returns null when no
 *  active plan exists yet. */
export async function getActivePlan(
  clientId: string,
): Promise<PlanWithDays | null> {
  const supabase = createClient();
  const { data: plan } = (await supabase
    .from("workout_plans")
    .select("*")
    .eq("client_id", clientId)
    .eq("is_active", true)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle()) as { data: WorkoutPlan | null };
  if (!plan) return null;

  const { data: days } = (await supabase
    .from("workout_days")
    .select("*")
    .eq("plan_id", plan.id)
    .order("day_number", { ascending: true })) as {
    data: WorkoutDay[] | null;
  };

  const dayList = days ?? [];
  if (dayList.length === 0) return { plan, days: [] };

  const dayIds = dayList.map((d) => d.id);
  const { data: exercises } = (await supabase
    .from("exercises")
    .select("*")
    .in("day_id", dayIds)
    .order("display_order", { ascending: true })) as {
    data: Exercise[] | null;
  };

  const exByDay = new Map<string, Exercise[]>();
  (exercises ?? []).forEach((e) => {
    const list = exByDay.get(e.day_id) ?? [];
    list.push(e);
    exByDay.set(e.day_id, list);
  });

  return {
    plan,
    days: dayList.map((d) => ({
      day: d,
      exercises: exByDay.get(d.id) ?? [],
    })),
  };
}

/** All plans owned by a client (active first, newest first). */
export async function listPlansForClient(
  clientId: string,
): Promise<WorkoutPlan[]> {
  const supabase = createClient();
  const { data } = (await supabase
    .from("workout_plans")
    .select("*")
    .eq("client_id", clientId)
    .order("is_active", { ascending: false })
    .order("created_at", { ascending: false })) as {
    data: WorkoutPlan[] | null;
  };
  return data ?? [];
}

/** Read one workout day (with its exercises) — used by the client logger
 *  page. Returns null when the day is not found or not visible. */
export async function getDayWithExercises(
  dayId: string,
): Promise<WorkoutDayWithExercises | null> {
  const supabase = createClient();
  const { data: day } = (await supabase
    .from("workout_days")
    .select("*")
    .eq("id", dayId)
    .maybeSingle()) as { data: WorkoutDay | null };
  if (!day) return null;

  const { data: exercises } = (await supabase
    .from("exercises")
    .select("*")
    .eq("day_id", dayId)
    .order("display_order", { ascending: true })) as {
    data: Exercise[] | null;
  };
  return { day, exercises: exercises ?? [] };
}

/** Workout logs for a client on one calendar date, optionally scoped to a
 *  set of exercise IDs (the day's exercises). */
export async function getWorkoutLogsForDate(
  clientId: string,
  logDate: string,
  exerciseIds: string[],
): Promise<WorkoutLog[]> {
  if (exerciseIds.length === 0) return [];
  const supabase = createClient();
  const { data } = (await supabase
    .from("workout_logs")
    .select("*")
    .eq("client_id", clientId)
    .eq("log_date", logDate)
    .in("exercise_id", exerciseIds)
    .order("set_number", { ascending: true })) as {
    data: WorkoutLog[] | null;
  };
  return data ?? [];
}

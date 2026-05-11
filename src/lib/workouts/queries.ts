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

/** Plan-level coach notes for the plan that owns this day. Used by the
 *  client day page so the client sees the "attention" callout while
 *  training. Returns null fields when no plan is found. */
export async function getPlanNotesForDay(dayId: string): Promise<{
  general_notes: string | null;
  attention_notes: string | null;
}> {
  const supabase = createClient();
  const { data: day } = (await supabase
    .from("workout_days")
    .select("plan_id")
    .eq("id", dayId)
    .maybeSingle()) as { data: { plan_id: string } | null };
  if (!day) return { general_notes: null, attention_notes: null };
  const { data: plan } = (await supabase
    .from("workout_plans")
    .select("general_notes, attention_notes")
    .eq("id", day.plan_id)
    .maybeSingle()) as {
    data: {
      general_notes: string | null;
      attention_notes: string | null;
    } | null;
  };
  return {
    general_notes: plan?.general_notes ?? null,
    attention_notes: plan?.attention_notes ?? null,
  };
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

export interface LastSessionSummary {
  log_date: string;
  sets: WorkoutLog[];
  bestWeight: number;
  bestE1rm: number;
}

/** For each exercise, fetch the most recent prior session (latest log_date
 *  strictly before `beforeDate`) and return the full set list for that
 *  session. Used by the workout logger to show "last time" hints, default
 *  weights/reps, and progressive-overload suggestions. */
export async function getLastSessionPerExercise(
  clientId: string,
  exerciseIds: string[],
  beforeDate: string,
): Promise<Map<string, LastSessionSummary>> {
  const result = new Map<string, LastSessionSummary>();
  if (exerciseIds.length === 0) return result;

  const supabase = createClient();
  const { data } = (await supabase
    .from("workout_logs")
    .select("*")
    .eq("client_id", clientId)
    .in("exercise_id", exerciseIds)
    .lt("log_date", beforeDate)
    .order("log_date", { ascending: false })
    .order("set_number", { ascending: true })
    .limit(500)) as { data: WorkoutLog[] | null };

  const grouped = new Map<string, WorkoutLog[]>();
  (data ?? []).forEach((log) => {
    const existing = grouped.get(log.exercise_id) ?? [];
    if (existing.length === 0) {
      existing.push(log);
      grouped.set(log.exercise_id, existing);
      return;
    }
    if (existing[0].log_date === log.log_date) {
      existing.push(log);
    }
  });

  grouped.forEach((sets, exerciseId) => {
    let bestWeight = 0;
    let bestE1rm = 0;
    sets.forEach((s) => {
      const w = s.weight_kg ?? 0;
      const r = s.reps_done ?? 0;
      if (w > bestWeight) bestWeight = w;
      const e1rm = r > 0 ? w * (1 + r / 30) : 0;
      if (e1rm > bestE1rm) bestE1rm = e1rm;
    });
    result.set(exerciseId, {
      log_date: sets[0].log_date,
      sets,
      bestWeight,
      bestE1rm,
    });
  });

  return result;
}

export interface PrSummary {
  bestWeight: number;
  bestE1rm: number;
}

/** Lifetime best weight + best estimated 1RM per exercise (strictly before
 *  `beforeDate`). Used by the workout summary screen to flag new PRs. */
export async function getLifetimePrsPerExercise(
  clientId: string,
  exerciseIds: string[],
  beforeDate: string,
): Promise<Map<string, PrSummary>> {
  const result = new Map<string, PrSummary>();
  if (exerciseIds.length === 0) return result;

  const supabase = createClient();
  const { data } = (await supabase
    .from("workout_logs")
    .select("exercise_id, weight_kg, reps_done")
    .eq("client_id", clientId)
    .in("exercise_id", exerciseIds)
    .lt("log_date", beforeDate)) as {
    data:
      | Array<{
          exercise_id: string;
          weight_kg: number | null;
          reps_done: number | null;
        }>
      | null;
  };

  (data ?? []).forEach((row) => {
    const w = row.weight_kg ?? 0;
    const r = row.reps_done ?? 0;
    const e1rm = r > 0 ? w * (1 + r / 30) : 0;
    const current = result.get(row.exercise_id) ?? {
      bestWeight: 0,
      bestE1rm: 0,
    };
    if (w > current.bestWeight) current.bestWeight = w;
    if (e1rm > current.bestE1rm) current.bestE1rm = e1rm;
    result.set(row.exercise_id, current);
  });

  return result;
}

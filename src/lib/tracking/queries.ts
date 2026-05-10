import "server-only";
import { createClient } from "@/lib/supabase/server";
import type {
  BodyMeasurement,
  DailyCheckin,
  ProgressPhoto,
  WeightLogRow,
} from "@/types/database";

export async function listWeightLogs(
  clientId: string,
  limit = 90,
): Promise<WeightLogRow[]> {
  const supabase = createClient();
  const { data } = (await supabase
    .from("weight_logs")
    .select("*")
    .eq("client_id", clientId)
    .order("log_date", { ascending: false })
    .limit(limit)) as { data: WeightLogRow[] | null };
  return data ?? [];
}

export async function listBodyMeasurements(
  clientId: string,
  limit = 60,
): Promise<BodyMeasurement[]> {
  const supabase = createClient();
  const { data } = (await supabase
    .from("body_measurements")
    .select("*")
    .eq("client_id", clientId)
    .order("measured_on", { ascending: false })
    .limit(limit)) as { data: BodyMeasurement[] | null };
  return data ?? [];
}

export async function listProgressPhotos(
  clientId: string,
  limit = 60,
): Promise<ProgressPhoto[]> {
  const supabase = createClient();
  const { data } = (await supabase
    .from("progress_photos")
    .select("*")
    .eq("client_id", clientId)
    .order("taken_on", { ascending: false })
    .limit(limit)) as { data: ProgressPhoto[] | null };
  return data ?? [];
}

export async function getProgressPhotoSignedUrls(
  paths: string[],
): Promise<Map<string, string>> {
  const supabase = createClient();
  const map = new Map<string, string>();
  if (paths.length === 0) return map;
  const { data } = await supabase.storage
    .from("progress-photos")
    .createSignedUrls(paths, 60 * 60);
  (data ?? []).forEach((entry) => {
    if (entry.path && entry.signedUrl) {
      map.set(entry.path, entry.signedUrl);
    }
  });
  return map;
}

export async function listCheckins(
  clientId: string,
  limit = 30,
): Promise<DailyCheckin[]> {
  const supabase = createClient();
  const { data } = (await supabase
    .from("daily_checkins")
    .select("*")
    .eq("client_id", clientId)
    .order("checkin_date", { ascending: false })
    .limit(limit)) as { data: DailyCheckin[] | null };
  return data ?? [];
}

export async function getTodaysCheckin(
  clientId: string,
): Promise<DailyCheckin | null> {
  const supabase = createClient();
  const today = new Date().toISOString().slice(0, 10);
  const { data } = (await supabase
    .from("daily_checkins")
    .select("*")
    .eq("client_id", clientId)
    .eq("checkin_date", today)
    .maybeSingle()) as { data: DailyCheckin | null };
  return data;
}

export interface ComplianceSummary {
  workout_pct: number; // 0..100, last 7 days
  diet_pct: number; // 0..100, last 7 days avg
  cardio_pct: number; // 0..100, last 7 days
  sleep_avg: number | null; // 1..5 average
  checkins_filled: number;
  checkins_total: number;
}

export async function getComplianceSummary(
  clientId: string,
  days = 7,
): Promise<ComplianceSummary> {
  const supabase = createClient();
  const since = new Date();
  since.setDate(since.getDate() - days + 1);
  const sinceStr = since.toISOString().slice(0, 10);

  const { data } = (await supabase
    .from("daily_checkins")
    .select("*")
    .eq("client_id", clientId)
    .gte("checkin_date", sinceStr)) as { data: DailyCheckin[] | null };

  const list = data ?? [];
  if (list.length === 0) {
    return {
      workout_pct: 0,
      diet_pct: 0,
      cardio_pct: 0,
      sleep_avg: null,
      checkins_filled: 0,
      checkins_total: days,
    };
  }
  const workoutScore = list.reduce(
    (acc, c) =>
      acc +
      (c.workout_done === "yes" ? 1 : c.workout_done === "partial" ? 0.5 : 0),
    0,
  );
  const dietScore = list.reduce((acc, c) => acc + (c.diet_compliance ?? 0), 0);
  const cardioScore = list.reduce((acc, c) => acc + (c.cardio_done ? 1 : 0), 0);
  const sleepScores = list
    .map((c) => c.sleep_quality)
    .filter((v): v is number => v !== null);

  return {
    workout_pct: Math.round((workoutScore / days) * 100),
    diet_pct: Math.round(dietScore / days),
    cardio_pct: Math.round((cardioScore / days) * 100),
    sleep_avg:
      sleepScores.length > 0
        ? Math.round(
            (sleepScores.reduce((a, b) => a + b, 0) / sleepScores.length) * 10,
          ) / 10
        : null,
    checkins_filled: list.length,
    checkins_total: days,
  };
}

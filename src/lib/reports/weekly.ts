import "server-only";
import { createClient } from "@/lib/supabase/server";
import { assertAdmin } from "@/lib/auth/admin-guard";
import {
  getComplianceSummary,
  listCheckins,
  listWeightLogs,
} from "@/lib/tracking/queries";
import type { Client } from "@/types/database";

export interface WeeklyClientReport {
  client_id: string;
  full_name: string | null;
  email: string;
  workout_pct: number;
  diet_pct: number;
  cardio_pct: number;
  sleep_avg: number | null;
  checkins_filled: number;
  checkins_total: number;
  weight_change_kg: number | null;
  latest_note: string | null;
}

interface ProfileWithEmail {
  id: string;
  full_name: string | null;
  email: string | null;
}

/**
 * Aggregate compliance + weight delta for every client over the last `days` days.
 * Used to power the admin weekly summary view (and could feed an email job).
 */
export async function getWeeklySummaryForAllClients(
  days = 7,
): Promise<WeeklyClientReport[]> {
  await assertAdmin();
  const supabase = createClient();
  const { data: clients } = (await supabase
    .from("clients")
    .select("id, user_id")
    .order("created_at", { ascending: false })) as {
    data: Pick<Client, "id" | "user_id">[] | null;
  };
  if (!clients || clients.length === 0) return [];

  const userIds = clients.map((c) => c.user_id);
  const { data: profiles } = (await supabase
    .from("profiles")
    .select("id, full_name, email")
    .in("id", userIds)) as { data: ProfileWithEmail[] | null };
  const profileById = new Map((profiles ?? []).map((p) => [p.id, p]));

  const reports = await Promise.all(
    clients.map(async (c) => {
      const [summary, weights, recentCheckins] = await Promise.all([
        getComplianceSummary(c.id, days),
        listWeightLogs(c.id, days + 1),
        listCheckins(c.id, 1),
      ]);
      const profile = profileById.get(c.user_id);
      const sortedAsc = [...weights].sort((a, b) =>
        a.log_date < b.log_date ? -1 : 1,
      );
      const first = sortedAsc[0];
      const last = sortedAsc[sortedAsc.length - 1];
      const weightChange =
        first && last && first.id !== last.id
          ? Math.round(
              (Number(last.weight_kg) - Number(first.weight_kg)) * 10,
            ) / 10
          : null;
      return {
        client_id: c.id,
        full_name: profile?.full_name ?? null,
        email: profile?.email ?? "",
        workout_pct: summary.workout_pct,
        diet_pct: summary.diet_pct,
        cardio_pct: summary.cardio_pct,
        sleep_avg: summary.sleep_avg,
        checkins_filled: summary.checkins_filled,
        checkins_total: summary.checkins_total,
        weight_change_kg: weightChange,
        latest_note: recentCheckins[0]?.client_note ?? null,
      };
    }),
  );
  return reports;
}

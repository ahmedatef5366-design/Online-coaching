import Link from "next/link";
import { notFound } from "next/navigation";
import { AlertTriangle, ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import {
  getDayWithExercises,
  getLastSessionPerExercise,
  getLifetimePrsPerExercise,
  getPlanNotesForDay,
  getWorkoutLogsForDate,
  type LastSessionSummary,
  type PrSummary,
} from "@/lib/workouts/queries";
import { readLocaleFromCookie } from "@/lib/i18n/locale-cookie";
import { getT } from "@/lib/i18n/t";
import { WorkoutSession } from "@/components/client/workouts/workout-session";

export const dynamic = "force-dynamic";

export default async function ClientWorkoutDayPage({
  params,
}: {
  params: { dayId: string };
}) {
  const [dayData, planNotes] = await Promise.all([
    getDayWithExercises(params.dayId),
    getPlanNotesForDay(params.dayId),
  ]);
  if (!dayData) notFound();
  const locale = readLocaleFromCookie();
  const t = getT(locale);

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: clientRow } = (await supabase
    .from("clients")
    .select("id")
    .eq("user_id", user!.id)
    .maybeSingle()) as { data: { id: string } | null };

  const today = new Date().toISOString().slice(0, 10);
  const exerciseIds = dayData.exercises.map((e) => e.id);
  const existingLogs = clientRow
    ? await getWorkoutLogsForDate(clientRow.id, today, exerciseIds)
    : [];
  const lastSessions: Map<string, LastSessionSummary> = clientRow
    ? await getLastSessionPerExercise(clientRow.id, exerciseIds, today)
    : new Map();
  const lifetimePrs: Map<string, PrSummary> = clientRow
    ? await getLifetimePrsPerExercise(clientRow.id, exerciseIds, today)
    : new Map();

  // Maps are not serializable across the server/client boundary in Next,
  // so flatten to plain records before handing them to the client.
  const lastSessionRecord: Record<string, LastSessionSummary> =
    Object.fromEntries(lastSessions);
  const lifetimePrRecord: Record<string, PrSummary> =
    Object.fromEntries(lifetimePrs);

  return (
    <div className="space-y-4">
      <Link
        href="/client/workouts"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        {t("client.workouts.all_days")}
      </Link>
      <div>
        <p className="text-sm uppercase tracking-wider text-muted-foreground">
          {t("client.workouts.day_label", { number: dayData.day.day_number })}
        </p>
        <h1 className="font-display text-3xl font-bold tracking-tight">
          {dayData.day.day_name}
        </h1>
      </div>

      {planNotes.attention_notes ? (
        <div
          className="flex items-start gap-3 rounded-xl border border-yellow-500/40 bg-yellow-500/10 px-4 py-3 text-sm text-yellow-200"
          role="note"
        >
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-wider">
              {t("client.workouts.heads_up")}
            </p>
            <p className="whitespace-pre-wrap leading-relaxed">
              {planNotes.attention_notes}
            </p>
          </div>
        </div>
      ) : null}

      <WorkoutSession
        exercises={dayData.exercises}
        existingLogs={existingLogs}
        lastSessions={lastSessionRecord}
        lifetimePrs={lifetimePrRecord}
        today={today}
      />
    </div>
  );
}

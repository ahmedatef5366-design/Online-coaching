import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import {
  getDayWithExercises,
  getWorkoutLogsForDate,
} from "@/lib/workouts/queries";
import { readLocaleFromCookie } from "@/lib/i18n/locale-cookie";
import { WorkoutSession } from "@/components/client/workouts/workout-session";

export const dynamic = "force-dynamic";

export default async function ClientWorkoutDayPage({
  params,
}: {
  params: { dayId: string };
}) {
  const dayData = await getDayWithExercises(params.dayId);
  if (!dayData) notFound();
  const locale = readLocaleFromCookie();

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

  return (
    <div className="space-y-4">
      <Link
        href="/client/workouts"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        {locale === "ar" ? "كل الأيام" : "All days"}
      </Link>
      <div>
        <p className="text-sm uppercase tracking-wider text-muted-foreground">
          {locale === "ar"
            ? `يوم ${dayData.day.day_number}`
            : `Day ${dayData.day.day_number}`}
        </p>
        <h1 className="font-display text-3xl font-bold tracking-tight">
          {dayData.day.day_name}
        </h1>
      </div>

      <WorkoutSession
        locale={locale}
        exercises={dayData.exercises}
        existingLogs={existingLogs}
        today={today}
      />
    </div>
  );
}

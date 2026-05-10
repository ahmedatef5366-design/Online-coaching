import { createClient } from "@/lib/supabase/server";
import { getTodaysCheckin, listCheckins } from "@/lib/tracking/queries";
import { readLocaleFromCookie } from "@/lib/i18n/locale-cookie";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CheckinForm } from "@/components/client/checkin/checkin-form";

export const dynamic = "force-dynamic";

export default async function ClientCheckinPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: clientRow } = (await supabase
    .from("clients")
    .select("id")
    .eq("user_id", user!.id)
    .maybeSingle()) as { data: { id: string } | null };

  const locale = readLocaleFromCookie();
  if (!clientRow) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{locale === "ar" ? "التشيك إن" : "Check-in"}</CardTitle>
        </CardHeader>
      </Card>
    );
  }

  const [today, history] = await Promise.all([
    getTodaysCheckin(clientRow.id),
    listCheckins(clientRow.id, 14),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold tracking-tight">
          {locale === "ar" ? "التشيك إن اليومي" : "Daily check-in"}
        </h1>
        <p className="text-sm text-muted-foreground">
          {locale === "ar"
            ? "املي النموذج كل ليلة قبل النوم — كوتشك بيشوف النتايج."
            : "Fill this in every night before bed — your coach reviews it."}
        </p>
      </div>

      <CheckinForm locale={locale} initial={today} />

      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            {locale === "ar" ? "آخر ١٤ يوم" : "Last 14 days"}
          </CardTitle>
          <CardDescription>
            {locale === "ar"
              ? "تتبع نفسك بنظرة سريعة."
              : "A glance at your recent compliance."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {history.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              {locale === "ar" ? "مفيش بيانات لسه." : "Nothing yet."}
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[520px] text-xs">
                <thead>
                  <tr className="border-b border-border/60 text-muted-foreground">
                    <th className="py-2 pe-2 text-start">
                      {locale === "ar" ? "التاريخ" : "Date"}
                    </th>
                    <th className="py-2 pe-2 text-start">
                      {locale === "ar" ? "تمرين" : "Workout"}
                    </th>
                    <th className="py-2 pe-2 text-end">
                      {locale === "ar" ? "تغذية" : "Diet"}
                    </th>
                    <th className="py-2 pe-2 text-end">
                      {locale === "ar" ? "كارديو" : "Cardio"}
                    </th>
                    <th className="py-2 pe-2 text-end">
                      {locale === "ar" ? "نوم" : "Sleep"}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((c) => (
                    <tr
                      key={c.id}
                      className="border-b border-border/30 last:border-0"
                    >
                      <td className="py-2 pe-2">{c.checkin_date}</td>
                      <td className="py-2 pe-2 capitalize">{c.workout_done}</td>
                      <td className="py-2 pe-2 text-end tabular-nums">
                        {c.diet_compliance ?? "—"}%
                      </td>
                      <td className="py-2 pe-2 text-end tabular-nums">
                        {c.cardio_done ? `${c.cardio_minutes ?? "?"}m` : "—"}
                      </td>
                      <td className="py-2 pe-2 text-end tabular-nums">
                        {c.sleep_quality ? `${c.sleep_quality}/5` : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

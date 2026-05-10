import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getWeeklySummaryForAllClients } from "@/lib/reports/weekly";
import { readLocaleFromCookie } from "@/lib/i18n/locale-cookie";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const dynamic = "force-dynamic";

export default async function AdminReportsPage() {
  const locale = readLocaleFromCookie();
  const reports = await getWeeklySummaryForAllClients(7);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold tracking-tight">
          {locale === "ar" ? "تقرير أسبوعي" : "Weekly summary"}
        </h1>
        <p className="text-sm text-muted-foreground">
          {locale === "ar"
            ? "نظرة عامة على كل عميل خلال آخر ٧ أيام."
            : "Per-client compliance over the last 7 days."}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            {locale === "ar"
              ? `${reports.length} عميل`
              : `${reports.length} clients`}
          </CardTitle>
          <CardDescription>
            {locale === "ar"
              ? "نسبة الالتزام بالتمرين، التغذية، الكارديو + متوسط النوم وفرق الوزن."
              : "Workout, diet, cardio compliance + sleep average and weight delta."}
          </CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto p-0">
          {reports.length === 0 ? (
            <p className="px-6 pb-6 text-sm text-muted-foreground">
              {locale === "ar" ? "مفيش عملاء لسه." : "No clients yet."}
            </p>
          ) : (
            <table className="w-full min-w-[760px] text-xs">
              <thead>
                <tr className="border-b border-border/60 text-muted-foreground">
                  <th className="px-4 py-2 text-start">
                    {locale === "ar" ? "العميل" : "Client"}
                  </th>
                  <th className="px-2 py-2 text-end">
                    {locale === "ar" ? "تمرين" : "Workout"}
                  </th>
                  <th className="px-2 py-2 text-end">
                    {locale === "ar" ? "تغذية" : "Diet"}
                  </th>
                  <th className="px-2 py-2 text-end">
                    {locale === "ar" ? "كارديو" : "Cardio"}
                  </th>
                  <th className="px-2 py-2 text-end">
                    {locale === "ar" ? "نوم" : "Sleep"}
                  </th>
                  <th className="px-2 py-2 text-end">
                    {locale === "ar" ? "تشيك إن" : "Check-ins"}
                  </th>
                  <th className="px-2 py-2 text-end">
                    {locale === "ar" ? "فرق الوزن" : "ΔWeight"}
                  </th>
                  <th className="px-4 py-2 text-end" />
                </tr>
              </thead>
              <tbody>
                {reports.map((r) => (
                  <tr
                    key={r.client_id}
                    className="border-b border-border/30 align-top last:border-0"
                  >
                    <td className="px-4 py-2">
                      <div className="font-medium">
                        {r.full_name ?? r.email}
                      </div>
                      {r.latest_note ? (
                        <div className="mt-1 max-w-[260px] truncate text-[11px] text-muted-foreground">
                          “{r.latest_note}”
                        </div>
                      ) : null}
                    </td>
                    <td className="px-2 py-2 text-end tabular-nums">
                      {r.workout_pct}%
                    </td>
                    <td className="px-2 py-2 text-end tabular-nums">
                      {r.diet_pct}%
                    </td>
                    <td className="px-2 py-2 text-end tabular-nums">
                      {r.cardio_pct}%
                    </td>
                    <td className="px-2 py-2 text-end tabular-nums">
                      {r.sleep_avg !== null ? `${r.sleep_avg}/5` : "—"}
                    </td>
                    <td className="px-2 py-2 text-end tabular-nums">
                      {r.checkins_filled}/{r.checkins_total}
                    </td>
                    <td className="px-2 py-2 text-end tabular-nums">
                      {r.weight_change_kg !== null
                        ? `${r.weight_change_kg > 0 ? "+" : ""}${r.weight_change_kg} kg`
                        : "—"}
                    </td>
                    <td className="px-4 py-2 text-end">
                      <Link
                        href={`/admin/clients/${r.client_id}/monitor`}
                        className="inline-flex items-center gap-1 text-primary hover:underline"
                      >
                        {locale === "ar" ? "تفاصيل" : "Open"}
                        <ArrowRight className="h-3.5 w-3.5 rtl:rotate-180" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

import Link from "next/link";
import { ArrowRight, Plus } from "lucide-react";
import { listClients } from "@/lib/clients/queries";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";
import { readLocaleFromCookie } from "@/lib/i18n/locale-cookie";

export const dynamic = "force-dynamic";

const GOAL_LABEL: Record<string, { en: string; ar: string }> = {
  fat_loss: { en: "Fat loss", ar: "خسارة دهون" },
  muscle_gain: { en: "Muscle gain", ar: "زيادة عضلية" },
  recomposition: { en: "Recomposition", ar: "تنحيف وتضخيم" },
  athletic_performance: { en: "Performance", ar: "أداء رياضي" },
};
const EXPERIENCE_LABEL: Record<string, { en: string; ar: string }> = {
  beginner: { en: "Beginner", ar: "مبتدئ" },
  intermediate: { en: "Intermediate", ar: "متوسط" },
  advanced: { en: "Advanced", ar: "متقدم" },
};

export default async function AdminClientsPage() {
  const locale = readLocaleFromCookie();
  const clients = await listClients();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight">
            {locale === "ar" ? "العملاء" : "Clients"}
          </h1>
          <p className="text-muted-foreground">
            {locale === "ar"
              ? "كل العملاء وحالة المتابعة لكل واحد."
              : "Everyone you're coaching and how active they've been."}
          </p>
        </div>
        <Link
          href="/admin/clients/new"
          className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" />
          {locale === "ar" ? "إضافة عميل" : "Add client"}
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            {locale === "ar" ? "كل العملاء" : "All clients"}
            <span className="ms-2 text-sm font-normal text-muted-foreground">
              ({clients.length})
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {clients.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              {locale === "ar"
                ? "لسه مفيش عملاء — اضغط على زرار الإضافة عشان تبدأ."
                : "No clients yet — use Add client to provision your first."}
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] text-sm">
                <thead>
                  <tr className="border-b border-border/60 text-start text-xs uppercase tracking-wider text-muted-foreground">
                    <th className="py-2 pe-3 text-start">
                      {locale === "ar" ? "الاسم" : "Name"}
                    </th>
                    <th className="py-2 pe-3 text-start">Email</th>
                    <th className="py-2 pe-3 text-start">
                      {locale === "ar" ? "الهدف" : "Goal"}
                    </th>
                    <th className="py-2 pe-3 text-start">
                      {locale === "ar" ? "المستوى" : "Level"}
                    </th>
                    <th className="py-2 pe-3 text-start">
                      {locale === "ar" ? "تاريخ البداية" : "Started"}
                    </th>
                    <th className="py-2 pe-3 text-start">
                      {locale === "ar" ? "آخر تمرين" : "Last workout"}
                    </th>
                    <th className="py-2"></th>
                  </tr>
                </thead>
                <tbody>
                  {clients.map((c) => {
                    const goalLabel = c.goal
                      ? (GOAL_LABEL[c.goal]?.[locale] ?? c.goal)
                      : "—";
                    const expLabel = c.experience_level
                      ? (EXPERIENCE_LABEL[c.experience_level]?.[locale] ??
                        c.experience_level)
                      : "—";
                    return (
                      <tr
                        key={c.id}
                        className="border-b border-border/30 last:border-0"
                      >
                        <td className="py-3 pe-3 font-medium">
                          {c.full_name ?? "—"}
                        </td>
                        <td className="py-3 pe-3 text-muted-foreground">
                          {c.email}
                        </td>
                        <td className="py-3 pe-3">{goalLabel}</td>
                        <td className="py-3 pe-3">{expLabel}</td>
                        <td className="py-3 pe-3 text-muted-foreground">
                          {c.start_date
                            ? formatDate(c.start_date, locale)
                            : "—"}
                        </td>
                        <td className="py-3 pe-3 text-muted-foreground">
                          {c.last_workout_log_date
                            ? formatDate(c.last_workout_log_date, locale)
                            : "—"}
                        </td>
                        <td className="py-3 text-end">
                          <Link
                            href={`/admin/clients/${c.id}`}
                            className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                          >
                            {locale === "ar" ? "فتح" : "Open"}
                            <ArrowRight className="h-3.5 w-3.5" />
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

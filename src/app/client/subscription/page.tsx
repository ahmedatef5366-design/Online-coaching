import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getCurrentClientSubscription } from "@/lib/subscription/queries";
import { createClient } from "@/lib/supabase/server";
import {
  subscriptionStatusColor,
  subscriptionStatusLabel,
} from "@/lib/subscription/status";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { readLocaleFromCookie } from "@/lib/i18n/locale-cookie";
import { formatDate } from "@/lib/utils";
import {
  PAYMENT_METHOD_LABEL,
  PAYMENT_STATUS_COLOR,
  PAYMENT_STATUS_LABEL,
  formatMoney,
} from "@/lib/payments/format";
import type { Payment } from "@/types/database";

export const dynamic = "force-dynamic";

export default async function ClientSubscriptionPage() {
  const locale = readLocaleFromCookie();
  const t = (en: string, ar: string) => (locale === "ar" ? ar : en);

  const subscription = await getCurrentClientSubscription();

  // Payments history — RLS allows clients to read their own rows.
  let payments: Payment[] = [];
  if (subscription?.clientId) {
    const supabase = createClient();
    const { data } = (await supabase
      .from("payments")
      .select("*")
      .eq("client_id", subscription.clientId)
      .order("created_at", { ascending: false })) as {
      data: Payment[] | null;
    };
    payments = data ?? [];
  }

  return (
    <div className="space-y-6">
      <Link
        href="/client/dashboard"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        {t("Back to dashboard", "ارجع للوحة")}
      </Link>

      <div>
        <h1 className="font-display text-3xl font-bold tracking-tight">
          {t("My subscription", "اشتراكي")}
        </h1>
        <p className="text-muted-foreground">
          {t(
            "Status, end date, and your payment history.",
            "الحالة، تاريخ الانتهاء، وسجل الدفعات.",
          )}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            {t("Current status", "الحالة الحالية")}
          </CardTitle>
          <CardDescription>
            {subscription ? (
              <span
                className={
                  "inline-block rounded-full px-3 py-1 text-sm font-medium " +
                  subscriptionStatusColor(subscription.snapshot.status)
                }
              >
                {subscriptionStatusLabel(subscription.snapshot.status, locale)}
              </span>
            ) : (
              t("No client profile found.", "مفيش ملف عميل.")
            )}
          </CardDescription>
        </CardHeader>
        {subscription ? (
          <CardContent className="grid gap-3 sm:grid-cols-3">
            <StatField
              label={t("Ends on", "تاريخ الانتهاء")}
              value={
                subscription.snapshot.endsAt
                  ? formatDate(subscription.snapshot.endsAt, locale)
                  : "—"
              }
            />
            <StatField
              label={t("Days remaining", "أيام متبقية")}
              value={
                subscription.snapshot.daysRemaining === null
                  ? "—"
                  : subscription.snapshot.daysRemaining < 0
                    ? t("Expired", "انتهى")
                    : String(subscription.snapshot.daysRemaining)
              }
            />
            <StatField
              label={t("Needs action?", "محتاج إجراء؟")}
              value={
                subscription.snapshot.isActive
                  ? t("No", "لأ")
                  : t("Yes — contact your coach", "أيوه — كلّم الكوتش")
              }
            />
          </CardContent>
        ) : null}
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            {t("Payment history", "سجل الدفعات")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {payments.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              {t(
                "No payments recorded yet.",
                "لسه مفيش دفعات مسجلة.",
              )}
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[560px] text-sm">
                <thead>
                  <tr className="border-b border-border/60 text-start text-xs uppercase tracking-wider text-muted-foreground">
                    <th className="py-2 pe-3 text-start">
                      {t("Date", "التاريخ")}
                    </th>
                    <th className="py-2 pe-3 text-start">
                      {t("Amount", "المبلغ")}
                    </th>
                    <th className="py-2 pe-3 text-start">
                      {t("Method", "الوسيلة")}
                    </th>
                    <th className="py-2 pe-3 text-start">
                      {t("Covers", "الفترة")}
                    </th>
                    <th className="py-2 pe-3 text-start">
                      {t("Status", "الحالة")}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((p) => (
                    <tr
                      key={p.id}
                      className="border-b border-border/30 last:border-0"
                    >
                      <td className="py-3 pe-3 text-muted-foreground">
                        {formatDate(p.created_at, locale)}
                      </td>
                      <td className="py-3 pe-3 font-medium">
                        {formatMoney(p.amount, p.currency)}
                      </td>
                      <td className="py-3 pe-3 text-muted-foreground">
                        {PAYMENT_METHOD_LABEL[p.method][locale]}
                      </td>
                      <td className="py-3 pe-3 text-xs text-muted-foreground">
                        {p.period_start && p.period_end
                          ? `${formatDate(p.period_start, locale)} → ${formatDate(p.period_end, locale)}`
                          : "—"}
                      </td>
                      <td className="py-3 pe-3">
                        <span
                          className={
                            "rounded-full px-2 py-0.5 text-xs " +
                            PAYMENT_STATUS_COLOR[p.status]
                          }
                        >
                          {PAYMENT_STATUS_LABEL[p.status][locale]}
                        </span>
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

function StatField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <p className="font-display text-xl font-semibold">{value}</p>
    </div>
  );
}

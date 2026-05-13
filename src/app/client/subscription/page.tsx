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
import { getT } from "@/lib/i18n/t";
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
  const t = getT(locale);

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
        {t("client.subscription.back")}
      </Link>

      <div>
        <h1 className="font-display text-3xl font-bold tracking-tight">
          {t("client.subscription.title")}
        </h1>
        <p className="text-muted-foreground">
          {t("client.subscription.subtitle")}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            {t("client.subscription.current_status")}
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
              t("client.subscription.no_profile")
            )}
          </CardDescription>
        </CardHeader>
        {subscription ? (
          <CardContent className="grid gap-3 sm:grid-cols-3">
            <StatField
              label={t("client.subscription.ends_on")}
              value={
                subscription.snapshot.endsAt
                  ? formatDate(subscription.snapshot.endsAt, locale)
                  : "—"
              }
            />
            <StatField
              label={t("client.subscription.days_remaining")}
              value={
                subscription.snapshot.daysRemaining === null
                  ? "—"
                  : subscription.snapshot.daysRemaining < 0
                    ? t("client.subscription.expired")
                    : String(subscription.snapshot.daysRemaining)
              }
            />
            <StatField
              label={t("client.subscription.needs_action")}
              value={
                subscription.snapshot.isActive
                  ? t("client.subscription.no")
                  : t("client.subscription.yes_contact_coach")
              }
            />
          </CardContent>
        ) : null}
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            {t("client.subscription.payment_history")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {payments.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              {t("client.subscription.no_payments")}
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[560px] text-sm">
                <thead>
                  <tr className="border-b border-border/60 text-start text-xs uppercase tracking-wider text-muted-foreground">
                    <th className="py-2 pe-3 text-start">
                      {t("client.subscription.table_date")}
                    </th>
                    <th className="py-2 pe-3 text-start">
                      {t("client.subscription.table_amount")}
                    </th>
                    <th className="py-2 pe-3 text-start">
                      {t("client.subscription.table_method")}
                    </th>
                    <th className="py-2 pe-3 text-start">
                      {t("client.subscription.table_covers")}
                    </th>
                    <th className="py-2 pe-3 text-start">
                      {t("client.subscription.table_status")}
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

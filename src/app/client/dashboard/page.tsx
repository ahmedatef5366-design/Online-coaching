import Link from "next/link";
import { ArrowRight, Dumbbell } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";
import { getActivePlan } from "@/lib/workouts/queries";
import {
  getActiveNutritionPlan,
  getFoodLogForDate,
  totalsFromLogs,
} from "@/lib/nutrition/queries";
import { getTodaysCheckin } from "@/lib/tracking/queries";
import { readLocaleFromCookie } from "@/lib/i18n/locale-cookie";
import { getT } from "@/lib/i18n/t";
import { computeSubscriptionSnapshot } from "@/lib/subscription/status";
import { SubscriptionBanner } from "@/components/client/subscription-banner";
import type { SubscriptionStatus } from "@/types/database";

type NameRow = { full_name: string | null } | null;

export const dynamic = "force-dynamic";

export default async function ClientDashboardPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const [profileResult, clientResult] = await Promise.all([
    supabase
      .from("profiles")
      .select("full_name")
      .eq("id", user!.id)
      .maybeSingle(),
    supabase
      .from("clients")
      .select("id, subscription_status, subscription_ends_at")
      .eq("user_id", user!.id)
      .maybeSingle(),
  ]);
  const profile = profileResult.data as NameRow;
  const clientRow = clientResult.data as {
    id: string;
    subscription_status: SubscriptionStatus;
    subscription_ends_at: string | null;
  } | null;

  const subscription = clientRow
    ? computeSubscriptionSnapshot({
        status: clientRow.subscription_status,
        subscription_ends_at: clientRow.subscription_ends_at,
      })
    : null;

  const locale = readLocaleFromCookie();
  const t = getT(locale);
  const today = new Date().toISOString().slice(0, 10);
  const [plan, nutritionPlan, todayLogs, todaysCheckin] = clientRow
    ? await Promise.all([
        getActivePlan(clientRow.id),
        getActiveNutritionPlan(clientRow.id),
        getFoodLogForDate(clientRow.id, today),
        getTodaysCheckin(clientRow.id),
      ])
    : [null, null, [], null];
  const firstDay = plan?.days[0];
  const totals = totalsFromLogs(todayLogs);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-muted-foreground">
          {t("client.dashboard.welcome")}
        </p>
        <h1 className="font-display text-3xl font-bold tracking-tight">
          {profile?.full_name ?? t("client.dashboard.athlete_fallback")}
        </h1>
      </div>

      {subscription ? (
        <SubscriptionBanner snapshot={subscription} locale={locale} />
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            {t("client.dashboard.workout_title")}
          </CardTitle>
          <CardDescription>
            {plan ? plan.plan.name : t("client.dashboard.no_plan")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {firstDay ? (
            <Link
              href={`/client/workouts/${firstDay.day.id}`}
              className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
            >
              <Dumbbell className="h-4 w-4" />
              {t("client.dashboard.start_workout")}
              <ArrowRight className="h-4 w-4 rtl:rotate-180" />
            </Link>
          ) : plan ? (
            <p className="text-sm text-muted-foreground">
              {t("client.dashboard.empty_plan")}
            </p>
          ) : (
            <p className="text-sm text-muted-foreground">
              {t("client.dashboard.plan_pending")}
            </p>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-3 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              {t("client.dashboard.macros_today")}
            </CardTitle>
            <CardDescription>
              {nutritionPlan
                ? `${Math.round(totals.calories)}${nutritionPlan.plan.calories_target ? ` / ${nutritionPlan.plan.calories_target}` : ""} kcal`
                : t("client.dashboard.no_nutrition_plan")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link
              href="/client/nutrition"
              className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
            >
              {t("client.dashboard.open_tracker")}
              <ArrowRight className="h-4 w-4 rtl:rotate-180" />
            </Link>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              {t("client.dashboard.todays_checkin")}
            </CardTitle>
            <CardDescription>
              {todaysCheckin
                ? t("client.dashboard.checkin_submitted")
                : t("client.dashboard.checkin_pending")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link
              href="/client/checkin"
              className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
            >
              {todaysCheckin
                ? t("client.dashboard.checkin_update")
                : t("client.dashboard.checkin_open")}
              <ArrowRight className="h-4 w-4 rtl:rotate-180" />
            </Link>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            {t("client.dashboard.subscription_title")}
          </CardTitle>
          <CardDescription>
            {subscription && subscription.endsAt
              ? subscription.daysRemaining !== null &&
                subscription.daysRemaining >= 0
                ? t("client.dashboard.subscription_ends_in_days", {
                    days: subscription.daysRemaining,
                  })
                : t("client.dashboard.subscription_expired")
              : t("client.dashboard.subscription_default")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Link
            href="/client/subscription"
            className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
          >
            {t("client.dashboard.open")}
            <ArrowRight className="h-4 w-4 rtl:rotate-180" />
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}

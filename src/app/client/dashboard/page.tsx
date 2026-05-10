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
          {locale === "ar" ? "أهلاً بعودتك،" : "Welcome back,"}
        </p>
        <h1 className="font-display text-3xl font-bold tracking-tight">
          {profile?.full_name ?? (locale === "ar" ? "بطل" : "athlete")}
        </h1>
      </div>

      {subscription ? (
        <SubscriptionBanner snapshot={subscription} locale={locale} />
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            {locale === "ar" ? "تمرينك" : "Your workout"}
          </CardTitle>
          <CardDescription>
            {plan
              ? plan.plan.name
              : locale === "ar"
                ? "لسه ما تم اختيار خطة."
                : "No plan assigned yet."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {firstDay ? (
            <Link
              href={`/client/workouts/${firstDay.day.id}`}
              className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
            >
              <Dumbbell className="h-4 w-4" />
              {locale === "ar" ? "ابدأ التمرين" : "Start workout"}
              <ArrowRight className="h-4 w-4 rtl:rotate-180" />
            </Link>
          ) : plan ? (
            <p className="text-sm text-muted-foreground">
              {locale === "ar"
                ? "الخطة فاضية لسه."
                : "Your plan has no days yet."}
            </p>
          ) : (
            <p className="text-sm text-muted-foreground">
              {locale === "ar"
                ? "هتظهر الخطة هنا بمجرد ما الكوتش يعدها."
                : "Your plan will show up here as soon as your coach builds it."}
            </p>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-3 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              {locale === "ar" ? "الماكروز اليوم" : "Macros today"}
            </CardTitle>
            <CardDescription>
              {nutritionPlan
                ? `${Math.round(totals.calories)}${nutritionPlan.plan.calories_target ? ` / ${nutritionPlan.plan.calories_target}` : ""} kcal`
                : locale === "ar"
                  ? "مفيش خطة لسه."
                  : "No plan yet."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link
              href="/client/nutrition"
              className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
            >
              {locale === "ar" ? "افتح التتبع" : "Open tracker"}
              <ArrowRight className="h-4 w-4 rtl:rotate-180" />
            </Link>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              {locale === "ar" ? "تشيك-إن اليوم" : "Today's check-in"}
            </CardTitle>
            <CardDescription>
              {todaysCheckin
                ? locale === "ar"
                  ? "تم تسجيل اليوم ✓"
                  : "Submitted ✓"
                : locale === "ar"
                  ? "لسه ماتسجلش."
                  : "Not submitted yet."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link
              href="/client/checkin"
              className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
            >
              {todaysCheckin
                ? locale === "ar"
                  ? "تعديل التشيك إن"
                  : "Update check-in"
                : locale === "ar"
                  ? "اعمل تشيك إن"
                  : "Open check-in"}
              <ArrowRight className="h-4 w-4 rtl:rotate-180" />
            </Link>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            {locale === "ar" ? "اشتراكي" : "Subscription"}
          </CardTitle>
          <CardDescription>
            {subscription && subscription.endsAt
              ? locale === "ar"
                ? subscription.daysRemaining !== null &&
                  subscription.daysRemaining >= 0
                  ? `ينتهي بعد ${subscription.daysRemaining} يوم`
                  : "منتهي"
                : subscription.daysRemaining !== null &&
                    subscription.daysRemaining >= 0
                  ? `Ends in ${subscription.daysRemaining} days`
                  : "Expired"
              : locale === "ar"
                ? "عرض حالة الاشتراك والدفعات."
                : "View subscription status & payment history."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Link
            href="/client/subscription"
            className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
          >
            {locale === "ar" ? "افتح" : "Open"}
            <ArrowRight className="h-4 w-4 rtl:rotate-180" />
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}

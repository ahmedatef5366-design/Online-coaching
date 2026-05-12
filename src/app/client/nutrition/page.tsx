import { createClient } from "@/lib/supabase/server";
import {
  getActiveNutritionPlan,
  getFoodLogForDate,
  listFoods,
  totalsFromLogs,
} from "@/lib/nutrition/queries";
import { readLocaleFromCookie } from "@/lib/i18n/locale-cookie";
import { getT } from "@/lib/i18n/t";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ClientNutritionTracker } from "@/components/client/nutrition/nutrition-tracker";

export const dynamic = "force-dynamic";

export default async function ClientNutritionPage() {
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
  const t = getT(locale);
  if (!clientRow) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t("client.nutrition.title")}</CardTitle>
          <CardDescription>
            {t("client.nutrition.profile_inactive")}
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const today = new Date().toISOString().slice(0, 10);
  const [plan, foods, logs] = await Promise.all([
    getActiveNutritionPlan(clientRow.id),
    listFoods(),
    getFoodLogForDate(clientRow.id, today),
  ]);
  const totals = totalsFromLogs(logs);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="font-display text-3xl font-bold tracking-tight">
          {t("client.nutrition.title")}
        </h1>
        <p className="text-sm text-muted-foreground">
          {plan
            ? plan.plan.mode === "fixed"
              ? t("client.nutrition.plan_fixed")
              : t("client.nutrition.plan_flexible")
            : t("client.nutrition.no_plan")}
        </p>
      </div>

      <ClientNutritionTracker
        locale={locale}
        plan={plan}
        foods={foods}
        logs={logs}
        totals={totals}
        today={today}
      />
    </div>
  );
}

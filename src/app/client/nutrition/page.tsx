import { createClient } from "@/lib/supabase/server";
import {
  getActiveNutritionPlan,
  getFoodLogForDate,
  listFoods,
  totalsFromLogs,
} from "@/lib/nutrition/queries";
import { readLocaleFromCookie } from "@/lib/i18n/locale-cookie";
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
  if (!clientRow) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{locale === "ar" ? "التغذية" : "Nutrition"}</CardTitle>
          <CardDescription>
            {locale === "ar"
              ? "حسابك مش مفعل لسه."
              : "Your client profile isn't set up yet."}
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
          {locale === "ar" ? "التغذية" : "Nutrition"}
        </h1>
        <p className="text-sm text-muted-foreground">
          {plan
            ? plan.plan.mode === "fixed"
              ? locale === "ar"
                ? "خطة وجبات ثابتة"
                : "Fixed meal plan"
              : locale === "ar"
                ? "ماكروز مرنة (IIFYM)"
                : "Flexible (IIFYM)"
            : locale === "ar"
              ? "مفيش خطة لسه."
              : "No plan yet."}
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

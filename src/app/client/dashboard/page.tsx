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
import { readLocaleFromCookie } from "@/lib/i18n/locale-cookie";

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
    supabase.from("clients").select("id").eq("user_id", user!.id).maybeSingle(),
  ]);
  const profile = profileResult.data as NameRow;
  const clientRow = clientResult.data as { id: string } | null;

  const locale = readLocaleFromCookie();
  const plan = clientRow ? await getActivePlan(clientRow.id) : null;
  const firstDay = plan?.days[0];

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
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              {locale === "ar"
                ? "هيتفعل في المرحلة الجاية."
                : "Coming next phase."}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              {locale === "ar" ? "تشيك-إن اليوم" : "Today's check-in"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              {locale === "ar"
                ? "هيتفعل في المرحلة الجاية."
                : "Coming next phase."}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

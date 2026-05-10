import Link from "next/link";
import { AlertTriangle, ArrowRight, Dumbbell, Megaphone } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getActivePlan } from "@/lib/workouts/queries";
import { readLocaleFromCookie } from "@/lib/i18n/locale-cookie";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const dynamic = "force-dynamic";

export default async function ClientWorkoutsPage() {
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
  const plan = clientRow ? await getActivePlan(clientRow.id) : null;

  if (!plan) {
    return (
      <div className="space-y-4">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight">
            {locale === "ar" ? "تمارينك" : "Your workouts"}
          </h1>
        </div>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              {locale === "ar" ? "مفيش خطة لسه" : "No plan yet"}
            </CardTitle>
            <CardDescription>
              {locale === "ar"
                ? "الكوتش لسه ما عملش خطة. هتظهر هنا بمجرد ما تتعمل."
                : "Your coach hasn't assigned a plan yet. It'll show up here as soon as it does."}
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-muted-foreground">
          {locale === "ar" ? "خطتك الحالية" : "Your current plan"}
        </p>
        <h1 className="font-display text-3xl font-bold tracking-tight">
          {plan.plan.name}
        </h1>
      </div>

      {plan.plan.attention_notes ? (
        <div
          className="flex items-start gap-3 rounded-xl border border-yellow-500/40 bg-yellow-500/10 px-4 py-3 text-sm text-yellow-200"
          role="note"
        >
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-wider">
              {locale === "ar" ? "لازم تخلي بالك" : "Heads up"}
            </p>
            <p className="whitespace-pre-wrap leading-relaxed">
              {plan.plan.attention_notes}
            </p>
          </div>
        </div>
      ) : null}

      {plan.plan.general_notes ? (
        <div className="flex items-start gap-3 rounded-xl border border-border/60 bg-card/60 px-4 py-3 text-sm text-muted-foreground">
          <Megaphone className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-wider text-foreground">
              {locale === "ar" ? "ملاحظات الكوتش" : "Coach notes"}
            </p>
            <p className="whitespace-pre-wrap leading-relaxed">
              {plan.plan.general_notes}
            </p>
          </div>
        </div>
      ) : null}

      {plan.days.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-sm text-muted-foreground">
            {locale === "ar"
              ? "الخطة فاضية لسه."
              : "This plan doesn't have any days yet."}
          </CardContent>
        </Card>
      ) : (
        <ul className="space-y-3">
          {plan.days.map((d) => (
            <li key={d.day.id}>
              <Link
                href={`/client/workouts/${d.day.id}`}
                className="block rounded-xl border border-border/60 bg-card p-4 transition-colors hover:border-primary/60"
              >
                <div className="flex items-center gap-3">
                  <div className="rounded-full bg-primary/15 p-2 text-primary">
                    <Dumbbell className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs uppercase tracking-wider text-muted-foreground">
                      {locale === "ar"
                        ? `يوم ${d.day.day_number}`
                        : `Day ${d.day.day_number}`}
                    </p>
                    <p className="font-semibold">{d.day.day_name}</p>
                    <p className="text-xs text-muted-foreground">
                      {d.exercises.length}{" "}
                      {locale === "ar" ? "تمرين" : "exercises"}
                    </p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground rtl:rotate-180" />
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

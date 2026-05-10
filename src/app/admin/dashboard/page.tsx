import { createClient } from "@/lib/supabase/server";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default async function AdminDashboardPage() {
  const supabase = createClient();
  const [{ count: clientCount }, { count: foodCount }] = await Promise.all([
    supabase.from("clients").select("id", { count: "exact", head: true }),
    supabase.from("food_database").select("id", { count: "exact", head: true }),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold tracking-tight">
          Dashboard
        </h1>
        <p className="text-muted-foreground">
          High-level overview of your coaching practice.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader>
            <CardDescription>Active clients</CardDescription>
            <CardTitle className="font-display text-3xl">
              {clientCount ?? 0}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Foods in DB</CardDescription>
            <CardTitle className="font-display text-3xl">
              {foodCount ?? 0}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Workouts logged this week</CardDescription>
            <CardTitle className="font-display text-3xl">—</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              Available once Phase 3 ships.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Avg. compliance</CardDescription>
            <CardTitle className="font-display text-3xl">—</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              Available once Phase 5 ships.
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Phase 1 — what&apos;s live</CardTitle>
          <CardDescription>
            Foundation only. Authentication, role-based routing, and CMS-backed
            landing data are wired up. Feature surfaces (workouts, nutrition,
            progress, check-in, monitoring) ship in Phases 3–5.
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
}

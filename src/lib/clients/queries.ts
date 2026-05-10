import "server-only";
import { createClient } from "@/lib/supabase/server";
import type {
  Client,
  ExperienceLevel,
  Profile,
  TrainingGoal,
} from "@/types/database";

export interface ClientListRow {
  id: string;
  user_id: string;
  full_name: string | null;
  email: string;
  goal: TrainingGoal | null;
  experience_level: ExperienceLevel | null;
  start_date: string | null;
  created_at: string;
  last_workout_log_date: string | null;
}

interface RawClientRow {
  id: string;
  user_id: string;
  goal: TrainingGoal | null;
  experience_level: ExperienceLevel | null;
  start_date: string | null;
  created_at: string;
}

interface RawProfileRow {
  id: string;
  full_name: string | null;
  email: string;
}

interface RawWorkoutLogDate {
  client_id: string;
  log_date: string;
}

/** List all clients with their profile + most recent workout-log date. */
export async function listClients(): Promise<ClientListRow[]> {
  const supabase = createClient();
  const { data: clients, error } = (await supabase
    .from("clients")
    .select("id, user_id, goal, experience_level, start_date, created_at")
    .order("created_at", { ascending: false })) as {
    data: RawClientRow[] | null;
    error: { message: string } | null;
  };
  if (error) throw new Error(error.message);

  const rows = clients ?? [];
  if (rows.length === 0) return [];

  const userIds = rows.map((r) => r.user_id);
  const clientIds = rows.map((r) => r.id);

  const [profilesResult, logsResult] = await Promise.all([
    supabase.from("profiles").select("id, full_name, email").in("id", userIds),
    supabase
      .from("workout_logs")
      .select("client_id, log_date")
      .in("client_id", clientIds)
      .order("log_date", { ascending: false }),
  ]);
  const profiles = (profilesResult.data ?? []) as RawProfileRow[];
  const logs = (logsResult.data ?? []) as RawWorkoutLogDate[];

  const profileById = new Map<string, RawProfileRow>();
  profiles.forEach((p) => profileById.set(p.id, p));

  const lastByClient = new Map<string, string>();
  logs.forEach((l) => {
    if (!lastByClient.has(l.client_id)) {
      lastByClient.set(l.client_id, l.log_date);
    }
  });

  return rows.map((r) => {
    const p = profileById.get(r.user_id);
    return {
      id: r.id,
      user_id: r.user_id,
      full_name: p?.full_name ?? null,
      email: p?.email ?? "",
      goal: r.goal,
      experience_level: r.experience_level,
      start_date: r.start_date,
      created_at: r.created_at,
      last_workout_log_date: lastByClient.get(r.id) ?? null,
    } satisfies ClientListRow;
  });
}

export interface ClientDetail {
  client: Client;
  profile: Pick<Profile, "id" | "email" | "full_name" | "preferred_locale">;
}

/** Look up one client (by clients.id) plus their profile basics. */
export async function getClientDetail(
  clientId: string,
): Promise<ClientDetail | null> {
  const supabase = createClient();
  const { data: client } = (await supabase
    .from("clients")
    .select("*")
    .eq("id", clientId)
    .maybeSingle()) as { data: Client | null };
  if (!client) return null;

  const { data: profile } = (await supabase
    .from("profiles")
    .select("id, email, full_name, preferred_locale")
    .eq("id", client.user_id)
    .maybeSingle()) as {
    data: Pick<
      Profile,
      "id" | "email" | "full_name" | "preferred_locale"
    > | null;
  };
  if (!profile) return null;

  return { client, profile };
}

"use server";

import { revalidatePath } from "next/cache";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { assertAdmin } from "@/lib/auth/admin-guard";
import type { ExperienceLevel, TrainingGoal } from "@/types/database";

export interface ActionResult<T = void> {
  ok: boolean;
  error?: string;
  data?: T;
}

const TRAINING_GOALS: TrainingGoal[] = [
  "fat_loss",
  "muscle_gain",
  "recomposition",
  "athletic_performance",
];
const EXPERIENCE_LEVELS: ExperienceLevel[] = [
  "beginner",
  "intermediate",
  "advanced",
];

function asGoal(value: unknown): TrainingGoal | null {
  return typeof value === "string" &&
    (TRAINING_GOALS as string[]).includes(value)
    ? (value as TrainingGoal)
    : null;
}
function asExperience(value: unknown): ExperienceLevel | null {
  return typeof value === "string" &&
    (EXPERIENCE_LEVELS as string[]).includes(value)
    ? (value as ExperienceLevel)
    : null;
}
function asNumber(value: unknown): number | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (trimmed === "") return null;
  const n = Number(trimmed);
  return Number.isFinite(n) ? n : null;
}
function asText(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed === "" ? null : trimmed;
}
function asDate(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (trimmed === "") return null;
  // Accept yyyy-mm-dd from <input type="date">
  return /^\d{4}-\d{2}-\d{2}$/.test(trimmed) ? trimmed : null;
}

export interface CreateClientInput {
  email: string;
  password: string;
  full_name: string;
  age?: string | null;
  height_cm?: string | null;
  starting_weight_kg?: string | null;
  experience_level?: string | null;
  goal?: string | null;
  health_notes?: string | null;
  start_date?: string | null;
  target_date?: string | null;
}

/**
 * Provision a new client: create the auth user with role=client, ensure the
 * profile row reflects that role + name, and insert (or upsert) the matching
 * `clients` row with personal info.
 */
export async function createNewClient(
  input: CreateClientInput,
): Promise<ActionResult<{ clientId: string }>> {
  const guard = await assertAdmin();
  if (!guard.ok) return { ok: false, error: guard.error };

  const email = input.email.trim().toLowerCase();
  const password = input.password;
  const fullName = input.full_name.trim();

  if (!email || !password || !fullName) {
    return { ok: false, error: "Email, password, and full name are required." };
  }
  if (password.length < 8) {
    return { ok: false, error: "Password must be at least 8 characters." };
  }

  const service = createServiceClient();

  // 1. create the auth user (idempotent — handle already-exists below)
  const { data: created, error: createErr } =
    await service.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: fullName, role: "client" },
    });

  if (createErr) {
    if (/already.*registered|already.*exists/i.test(createErr.message)) {
      return {
        ok: false,
        error:
          "An account with that email already exists. Use \u201creset password\u201d on the existing client instead.",
      };
    }
    return { ok: false, error: createErr.message };
  }
  const userId = created?.user?.id;
  if (!userId) {
    return { ok: false, error: "Could not create auth user." };
  }

  // 2. force profile row to client role + name
  const { error: profileErr } = await service
    .from("profiles")
    .upsert(
      { id: userId, email, role: "client", full_name: fullName },
      { onConflict: "id" },
    );
  if (profileErr) return { ok: false, error: profileErr.message };

  // 3. upsert the clients row
  const clientPayload = {
    user_id: userId,
    age: asNumber(input.age),
    height_cm: asNumber(input.height_cm),
    starting_weight_kg: asNumber(input.starting_weight_kg),
    experience_level: asExperience(input.experience_level),
    goal: asGoal(input.goal),
    health_notes: asText(input.health_notes),
    start_date: asDate(input.start_date),
    target_date: asDate(input.target_date),
  };

  const { data: clientRow, error: clientErr } = await service
    .from("clients")
    .upsert(clientPayload, { onConflict: "user_id" })
    .select("id")
    .maybeSingle();
  if (clientErr) return { ok: false, error: clientErr.message };
  const clientId = (clientRow as { id: string } | null)?.id;
  if (!clientId) return { ok: false, error: "Failed to create client row." };

  revalidatePath("/admin/clients");
  return { ok: true, data: { clientId } };
}

/**
 * Reset a client's password to a new value supplied by the admin (or one
 * the form generated). Returns ok with the email so the UI can show a
 * "copy & send" panel.
 */
export async function resetClientPassword(input: {
  client_id: string;
  password: string;
}): Promise<ActionResult<{ email: string }>> {
  const guard = await assertAdmin();
  if (!guard.ok) return { ok: false, error: guard.error };

  const password = input.password;
  if (!password || password.length < 8) {
    return { ok: false, error: "Password must be at least 8 characters." };
  }

  const supabase = createClient();
  const { data: client } = (await supabase
    .from("clients")
    .select("id, user_id")
    .eq("id", input.client_id)
    .maybeSingle()) as { data: { id: string; user_id: string } | null };
  if (!client) return { ok: false, error: "Client not found." };

  const { data: profile } = (await supabase
    .from("profiles")
    .select("email")
    .eq("id", client.user_id)
    .maybeSingle()) as { data: { email: string } | null };
  if (!profile) return { ok: false, error: "Profile not found." };

  const service = createServiceClient();
  const { error } = await service.auth.admin.updateUserById(client.user_id, {
    password,
  });
  if (error) return { ok: false, error: error.message };

  revalidatePath(`/admin/clients/${client.id}`);
  return { ok: true, data: { email: profile.email } };
}

export interface UpdateClientInput {
  client_id: string;
  full_name: string;
  age?: string | null;
  height_cm?: string | null;
  starting_weight_kg?: string | null;
  experience_level?: string | null;
  goal?: string | null;
  health_notes?: string | null;
  start_date?: string | null;
  target_date?: string | null;
}

export async function updateClient(
  input: UpdateClientInput,
): Promise<ActionResult> {
  const guard = await assertAdmin();
  if (!guard.ok) return { ok: false, error: guard.error };

  const supabase = createClient();
  const { data: client } = (await supabase
    .from("clients")
    .select("id, user_id")
    .eq("id", input.client_id)
    .maybeSingle()) as { data: { id: string; user_id: string } | null };
  if (!client) return { ok: false, error: "Client not found." };

  const fullName = input.full_name.trim();
  if (!fullName) return { ok: false, error: "Full name is required." };

  const { error: pErr } = await supabase
    .from("profiles")
    .update({ full_name: fullName })
    .eq("id", client.user_id);
  if (pErr) return { ok: false, error: pErr.message };

  const { error: cErr } = await supabase
    .from("clients")
    .update({
      age: asNumber(input.age),
      height_cm: asNumber(input.height_cm),
      starting_weight_kg: asNumber(input.starting_weight_kg),
      experience_level: asExperience(input.experience_level),
      goal: asGoal(input.goal),
      health_notes: asText(input.health_notes),
      start_date: asDate(input.start_date),
      target_date: asDate(input.target_date),
    })
    .eq("id", input.client_id);
  if (cErr) return { ok: false, error: cErr.message };

  revalidatePath("/admin/clients");
  revalidatePath(`/admin/clients/${input.client_id}`);
  return { ok: true };
}

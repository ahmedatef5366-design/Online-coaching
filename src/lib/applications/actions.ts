"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { assertAdmin } from "@/lib/auth/admin-guard";
import { checkRateLimit, rateLimitMessage } from "@/lib/security/rate-limit";
import { verifyTurnstileToken } from "@/lib/security/turnstile";
import {
  sendApplicationAcceptedEmail,
  sendApplicationReceivedEmail,
} from "@/lib/email";
import {
  APPLICATION_TEXT_LIMITS,
  capApplicationText,
} from "./validators";
import type {
  ActivityLevel,
  ApplicationStatus,
  ContactMethod,
  ExperienceLevel,
  Gender,
  TrainingGoal,
  TrainingLocation,
} from "@/types/database";

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
const ACTIVITY_LEVELS: ActivityLevel[] = [
  "sedentary",
  "light",
  "moderate",
  "active",
  "very_active",
];
const TRAINING_LOCATIONS: TrainingLocation[] = ["home", "gym", "both"];
const CONTACT_METHODS: ContactMethod[] = ["whatsapp", "phone", "email"];
const GENDERS: Gender[] = ["male", "female", "other"];
const APPLICATION_STATUSES: ApplicationStatus[] = [
  "new",
  "contacted",
  "in_review",
  "accepted",
  "rejected",
  "archived",
];

const inSet =
  <T extends string>(values: readonly T[]) =>
  (raw: unknown): T | null =>
    typeof raw === "string" && (values as readonly string[]).includes(raw)
      ? (raw as T)
      : null;

const asGoal = inSet(TRAINING_GOALS);
const asExperience = inSet(EXPERIENCE_LEVELS);
const asActivity = inSet(ACTIVITY_LEVELS);
const asLocation = inSet(TRAINING_LOCATIONS);
const asContact = inSet(CONTACT_METHODS);
const asGender = inSet(GENDERS);
const asStatus = inSet(APPLICATION_STATUSES);

function asText(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed === "" ? null : trimmed;
}
function asTextRequired(value: unknown): string {
  if (typeof value !== "string") return "";
  return value.trim();
}
function asNumber(value: unknown): number | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (trimmed === "") return null;
  const n = Number(trimmed);
  return Number.isFinite(n) ? n : null;
}
function asInt(value: unknown): number | null {
  const n = asNumber(value);
  return n === null ? null : Math.trunc(n);
}
function asDate(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (trimmed === "") return null;
  return /^\d{4}-\d{2}-\d{2}$/.test(trimmed) ? trimmed : null;
}
function asBool(value: unknown): boolean {
  if (typeof value === "boolean") return value;
  if (typeof value !== "string") return false;
  const v = value.trim().toLowerCase();
  return v === "on" || v === "true" || v === "1" || v === "yes";
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function readClientIp(): string {
  const h = headers();
  const fwd = h.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return h.get("x-real-ip") ?? "anon";
}

export type CoachingApplicationFormData = Record<
  string,
  string | string[] | undefined
>;

/**
 * Public-facing action — accepts a flat FormData-like payload (already
 * passed through `Object.fromEntries`) from the intake form. Validates
 * required fields and rate-limits by IP to slow down spam.
 */
export async function submitCoachingApplication(
  raw: CoachingApplicationFormData,
): Promise<ActionResult<{ id: string }>> {
  const ip = readClientIp();
  const rl = checkRateLimit({
    key: `application:${ip}`,
    max: 3,
    windowMs: 60 * 60 * 1000,
  });
  if (!rl.ok) {
    const locale = asText(raw.locale) === "ar" ? "ar" : "en";
    return { ok: false, error: rateLimitMessage(rl.retryAt, locale) };
  }

  // Verify Turnstile CAPTCHA if configured. Locale-aware error messages
  // make failures explicable to Arabic speakers.
  const captchaToken = asText(raw.captcha_token);
  const captcha = await verifyTurnstileToken(captchaToken, ip);
  if (!captcha.ok) {
    const locale = asText(raw.locale) === "ar" ? "ar" : "en";
    return {
      ok: false,
      error:
        locale === "ar"
          ? "فشل التحقق من أنك لست روبوت. حاول تاني."
          : "CAPTCHA verification failed. Please try again.",
    };
  }

  const fullName = asTextRequired(raw.full_name).slice(
    0,
    APPLICATION_TEXT_LIMITS.full_name,
  );
  const email = asTextRequired(raw.email)
    .toLowerCase()
    .slice(0, APPLICATION_TEXT_LIMITS.email);
  const phone = asTextRequired(raw.phone).slice(
    0,
    APPLICATION_TEXT_LIMITS.phone,
  );

  if (!fullName) return { ok: false, error: "Full name is required." };
  if (!EMAIL_RE.test(email)) return { ok: false, error: "Invalid email." };
  if (phone.length < 5) return { ok: false, error: "Invalid phone." };

  const payload = {
    full_name: fullName,
    email,
    phone,
    country: capApplicationText(raw.country, "country"),
    city: capApplicationText(raw.city, "city"),
    preferred_contact: asContact(raw.preferred_contact) ?? "whatsapp",
    best_contact_time: capApplicationText(
      raw.best_contact_time,
      "best_contact_time",
    ),

    age: asInt(raw.age),
    gender: asGender(raw.gender),
    height_cm: asNumber(raw.height_cm),
    weight_kg: asNumber(raw.weight_kg),
    body_fat_percent: asNumber(raw.body_fat_percent),

    goal: asGoal(raw.goal),
    target_weight_kg: asNumber(raw.target_weight_kg),
    target_date: asDate(raw.target_date),
    motivation_text: capApplicationText(raw.motivation_text, "motivation_text"),

    experience_level: asExperience(raw.experience_level),
    previous_coaching: asBool(raw.previous_coaching),
    previous_results_text: capApplicationText(
      raw.previous_results_text,
      "previous_results_text",
    ),

    training_days_per_week: asInt(raw.training_days_per_week),
    training_location: asLocation(raw.training_location),
    available_equipment_text: capApplicationText(
      raw.available_equipment_text,
      "available_equipment_text",
    ),
    preferred_training_time: capApplicationText(
      raw.preferred_training_time,
      "preferred_training_time",
    ),

    injuries_or_conditions: capApplicationText(
      raw.injuries_or_conditions,
      "injuries_or_conditions",
    ),
    medications: capApplicationText(raw.medications, "medications"),
    allergies: capApplicationText(raw.allergies, "allergies"),
    surgeries_text: capApplicationText(raw.surgeries_text, "surgeries_text"),

    dietary_restrictions: capApplicationText(
      raw.dietary_restrictions,
      "dietary_restrictions",
    ),
    foods_disliked: capApplicationText(raw.foods_disliked, "foods_disliked"),
    current_diet_summary: capApplicationText(
      raw.current_diet_summary,
      "current_diet_summary",
    ),
    water_intake_liters: asNumber(raw.water_intake_liters),

    occupation: capApplicationText(raw.occupation, "occupation"),
    daily_activity_level: asActivity(raw.daily_activity_level),
    sleep_hours_avg: asNumber(raw.sleep_hours_avg),
    stress_level: asInt(raw.stress_level),
    smokes: asBool(raw.smokes),

    package_id: asText(raw.package_id),
    notes: capApplicationText(raw.notes, "notes"),
    locale: asText(raw.locale) === "ar" ? "ar" : "en",
    status: "new" as ApplicationStatus,
  };

  const supabase = createClient();
  const { data, error } = await supabase
    .from("coaching_applications")
    .insert(payload)
    .select("id")
    .maybeSingle();

  if (error) {
    console.error("submitCoachingApplication failed", error);
    return { ok: false, error: "Could not submit your application." };
  }

  revalidatePath("/admin/applications");

  // Best-effort confirmation email. Failure here must not block the
  // submission — the row is already saved and the admin will follow up.
  void sendApplicationReceivedEmail({
    to: payload.email,
    fullName: payload.full_name,
    locale: payload.locale === "ar" ? "ar" : "en",
  }).catch((err) => {
    console.error("sendApplicationReceivedEmail failed", err);
  });

  return { ok: true, data: { id: (data as { id: string }).id } };
}

export async function updateApplicationStatus(
  id: string,
  status: ApplicationStatus,
): Promise<ActionResult> {
  const guard = await assertAdmin();
  if (!guard.ok) return { ok: false, error: guard.error };
  if (!asStatus(status)) return { ok: false, error: "Invalid status." };

  const supabase = createClient();
  const update: Record<string, unknown> = { status };
  if (status === "contacted") {
    update.contacted_at = new Date().toISOString();
  }

  const { error } = await supabase
    .from("coaching_applications")
    .update(update)
    .eq("id", id);
  if (error) return { ok: false, error: error.message };

  // When an admin moves an application to "accepted", trigger the welcome
  // email. Read back the row first to get the applicant's name + locale.
  if (status === "accepted") {
    const { data: row } = await supabase
      .from("coaching_applications")
      .select("full_name, email, locale")
      .eq("id", id)
      .maybeSingle();
    if (row?.email) {
      void sendApplicationAcceptedEmail({
        to: row.email,
        fullName: row.full_name ?? "",
        locale: row.locale === "ar" ? "ar" : "en",
      }).catch((err) => {
        console.error("sendApplicationAcceptedEmail failed", err);
      });
    }
  }

  revalidatePath("/admin/applications");
  revalidatePath(`/admin/applications/${id}`);
  return { ok: true };
}

export async function updateApplicationNotes(
  id: string,
  adminNotes: string,
): Promise<ActionResult> {
  const guard = await assertAdmin();
  if (!guard.ok) return { ok: false, error: guard.error };

  const supabase = createClient();
  const { error } = await supabase
    .from("coaching_applications")
    .update({ admin_notes: adminNotes.trim() || null })
    .eq("id", id);
  if (error) return { ok: false, error: error.message };

  revalidatePath(`/admin/applications/${id}`);
  return { ok: true };
}

export async function deleteApplication(id: string): Promise<ActionResult> {
  const guard = await assertAdmin();
  if (!guard.ok) return { ok: false, error: guard.error };

  const supabase = createClient();
  const { error } = await supabase
    .from("coaching_applications")
    .delete()
    .eq("id", id);
  if (error) return { ok: false, error: error.message };

  revalidatePath("/admin/applications");
  return { ok: true };
}

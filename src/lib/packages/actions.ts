"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { assertAdmin } from "@/lib/auth/admin-guard";
import type { BillingPeriod } from "@/types/database";

export interface ActionResult<T = void> {
  ok: boolean;
  error?: string;
  data?: T;
}

const BILLING_PERIODS: BillingPeriod[] = [
  "monthly",
  "quarterly",
  "biannual",
  "yearly",
  "one_time",
];

function asBillingPeriod(value: unknown): BillingPeriod {
  return typeof value === "string" &&
    (BILLING_PERIODS as string[]).includes(value)
    ? (value as BillingPeriod)
    : "monthly";
}

function asString(value: unknown, fallback = ""): string {
  if (typeof value !== "string") return fallback;
  return value.trim();
}

function asLines(value: unknown): string[] {
  if (typeof value !== "string") return [];
  return value
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);
}

function asNumber(value: unknown, fallback = 0): number {
  if (typeof value !== "string") return fallback;
  const n = Number(value.trim());
  return Number.isFinite(n) ? n : fallback;
}

function asInt(value: unknown, fallback = 0): number {
  return Math.trunc(asNumber(value, fallback));
}

function slugify(input: string): string {
  return (
    input
      .toLowerCase()
      .normalize("NFKD")
      // strip combining marks
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")
      .slice(0, 64) || `package-${Date.now()}`
  );
}

export interface PackageInput {
  id?: string;
  slug?: string;
  name_en: string;
  name_ar: string;
  description_en?: string;
  description_ar?: string;
  price?: string;
  currency?: string;
  billing_period?: string;
  features_en?: string;
  features_ar?: string;
  cta_label_en?: string;
  cta_label_ar?: string;
  is_featured?: string | boolean;
  is_active?: string | boolean;
  display_order?: string;
}

function asBool(value: unknown): boolean {
  if (typeof value === "boolean") return value;
  if (typeof value !== "string") return false;
  const v = value.trim().toLowerCase();
  return v === "on" || v === "true" || v === "1" || v === "yes";
}

export async function savePackage(
  input: PackageInput,
): Promise<ActionResult<{ id: string }>> {
  const guard = await assertAdmin();
  if (!guard.ok) return { ok: false, error: guard.error };

  const name_en = asString(input.name_en);
  const name_ar = asString(input.name_ar);
  if (!name_en || !name_ar) {
    return { ok: false, error: "Both English and Arabic names are required." };
  }

  const slug = asString(input.slug) || slugify(name_en);

  const payload = {
    slug,
    name_en,
    name_ar,
    description_en: asString(input.description_en),
    description_ar: asString(input.description_ar),
    price: asNumber(input.price),
    currency: asString(input.currency, "USD") || "USD",
    billing_period: asBillingPeriod(input.billing_period),
    features_en: asLines(input.features_en),
    features_ar: asLines(input.features_ar),
    cta_label_en: asString(input.cta_label_en) || null,
    cta_label_ar: asString(input.cta_label_ar) || null,
    is_featured: asBool(input.is_featured),
    is_active: asBool(input.is_active),
    display_order: asInt(input.display_order),
  };

  const supabase = createClient();

  if (input.id) {
    const { data, error } = await supabase
      .from("packages")
      .update(payload)
      .eq("id", input.id)
      .select("id")
      .maybeSingle();
    if (error) return { ok: false, error: error.message };
    revalidatePath("/");
    revalidatePath("/packages");
    revalidatePath("/admin/packages");
    return {
      ok: true,
      data: { id: (data as { id: string } | null)?.id ?? input.id },
    };
  }

  const { data, error } = await supabase
    .from("packages")
    .insert(payload)
    .select("id")
    .maybeSingle();
  if (error) {
    if (error.code === "23505") {
      return {
        ok: false,
        error: `A package with slug "${slug}" already exists.`,
      };
    }
    return { ok: false, error: error.message };
  }

  revalidatePath("/");
  revalidatePath("/packages");
  revalidatePath("/admin/packages");
  return { ok: true, data: { id: (data as { id: string }).id } };
}

export async function deletePackage(id: string): Promise<ActionResult> {
  const guard = await assertAdmin();
  if (!guard.ok) return { ok: false, error: guard.error };

  const supabase = createClient();
  const { error } = await supabase.from("packages").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };

  revalidatePath("/");
  revalidatePath("/packages");
  revalidatePath("/admin/packages");
  return { ok: true };
}

export async function setPackageActive(
  id: string,
  isActive: boolean,
): Promise<ActionResult> {
  const guard = await assertAdmin();
  if (!guard.ok) return { ok: false, error: guard.error };

  const supabase = createClient();
  const { error } = await supabase
    .from("packages")
    .update({ is_active: isActive })
    .eq("id", id);
  if (error) return { ok: false, error: error.message };

  revalidatePath("/");
  revalidatePath("/packages");
  revalidatePath("/admin/packages");
  return { ok: true };
}

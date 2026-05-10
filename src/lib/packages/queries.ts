import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { Package } from "@/types/database";

/** Public list of active packages, ordered for landing page display. */
export async function listActivePackages(): Promise<Package[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("packages")
    .select("*")
    .eq("is_active", true)
    .order("display_order", { ascending: true })
    .order("created_at", { ascending: true });
  if (error) {
    console.error("listActivePackages failed", error);
    return [];
  }
  return (data ?? []) as Package[];
}

/** Admin-only listing — includes inactive packages. */
export async function listAllPackages(): Promise<Package[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("packages")
    .select("*")
    .order("display_order", { ascending: true })
    .order("created_at", { ascending: true });
  if (error) {
    console.error("listAllPackages failed", error);
    return [];
  }
  return (data ?? []) as Package[];
}

export async function getPackage(id: string): Promise<Package | null> {
  const supabase = createClient();
  const { data } = (await supabase
    .from("packages")
    .select("*")
    .eq("id", id)
    .maybeSingle()) as { data: Package | null };
  return data;
}

export async function getPackageBySlug(slug: string): Promise<Package | null> {
  const supabase = createClient();
  const { data } = (await supabase
    .from("packages")
    .select("*")
    .eq("slug", slug)
    .maybeSingle()) as { data: Package | null };
  return data;
}

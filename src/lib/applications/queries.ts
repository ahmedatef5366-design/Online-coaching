import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { ApplicationStatus, CoachingApplication } from "@/types/database";

export interface ApplicationListFilters {
  status?: ApplicationStatus | "all";
  packageId?: string | null;
}

export async function listApplications(
  filters: ApplicationListFilters = {},
): Promise<CoachingApplication[]> {
  const supabase = createClient();
  let query = supabase
    .from("coaching_applications")
    .select("*")
    .order("created_at", { ascending: false });

  if (filters.status && filters.status !== "all") {
    query = query.eq("status", filters.status);
  }
  if (filters.packageId) {
    query = query.eq("package_id", filters.packageId);
  }

  const { data, error } = await query;
  if (error) {
    console.error("listApplications failed", error);
    return [];
  }
  return (data ?? []) as CoachingApplication[];
}

export async function getApplication(
  id: string,
): Promise<CoachingApplication | null> {
  const supabase = createClient();
  const { data } = (await supabase
    .from("coaching_applications")
    .select("*")
    .eq("id", id)
    .maybeSingle()) as { data: CoachingApplication | null };
  return data;
}

export async function countApplicationsByStatus(): Promise<
  Record<ApplicationStatus, number>
> {
  const supabase = createClient();
  const { data } = (await supabase
    .from("coaching_applications")
    .select("status")) as { data: { status: ApplicationStatus }[] | null };

  const out: Record<ApplicationStatus, number> = {
    new: 0,
    contacted: 0,
    in_review: 0,
    accepted: 0,
    rejected: 0,
    archived: 0,
  };
  (data ?? []).forEach((row) => {
    out[row.status] = (out[row.status] ?? 0) + 1;
  });
  return out;
}

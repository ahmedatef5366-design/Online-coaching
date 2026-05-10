import "server-only";
import { createClient } from "@/lib/supabase/server";

/** Returns ok=true when the current user is an authenticated admin. */
export async function assertAdmin(): Promise<
  { ok: true } | { ok: false; error: string }
> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Not authenticated." };

  const { data } = (await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle()) as { data: { role: "admin" | "client" } | null };

  if (data?.role !== "admin") {
    return { ok: false, error: "Forbidden — admin access required." };
  }
  return { ok: true };
}

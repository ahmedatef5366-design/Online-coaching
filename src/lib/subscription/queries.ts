import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { Client, SubscriptionStatus } from "@/types/database";
import { computeSubscriptionSnapshot } from "./status";

type SubscriptionRow = Pick<
  Client,
  "id" | "subscription_status" | "subscription_ends_at"
>;

/** Snapshot keyed by client_id for the rows you need. */
export async function getSubscriptionSnapshots(
  clientIds: string[],
): Promise<Record<string, ReturnType<typeof computeSubscriptionSnapshot>>> {
  if (clientIds.length === 0) return {};
  const supabase = createClient();
  const { data } = (await supabase
    .from("clients")
    .select("id, subscription_status, subscription_ends_at")
    .in("id", clientIds)) as { data: SubscriptionRow[] | null };

  const out: Record<
    string,
    ReturnType<typeof computeSubscriptionSnapshot>
  > = {};
  (data ?? []).forEach((row) => {
    out[row.id] = computeSubscriptionSnapshot({
      status: row.subscription_status as SubscriptionStatus,
      subscription_ends_at: row.subscription_ends_at,
    });
  });
  return out;
}

/** Snapshot for the currently-authed client (if any). */
export async function getCurrentClientSubscription(): Promise<{
  clientId: string;
  snapshot: ReturnType<typeof computeSubscriptionSnapshot>;
} | null> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = (await supabase
    .from("clients")
    .select("id, subscription_status, subscription_ends_at")
    .eq("user_id", user.id)
    .maybeSingle()) as { data: SubscriptionRow | null };
  if (!data) return null;
  return {
    clientId: data.id,
    snapshot: computeSubscriptionSnapshot({
      status: data.subscription_status as SubscriptionStatus,
      subscription_ends_at: data.subscription_ends_at,
    }),
  };
}

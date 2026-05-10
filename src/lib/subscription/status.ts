import type { SubscriptionStatus } from "@/types/database";

/**
 * Pure helpers for reading subscription state.
 *
 * The database's `recompute_client_subscription()` is the source of truth
 * for `clients.subscription_status`, but we still need client-side maths
 * for UI: "5 days left", "expired 3 days ago", etc. We recompute from
 * `subscription_ends_at` to stay correct even if the row hasn't been
 * rolled over to `expired` by the nightly cron yet.
 */

export interface SubscriptionSnapshot {
  status: SubscriptionStatus;
  endsAt: string | null; // ISO date (yyyy-mm-dd)
  daysRemaining: number | null; // negative = expired; null if no end date
  isActive: boolean; // can use the app
  isExpiringSoon: boolean; // within the warning window
}

const MS_PER_DAY = 24 * 60 * 60 * 1000;
const EXPIRING_SOON_WINDOW_DAYS = 7;

function toUtcMidnight(date: Date): number {
  return Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());
}

/**
 * Given the raw fields from `clients`, derive the up-to-date snapshot.
 *
 * We accept the DB's stored `status` but override it with what the end
 * date actually says, because the DB column only changes when either
 * the admin confirms a payment or the nightly cron runs. A freshly
 * loaded page shouldn't show "active" for a client whose subscription
 * ended at midnight.
 */
export function computeSubscriptionSnapshot(input: {
  status: SubscriptionStatus;
  subscription_ends_at: string | null;
  now?: Date;
}): SubscriptionSnapshot {
  const now = input.now ?? new Date();
  const todayUtc = toUtcMidnight(now);

  if (input.status === "suspended") {
    return {
      status: "suspended",
      endsAt: input.subscription_ends_at,
      daysRemaining: null,
      isActive: false,
      isExpiringSoon: false,
    };
  }

  if (!input.subscription_ends_at) {
    // Status is "none" / "trialing" with no end date — trust the DB value.
    return {
      status: input.status,
      endsAt: null,
      daysRemaining: null,
      isActive: input.status === "trialing",
      isExpiringSoon: false,
    };
  }

  const endsAt = new Date(input.subscription_ends_at + "T00:00:00Z");
  const endsAtUtc = toUtcMidnight(endsAt);
  const daysRemaining = Math.floor((endsAtUtc - todayUtc) / MS_PER_DAY);

  let status: SubscriptionStatus;
  if (daysRemaining < 0) status = "expired";
  else if (daysRemaining <= EXPIRING_SOON_WINDOW_DAYS) status = "expiring_soon";
  else status = "active";

  return {
    status,
    endsAt: input.subscription_ends_at,
    daysRemaining,
    isActive: status === "active" || status === "expiring_soon",
    isExpiringSoon: status === "expiring_soon",
  };
}

export function subscriptionStatusLabel(
  status: SubscriptionStatus,
  locale: "en" | "ar",
): string {
  const map: Record<SubscriptionStatus, { en: string; ar: string }> = {
    none: { en: "No subscription", ar: "لا يوجد اشتراك" },
    trialing: { en: "Trial", ar: "تجربة" },
    active: { en: "Active", ar: "فعّال" },
    expiring_soon: { en: "Expiring soon", ar: "قرب ينتهي" },
    expired: { en: "Expired", ar: "منتهي" },
    suspended: { en: "Suspended", ar: "موقوف" },
  };
  return map[status][locale];
}

export function subscriptionStatusColor(status: SubscriptionStatus): string {
  switch (status) {
    case "active":
      return "bg-green-500/15 text-green-500";
    case "expiring_soon":
      return "bg-yellow-500/15 text-yellow-500";
    case "expired":
    case "suspended":
      return "bg-destructive/15 text-destructive";
    case "trialing":
      return "bg-blue-500/15 text-blue-500";
    case "none":
    default:
      return "bg-muted text-muted-foreground";
  }
}

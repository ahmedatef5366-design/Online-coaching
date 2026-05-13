import { AlertTriangle, Clock, CheckCircle2, Ban } from "lucide-react";
import type { Locale } from "@/lib/i18n/config";
import { getT } from "@/lib/i18n/t";
import type { SubscriptionSnapshot } from "@/lib/subscription/status";

/**
 * Small status strip shown on the client dashboard. Silent when the
 * subscription is fine and far from expiry — only warns or blocks when
 * there's something the client needs to act on.
 */
export function SubscriptionBanner({
  snapshot,
  locale,
}: {
  snapshot: SubscriptionSnapshot;
  locale: Locale;
}) {
  const t = getT(locale);

  if (snapshot.status === "active") return null; // silent when healthy

  if (snapshot.status === "expiring_soon") {
    return (
      <div className="flex items-start gap-3 rounded-lg border border-yellow-500/30 bg-yellow-500/10 p-3 text-sm">
        <Clock className="mt-0.5 h-4 w-4 shrink-0 text-yellow-500" />
        <div className="flex-1">
          <p className="font-medium">
            {snapshot.daysRemaining === 1
              ? t("client.subscription.banner.ends_in_one_day")
              : t("client.subscription.banner.ends_in_days", {
                  days: snapshot.daysRemaining ?? 0,
                })}
          </p>
          <p className="text-xs text-muted-foreground">
            {t("client.subscription.banner.expiring_action")}
          </p>
        </div>
      </div>
    );
  }

  if (snapshot.status === "expired") {
    return (
      <div className="flex items-start gap-3 rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-sm">
        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
        <div className="flex-1">
          <p className="font-medium">
            {t("client.subscription.banner.expired_title")}
          </p>
          <p className="text-xs text-muted-foreground">
            {t("client.subscription.banner.expired_action")}
          </p>
        </div>
      </div>
    );
  }

  if (snapshot.status === "suspended") {
    return (
      <div className="flex items-start gap-3 rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-sm">
        <Ban className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
        <div className="flex-1">
          <p className="font-medium">
            {t("client.subscription.banner.suspended_title")}
          </p>
          <p className="text-xs text-muted-foreground">
            {t("client.subscription.banner.suspended_action")}
          </p>
        </div>
      </div>
    );
  }

  // status === "none" or "trialing"
  return (
    <div className="flex items-start gap-3 rounded-lg border border-primary/30 bg-primary/5 p-3 text-sm">
      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
      <div className="flex-1">
        <p className="font-medium">
          {t("client.subscription.banner.none_title")}
        </p>
        <p className="text-xs text-muted-foreground">
          {t("client.subscription.banner.none_action")}
        </p>
      </div>
    </div>
  );
}

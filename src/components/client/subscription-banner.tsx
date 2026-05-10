import { AlertTriangle, Clock, CheckCircle2, Ban } from "lucide-react";
import type { Locale } from "@/lib/i18n/config";
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
  const t = (en: string, ar: string) => (locale === "ar" ? ar : en);

  if (snapshot.status === "active") return null; // silent when healthy

  if (snapshot.status === "expiring_soon") {
    return (
      <div className="flex items-start gap-3 rounded-lg border border-yellow-500/30 bg-yellow-500/10 p-3 text-sm">
        <Clock className="mt-0.5 h-4 w-4 shrink-0 text-yellow-500" />
        <div className="flex-1">
          <p className="font-medium">
            {t(
              `Your subscription ends in ${snapshot.daysRemaining} day${snapshot.daysRemaining === 1 ? "" : "s"}.`,
              `اشتراكك بيخلص بعد ${snapshot.daysRemaining} يوم.`,
            )}
          </p>
          <p className="text-xs text-muted-foreground">
            {t(
              "Reach out to your coach to renew.",
              "كلّم الكوتش عشان تجدد.",
            )}
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
            {t("Your subscription has expired.", "اشتراكك انتهى.")}
          </p>
          <p className="text-xs text-muted-foreground">
            {t(
              "Contact your coach to renew and unlock your plan again.",
              "كلّم الكوتش عشان تجدد وتفتح خطتك تاني.",
            )}
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
            {t("Account suspended.", "الحساب موقوف.")}
          </p>
          <p className="text-xs text-muted-foreground">
            {t("Contact your coach.", "كلّم الكوتش.")}
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
          {t(
            "No active subscription yet.",
            "لسه مفيش اشتراك مفعّل.",
          )}
        </p>
        <p className="text-xs text-muted-foreground">
          {t(
            "Once your coach confirms your payment, you'll see the end date here.",
            "أول ما الكوتش يأكد الدفعة هيظهر هنا تاريخ الانتهاء.",
          )}
        </p>
      </div>
    </div>
  );
}

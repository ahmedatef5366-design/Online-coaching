import type { BillingPeriod } from "@/types/database";
import type { Locale } from "@/lib/i18n/config";

const LABELS: Record<BillingPeriod, { en: string; ar: string }> = {
  monthly: { en: "/ month", ar: "/ شهر" },
  quarterly: { en: "/ 3 months", ar: "/ ٣ شهور" },
  biannual: { en: "/ 6 months", ar: "/ ٦ شهور" },
  yearly: { en: "/ year", ar: "/ سنة" },
  one_time: { en: "one-time", ar: "دفعة واحدة" },
};

export function formatBillingPeriod(
  period: BillingPeriod,
  locale: Locale,
): string {
  return LABELS[period]?.[locale] ?? "";
}

export function billingPeriodOptions(
  locale: Locale,
): { value: BillingPeriod; label: string }[] {
  const out: { value: BillingPeriod; label: string }[] = [];
  (Object.keys(LABELS) as BillingPeriod[]).forEach((k) => {
    out.push({ value: k, label: LABELS[k][locale] });
  });
  return out;
}

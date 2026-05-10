import type { PaymentMethod, PaymentStatus } from "@/types/database";

export const PAYMENT_STATUS_LABEL: Record<
  PaymentStatus,
  { en: string; ar: string }
> = {
  pending: { en: "Pending", ar: "في الانتظار" },
  confirmed: { en: "Confirmed", ar: "مؤكدة" },
  rejected: { en: "Rejected", ar: "مرفوضة" },
  refunded: { en: "Refunded", ar: "مسترجعة" },
};

export const PAYMENT_STATUS_COLOR: Record<PaymentStatus, string> = {
  pending: "bg-yellow-500/15 text-yellow-500",
  confirmed: "bg-green-500/15 text-green-500",
  rejected: "bg-destructive/15 text-destructive",
  refunded: "bg-muted text-muted-foreground",
};

export const PAYMENT_METHOD_LABEL: Record<
  PaymentMethod,
  { en: string; ar: string }
> = {
  vodafone_cash: { en: "Vodafone Cash", ar: "فودافون كاش" },
  instapay: { en: "InstaPay", ar: "إنستا باي" },
  bank_transfer: { en: "Bank transfer", ar: "تحويل بنكي" },
  cash: { en: "Cash", ar: "كاش" },
  other: { en: "Other", ar: "آخر" },
};

export function formatMoney(amount: number, currency: string): string {
  if (!Number.isFinite(amount)) return "—";
  return `${amount.toLocaleString()} ${currency}`;
}

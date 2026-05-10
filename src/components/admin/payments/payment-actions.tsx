"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { CheckCircle2, Loader2, Trash2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  confirmPayment,
  deletePayment,
  rejectPayment,
} from "@/lib/payments/actions";
import type { Locale } from "@/lib/i18n/config";
import type { PaymentStatus } from "@/types/database";

interface Props {
  paymentId: string;
  currentStatus: PaymentStatus;
  locale: Locale;
}

export function PaymentActions({ paymentId, currentStatus, locale }: Props) {
  const router = useRouter();
  const t = (en: string, ar: string) => (locale === "ar" ? ar : en);
  const [isPending, startTransition] = useTransition();

  function onConfirm() {
    startTransition(async () => {
      const res = await confirmPayment(paymentId);
      if (res.ok) {
        toast.success(
          t(
            "Payment confirmed. Subscription activated.",
            "تم تأكيد الدفعة وتفعيل الاشتراك.",
          ),
        );
      } else {
        toast.error(res.error ?? t("Failed.", "فشل."));
      }
    });
  }

  function onReject() {
    const reason =
      typeof window !== "undefined"
        ? window.prompt(t("Reject reason (optional):", "سبب الرفض (اختياري):"))
        : "";
    startTransition(async () => {
      const res = await rejectPayment(paymentId, reason ?? undefined);
      if (res.ok) toast.success(t("Payment rejected.", "تم رفض الدفعة."));
      else toast.error(res.error ?? t("Failed.", "فشل."));
    });
  }

  function onDelete() {
    if (
      typeof window !== "undefined" &&
      !window.confirm(
        t(
          "Delete this payment permanently?",
          "تحذف الدفعة دي نهائياً؟",
        ),
      )
    ) {
      return;
    }
    startTransition(async () => {
      const res = await deletePayment(paymentId);
      if (res.ok) {
        toast.success(t("Deleted.", "تم الحذف."));
        router.push("/admin/payments");
      } else {
        toast.error(res.error ?? t("Failed.", "فشل."));
      }
    });
  }

  return (
    <div className="flex flex-wrap gap-2">
      {currentStatus !== "confirmed" && (
        <Button size="sm" onClick={onConfirm} disabled={isPending}>
          {isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <CheckCircle2 className="h-4 w-4" />
          )}
          {t("Confirm & activate", "تأكيد وتفعيل")}
        </Button>
      )}
      {currentStatus !== "rejected" && (
        <Button
          size="sm"
          variant="outline"
          onClick={onReject}
          disabled={isPending}
        >
          <XCircle className="h-4 w-4" />
          {t("Reject", "رفض")}
        </Button>
      )}
      <Button
        size="sm"
        variant="destructive"
        onClick={onDelete}
        disabled={isPending}
      >
        <Trash2 className="h-4 w-4" />
        {t("Delete", "حذف")}
      </Button>
    </div>
  );
}

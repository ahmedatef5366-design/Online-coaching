"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { updateApplicationStatus } from "@/lib/applications/actions";
import type { ApplicationStatus } from "@/types/database";
import type { Locale } from "@/lib/i18n/config";

const STATUS_OPTIONS: {
  value: ApplicationStatus;
  en: string;
  ar: string;
}[] = [
  { value: "new", en: "Mark as new", ar: "جديدة" },
  { value: "contacted", en: "Mark as contacted", ar: "تم التواصل" },
  { value: "in_review", en: "Move to review", ar: "تحت المراجعة" },
  { value: "accepted", en: "Accept", ar: "قبول" },
  { value: "rejected", en: "Reject", ar: "رفض" },
  { value: "archived", en: "Archive", ar: "أرشفة" },
];

interface Props {
  applicationId: string;
  currentStatus: ApplicationStatus;
  locale: Locale;
}

export function ApplicationStatusControl({
  applicationId,
  currentStatus,
  locale,
}: Props) {
  const [isPending, startTransition] = useTransition();

  function changeStatus(next: ApplicationStatus) {
    if (next === currentStatus) return;
    startTransition(async () => {
      const res = await updateApplicationStatus(applicationId, next);
      if (res.ok) {
        toast.success(locale === "ar" ? "تم التحديث" : "Status updated");
      } else {
        toast.error(res.error ?? (locale === "ar" ? "فشل" : "Failed"));
      }
    });
  }

  return (
    <div className="grid grid-cols-2 gap-2">
      {STATUS_OPTIONS.map((opt) => {
        const isCurrent = opt.value === currentStatus;
        return (
          <button
            key={opt.value}
            type="button"
            disabled={isPending || isCurrent}
            onClick={() => changeStatus(opt.value)}
            className={
              "rounded-md border px-2.5 py-1.5 text-xs transition-colors " +
              (isCurrent
                ? "border-primary bg-primary/15 text-primary"
                : "border-border bg-card hover:bg-card/70 disabled:opacity-60")
            }
          >
            {isPending ? (
              <Loader2 className="inline h-3 w-3 animate-spin" />
            ) : null}{" "}
            {locale === "ar" ? opt.ar : opt.en}
          </button>
        );
      })}
    </div>
  );
}

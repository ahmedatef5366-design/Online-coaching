"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { setPackageActive } from "@/lib/packages/actions";
import type { Locale } from "@/lib/i18n/config";

interface Props {
  packageId: string;
  isActive: boolean;
  locale: Locale;
}

export function PackageActiveToggle({ packageId, isActive, locale }: Props) {
  const [isPending, startTransition] = useTransition();
  const t = (en: string, ar: string) => (locale === "ar" ? ar : en);

  function toggle() {
    startTransition(async () => {
      const res = await setPackageActive(packageId, !isActive);
      if (res.ok) {
        toast.success(
          !isActive
            ? t("Package activated", "تم تفعيل الباقة")
            : t("Package hidden", "تم إخفاء الباقة"),
        );
      } else {
        toast.error(res.error ?? t("Failed", "فشل"));
      }
    });
  }

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={isPending}
      className="inline-flex items-center gap-1 rounded-md border border-border px-2.5 py-1 text-xs hover:bg-card/70 disabled:opacity-60"
      aria-label={isActive ? t("Hide", "إخفاء") : t("Activate", "تفعيل")}
    >
      {isPending ? (
        <Loader2 className="h-3 w-3 animate-spin" />
      ) : isActive ? (
        <EyeOff className="h-3 w-3" />
      ) : (
        <Eye className="h-3 w-3" />
      )}
      {isActive ? t("Hide", "إخفاء") : t("Show", "إظهار")}
    </button>
  );
}

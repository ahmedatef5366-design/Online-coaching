"use client";

import { Button } from "@/components/ui/button";
import type { Locale } from "@/lib/i18n/config";
import { CheckCircle2, AlertCircle, Loader2 } from "lucide-react";

export type SaveStatus = "idle" | "saving" | "saved" | "error";

interface Props {
  status: SaveStatus;
  error?: string | null;
  locale: Locale;
  disabled?: boolean;
  onReset?: () => void;
}

export function SaveBar({ status, error, locale, disabled, onReset }: Props) {
  return (
    <div className="sticky bottom-0 -mx-6 -mb-6 mt-6 flex items-center justify-between gap-3 border-t border-border/60 bg-card/80 px-6 py-3 backdrop-blur">
      <div className="text-xs text-muted-foreground">
        {status === "saving" && (
          <span className="inline-flex items-center gap-1">
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            {locale === "ar" ? "جاري الحفظ…" : "Saving…"}
          </span>
        )}
        {status === "saved" && (
          <span className="inline-flex items-center gap-1 text-primary">
            <CheckCircle2 className="h-3.5 w-3.5" />
            {locale === "ar" ? "تم الحفظ" : "Saved"}
          </span>
        )}
        {status === "error" && (
          <span className="inline-flex items-center gap-1 text-destructive">
            <AlertCircle className="h-3.5 w-3.5" />
            {error ?? (locale === "ar" ? "فشل الحفظ" : "Failed to save")}
          </span>
        )}
        {status === "idle" && (
          <span>
            {locale === "ar"
              ? "التغييرات تطبق على الموقع المباشر فور الحفظ."
              : "Changes go live the moment you save."}
          </span>
        )}
      </div>
      <div className="flex items-center gap-2">
        {onReset && (
          <Button type="button" variant="ghost" size="sm" onClick={onReset}>
            {locale === "ar" ? "إعادة تعيين" : "Reset"}
          </Button>
        )}
        <Button
          type="submit"
          size="sm"
          disabled={disabled || status === "saving"}
        >
          {locale === "ar" ? "حفظ ونشر" : "Save & publish"}
        </Button>
      </div>
    </div>
  );
}

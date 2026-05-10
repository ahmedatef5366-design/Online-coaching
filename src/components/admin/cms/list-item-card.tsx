"use client";

import { Trash2, ChevronUp, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Locale } from "@/lib/i18n/config";

interface Props {
  index: number;
  total: number;
  title: string;
  locale: Locale;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onRemove: () => void;
  children: React.ReactNode;
  className?: string;
}

export function ListItemCard({
  index,
  total,
  title,
  locale,
  onMoveUp,
  onMoveDown,
  onRemove,
  children,
  className,
}: Props) {
  const t = (en: string, ar: string) => (locale === "ar" ? ar : en);
  return (
    <div
      className={cn(
        "rounded-lg border border-border bg-background/40 p-4",
        className,
      )}
    >
      <div className="mb-3 flex items-center justify-between gap-2">
        <h3 className="text-sm font-semibold">{title}</h3>
        <div className="flex items-center gap-1">
          <Button
            type="button"
            size="icon"
            variant="ghost"
            disabled={index === 0}
            onClick={onMoveUp}
            aria-label={t("Move up", "تحريك لأعلى")}
          >
            <ChevronUp className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            size="icon"
            variant="ghost"
            disabled={index === total - 1}
            onClick={onMoveDown}
            aria-label={t("Move down", "تحريك لأسفل")}
          >
            <ChevronDown className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            size="icon"
            variant="ghost"
            onClick={onRemove}
            aria-label={t("Remove", "حذف")}
            className="text-destructive hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <div className="grid gap-3 md:grid-cols-2">{children}</div>
    </div>
  );
}

export function arrayMove<T>(arr: T[], from: number, to: number): T[] {
  if (to < 0 || to >= arr.length || from === to) return arr;
  const next = [...arr];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
}

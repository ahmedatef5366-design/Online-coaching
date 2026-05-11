import * as React from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Optional Lucide icon shown above the title. */
  icon?: LucideIcon;
  /** Required heading text. */
  title: string;
  /** Optional supporting copy below the title. */
  description?: string;
  /** Optional action node (button/link) rendered below the description. */
  action?: React.ReactNode;
  /** Compact variant for inline placement inside cards. */
  compact?: boolean;
}

/**
 * Consistent "nothing here yet" placeholder. Always pairs a clear title
 * with an optional next-step action so the user is never stuck.
 */
export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  compact = false,
  className,
  ...props
}: EmptyStateProps) {
  return (
    <div
      role="status"
      className={cn(
        "flex flex-col items-center justify-center rounded-xl border border-dashed border-border/60 bg-card/40 text-center",
        compact ? "gap-2 px-4 py-6" : "gap-3 px-6 py-10",
        className,
      )}
      {...props}
    >
      {Icon ? (
        <div
          className={cn(
            "inline-flex items-center justify-center rounded-full bg-muted text-muted-foreground",
            compact ? "h-8 w-8" : "h-12 w-12",
          )}
        >
          <Icon className={compact ? "h-4 w-4" : "h-5 w-5"} />
        </div>
      ) : null}
      <div className="space-y-1">
        <p
          className={cn(
            "font-semibold leading-tight",
            compact ? "text-sm" : "text-base",
          )}
        >
          {title}
        </p>
        {description ? (
          <p className="text-sm text-muted-foreground">{description}</p>
        ) : null}
      </div>
      {action ? <div className="pt-1">{action}</div> : null}
    </div>
  );
}

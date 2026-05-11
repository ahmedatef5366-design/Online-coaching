import * as React from "react";
import { cn } from "@/lib/utils";

interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Current value in 0–100. Clamped automatically. */
  value: number;
  /** Optional max — defaults to 100. */
  max?: number;
  /** Visual intent — defaults to primary. */
  intent?: "primary" | "success" | "warning" | "destructive" | "info";
  /** Bar thickness in tailwind classes (defaults to h-2). */
  size?: "sm" | "md" | "lg";
  /** Optional aria-label for screen readers. */
  label?: string;
}

const INTENT: Record<NonNullable<ProgressProps["intent"]>, string> = {
  primary: "bg-primary",
  success: "bg-success",
  warning: "bg-warning",
  destructive: "bg-destructive",
  info: "bg-info",
};

const SIZE: Record<NonNullable<ProgressProps["size"]>, string> = {
  sm: "h-1.5",
  md: "h-2",
  lg: "h-3",
};

/**
 * A linear progress bar. Pass `value` 0–100 and an optional `intent`.
 * For circular variants, prefer a Recharts radial chart in the calling
 * component instead of forking this primitive.
 */
export const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  (
    {
      value,
      max = 100,
      intent = "primary",
      size = "md",
      label,
      className,
      ...props
    },
    ref,
  ) => {
    const clamped = Math.max(0, Math.min(max, value));
    const pct = (clamped / max) * 100;
    return (
      <div
        ref={ref}
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={max}
        aria-valuenow={clamped}
        aria-label={label}
        className={cn(
          "w-full overflow-hidden rounded-full bg-secondary",
          SIZE[size],
          className,
        )}
        {...props}
      >
        <div
          className={cn(
            "h-full rounded-full transition-[width] duration-500 ease-out",
            INTENT[intent],
          )}
          style={{ width: `${pct}%` }}
        />
      </div>
    );
  },
);
Progress.displayName = "Progress";

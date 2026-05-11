import * as React from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface SpinnerProps extends React.HTMLAttributes<HTMLSpanElement> {
  size?: "sm" | "md" | "lg";
  label?: string;
}

const SIZE: Record<NonNullable<SpinnerProps["size"]>, string> = {
  sm: "h-3.5 w-3.5",
  md: "h-4 w-4",
  lg: "h-5 w-5",
};

/**
 * Inline loading spinner with an accessible label. Wraps Lucide's
 * Loader2 with consistent sizing and aria semantics.
 */
export function Spinner({
  size = "md",
  label,
  className,
  ...props
}: SpinnerProps) {
  return (
    <span
      role="status"
      aria-live="polite"
      className={cn("inline-flex items-center", className)}
      {...props}
    >
      <Loader2 className={cn("animate-spin", SIZE[size])} />
      {label ? <span className="sr-only">{label}</span> : null}
    </span>
  );
}

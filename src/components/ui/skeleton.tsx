import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * A loading placeholder that pulses. Use this in `loading.tsx` files and
 * inside server components while data is being fetched.
 *
 * Compose by giving it width/height utilities, e.g.:
 *   <Skeleton className="h-4 w-32" />
 */
export function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      aria-hidden
      className={cn(
        "relative overflow-hidden rounded-md bg-muted/60",
        // Shimmer overlay — animated by tailwind keyframes (see tailwind.config.ts)
        "before:absolute before:inset-0 before:-translate-x-full before:animate-shimmer",
        "before:bg-gradient-to-r before:from-transparent before:via-white/5 before:to-transparent",
        className,
      )}
      {...props}
    />
  );
}

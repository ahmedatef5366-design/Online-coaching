import * as React from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export interface StepperStep {
  id: string;
  label: string;
}

interface StepperProps extends React.HTMLAttributes<HTMLOListElement> {
  steps: StepperStep[];
  /** Zero-based index of the active step. */
  currentIndex: number;
  /** Optional accessible label for the surrounding `<nav>` landmark. */
  ariaLabel?: string;
}

/**
 * Horizontal stepper for multi-step flows (apply form, onboarding wizard).
 * Renders numbered circles with a connecting bar and the step label below.
 * On small screens it collapses to a compact "Step N of M" pill.
 */
export function Stepper({
  steps,
  currentIndex,
  ariaLabel,
  className,
  ...props
}: StepperProps) {
  const total = steps.length;
  const current = Math.min(Math.max(currentIndex, 0), total - 1);
  return (
    <nav
      aria-label={ariaLabel ?? "Progress"}
      className={cn("w-full", className)}
    >
      <ol className="hidden items-center gap-2 sm:flex" {...props}>
        {steps.map((step, i) => {
          const isActive = i === current;
          const isComplete = i < current;
          return (
            <li key={step.id} className="flex flex-1 items-center gap-2">
              <div className="flex flex-col items-center gap-1">
                <span
                  aria-current={isActive ? "step" : undefined}
                  className={cn(
                    "flex h-7 w-7 items-center justify-center rounded-full border text-xs font-semibold transition-colors",
                    isActive &&
                      "border-primary bg-primary text-primary-foreground",
                    isComplete && "border-primary bg-primary/15 text-primary",
                    !isActive &&
                      !isComplete &&
                      "border-border bg-card text-muted-foreground",
                  )}
                >
                  {isComplete ? <Check className="h-3.5 w-3.5" /> : i + 1}
                </span>
                <span
                  className={cn(
                    "text-[11px] font-medium uppercase tracking-wider",
                    isActive ? "text-foreground" : "text-muted-foreground",
                  )}
                >
                  {step.label}
                </span>
              </div>
              {i < total - 1 ? (
                <div
                  aria-hidden
                  className={cn(
                    "mb-5 h-px flex-1 transition-colors",
                    i < current ? "bg-primary/60" : "bg-border",
                  )}
                />
              ) : null}
            </li>
          );
        })}
      </ol>
      {/* Mobile: condensed pill */}
      <div className="flex items-center justify-between sm:hidden">
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          {steps[current]?.label}
        </p>
        <p className="text-xs text-muted-foreground">
          {current + 1} / {total}
        </p>
      </div>
    </nav>
  );
}

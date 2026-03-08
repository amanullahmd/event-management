'use client';

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/modules/shared-common/utils/cn"

const progressVariants = cva(
  "relative w-full overflow-hidden rounded-full bg-(--color-surface) border border-(--color-border)",
  {
    variants: {
      size: {
        sm: "h-1",
        md: "h-2",
        lg: "h-3",
      },
    },
    defaultVariants: {
      size: "md",
    },
  }
)

const indicatorVariants = cva(
  "h-full transition-all duration-300 ease-in-out rounded-full",
  {
    variants: {
      color: {
        primary: "bg-(--color-primary)",
        secondary: "bg-(--color-secondary)",
        success: "bg-(--color-success)",
        error: "bg-(--color-error)",
        warning: "bg-(--color-warning)",
        info: "bg-(--color-info)",
      },
    },
    defaultVariants: {
      color: "primary",
    },
  }
)

export interface ProgressProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof progressVariants> {
  value?: number
  max?: number
  indicatorColor?: VariantProps<typeof indicatorVariants>["color"]
  label?: string
  showValue?: boolean
}

const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  ({ className, size, indicatorColor, label, showValue, value = 0, max = 100, ...props }, ref) => {
    const percentage = Math.min(Math.max(Math.round((value / max) * 100), 0), 100)

    return (
      <div className="flex flex-col gap-2 w-full">
        {(label || showValue) && (
          <div className="flex items-center justify-between">
            {label && (
              <span className="text-sm font-medium text-(--color-text-primary)">{label}</span>
            )}
            {showValue && (
              <span className="text-sm font-medium text-(--color-text-secondary)">
                {percentage}%
              </span>
            )}
          </div>
        )}
        <div
          ref={ref}
          role="progressbar"
          aria-valuenow={value}
          aria-valuemin={0}
          aria-valuemax={max}
          className={cn(progressVariants({ size }), className)}
          {...props}
        >
          <div
            className={cn(indicatorVariants({ color: indicatorColor }))}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
    )
  }
)
Progress.displayName = "Progress"

export { Progress, progressVariants, indicatorVariants }

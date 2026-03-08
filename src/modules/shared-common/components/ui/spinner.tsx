'use client';

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Loader2 } from "lucide-react"

import { cn } from "@/modules/shared-common/utils/cn"

const spinnerVariants = cva(
  "animate-spin",
  {
    variants: {
      size: {
        sm: "h-4 w-4",
        md: "h-6 w-6",
        lg: "h-8 w-8",
        xl: "h-12 w-12",
      },
      color: {
        primary: "text-(--color-primary)",
        secondary: "text-(--color-secondary)",
        success: "text-(--color-success)",
        error: "text-(--color-error)",
        warning: "text-(--color-warning)",
        info: "text-(--color-info)",
        current: "text-current",
      },
    },
    defaultVariants: {
      size: "md",
      color: "primary",
    },
  }
)

export interface SpinnerProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "color">,
    VariantProps<typeof spinnerVariants> {
  label?: string
}

const Spinner = React.forwardRef<HTMLDivElement, SpinnerProps>(
  ({ className, size, color, label, ...props }, ref) => (
    <div
      ref={ref}
      className="flex flex-col items-center justify-center gap-2"
      {...props}
    >
      <Loader2 className={cn(spinnerVariants({ size, color }), className)} />
      {label && (
        <p className="text-sm text-(--color-text-secondary)">{label}</p>
      )}
    </div>
  )
)
Spinner.displayName = "Spinner"

export { Spinner, spinnerVariants }

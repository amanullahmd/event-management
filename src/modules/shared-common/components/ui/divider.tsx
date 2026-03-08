'use client';

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/modules/shared-common/utils/cn"

const dividerVariants = cva(
  "bg-(--color-border)",
  {
    variants: {
      orientation: {
        horizontal: "h-px w-full",
        vertical: "h-full w-px",
      },
      margin: {
        none: "",
        xs: "my-1",
        sm: "my-2",
        md: "my-4",
        lg: "my-6",
        xl: "my-8",
      },
    },
    defaultVariants: {
      orientation: "horizontal",
      margin: "md",
    },
  }
)

export interface DividerProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof dividerVariants> {
  label?: string
}

const Divider = React.forwardRef<HTMLDivElement, DividerProps>(
  ({ className, orientation, margin, label, ...props }, ref) => {
    if (label && orientation === "horizontal") {
      return (
        <div
          ref={ref}
          className={cn("flex items-center gap-4", margin && `my-${margin}`)}
          {...props}
        >
          <div className="flex-1 h-px bg-(--color-border)" />
          <span className="text-sm text-(--color-text-secondary) px-2 whitespace-nowrap">
            {label}
          </span>
          <div className="flex-1 h-px bg-(--color-border)" />
        </div>
      )
    }

    return (
      <div
        ref={ref}
        className={cn(dividerVariants({ orientation, margin }), className)}
        {...props}
      />
    )
  }
)
Divider.displayName = "Divider"

export { Divider, dividerVariants }

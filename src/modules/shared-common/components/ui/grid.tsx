'use client';

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/modules/shared-common/utils/cn"

const gridVariants = cva(
  "grid",
  {
    variants: {
      cols: {
        1: "grid-cols-1",
        2: "grid-cols-2",
        3: "grid-cols-3",
        4: "grid-cols-4",
        auto: "grid-cols-auto",
      },
      gap: {
        none: "gap-0",
        xs: "gap-1",
        sm: "gap-2",
        md: "gap-4",
        lg: "gap-6",
        xl: "gap-8",
      },
    },
    defaultVariants: {
      cols: 1,
      gap: "md",
    },
  }
)

export interface GridProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof gridVariants> {
  colsMd?: VariantProps<typeof gridVariants>["cols"]
  colsLg?: VariantProps<typeof gridVariants>["cols"]
}

const Grid = React.forwardRef<HTMLDivElement, GridProps>(
  ({ className, cols, gap, colsMd, colsLg, ...props }, ref) => {
    let responsiveClass = ""
    if (colsMd) {
      responsiveClass += ` md:${gridVariants({ cols: colsMd }).split(" ").find(c => c.startsWith("grid-cols"))}`
    }
    if (colsLg) {
      responsiveClass += ` lg:${gridVariants({ cols: colsLg }).split(" ").find(c => c.startsWith("grid-cols"))}`
    }

    return (
      <div
        ref={ref}
        className={cn(gridVariants({ cols, gap }), responsiveClass, className)}
        {...props}
      />
    )
  }
)
Grid.displayName = "Grid"

export { Grid, gridVariants }

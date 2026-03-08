import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Dot } from "lucide-react"

import { cn } from "@/modules/shared-common/utils/cn"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-slate-950",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-(--color-primary) text-white hover:opacity-90 dark:hover:opacity-80 focus:ring-(--color-primary)",
        secondary:
          "border-transparent bg-(--color-secondary) text-white hover:opacity-90 dark:hover:opacity-80 focus:ring-(--color-secondary)",
        success:
          "border-transparent bg-(--color-success) text-white hover:opacity-90 dark:hover:opacity-80 focus:ring-(--color-success)",
        error:
          "border-transparent bg-(--color-error) text-white hover:opacity-90 dark:hover:opacity-80 focus:ring-(--color-error)",
        warning:
          "border-transparent bg-(--color-warning) text-white hover:opacity-90 dark:hover:opacity-80 focus:ring-(--color-warning)",
        info:
          "border-transparent bg-(--color-info) text-white hover:opacity-90 dark:hover:opacity-80 focus:ring-(--color-info)",
        outline: "border-(--color-border) text-(--color-text-primary) dark:border-(--color-border) dark:text-(--color-text-primary)",
      },
      size: {
        sm: "px-2 py-0.5 text-xs",
        md: "px-2.5 py-0.5 text-xs",
        lg: "px-3 py-1 text-sm",
      },
      dot: {
        true: "pl-1.5",
        false: "",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
      dot: false,
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  dot?: boolean
}

function Badge({ className, variant, size, dot, children, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant, size, dot }), className)} {...props}>
      {dot && <Dot className="w-3 h-3 mr-1 fill-current" />}
      {children}
    </div>
  )
}

export { Badge, badgeVariants }


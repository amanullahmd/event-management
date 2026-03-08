'use client';

import * as React from "react"
import * as TooltipPrimitive from "@radix-ui/react-tooltip"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/modules/shared-common/utils/cn"

const TooltipProvider = TooltipPrimitive.Provider

const tooltipVariants = cva(
  "z-50 overflow-hidden rounded-md border border-(--color-border) bg-white dark:bg-(--color-surface) px-3 py-1.5 text-sm text-(--color-text-primary) shadow-md animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
  {
    variants: {
      variant: {
        default: "bg-white dark:bg-(--color-surface) text-(--color-text-primary) border-(--color-border)",
        dark: "bg-slate-900 dark:bg-slate-950 text-white border-slate-800",
        primary: "bg-(--color-primary) text-white border-(--color-primary)",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

interface TooltipProps extends React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Root> {
  children: React.ReactNode
  content: React.ReactNode
  side?: "top" | "right" | "bottom" | "left"
  align?: "start" | "center" | "end"
  delayDuration?: number
  variant?: VariantProps<typeof tooltipVariants>["variant"]
}

const Tooltip = React.forwardRef<
  React.ElementRef<typeof TooltipPrimitive.Content>,
  TooltipProps
>(
  (
    {
      children,
      content,
      side = "top",
      align = "center",
      delayDuration = 200,
      variant = "default",
      ...props
    },
    ref
  ) => (
    <TooltipPrimitive.Root delayDuration={delayDuration} {...props}>
      <TooltipPrimitive.Trigger asChild>
        {children}
      </TooltipPrimitive.Trigger>
      <TooltipPrimitive.Content
        ref={ref}
        side={side}
        align={align}
        className={cn(tooltipVariants({ variant }))}
      >
        {content}
        <TooltipPrimitive.Arrow className="fill-current" />
      </TooltipPrimitive.Content>
    </TooltipPrimitive.Root>
  )
)
Tooltip.displayName = "Tooltip"

export { Tooltip, TooltipProvider, tooltipVariants }

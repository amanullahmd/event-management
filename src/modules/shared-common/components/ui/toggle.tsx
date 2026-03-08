'use client';

import * as React from "react"
import * as TogglePrimitive from "@radix-ui/react-toggle"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/modules/shared-common/utils/cn"

const toggleVariants = cva(
  "inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-white transition-colors hover:bg-(--color-surface) hover:text-(--color-text-primary) focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--color-primary) focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 dark:ring-offset-slate-950 dark:hover:bg-slate-800 dark:hover:text-(--color-text-primary) dark:focus-visible:ring-(--color-primary) data-[state=on]:bg-(--color-primary) data-[state=on]:text-white",
  {
    variants: {
      size: {
        default: "h-10 px-3",
        sm: "h-9 px-2.5",
        lg: "h-11 px-5",
      },
    },
    defaultVariants: {
      size: "default",
    },
  }
)

export type ToggleProps = React.ComponentPropsWithoutRef<typeof TogglePrimitive.Root> &
  VariantProps<typeof toggleVariants> & {
    label?: string
  }

const Toggle = React.forwardRef<
  React.ElementRef<typeof TogglePrimitive.Root>,
  ToggleProps
>(({ className, size, label, ...props }, ref) => (
  <div className="flex flex-col gap-2">
    {label && (
      <label className="text-sm font-medium text-(--color-text-primary)">
        {label}
      </label>
    )}
    <TogglePrimitive.Root
      ref={ref}
      className={cn(toggleVariants({ size, className }))}
      {...props}
    />
  </div>
))

Toggle.displayName = TogglePrimitive.Root.displayName

export { Toggle, toggleVariants }

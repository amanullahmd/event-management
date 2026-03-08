'use client';

import * as React from "react"
import * as CheckboxPrimitive from "@radix-ui/react-checkbox"
import { Check } from "lucide-react"

import { cn } from "@/modules/shared-common/utils/cn"

export type CheckboxProps = React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root> & {
  error?: string
  label?: string
}

const Checkbox = React.forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  CheckboxProps
>(({ className, error, label, ...props }, ref) => (
  <div className="flex flex-col gap-1">
    <div className="flex items-center gap-2">
      <CheckboxPrimitive.Root
        ref={ref}
        className={cn(
          "peer h-4 w-4 shrink-0 border border-(--color-border) rounded-sm bg-white dark:bg-(--color-surface) ring-offset-white dark:ring-offset-slate-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--color-primary) focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-950 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-(--color-primary) data-[state=checked]:border-(--color-primary) data-[state=checked]:text-white dark:data-[state=checked]:bg-(--color-primary)",
          error && "border-(--color-error) data-[state=checked]:bg-(--color-error) data-[state=checked]:border-(--color-error)",
          className
        )}
        {...props}
      >
        <CheckboxPrimitive.Indicator
          className={cn("flex items-center justify-center text-current")}
        >
          <Check className="h-4 w-4" />
        </CheckboxPrimitive.Indicator>
      </CheckboxPrimitive.Root>
      {label && (
        <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-(--color-text-primary) cursor-pointer">
          {label}
        </label>
      )}
    </div>
    {error && (
      <p className="text-xs text-(--color-error)" role="alert">
        {error}
      </p>
    )}
  </div>
))
Checkbox.displayName = CheckboxPrimitive.Root.displayName

export { Checkbox }

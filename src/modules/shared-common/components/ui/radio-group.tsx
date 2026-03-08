'use client';

import * as React from "react"
import * as RadioGroupPrimitive from "@radix-ui/react-radio-group"
import { Circle } from "lucide-react"

import { cn } from "@/modules/shared-common/utils/cn"

export type RadioGroupProps = React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Root> & {
  error?: string
  label?: string
}

const RadioGroup = React.forwardRef<
  React.ElementRef<typeof RadioGroupPrimitive.Root>,
  RadioGroupProps
>(({ className, error, label, ...props }, ref) => (
  <div className="flex flex-col gap-2">
    {label && (
      <label className="text-sm font-medium text-(--color-text-primary)">
        {label}
      </label>
    )}
    <RadioGroupPrimitive.Root
      ref={ref}
      className={cn("flex flex-col gap-2", className)}
      {...props}
    />
    {error && (
      <p className="text-xs text-(--color-error)" role="alert">
        {error}
      </p>
    )}
  </div>
))
RadioGroup.displayName = RadioGroupPrimitive.Root.displayName

const RadioGroupItem = React.forwardRef<
  React.ElementRef<typeof RadioGroupPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Item> & {
    label?: string
    description?: string
  }
>(({ className, label, description, ...props }, ref) => (
  <div className="flex items-start gap-2">
    <RadioGroupPrimitive.Item
      ref={ref}
      className={cn(
        "aspect-square h-4 w-4 rounded-full border border-(--color-border) bg-white dark:bg-(--color-surface) ring-offset-white dark:ring-offset-slate-950 focus:outline-none focus-visible:ring-2 focus-visible:ring-(--color-primary) focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-950 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:border-(--color-primary) data-[state=checked]:bg-(--color-primary)",
        className
      )}
      {...props}
    >
      <RadioGroupPrimitive.Indicator className="flex items-center justify-center">
        <Circle className="h-2.5 w-2.5 fill-current text-white" />
      </RadioGroupPrimitive.Indicator>
    </RadioGroupPrimitive.Item>
    {label && (
      <div className="flex flex-col gap-0.5">
        <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-(--color-text-primary) cursor-pointer">
          {label}
        </label>
        {description && (
          <p className="text-xs text-(--color-text-secondary)">
            {description}
          </p>
        )}
      </div>
    )}
  </div>
))
RadioGroupItem.displayName = RadioGroupPrimitive.Item.displayName

export { RadioGroup, RadioGroupItem }

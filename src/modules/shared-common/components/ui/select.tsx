'use client';

import * as React from "react"
import { cn } from "@/modules/shared-common/utils/cn"

// Using type aliases instead of empty interfaces to satisfy ESLint
export type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement> & {
  value?: string;
  onValueChange?: (value: string) => void;
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, children, value, onValueChange, onChange, ...props }, ref) => (
    <select
      ref={ref}
      value={value}
      onChange={(e) => {
        onValueChange?.(e.target.value);
        onChange?.(e);
      }}
      className={cn(
        "flex h-10 w-full items-center justify-between rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-800 dark:bg-slate-950 dark:ring-offset-slate-950 dark:placeholder:text-slate-400 dark:focus:ring-slate-300",
        className
      )}
      {...props}
    >
      {children}
    </select>
  )
)
Select.displayName = "Select"

export type SelectOptionProps = React.OptionHTMLAttributes<HTMLOptionElement>

const SelectOption = React.forwardRef<HTMLOptionElement, SelectOptionProps>(
  ({ className, ...props }, ref) => (
    <option
      ref={ref}
      className={cn("py-1.5 px-2 text-sm", className)}
      {...props}
    />
  )
)
SelectOption.displayName = "SelectOption"

// Compound Select components for compatibility
const SelectTrigger = React.forwardRef<HTMLSelectElement, SelectProps>(
  (props, ref) => <Select ref={ref} {...props} />
);
SelectTrigger.displayName = "SelectTrigger";

const SelectValue = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  (props, ref) => <div ref={ref} {...props} />
);
SelectValue.displayName = "SelectValue";

const SelectContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ children, ...props }, ref) => <div ref={ref} {...props}>{children}</div>
);
SelectContent.displayName = "SelectContent";

const SelectItem = React.forwardRef<HTMLOptionElement, SelectOptionProps>(
  (props, ref) => <SelectOption ref={ref} {...props} />
);
SelectItem.displayName = "SelectItem";

export { Select, SelectOption, SelectTrigger, SelectValue, SelectContent, SelectItem }


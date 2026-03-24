import * as React from "react"
import { cn } from "@/modules/shared-common/utils/cn"

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string
  helperText?: string
  prefixIcon?: React.ReactNode
  suffixIcon?: React.ReactNode
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, error, helperText, prefixIcon, suffixIcon, ...props }, ref) => (
    <div className="w-full">
      <div className="relative flex items-center">
        {prefixIcon && (
          <span className="absolute left-3 text-(--color-text-secondary) pointer-events-none">
            {prefixIcon}
          </span>
        )}
        <input
          type={type}
          className={cn(
            "flex h-10 w-full rounded-md border border-(--color-border) bg-slate-50 px-3 py-2 text-sm ring-offset-white placeholder:text-(--color-text-tertiary) focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--color-primary) focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-(--color-border) dark:bg-(--color-surface) dark:ring-offset-slate-950 dark:placeholder:text-(--color-text-tertiary) dark:focus-visible:ring-(--color-primary) touch-target",
            error && "border-(--color-error) focus-visible:ring-(--color-error)",
            prefixIcon && "pl-10",
            suffixIcon && "pr-10",
            className
          )}
          ref={ref}
          {...props}
        />
        {suffixIcon && (
          <span className="absolute right-3 text-(--color-text-secondary) pointer-events-none">
            {suffixIcon}
          </span>
        )}
      </div>
      {error && (
        <p className="mt-1 text-xs text-(--color-error)" role="alert">
          {error}
        </p>
      )}
      {helperText && !error && (
        <p className="mt-1 text-xs text-(--color-text-secondary)">
          {helperText}
        </p>
      )}
    </div>
  )
)
Input.displayName = "Input"

export { Input }


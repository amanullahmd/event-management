/**
 * Button Component
 * 
 * A versatile button component with multiple variants and sizes.
 * Built with class-variance-authority for type-safe styling.
 * 
 * @example
 * ```tsx
 * // Default button
 * <Button>Click me</Button>
 * 
 * // Destructive variant
 * <Button variant="destructive">Delete</Button>
 * 
 * // Small outline button
 * <Button variant="outline" size="sm">Cancel</Button>
 * 
 * // As a link (using asChild)
 * <Button asChild>
 *   <a href="/page">Go to page</a>
 * </Button>
 * ```
 */
import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils/cn"

/**
 * Button style variants using class-variance-authority
 * 
 * Variants:
 * - default: Primary dark button
 * - destructive: Red button for dangerous actions
 * - outline: Bordered button with transparent background
 * - secondary: Light gray button
 * - ghost: Transparent button with hover effect
 * - link: Text-only button styled as a link
 * 
 * Sizes:
 * - default: Standard size (h-10)
 * - sm: Small size (h-9)
 * - lg: Large size (h-11)
 * - icon: Square button for icons (h-10 w-10)
 */
const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 dark:ring-offset-slate-950 dark:focus-visible:ring-slate-300",
  {
    variants: {
      variant: {
        default: "bg-slate-900 text-slate-50 hover:bg-slate-800 dark:bg-slate-50 dark:text-slate-900 dark:hover:bg-slate-100",
        destructive:
          "bg-red-500 text-slate-50 hover:bg-red-600 dark:hover:bg-red-600",
        outline:
          "border border-slate-200 bg-white hover:bg-slate-100 hover:text-slate-900 dark:border-slate-800 dark:bg-slate-950 dark:hover:bg-slate-800 dark:hover:text-slate-50",
        secondary:
          "bg-slate-100 text-slate-900 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-50 dark:hover:bg-slate-700",
        ghost: "hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-800 dark:hover:text-slate-50",
        link: "text-slate-900 underline-offset-4 hover:underline dark:text-slate-50",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

/**
 * Button component props
 * @property variant - Visual style variant
 * @property size - Button size
 * @property asChild - Render as child element (for composition with links)
 */
export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

/**
 * Button component with multiple variants and sizes
 * @param className - Additional CSS classes
 * @param variant - Visual style variant (default, destructive, outline, secondary, ghost, link)
 * @param size - Button size (default, sm, lg, icon)
 * @param asChild - If true, renders as child element for composition
 */
const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }

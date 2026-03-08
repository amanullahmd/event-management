/**
 * Button Component
 * 
 * A versatile button component with multiple variants and sizes.
 * Built with class-variance-authority for type-safe styling.
 * Supports loading state, icon-only variant, and design system tokens.
 * 
 * @example
 * ```tsx
 * // Default button
 * <Button>Click me</Button>
 * 
 * // Destructive variant
 * <Button variant="error">Delete</Button>
 * 
 * // Small outline button
 * <Button variant="outline" size="sm">Cancel</Button>
 * 
 * // Loading state
 * <Button loading>Processing...</Button>
 * 
 * // Icon-only button
 * <Button variant="ghost" size="icon">
 *   <Icon />
 * </Button>
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
import { Loader2 } from "lucide-react"

import { cn } from "@/modules/shared-common/utils/cn"

/**
 * Button style variants using class-variance-authority
 * 
 * Variants:
 * - default: Primary button using design system primary color
 * - destructive: Red button for dangerous actions
 * - outline: Bordered button with transparent background
 * - secondary: Secondary button using design system secondary color
 * - ghost: Transparent button with hover effect
 * - link: Text-only button styled as a link
 * 
 * Sizes:
 * - xs: Extra small (h-8, px-2)
 * - sm: Small size (h-9, px-3)
 * - default: Standard size (h-10, px-4)
 * - lg: Large size (h-11, px-8)
 * - xl: Extra large (h-12, px-6)
 * - icon: Square button for icons (h-10 w-10)
 */
const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 dark:ring-offset-slate-950 dark:focus-visible:ring-slate-300 touch-target",
  {
    variants: {
      variant: {
        default: "bg-(--color-primary) text-white hover:bg-(--color-primary-dark) dark:bg-(--color-primary) dark:hover:bg-(--color-primary-dark) focus-visible:ring-(--color-primary)",
        destructive:
          "bg-(--color-error) text-white hover:opacity-90 dark:hover:opacity-80 focus-visible:ring-(--color-error)",
        outline:
          "border border-(--color-border) bg-white hover:bg-(--color-surface) text-(--color-text-primary) dark:border-(--color-border) dark:bg-(--color-surface) dark:text-(--color-text-primary) dark:hover:bg-slate-700 focus-visible:ring-(--color-primary)",
        secondary:
          "bg-(--color-secondary) text-white hover:opacity-90 dark:hover:opacity-80 focus-visible:ring-(--color-secondary)",
        ghost: "hover:bg-(--color-surface) text-(--color-text-primary) dark:hover:bg-slate-800 focus-visible:ring-(--color-primary)",
        link: "text-(--color-primary) underline-offset-4 hover:underline dark:text-(--color-primary) focus-visible:ring-(--color-primary)",
      },
      size: {
        xs: "h-8 px-2 text-xs",
        sm: "h-9 rounded-md px-3 text-sm",
        default: "h-10 px-4 py-2",
        lg: "h-11 rounded-md px-8",
        xl: "h-12 px-6 text-base",
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
 * @property loading - Show loading spinner and disable button
 * @property icon - Icon to display (for icon-only buttons)
 */
export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  loading?: boolean
  icon?: React.ReactNode
}

/**
 * Button component with multiple variants and sizes
 * @param className - Additional CSS classes
 * @param variant - Visual style variant (default, destructive, outline, secondary, ghost, link)
 * @param size - Button size (xs, sm, default, lg, xl, icon)
 * @param asChild - If true, renders as child element for composition
 * @param loading - If true, shows loading spinner and disables button
 * @param icon - Icon to display
 */
const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, loading = false, icon, children, disabled, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
        )}
        {icon && !loading && (
          <span className="mr-2">{icon}</span>
        )}
        {children}
      </Comp>
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }


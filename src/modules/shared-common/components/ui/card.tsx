/**
 * Card Component
 * 
 * A flexible card container component for displaying content in a bordered box.
 * Built with shadcn/ui patterns and supports dark mode with design system tokens.
 * Supports multiple variants: elevated, outlined, filled.
 * 
 * @example
 * ```tsx
 * <Card variant="elevated">
 *   <CardHeader>
 *     <CardTitle>Card Title</CardTitle>
 *     <CardDescription>Card description text</CardDescription>
 *   </CardHeader>
 *   <CardContent>Main content goes here</CardContent>
 *   <CardFooter>Footer actions</CardFooter>
 * </Card>
 * ```
 */
import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/modules/shared-common/utils/cn"

const cardVariants = cva(
  "rounded-lg text-(--color-text-primary) transition-all duration-200",
  {
    variants: {
      variant: {
        elevated: "bg-white dark:bg-(--color-surface) shadow-lg border border-(--color-border)",
        outlined: "bg-white dark:bg-(--color-surface) border border-(--color-border) shadow-sm hover:shadow-md",
        filled: "bg-(--color-surface) dark:bg-slate-800 border-none shadow-sm",
      },
    },
    defaultVariants: {
      variant: "outlined",
    },
  }
)

export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {
  hoverable?: boolean
}

/**
 * Main card container component
 * @param className - Additional CSS classes to apply
 * @param variant - Card style variant (elevated, outlined, filled)
 * @param hoverable - Add hover lift effect
 * @param props - Standard HTML div attributes
 */
const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant, hoverable = false, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        cardVariants({ variant }),
        hoverable && "hover-lift cursor-pointer",
        className
      )}
      {...props}
    />
  )
)
Card.displayName = "Card"

/**
 * Card header section for title and description
 * @param className - Additional CSS classes to apply
 */
const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-6", className)}
    {...props}
  />
))
CardHeader.displayName = "CardHeader"

/**
 * Card title component - renders as h3
 * @param className - Additional CSS classes to apply
 */
const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "text-2xl font-semibold leading-none tracking-tight",
      className
    )}
    {...props}
  />
))
CardTitle.displayName = "CardTitle"

/**
 * Card description component for subtitle text
 * @param className - Additional CSS classes to apply
 */
const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-(--color-text-secondary)", className)}
    {...props}
  />
))
CardDescription.displayName = "CardDescription"

/**
 * Card content section for main body content
 * @param className - Additional CSS classes to apply
 */
const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
))
CardContent.displayName = "CardContent"

/**
 * Card footer section for actions and buttons
 * @param className - Additional CSS classes to apply
 */
const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-6 pt-0", className)}
    {...props}
  />
))
CardFooter.displayName = "CardFooter"

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent }


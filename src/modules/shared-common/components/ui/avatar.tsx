'use client';

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/modules/shared-common/utils/cn"

const avatarVariants = cva(
  "relative inline-flex items-center justify-center font-semibold text-white bg-(--color-primary) overflow-hidden",
  {
    variants: {
      size: {
        sm: "h-8 w-8 text-xs",
        md: "h-10 w-10 text-sm",
        lg: "h-12 w-12 text-base",
        xl: "h-16 w-16 text-lg",
      },
      shape: {
        circle: "rounded-full",
        square: "rounded-md",
      },
    },
    defaultVariants: {
      size: "md",
      shape: "circle",
    },
  }
)

export interface AvatarProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof avatarVariants> {
  src?: string
  alt?: string
  initials?: string
  statusIndicator?: "online" | "offline" | "away"
}

const Avatar = React.forwardRef<HTMLDivElement, AvatarProps>(
  ({ className, size, shape, src, alt, initials, statusIndicator, children, ...props }, ref) => {
    const [imgError, setImgError] = React.useState(false)

    return (
      <div className="relative inline-block">
        <div
          ref={ref}
          className={cn(avatarVariants({ size, shape }), className)}
          {...props}
        >
          {src && !imgError ? (
            <img
              src={src}
              alt={alt ?? ""}
              loading="lazy"
              className="h-full w-full object-cover"
              onError={() => setImgError(true)}
            />
          ) : initials ? (
            <span aria-label={alt}>{initials}</span>
          ) : (
            children
          )}
        </div>
        {statusIndicator && (
          <span
            aria-label={statusIndicator}
            className={cn(
              "absolute bottom-0 right-0 rounded-full border-2 border-white dark:border-slate-950",
              size === "sm" && "h-2 w-2",
              (size === "md" || !size) && "h-3 w-3",
              size === "lg" && "h-4 w-4",
              size === "xl" && "h-5 w-5",
              statusIndicator === "online" && "bg-(--color-success)",
              statusIndicator === "offline" && "bg-(--color-text-tertiary)",
              statusIndicator === "away" && "bg-(--color-warning)"
            )}
          />
        )}
      </div>
    )
  }
)
Avatar.displayName = "Avatar"

const AvatarImage = React.forwardRef<
  HTMLImageElement,
  React.ImgHTMLAttributes<HTMLImageElement>
>(({ className, ...props }, ref) => (
  <img
    ref={ref}
    className={cn("h-full w-full object-cover", className)}
    loading="lazy"
    {...props}
  />
))
AvatarImage.displayName = "AvatarImage"

const AvatarFallback = React.forwardRef<
  HTMLSpanElement,
  React.HTMLAttributes<HTMLSpanElement>
>(({ className, ...props }, ref) => (
  <span
    ref={ref}
    className={cn(
      "flex items-center justify-center bg-(--color-primary) text-white font-semibold w-full h-full",
      className
    )}
    {...props}
  />
))
AvatarFallback.displayName = "AvatarFallback"

export { Avatar, AvatarImage, AvatarFallback, avatarVariants }

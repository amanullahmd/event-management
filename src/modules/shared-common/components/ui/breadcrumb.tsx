'use client';

import * as React from "react"
import Link from "next/link"
import { ChevronRight } from "lucide-react"

import { cn } from "@/modules/shared-common/utils/cn"

export interface BreadcrumbItem {
  label: string
  href?: string
}

export interface BreadcrumbProps extends React.HTMLAttributes<HTMLDivElement> {
  items: BreadcrumbItem[]
  separator?: React.ReactNode
  maxItems?: number
}

const Breadcrumb = React.forwardRef<HTMLDivElement, BreadcrumbProps>(
  ({ className, items, separator = <ChevronRight className="h-4 w-4" />, maxItems = 5, ...props }, ref) => {
    const displayItems = maxItems && items.length > maxItems
      ? [items[0], { label: "..." }, ...items.slice(-(maxItems - 2))]
      : items

    return (
      <nav
        ref={ref}
        className={cn("flex items-center gap-2", className)}
        aria-label="Breadcrumb"
        {...props}
      >
        <ol className="flex items-center gap-2">
          {displayItems.map((item, index) => (
            <li key={index} className="flex items-center gap-2">
              {item.href ? (
                <Link
                  href={item.href}
                  className="text-sm text-(--color-primary) hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--color-primary) focus-visible:ring-offset-2 rounded px-1"
                >
                  {item.label}
                </Link>
              ) : (
                <span className="text-sm text-(--color-text-primary)">
                  {item.label}
                </span>
              )}
              {index < displayItems.length - 1 && (
                <span className="text-(--color-text-tertiary)" aria-hidden="true">
                  {separator}
                </span>
              )}
            </li>
          ))}
        </ol>
      </nav>
    )
  }
)
Breadcrumb.displayName = "Breadcrumb"

export { Breadcrumb }

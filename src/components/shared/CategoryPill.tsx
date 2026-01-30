/**
 * CategoryPill Component
 * 
 * A small rounded tag component for displaying event categories.
 * Used in the CategoryInterests section for personalized recommendations.
 * 
 * Features:
 * - Rounded pill-style design
 * - Hover effects with color transitions
 * - Optional icon support
 * - Navigation to filtered events
 * - Customizable colors
 * 
 * @example
 * ```tsx
 * <CategoryPill 
 *   category="Music"
 *   icon={<Music className="w-4 h-4" />}
 *   onClick={handleClick}
 * />
 * ```
 * 
 * Requirements: 9.2, 9.3, 9.4
 */
'use client';

import React, { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { cn } from '@/lib/utils/cn';

export interface CategoryPillProps {
  /** Category name */
  category: string;
  /** Optional icon to display */
  icon?: React.ReactNode;
  /** Optional color class (e.g., "from-pink-500 to-rose-500") */
  color?: string;
  /** Optional href for Link component */
  href?: string;
  /** Optional click handler */
  onClick?: () => void;
  /** Whether the pill is active/selected */
  isActive?: boolean;
  /** Additional CSS classes */
  className?: string;
}

/**
 * CategoryPill component for displaying event categories
 * 
 * @param props - CategoryPill configuration props
 * @returns JSX element containing the category pill
 * 
 * Validates: Requirements 9.2 (Display Category_Pills in flowing wrap layout)
 * Validates: Requirements 9.3 (Have hover effects with color transitions)
 * Validates: Requirements 9.4 (Navigate to events page filtered by category on click)
 */
export function CategoryPill({
  category,
  icon,
  color = 'from-violet-500 to-purple-500',
  href,
  onClick,
  isActive = false,
  className,
}: CategoryPillProps) {
  const router = useRouter();

  const handleClick = useCallback(() => {
    if (onClick) {
      onClick();
    } else if (!href) {
      // Navigate to events page with category filter
      // Validates: Requirements 9.4
      const encodedCategory = encodeURIComponent(category);
      router.push(`/events?category=${encodedCategory}`);
    }
  }, [onClick, href, category, router]);

  const baseClasses = cn(
    'inline-flex items-center gap-1.5',
    'px-3 py-1.5 rounded-full',
    'text-sm font-medium',
    'transition-all duration-200',
    'focus:outline-none focus:ring-2 focus:ring-offset-2',
    className
  );

  const activeClasses = cn(
    'bg-gradient-to-r',
    color,
    'text-white shadow-lg',
    'focus:ring-violet-400'
  );

  const inactiveClasses = cn(
    'bg-slate-100 dark:bg-slate-800',
    'text-slate-700 dark:text-slate-300',
    'hover:bg-slate-200 dark:hover:bg-slate-700',
    'border border-slate-200 dark:border-slate-700',
    'hover:border-slate-300 dark:hover:border-slate-600',
    'focus:ring-slate-400'
  );

  const content = (
    <>
      {icon && (
        <span className="flex-shrink-0 transition-transform group-hover:scale-110">
          {icon}
        </span>
      )}
      <span className="whitespace-nowrap">{category}</span>
    </>
  );

  if (href) {
    return (
      <Link
        href={href}
        className={cn(baseClasses, isActive ? activeClasses : inactiveClasses, 'group')}
      >
        {content}
      </Link>
    );
  }

  return (
    <button
      onClick={handleClick}
      className={cn(baseClasses, isActive ? activeClasses : inactiveClasses, 'group')}
      type="button"
      aria-label={`Filter by ${category}`}
    >
      {content}
    </button>
  );
}

export default CategoryPill;


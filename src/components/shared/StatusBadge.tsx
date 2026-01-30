/**
 * StatusBadge Component
 * 
 * A colored overlay badge component for displaying event status information
 * on EventCards. Supports multiple badge types with distinct colors for
 * easy visual differentiation.
 * 
 * Badge Types:
 * - almost-full: Red (#ef4444) - Indicates urgency, less than 10% tickets remaining
 * - sale-ends-soon: Orange (#f97316) - Sale ending within 24 hours
 * - starting-soon: Orange (#f97316) - Event starting soon
 * - featured: Purple (#8b5cf6) - Featured/promoted event
 * - free: Green (#22c55e) - Free event with $0 ticket price
 * 
 * @example
 * ```tsx
 * <StatusBadge type="almost-full" />
 * <StatusBadge type="featured" className="absolute top-2 left-2" />
 * ```
 * 
 * Requirements: 5.1, 5.6
 */
import React from 'react';
import { cn } from '@/lib/utils/cn';

export interface StatusBadgeProps {
  /** The type of status badge to display */
  type: 'almost-full' | 'sale-ends-soon' | 'starting-soon' | 'featured' | 'free';
  /** Additional CSS classes for custom positioning or styling */
  className?: string;
}

/**
 * Badge configuration mapping type to display properties
 */
const badgeConfig: Record<StatusBadgeProps['type'], { label: string; colorClasses: string }> = {
  'almost-full': {
    label: 'Almost Full',
    // Red color for urgency - Validates: Requirements 5.6
    colorClasses: 'bg-red-500 text-white',
  },
  'sale-ends-soon': {
    label: 'Sale Ends Soon',
    // Orange color for urgency - Validates: Requirements 5.6
    colorClasses: 'bg-orange-500 text-white',
  },
  'starting-soon': {
    label: 'Starting Soon',
    // Orange color for time-sensitive status
    colorClasses: 'bg-orange-500 text-white',
  },
  'featured': {
    label: 'Featured',
    // Purple color for featured events - Validates: Requirements 5.6
    colorClasses: 'bg-violet-500 text-white',
  },
  'free': {
    label: 'Free',
    // Green color for free events - Validates: Requirements 5.6
    colorClasses: 'bg-green-500 text-white',
  },
};

/**
 * StatusBadge component for displaying event status overlays
 * 
 * Displays a colored badge indicating the event's current status.
 * Uses distinct colors to differentiate badge types for quick visual recognition.
 * 
 * @param props - StatusBadge configuration props
 * @returns JSX element containing the status badge
 * 
 * Validates: Requirements 5.1 (Display Status_Badge overlay when applicable)
 * Validates: Requirements 5.6 (Use distinct colors to differentiate badge types)
 */
export function StatusBadge({ type, className }: StatusBadgeProps) {
  const config = badgeConfig[type];

  return (
    <span
      className={cn(
        // Base badge styles
        'inline-flex items-center justify-center',
        'px-2.5 py-1',
        'text-xs font-semibold',
        'rounded-full',
        'shadow-sm',
        // Badge-specific color classes
        config.colorClasses,
        // Custom classes for positioning
        className
      )}
      role="status"
      aria-label={`Event status: ${config.label}`}
    >
      {config.label}
    </span>
  );
}

export default StatusBadge;

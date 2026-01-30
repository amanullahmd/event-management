/**
 * SocialProofBadge Component
 * 
 * A component for displaying social proof information on EventCards,
 * showing interested and/or going counts to help users make informed
 * decisions about events.
 * 
 * Display Formats:
 * - When only interestedCount is provided: "42 interested"
 * - When both counts are provided: "15 going • 42 interested"
 * - When counts are zero or not provided: Component renders nothing
 * 
 * @example
 * ```tsx
 * // Only interested count
 * <SocialProofBadge interestedCount={42} />
 * 
 * // Both going and interested counts
 * <SocialProofBadge interestedCount={42} goingCount={15} />
 * ```
 * 
 * Requirements: 5.5
 */
import React from 'react';
import { Users, Heart } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

export interface SocialProofBadgeProps {
  /** Number of users who have marked interest in the event */
  interestedCount: number;
  /** Number of users who are confirmed going to the event */
  goingCount?: number;
  /** Additional CSS classes for custom styling */
  className?: string;
}

/**
 * SocialProofBadge component for displaying event engagement metrics
 * 
 * Displays interested and going counts to provide social proof for events.
 * Uses lucide-react icons for visual appeal and clear communication.
 * 
 * @param props - SocialProofBadge configuration props
 * @returns JSX element containing the social proof badge, or null if no counts
 * 
 * Validates: Requirements 5.5 (Display Social_Proof_Badge showing interested/going count)
 */
export function SocialProofBadge({ 
  interestedCount, 
  goingCount, 
  className 
}: SocialProofBadgeProps) {
  // Don't render if there's no meaningful data to display
  const hasGoingCount = goingCount !== undefined && goingCount > 0;
  const hasInterestedCount = interestedCount > 0;

  if (!hasGoingCount && !hasInterestedCount) {
    return null;
  }

  return (
    <div
      className={cn(
        // Base styles
        'inline-flex items-center gap-1.5',
        'text-sm text-gray-600',
        className
      )}
      role="status"
      aria-label={buildAriaLabel(interestedCount, goingCount)}
    >
      {/* Going count section */}
      {hasGoingCount && (
        <span className="inline-flex items-center gap-1">
          <Users 
            className="h-4 w-4 text-violet-500" 
            aria-hidden="true" 
          />
          <span className="font-medium">{formatCount(goingCount!)}</span>
          <span>going</span>
        </span>
      )}

      {/* Separator when both counts are present */}
      {hasGoingCount && hasInterestedCount && (
        <span className="text-gray-400" aria-hidden="true">•</span>
      )}

      {/* Interested count section */}
      {hasInterestedCount && (
        <span className="inline-flex items-center gap-1">
          <Heart 
            className="h-4 w-4 text-pink-500" 
            aria-hidden="true" 
          />
          <span className="font-medium">{formatCount(interestedCount)}</span>
          <span>interested</span>
        </span>
      )}
    </div>
  );
}

/**
 * Formats a count number for display
 * Adds 'k' suffix for thousands (e.g., 1500 -> "1.5k")
 */
function formatCount(count: number): string {
  if (count >= 1000) {
    const formatted = (count / 1000).toFixed(1);
    // Remove trailing .0 for clean display
    return formatted.endsWith('.0') 
      ? `${Math.floor(count / 1000)}k` 
      : `${formatted}k`;
  }
  return count.toString();
}

/**
 * Builds an accessible aria-label for screen readers
 */
function buildAriaLabel(interestedCount: number, goingCount?: number): string {
  const parts: string[] = [];
  
  if (goingCount !== undefined && goingCount > 0) {
    parts.push(`${goingCount} people going`);
  }
  
  if (interestedCount > 0) {
    parts.push(`${interestedCount} people interested`);
  }
  
  return parts.join(', ');
}

export default SocialProofBadge;

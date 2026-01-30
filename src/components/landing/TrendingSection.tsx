/**
 * TrendingSection Component
 * 
 * Displays trending events in the user's location with numbered rankings.
 * Uses the Carousel component to show EventCards with large rank overlays.
 * 
 * Features:
 * - Displays trending events with rank numbers (1-10)
 * - Horizontal carousel layout
 * - Location-aware (shows "Trending in [Location]")
 * - Social proof badges on event cards
 * - Responsive design
 * 
 * @example
 * ```tsx
 * <TrendingSection 
 *   events={trendingEvents}
 *   location="New York"
 * />
 * ```
 * 
 * Requirements: 4.1, 4.2, 4.7
 */
'use client';

import React from 'react';
import { Flame } from 'lucide-react';
import { Carousel } from '@/components/shared/Carousel';
import { EventCard, ExtendedEvent } from '@/components/shared/EventCard';
import { cn } from '@/lib/utils/cn';

export interface TrendingSectionProps {
  /** Array of trending events to display */
  events: ExtendedEvent[];
  /** Current location for display in title */
  location: string | null;
  /** Additional CSS classes */
  className?: string;
}

/**
 * TrendingSection component for displaying trending events
 * 
 * @param props - TrendingSection configuration props
 * @returns JSX element containing the trending section
 * 
 * Validates: Requirements 4.1 (Display Trending_Section with title and fire emoji)
 * Validates: Requirements 4.2 (Display Event_Cards in horizontal Carousel with rankings)
 * Validates: Requirements 4.7 (Display Social_Proof_Badge on Event_Cards)
 */
export function TrendingSection({
  events,
  location,
  className,
}: TrendingSectionProps) {
  // Get location display name
  const locationDisplay = location || 'Nearby';
  const sectionTitle = `Trending in ${locationDisplay}`;

  // Limit to top 10 trending events
  const trendingEvents = events.slice(0, 10);

  if (trendingEvents.length === 0) {
    return null;
  }

  return (
    <section className={cn('w-full', className)}>
      <Carousel
        title={sectionTitle}
        titleIcon={<Flame className="w-5 h-5 text-orange-500" />}
        viewAllHref="/events?sort=trending"
        itemWidth={300}
        gap={16}
      >
        {trendingEvents.map((event, index) => (
          <EventCard
            key={event.id}
            event={event}
            variant="trending"
            rank={index + 1}
            showSocialProof={true}
            showSaveButton={true}
          />
        ))}
      </Carousel>
    </section>
  );
}

export default TrendingSection;


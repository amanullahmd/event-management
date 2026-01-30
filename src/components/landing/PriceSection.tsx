/**
 * PriceSection Component
 * 
 * Displays events filtered by price range in a horizontal carousel.
 * Supports multiple price tiers: Free Events, Events under $25, etc.
 * 
 * Features:
 * - Horizontal carousel of price-filtered events
 * - Configurable price threshold
 * - Event cards with pricing information
 * - Responsive design
 * 
 * @example
 * ```tsx
 * <PriceSection 
 *   title="Free Events"
 *   events={freeEvents}
 *   maxPrice={0}
 * />
 * ```
 * 
 * Requirements: 7.1, 7.2, 7.3, 7.5
 */
'use client';

import React from 'react';
import { DollarSign } from 'lucide-react';
import { Carousel } from '@/components/shared/Carousel';
import { EventCard, ExtendedEvent } from '@/components/shared/EventCard';
import { cn } from '@/lib/utils/cn';

export interface PriceSectionProps {
  /** Section title (e.g., "Free Events", "Events under $25") */
  title: string;
  /** Array of events to display */
  events: ExtendedEvent[];
  /** Maximum price threshold for filtering */
  maxPrice: number;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Get the minimum ticket price for an event
 */
function getMinTicketPrice(event: ExtendedEvent): number {
  if (!event.ticketTypes || event.ticketTypes.length === 0) {
    return 0;
  }
  return Math.min(...event.ticketTypes.map(t => t.price));
}

/**
 * PriceSection component for displaying price-filtered events
 * 
 * @param props - PriceSection configuration props
 * @returns JSX element containing the price section
 * 
 * Validates: Requirements 7.1 (Display Price_Section with title)
 * Validates: Requirements 7.2 (Display Price_Section with title)
 * Validates: Requirements 7.3 (Display events in horizontal Carousel format)
 * Validates: Requirements 7.5 (Support same navigation controls as other carousels)
 */
export function PriceSection({
  title,
  events,
  maxPrice,
  className,
}: PriceSectionProps) {
  // Filter events by price
  // Validates: Requirements 7.4 (Include only events with minimum ticket price at or below threshold)
  const filteredEvents = events.filter(
    (event) => getMinTicketPrice(event) <= maxPrice
  );

  if (filteredEvents.length === 0) {
    return null;
  }

  return (
    <section className={cn('w-full', className)}>
      <Carousel
        title={title}
        titleIcon={<DollarSign className="w-5 h-5 text-green-600" />}
        viewAllHref={`/events?priceMax=${maxPrice}`}
        itemWidth={300}
        gap={16}
      >
        {filteredEvents.map((event) => (
          <EventCard
            key={event.id}
            event={event}
            variant="default"
            showSocialProof={true}
            showSaveButton={true}
          />
        ))}
      </Carousel>
    </section>
  );
}

export default PriceSection;


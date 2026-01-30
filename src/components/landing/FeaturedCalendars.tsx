/**
 * FeaturedCalendars Component
 * 
 * Displays featured event calendars and communities in a horizontal carousel.
 * Inspired by Luma's calendar discovery feature.
 * 
 * Features:
 * - Horizontal carousel of featured calendars
 * - Calendar cards with images, names, descriptions, and follower counts
 * - Follow buttons for subscribing to calendars
 * - Navigation to filtered events view for each calendar
 * 
 * @example
 * ```tsx
 * <FeaturedCalendars calendars={calendars} />
 * ```
 * 
 * Requirements: 6.1, 6.2, 6.3, 6.5
 */
'use client';

import React from 'react';
import { BookOpen } from 'lucide-react';
import { Carousel } from '@/components/shared/Carousel';
import { FeaturedCalendarCard, FeaturedCalendar } from '@/components/shared/FeaturedCalendarCard';
import { cn } from '@/lib/utils/cn';

export interface FeaturedCalendarsProps {
  /** Array of featured calendars to display */
  calendars: FeaturedCalendar[];
  /** Additional CSS classes */
  className?: string;
}

/**
 * FeaturedCalendars component for displaying featured event calendars
 * 
 * @param props - FeaturedCalendars configuration props
 * @returns JSX element containing the featured calendars section
 * 
 * Validates: Requirements 6.1 (Display Featured_Calendars section with title)
 * Validates: Requirements 6.2 (Display Featured_Calendar cards in horizontal Carousel)
 */
export function FeaturedCalendars({
  calendars,
  className,
}: FeaturedCalendarsProps) {
  if (calendars.length === 0) {
    return null;
  }

  return (
    <section className={cn('w-full', className)}>
      <Carousel
        title="Featured Calendars"
        titleIcon={<BookOpen className="w-5 h-5 text-violet-600" />}
        viewAllHref="/calendars"
        itemWidth={300}
        gap={16}
      >
        {calendars.map((calendar) => (
          <FeaturedCalendarCard
            key={calendar.id}
            calendar={calendar}
          />
        ))}
      </Carousel>
    </section>
  );
}

export default FeaturedCalendars;


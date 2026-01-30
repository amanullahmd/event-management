/**
 * ThisWeekSection Component
 * 
 * Displays events happening this week in a responsive grid layout.
 * Events are sorted by date with soonest events first.
 * 
 * Features:
 * - Responsive grid layout (not carousel)
 * - Events sorted by date ascending
 * - Maximum of 8 events displayed
 * - "View All" link to events page
 * - Event cards with full details
 * 
 * @example
 * ```tsx
 * <ThisWeekSection events={weekEvents} />
 * ```
 * 
 * Requirements: 8.1, 8.2, 8.3, 8.4
 */
'use client';

import React from 'react';
import Link from 'next/link';
import { Calendar } from 'lucide-react';
import { EventCard, ExtendedEvent } from '@/components/shared/EventCard';
import { cn } from '@/lib/utils/cn';

export interface ThisWeekSectionProps {
  /** Array of events happening this week */
  events: ExtendedEvent[];
  /** Additional CSS classes */
  className?: string;
}

/**
 * ThisWeekSection component for displaying this week's events
 * 
 * @param props - ThisWeekSection configuration props
 * @returns JSX element containing the this week section
 * 
 * Validates: Requirements 8.1 (Display "Happening This Week" section)
 * Validates: Requirements 8.2 (Display Event_Cards in responsive grid layout)
 * Validates: Requirements 8.3 (Sort events by date, soonest first)
 * Validates: Requirements 8.4 (Show maximum of 8 events with "View All" link)
 */
export function ThisWeekSection({
  events,
  className,
}: ThisWeekSectionProps) {
  // Sort events by date ascending (soonest first)
  // Validates: Requirements 8.3
  const sortedEvents = [...events].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  // Limit to 8 events
  // Validates: Requirements 8.4
  const displayedEvents = sortedEvents.slice(0, 8);

  if (displayedEvents.length === 0) {
    return null;
  }

  return (
    <section className={cn('w-full', className)}>
      {/* Section header */}
      <div className="flex items-center justify-between mb-6 px-1">
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-violet-600 dark:text-violet-400" />
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-50">
            Happening This Week
          </h2>
        </div>

        {/* View All link */}
        {events.length > 8 && (
          <Link
            href="/events?dateRange=this-week"
            className="text-sm font-medium text-violet-600 hover:text-violet-700 dark:text-violet-400 dark:hover:text-violet-300 transition-colors"
          >
            View All
          </Link>
        )}
      </div>

      {/* Responsive grid layout - Validates: Requirements 8.2 */}
      <div
        className={cn(
          'grid gap-4',
          'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'
        )}
      >
        {displayedEvents.map((event) => (
          <EventCard
            key={event.id}
            event={event}
            variant="default"
            showSocialProof={true}
            showSaveButton={true}
          />
        ))}
      </div>
    </section>
  );
}

export default ThisWeekSection;


import { Suspense } from 'react';
import { EventsPageClient } from '@/components/public/EventsPageClient';
import { getAllEvents } from '@/lib/dummy-data';

/**
 * Event listing page with search, filters, and pagination
 * Requirements: 16.2, 16.3, 16.5
 */
export default function EventsPage() {
  const allEvents = getAllEvents().filter((e) => e.status === 'active');

  return (
    <Suspense fallback={<div className="text-center py-12">Loading events...</div>}>
      <EventsPageClient initialEvents={allEvents} />
    </Suspense>
  );
}

export const revalidate = 60;

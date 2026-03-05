import { Suspense } from 'react';
import { EventsPageClient } from '@/components/public/EventsPageClient';
import { getAllEvents, type Event } from '@/lib/services/apiService';

/**
 * Event listing page with search, filters, and pagination
 * Requirements: 16.2, 16.3, 16.5
 */
export default async function EventsPage() {
  let allEvents: Event[] = [];
  
  try {
    allEvents = (await getAllEvents()).filter((e) => e.status === 'active');
  } catch (error) {
    console.error('Failed to fetch events during build:', error);
    // Return empty array during build time if backend is not available
    allEvents = [];
  }

  return (
    <Suspense fallback={<div className="text-center py-12">Loading events...</div>}>
      <EventsPageClient initialEvents={allEvents} />
    </Suspense>
  );
}

export const revalidate = 60;

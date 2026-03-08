import { Suspense } from 'react';
import { EventsPageClient } from '@/modules/shared-common/components/public/EventsPageClient';
import { getAllEvents, type Event } from '@/modules/shared-common/services/apiService';

/**
 * Event listing page with search, filters, and pagination
 * Requirements: 16.2, 16.3, 16.5
 */
export default async function EventsPage() {
  let allEvents: Event[] = [];
  
  try {
    const fetched = await getAllEvents();
    allEvents = (Array.isArray(fetched) ? fetched : []).filter(
      (e) => e.status === 'active' || e.status === 'published'
    );
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


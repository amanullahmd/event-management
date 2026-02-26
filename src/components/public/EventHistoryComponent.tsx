'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { apiGet } from '@/lib/utils/api';
import type { EventHistoryItem } from '@/lib/types/organizer-trust-profiles';
import type { PaginatedResponse } from '@/lib/types/api';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface EventHistoryComponentProps {
  organizerId: string;
}

const EVENTS_PER_PAGE = 10;

export const EventHistoryComponent: React.FC<EventHistoryComponentProps> = ({
  organizerId,
}) => {
  const router = useRouter();
  const [events, setEvents] = useState<EventHistoryItem[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await apiGet<PaginatedResponse<EventHistoryItem>>(
          `/organizers/${organizerId}/events?page=${currentPage}&size=${EVENTS_PER_PAGE}`
        );

        setEvents(response.items);
        setTotalPages(response.totalPages);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load event history';
        setError(errorMessage);
        console.error('Error fetching event history:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [organizerId, currentPage]);

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'upcoming':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="p-6 bg-red-50 border-red-200">
        <p className="text-red-600">{error}</p>
      </Card>
    );
  }

  if (events.length === 0) {
    return (
      <Card className="p-6 text-center">
        <p className="text-gray-500">No events found</p>
      </Card>
    );
  }

  return (
    <div>
      <div className="space-y-4 mb-6">
        {events.map((event) => (
          <Card
            key={event.id}
            className="p-6 hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => router.push(`/events/${event.eventId}`)}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="text-lg font-semibold mb-2">{event.eventName}</h3>
                <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                  <div>
                    <span className="font-medium">Date:</span>{' '}
                    {new Date(event.eventDate).toLocaleDateString()}
                  </div>
                  <div>
                    <span className="font-medium">Location:</span> {event.location}
                  </div>
                  <div>
                    <span className="font-medium">Tickets Sold:</span> {event.ticketSalesCount}
                  </div>
                </div>
              </div>
              <div className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusBadgeColor(event.status)}`}>
                {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            disabled={currentPage === 0}
            onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
          >
            Previous
          </Button>
          <div className="flex items-center gap-2">
            {Array.from({ length: totalPages }, (_, i) => (
              <Button
                key={i}
                variant={currentPage === i ? 'default' : 'outline'}
                size="sm"
                onClick={() => setCurrentPage(i)}
              >
                {i + 1}
              </Button>
            ))}
          </div>
          <Button
            variant="outline"
            disabled={currentPage === totalPages - 1}
            onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
};

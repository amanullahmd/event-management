'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { EventFilter, EventFilterValues } from '@/components/public/EventFilter';
import type { Event } from '@/lib/types';

const ITEMS_PER_PAGE = 9;

interface EventsPageClientProps {
  initialEvents: Event[];
}

/**
 * Client component for event listing with search, filters, and pagination
 */
export function EventsPageClient({ initialEvents }: EventsPageClientProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState<EventFilterValues>({
    keyword: '',
    category: '',
    location: '',
    dateRange: '',
  });

  // Extract unique categories and locations for filter options
  const categories = useMemo(() => {
    const uniqueCategories = [...new Set(initialEvents.map((e) => e.category))];
    return uniqueCategories.sort();
  }, [initialEvents]);

  const locations = useMemo(() => {
    const uniqueLocations = [...new Set(initialEvents.map((e) => e.location))];
    return uniqueLocations.sort();
  }, [initialEvents]);

  // Filter events based on search criteria
  const filteredEvents = useMemo(() => {
    return initialEvents.filter((event) => {
      // Keyword search (name, description, category)
      if (filters.keyword) {
        const keyword = filters.keyword.toLowerCase();
        const matchesKeyword =
          event.name.toLowerCase().includes(keyword) ||
          event.description.toLowerCase().includes(keyword) ||
          event.category.toLowerCase().includes(keyword);
        if (!matchesKeyword) return false;
      }

      // Category filter
      if (filters.category && event.category !== filters.category) {
        return false;
      }

      // Location filter
      if (filters.location && event.location !== filters.location) {
        return false;
      }

      // Date range filter
      if (filters.dateRange) {
        const eventDate = new Date(event.date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        switch (filters.dateRange) {
          case 'today': {
            const tomorrow = new Date(today);
            tomorrow.setDate(tomorrow.getDate() + 1);
            if (eventDate < today || eventDate >= tomorrow) return false;
            break;
          }
          case 'this-week': {
            const endOfWeek = new Date(today);
            endOfWeek.setDate(endOfWeek.getDate() + (7 - today.getDay()));
            if (eventDate < today || eventDate > endOfWeek) return false;
            break;
          }
          case 'this-month': {
            const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
            if (eventDate < today || eventDate > endOfMonth) return false;
            break;
          }
          case 'next-month': {
            const startOfNextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1);
            const endOfNextMonth = new Date(today.getFullYear(), today.getMonth() + 2, 0);
            if (eventDate < startOfNextMonth || eventDate > endOfNextMonth) return false;
            break;
          }
        }
      }

      return true;
    });
  }, [initialEvents, filters]);

  // Pagination
  const totalPages = Math.ceil(filteredEvents.length / ITEMS_PER_PAGE);
  const paginatedEvents = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredEvents.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredEvents, currentPage]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filters]);

  const handleFilterChange = useCallback((newFilters: EventFilterValues) => {
    setFilters(newFilters);
  }, []);

  const handleClearFilters = useCallback(() => {
    setFilters({
      keyword: '',
      category: '',
      location: '',
      dateRange: '',
    });
  }, []);

  const formatDate = useCallback((date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }, []);

  const getAvailableTickets = useCallback((event: Event) => {
    return event.ticketTypes.reduce(
      (total, tt) => total + (tt.quantity - tt.sold),
      0
    );
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Discover Events
          </h1>
          <p className="text-gray-600">
            Find and book tickets to amazing events near you
          </p>
        </div>

        {/* Search and Filters */}
        <EventFilter
          filters={filters}
          onFilterChange={handleFilterChange}
          onClearFilters={handleClearFilters}
          categories={categories}
          locations={locations}
        />

        {/* Results Count */}
        <div className="mb-4 text-sm text-gray-600">
          {filteredEvents.length === 0
            ? 'No events found'
            : `Showing ${paginatedEvents.length} of ${filteredEvents.length} events`}
        </div>

        {/* Events Grid */}
        {paginatedEvents.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow-sm">
            <p className="text-gray-600 mb-4">
              No events match your search criteria
            </p>
            <Button variant="outline" onClick={handleClearFilters}>
              Clear Filters
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginatedEvents.map((event) => (
              <Link key={event.id} href={`/events/${event.id}`}>
                <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer h-full flex flex-col">
                  {/* Event Image */}
                  <div className="w-full h-48 bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
                    <div className="text-white text-center">
                      <p className="text-sm font-semibold">{event.category}</p>
                    </div>
                  </div>

                  {/* Event Details */}
                  <div className="p-6 flex-1 flex flex-col">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-lg font-bold text-gray-900 flex-1 line-clamp-2">
                        {event.name}
                      </h3>
                      <Badge variant="secondary" className="ml-2 shrink-0">
                        {event.category}
                      </Badge>
                    </div>

                    <p className="text-sm text-gray-600 mb-4 line-clamp-2 flex-1">
                      {event.description}
                    </p>

                    <div className="space-y-2 mb-4">
                      <p className="text-sm text-gray-700">
                        <span className="font-semibold">📅</span>{' '}
                        {formatDate(event.date)}
                      </p>
                      <p className="text-sm text-gray-700">
                        <span className="font-semibold">📍</span>{' '}
                        {event.location}
                      </p>
                    </div>

                    {/* Ticket Info */}
                    <div className="border-t pt-4 mt-auto">
                      <div className="flex justify-between items-center">
                        <p className="text-sm text-gray-600">
                          {getAvailableTickets(event)} tickets available
                        </p>
                        <p className="text-sm font-semibold text-blue-600">
                          From $
                          {Math.min(
                            ...event.ticketTypes.map((t) => t.price)
                          ).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-8 flex justify-center items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              aria-label="Previous page"
            >
              Previous
            </Button>

            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <Button
                  key={page}
                  variant={currentPage === page ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setCurrentPage(page)}
                  aria-label={`Go to page ${page}`}
                  aria-current={currentPage === page ? 'page' : undefined}
                >
                  {page}
                </Button>
              ))}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              aria-label="Next page"
            >
              Next
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

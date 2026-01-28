'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { EventFilter, EventFilterValues } from '@/components/public/EventFilter';
import type { Event } from '@/lib/types';
import { Calendar, MapPin, Users, ArrowRight, Ticket, Search, Sparkles } from 'lucide-react';

const ITEMS_PER_PAGE = 9;

interface EventsPageClientProps {
  initialEvents: Event[];
}

export function EventsPageClient({ initialEvents }: EventsPageClientProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState<EventFilterValues>({
    keyword: '',
    category: '',
    location: '',
    dateRange: '',
  });

  const categories = useMemo(() => {
    return [...new Set(initialEvents.map((e) => e.category))].sort();
  }, [initialEvents]);

  const locations = useMemo(() => {
    return [...new Set(initialEvents.map((e) => e.location))].sort();
  }, [initialEvents]);

  const filteredEvents = useMemo(() => {
    return initialEvents.filter((event) => {
      if (filters.keyword) {
        const keyword = filters.keyword.toLowerCase();
        const matchesKeyword = event.name.toLowerCase().includes(keyword) || event.description.toLowerCase().includes(keyword) || event.category.toLowerCase().includes(keyword);
        if (!matchesKeyword) return false;
      }
      if (filters.category && event.category !== filters.category) return false;
      if (filters.location && event.location !== filters.location) return false;
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
        }
      }
      return true;
    });
  }, [initialEvents, filters]);

  const totalPages = Math.ceil(filteredEvents.length / ITEMS_PER_PAGE);
  const paginatedEvents = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredEvents.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredEvents, currentPage]);

  useEffect(() => { setCurrentPage(1); }, [filters]);

  const handleFilterChange = useCallback((newFilters: EventFilterValues) => { setFilters(newFilters); }, []);
  const handleClearFilters = useCallback(() => { setFilters({ keyword: '', category: '', location: '', dateRange: '' }); }, []);

  const formatDate = useCallback((date: Date) => {
    return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }, []);

  const getAvailableTickets = useCallback((event: Event) => {
    return event.ticketTypes.reduce((total, tt) => total + (tt.quantity - tt.sold), 0);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
      {/* Hero Header */}
      <section className="bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center max-w-3xl mx-auto">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 mb-4">
              <Sparkles className="w-4 h-4 mr-1.5" /> {initialEvents.length} Events Available
            </span>
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              Discover <span className="text-violet-600 dark:text-violet-400">Amazing Events</span>
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-200">
              Find and book tickets to concerts, conferences, workshops, and more happening near you
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <EventFilter 
          filters={filters} 
          onFilterChange={handleFilterChange} 
          onClearFilters={handleClearFilters} 
          categories={categories} 
          locations={locations} 
        />

        {/* Results Count */}
        <div className="mb-6 flex items-center justify-between">
          <p className="text-sm text-gray-600 dark:text-gray-300">
            {filteredEvents.length === 0 ? (
              'No events found'
            ) : (
              <>Showing <span className="font-semibold text-gray-900 dark:text-white">{paginatedEvents.length}</span> of <span className="font-semibold text-gray-900 dark:text-white">{filteredEvents.length}</span> events</>
            )}
          </p>
          {filters.keyword || filters.category || filters.location || filters.dateRange ? (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleClearFilters}
              className="text-violet-600 dark:text-violet-400 hover:text-violet-700 dark:hover:text-violet-300"
            >
              Clear all filters
            </Button>
          ) : null}
        </div>

        {/* Events Grid or Empty State */}
        {paginatedEvents.length === 0 ? (
          <div className="text-center py-20 bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700">
            <div className="w-16 h-16 bg-violet-100 dark:bg-violet-900/30 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Search className="w-8 h-8 text-violet-600 dark:text-violet-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No events found</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6 max-w-md mx-auto">
              We couldn&apos;t find any events matching your criteria. Try adjusting your filters or search terms.
            </p>
            <Button 
              onClick={handleClearFilters} 
              className="bg-violet-600 hover:bg-violet-700 text-white"
            >
              Clear Filters
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginatedEvents.map((event) => (
              <Link key={event.id} href={`/events/${event.id}`} className="group">
                <Card className="overflow-hidden bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 h-full">
                  <div className="h-48 bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors" />
                    <span className="text-white text-xl font-semibold relative z-10">{event.category}</span>
                    <span className="absolute top-4 right-4 px-3 py-1.5 bg-white dark:bg-slate-900 text-violet-600 dark:text-violet-400 text-sm font-bold rounded-full shadow-lg">
                      From ${Math.min(...event.ticketTypes.map((t) => t.price))}
                    </span>
                  </div>
                  <div className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors line-clamp-2">
                      {event.name}
                    </h3>
                    <div className="space-y-3 mb-5">
                      <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                        <div className="w-8 h-8 rounded-lg bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center mr-3">
                          <Calendar className="w-4 h-4 text-violet-600 dark:text-violet-400" />
                        </div>
                        {formatDate(event.date)}
                      </div>
                      <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                        <div className="w-8 h-8 rounded-lg bg-fuchsia-100 dark:bg-fuchsia-900/30 flex items-center justify-center mr-3">
                          <MapPin className="w-4 h-4 text-fuchsia-600 dark:text-fuchsia-400" />
                        </div>
                        <span className="truncate">{event.location}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-5 border-t border-gray-100 dark:border-slate-700">
                      <span className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                        <Users className="w-4 h-4 mr-1.5" />
                        {getAvailableTickets(event)} tickets left
                      </span>
                      <span className="text-violet-600 dark:text-violet-400 text-sm font-medium group-hover:translate-x-1 transition-transform flex items-center">
                        Get Tickets <ArrowRight className="w-4 h-4 ml-1" />
                      </span>
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-12 flex justify-center items-center gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} 
              disabled={currentPage === 1} 
              className="border-gray-300 dark:border-slate-600 text-gray-700 dark:text-white disabled:opacity-50"
            >
              Previous
            </Button>
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                let page = i + 1;
                if (totalPages > 5) {
                  if (currentPage <= 3) page = i + 1;
                  else if (currentPage >= totalPages - 2) page = totalPages - 4 + i;
                  else page = currentPage - 2 + i;
                }
                return (
                  <Button 
                    key={page} 
                    variant={currentPage === page ? 'default' : 'outline'} 
                    size="sm" 
                    onClick={() => setCurrentPage(page)} 
                    className={currentPage === page 
                      ? 'bg-violet-600 hover:bg-violet-700 text-white' 
                      : 'border-gray-300 dark:border-slate-600 text-gray-700 dark:text-white'
                    }
                  >
                    {page}
                  </Button>
                );
              })}
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} 
              disabled={currentPage === totalPages} 
              className="border-gray-300 dark:border-slate-600 text-gray-700 dark:text-white disabled:opacity-50"
            >
              Next
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

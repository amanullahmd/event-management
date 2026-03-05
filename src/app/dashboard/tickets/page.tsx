'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/context/AuthContext';
import { getTicketsByCustomerId, getEventById, getAllEvents } from '@/lib/services/apiService';
import { TicketCard } from '@/components/customer/TicketCard';

// Use types from apiService to match API responses
type Ticket = Awaited<ReturnType<typeof getTicketsByCustomerId>>[number];
type Event = Awaited<ReturnType<typeof getEventById>>;
type TicketType = NonNullable<Event>['ticketTypes'][number];

interface EnrichedTicket {
  ticket: Ticket;
  event: Event;
  ticketType?: TicketType;
}

/**
 * Customer Tickets Page
 * Displays all purchased tickets with event details, date, location, and ticket type
 * Requirements: 13.1, 13.2
 */
export default function TicketsPage() {
  const { user } = useAuth();
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'past'>('all');
  const [enrichedTickets, setEnrichedTickets] = useState<EnrichedTicket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const now = new Date();
  
  useEffect(() => {
    const fetchTickets = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        const tickets = await getTicketsByCustomerId(user.id);
        
        // Fetch event data for each ticket
        const enriched = await Promise.all(
          tickets.map(async (ticket) => {
            const event = await getEventById(ticket.eventId);
            const ticketType = event?.ticketTypes.find((tt) => tt.id === ticket.ticketTypeId);
            return {
              ticket,
              event,
              ticketType,
            };
          })
        );
        
        // Filter out tickets without event data
        setEnrichedTickets(enriched.filter((t) => t.event !== undefined) as EnrichedTicket[]);
      } catch (error) {
        console.error('Failed to fetch tickets:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTickets();
  }, [user]);
  
  // Filter tickets based on selection
  const filteredTickets = enrichedTickets.filter(({ event }) => {
    if (!event) return false;
    const eventDate = new Date(event.date);
    
    switch (filter) {
      case 'upcoming':
        return eventDate > now;
      case 'past':
        return eventDate <= now;
      default:
        return true;
    }
  });
  
  // Sort by event date (upcoming first, then past)
  const sortedTickets = [...filteredTickets].sort((a, b) => {
    const dateA = new Date(a.event!.date).getTime();
    const dateB = new Date(b.event!.date).getTime();
    
    // Upcoming events first (ascending), then past events (descending)
    if (dateA > now.getTime() && dateB > now.getTime()) {
      return dateA - dateB; // Upcoming: soonest first
    } else if (dateA <= now.getTime() && dateB <= now.getTime()) {
      return dateB - dateA; // Past: most recent first
    } else {
      return dateA > now.getTime() ? -1 : 1; // Upcoming before past
    }
  });

  const upcomingCount = enrichedTickets.filter(({ event }) => 
    event && new Date(event.date) > now
  ).length;
  
  const pastCount = enrichedTickets.filter(({ event }) => 
    event && new Date(event.date) <= now
  ).length;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              My Tickets
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">
              View and manage all your purchased tickets
            </p>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-12 text-center">
          <div className="animate-spin h-12 w-12 border-4 border-indigo-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-slate-500 dark:text-slate-400">Loading your tickets...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            My Tickets
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            View and manage all your purchased tickets
          </p>
        </div>
        
        {/* Filter Tabs */}
        <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              filter === 'all'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            All ({enrichedTickets.length})
          </button>
          <button
            onClick={() => setFilter('upcoming')}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              filter === 'upcoming'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Upcoming ({upcomingCount})
          </button>
          <button
            onClick={() => setFilter('past')}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              filter === 'past'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Past ({pastCount})
          </button>
        </div>
      </div>

      {/* Tickets Grid */}
      {sortedTickets.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {sortedTickets.map(({ ticket, event, ticketType }) => (
            <TicketCard
              key={ticket.id}
              ticket={ticket}
              event={event!}
              ticketType={ticketType}
              attendeeName={user?.name || 'Guest'}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-12 text-center">
          <div className="text-6xl mb-4">🎫</div>
          <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
            {filter === 'all' 
              ? 'No tickets yet' 
              : filter === 'upcoming' 
              ? 'No upcoming tickets' 
              : 'No past tickets'}
          </h3>
          <p className="text-slate-500 dark:text-slate-400 mb-6">
            {filter === 'all'
              ? "You haven't purchased any tickets yet. Browse events to find something exciting!"
              : filter === 'upcoming'
              ? "You don't have any upcoming events. Time to plan your next adventure!"
              : "You don't have any past event tickets."}
          </p>
          <a
            href="/events"
            className="inline-flex items-center px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
          >
            Browse Events
          </a>
        </div>
      )}
    </div>
  );
}

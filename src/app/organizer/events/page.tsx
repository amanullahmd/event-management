'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { getAllEvents } from '@/lib/dummy-data';
import { useAuth } from '@/lib/context/AuthContext';
import type { Event } from '@/lib/types';
import { Calendar, MapPin, Users, Plus, Edit, BarChart3, Ticket, Eye } from 'lucide-react';

export default function OrganizerEventsPage() {
  const { user } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Get events for this organizer (using organizer-1 as default for demo)
    const organizerId = user?.id || 'organizer-1';
    const allEvents = getAllEvents();
    const organizerEvents = allEvents.filter(e => e.organizerId === organizerId);
    setEvents(organizerEvents);
    setIsLoading(false);
  }, [user]);

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  const getTicketsSold = (event: Event) => {
    return event.ticketTypes.reduce((total, tt) => total + tt.sold, 0);
  };

  const getTotalCapacity = (event: Event) => {
    return event.ticketTypes.reduce((total, tt) => total + tt.quantity, 0);
  };

  const getRevenue = (event: Event) => {
    return event.ticketTypes.reduce((total, tt) => total + (tt.sold * tt.price), 0);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-gray-500 dark:text-gray-400">Loading events...</p>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">My Events</h1>
          <p className="text-gray-600 dark:text-gray-300 mt-1">Manage and track your events</p>
        </div>
        <Link href="/organizer/events/new">
          <Button className="bg-violet-600 hover:bg-violet-700 text-white">
            <Plus className="w-5 h-5 mr-2" />
            Create Event
          </Button>
        </Link>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card className="p-4 bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700">
          <p className="text-sm text-gray-500 dark:text-gray-400">Total Events</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{events.length}</p>
        </Card>
        <Card className="p-4 bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700">
          <p className="text-sm text-gray-500 dark:text-gray-400">Active Events</p>
          <p className="text-2xl font-bold text-green-600">{events.filter(e => e.status === 'active').length}</p>
        </Card>
        <Card className="p-4 bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700">
          <p className="text-sm text-gray-500 dark:text-gray-400">Total Tickets Sold</p>
          <p className="text-2xl font-bold text-violet-600">{events.reduce((sum, e) => sum + getTicketsSold(e), 0)}</p>
        </Card>
        <Card className="p-4 bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700">
          <p className="text-sm text-gray-500 dark:text-gray-400">Total Revenue</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            ${events.reduce((sum, e) => sum + getRevenue(e), 0).toLocaleString()}
          </p>
        </Card>
      </div>

      {/* Events List */}
      {events.length === 0 ? (
        <Card className="p-12 text-center bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700">
          <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No events yet</h3>
          <p className="text-gray-600 dark:text-gray-300 mb-4">Create your first event to get started</p>
          <Link href="/organizer/events/new">
            <Button className="bg-violet-600 hover:bg-violet-700 text-white">
              <Plus className="w-5 h-5 mr-2" />
              Create Event
            </Button>
          </Link>
        </Card>
      ) : (
        <div className="space-y-4">
          {events.map((event) => (
            <Card key={event.id} className="p-6 bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                {/* Event Info */}
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{event.name}</h3>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      event.status === 'active' 
                        ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' 
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                    }`}>
                      {event.status}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-300">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4 text-violet-500" />
                      {formatDate(event.date)}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-4 h-4 text-fuchsia-500" />
                      {event.location}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="w-4 h-4 text-blue-500" />
                      {getTicketsSold(event)} / {getTotalCapacity(event)} tickets
                    </span>
                    <span className="flex items-center gap-1">
                      <Ticket className="w-4 h-4 text-green-500" />
                      ${getRevenue(event).toLocaleString()} revenue
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <Link href={`/organizer/events/${event.id}`}>
                    <Button variant="outline" size="sm" className="border-gray-300 dark:border-slate-600 text-gray-700 dark:text-white">
                      <Edit className="w-4 h-4 mr-1" />
                      Edit
                    </Button>
                  </Link>
                  <Link href={`/organizer/events/${event.id}/analytics`}>
                    <Button variant="outline" size="sm" className="border-gray-300 dark:border-slate-600 text-gray-700 dark:text-white">
                      <BarChart3 className="w-4 h-4 mr-1" />
                      Analytics
                    </Button>
                  </Link>
                  <Link href={`/events/${event.id}`}>
                    <Button variant="outline" size="sm" className="border-gray-300 dark:border-slate-600 text-gray-700 dark:text-white">
                      <Eye className="w-4 h-4 mr-1" />
                      View
                    </Button>
                  </Link>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

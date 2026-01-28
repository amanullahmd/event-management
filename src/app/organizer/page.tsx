'use client';

import { useMemo } from 'react';
import { useAuth } from '@/lib/hooks';
import { getAllEvents, getAllOrders } from '@/lib/dummy-data';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

/**
 * Organizer Dashboard Overview Page
 * Displays organizer's events and key metrics
 */
export default function OrganizerDashboard() {
  const { user } = useAuth();

  // Get organizer's events
  const organizerEvents = useMemo(() => {
    if (!user) return [];
    const allEvents = getAllEvents();
    return allEvents.filter((event) => event.organizerId === user.id);
  }, [user]);

  // Get organizer's orders
  const organizerOrders = useMemo(() => {
    if (!user) return [];
    const allOrders = getAllOrders();
    const eventIds = organizerEvents.map((e) => e.id);
    return allOrders.filter((order) => eventIds.includes(order.eventId));
  }, [user, organizerEvents]);

  // Calculate metrics
  const metrics = useMemo(() => {
    const totalEvents = organizerEvents.length;
    const activeEvents = organizerEvents.filter((e) => e.status === 'active').length;
    const totalTicketsSold = organizerEvents.reduce((sum, e) => sum + e.totalAttendees, 0);
    const totalRevenue = organizerOrders.reduce((sum, o) => sum + o.totalAmount, 0);

    return {
      totalEvents,
      activeEvents,
      totalTicketsSold,
      totalRevenue,
    };
  }, [organizerEvents, organizerOrders]);

  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  };

  // Format date
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="space-y-8">
      {/* Page header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
          Welcome, {user?.name}!
        </h1>
        <p className="text-slate-600 dark:text-slate-400 mt-2">
          Manage your events and track your sales
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-slate-900 rounded-lg shadow-md p-6 border border-slate-200 dark:border-slate-800">
          <h3 className="text-sm font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wide">
            Total Events
          </h3>
          <p className="text-3xl font-bold text-slate-900 dark:text-white mt-2">
            {metrics.totalEvents}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
            {metrics.activeEvents} active
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-lg shadow-md p-6 border border-slate-200 dark:border-slate-800">
          <h3 className="text-sm font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wide">
            Tickets Sold
          </h3>
          <p className="text-3xl font-bold text-slate-900 dark:text-white mt-2">
            {metrics.totalTicketsSold}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
            Total across all events
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-lg shadow-md p-6 border border-slate-200 dark:border-slate-800">
          <h3 className="text-sm font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wide">
            Total Revenue
          </h3>
          <p className="text-3xl font-bold text-slate-900 dark:text-white mt-2">
            {formatCurrency(metrics.totalRevenue)}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
            All time
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-lg shadow-md p-6 border border-slate-200 dark:border-slate-800">
          <h3 className="text-sm font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wide">
            Avg Revenue per Event
          </h3>
          <p className="text-3xl font-bold text-slate-900 dark:text-white mt-2">
            {formatCurrency(
              metrics.totalEvents > 0 ? metrics.totalRevenue / metrics.totalEvents : 0
            )}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
            Per event
          </p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white dark:bg-slate-900 rounded-lg shadow-md p-6 border border-slate-200 dark:border-slate-800">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
          Quick Actions
        </h2>
        <div className="flex flex-wrap gap-3">
          <Link href="/organizer/events/new">
            <Button className="bg-blue-600 hover:bg-blue-700 text-white">
              Create New Event
            </Button>
          </Link>
          <Link href="/organizer/events">
            <Button variant="outline">
              View All Events
            </Button>
          </Link>
          <Link href="/organizer/analytics">
            <Button variant="outline">
              View Analytics
            </Button>
          </Link>
          <Link href="/organizer/checkin">
            <Button variant="outline">
              Check-in Scanner
            </Button>
          </Link>
        </div>
      </div>

      {/* Recent Events */}
      <div className="bg-white dark:bg-slate-900 rounded-lg shadow-md border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="p-6 border-b border-slate-200 dark:border-slate-800">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            Recent Events
          </h2>
        </div>

        {organizerEvents.length === 0 ? (
          <div className="p-6 text-center text-slate-500 dark:text-slate-400">
            <p>No events yet. Create your first event to get started!</p>
            <Link href="/organizer/events/new" className="mt-4 inline-block">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                Create Event
              </Button>
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-slate-200 dark:divide-slate-800">
            {organizerEvents.slice(0, 5).map((event) => (
              <div
                key={event.id}
                className="p-6 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-slate-900 dark:text-white">
                      {event.name}
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                      {formatDate(event.date)} • {event.location}
                    </p>
                    <div className="flex gap-4 mt-3 text-sm">
                      <span className="text-slate-600 dark:text-slate-400">
                        {event.totalAttendees} tickets sold
                      </span>
                      <span className="text-slate-600 dark:text-slate-400">
                        {formatCurrency(
                          event.ticketTypes.reduce((sum, tt) => sum + tt.price * tt.sold, 0)
                        )}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Link href={`/organizer/events/${event.id}`}>
                      <Button size="sm" variant="outline">
                        View
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {organizerEvents.length > 5 && (
          <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-800 text-center">
            <Link href="/organizer/events">
              <Button variant="outline" size="sm">
                View All Events
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

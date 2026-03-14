'use client';

import { useMemo, useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { getEventById, getEventTicketTypes, getMyOrders, type Event as ApiEvent, type Order, type TicketType } from '@/modules/shared-common/services/apiService';
import { Button } from '@/modules/shared-common/components/ui/button';
import { Card } from '@/modules/shared-common/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/modules/shared-common/components/ui/tabs';
import { EventStatusSection } from '@/modules/event-management/components/EventStatusSection';
import Link from 'next/link';
import type { Event } from '@/lib/types';

/**
 * Event Details Page for Organizers
 * Displays event information and ticket management
 */
export default function EventDetailsPage() {
  const params = useParams();
  const eventId = params.id as string;
  const [event, setEvent] = useState<ApiEvent | null>(null);
  const [ticketTypes, setTicketTypes] = useState<TicketType[]>([]);
  const [allOrders, setAllOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch event, ticket types and orders
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [eventData, ticketTypesData, orders] = await Promise.all([
          getEventById(eventId),
          getEventTicketTypes(eventId),
          getMyOrders()
        ]);
        setEvent(eventData || null);
        setTicketTypes(ticketTypesData || []);
        setAllOrders(orders);
      } catch (error) {
        console.error('Failed to fetch data:', error);
        setEvent(null);
        setAllOrders([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [eventId]);

  // Get event orders
  const eventOrders = useMemo(() => {
    if (!event) return [];
    return allOrders.filter((order) => order.eventId === event.id);
  }, [event, allOrders]);

  // Refresh ticket types (called after add/edit/delete)
  const refreshTicketTypes = async () => {
    const updated = await getEventTicketTypes(eventId);
    setTicketTypes(updated || []);
  };

  const handleStatusChange = (updatedEvent: Event) => {
    // Convert Event type to ApiEvent type if needed
    setEvent(updatedEvent as any);
  };

  const handleStatusError = (error: string) => {
    console.error('Status change error:', error);
  };

  // Calculate metrics
  const metrics = useMemo(() => {
    if (!event) return null;

    const totalTickets = ticketTypes.reduce((sum, tt) => sum + tt.quantity, 0);
    const totalSold = ticketTypes.reduce((sum, tt) => sum + tt.sold, 0);
    const totalRevenue = ticketTypes.reduce((sum, tt) => sum + tt.price * tt.sold, 0);
    const availableTickets = totalTickets - totalSold;

    return {
      totalTickets,
      totalSold,
      availableTickets,
      totalRevenue,
      totalOrders: eventOrders.length,
    };
  }, [event, eventOrders, ticketTypes]);

  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  };

  // Format date
  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-600 dark:text-slate-400">Loading event...</p>
      </div>
    );
  }

  if (!event || !metrics) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-600 dark:text-slate-400">Event not found</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Page header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
            {event.title || event.name}
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-2">
            {formatDate(event.startDate || event.date)} • {event.location}
          </p>
        </div>
        <div className="flex gap-2">
          <Link href={`/organizer/events/${event.id}/edit`}>
            <Button variant="outline">Edit Event</Button>
          </Link>
          <Button variant="outline" className="text-red-600 hover:text-red-700">
            Delete Event
          </Button>
        </div>
      </div>

      {/* Event Description */}
      <div className="bg-white dark:bg-slate-900 rounded-lg shadow-md p-6 border border-slate-200 dark:border-slate-800">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
          Event Description
        </h2>
        <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
          {event.description}
        </p>
      </div>

      {/* Event Status Section */}
      {event && (
        <EventStatusSection
          event={event as any}
          onStatusChange={handleStatusChange}
          onError={handleStatusError}
        />
      )}

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <div className="bg-white dark:bg-slate-900 rounded-lg shadow-md p-6 border border-slate-200 dark:border-slate-800">
          <h3 className="text-sm font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wide">
            Total Tickets
          </h3>
          <p className="text-3xl font-bold text-slate-900 dark:text-white mt-2">
            {metrics.totalTickets}
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-lg shadow-md p-6 border border-slate-200 dark:border-slate-800">
          <h3 className="text-sm font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wide">
            Sold
          </h3>
          <p className="text-3xl font-bold text-slate-900 dark:text-white mt-2">
            {metrics.totalSold}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
            {metrics.totalTickets > 0
              ? `${Math.round((metrics.totalSold / metrics.totalTickets) * 100)}% sold`
              : 'No tickets'}
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-lg shadow-md p-6 border border-slate-200 dark:border-slate-800">
          <h3 className="text-sm font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wide">
            Available
          </h3>
          <p className="text-3xl font-bold text-slate-900 dark:text-white mt-2">
            {metrics.availableTickets}
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-lg shadow-md p-6 border border-slate-200 dark:border-slate-800">
          <h3 className="text-sm font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wide">
            Revenue
          </h3>
          <p className="text-3xl font-bold text-slate-900 dark:text-white mt-2">
            {formatCurrency(metrics.totalRevenue)}
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-lg shadow-md p-6 border border-slate-200 dark:border-slate-800">
          <h3 className="text-sm font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wide">
            Orders
          </h3>
          <p className="text-3xl font-bold text-slate-900 dark:text-white mt-2">
            {metrics.totalOrders}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="w-full justify-start border-b border-slate-200 dark:border-slate-800 rounded-none bg-transparent p-0">
          <TabsTrigger value="overview" className="rounded-none border-b-2 border-transparent data-[state=active]:border-indigo-600">
            Overview
          </TabsTrigger>
          <TabsTrigger value="tickets" className="rounded-none border-b-2 border-transparent data-[state=active]:border-indigo-600">
            Ticket Types
          </TabsTrigger>
          <TabsTrigger value="analytics" className="rounded-none border-b-2 border-transparent data-[state=active]:border-indigo-600">
            Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-white mb-2">
                Event Details
              </h3>
              <dl className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <dt className="text-slate-600 dark:text-slate-400">Status:</dt>
                  <dd className="text-slate-900 dark:text-white font-medium">
                    {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-slate-600 dark:text-slate-400">Event Type:</dt>
                  <dd className="text-slate-900 dark:text-white font-medium">
                    {(event as any).eventType ? (
                      (event as any).eventType === 'ONLINE' ? 'Online' :
                      (event as any).eventType === 'IN_PERSON' ? 'In-Person' :
                      (event as any).eventType === 'HYBRID' ? 'Hybrid' :
                      (event as any).eventType
                    ) : 'Not specified'}
                  </dd>
                </div>
                {((event as any).eventType === 'ONLINE' || (event as any).eventType === 'HYBRID') && (event as any).onlineLink && (
                  <div className="flex justify-between">
                    <dt className="text-slate-600 dark:text-slate-400">Online Link:</dt>
                    <dd className="text-slate-900 dark:text-white font-medium">
                      <a href={(event as any).onlineLink} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                        Join Online
                      </a>
                    </dd>
                  </div>
                )}
                {((event as any).eventType === 'IN_PERSON' || (event as any).eventType === 'HYBRID') && event.location && (
                  <div className="flex justify-between">
                    <dt className="text-slate-600 dark:text-slate-400">Location:</dt>
                    <dd className="text-slate-900 dark:text-white font-medium">
                      {event.location}
                    </dd>
                  </div>
                )}
                <div className="flex justify-between">
                  <dt className="text-slate-600 dark:text-slate-400">Category:</dt>
                  <dd className="text-slate-900 dark:text-white font-medium">
                    {event.categoryName || event.category}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-slate-600 dark:text-slate-400">Created:</dt>
                  <dd className="text-slate-900 dark:text-white font-medium">
                    {formatDate(event.createdAt)}
                  </dd>
                </div>
              </dl>
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-white mb-2">
                Quick Actions
              </h3>
              <div className="space-y-2">
                <Link href={`/organizer/events/${event.id}/analytics`}>
                  <Button variant="outline" className="w-full justify-start">
                    📊 View Analytics
                  </Button>
                </Link>
                <Link href={`/organizer/checkin?event=${event.id}`}>
                  <Button variant="outline" className="w-full justify-start">
                    ✓ Check-in Scanner
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="tickets" className="p-6 space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="font-semibold text-slate-900 dark:text-white">
              Ticket Types
            </h3>
            <Link href={`/organizer/events/${event.id}/tickets/new`}>
              <Button variant="default">
                Add Ticket Type
              </Button>
            </Link>
          </div>

          {ticketTypes.length === 0 ? (
            <p className="text-slate-600 dark:text-slate-400 text-center py-8">
              No ticket types yet. Create one to start selling tickets.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900 dark:text-white">
                      Name
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900 dark:text-white">
                      Price
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900 dark:text-white">
                      Quantity
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900 dark:text-white">
                      Sold
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900 dark:text-white">
                      Available
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900 dark:text-white">
                      Revenue
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900 dark:text-white">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                  {ticketTypes.map((ticketType) => (
                    <tr
                      key={ticketType.id}
                      className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                    >
                      <td className="px-4 py-3 text-sm text-slate-900 dark:text-white font-medium">
                        {ticketType.name}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-900 dark:text-white">
                        {formatCurrency(ticketType.price)}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-900 dark:text-white">
                        {ticketType.quantity}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-900 dark:text-white">
                        {ticketType.sold}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-900 dark:text-white">
                        {ticketType.quantity - ticketType.sold}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-900 dark:text-white font-medium">
                        {formatCurrency(ticketType.price * ticketType.sold)}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <div className="flex gap-2">
                          <Link
                            href={`/organizer/events/${event.id}/tickets/${ticketType.id}/edit`}
                          >
                            <Button size="sm" variant="outline">
                              Edit
                            </Button>
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </TabsContent>

        <TabsContent value="analytics" className="p-6 space-y-6">
          <p className="text-slate-600 dark:text-slate-400">
            Analytics dashboard coming soon. Visit the{' '}
            <Link href={`/organizer/events/${event.id}/analytics`} className="text-blue-600 hover:underline">
              full analytics page
            </Link>{' '}
            for detailed insights.
          </p>
        </TabsContent>
      </Tabs>
    </div>
  );
}

'use client';

import React, { useMemo, useState } from 'react';
import { useAuth } from '@/lib/hooks';
import { getEventsByOrganizerId } from '@/lib/dummy-data';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import type { TicketType } from '@/lib/types';

interface TicketTypeWithEvent extends TicketType {
  eventName: string;
  eventId: string;
}

/**
 * Organizer Ticket Management Page
 * Displays all ticket types across organizer's events
 */
export default function TicketManagementPage() {
  const { user } = useAuth();
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);

  // Get organizer's events
  const organizerEvents = useMemo(() => {
    if (!user) return [];
    return getEventsByOrganizerId(user.id);
  }, [user]);

  // Get ticket types for selected event or all events
  const ticketTypes = useMemo(() => {
    if (selectedEventId) {
      const event = organizerEvents.find((e) => e.id === selectedEventId);
      return (event?.ticketTypes || []).map((tt) => ({
        ...tt,
        eventName: event?.name || '',
        eventId: event?.id || '',
      })) as TicketTypeWithEvent[];
    }
    // Return all ticket types from all events
    return organizerEvents.flatMap((event) =>
      event.ticketTypes.map((tt) => ({
        ...tt,
        eventName: event.name,
        eventId: event.id,
      }))
    ) as TicketTypeWithEvent[];
  }, [organizerEvents, selectedEventId]);

  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  };

  // Calculate metrics
  const metrics = useMemo(() => {
    const totalTickets = ticketTypes.reduce((sum, tt) => sum + tt.quantity, 0);
    const totalSold = ticketTypes.reduce((sum, tt) => sum + tt.sold, 0);
    const totalRevenue = ticketTypes.reduce((sum, tt) => sum + tt.price * tt.sold, 0);
    const availableTickets = totalTickets - totalSold;

    return {
      totalTickets,
      totalSold,
      availableTickets,
      totalRevenue,
    };
  }, [ticketTypes]);

  return (
    <div className="space-y-8">
      {/* Page header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
          Ticket Management
        </h1>
        <p className="text-slate-600 dark:text-slate-400 mt-2">
          Manage ticket types across your events
        </p>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-slate-900 rounded-lg shadow-md p-6 border border-slate-200 dark:border-slate-800">
          <h3 className="text-sm font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wide">
            Total Tickets
          </h3>
          <p className="text-3xl font-bold text-slate-900 dark:text-white mt-2">
            {metrics.totalTickets}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
            Across all events
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
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
            Ready to sell
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-lg shadow-md p-6 border border-slate-200 dark:border-slate-800">
          <h3 className="text-sm font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wide">
            Revenue
          </h3>
          <p className="text-3xl font-bold text-slate-900 dark:text-white mt-2">
            {formatCurrency(metrics.totalRevenue)}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
            From ticket sales
          </p>
        </div>
      </div>

      {/* Filters and Actions */}
      <div className="bg-white dark:bg-slate-900 rounded-lg shadow-md p-6 border border-slate-200 dark:border-slate-800">
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          <div className="flex-1">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Filter by Event
            </label>
            <select
              value={selectedEventId || ''}
              onChange={(e) => setSelectedEventId(e.target.value || null)}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Events</option>
              {organizerEvents.map((event) => (
                <option key={event.id} value={event.id}>
                  {event.name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex gap-2">
            {selectedEventId && (
              <Link href={`/organizer/events/${selectedEventId}/tickets/new`}>
                <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                  Add Ticket Type
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Ticket Types Table */}
      <div className="bg-white dark:bg-slate-900 rounded-lg shadow-md border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="p-6 border-b border-slate-200 dark:border-slate-800">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            Ticket Types
          </h2>
        </div>

        {ticketTypes.length === 0 ? (
          <div className="p-6 text-center text-slate-500 dark:text-slate-400">
            <p>No ticket types found. Create an event first to add ticket types.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900 dark:text-white">
                    Event
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900 dark:text-white">
                    Ticket Type
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900 dark:text-white">
                    Price
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900 dark:text-white">
                    Quantity
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900 dark:text-white">
                    Sold
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900 dark:text-white">
                    Available
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900 dark:text-white">
                    Revenue
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900 dark:text-white">
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
                    <td className="px-6 py-4 text-sm text-slate-900 dark:text-white">
                      {ticketType.eventName}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-900 dark:text-white font-medium">
                      {ticketType.name}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-900 dark:text-white">
                      {formatCurrency(ticketType.price)}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-900 dark:text-white">
                      {ticketType.quantity}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-900 dark:text-white">
                      {ticketType.sold}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-900 dark:text-white">
                      {ticketType.quantity - ticketType.sold}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-900 dark:text-white font-medium">
                      {formatCurrency(ticketType.price * ticketType.sold)}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <div className="flex gap-2">
                        <Link
                          href={`/organizer/events/${ticketType.eventId}/tickets/${ticketType.id}/edit`}
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
      </div>
    </div>
  );
}

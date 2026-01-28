'use client';

import React, { useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import { getEventById, getAllOrders } from '@/lib/dummy-data';
import { Button } from '@/components/ui/button';

/**
 * Event Analytics Page for Organizers
 * Displays sales analytics and attendee information
 */
export default function EventAnalyticsPage() {
  const params = useParams();
  const eventId = params.id as string;
  const [dateRange, setDateRange] = useState<'week' | 'month' | 'all'>('all');

  // Get event details
  const event = useMemo(() => {
    return getEventById(eventId);
  }, [eventId]);

  // Get event orders
  const eventOrders = useMemo(() => {
    if (!event) return [];
    const allOrders = getAllOrders();
    return allOrders.filter((order) => order.eventId === event.id);
  }, [event]);

  // Calculate analytics
  const analytics = useMemo(() => {
    if (!event) return null;

    const ticketTypeStats = event.ticketTypes.map((tt) => ({
      name: tt.name,
      price: tt.price,
      quantity: tt.quantity,
      sold: tt.sold,
      revenue: tt.price * tt.sold,
      available: tt.quantity - tt.sold,
    }));

    const totalTickets = event.ticketTypes.reduce((sum, tt) => sum + tt.quantity, 0);
    const totalSold = event.ticketTypes.reduce((sum, tt) => sum + tt.sold, 0);
    const totalRevenue = event.ticketTypes.reduce((sum, tt) => sum + tt.price * tt.sold, 0);
    const avgTicketPrice = totalSold > 0 ? totalRevenue / totalSold : 0;

    return {
      ticketTypeStats,
      totalTickets,
      totalSold,
      totalRevenue,
      avgTicketPrice,
      totalOrders: eventOrders.length,
      conversionRate: totalTickets > 0 ? (totalSold / totalTickets) * 100 : 0,
    };
  }, [event, eventOrders]);

  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  };

  // Export attendees as CSV
  const handleExportAttendees = () => {
    if (!event) return;

    const headers = ['Name', 'Email', 'Ticket Type', 'Purchase Date', 'QR Code'];
    const rows = eventOrders.flatMap((order) =>
      order.tickets.map((ticket) => {
        const ticketType = event.ticketTypes.find(
          (tt) => tt.id === ticket.ticketTypeId
        );
        return [
          'Customer Name', // Placeholder - would need customer data
          'customer@example.com', // Placeholder
          ticketType?.name || 'Unknown',
          new Date(order.createdAt).toLocaleDateString(),
          ticket.qrCode,
        ];
      })
    );

    const csv = [headers, ...rows].map((row) => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${event.name}-attendees.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (!event || !analytics) {
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
            Analytics: {event.name}
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-2">
            Sales and attendance insights
          </p>
        </div>
        <Button
          onClick={handleExportAttendees}
          className="bg-green-600 hover:bg-green-700 text-white"
        >
          📥 Export Attendees
        </Button>
      </div>

      {/* Date Range Filter */}
      <div className="bg-white dark:bg-slate-900 rounded-lg shadow-md p-6 border border-slate-200 dark:border-slate-800">
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
          Date Range
        </label>
        <div className="flex gap-2">
          {(['week', 'month', 'all'] as const).map((range) => (
            <button
              key={range}
              onClick={() => setDateRange(range)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                dateRange === range
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {range === 'week' ? 'Last 7 Days' : range === 'month' ? 'Last 30 Days' : 'All Time'}
            </button>
          ))}
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <div className="bg-white dark:bg-slate-900 rounded-lg shadow-md p-6 border border-slate-200 dark:border-slate-800">
          <h3 className="text-sm font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wide">
            Total Revenue
          </h3>
          <p className="text-3xl font-bold text-slate-900 dark:text-white mt-2">
            {formatCurrency(analytics.totalRevenue)}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
            From {analytics.totalSold} tickets
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-lg shadow-md p-6 border border-slate-200 dark:border-slate-800">
          <h3 className="text-sm font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wide">
            Tickets Sold
          </h3>
          <p className="text-3xl font-bold text-slate-900 dark:text-white mt-2">
            {analytics.totalSold}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
            {analytics.conversionRate.toFixed(1)}% conversion
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-lg shadow-md p-6 border border-slate-200 dark:border-slate-800">
          <h3 className="text-sm font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wide">
            Avg Ticket Price
          </h3>
          <p className="text-3xl font-bold text-slate-900 dark:text-white mt-2">
            {formatCurrency(analytics.avgTicketPrice)}
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-lg shadow-md p-6 border border-slate-200 dark:border-slate-800">
          <h3 className="text-sm font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wide">
            Total Orders
          </h3>
          <p className="text-3xl font-bold text-slate-900 dark:text-white mt-2">
            {analytics.totalOrders}
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-lg shadow-md p-6 border border-slate-200 dark:border-slate-800">
          <h3 className="text-sm font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wide">
            Availability
          </h3>
          <p className="text-3xl font-bold text-slate-900 dark:text-white mt-2">
            {analytics.totalTickets - analytics.totalSold}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
            of {analytics.totalTickets} tickets
          </p>
        </div>
      </div>

      {/* Ticket Type Distribution */}
      <div className="bg-white dark:bg-slate-900 rounded-lg shadow-md border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="p-6 border-b border-slate-200 dark:border-slate-800">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            Sales by Ticket Type
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
              <tr>
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
                  % of Total
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
              {analytics.ticketTypeStats.map((stat) => (
                <tr
                  key={stat.name}
                  className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                >
                  <td className="px-6 py-4 text-sm text-slate-900 dark:text-white font-medium">
                    {stat.name}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-900 dark:text-white">
                    {formatCurrency(stat.price)}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-900 dark:text-white">
                    {stat.quantity}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-900 dark:text-white">
                    {stat.sold}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-900 dark:text-white">
                    {stat.available}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-900 dark:text-white font-medium">
                    {formatCurrency(stat.revenue)}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-900 dark:text-white">
                    {analytics.totalRevenue > 0
                      ? ((stat.revenue / analytics.totalRevenue) * 100).toFixed(1)
                      : 0}
                    %
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-white dark:bg-slate-900 rounded-lg shadow-md border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="p-6 border-b border-slate-200 dark:border-slate-800">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            Recent Orders
          </h2>
        </div>

        {eventOrders.length === 0 ? (
          <div className="p-6 text-center text-slate-500 dark:text-slate-400">
            <p>No orders yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900 dark:text-white">
                    Order ID
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900 dark:text-white">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900 dark:text-white">
                    Tickets
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900 dark:text-white">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900 dark:text-white">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                {eventOrders.slice(0, 10).map((order) => (
                  <tr
                    key={order.id}
                    className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                  >
                    <td className="px-6 py-4 text-sm text-slate-900 dark:text-white font-medium">
                      {order.id}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-900 dark:text-white">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-900 dark:text-white">
                      {order.tickets.length}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-900 dark:text-white font-medium">
                      {formatCurrency(order.totalAmount)}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          order.status === 'completed'
                            ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400'
                            : order.status === 'pending'
                            ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400'
                            : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400'
                        }`}
                      >
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </span>
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

'use client';

import { useMemo, useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useAuth } from '@/modules/authentication/context/AuthContext';
import {
  getMyEvents,
  getTicketsByEventId,
  getEventTicketTypes,
  type Event,
  type Ticket,
} from '@/modules/shared-common/services/apiService';
import { Card } from '@/modules/shared-common/components/ui/card';
import { Button } from '@/modules/shared-common/components/ui/button';
import {
  TrendingUp,
  Ticket as TicketIcon,
  Calendar,
  Users,
  BarChart3,
  PieChart,
  ArrowUpRight,
  Download,
  RefreshCw,
  AlertCircle,
} from 'lucide-react';

export default function OrganizerAnalyticsPage() {
  const { user } = useAuth();
  const [dateRange, setDateRange] = useState<'week' | 'month' | 'year' | 'all'>('all');
  const [organizerEvents, setOrganizerEvents] = useState<Event[]>([]);
  const [organizerTickets, setOrganizerTickets] = useState<Ticket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const rawEvents = await getMyEvents();

      // Enrich events with ticket type data (my-events doesn't embed sold counts)
      const enrichedEvents = await Promise.all(
        rawEvents.map(async (event) => {
          const ticketTypes = await getEventTicketTypes(event.id).catch(() => event.ticketTypes || []);
          return { ...event, ticketTypes };
        })
      );
      setOrganizerEvents(enrichedEvents);

      // Fetch tickets for all organizer events in parallel to derive order data
      if (enrichedEvents.length > 0) {
        const ticketArrays = await Promise.all(
          enrichedEvents.map((e) => getTicketsByEventId(e.id).catch(() => [] as Ticket[]))
        );
        setOrganizerTickets(ticketArrays.flat());
      } else {
        setOrganizerTickets([]);
      }
    } catch (err) {
      console.error('Failed to fetch analytics data:', err);
      setError('Failed to load analytics data');
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const analytics = useMemo(() => {
    // Revenue by event — computed from ticketType price × sold (accurate, no orders needed)
    const revenueByEvent = organizerEvents
      .map((event) => {
        const eventRevenue = (event.ticketTypes || []).reduce(
          (sum, tt) => sum + ((tt.price || 0) * (tt.sold || 0)),
          0
        );
        const ticketsSold = (event.ticketTypes || []).reduce(
          (sum, tt) => sum + (tt.sold || 0),
          0
        );
        return {
          id: event.id,
          name: event.title || event.name,
          revenue: eventRevenue,
          ticketsSold,
          date: event.startDate || event.date,
          status: event.status,
        };
      })
      .sort((a, b) => b.revenue - a.revenue);

    // Totals from ticketType aggregates (not from orders)
    const totalRevenue = revenueByEvent.reduce((sum, e) => sum + e.revenue, 0);
    const totalTicketsSold = organizerEvents.reduce(
      (sum, e) => sum + (e.ticketTypes || []).reduce((s, tt) => s + (tt.sold || 0), 0),
      0
    );
    const totalCapacity = organizerEvents.reduce(
      (sum, e) => sum + (e.ticketTypes || []).reduce((s, tt) => s + (tt.quantity || 0), 0),
      0
    );
    const avgTicketPrice = totalTicketsSold > 0 ? totalRevenue / totalTicketsSold : 0;
    const conversionRate = totalCapacity > 0 ? (totalTicketsSold / totalCapacity) * 100 : 0;

    // Ticket type breakdown
    const ticketTypeBreakdown = organizerEvents.reduce(
      (acc, event) => {
        (event.ticketTypes || []).forEach((tt) => {
          const typeName = tt.type || tt.name || 'General';
          if (!acc[typeName]) {
            acc[typeName] = { sold: 0, revenue: 0 };
          }
          acc[typeName].sold += tt.sold || 0;
          acc[typeName].revenue += (tt.price || 0) * (tt.sold || 0);
        });
        return acc;
      },
      {} as Record<string, { sold: number; revenue: number }>
    );

    // Total orders = unique orderIds across all tickets
    const uniqueOrderIds = new Set(organizerTickets.map((t) => t.orderId).filter(Boolean));
    const totalOrders = uniqueOrderIds.size;

    // Recent orders — derived from tickets grouped by orderId
    const orderGroups = new Map<string, Ticket[]>();
    for (const ticket of organizerTickets) {
      if (!ticket.orderId) continue;
      if (!orderGroups.has(ticket.orderId)) {
        orderGroups.set(ticket.orderId, []);
      }
      orderGroups.get(ticket.orderId)!.push(ticket);
    }
    const recentOrders = Array.from(orderGroups.entries())
      .slice(0, 5)
      .map(([orderId, tickets]) => {
        const firstTicket = tickets[0];
        const event = organizerEvents.find((e) => e.id === firstTicket.eventId);
        // Look up price by ticketTypeName (backend returns name, not ID in ticket response)
        const amount = tickets.reduce((sum, t) => {
          const tt = (event?.ticketTypes || []).find(
            (tt) => tt.name === t.ticketTypeName || tt.id === t.ticketTypeId
          );
          return sum + (tt?.price || 0);
        }, 0);
        return {
          id: orderId,
          customerName: firstTicket.attendeeName || 'Customer',
          eventName: event?.title || event?.name || firstTicket.eventTitle || 'Unknown Event',
          eventId: firstTicket.eventId,
          createdAt: firstTicket.createdAt || '',
          totalAmount: amount,
          status: firstTicket.status || 'CONFIRMED',
        };
      });

    // Orders by status
    const ordersByStatus = recentOrders.reduce(
      (acc, order) => {
        const status = (order.status || 'unknown').toLowerCase();
        acc[status] = (acc[status] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    return {
      totalRevenue,
      totalTicketsSold,
      totalCapacity,
      avgTicketPrice,
      conversionRate,
      totalEvents: organizerEvents.length,
      activeEvents: organizerEvents.filter((e) =>
        ['active', 'published'].includes((e.status || '').toLowerCase())
      ).length,
      totalOrders,
      revenueByEvent,
      ticketTypeBreakdown,
      recentOrders,
      ordersByStatus,
    };
  }, [organizerEvents, organizerTickets]);

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);

  const formatDate = (date: Date | string) =>
    new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });

  // Export analytics as CSV
  const handleExportAnalytics = () => {
    const headers = [
      'Event Name',
      'Revenue',
      'Tickets Sold',
      'Date',
      'Status',
    ];
    const rows = analytics.revenueByEvent.map((event) => [
      `"${event.name || ''}"`,
      event.revenue.toFixed(2),
      event.ticketsSold.toString(),
      formatDate(event.date),
      event.status,
    ]);

    const csv = [headers, ...rows].map((row) => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'analytics-report.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const getStatusBadge = (status: string) => {
    const s = (status || '').toLowerCase();
    const styles: Record<string, string> = {
      completed: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
      confirmed: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
      pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
      cancelled: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
      refunded: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
      failed: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
    };
    return styles[s] || 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300';
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <div className="h-8 w-32 bg-slate-200 dark:bg-slate-700 rounded-lg animate-pulse" />
          <div className="h-5 w-56 bg-slate-200 dark:bg-slate-700 rounded-lg animate-pulse mt-2" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 animate-pulse">
              <div className="h-4 w-24 bg-slate-200 dark:bg-slate-700 rounded" />
              <div className="h-8 w-20 bg-slate-200 dark:bg-slate-700 rounded mt-2" />
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 animate-pulse h-64" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center bg-red-50 dark:bg-red-900/10 p-8 rounded-2xl border border-red-200 dark:border-red-800 max-w-md">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-red-600 text-xl font-bold mb-2">Error</h2>
          <p className="text-red-500 mb-6">{error}</p>
          <button
            onClick={fetchData}
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-medium inline-flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" /> Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Analytics</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Track your sales and performance
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={fetchData}
            className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors text-sm text-slate-700 dark:text-slate-300"
          >
            <RefreshCw className="w-4 h-4" /> Refresh
          </button>
          <Button
            onClick={handleExportAnalytics}
            className="bg-violet-600 hover:bg-violet-700 text-white"
          >
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Date Range Filter */}
      <div className="flex flex-wrap items-center gap-1 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-2">
        {(['week', 'month', 'year', 'all'] as const).map((range) => (
          <button
            key={range}
            onClick={() => setDateRange(range)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              dateRange === range
                ? 'bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white shadow-lg'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            {range === 'week'
              ? '7 Days'
              : range === 'month'
              ? '30 Days'
              : range === 'year'
              ? '12 Months'
              : 'All Time'}
          </button>
        ))}
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-6 bg-gradient-to-br from-violet-500 to-fuchsia-500 border-0">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-white/80">Total Revenue</p>
              <p className="text-3xl font-bold text-white mt-1">
                {formatCurrency(analytics.totalRevenue)}
              </p>
            </div>
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                Tickets Sold
              </p>
              <p className="text-3xl font-bold text-slate-900 dark:text-white mt-1">
                {analytics.totalTicketsSold}
              </p>
            </div>
            <div className="w-12 h-12 bg-violet-100 dark:bg-violet-900/30 rounded-xl flex items-center justify-center">
              <TicketIcon className="w-6 h-6 text-violet-600 dark:text-violet-400" />
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                Avg Ticket Price
              </p>
              <p className="text-3xl font-bold text-slate-900 dark:text-white mt-1">
                {formatCurrency(analytics.avgTicketPrice)}
              </p>
            </div>
            <div className="w-12 h-12 bg-fuchsia-100 dark:bg-fuchsia-900/30 rounded-xl flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-fuchsia-600 dark:text-fuchsia-400" />
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                Conversion Rate
              </p>
              <p className="text-3xl font-bold text-slate-900 dark:text-white mt-1">
                {analytics.conversionRate.toFixed(1)}%
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center">
              <Users className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </Card>
      </div>

      {/* Secondary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-5 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
              <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Total Events
              </p>
              <p className="text-xl font-bold text-slate-900 dark:text-white">
                {analytics.totalEvents}
              </p>
            </div>
          </div>
        </Card>
        <Card className="p-5 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Active Events
              </p>
              <p className="text-xl font-bold text-slate-900 dark:text-white">
                {analytics.activeEvents}
              </p>
            </div>
          </div>
        </Card>
        <Card className="p-5 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
              <PieChart className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Total Orders
              </p>
              <p className="text-xl font-bold text-slate-900 dark:text-white">
                {analytics.totalOrders}
              </p>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue by Event */}
        <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 overflow-hidden">
          <div className="p-6 border-b border-slate-200 dark:border-slate-800">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Revenue by Event
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Top performing events
            </p>
          </div>
          <div className="divide-y divide-slate-200 dark:divide-slate-800">
            {analytics.revenueByEvent.length === 0 ? (
              <div className="p-6 text-center text-slate-500 dark:text-slate-400">
                No events yet
              </div>
            ) : (
              analytics.revenueByEvent.slice(0, 5).map((event, index) => (
                <div
                  key={event.id}
                  className="p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold ${
                          index === 0
                            ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400'
                            : index === 1
                            ? 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
                            : index === 2
                            ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400'
                            : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
                        }`}
                      >
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium text-slate-900 dark:text-white">
                          {event.name}
                        </p>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                          {event.ticketsSold} tickets sold
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-slate-900 dark:text-white">
                        {formatCurrency(event.revenue)}
                      </p>
                      <Link
                        href={`/organizer/events/${event.id}/analytics`}
                      >
                        <span className="text-sm text-violet-600 dark:text-violet-400 hover:underline flex items-center gap-1 justify-end">
                          Details <ArrowUpRight className="w-3 h-3" />
                        </span>
                      </Link>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>

        {/* Ticket Type Breakdown */}
        <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 overflow-hidden">
          <div className="p-6 border-b border-slate-200 dark:border-slate-800">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Ticket Type Breakdown
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Sales by ticket category
            </p>
          </div>
          <div className="p-6">
            {Object.keys(analytics.ticketTypeBreakdown).length === 0 ? (
              <div className="text-center text-slate-500 dark:text-slate-400">
                No ticket data yet
              </div>
            ) : (
              <div className="space-y-4">
                {Object.entries(analytics.ticketTypeBreakdown).map(
                  ([type, data]) => {
                    const percentage =
                      analytics.totalRevenue > 0
                        ? (data.revenue / analytics.totalRevenue) * 100
                        : 0;
                    return (
                      <div key={type}>
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-slate-900 dark:text-white capitalize">
                            {type}
                          </span>
                          <span className="text-sm text-slate-500 dark:text-slate-400">
                            {formatCurrency(data.revenue)} ({data.sold} sold)
                          </span>
                        </div>
                        <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-3">
                          <div
                            className={`h-3 rounded-full ${
                              type.toLowerCase().includes('vip')
                                ? 'bg-gradient-to-r from-yellow-400 to-orange-500'
                                : type.toLowerCase().includes('early')
                                ? 'bg-gradient-to-r from-green-400 to-emerald-500'
                                : 'bg-gradient-to-r from-violet-500 to-fuchsia-500'
                            }`}
                            style={{
                              width: `${Math.min(percentage, 100)}%`,
                            }}
                          />
                        </div>
                      </div>
                    );
                  }
                )}
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Recent Orders */}
      <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="p-6 border-b border-slate-200 dark:border-slate-800">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            Recent Orders
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Latest ticket purchases
          </p>
        </div>
        {analytics.recentOrders.length === 0 ? (
          <div className="p-6 text-center text-slate-500 dark:text-slate-400">
            No orders yet
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 dark:bg-slate-800/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Order ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Event
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {analytics.recentOrders.map((order) => (
                  <tr
                    key={order.id}
                    className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                  >
                    <td className="px-6 py-4 text-sm font-medium text-slate-900 dark:text-white">
                      {order.id.length > 12
                        ? order.id.slice(0, 12) + '...'
                        : order.id}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">
                      {order.customerName || 'Unknown'}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">
                      {order.eventName || 'Unknown Event'}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400">
                      {order.createdAt ? formatDate(order.createdAt) : '—'}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-slate-900 dark:text-white">
                      {formatCurrency(order.totalAmount || 0)}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(order.status)}`}
                      >
                        {(order.status || 'unknown')
                          .charAt(0)
                          .toUpperCase() +
                          (order.status || 'unknown').slice(1).toLowerCase()}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}

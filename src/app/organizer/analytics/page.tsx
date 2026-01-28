'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/context/AuthContext';
import { getAllEvents, getAllOrders } from '@/lib/dummy-data';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Ticket, 
  Calendar, 
  Users,
  BarChart3,
  PieChart,
  ArrowUpRight,
  Download
} from 'lucide-react';

export default function OrganizerAnalyticsPage() {
  const { user } = useAuth();
  const [dateRange, setDateRange] = useState<'week' | 'month' | 'year' | 'all'>('all');

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

  // Calculate comprehensive analytics
  const analytics = useMemo(() => {
    const totalRevenue = organizerOrders.reduce((sum, o) => sum + o.totalAmount, 0);
    const totalTicketsSold = organizerEvents.reduce((sum, e) => sum + e.totalAttendees, 0);
    const totalCapacity = organizerEvents.reduce((sum, e) => 
      sum + e.ticketTypes.reduce((s, tt) => s + tt.quantity, 0), 0);
    const avgTicketPrice = totalTicketsSold > 0 ? totalRevenue / totalTicketsSold : 0;
    const conversionRate = totalCapacity > 0 ? (totalTicketsSold / totalCapacity) * 100 : 0;

    // Revenue by event
    const revenueByEvent = organizerEvents.map(event => {
      const eventRevenue = event.ticketTypes.reduce((sum, tt) => sum + (tt.price * tt.sold), 0);
      const ticketsSold = event.ticketTypes.reduce((sum, tt) => sum + tt.sold, 0);
      return {
        id: event.id,
        name: event.name,
        revenue: eventRevenue,
        ticketsSold,
        date: event.date,
        status: event.status,
      };
    }).sort((a, b) => b.revenue - a.revenue);

    // Ticket type breakdown
    const ticketTypeBreakdown = organizerEvents.reduce((acc, event) => {
      event.ticketTypes.forEach(tt => {
        const typeName = tt.type || tt.name;
        if (!acc[typeName]) {
          acc[typeName] = { sold: 0, revenue: 0 };
        }
        acc[typeName].sold += tt.sold;
        acc[typeName].revenue += tt.price * tt.sold;
      });
      return acc;
    }, {} as Record<string, { sold: number; revenue: number }>);

    // Recent orders
    const recentOrders = [...organizerOrders]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5);

    return {
      totalRevenue,
      totalTicketsSold,
      totalCapacity,
      avgTicketPrice,
      conversionRate,
      totalEvents: organizerEvents.length,
      activeEvents: organizerEvents.filter(e => e.status === 'active').length,
      totalOrders: organizerOrders.length,
      revenueByEvent,
      ticketTypeBreakdown,
      recentOrders,
    };
  }, [organizerEvents, organizerOrders]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  // Export analytics as CSV
  const handleExportAnalytics = () => {
    const headers = ['Event Name', 'Revenue', 'Tickets Sold', 'Date', 'Status'];
    const rows = analytics.revenueByEvent.map(event => [
      event.name,
      event.revenue.toFixed(2),
      event.ticketsSold.toString(),
      formatDate(event.date),
      event.status,
    ]);

    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'analytics-report.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Analytics</h1>
          <p className="text-gray-600 dark:text-gray-300 mt-1">Track your sales and performance</p>
        </div>
        <Button 
          onClick={handleExportAnalytics}
          className="bg-violet-600 hover:bg-violet-700 text-white"
        >
          <Download className="w-4 h-4 mr-2" />
          Export Report
        </Button>
      </div>

      {/* Date Range Filter */}
      <Card className="p-4 bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300 mr-2">Period:</span>
          {(['week', 'month', 'year', 'all'] as const).map((range) => (
            <button
              key={range}
              onClick={() => setDateRange(range)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                dateRange === range
                  ? 'bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white shadow-lg'
                  : 'bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-600'
              }`}
            >
              {range === 'week' ? '7 Days' : range === 'month' ? '30 Days' : range === 'year' ? '12 Months' : 'All Time'}
            </button>
          ))}
        </div>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-6 bg-gradient-to-br from-violet-500 to-fuchsia-500 border-0">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-white/80">Total Revenue</p>
              <p className="text-3xl font-bold text-white mt-1">{formatCurrency(analytics.totalRevenue)}</p>
              <div className="flex items-center gap-1 mt-2">
                <TrendingUp className="w-4 h-4 text-green-300" />
                <span className="text-sm text-white/80">+12.5% from last period</span>
              </div>
            </div>
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-white" />
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Tickets Sold</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{analytics.totalTicketsSold}</p>
              <div className="flex items-center gap-1 mt-2">
                <TrendingUp className="w-4 h-4 text-green-500" />
                <span className="text-sm text-gray-500 dark:text-gray-400">+8.2% from last period</span>
              </div>
            </div>
            <div className="w-12 h-12 bg-violet-100 dark:bg-violet-900/30 rounded-xl flex items-center justify-center">
              <Ticket className="w-6 h-6 text-violet-600 dark:text-violet-400" />
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Avg Ticket Price</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{formatCurrency(analytics.avgTicketPrice)}</p>
              <div className="flex items-center gap-1 mt-2">
                <TrendingDown className="w-4 h-4 text-red-500" />
                <span className="text-sm text-gray-500 dark:text-gray-400">-2.1% from last period</span>
              </div>
            </div>
            <div className="w-12 h-12 bg-fuchsia-100 dark:bg-fuchsia-900/30 rounded-xl flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-fuchsia-600 dark:text-fuchsia-400" />
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Conversion Rate</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{analytics.conversionRate.toFixed(1)}%</p>
              <div className="flex items-center gap-1 mt-2">
                <TrendingUp className="w-4 h-4 text-green-500" />
                <span className="text-sm text-gray-500 dark:text-gray-400">+5.3% from last period</span>
              </div>
            </div>
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center">
              <Users className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </Card>
      </div>

      {/* Secondary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-5 bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
              <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Events</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">{analytics.totalEvents}</p>
            </div>
          </div>
        </Card>
        <Card className="p-5 bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
              <Calendar className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Active Events</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">{analytics.activeEvents}</p>
            </div>
          </div>
        </Card>
        <Card className="p-5 bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
              <PieChart className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Orders</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">{analytics.totalOrders}</p>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue by Event */}
        <Card className="bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 overflow-hidden">
          <div className="p-6 border-b border-gray-200 dark:border-slate-700">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Revenue by Event</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Top performing events</p>
          </div>
          <div className="divide-y divide-gray-200 dark:divide-slate-700">
            {analytics.revenueByEvent.length === 0 ? (
              <div className="p-6 text-center text-gray-500 dark:text-gray-400">
                No events yet
              </div>
            ) : (
              analytics.revenueByEvent.slice(0, 5).map((event, index) => (
                <div key={event.id} className="p-4 hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold ${
                        index === 0 ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400' :
                        index === 1 ? 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400' :
                        index === 2 ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400' :
                        'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                      }`}>
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{event.name}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{event.ticketsSold} tickets sold</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-900 dark:text-white">{formatCurrency(event.revenue)}</p>
                      <Link href={`/organizer/events/${event.id}/analytics`}>
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
        <Card className="bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 overflow-hidden">
          <div className="p-6 border-b border-gray-200 dark:border-slate-700">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Ticket Type Breakdown</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Sales by ticket category</p>
          </div>
          <div className="p-6">
            {Object.keys(analytics.ticketTypeBreakdown).length === 0 ? (
              <div className="text-center text-gray-500 dark:text-gray-400">
                No ticket data yet
              </div>
            ) : (
              <div className="space-y-4">
                {Object.entries(analytics.ticketTypeBreakdown).map(([type, data]) => {
                  const percentage = analytics.totalRevenue > 0 
                    ? (data.revenue / analytics.totalRevenue) * 100 
                    : 0;
                  return (
                    <div key={type}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-gray-900 dark:text-white capitalize">{type}</span>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {formatCurrency(data.revenue)} ({data.sold} sold)
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-3">
                        <div 
                          className={`h-3 rounded-full ${
                            type.includes('vip') ? 'bg-gradient-to-r from-yellow-400 to-orange-500' :
                            type.includes('early') ? 'bg-gradient-to-r from-green-400 to-emerald-500' :
                            'bg-gradient-to-r from-violet-500 to-fuchsia-500'
                          }`}
                          style={{ width: `${Math.min(percentage, 100)}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Recent Orders */}
      <Card className="bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 overflow-hidden">
        <div className="p-6 border-b border-gray-200 dark:border-slate-700 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Recent Orders</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Latest ticket purchases</p>
          </div>
        </div>
        {analytics.recentOrders.length === 0 ? (
          <div className="p-6 text-center text-gray-500 dark:text-gray-400">
            No orders yet
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-slate-700/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Order ID</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Tickets</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
                {analytics.recentOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">{order.id}</td>
                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">{formatDate(order.createdAt)}</td>
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">{order.tickets.length}</td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">{formatCurrency(order.totalAmount)}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        order.status === 'completed' 
                          ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                          : order.status === 'pending'
                          ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400'
                          : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                      }`}>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
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

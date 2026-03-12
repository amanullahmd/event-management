'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useAuth } from '@/modules/authentication/context/AuthContext';
import { apiRequest } from '@/modules/shared-common/utils/api';
import { getEventById } from '@/modules/shared-common/services/apiService';
import type { Event as EventType } from '@/modules/shared-common/services/apiService';
import {
  Ticket,
  Calendar,
  CreditCard,
  User,
  Search,
  CheckCircle,
  AlertCircle,
  Clock,
  DollarSign,
  RefreshCw
} from 'lucide-react';

/** Matches OrderResponse from GET /orders */
interface OrderResponse {
  id: string;
  eventId: string;
  userId: string;
  totalAmountCents: number;
  totalAmount?: number;
  status: string;
  createdAt: string;
  items: OrderItemResponse[];
}

interface OrderItemResponse {
  id: string;
  ticketTypeId: string;
  quantity: number;
  unitPrice: number;
}

/** Matches TicketResponse from GET /tickets */
interface TicketResponse {
  id: string;
  eventId: string;
  orderId: string;
  ticketTypeId: string;
  qrCode: string;
  checkedIn: boolean;
  checkedInAt?: string;
  status: string;
}

/** Paginated response wrapper from Spring Boot */
interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

/**
 * Modern Customer Dashboard with real API data
 * Fetches orders from GET /orders and tickets from GET /tickets
 * Backend auto-filters by JWT — no user ID needed
 */
export default function ModernCustomerDashboard() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<OrderResponse[]>([]);
  const [tickets, setTickets] = useState<TicketResponse[]>([]);
  const [eventNames, setEventNames] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [ordersData, ticketsData] = await Promise.all([
        apiRequest<PageResponse<OrderResponse> | OrderResponse[]>('/orders'),
        apiRequest<TicketResponse[]>('/tickets'),
      ]);

      // Handle paginated or array response for orders
      const allOrders = Array.isArray(ordersData)
        ? ordersData
        : (ordersData as PageResponse<OrderResponse>).content || [];
      const allTickets = ticketsData || [];

      setOrders(allOrders);
      setTickets(allTickets);

      // Fetch event names for all unique eventIds
      const uniqueEventIds = [...new Set([
        ...allOrders.map((o) => o.eventId),
        ...allTickets.map((t) => t.eventId),
      ].filter(Boolean))];

      const names: Record<string, string> = {};
      await Promise.allSettled(
        uniqueEventIds.map(async (eventId) => {
          try {
            const event = await getEventById(eventId);
            if (event) {
              names[eventId] = event.title || event.name || `Event #${eventId.slice(0, 8)}`;
            }
          } catch { /* skip */ }
        })
      );
      setEventNames(names);
      setLastRefresh(new Date());
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err);
      setError('Failed to load dashboard data. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Computed stats from real data
  const totalOrders = orders.length;
  const totalTickets = tickets.length;
  const totalSpent = orders.reduce((sum, order) => sum + ((order.totalAmountCents || order.totalAmount || 0) / (order.totalAmountCents ? 100 : 1)), 0);
  const upcomingEventsCount = tickets.filter(
    (t) => t.status === 'ACTIVE' || t.status === 'active' || t.status === 'valid'
  ).length;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  };

  const getStatusColor = (status: string) => {
    const s = status?.toLowerCase();
    switch (s) {
      case 'completed':
      case 'confirmed':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'cancelled':
      case 'refunded':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  const getStatusIcon = (status: string) => {
    const s = status?.toLowerCase();
    switch (s) {
      case 'completed':
      case 'confirmed':
        return <CheckCircle className="w-4 h-4" />;
      case 'pending':
        return <Clock className="w-4 h-4" />;
      case 'cancelled':
      case 'refunded':
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  const getTicketCountForOrder = (order: OrderResponse): number => {
    if (order.items && order.items.length > 0) {
      return order.items.reduce((sum, item) => sum + (item.quantity || 0), 0);
    }
    // Fallback: count tickets matching this order
    return tickets.filter((t) => t.orderId === order.id).length;
  };

  if (loading) {
    return (
      <div className="space-y-8">
        {/* Header skeleton */}
        <div className="rounded-3xl p-8 bg-slate-200 dark:bg-slate-700 animate-pulse">
          <div className="h-10 w-64 bg-slate-300 dark:bg-slate-600 rounded-lg" />
          <div className="h-5 w-96 bg-slate-300 dark:bg-slate-600 rounded-lg mt-3" />
        </div>

        {/* Metric card grid skeleton — matches 4-column layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="rounded-2xl p-6 shadow-xl bg-slate-200 dark:bg-slate-700 animate-pulse">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-slate-300 dark:bg-slate-600 rounded-lg" />
              </div>
              <div className="space-y-2">
                <div className="h-8 w-24 bg-slate-300 dark:bg-slate-600 rounded" />
                <div className="h-4 w-32 bg-slate-300 dark:bg-slate-600 rounded" />
                <div className="h-3 w-20 bg-slate-300 dark:bg-slate-600 rounded" />
              </div>
            </div>
          ))}
        </div>

        {/* Orders list skeleton */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-800 p-6">
          <div className="h-6 w-40 bg-slate-200 dark:bg-slate-700 rounded animate-pulse mb-4" />
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex items-center gap-4 py-4">
              <div className="w-12 h-12 bg-slate-200 dark:bg-slate-700 rounded-lg animate-pulse" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-48 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
                <div className="h-3 w-64 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
              </div>
              <div className="space-y-2">
                <div className="h-5 w-20 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
                <div className="h-3 w-16 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center bg-red-50 dark:bg-red-900/10 p-8 rounded-2xl border border-red-200 dark:border-red-800 max-w-md">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
          </div>
          <h2 className="text-red-600 dark:text-red-400 text-xl font-bold mb-2">Dashboard Error</h2>
          <p className="text-red-500 dark:text-red-400 mb-6">{error}</p>
          <button
            onClick={fetchData}
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200 inline-flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-3xl p-8 text-white shadow-2xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2">
              Welcome back, {user?.name?.split(' ')[0] || 'Guest'}! 👋
            </h1>
            <p className="text-indigo-100 text-lg">
              Your personalized event hub — manage tickets, discover events, and track your experiences
            </p>
            <p className="text-sm text-indigo-200 mt-2">
              Last updated: {lastRefresh.toLocaleTimeString()}
            </p>
          </div>
          <div className="hidden md:flex items-center gap-3">
            <button
              onClick={fetchData}
              className="flex items-center gap-2 px-4 py-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors duration-200 backdrop-blur-sm"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
            <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
              <User className="w-12 h-12" />
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Orders */}
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 text-white shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-white/20 rounded-lg backdrop-blur-sm">
              <CreditCard className="w-6 h-6" />
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-3xl font-bold">{totalOrders}</p>
            <p className="text-green-100">Total Orders</p>
            <p className="text-sm text-green-200">Successfully placed</p>
          </div>
        </div>

        {/* Total Tickets */}
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-white/20 rounded-lg backdrop-blur-sm">
              <Ticket className="w-6 h-6" />
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-3xl font-bold">{totalTickets}</p>
            <p className="text-blue-100">Total Tickets</p>
            <p className="text-sm text-blue-200">In your collection</p>
          </div>
        </div>

        {/* Upcoming Events */}
        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-6 text-white shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-white/20 rounded-lg backdrop-blur-sm">
              <Calendar className="w-6 h-6" />
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-3xl font-bold">{upcomingEventsCount}</p>
            <p className="text-orange-100">Upcoming Events</p>
            <p className="text-sm text-orange-200">Get ready to go!</p>
          </div>
        </div>

        {/* Total Spent */}
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 text-white shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-white/20 rounded-lg backdrop-blur-sm">
              <DollarSign className="w-6 h-6" />
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-3xl font-bold">{formatCurrency(totalSpent)}</p>
            <p className="text-purple-100">Total Spent</p>
            <p className="text-sm text-purple-200">On amazing events</p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-800 p-6">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">
          Quick Actions
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link href="/events" className="group">
            <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-900/20 dark:to-indigo-800/20 rounded-xl p-4 border border-indigo-200 dark:border-indigo-800 hover:shadow-lg transition-all duration-200 group-hover:scale-105">
              <Search className="w-6 h-6 text-indigo-600 dark:text-indigo-400 mb-2" />
              <p className="font-medium text-slate-900 dark:text-white">Browse Events</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Discover new experiences</p>
            </div>
          </Link>
          <Link href="/dashboard/tickets" className="group">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl p-4 border border-blue-200 dark:border-blue-800 hover:shadow-lg transition-all duration-200 group-hover:scale-105">
              <Ticket className="w-6 h-6 text-blue-600 dark:text-blue-400 mb-2" />
              <p className="font-medium text-slate-900 dark:text-white">My Tickets</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">View all tickets</p>
            </div>
          </Link>
          <Link href="/dashboard/orders" className="group">
            <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-xl p-4 border border-green-200 dark:border-green-800 hover:shadow-lg transition-all duration-200 group-hover:scale-105">
              <CreditCard className="w-6 h-6 text-green-600 dark:text-green-400 mb-2" />
              <p className="font-medium text-slate-900 dark:text-white">Order History</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Track purchases</p>
            </div>
          </Link>
          <Link href="/dashboard/profile" className="group">
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-xl p-4 border border-purple-200 dark:border-purple-800 hover:shadow-lg transition-all duration-200 group-hover:scale-105">
              <User className="w-6 h-6 text-purple-600 dark:text-purple-400 mb-2" />
              <p className="font-medium text-slate-900 dark:text-white">My Profile</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Manage account</p>
            </div>
          </Link>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="p-6 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              Recent Orders
            </h2>
            <Link
              href="/dashboard/orders"
              className="text-sm text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 font-medium"
            >
              View All Orders →
            </Link>
          </div>
        </div>
        <div className="overflow-x-auto">
          {orders.length > 0 ? (
            <table className="w-full">
              <thead className="bg-slate-50 dark:bg-slate-800">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Order ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Event
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Tickets
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Total
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {orders.slice(0, 10).map((order) => (
                  <tr key={order.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors duration-200">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg flex items-center justify-center text-white">
                          <CreditCard className="w-5 h-5" />
                        </div>
                        <span className="text-sm font-medium text-slate-900 dark:text-white">
                          #{order.id.length > 8 ? order.id.slice(0, 8) : order.id}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <p className="text-sm text-slate-900 dark:text-white font-medium">
                        {eventNames[order.eventId] || (order.eventId ? `Event #${order.eventId.slice(0, 8)}` : 'N/A')}
                      </p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-slate-900 dark:text-white">
                        {getTicketCountForOrder(order)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-semibold text-slate-900 dark:text-white">
                        {formatCurrency((order.totalAmountCents || order.totalAmount || 0) / (order.totalAmountCents ? 100 : 1))}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1 px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(order.status)}`}>
                        {getStatusIcon(order.status)}
                        {order.status ? order.status.charAt(0).toUpperCase() + order.status.slice(1).toLowerCase() : 'Unknown'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="text-center py-12 px-6">
              <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center text-white text-3xl mx-auto mb-4">
                <CreditCard className="w-10 h-10" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                No orders yet
              </h3>
              <p className="text-slate-500 dark:text-slate-400 mb-6">
                Start by browsing events and purchasing your first tickets!
              </p>
              <Link
                href="/events"
                className="inline-flex items-center px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors duration-200 font-medium"
              >
                <Search className="w-5 h-5 mr-2" />
                Browse Events
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Profile Summary */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-800 p-6">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">
          Your Profile Summary
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white text-2xl font-bold">
              {user?.name?.charAt(0).toUpperCase() || '?'}
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-white">
                {user?.name || 'Guest User'}
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {user?.email || 'No email'}
              </p>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-600 dark:text-slate-400">Total Orders</span>
              <span className="font-semibold text-slate-900 dark:text-white">{totalOrders}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-600 dark:text-slate-400">Total Tickets</span>
              <span className="font-semibold text-slate-900 dark:text-white">{totalTickets}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-600 dark:text-slate-400">Total Spent</span>
              <span className="font-semibold text-slate-900 dark:text-white">{formatCurrency(totalSpent)}</span>
            </div>
          </div>
        </div>
        <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-800">
          <Link
            href="/dashboard/profile"
            className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors duration-200 font-medium"
          >
            <User className="w-4 h-4 mr-2" />
            Edit Profile →
          </Link>
        </div>
      </div>
    </div>
  );
}

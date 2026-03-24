'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useAuth } from '@/modules/authentication/context/AuthContext';
import { getMyOrders, getEventById } from '@/modules/shared-common/services/apiService';
import type { Order, Event } from '@/modules/shared-common/services/apiService';
import {
  CreditCard,
  Calendar,
  MapPin,
  Ticket,
  Download,
  Eye,
  CheckCircle,
  Clock,
  AlertCircle,
  RefreshCw,
  Search,
  ShoppingBag,
  ArrowLeft,
  Filter,
} from 'lucide-react';

type StatusFilter = 'all' | 'completed' | 'confirmed' | 'pending' | 'cancelled' | 'refunded';

interface EnrichedOrder extends Order {
  eventName?: string;
  eventDate?: string;
  eventLocation?: string;
  ticketCount?: number;
}

export default function CustomerOrdersPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<EnrichedOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const ordersData = await getMyOrders();

      // Enrich orders with event details
      const enriched = await Promise.all(
        (ordersData || []).map(async (order) => {
          try {
            const event = await getEventById(order.eventId);
            return {
              ...order,
              eventName: event?.title || event?.name || 'Unknown Event',
              eventDate: event?.startDate || (event?.date ? String(event.date) : undefined),
              eventLocation: event?.location,
              ticketCount: order.items?.reduce((sum, item) => sum + (item.quantity || 0), 0) || order.tickets?.length || 0,
            };
          } catch {
            return {
              ...order,
              eventName: 'Unknown Event',
              ticketCount: order.items?.reduce((sum, item) => sum + (item.quantity || 0), 0) || order.tickets?.length || 0,
            };
          }
        })
      );

      enriched.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setOrders(enriched);
    } catch {
      setError('Failed to load your orders');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user) fetchOrders();
  }, [user, fetchOrders]);

  const filteredOrders = orders.filter((order) => {
    const matchesStatus =
      statusFilter === 'all' || order.status?.toLowerCase() === statusFilter;
    const matchesSearch =
      !searchTerm ||
      (order.eventName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.id.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

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

  const getStatusIcon = (status: string) => {
    const s = (status || '').toLowerCase();
    if (['completed', 'confirmed'].includes(s)) return <CheckCircle className="w-3.5 h-3.5" />;
    if (s === 'pending') return <Clock className="w-3.5 h-3.5" />;
    return <AlertCircle className="w-3.5 h-3.5" />;
  };

  const statusTabs: { key: StatusFilter; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'completed', label: 'Completed' },
    { key: 'confirmed', label: 'Confirmed' },
    { key: 'pending', label: 'Pending' },
    { key: 'cancelled', label: 'Cancelled' },
    { key: 'refunded', label: 'Refunded' },
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <div className="h-8 w-40 bg-slate-200 dark:bg-slate-700 rounded-lg animate-pulse" />
          <div className="h-5 w-64 bg-slate-200 dark:bg-slate-700 rounded-lg animate-pulse mt-2" />
        </div>
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 animate-pulse">
            <div className="flex gap-4">
              <div className="w-16 h-16 bg-slate-200 dark:bg-slate-700 rounded-lg" />
              <div className="flex-1 space-y-2">
                <div className="h-5 w-48 bg-slate-200 dark:bg-slate-700 rounded" />
                <div className="h-4 w-36 bg-slate-200 dark:bg-slate-700 rounded" />
                <div className="h-4 w-24 bg-slate-200 dark:bg-slate-700 rounded" />
              </div>
            </div>
          </div>
        ))}
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
          <button onClick={fetchOrders} className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-medium inline-flex items-center gap-2">
            <RefreshCw className="w-4 h-4" /> Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Your Orders</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            {orders.length} order{orders.length !== 1 ? 's' : ''} total
          </p>
        </div>
        <button
          onClick={fetchOrders}
          className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors text-sm"
        >
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div className="flex flex-wrap gap-1">
          {statusTabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setStatusFilter(tab.key)}
              className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                statusFilter === tab.key
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search orders..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* Orders List */}
      {filteredOrders.length > 0 ? (
        <div className="space-y-4">
          {filteredOrders.map((order) => (
            <div
              key={order.id}
              className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden hover:shadow-md transition-shadow"
            >
              <div className="p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex gap-4 flex-1">
                    <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center text-white shrink-0">
                      <ShoppingBag className="w-6 h-6" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="font-semibold text-slate-900 dark:text-white truncate">
                          {order.eventName}
                        </h3>
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-semibold rounded-full shrink-0 ${getStatusBadge(order.status)}`}>
                          {getStatusIcon(order.status)}
                          {(order.status || 'unknown').charAt(0).toUpperCase() + (order.status || 'unknown').slice(1).toLowerCase()}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
                        Order #{order.id.length > 12 ? order.id.slice(0, 12) + '...' : order.id}
                      </p>
                      <div className="flex flex-wrap gap-4 text-sm text-slate-600 dark:text-slate-400">
                        {order.eventDate && (
                          <span className="flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5" /> {formatDate(order.eventDate)}
                          </span>
                        )}
                        {order.eventLocation && (
                          <span className="flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5" /> {order.eventLocation}
                          </span>
                        )}
                        <span className="flex items-center gap-1.5">
                          <Ticket className="w-3.5 h-3.5" /> {order.ticketCount || 0} ticket{(order.ticketCount || 0) !== 1 ? 's' : ''}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5" /> Ordered {formatDate(order.createdAt)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right shrink-0 flex flex-col items-end gap-2">
                    <p className="text-xl font-bold text-slate-900 dark:text-white">
                      {formatCurrency((order.totalAmountCents || order.totalAmount || 0) / (order.totalAmountCents ? 100 : 1))}
                    </p>
                    <Link
                      href={`/orders/${order.id}`}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-700 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5" /> View Details
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
          <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white mx-auto mb-4">
            <ShoppingBag className="w-10 h-10" />
          </div>
          <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
            {searchTerm || statusFilter !== 'all' ? 'No matching orders' : 'No orders yet'}
          </h3>
          <p className="text-slate-500 dark:text-slate-400 mb-6 max-w-md mx-auto">
            {searchTerm || statusFilter !== 'all'
              ? 'Try adjusting your search or filter.'
              : "You haven't purchased any tickets yet. Browse events to find something amazing!"}
          </p>
          <Link
            href="/events"
            className="inline-flex items-center px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors font-medium"
          >
            <Search className="w-5 h-5 mr-2" /> Browse Events
          </Link>
        </div>
      )}
    </div>
  );
}

'use client';

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { AnalyticsCharts } from '@/modules/shared-common/components/admin/AnalyticsCharts';
import { getDashboardMetrics, getAllUsers, getAllOrganizers, getAllEvents, getAllOrders } from '@/modules/shared-common/services/apiService';
import type { User, Event, AdminOrder } from '@/modules/shared-common/services/apiService';
import {
  Users,
  Calendar,
  DollarSign,
  TrendingUp,
  ShoppingCart,
  RefreshCw,
  AlertCircle,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
  Filter,
} from 'lucide-react';

interface DashboardMetrics {
  totalUsers: number;
  activeUsers: number;
  totalOrganizers: number;
  totalEvents: number;
  activeEvents: number;
  totalRevenue: number;
}

export default function AdminAnalyticsPage() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [organizers, setOrganizers] = useState<User[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [filterActive, setFilterActive] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [metricsData, usersData, organizersData, eventsData, ordersData] = await Promise.all([
        getDashboardMetrics(startDate || undefined, endDate || undefined),
        getAllUsers(),
        getAllOrganizers(),
        getAllEvents(),
        getAllOrders(),
      ]);
      setMetrics(metricsData);
      setUsers(usersData || []);
      setOrganizers(organizersData || []);
      setEvents(eventsData || []);
      setOrders(ordersData || []);
    } catch (err) {
      console.error('Error fetching analytics:', err);
      setError('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate]);

  useEffect(() => {
    fetchData();
  }, []);

  // Computed metrics from orders
  const orderMetrics = useMemo(() => {
    let filtered = orders;
    if (filterActive && startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      filtered = orders.filter((o) => {
        const d = new Date(o.createdAt);
        return d >= start && d <= end;
      });
    }

    const total = filtered.length;
    const completed = filtered.filter((o) => ['completed', 'COMPLETED', 'confirmed', 'CONFIRMED'].includes(o.status)).length;
    const refunded = filtered.filter((o) => ['refunded', 'REFUNDED'].includes(o.status)).length;
    const pending = filtered.filter((o) => ['pending', 'PENDING'].includes(o.status)).length;
    const totalRevenue = filtered.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
    const avgOrderValue = total > 0 ? totalRevenue / total : 0;

    return { total, completed, refunded, pending, totalRevenue, avgOrderValue };
  }, [orders, filterActive, startDate, endDate]);

  // Computed user/event metrics from raw data
  const computedMetrics = useMemo(() => {
    let filteredUsers = users;
    let filteredOrganizers = organizers;
    let filteredEvents = events;

    if (filterActive && startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      filteredUsers = users.filter((u) => { const d = new Date(u.createdAt); return d >= start && d <= end; });
      filteredOrganizers = organizers.filter((o) => { const d = new Date(o.createdAt); return d >= start && d <= end; });
      filteredEvents = events.filter((e) => { const d = new Date(e.createdAt); return d >= start && d <= end; });
    }

    return {
      totalUsers: filteredUsers.length,
      activeUsers: filteredUsers.filter((u) => ['ACTIVE', 'active'].includes(u.status)).length,
      totalOrganizers: filteredOrganizers.length,
      activeOrganizers: filteredOrganizers.filter((o) => ['ACTIVE', 'active'].includes(o.status)).length,
      totalEvents: filteredEvents.length,
      activeEvents: filteredEvents.filter((e) => ['active', 'published', 'ACTIVE', 'PUBLISHED'].includes(e.status)).length,
    };
  }, [users, organizers, events, filterActive, startDate, endDate]);

  const handleApplyFilter = () => {
    setFilterActive(true);
    fetchData();
  };

  const handleResetFilter = () => {
    setStartDate('');
    setEndDate('');
    setFilterActive(false);
  };

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <div className="h-9 w-56 bg-slate-200 dark:bg-slate-700 rounded-lg animate-pulse" />
          <div className="h-5 w-80 bg-slate-200 dark:bg-slate-700 rounded-lg animate-pulse mt-2" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-28 bg-slate-200 dark:bg-slate-700 rounded-xl animate-pulse" />
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-28 bg-slate-200 dark:bg-slate-700 rounded-xl animate-pulse" />
          ))}
        </div>
        <div className="h-80 bg-slate-200 dark:bg-slate-700 rounded-xl animate-pulse" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center bg-red-50 dark:bg-red-900/10 p-8 rounded-2xl border border-red-200 dark:border-red-800 max-w-md">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-red-600 dark:text-red-400 text-xl font-bold mb-2">Error</h2>
          <p className="text-red-500 mb-6">{error}</p>
          <button onClick={fetchData} className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-medium inline-flex items-center gap-2">
            <RefreshCw className="w-4 h-4" /> Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Platform Analytics</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">Comprehensive platform metrics and insights</p>
        </div>
        <button
          onClick={fetchData}
          className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors text-sm"
        >
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      {/* Date Filter */}
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-5">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-5 h-5 text-slate-600 dark:text-slate-400" />
          <h2 className="font-semibold text-slate-900 dark:text-white">Date Range Filter</h2>
        </div>
        <div className="flex flex-col md:flex-row gap-4 items-end">
          <div className="flex-1">
            <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1.5">Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1.5">End Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleApplyFilter}
              disabled={!startDate || !endDate}
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Apply
            </button>
            {filterActive && (
              <button onClick={handleResetFilter} className="px-5 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                Reset
              </button>
            )}
          </div>
        </div>
        {filterActive && startDate && endDate && (
          <div className="mt-3 px-3 py-2 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-lg">
            <p className="text-sm text-indigo-700 dark:text-indigo-300">
              Showing data from {new Date(startDate).toLocaleDateString()} to {new Date(endDate).toLocaleDateString()}
            </p>
          </div>
        )}
      </div>

      {/* Key Metrics from API */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          <p className="text-3xl font-bold text-slate-900 dark:text-white">{metrics?.totalUsers ?? computedMetrics.totalUsers}</p>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Total Users</p>
          <p className="text-xs text-green-600 dark:text-green-400 mt-1">
            {metrics?.activeUsers ?? computedMetrics.activeUsers} active
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <Users className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
          <p className="text-3xl font-bold text-slate-900 dark:text-white">{metrics?.totalOrganizers ?? computedMetrics.totalOrganizers}</p>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Total Organizers</p>
          <p className="text-xs text-green-600 dark:text-green-400 mt-1">
            {computedMetrics.activeOrganizers} active
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <Calendar className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
          </div>
          <p className="text-3xl font-bold text-slate-900 dark:text-white">{metrics?.totalEvents ?? computedMetrics.totalEvents}</p>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Total Events</p>
          <p className="text-xs text-green-600 dark:text-green-400 mt-1">
            {metrics?.activeEvents ?? computedMetrics.activeEvents} active
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
              <DollarSign className="w-5 h-5 text-orange-600 dark:text-orange-400" />
            </div>
          </div>
          <p className="text-3xl font-bold text-slate-900 dark:text-white">
            {formatCurrency(metrics?.totalRevenue ?? orderMetrics.totalRevenue)}
          </p>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Total Revenue</p>
          <p className="text-xs text-slate-500 mt-1">{orderMetrics.total} orders</p>
        </div>
      </div>

      {/* Order Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <ShoppingCart className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">{orderMetrics.completed}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Completed Orders</p>
            </div>
          </div>
          <p className="text-xs text-slate-400 mt-2">
            {orderMetrics.total > 0 ? ((orderMetrics.completed / orderMetrics.total) * 100).toFixed(1) : 0}% of total
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
              <ShoppingCart className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{orderMetrics.pending}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Pending Orders</p>
            </div>
          </div>
          <p className="text-xs text-slate-400 mt-2">
            {orderMetrics.total > 0 ? ((orderMetrics.pending / orderMetrics.total) * 100).toFixed(1) : 0}% of total
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <ArrowDownRight className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{orderMetrics.refunded}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Refunded</p>
            </div>
          </div>
          <p className="text-xs text-slate-400 mt-2">
            {orderMetrics.total > 0 ? ((orderMetrics.refunded / orderMetrics.total) * 100).toFixed(1) : 0}% of total
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
              <TrendingUp className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">{formatCurrency(orderMetrics.avgOrderValue)}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Avg Order Value</p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <AnalyticsCharts />
    </div>
  );
}

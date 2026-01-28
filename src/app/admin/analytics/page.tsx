'use client';

import React, { useState, useMemo } from 'react';
import { AnalyticsCharts } from '@/components/admin/AnalyticsCharts';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { getAllUsers, getAllOrganizers, getAllEvents, getAllOrders } from '@/lib/dummy-data';

/**
 * Admin Analytics Page
 * Displays platform analytics with date range filtering
 */
export default function AnalyticsPage() {
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [showFiltered, setShowFiltered] = useState(false);

  // Calculate metrics
  const metrics = useMemo(() => {
    const users = getAllUsers();
    const organizers = getAllOrganizers();
    const events = getAllEvents();
    const orders = getAllOrders();

    let filteredUsers = users;
    let filteredOrganizers = organizers;
    let filteredEvents = events;
    let filteredOrders = orders;

    // Apply date filters if specified
    if (showFiltered && startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);

      filteredUsers = users.filter((u) => {
        const date = new Date(u.createdAt);
        return date >= start && date <= end;
      });

      filteredOrganizers = organizers.filter((o) => {
        const date = new Date(o.createdAt);
        return date >= start && date <= end;
      });

      filteredEvents = events.filter((e) => {
        const date = new Date(e.createdAt);
        return date >= start && date <= end;
      });

      filteredOrders = orders.filter((o) => {
        const date = new Date(o.createdAt);
        return date >= start && date <= end;
      });
    }

    const totalRevenue = filteredOrders.reduce((sum, o) => sum + o.totalAmount, 0);
    const completedOrders = filteredOrders.filter((o) => o.status === 'completed').length;
    const refundedOrders = filteredOrders.filter((o) => o.status === 'refunded').length;

    return {
      totalUsers: filteredUsers.length,
      activeUsers: filteredUsers.filter((u) => u.status === 'active').length,
      totalOrganizers: filteredOrganizers.length,
      verifiedOrganizers: filteredOrganizers.filter((o) => o.verificationStatus === 'verified')
        .length,
      totalEvents: filteredEvents.length,
      activeEvents: filteredEvents.filter((e) => e.status === 'active').length,
      totalOrders: filteredOrders.length,
      completedOrders,
      refundedOrders,
      totalRevenue,
      averageOrderValue: filteredOrders.length > 0 ? totalRevenue / filteredOrders.length : 0,
    };
  }, [showFiltered, startDate, endDate]);

  // Handle reset filters
  const handleResetFilters = () => {
    setStartDate('');
    setEndDate('');
    setShowFiltered(false);
  };

  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  };

  return (
    <div className="space-y-8">
      {/* Page header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
          Platform Analytics
        </h1>
        <p className="text-slate-600 dark:text-slate-400 mt-2">
          View comprehensive platform analytics and metrics
        </p>
      </div>

      {/* Date Range Filter */}
      <div className="bg-white dark:bg-slate-900 rounded-lg shadow-md border border-slate-200 dark:border-slate-800 p-6">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
          Filter by Date Range
        </h2>

        <div className="flex flex-col md:flex-row gap-4 items-end">
          <div className="flex-1">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Start Date
            </label>
            <Input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>

          <div className="flex-1">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              End Date
            </label>
            <Input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>

          <div className="flex gap-2">
            <Button
              onClick={() => setShowFiltered(true)}
              disabled={!startDate || !endDate}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Apply Filter
            </Button>
            {showFiltered && (
              <Button variant="outline" onClick={handleResetFilters}>
                Reset
              </Button>
            )}
          </div>
        </div>

        {showFiltered && startDate && endDate && (
          <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <p className="text-sm text-blue-800 dark:text-blue-300">
              Showing data from {new Date(startDate).toLocaleDateString()} to{' '}
              {new Date(endDate).toLocaleDateString()}
            </p>
          </div>
        )}
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* User Metrics */}
        <div className="bg-white dark:bg-slate-900 rounded-lg shadow-md p-6 border border-slate-200 dark:border-slate-800">
          <h3 className="text-sm font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wide">
            Total Users
          </h3>
          <p className="text-3xl font-bold text-slate-900 dark:text-white mt-2">
            {metrics.totalUsers}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
            {metrics.activeUsers} active
          </p>
        </div>

        {/* Organizer Metrics */}
        <div className="bg-white dark:bg-slate-900 rounded-lg shadow-md p-6 border border-slate-200 dark:border-slate-800">
          <h3 className="text-sm font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wide">
            Total Organizers
          </h3>
          <p className="text-3xl font-bold text-slate-900 dark:text-white mt-2">
            {metrics.totalOrganizers}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
            {metrics.verifiedOrganizers} verified
          </p>
        </div>

        {/* Event Metrics */}
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

        {/* Revenue Metrics */}
        <div className="bg-white dark:bg-slate-900 rounded-lg shadow-md p-6 border border-slate-200 dark:border-slate-800">
          <h3 className="text-sm font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wide">
            Total Revenue
          </h3>
          <p className="text-3xl font-bold text-slate-900 dark:text-white mt-2">
            {formatCurrency(metrics.totalRevenue)}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
            {metrics.totalOrders} orders
          </p>
        </div>
      </div>

      {/* Order Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-slate-900 rounded-lg shadow-md p-6 border border-slate-200 dark:border-slate-800">
          <h3 className="text-sm font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wide">
            Completed Orders
          </h3>
          <p className="text-3xl font-bold text-green-600 dark:text-green-400 mt-2">
            {metrics.completedOrders}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
            {metrics.totalOrders > 0
              ? ((metrics.completedOrders / metrics.totalOrders) * 100).toFixed(1)
              : 0}
            % of total
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-lg shadow-md p-6 border border-slate-200 dark:border-slate-800">
          <h3 className="text-sm font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wide">
            Refunded Orders
          </h3>
          <p className="text-3xl font-bold text-blue-600 dark:text-blue-400 mt-2">
            {metrics.refundedOrders}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
            {metrics.totalOrders > 0
              ? ((metrics.refundedOrders / metrics.totalOrders) * 100).toFixed(1)
              : 0}
            % of total
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-lg shadow-md p-6 border border-slate-200 dark:border-slate-800">
          <h3 className="text-sm font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wide">
            Average Order Value
          </h3>
          <p className="text-3xl font-bold text-slate-900 dark:text-white mt-2">
            {formatCurrency(metrics.averageOrderValue)}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
            Per order
          </p>
        </div>
      </div>

      {/* Charts */}
      <AnalyticsCharts />
    </div>
  );
}

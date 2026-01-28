'use client';

import React, { useMemo } from 'react';
import { MetricCard } from '@/components/admin/MetricCard';
import { ActivityFeed } from '@/components/admin/ActivityFeed';
import { AnalyticsCharts } from '@/components/admin/AnalyticsCharts';
import { getDashboardMetrics } from '@/lib/dummy-data';

/**
 * Admin dashboard overview page
 * Displays key platform metrics and recent activities
 */
export default function AdminDashboard() {
  const metrics = useMemo(() => getDashboardMetrics(), []);

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
          Dashboard
        </h1>
        <p className="text-slate-600 dark:text-slate-400 mt-2">
          Welcome to the admin dashboard. Monitor platform health and key metrics.
        </p>
      </div>

      {/* Key metrics grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Users"
          value={metrics.totalUsers}
          description={`${metrics.activeUsers} active`}
          icon={
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4.354a4 4 0 110 5.292M15 21H3v-2a6 6 0 0112 0v2zm0 0h6v-2a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
              />
            </svg>
          }
        />

        <MetricCard
          title="Total Organizers"
          value={metrics.totalOrganizers}
          description={`${metrics.verifiedOrganizers} verified`}
          icon={
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
          }
        />

        <MetricCard
          title="Total Events"
          value={metrics.totalEvents}
          description={`${metrics.activeEvents} active`}
          icon={
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          }
        />

        <MetricCard
          title="Total Revenue"
          value={formatCurrency(metrics.totalRevenue)}
          description="All time"
          icon={
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          }
        />
      </div>

      {/* Activity Feed and Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <ActivityFeed limit={8} />
        </div>
        <div className="lg:col-span-2">
          <AnalyticsCharts />
        </div>
      </div>

      {/* Additional info section */}
      <div className="bg-white dark:bg-slate-900 rounded-lg shadow-md p-6 border border-slate-200 dark:border-slate-800">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
          Platform Overview
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-semibold text-slate-900 dark:text-white mb-2">
              Quick Stats
            </h3>
            <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
              <li className="flex justify-between">
                <span>User Registration Rate:</span>
                <span className="font-medium text-slate-900 dark:text-white">
                  {metrics.totalUsers > 0 ? ((metrics.activeUsers / metrics.totalUsers) * 100).toFixed(1) : 0}%
                </span>
              </li>
              <li className="flex justify-between">
                <span>Organizer Verification Rate:</span>
                <span className="font-medium text-slate-900 dark:text-white">
                  {metrics.totalOrganizers > 0 ? ((metrics.verifiedOrganizers / metrics.totalOrganizers) * 100).toFixed(1) : 0}%
                </span>
              </li>
              <li className="flex justify-between">
                <span>Event Activity Rate:</span>
                <span className="font-medium text-slate-900 dark:text-white">
                  {metrics.totalEvents > 0 ? ((metrics.activeEvents / metrics.totalEvents) * 100).toFixed(1) : 0}%
                </span>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-slate-900 dark:text-white mb-2">
              System Health
            </h3>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-slate-600 dark:text-slate-400">Database</span>
                  <span className="text-green-600 dark:text-green-400 font-medium">Healthy</span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                  <div className="bg-green-500 h-2 rounded-full" style={{ width: '100%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-slate-600 dark:text-slate-400">API Response</span>
                  <span className="text-green-600 dark:text-green-400 font-medium">Optimal</span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                  <div className="bg-green-500 h-2 rounded-full" style={{ width: '95%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-slate-600 dark:text-slate-400">Server Load</span>
                  <span className="text-yellow-600 dark:text-yellow-400 font-medium">Normal</span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                  <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '65%' }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

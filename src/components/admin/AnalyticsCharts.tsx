'use client';

import { useMemo, memo } from 'react';
import dynamic from 'next/dynamic';
import { getAllEvents, getAllOrders } from '@/lib/dummy-data';

// Lazy load recharts components to reduce initial bundle
const LineChart = dynamic(() => import('recharts').then(mod => ({ default: mod.LineChart })), { ssr: false });
const BarChart = dynamic(() => import('recharts').then(mod => ({ default: mod.BarChart })), { ssr: false });
const Line = dynamic(() => import('recharts').then(mod => ({ default: mod.Line })), { ssr: false });
const Bar = dynamic(() => import('recharts').then(mod => ({ default: mod.Bar })), { ssr: false });
const XAxis = dynamic(() => import('recharts').then(mod => ({ default: mod.XAxis })), { ssr: false });
const YAxis = dynamic(() => import('recharts').then(mod => ({ default: mod.YAxis })), { ssr: false });
const CartesianGrid = dynamic(() => import('recharts').then(mod => ({ default: mod.CartesianGrid })), { ssr: false });
const Tooltip = dynamic(() => import('recharts').then(mod => ({ default: mod.Tooltip })), { ssr: false });
const Legend = dynamic(() => import('recharts').then(mod => ({ default: mod.Legend })), { ssr: false });
const ResponsiveContainer = dynamic(() => import('recharts').then(mod => ({ default: mod.ResponsiveContainer })), { ssr: false });

/**
 * Analytics charts component
 * Displays event trends and revenue trends over time
 */
export const AnalyticsCharts = memo(function AnalyticsCharts() {
  const eventTrendsData = useMemo(() => {
    const events = getAllEvents();
    
    // Group events by month
    const monthlyData: Record<string, number> = {};
    
    events.forEach((event) => {
      const date = new Date(event.createdAt);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      monthlyData[monthKey] = (monthlyData[monthKey] || 0) + 1;
    });

    // Convert to array and sort by date
    return Object.entries(monthlyData)
      .map(([month, count]) => ({
        month: new Date(month + '-01').toLocaleDateString('en-US', {
          month: 'short',
          year: 'numeric',
        }),
        events: count,
      }))
      .sort((a, b) => new Date(a.month).getTime() - new Date(b.month).getTime())
      .slice(-12); // Last 12 months
  }, []);

  const revenueTrendsData = useMemo(() => {
    const orders = getAllOrders();
    
    // Group revenue by month
    const monthlyRevenue: Record<string, number> = {};
    
    orders.forEach((order) => {
      const date = new Date(order.createdAt);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      monthlyRevenue[monthKey] = (monthlyRevenue[monthKey] || 0) + order.totalAmount;
    });

    // Convert to array and sort by date
    return Object.entries(monthlyRevenue)
      .map(([month, revenue]) => ({
        month: new Date(month + '-01').toLocaleDateString('en-US', {
          month: 'short',
          year: 'numeric',
        }),
        revenue: Math.round(revenue * 100) / 100,
      }))
      .sort((a, b) => new Date(a.month).getTime() - new Date(b.month).getTime())
      .slice(-12); // Last 12 months
  }, []);

  const totalEvents = useMemo(() => eventTrendsData.reduce((sum, d) => sum + d.events, 0), [eventTrendsData]);
  const totalRevenue = useMemo(() => revenueTrendsData.reduce((sum, d) => sum + d.revenue, 0), [revenueTrendsData]);
  const avgRevenuePerEvent = useMemo(() => totalEvents > 0 ? totalRevenue / totalEvents : 0, [totalEvents, totalRevenue]);

  return (
    <div className="space-y-6">
      {/* Event Trends Chart */}
      <div className="bg-white dark:bg-slate-900 rounded-lg shadow-md p-6 border border-slate-200 dark:border-slate-800">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
          Event Trends
        </h2>
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
          Number of events created over time
        </p>
        
        {eventTrendsData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={eventTrendsData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis
                dataKey="month"
                stroke="#64748b"
                style={{ fontSize: '12px' }}
              />
              <YAxis stroke="#64748b" style={{ fontSize: '12px' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1e293b',
                  border: '1px solid #475569',
                  borderRadius: '8px',
                  color: '#f1f5f9',
                }}
                labelStyle={{ color: '#f1f5f9' }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="events"
                stroke="#4f46e5"
                strokeWidth={2}
                dot={{ fill: '#4f46e5', r: 4 }}
                activeDot={{ r: 6 }}
                name="Events Created"
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-80 flex items-center justify-center text-slate-500 dark:text-slate-400">
            No event data available
          </div>
        )}
      </div>

      {/* Revenue Trends Chart */}
      <div className="bg-white dark:bg-slate-900 rounded-lg shadow-md p-6 border border-slate-200 dark:border-slate-800">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
          Revenue Trends
        </h2>
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
          Total revenue generated over time
        </p>
        
        {revenueTrendsData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={revenueTrendsData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis
                dataKey="month"
                stroke="#64748b"
                style={{ fontSize: '12px' }}
              />
              <YAxis stroke="#64748b" style={{ fontSize: '12px' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1e293b',
                  border: '1px solid #475569',
                  borderRadius: '8px',
                  color: '#f1f5f9',
                }}
                labelStyle={{ color: '#f1f5f9' }}
                formatter={(value) => {
                  const numValue = value as number | undefined;
                  if (typeof numValue === 'number') {
                    return `$${numValue.toFixed(2)}`;
                  }
                  return '';
                }}
              />
              <Legend />
              <Bar
                dataKey="revenue"
                fill="#10b981"
                radius={[8, 8, 0, 0]}
                name="Revenue ($)"
              />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-80 flex items-center justify-center text-slate-500 dark:text-slate-400">
            No revenue data available
          </div>
        )}
      </div>

      {/* Summary Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-slate-900 rounded-lg shadow-md p-6 border border-slate-200 dark:border-slate-800">
          <h3 className="text-sm font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wide">
            Total Events Created
          </h3>
          <p className="text-2xl font-bold text-slate-900 dark:text-white mt-2">
            {totalEvents}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
            Last 12 months
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-lg shadow-md p-6 border border-slate-200 dark:border-slate-800">
          <h3 className="text-sm font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wide">
            Total Revenue
          </h3>
          <p className="text-2xl font-bold text-slate-900 dark:text-white mt-2">
            ${totalRevenue.toFixed(2)}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
            Last 12 months
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-lg shadow-md p-6 border border-slate-200 dark:border-slate-800">
          <h3 className="text-sm font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wide">
            Average Revenue per Event
          </h3>
          <p className="text-2xl font-bold text-slate-900 dark:text-white mt-2">
            ${avgRevenuePerEvent.toFixed(2)}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
            Last 12 months
          </p>
        </div>
      </div>
    </div>
  );
});

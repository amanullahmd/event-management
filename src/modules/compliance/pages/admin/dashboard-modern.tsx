'use client';

import { useState, useEffect, useCallback } from 'react';
import { 
  Users, 
  Calendar, 
  DollarSign, 
  AlertCircle, 
  UserCheck,
  RefreshCw
} from 'lucide-react';
import { getDashboardMetrics } from '@/modules/shared-common/services/apiService';
import { apiRequest } from '@/modules/shared-common/utils/api';

/** Matches the AdminDashboardMetrics response from GET /admin/dashboard/metrics */
interface AdminDashboardMetrics {
  totalUsers: number;
  activeUsers: number;
  totalOrganizers: number;
  totalEvents: number;
  activeEvents: number;
  totalRevenue: number;
}

/** Matches the UserRoleResponse from GET /admin/users */
interface UserRoleResponse {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Modern Admin Dashboard with real API data
 * Fetches metrics from GET /admin/dashboard/metrics and users from GET /admin/users
 */
export default function ModernAdminDashboard() {
  const [metrics, setMetrics] = useState<AdminDashboardMetrics | null>(null);
  const [users, setUsers] = useState<UserRoleResponse[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [metricsData, usersData] = await Promise.all([
        getDashboardMetrics(),
        apiRequest<UserRoleResponse[]>('/admin/users')
      ]);
      
      setMetrics({
        totalUsers: metricsData?.totalUsers || 0,
        activeUsers: metricsData?.activeUsers || 0,
        totalOrganizers: metricsData?.totalOrganizers || 0,
        totalEvents: metricsData?.totalEvents || 0,
        activeEvents: metricsData?.activeEvents || 0,
        totalRevenue: metricsData?.totalRevenue || 0,
      });
      setUsers(usersData || []);
      setLastRefresh(new Date());
    } catch (err) {
      console.error('Error fetching admin data:', err);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  };

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('en-US').format(value);
  };

  const getUserDisplayName = (user: UserRoleResponse): string => {
    if (user.firstName && user.lastName) return `${user.firstName} ${user.lastName}`;
    if (user.firstName) return user.firstName;
    if (user.lastName) return user.lastName;
    return user.email;
  };

  const getUserInitial = (user: UserRoleResponse): string => {
    if (user.firstName) return user.firstName.charAt(0).toUpperCase();
    if (user.lastName) return user.lastName.charAt(0).toUpperCase();
    return user.email.charAt(0).toUpperCase();
  };

  if (loading) {
    return (
      <div className="space-y-8">
        {/* Header skeleton */}
        <div>
          <div className="h-10 w-64 bg-slate-200 dark:bg-slate-700 rounded-lg animate-pulse" />
          <div className="h-5 w-80 bg-slate-200 dark:bg-slate-700 rounded-lg animate-pulse mt-2" />
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

        {/* Table skeleton */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-800 p-6">
          <div className="h-6 w-32 bg-slate-200 dark:bg-slate-700 rounded animate-pulse mb-4" />
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center gap-4 py-3">
              <div className="w-10 h-10 bg-slate-200 dark:bg-slate-700 rounded-full animate-pulse" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-40 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
                <div className="h-3 w-56 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
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
      {/* Header with refresh */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white">
            Admin Dashboard
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-2 text-lg">
            Real-time platform overview and management
          </p>
          <p className="text-sm text-slate-500 dark:text-slate-500 mt-1">
            Last updated: {lastRefresh.toLocaleTimeString()}
          </p>
        </div>
        <button 
          onClick={fetchData}
          className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors duration-200"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {/* Key Metrics Grid */}
      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Total Users Card */}
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-white/20 rounded-lg backdrop-blur-sm">
                <Users className="w-6 h-6" />
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-3xl font-bold">{formatNumber(metrics.totalUsers)}</p>
              <p className="text-blue-100">Total Users</p>
              <p className="text-sm text-blue-200">{formatNumber(metrics.activeUsers)} active</p>
            </div>
          </div>

          {/* Total Organizers Card */}
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 text-white shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-white/20 rounded-lg backdrop-blur-sm">
                <UserCheck className="w-6 h-6" />
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-3xl font-bold">{formatNumber(metrics.totalOrganizers)}</p>
              <p className="text-purple-100">Total Organizers</p>
            </div>
          </div>

          {/* Total Events Card */}
          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 text-white shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-white/20 rounded-lg backdrop-blur-sm">
                <Calendar className="w-6 h-6" />
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-3xl font-bold">{formatNumber(metrics.totalEvents)}</p>
              <p className="text-green-100">Total Events</p>
              <p className="text-sm text-green-200">{formatNumber(metrics.activeEvents)} active</p>
            </div>
          </div>

          {/* Total Revenue Card */}
          <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-6 text-white shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-white/20 rounded-lg backdrop-blur-sm">
                <DollarSign className="w-6 h-6" />
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-3xl font-bold">{formatCurrency(metrics.totalRevenue)}</p>
              <p className="text-orange-100">Total Revenue</p>
            </div>
          </div>
        </div>
      )}

      {/* Recent Users Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="p-6 border-b border-slate-200 dark:border-slate-800">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            Recent Users
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 dark:bg-slate-800">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {users.slice(0, 10).map((user) => (
                <tr key={user.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors duration-200">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                        {getUserInitial(user)}
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-slate-900 dark:text-white">
                          {getUserDisplayName(user)}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      {user.email}
                    </p>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                      user.role === 'ADMIN' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' :
                      user.role === 'ORGANIZER' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' :
                      'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                    }`}>
                      {user.role?.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                      user.status === 'ACTIVE' || user.status === 'active'
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' 
                        : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                    }`}>
                      {user.status?.toUpperCase()}
                    </span>
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-slate-500 dark:text-slate-400">
                    No users found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface StaffingPerformanceMetrics {
  staffId: string;
  staffName: string;
  totalCheckIns: number;
  successRate: number;
  averageProcessingTime: number;
  lastCheckInTime: string;
  failedAttempts: number;
  flaggedForReview: boolean;
}

interface StaffingPerformanceAnalyticsProps {
  eventId?: string;
  staffMetrics?: StaffingPerformanceMetrics[];
}

type SortField = 'throughput' | 'successRate' | 'processingTime' | 'name';
type SortOrder = 'asc' | 'desc';

/**
 * Staffing Performance Analytics Component
 * 
 * Shows individual staff member metrics.
 * 
 * Validates: Requirements 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7
 */
export const StaffingPerformanceAnalytics: React.FC<StaffingPerformanceAnalyticsProps> = ({
  eventId: propEventId,
  staffMetrics: propMetrics
}) => {
  const router = useRouter();
  const eventId = propEventId;

  const [metrics, setMetrics] = useState<StaffingPerformanceMetrics[]>(propMetrics || []);
  const [loading, setLoading] = useState(!propMetrics);
  const [error, setError] = useState<string | null>(null);
  const [sortField, setSortField] = useState<SortField>('throughput');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [performanceFilter, setPerformanceFilter] = useState<'all' | 'top' | 'below'>('all');

  useEffect(() => {
    if (propMetrics) {
      setMetrics(propMetrics);
      return;
    }

    if (!eventId) return;

    const fetchMetrics = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/events/${eventId}/analytics/staffing`);
        if (!response.ok) throw new Error('Failed to fetch staffing metrics');
        const result = await response.json();
        setMetrics(result);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
    const interval = setInterval(fetchMetrics, 10000); // Refresh every 10 seconds
    return () => clearInterval(interval);
  }, [eventId, propMetrics]);

  const calculateAverageSuccessRate = (): number => {
    if (metrics.length === 0) return 0;
    const sum = metrics.reduce((acc, m) => acc + m.successRate, 0);
    return sum / metrics.length;
  };

  const getTopPerformer = (): StaffingPerformanceMetrics | null => {
    if (metrics.length === 0) return null;
    return metrics.reduce((top, current) =>
      current.totalCheckIns > top.totalCheckIns ? current : top
    );
  };

  const sortMetrics = (data: StaffingPerformanceMetrics[]): StaffingPerformanceMetrics[] => {
    const sorted = [...data];
    sorted.sort((a, b) => {
      let aVal: number | string;
      let bVal: number | string;

      switch (sortField) {
        case 'throughput':
          aVal = a.totalCheckIns;
          bVal = b.totalCheckIns;
          break;
        case 'successRate':
          aVal = a.successRate;
          bVal = b.successRate;
          break;
        case 'processingTime':
          aVal = a.averageProcessingTime;
          bVal = b.averageProcessingTime;
          break;
        case 'name':
          aVal = a.staffName;
          bVal = b.staffName;
          break;
        default:
          return 0;
      }

      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortOrder === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      }

      const numA = typeof aVal === 'number' ? aVal : 0;
      const numB = typeof bVal === 'number' ? bVal : 0;
      return sortOrder === 'asc' ? numA - numB : numB - numA;
    });

    return sorted;
  };

  const filterMetrics = (data: StaffingPerformanceMetrics[]): StaffingPerformanceMetrics[] => {
    if (performanceFilter === 'all') return data;

    const avgSuccessRate = calculateAverageSuccessRate();
    const topPerformer = getTopPerformer();

    if (performanceFilter === 'top') {
      return data.filter((m) => m.staffId === topPerformer?.staffId);
    }

    if (performanceFilter === 'below') {
      return data.filter((m) => m.successRate < avgSuccessRate || m.flaggedForReview);
    }

    return data;
  };

  const displayMetrics = filterMetrics(sortMetrics(metrics));
  const avgSuccessRate = calculateAverageSuccessRate();
  const topPerformer = getTopPerformer();

  if (loading && metrics.length === 0) {
    return <div className="p-4">Loading...</div>;
  }

  if (error && metrics.length === 0) {
    return <div className="p-4 text-red-600">Error: {error}</div>;
  }

  if (metrics.length === 0) {
    return <div className="p-4">No staffing data available</div>;
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-6">Staffing Performance Analytics</h2>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-blue-50 p-4 rounded-lg">
          <p className="text-gray-600 text-sm">Total Staff</p>
          <p className="text-3xl font-bold text-blue-600">{metrics.length}</p>
        </div>
        <div className="bg-green-50 p-4 rounded-lg">
          <p className="text-gray-600 text-sm">Average Success Rate</p>
          <p className="text-3xl font-bold text-green-600">{avgSuccessRate.toFixed(1)}%</p>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg">
          <p className="text-gray-600 text-sm">Top Performer</p>
          <p className="text-lg font-bold text-purple-600">{topPerformer?.staffName || 'N/A'}</p>
        </div>
      </div>

      {/* Filters and Sorting */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex gap-2">
          <button
            onClick={() => setPerformanceFilter('all')}
            className={`px-4 py-2 rounded ${
              performanceFilter === 'all'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 text-gray-700'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setPerformanceFilter('top')}
            className={`px-4 py-2 rounded ${
              performanceFilter === 'top'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 text-gray-700'
            }`}
          >
            Top Performer
          </button>
          <button
            onClick={() => setPerformanceFilter('below')}
            className={`px-4 py-2 rounded ${
              performanceFilter === 'below'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 text-gray-700'
            }`}
          >
            Below Average
          </button>
        </div>

        <div className="flex gap-2 ml-auto">
          <select
            value={sortField}
            onChange={(e) => setSortField(e.target.value as SortField)}
            className="px-3 py-2 border border-gray-300 rounded"
          >
            <option value="throughput">Sort by Throughput</option>
            <option value="successRate">Sort by Success Rate</option>
            <option value="processingTime">Sort by Processing Time</option>
            <option value="name">Sort by Name</option>
          </select>
          <button
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            className="px-3 py-2 border border-gray-300 rounded"
          >
            {sortOrder === 'asc' ? '↑' : '↓'}
          </button>
        </div>
      </div>

      {/* Staff Metrics Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b-2 border-gray-300">
              <th className="text-left py-3 px-4 font-semibold">Staff Member</th>
              <th className="text-right py-3 px-4 font-semibold">Check-ins</th>
              <th className="text-right py-3 px-4 font-semibold">Success Rate</th>
              <th className="text-right py-3 px-4 font-semibold">Avg Time (s)</th>
              <th className="text-right py-3 px-4 font-semibold">Failed</th>
              <th className="text-right py-3 px-4 font-semibold">Last Check-in</th>
              <th className="text-center py-3 px-4 font-semibold">Status</th>
            </tr>
          </thead>
          <tbody>
            {displayMetrics.map((staff) => (
              <tr
                key={staff.staffId}
                className={`border-b border-gray-200 ${
                  staff.staffId === topPerformer?.staffId ? 'bg-green-50' : ''
                } ${staff.flaggedForReview ? 'bg-red-50' : ''}`}
              >
                <td className="py-3 px-4 font-medium">{staff.staffName}</td>
                <td className="py-3 px-4 text-right">{staff.totalCheckIns}</td>
                <td className="py-3 px-4 text-right">
                  <span
                    className={`px-2 py-1 rounded text-sm font-medium ${
                      staff.successRate >= avgSuccessRate
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {staff.successRate.toFixed(1)}%
                  </span>
                </td>
                <td className="py-3 px-4 text-right">{staff.averageProcessingTime.toFixed(2)}</td>
                <td className="py-3 px-4 text-right">{staff.failedAttempts}</td>
                <td className="py-3 px-4 text-right text-sm text-gray-600">
                  {new Date(staff.lastCheckInTime).toLocaleTimeString()}
                </td>
                <td className="py-3 px-4 text-center">
                  {staff.staffId === topPerformer?.staffId && (
                    <span className="text-lg">⭐</span>
                  )}
                  {staff.flaggedForReview && (
                    <span className="text-lg">⚠️</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StaffingPerformanceAnalytics;


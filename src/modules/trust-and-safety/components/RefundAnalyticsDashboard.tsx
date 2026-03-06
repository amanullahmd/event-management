import React, { useEffect, useState } from 'react';
import { AlertCircle, Download, Loader } from 'lucide-react';

interface RefundAnalytics {
  totalRefunds: number;
  totalRefundAmount: number;
  refundRate: number;
  averageRefundAmount: number;
  approvalRate: number;
  rejectionRate: number;
  topRefundReasons: Array<{ reason: string; count: number }>;
  refundsByStatus: Record<string, number>;
}

interface RefundAnalyticsDashboardProps {
  eventId: string;
}

export const RefundAnalyticsDashboard: React.FC<RefundAnalyticsDashboardProps> = ({
  eventId,
}) => {
  const [analytics, setAnalytics] = useState<RefundAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);
  const [startDate, setStartDate] = useState(
    new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    fetchAnalytics();
  }, [eventId, startDate, endDate]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `/api/v1/events/${eventId}/refund-analytics?startDate=${startDate}&endDate=${endDate}`
      );
      if (!response.ok) throw new Error('Failed to fetch analytics');
      const data = await response.json();
      setAnalytics(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      setExporting(true);
      const response = await fetch(
        `/api/v1/events/${eventId}/refund-analytics/export?startDate=${startDate}&endDate=${endDate}`
      );
      if (!response.ok) throw new Error('Failed to export data');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `refund-analytics-${eventId}-${startDate}-to-${endDate}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to export data');
    } finally {
      setExporting(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
        <div>
          <h3 className="font-semibold text-red-900">Error Loading Analytics</h3>
          <p className="text-sm text-red-700">{error}</p>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <p className="text-sm text-gray-600">No analytics data available.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">Refund Analytics</h2>
        <button
          onClick={handleExport}
          disabled={exporting}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-lg transition"
        >
          {exporting && <Loader className="w-4 h-4 animate-spin" />}
          <Download className="w-4 h-4" />
          Export CSV
        </button>
      </div>

      {/* Date Range Filter */}
      <div className="bg-white border border-gray-200 rounded-lg p-4 flex gap-4">
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <p className="text-sm text-gray-600">Total Refunds</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{analytics.totalRefunds}</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <p className="text-sm text-gray-600">Total Refund Amount</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">
            ${analytics.totalRefundAmount.toFixed(2)}
          </p>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <p className="text-sm text-gray-600">Refund Rate</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">
            {(analytics.refundRate * 100).toFixed(1)}%
          </p>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <p className="text-sm text-gray-600">Average Refund Amount</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">
            ${analytics.averageRefundAmount.toFixed(2)}
          </p>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <p className="text-sm text-gray-600">Approval Rate</p>
          <p className="text-3xl font-bold text-green-600 mt-1">
            {(analytics.approvalRate * 100).toFixed(1)}%
          </p>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <p className="text-sm text-gray-600">Rejection Rate</p>
          <p className="text-3xl font-bold text-red-600 mt-1">
            {(analytics.rejectionRate * 100).toFixed(1)}%
          </p>
        </div>
      </div>

      {/* Refund Reasons */}
      {analytics.topRefundReasons.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h3 className="font-semibold text-gray-900 mb-4">Top Refund Reasons</h3>
          <div className="space-y-3">
            {analytics.topRefundReasons.map((reason, index) => (
              <div key={index} className="flex items-center justify-between">
                <p className="text-sm text-gray-700">{reason.reason}</p>
                <div className="flex items-center gap-2">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{
                        width: `${(reason.count / Math.max(...analytics.topRefundReasons.map((r) => r.count))) * 100}%`,
                      }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium text-gray-900 w-8 text-right">
                    {reason.count}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Refund Status Distribution */}
      {Object.keys(analytics.refundsByStatus).length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h3 className="font-semibold text-gray-900 mb-4">Refund Status Distribution</h3>
          <div className="space-y-3">
            {Object.entries(analytics.refundsByStatus).map(([status, count]) => (
              <div key={status} className="flex items-center justify-between">
                <p className="text-sm text-gray-700 capitalize">
                  {status.replace(/_/g, ' ')}
                </p>
                <span className="text-sm font-medium text-gray-900">{count}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};


import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface Alert {
  type: string;
  message: string;
  severity: 'INFO' | 'WARNING' | 'CRITICAL';
  timestamp: string;
  metadata?: Record<string, any>;
}

interface StationThroughput {
  stationId: string;
  stationName: string;
  throughputRate: number;
  status: 'ACTIVE' | 'IDLE';
}

interface StaffingRecommendation {
  id: string;
  recommendation: string;
  reasoning: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
}

interface RealTimeInsights {
  eventId: string;
  flowStatus: 'NORMAL' | 'HIGH' | 'LOW';
  activeAlerts: Alert[];
  estimatedTimeToCapacity: number;
  stationMetrics: StationThroughput[];
  recommendations: StaffingRecommendation[];
}

interface RealTimeInsightsPanelProps {
  eventId?: string;
  insights?: RealTimeInsights;
}

/**
 * Real-time Insights Panel Component
 * 
 * Shows actionable insights and alerts.
 * 
 * Validates: Requirements 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 4.8, 4.9
 */
export const RealTimeInsightsPanel: React.FC<RealTimeInsightsPanelProps> = ({
  eventId: propEventId,
  insights: propInsights
}) => {
  const router = useRouter();
  const eventId = propEventId;

  const [insights, setInsights] = useState<RealTimeInsights | null>(propInsights || null);
  const [loading, setLoading] = useState(!propInsights);
  const [error, setError] = useState<string | null>(null);
  const [dismissedAlerts, setDismissedAlerts] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (propInsights) {
      setInsights(propInsights);
      return;
    }

    if (!eventId) return;

    const fetchInsights = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/events/${eventId}/analytics/insights`);
        if (!response.ok) throw new Error('Failed to fetch insights');
        const result = await response.json();
        setInsights(result);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchInsights();
    const interval = setInterval(fetchInsights, 5000); // Refresh every 5 seconds
    return () => clearInterval(interval);
  }, [eventId, propInsights]);

  const getFlowStatusColor = (status: string): string => {
    switch (status) {
      case 'NORMAL':
        return '#10b981'; // Green
      case 'HIGH':
        return '#ef4444'; // Red
      case 'LOW':
        return '#f59e0b'; // Yellow
      default:
        return '#6b7280'; // Gray
    }
  };

  const getFlowStatusLabel = (status: string): string => {
    switch (status) {
      case 'NORMAL':
        return 'Normal Flow';
      case 'HIGH':
        return 'High Flow';
      case 'LOW':
        return 'Low Flow';
      default:
        return 'Unknown';
    }
  };

  const getSeverityColor = (severity: string): string => {
    switch (severity) {
      case 'INFO':
        return 'bg-blue-50 border-blue-200';
      case 'WARNING':
        return 'bg-yellow-50 border-yellow-200';
      case 'CRITICAL':
        return 'bg-red-50 border-red-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const getSeverityIcon = (severity: string): string => {
    switch (severity) {
      case 'INFO':
        return 'ℹ️';
      case 'WARNING':
        return '⚠️';
      case 'CRITICAL':
        return '🚨';
      default:
        return '•';
    }
  };

  const formatTimeToCapacity = (ms: number): string => {
    if (ms < 0) return 'Already at capacity';
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    }
    return `${seconds}s`;
  };

  const visibleAlerts = insights?.activeAlerts.filter(
    (_, idx) => !dismissedAlerts.has(idx.toString())
  ) || [];

  if (loading && !insights) {
    return <div className="p-4">Loading...</div>;
  }

  if (error && !insights) {
    return <div className="p-4 text-red-600">Error: {error}</div>;
  }

  if (!insights) {
    return <div className="p-4">No data available</div>;
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-6">Real-time Insights</h2>

      {/* Entry Flow Status */}
      <div
        className="p-4 rounded-lg mb-6"
        style={{ backgroundColor: `${getFlowStatusColor(insights.flowStatus)}20` }}
      >
        <p className="text-gray-600 text-sm">Entry Flow Status</p>
        <p
          className="text-3xl font-bold"
          style={{ color: getFlowStatusColor(insights.flowStatus) }}
        >
          {getFlowStatusLabel(insights.flowStatus)}
        </p>
      </div>

      {/* Time to Capacity */}
      <div className="bg-purple-50 p-4 rounded-lg mb-6">
        <p className="text-gray-600 text-sm">Estimated Time to Capacity</p>
        <p className="text-2xl font-bold text-purple-600">
          {formatTimeToCapacity(insights.estimatedTimeToCapacity)}
        </p>
      </div>

      {/* Active Alerts */}
      {visibleAlerts.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-4">Active Alerts</h3>
          <div className="space-y-3">
            {visibleAlerts.map((alert, idx) => (
              <div
                key={idx}
                className={`p-4 rounded-lg border ${getSeverityColor(alert.severity)}`}
              >
                <div className="flex justify-between items-start">
                  <div className="flex items-start gap-3 flex-1">
                    <span className="text-xl">{getSeverityIcon(alert.severity)}</span>
                    <div>
                      <p className="font-medium">{alert.type}</p>
                      <p className="text-sm text-gray-600">{alert.message}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(alert.timestamp).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      const newDismissed = new Set(dismissedAlerts);
                      newDismissed.add(idx.toString());
                      setDismissedAlerts(newDismissed);
                    }}
                    className="text-gray-400 hover:text-gray-600 ml-2"
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Check-in Stations */}
      {insights.stationMetrics.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-4">Active Check-in Stations</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {insights.stationMetrics.map((station) => (
              <div key={station.stationId} className="bg-gray-50 p-4 rounded-lg">
                <div className="flex justify-between items-start mb-2">
                  <p className="font-medium">{station.stationName}</p>
                  <span
                    className={`text-xs px-2 py-1 rounded ${
                      station.status === 'ACTIVE'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {station.status}
                  </span>
                </div>
                <p className="text-sm text-gray-600">
                  Throughput: {station.throughputRate.toFixed(1)} check-ins/min
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Staffing Recommendations */}
      {insights.recommendations.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-4">Staffing Recommendations</h3>
          <div className="space-y-3">
            {insights.recommendations.map((rec) => (
              <div
                key={rec.id}
                className={`p-4 rounded-lg border-l-4 ${
                  rec.priority === 'HIGH'
                    ? 'border-red-500 bg-red-50'
                    : rec.priority === 'MEDIUM'
                    ? 'border-yellow-500 bg-yellow-50'
                    : 'border-blue-500 bg-blue-50'
                }`}
              >
                <p className="font-medium">{rec.recommendation}</p>
                <p className="text-sm text-gray-600 mt-1">{rec.reasoning}</p>
                <span
                  className={`inline-block text-xs px-2 py-1 rounded mt-2 ${
                    rec.priority === 'HIGH'
                      ? 'bg-red-100 text-red-800'
                      : rec.priority === 'MEDIUM'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-blue-100 text-blue-800'
                  }`}
                >
                  {rec.priority} Priority
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default RealTimeInsightsPanel;


import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface LiveAttendanceMetrics {
  eventId: string;
  checkedInCount: number;
  totalCapacity: number;
  occupancyPercentage: number;
  capacityStatus: 'NORMAL' | 'WARNING' | 'CRITICAL' | 'FULL';
  noShowCount: number;
  lateArrivals: number;
  earlyArrivals: number;
  attendanceRate: number;
  lastUpdateTime: string;
}

interface LiveAttendanceDashboardProps {
  eventId?: string;
  onWebSocketConnect?: (handler: any) => void;
}

/**
 * Live Attendance Dashboard Component
 * 
 * Displays real-time check-in numbers and capacity status.
 * 
 * Validates: Requirements 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 1.8, 1.9, 1.10
 */
export const LiveAttendanceDashboard: React.FC<LiveAttendanceDashboardProps> = ({
  eventId: propEventId,
  onWebSocketConnect
}) => {
  const router = useRouter();
  const eventId = propEventId;

  const [metrics, setMetrics] = useState<LiveAttendanceMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected' | 'connecting'>('disconnected');

  // Fetch live metrics
  useEffect(() => {
    if (!eventId) return;

    const fetchMetrics = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/events/${eventId}/analytics/live`);
        if (!response.ok) throw new Error('Failed to fetch metrics');
        const data = await response.json();
        setMetrics(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
    const interval = setInterval(fetchMetrics, 5000); // Refresh every 5 seconds
    return () => clearInterval(interval);
  }, [eventId]);

  // Setup WebSocket connection
  useEffect(() => {
    if (!eventId) return;

    setConnectionStatus('connecting');
    
    // Simulate WebSocket connection
    const connectWebSocket = () => {
      try {
        // In a real implementation, this would establish a WebSocket connection
        setConnectionStatus('connected');
        
        if (onWebSocketConnect) {
          onWebSocketConnect({
            onUpdate: (data: LiveAttendanceMetrics) => {
              setMetrics(data);
            },
            onError: (error: Error) => {
              setError(error.message);
              setConnectionStatus('disconnected');
            }
          });
        }
      } catch (err) {
        setConnectionStatus('disconnected');
        setError(err instanceof Error ? err.message : 'WebSocket connection failed');
      }
    };

    connectWebSocket();
  }, [eventId, onWebSocketConnect]);

  const getCapacityStatusColor = (status: string): string => {
    switch (status) {
      case 'NORMAL':
        return '#10b981'; // Green
      case 'WARNING':
        return '#f59e0b'; // Yellow
      case 'CRITICAL':
        return '#ef4444'; // Red
      case 'FULL':
        return '#7c3aed'; // Purple
      default:
        return '#6b7280'; // Gray
    }
  };

  const getCapacityStatusLabel = (status: string): string => {
    switch (status) {
      case 'NORMAL':
        return 'Normal';
      case 'WARNING':
        return 'Warning';
      case 'CRITICAL':
        return 'Critical';
      case 'FULL':
        return 'Full';
      default:
        return 'Unknown';
    }
  };

  if (loading && !metrics) {
    return <div className="p-4">Loading...</div>;
  }

  if (error && !metrics) {
    return <div className="p-4 text-red-600">Error: {error}</div>;
  }

  if (!metrics) {
    return <div className="p-4">No data available</div>;
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Live Attendance Dashboard</h2>
        <div className="flex items-center gap-2">
          <div
            className="w-3 h-3 rounded-full"
            style={{
              backgroundColor: connectionStatus === 'connected' ? '#10b981' : '#ef4444'
            }}
          />
          <span className="text-sm text-gray-600">
            {connectionStatus === 'connected' ? 'Connected' : 'Disconnected'}
          </span>
        </div>
      </div>

      {/* Main Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Checked-in Count */}
        <div className="bg-blue-50 p-4 rounded-lg">
          <p className="text-gray-600 text-sm">Checked In</p>
          <p className="text-3xl font-bold text-blue-600">{metrics.checkedInCount}</p>
        </div>

        {/* Capacity Status */}
        <div
          className="p-4 rounded-lg"
          style={{ backgroundColor: `${getCapacityStatusColor(metrics.capacityStatus)}20` }}
        >
          <p className="text-gray-600 text-sm">Capacity Status</p>
          <p
            className="text-3xl font-bold"
            style={{ color: getCapacityStatusColor(metrics.capacityStatus) }}
          >
            {getCapacityStatusLabel(metrics.capacityStatus)}
          </p>
        </div>
      </div>

      {/* Occupancy Percentage */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <p className="text-gray-600">Occupancy</p>
          <p className="text-lg font-semibold">{metrics.occupancyPercentage.toFixed(1)}%</p>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-4">
          <div
            className="h-4 rounded-full transition-all"
            style={{
              width: `${Math.min(metrics.occupancyPercentage, 100)}%`,
              backgroundColor: getCapacityStatusColor(metrics.capacityStatus)
            }}
          />
        </div>
        <p className="text-sm text-gray-500 mt-1">
          {metrics.checkedInCount} / {metrics.totalCapacity}
        </p>
      </div>

      {/* Additional Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gray-50 p-3 rounded">
          <p className="text-gray-600 text-xs">No-Shows</p>
          <p className="text-xl font-bold">{metrics.noShowCount}</p>
        </div>
        <div className="bg-gray-50 p-3 rounded">
          <p className="text-gray-600 text-xs">Late Arrivals</p>
          <p className="text-xl font-bold">{metrics.lateArrivals}</p>
        </div>
        <div className="bg-gray-50 p-3 rounded">
          <p className="text-gray-600 text-xs">Early Arrivals</p>
          <p className="text-xl font-bold">{metrics.earlyArrivals}</p>
        </div>
        <div className="bg-gray-50 p-3 rounded">
          <p className="text-gray-600 text-xs">Attendance Rate</p>
          <p className="text-xl font-bold">{metrics.attendanceRate.toFixed(1)}%</p>
        </div>
      </div>

      {/* Last Update */}
      <div className="text-right text-xs text-gray-500">
        Last updated: {new Date(metrics.lastUpdateTime).toLocaleTimeString()}
      </div>
    </div>
  );
};

export default LiveAttendanceDashboard;


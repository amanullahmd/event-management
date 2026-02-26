import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface Anomaly {
  time: string;
  type: 'SPIKE' | 'DROP';
  magnitude: number;
}

interface EntryTimeAnalytics {
  eventId: string;
  hourlyDistribution: Record<number, number>;
  peakHour: number;
  peakHourPercentage: number;
  checkInRatePerHour: Record<number, number>;
  flowAnomalies: Anomaly[];
  averageTimeBetweenCheckIns: number;
  ticketTypeDistribution: Record<string, number>;
}

interface EntryTimeAnalyticsComponentProps {
  eventId?: string;
  data?: EntryTimeAnalytics;
}

/**
 * Entry Time Analytics Component
 * 
 * Displays entry time patterns and peak hours.
 * 
 * Validates: Requirements 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8
 */
export const EntryTimeAnalyticsComponent: React.FC<EntryTimeAnalyticsComponentProps> = ({
  eventId: propEventId,
  data: propData
}) => {
  const router = useRouter();
  const eventId = propEventId;

  const [data, setData] = useState<EntryTimeAnalytics | null>(propData || null);
  const [loading, setLoading] = useState(!propData);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (propData) {
      setData(propData);
      return;
    }

    if (!eventId) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/events/${eventId}/analytics/entry-time`);
        if (!response.ok) throw new Error('Failed to fetch entry time analytics');
        const result = await response.json();
        setData(result);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 10000); // Refresh every 10 seconds
    return () => clearInterval(interval);
  }, [eventId, propData]);

  if (loading && !data) {
    return <div className="p-4">Loading...</div>;
  }

  if (error && !data) {
    return <div className="p-4 text-red-600">Error: {error}</div>;
  }

  if (!data) {
    return <div className="p-4">No data available</div>;
  }

  const hours = Array.from({ length: 24 }, (_, i) => i);
  const maxCheckIns = Math.max(...Object.values(data.hourlyDistribution), 1);

  return (
    <div className="p-6 bg-white rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-6">Entry Time Analytics</h2>

      {/* Peak Hour Summary */}
      <div className="bg-blue-50 p-4 rounded-lg mb-6">
        <p className="text-gray-600 text-sm">Peak Entry Hour</p>
        <p className="text-3xl font-bold text-blue-600">
          {data.peakHour}:00 - {data.peakHour + 1}:00
        </p>
        <p className="text-sm text-gray-600 mt-1">
          {data.peakHourPercentage.toFixed(1)}% of total check-ins
        </p>
      </div>

      {/* Hourly Distribution Chart */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-4">Hourly Check-in Distribution</h3>
        <div className="space-y-2">
          {hours.map((hour) => {
            const count = data.hourlyDistribution[hour] || 0;
            const percentage = (count / maxCheckIns) * 100;
            const isPeakHour = hour === data.peakHour;

            return (
              <div key={hour} className="flex items-center gap-4">
                <div className="w-12 text-sm font-medium text-gray-600">
                  {hour}:00
                </div>
                <div className="flex-1">
                  <div className="bg-gray-200 rounded-full h-6 overflow-hidden">
                    <div
                      className={`h-6 rounded-full transition-all flex items-center justify-end pr-2 ${
                        isPeakHour ? 'bg-red-500' : 'bg-blue-500'
                      }`}
                      style={{ width: `${percentage}%` }}
                    >
                      {percentage > 10 && (
                        <span className="text-xs font-bold text-white">{count}</span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="w-16 text-right text-sm text-gray-600">
                  {count} ({(data.checkInRatePerHour[hour] || 0).toFixed(2)}/min)
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Average Time Between Check-ins */}
      <div className="bg-gray-50 p-4 rounded-lg mb-6">
        <p className="text-gray-600 text-sm">Average Time Between Check-ins</p>
        <p className="text-2xl font-bold text-gray-800">
          {data.averageTimeBetweenCheckIns.toFixed(1)}s
        </p>
      </div>

      {/* Anomalies */}
      {data.flowAnomalies.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-4">Entry Flow Anomalies</h3>
          <div className="space-y-2">
            {data.flowAnomalies.map((anomaly, idx) => (
              <div
                key={idx}
                className={`p-3 rounded-lg ${
                  anomaly.type === 'SPIKE'
                    ? 'bg-red-50 border border-red-200'
                    : 'bg-yellow-50 border border-yellow-200'
                }`}
              >
                <div className="flex justify-between items-center">
                  <span className="font-medium">
                    {anomaly.type === 'SPIKE' ? '📈 Spike' : '📉 Drop'}
                  </span>
                  <span className="text-sm text-gray-600">{anomaly.time}</span>
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  Magnitude: {anomaly.magnitude.toFixed(1)}%
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Ticket Type Distribution */}
      {Object.keys(data.ticketTypeDistribution).length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-4">Ticket Type Distribution</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {Object.entries(data.ticketTypeDistribution).map(([type, count]) => (
              <div key={type} className="bg-gray-50 p-3 rounded">
                <p className="text-gray-600 text-xs">{type}</p>
                <p className="text-xl font-bold">{count}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default EntryTimeAnalyticsComponent;

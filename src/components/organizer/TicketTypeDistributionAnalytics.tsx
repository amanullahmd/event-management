import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface TicketTypeDistribution {
  ticketTypeName: string;
  totalSold: number;
  checkedIn: number;
  checkInPercentage: number;
  noShowCount: number;
  flaggedForInvestigation: boolean;
}

interface TicketTypeDistributionAnalyticsProps {
  eventId?: string;
  distribution?: TicketTypeDistribution[];
}

/**
 * Ticket Type Distribution Analytics Component
 * 
 * Shows check-in breakdown by ticket type.
 * 
 * Validates: Requirements 6.1, 6.2, 6.3, 6.4, 6.5
 */
export const TicketTypeDistributionAnalytics: React.FC<TicketTypeDistributionAnalyticsProps> = ({
  eventId: propEventId,
  distribution: propDistribution
}) => {
  const router = useRouter();
  const eventId = propEventId;

  const [distribution, setDistribution] = useState<TicketTypeDistribution[]>(
    propDistribution || []
  );
  const [loading, setLoading] = useState(!propDistribution);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (propDistribution) {
      setDistribution(propDistribution);
      return;
    }

    if (!eventId) return;

    const fetchDistribution = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/events/${eventId}/analytics/ticket-types`);
        if (!response.ok) throw new Error('Failed to fetch ticket type distribution');
        const result = await response.json();
        setDistribution(result);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchDistribution();
    const interval = setInterval(fetchDistribution, 10000); // Refresh every 10 seconds
    return () => clearInterval(interval);
  }, [eventId, propDistribution]);

  const calculateAverageCheckInRate = (): number => {
    if (distribution.length === 0) return 0;
    const sum = distribution.reduce((acc, d) => acc + d.checkInPercentage, 0);
    return sum / distribution.length;
  };

  const getTotalTicketsSold = (): number => {
    return distribution.reduce((sum, d) => sum + d.totalSold, 0);
  };

  const getTotalCheckedIn = (): number => {
    return distribution.reduce((sum, d) => sum + d.checkedIn, 0);
  };

  const getTotalNoShows = (): number => {
    return distribution.reduce((sum, d) => sum + d.noShowCount, 0);
  };

  if (loading && distribution.length === 0) {
    return <div className="p-4">Loading...</div>;
  }

  if (error && distribution.length === 0) {
    return <div className="p-4 text-red-600">Error: {error}</div>;
  }

  if (distribution.length === 0) {
    return <div className="p-4">No ticket type data available</div>;
  }

  const avgCheckInRate = calculateAverageCheckInRate();
  const totalSold = getTotalTicketsSold();
  const totalCheckedIn = getTotalCheckedIn();
  const totalNoShows = getTotalNoShows();

  return (
    <div className="p-6 bg-white rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-6">Ticket Type Distribution Analytics</h2>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 p-4 rounded-lg">
          <p className="text-gray-600 text-sm">Total Sold</p>
          <p className="text-2xl font-bold text-blue-600">{totalSold}</p>
        </div>
        <div className="bg-green-50 p-4 rounded-lg">
          <p className="text-gray-600 text-sm">Checked In</p>
          <p className="text-2xl font-bold text-green-600">{totalCheckedIn}</p>
        </div>
        <div className="bg-red-50 p-4 rounded-lg">
          <p className="text-gray-600 text-sm">No-Shows</p>
          <p className="text-2xl font-bold text-red-600">{totalNoShows}</p>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg">
          <p className="text-gray-600 text-sm">Avg Check-in Rate</p>
          <p className="text-2xl font-bold text-purple-600">{avgCheckInRate.toFixed(1)}%</p>
        </div>
      </div>

      {/* Ticket Type Details Table */}
      <div className="overflow-x-auto mb-6">
        <table className="w-full">
          <thead>
            <tr className="border-b-2 border-gray-300">
              <th className="text-left py-3 px-4 font-semibold">Ticket Type</th>
              <th className="text-right py-3 px-4 font-semibold">Total Sold</th>
              <th className="text-right py-3 px-4 font-semibold">Checked In</th>
              <th className="text-right py-3 px-4 font-semibold">Check-in %</th>
              <th className="text-right py-3 px-4 font-semibold">No-Shows</th>
              <th className="text-center py-3 px-4 font-semibold">Status</th>
            </tr>
          </thead>
          <tbody>
            {distribution.map((ticket) => (
              <tr
                key={ticket.ticketTypeName}
                className={`border-b border-gray-200 ${
                  ticket.flaggedForInvestigation ? 'bg-red-50' : ''
                }`}
              >
                <td className="py-3 px-4 font-medium">{ticket.ticketTypeName}</td>
                <td className="py-3 px-4 text-right">{ticket.totalSold}</td>
                <td className="py-3 px-4 text-right">{ticket.checkedIn}</td>
                <td className="py-3 px-4 text-right">
                  <span
                    className={`px-2 py-1 rounded text-sm font-medium ${
                      ticket.checkInPercentage >= avgCheckInRate
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {ticket.checkInPercentage.toFixed(1)}%
                  </span>
                </td>
                <td className="py-3 px-4 text-right">{ticket.noShowCount}</td>
                <td className="py-3 px-4 text-center">
                  {ticket.flaggedForInvestigation && (
                    <span className="text-lg" title="Flagged for investigation">
                      🚩
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Flagged Ticket Types */}
      {distribution.some((d) => d.flaggedForInvestigation) && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-red-800 mb-3">Ticket Types Flagged for Investigation</h3>
          <div className="space-y-2">
            {distribution
              .filter((d) => d.flaggedForInvestigation)
              .map((ticket) => (
                <div key={ticket.ticketTypeName} className="text-sm text-red-700">
                  <p className="font-medium">{ticket.ticketTypeName}</p>
                  <p className="text-xs text-red-600">
                    Check-in rate: {ticket.checkInPercentage.toFixed(1)}% (below average of{' '}
                    {avgCheckInRate.toFixed(1)}%)
                  </p>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Visualization - Pie Chart Representation */}
      <div className="mt-6">
        <h3 className="text-lg font-semibold mb-4">Check-in Rate by Ticket Type</h3>
        <div className="space-y-3">
          {distribution.map((ticket) => {
            const percentage = (ticket.checkedIn / totalCheckedIn) * 100;
            return (
              <div key={ticket.ticketTypeName}>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium">{ticket.ticketTypeName}</span>
                  <span className="text-sm text-gray-600">{percentage.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className={`h-3 rounded-full transition-all ${
                      ticket.checkInPercentage >= avgCheckInRate
                        ? 'bg-green-500'
                        : 'bg-red-500'
                    }`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default TicketTypeDistributionAnalytics;

'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/modules/shared-common/components/ui/card';
import { Badge } from '@/modules/shared-common/components/ui/badge';
import { Spinner } from '@/modules/shared-common/components/ui/spinner';
import { Progress } from '@/modules/shared-common/components/ui/progress';

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

const STATUS_VARIANT: Record<string, 'success' | 'warning' | 'error' | 'secondary'> = {
  NORMAL: 'success',
  WARNING: 'warning',
  CRITICAL: 'error',
  FULL: 'secondary',
};

/**
 * Live Attendance Dashboard Component
 *
 * Displays real-time check-in numbers and capacity status.
 *
 * Validates: Requirements 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 1.8, 1.9, 1.10
 */
export const LiveAttendanceDashboard: React.FC<LiveAttendanceDashboardProps> = ({
  eventId: propEventId,
  onWebSocketConnect,
}) => {
  const eventId = propEventId;
  const [metrics, setMetrics] = useState<LiveAttendanceMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected' | 'connecting'>('disconnected');

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
    const interval = setInterval(fetchMetrics, 5000);
    return () => clearInterval(interval);
  }, [eventId]);

  useEffect(() => {
    if (!eventId) return;
    setConnectionStatus('connecting');
    try {
      setConnectionStatus('connected');
      if (onWebSocketConnect) {
        onWebSocketConnect({
          onUpdate: (data: LiveAttendanceMetrics) => setMetrics(data),
          onError: (err: Error) => {
            setError(err.message);
            setConnectionStatus('disconnected');
          },
        });
      }
    } catch (err) {
      setConnectionStatus('disconnected');
    }
  }, [eventId, onWebSocketConnect]);

  if (loading && !metrics) {
    return (
      <div className="flex items-center justify-center p-12">
        <Spinner size="lg" label="Loading attendance data..." />
      </div>
    );
  }

  if (error && !metrics) {
    return (
      <Card variant="outlined" className="border-(--color-error)">
        <CardContent className="p-6 text-(--color-error)">Error: {error}</CardContent>
      </Card>
    );
  }

  if (!metrics) {
    return (
      <Card variant="outlined">
        <CardContent className="p-6 text-(--color-text-secondary)">No data available</CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card variant="elevated">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Live Attendance Dashboard</CardTitle>
            <div className="flex items-center gap-2">
              <span
                className="w-2.5 h-2.5 rounded-full"
                style={{
                  backgroundColor:
                    connectionStatus === 'connected'
                      ? 'var(--color-success)'
                      : 'var(--color-error)',
                }}
                aria-hidden="true"
              />
              <span className="text-sm text-(--color-text-secondary)">
                {connectionStatus === 'connected' ? 'Live' : 'Disconnected'}
              </span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Key metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="rounded-lg bg-(--color-primary-light) p-4">
              <p className="text-sm text-(--color-text-secondary)">Checked In</p>
              <p className="text-3xl font-bold text-(--color-primary)">{metrics.checkedInCount}</p>
            </div>
            <div className="rounded-lg bg-(--color-surface) p-4 border border-(--color-border)">
              <p className="text-sm text-(--color-text-secondary)">Capacity Status</p>
              <div className="mt-1">
                <Badge variant={STATUS_VARIANT[metrics.capacityStatus] ?? 'secondary'} size="lg">
                  {metrics.capacityStatus}
                </Badge>
              </div>
            </div>
          </div>

          {/* Occupancy bar */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-(--color-text-secondary)">Occupancy</span>
              <span className="text-sm font-semibold text-(--color-text-primary)">
                {metrics.occupancyPercentage.toFixed(1)}%
              </span>
            </div>
            <Progress value={Math.min(metrics.occupancyPercentage, 100)} />
            <p className="text-xs text-(--color-text-tertiary) mt-1">
              {metrics.checkedInCount} / {metrics.totalCapacity}
            </p>
          </div>

          {/* Secondary metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'No-Shows', value: metrics.noShowCount },
              { label: 'Late Arrivals', value: metrics.lateArrivals },
              { label: 'Early Arrivals', value: metrics.earlyArrivals },
              { label: 'Attendance Rate', value: `${metrics.attendanceRate.toFixed(1)}%` },
            ].map(({ label, value }) => (
              <div
                key={label}
                className="rounded-lg bg-(--color-surface) border border-(--color-border) p-3 text-center"
              >
                <p className="text-xs text-(--color-text-secondary)">{label}</p>
                <p className="text-xl font-bold text-(--color-text-primary) mt-1">{value}</p>
              </div>
            ))}
          </div>

          <p className="text-xs text-(--color-text-tertiary) text-right">
            Last updated: {new Date(metrics.lastUpdateTime).toLocaleTimeString()}
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default LiveAttendanceDashboard;

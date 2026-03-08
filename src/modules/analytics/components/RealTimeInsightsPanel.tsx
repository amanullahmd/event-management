'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/modules/shared-common/components/ui/card';
import { Badge } from '@/modules/shared-common/components/ui/badge';
import { Button } from '@/modules/shared-common/components/ui/button';
import { Spinner } from '@/modules/shared-common/components/ui/spinner';

interface AlertItem {
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
  activeAlerts: AlertItem[];
  estimatedTimeToCapacity: number;
  stationMetrics: StationThroughput[];
  recommendations: StaffingRecommendation[];
}

interface RealTimeInsightsPanelProps {
  eventId?: string;
  insights?: RealTimeInsights;
}

const FLOW_VARIANT: Record<string, 'success' | 'error' | 'warning'> = {
  NORMAL: 'success',
  HIGH: 'error',
  LOW: 'warning',
};

const SEVERITY_VARIANT: Record<string, 'info' | 'warning' | 'error'> = {
  INFO: 'info',
  WARNING: 'warning',
  CRITICAL: 'error',
};

const PRIORITY_VARIANT: Record<string, 'error' | 'warning' | 'info'> = {
  HIGH: 'error',
  MEDIUM: 'warning',
  LOW: 'info',
};

const formatTimeToCapacity = (ms: number): string => {
  if (ms < 0) return 'Already at capacity';
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  return minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`;
};

/**
 * Real-time Insights Panel Component
 *
 * Shows actionable insights and alerts.
 *
 * Validates: Requirements 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 4.8, 4.9
 */
export const RealTimeInsightsPanel: React.FC<RealTimeInsightsPanelProps> = ({
  eventId: propEventId,
  insights: propInsights,
}) => {
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
        setInsights(await response.json());
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchInsights();
    const interval = setInterval(fetchInsights, 5000);
    return () => clearInterval(interval);
  }, [eventId, propInsights]);

  if (loading && !insights) {
    return (
      <div className="flex items-center justify-center p-12">
        <Spinner size="lg" label="Loading insights..." />
      </div>
    );
  }

  if (error && !insights) {
    return (
      <Card variant="outlined" className="border-(--color-error)">
        <CardContent className="p-6 text-(--color-error)">Error: {error}</CardContent>
      </Card>
    );
  }

  if (!insights) {
    return (
      <Card variant="outlined">
        <CardContent className="p-6 text-(--color-text-secondary)">No data available</CardContent>
      </Card>
    );
  }

  const visibleAlerts = insights.activeAlerts.filter((_, idx) => !dismissedAlerts.has(idx.toString()));

  return (
    <div className="space-y-4">
      {/* Flow status + time to capacity */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card variant="elevated">
          <CardContent className="p-4">
            <p className="text-sm text-(--color-text-secondary)">Entry Flow Status</p>
            <div className="mt-2">
              <Badge variant={FLOW_VARIANT[insights.flowStatus] ?? 'secondary'} size="lg">
                {insights.flowStatus === 'NORMAL' ? 'Normal Flow' : insights.flowStatus === 'HIGH' ? 'High Flow' : 'Low Flow'}
              </Badge>
            </div>
          </CardContent>
        </Card>
        <Card variant="elevated">
          <CardContent className="p-4">
            <p className="text-sm text-(--color-text-secondary)">Estimated Time to Capacity</p>
            <p className="text-2xl font-bold text-(--color-secondary) mt-1">
              {formatTimeToCapacity(insights.estimatedTimeToCapacity)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Active alerts */}
      {visibleAlerts.length > 0 && (
        <Card variant="elevated">
          <CardHeader>
            <CardTitle>Active Alerts</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {visibleAlerts.map((alert, idx) => (
              <div
                key={idx}
                className="flex items-start justify-between gap-3 rounded-lg border border-(--color-border) bg-(--color-surface) p-3"
              >
                <div className="flex items-start gap-3 flex-1">
                  <Badge variant={SEVERITY_VARIANT[alert.severity] ?? 'secondary'} dot className="mt-0.5">
                    {alert.severity}
                  </Badge>
                  <div>
                    <p className="font-medium text-(--color-text-primary)">{alert.type}</p>
                    <p className="text-sm text-(--color-text-secondary)">{alert.message}</p>
                    <p className="text-xs text-(--color-text-tertiary) mt-1">
                      {new Date(alert.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  aria-label="Dismiss alert"
                  onClick={() => {
                    const next = new Set(dismissedAlerts);
                    next.add(idx.toString());
                    setDismissedAlerts(next);
                  }}
                >
                  ✕
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Check-in stations */}
      {insights.stationMetrics.length > 0 && (
        <Card variant="elevated">
          <CardHeader>
            <CardTitle>Check-in Stations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {insights.stationMetrics.map((station) => (
                <div
                  key={station.stationId}
                  className="rounded-lg bg-(--color-surface) border border-(--color-border) p-3"
                >
                  <div className="flex items-center justify-between mb-1">
                    <p className="font-medium text-(--color-text-primary)">{station.stationName}</p>
                    <Badge variant={station.status === 'ACTIVE' ? 'success' : 'secondary'} size="sm">
                      {station.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-(--color-text-secondary)">
                    {station.throughputRate.toFixed(1)} check-ins/min
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Staffing recommendations */}
      {insights.recommendations.length > 0 && (
        <Card variant="elevated">
          <CardHeader>
            <CardTitle>Staffing Recommendations</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {insights.recommendations.map((rec) => (
              <div
                key={rec.id}
                className="rounded-lg bg-(--color-surface) border border-(--color-border) p-3"
              >
                <div className="flex items-start justify-between gap-2 mb-1">
                  <p className="font-medium text-(--color-text-primary)">{rec.recommendation}</p>
                  <Badge variant={PRIORITY_VARIANT[rec.priority] ?? 'secondary'} size="sm">
                    {rec.priority}
                  </Badge>
                </div>
                <p className="text-sm text-(--color-text-secondary)">{rec.reasoning}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default RealTimeInsightsPanel;

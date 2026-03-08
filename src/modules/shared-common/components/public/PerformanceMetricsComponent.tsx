'use client';

import React from 'react';
import type { PerformanceMetrics } from '@/lib/types/organizer-trust-profiles';
import { Card } from '@/modules/shared-common/components/ui/card';

interface PerformanceMetricsComponentProps {
  metrics: PerformanceMetrics;
}

export const PerformanceMetricsComponent: React.FC<PerformanceMetricsComponentProps> = ({
  metrics,
}) => {
  const hasInsufficientData = metrics.completedEvents < 3;

  const MetricCard = ({
    label,
    value,
    unit = '',
  }: {
    label: string;
    value: string | number;
    unit?: string;
  }) => (
    <Card className="p-6 text-center">
      <p className="text-gray-600 text-sm font-medium mb-2">{label}</p>
      <p className="text-3xl font-bold text-primary">
        {value}
        {unit && <span className="text-lg ml-1">{unit}</span>}
      </p>
    </Card>
  );

  if (hasInsufficientData) {
    return (
      <Card className="p-8 bg-yellow-50 border-yellow-200">
        <div className="text-center">
          <p className="text-yellow-800 font-medium mb-2">Insufficient Data</p>
          <p className="text-yellow-700 text-sm">
            Metrics will be available after {3 - metrics.completedEvents} more completed event(s)
          </p>
        </div>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <MetricCard label="Total Events Created" value={metrics.totalEventsCreated} />
      <MetricCard
        label="Event Completion Rate"
        value={metrics.eventCompletionRate.toFixed(1)}
        unit="%"
      />
      <MetricCard
        label="Average Attendance Rate"
        value={metrics.averageAttendanceRate.toFixed(1)}
        unit="%"
      />
      <MetricCard
        label="Average Ticket Sales per Event"
        value={metrics.averageTicketSalesPerEvent.toFixed(0)}
      />
      <MetricCard
        label="Completed Events"
        value={metrics.completedEvents}
      />
      <MetricCard
        label="Cancelled Events"
        value={metrics.cancelledEvents}
      />
    </div>
  );
};


/**
 * Analytics Type Definitions
 */

export interface CheckInStatistics {
  totalCheckIns: number;
  uniqueAttendees: number;
  checkInRate: number;
  averageCheckInTime: string;
  peakCheckInTime: string;
}

export interface LiveAttendanceMetrics {
  currentAttendees: number;
  totalCapacity: number;
  occupancyRate: number;
  checkInsPerMinute: number;
  estimatedTotalAttendees: number;
}

export interface AnalyticsEvent {
  id: string;
  eventId: string;
  eventName: string;
  timestamp: string;
  type: 'check_in' | 'check_out' | 'view' | 'purchase';
  userId: string;
  metadata?: Record<string, any>;
}

export interface AnalyticsMetric {
  id: string;
  name: string;
  value: number;
  unit: string;
  timestamp: string;
  tags?: Record<string, string>;
}

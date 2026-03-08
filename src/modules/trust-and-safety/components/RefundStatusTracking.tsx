'use client';

import React, { useEffect, useState } from 'react';
import { AlertCircle, CheckCircle, Clock, XCircle, Loader } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/modules/shared-common/components/ui/card';
import { Badge } from '@/modules/shared-common/components/ui/badge';
import { Button } from '@/modules/shared-common/components/ui/button';
import { Spinner } from '@/modules/shared-common/components/ui/spinner';

interface TimelineEvent {
  status: string;
  timestamp: string;
  description: string;
}

interface RefundRequest {
  id: string;
  ticketId: string;
  status: string;
  reason: string;
  refundAmount: number;
  originalAmount: number;
  refundPercentage: number;
  createdAt: string;
  updatedAt: string;
  approvedAt?: string;
  rejectedAt?: string;
  completedAt?: string;
  rejectionReason?: string;
}

interface RefundStatusTrackingProps {
  ticketId: string;
  onStatusChange?: (status: string) => void;
}

const STATUS_BADGE_VARIANT: Record<string, 'warning' | 'info' | 'error' | 'secondary' | 'success'> = {
  pending_review: 'warning',
  approved: 'info',
  rejected: 'error',
  processing: 'info',
  completed: 'success',
  failed: 'error',
  auto_refund_initiated: 'info',
};

const STATUS_ICON: Record<string, React.ReactNode> = {
  pending_review: <Clock className="w-4 h-4" />,
  approved: <CheckCircle className="w-4 h-4" />,
  rejected: <XCircle className="w-4 h-4" />,
  processing: <Loader className="w-4 h-4 animate-spin" />,
  completed: <CheckCircle className="w-4 h-4" />,
  failed: <AlertCircle className="w-4 h-4" />,
  auto_refund_initiated: <CheckCircle className="w-4 h-4" />,
};

export const RefundStatusTracking: React.FC<RefundStatusTrackingProps> = ({
  ticketId,
  onStatusChange,
}) => {
  const [refundRequest, setRefundRequest] = useState<RefundRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeline, setTimeline] = useState<TimelineEvent[]>([]);

  useEffect(() => {
    const fetchRefundStatus = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/v1/tickets/${ticketId}/refund-history`);
        if (!response.ok) {
          if (response.status === 404) { setRefundRequest(null); return; }
          throw new Error('Failed to fetch refund status');
        }
        const data = await response.json();
        setRefundRequest(data.refundRequest);
        setTimeline(data.timeline || []);
        onStatusChange?.(data.refundRequest.status);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load refund status');
      } finally {
        setLoading(false);
      }
    };

    fetchRefundStatus();
    const interval = setInterval(fetchRefundStatus, 30000);
    return () => clearInterval(interval);
  }, [ticketId, onStatusChange]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Spinner size="md" label="Loading refund status..." />
      </div>
    );
  }

  if (error) {
    return (
      <Card variant="outlined" className="border-(--color-error)">
        <CardContent className="p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-(--color-error) shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-(--color-text-primary)">Error Loading Status</p>
            <p className="text-sm text-(--color-text-secondary)">{error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!refundRequest) {
    return (
      <Card variant="outlined">
        <CardContent className="p-4 text-sm text-(--color-text-secondary)">
          No refund request found for this ticket.
        </CardContent>
      </Card>
    );
  }

  const statusLabel = refundRequest.status
    .split('_')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');

  return (
    <div className="space-y-4">
      {/* Current status card */}
      <Card variant="elevated">
        <CardHeader>
          <div className="flex items-center gap-2">
            <span className="text-(--color-text-secondary)">
              {STATUS_ICON[refundRequest.status]}
            </span>
            <CardTitle>{statusLabel}</CardTitle>
            <Badge variant={STATUS_BADGE_VARIANT[refundRequest.status] ?? 'secondary'}>
              {refundRequest.status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 text-sm mb-3">
            <div>
              <p className="text-(--color-text-secondary)">Refund Amount</p>
              <p className="text-lg font-semibold text-(--color-text-primary)">
                ${refundRequest.refundAmount.toFixed(2)}
              </p>
            </div>
            <div>
              <p className="text-(--color-text-secondary)">Refund Percentage</p>
              <p className="text-lg font-semibold text-(--color-text-primary)">
                {refundRequest.refundPercentage}%
              </p>
            </div>
          </div>
          {refundRequest.rejectionReason && (
            <div className="border-t border-(--color-border) pt-3">
              <p className="text-sm font-medium text-(--color-text-primary)">Rejection Reason:</p>
              <p className="text-sm text-(--color-text-secondary) mt-1">{refundRequest.rejectionReason}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Timeline */}
      {timeline.length > 0 && (
        <Card variant="elevated">
          <CardHeader>
            <CardTitle>Refund Timeline</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {timeline.map((event, index) => (
                <div key={index} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-2.5 h-2.5 rounded-full bg-(--color-primary)" />
                    {index < timeline.length - 1 && (
                      <div className="w-px flex-1 bg-(--color-border) my-1" />
                    )}
                  </div>
                  <div className="pb-4">
                    <p className="font-medium text-(--color-text-primary)">{event.description}</p>
                    <p className="text-sm text-(--color-text-secondary)">
                      {new Date(event.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Status-specific info cards */}
      {refundRequest.status === 'processing' && (
        <Card variant="outlined" className="border-(--color-info)">
          <CardContent className="p-4">
            <p className="font-semibold text-(--color-text-primary) mb-1">Expected Timeline</p>
            <p className="text-sm text-(--color-text-secondary)">
              Your refund should appear in your account within 5-10 business days.
            </p>
          </CardContent>
        </Card>
      )}

      {refundRequest.status === 'completed' && (
        <Card variant="outlined" className="border-(--color-success)">
          <CardContent className="p-4">
            <p className="font-semibold text-(--color-text-primary) mb-1">Refund Completed</p>
            <p className="text-sm text-(--color-text-secondary)">
              Your refund of ${refundRequest.refundAmount.toFixed(2)} has been processed. Please allow
              5-10 business days for funds to appear.
            </p>
          </CardContent>
        </Card>
      )}

      {(refundRequest.status === 'failed' || refundRequest.status === 'rejected') && (
        <Card variant="outlined" className="border-(--color-error)">
          <CardContent className="p-4">
            <p className="font-semibold text-(--color-text-primary) mb-1">
              {refundRequest.status === 'failed' ? 'Refund Failed' : 'Refund Rejected'}
            </p>
            <p className="text-sm text-(--color-text-secondary) mb-3">
              {refundRequest.status === 'failed'
                ? 'The refund could not be processed. Please contact support for assistance.'
                : 'Your refund request has been rejected. You can dispute this decision.'}
            </p>
            {refundRequest.status === 'rejected' && (
              <Button variant="outline" size="sm">Initiate Dispute</Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

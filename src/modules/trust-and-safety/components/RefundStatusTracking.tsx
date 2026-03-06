import React, { useEffect, useState } from 'react';
import { AlertCircle, CheckCircle, Clock, XCircle, Loader } from 'lucide-react';

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

const STATUS_COLORS: Record<string, string> = {
  pending_review: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  approved: 'bg-blue-100 text-blue-800 border-blue-300',
  rejected: 'bg-red-100 text-red-800 border-red-300',
  processing: 'bg-purple-100 text-purple-800 border-purple-300',
  completed: 'bg-green-100 text-green-800 border-green-300',
  failed: 'bg-red-100 text-red-800 border-red-300',
  auto_refund_initiated: 'bg-blue-100 text-blue-800 border-blue-300',
};

const STATUS_ICONS: Record<string, React.ReactNode> = {
  pending_review: <Clock className="w-5 h-5" />,
  approved: <CheckCircle className="w-5 h-5" />,
  rejected: <XCircle className="w-5 h-5" />,
  processing: <Loader className="w-5 h-5 animate-spin" />,
  completed: <CheckCircle className="w-5 h-5" />,
  failed: <AlertCircle className="w-5 h-5" />,
  auto_refund_initiated: <CheckCircle className="w-5 h-5" />,
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
          if (response.status === 404) {
            setRefundRequest(null);
            return;
          }
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
    
    // Poll for updates every 30 seconds
    const interval = setInterval(fetchRefundStatus, 30000);
    return () => clearInterval(interval);
  }, [ticketId, onStatusChange]);

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
          <h3 className="font-semibold text-red-900">Error Loading Status</h3>
          <p className="text-sm text-red-700">{error}</p>
        </div>
      </div>
    );
  }

  if (!refundRequest) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <p className="text-sm text-gray-600">No refund request found for this ticket.</p>
      </div>
    );
  }

  const statusLabel = refundRequest.status
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  return (
    <div className="space-y-6">
      {/* Current Status */}
      <div className={`border rounded-lg p-4 ${STATUS_COLORS[refundRequest.status]}`}>
        <div className="flex items-center gap-3 mb-3">
          {STATUS_ICONS[refundRequest.status]}
          <h3 className="font-semibold text-lg">{statusLabel}</h3>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-600">Refund Amount</p>
            <p className="font-semibold text-lg">${refundRequest.refundAmount.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-gray-600">Refund Percentage</p>
            <p className="font-semibold text-lg">{refundRequest.refundPercentage}%</p>
          </div>
        </div>

        {refundRequest.rejectionReason && (
          <div className="mt-3 pt-3 border-t border-current opacity-75">
            <p className="text-sm font-medium">Rejection Reason:</p>
            <p className="text-sm mt-1">{refundRequest.rejectionReason}</p>
          </div>
        )}
      </div>

      {/* Timeline */}
      {timeline.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h3 className="font-semibold text-gray-900 mb-4">Refund Timeline</h3>
          <div className="space-y-4">
            {timeline.map((event, index) => (
              <div key={index} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                  {index < timeline.length - 1 && (
                    <div className="w-0.5 h-12 bg-gray-300 my-2"></div>
                  )}
                </div>
                <div className="pb-4">
                  <p className="font-medium text-gray-900">{event.description}</p>
                  <p className="text-sm text-gray-600">
                    {new Date(event.timestamp).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Expected Timeline */}
      {refundRequest.status === 'processing' && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-900 mb-2">Expected Timeline</h3>
          <p className="text-sm text-blue-800">
            Your refund should appear in your account within 5-10 business days, depending on your payment method.
          </p>
        </div>
      )}

      {refundRequest.status === 'completed' && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h3 className="font-semibold text-green-900 mb-2">Refund Completed</h3>
          <p className="text-sm text-green-800">
            Your refund of ${refundRequest.refundAmount.toFixed(2)} has been processed. 
            Please allow 5-10 business days for the funds to appear in your account.
          </p>
        </div>
      )}

      {refundRequest.status === 'failed' && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="font-semibold text-red-900 mb-2">Refund Failed</h3>
          <p className="text-sm text-red-800">
            Unfortunately, the refund could not be processed. Please contact support for assistance.
          </p>
        </div>
      )}

      {refundRequest.status === 'rejected' && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="font-semibold text-red-900 mb-2">Refund Rejected</h3>
          <p className="text-sm text-red-800 mb-3">
            Your refund request has been rejected. You can dispute this decision if you believe it was made in error.
          </p>
          <button className="text-sm font-medium text-red-700 hover:text-red-900 underline">
            Initiate Dispute
          </button>
        </div>
      )}
    </div>
  );
};


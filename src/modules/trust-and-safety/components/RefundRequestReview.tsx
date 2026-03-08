import React, { useEffect, useState } from 'react';
import { AlertCircle, CheckCircle, Loader, XCircle } from 'lucide-react';

interface RefundRequest {
  id: string;
  ticketId: string;
  attendeeId: string;
  eventId: string;
  status: string;
  reason: string;
  refundAmount: number;
  originalAmount: number;
  refundPercentage: number;
  createdAt: string;
  updatedAt: string;
}

interface RefundRequestReviewProps {
  eventId: string;
  onRefresh?: () => void;
}

export const RefundRequestReview: React.FC<RefundRequestReviewProps> = ({
  eventId,
  onRefresh,
}) => {
  const [requests, setRequests] = useState<RefundRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [reviewingId, setReviewingId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchRequests();
  }, [eventId]);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/v1/events/${eventId}/refund-requests?status=pending_review`);
      if (!response.ok) throw new Error('Failed to fetch requests');
      const data = await response.json();
      setRequests(data.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load requests');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (requestId: string) => {
    try {
      setActionLoading(true);
      const response = await fetch(`/api/v1/refund-requests/${requestId}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });

      if (!response.ok) throw new Error('Failed to approve request');

      setSuccess(true);
      fetchRequests();
      onRefresh?.();
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to approve request');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (requestId: string) => {
    if (!rejectionReason.trim()) {
      setError('Please provide a reason for rejection');
      return;
    }

    try {
      setActionLoading(true);
      const response = await fetch(`/api/v1/refund-requests/${requestId}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: rejectionReason }),
      });

      if (!response.ok) throw new Error('Failed to reject request');

      setSuccess(true);
      setReviewingId(null);
      setRejectionReason('');
      fetchRequests();
      onRefresh?.();
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reject request');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-gray-900">Pending Refund Requests</h2>

      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-start gap-2">
          <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-green-700">Request processed successfully!</p>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {requests.length === 0 ? (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
          <p className="text-sm text-gray-600">No pending refund requests.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {requests.map((request) => (
            <div key={request.id} className="bg-white border border-gray-200 rounded-lg p-4">
              {reviewingId === request.id ? (
                // Review Form
                <div className="space-y-3">
                  <div className="bg-blue-50 border border-blue-200 rounded p-3">
                    <p className="text-sm font-medium text-blue-900">Request Details</p>
                    <div className="mt-2 space-y-1 text-sm text-blue-800">
                      <p>Reason: {request.reason}</p>
                      <p>Refund Amount: ${request.refundAmount.toFixed(2)} ({request.refundPercentage}%)</p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Rejection Reason (if rejecting)
                    </label>
                    <textarea
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      placeholder="Explain why you're rejecting this request (optional if approving)..."
                      rows={3}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleApprove(request.id)}
                      disabled={actionLoading}
                      className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-lg transition flex items-center justify-center gap-2"
                    >
                      {actionLoading && <Loader className="w-4 h-4 animate-spin" />}
                      Approve
                    </button>
                    <button
                      onClick={() => handleReject(request.id)}
                      disabled={actionLoading}
                      className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-lg transition flex items-center justify-center gap-2"
                    >
                      {actionLoading && <Loader className="w-4 h-4 animate-spin" />}
                      Reject
                    </button>
                    <button
                      onClick={() => {
                        setReviewingId(null);
                        setRejectionReason('');
                      }}
                      disabled={actionLoading}
                      className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-900 font-medium py-2 px-4 rounded-lg transition"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                // Request Summary
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <p className="font-medium text-gray-900">Refund Request</p>
                      <span className="inline-block bg-yellow-100 text-yellow-800 text-xs font-semibold px-2 py-1 rounded">
                        Pending Review
                      </span>
                    </div>
                    <div className="space-y-1 text-sm text-gray-600">
                      <p>Reason: {request.reason}</p>
                      <p>Amount: ${request.refundAmount.toFixed(2)} ({request.refundPercentage}%)</p>
                      <p>Submitted: {new Date(request.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setReviewingId(request.id)}
                    className="ml-4 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition whitespace-nowrap"
                  >
                    Review
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};


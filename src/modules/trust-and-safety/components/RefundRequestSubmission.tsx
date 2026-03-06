import React, { useState } from 'react';
import { AlertCircle, CheckCircle, Loader } from 'lucide-react';

interface RefundRequestSubmissionProps {
  ticketId: string;
  ticketPrice: number;
  refundPercentage: number;
  refundWindowDays: number;
  eventStartDate: string;
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

const REFUND_REASONS = [
  'Schedule conflict',
  'Personal emergency',
  'Event cancelled',
  'Quality concerns',
  'Other',
];

export const RefundRequestSubmission: React.FC<RefundRequestSubmissionProps> = ({
  ticketId,
  ticketPrice,
  refundPercentage,
  refundWindowDays,
  eventStartDate,
  onSuccess,
  onError,
}) => {
  const [reason, setReason] = useState('');
  const [details, setDetails] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  const refundAmount = (ticketPrice * refundPercentage) / 100;
  const eventDate = new Date(eventStartDate);
  const deadline = new Date(eventDate);
  deadline.setDate(deadline.getDate() - refundWindowDays);
  const isWindowExpired = new Date() > deadline;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!reason) {
      setError('Please select a reason for the refund');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/v1/tickets/${ticketId}/refund-request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reason: reason === 'Other' ? details : reason,
          details: reason === 'Other' ? details : undefined,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to submit refund request');
      }

      setSuccess(true);
      setShowForm(false);
      onSuccess?.();
      
      // Reset form after 3 seconds
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to submit refund request';
      setError(errorMsg);
      onError?.(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  if (isWindowExpired) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
        <div>
          <h3 className="font-semibold text-red-900">Refund Window Expired</h3>
          <p className="text-sm text-red-700 mt-1">
            The refund window for this ticket has expired. You can no longer request a refund.
          </p>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3">
        <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
        <div>
          <h3 className="font-semibold text-green-900">Refund Request Submitted</h3>
          <p className="text-sm text-green-700 mt-1">
            Your refund request has been submitted successfully. You'll receive a confirmation email shortly.
          </p>
        </div>
      </div>
    );
  }

  if (!showForm) {
    return (
      <div className="space-y-3">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-gray-700 mb-3">
            You can request a refund of <span className="font-semibold">${refundAmount.toFixed(2)}</span> ({refundPercentage}% of your ticket price).
          </p>
          <button
            onClick={() => setShowForm(true)}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition"
          >
            Request Refund
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-lg p-4 space-y-4">
      <h3 className="font-semibold text-gray-900">Request Refund</h3>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded p-3 flex items-start gap-2">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Refund Amount Summary */}
      <div className="bg-gray-50 rounded p-3">
        <p className="text-sm text-gray-600">Refund Amount</p>
        <p className="text-lg font-semibold text-gray-900">${refundAmount.toFixed(2)}</p>
      </div>

      {/* Reason Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Reason for Refund *
        </label>
        <select
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Select a reason...</option>
          {REFUND_REASONS.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
      </div>

      {/* Additional Details */}
      {reason === 'Other' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Please provide details *
          </label>
          <textarea
            value={details}
            onChange={(e) => setDetails(e.target.value)}
            placeholder="Explain why you're requesting a refund..."
            rows={4}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-lg transition flex items-center justify-center gap-2"
        >
          {loading && <Loader className="w-4 h-4 animate-spin" />}
          {loading ? 'Submitting...' : 'Submit Refund Request'}
        </button>
        <button
          type="button"
          onClick={() => {
            setShowForm(false);
            setReason('');
            setDetails('');
            setError(null);
          }}
          className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-900 font-medium py-2 px-4 rounded-lg transition"
        >
          Cancel
        </button>
      </div>

      <p className="text-xs text-gray-600">
        By submitting this request, you agree to our refund policy terms and conditions.
      </p>
    </form>
  );
};


import React, { useEffect, useState } from 'react';
import { AlertCircle, Clock, Percent } from 'lucide-react';

interface RefundPolicy {
  id: string;
  eventId: string;
  ticketTypeId?: string;
  refundWindowDays: number;
  refundPercentage: number;
  createdAt: string;
  updatedAt: string;
}

interface RefundPolicyDisplayProps {
  ticketId: string;
  ticketTypeId?: string;
  eventId: string;
  ticketPrice: number;
  eventStartDate: string;
  onPolicyLoaded?: (policy: RefundPolicy) => void;
}

export const RefundPolicyDisplay: React.FC<RefundPolicyDisplayProps> = ({
  ticketId,
  ticketTypeId,
  eventId,
  ticketPrice,
  eventStartDate,
  onPolicyLoaded,
}) => {
  const [policy, setPolicy] = useState<RefundPolicy | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refundDeadline, setRefundDeadline] = useState<Date | null>(null);
  const [isWindowExpired, setIsWindowExpired] = useState(false);

  useEffect(() => {
    const fetchPolicy = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `/api/v1/events/${eventId}/refund-policies${ticketTypeId ? `?ticketTypeId=${ticketTypeId}` : ''}`
        );
        if (!response.ok) throw new Error('Failed to fetch refund policy');
        
        const data = await response.json();
        const applicablePolicy = Array.isArray(data) ? data[0] : data;
        
        setPolicy(applicablePolicy);
        onPolicyLoaded?.(applicablePolicy);

        // Calculate refund deadline
        const eventDate = new Date(eventStartDate);
        const deadline = new Date(eventDate);
        deadline.setDate(deadline.getDate() - applicablePolicy.refundWindowDays);
        setRefundDeadline(deadline);

        // Check if window is expired
        setIsWindowExpired(new Date() > deadline);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load refund policy');
      } finally {
        setLoading(false);
      }
    };

    fetchPolicy();
  }, [eventId, ticketTypeId, eventStartDate, onPolicyLoaded]);

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
          <h3 className="font-semibold text-red-900">Error Loading Policy</h3>
          <p className="text-sm text-red-700">{error}</p>
        </div>
      </div>
    );
  }

  if (!policy) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <p className="text-sm text-yellow-800">No refund policy available for this ticket.</p>
      </div>
    );
  }

  const refundAmount = (ticketPrice * policy.refundPercentage) / 100;
  const daysUntilDeadline = refundDeadline
    ? Math.ceil((refundDeadline.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    : 0;

  return (
    <div className={`border rounded-lg p-4 ${isWindowExpired ? 'bg-gray-50 border-gray-300' : 'bg-blue-50 border-blue-200'}`}>
      <h3 className="font-semibold text-gray-900 mb-3">Refund Policy</h3>
      
      <div className="space-y-3">
        {/* Refund Percentage */}
        <div className="flex items-start gap-3">
          <Percent className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-gray-700">Refund Amount</p>
            <p className="text-lg font-semibold text-gray-900">
              {policy.refundPercentage}% (${refundAmount.toFixed(2)})
            </p>
            <p className="text-xs text-gray-600 mt-1">
              of your ${ticketPrice.toFixed(2)} ticket price
            </p>
          </div>
        </div>

        {/* Refund Window */}
        <div className="flex items-start gap-3">
          <Clock className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-gray-700">Refund Window</p>
            <p className="text-sm text-gray-900">
              Refunds available until {policy.refundWindowDays} days before the event
            </p>
            {refundDeadline && (
              <p className="text-xs text-gray-600 mt-1">
                Deadline: {refundDeadline.toLocaleDateString()} at 11:59 PM
              </p>
            )}
          </div>
        </div>

        {/* Status */}
        {isWindowExpired ? (
          <div className="bg-gray-100 border border-gray-300 rounded p-3 mt-3">
            <p className="text-sm font-medium text-gray-900">
              ⏰ Refund window has expired
            </p>
            <p className="text-xs text-gray-600 mt-1">
              You can no longer request a refund for this ticket.
            </p>
          </div>
        ) : daysUntilDeadline <= 3 ? (
          <div className="bg-yellow-100 border border-yellow-300 rounded p-3 mt-3">
            <p className="text-sm font-medium text-yellow-900">
              ⚠️ Refund window closing soon
            </p>
            <p className="text-xs text-yellow-700 mt-1">
              {daysUntilDeadline} day{daysUntilDeadline !== 1 ? 's' : ''} remaining to request a refund
            </p>
          </div>
        ) : (
          <div className="bg-green-100 border border-green-300 rounded p-3 mt-3">
            <p className="text-sm font-medium text-green-900">
              ✓ Refund available
            </p>
            <p className="text-xs text-green-700 mt-1">
              {daysUntilDeadline} days remaining to request a refund
            </p>
          </div>
        )}
      </div>
    </div>
  );
};


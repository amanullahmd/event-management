import React, { useEffect, useState } from 'react';
import { AlertCircle, CheckCircle, Loader, Plus, Edit2 } from 'lucide-react';

interface TicketType {
  id: string;
  name: string;
}

interface RefundPolicy {
  id: string;
  eventId: string;
  ticketTypeId?: string;
  refundWindowDays: number;
  refundPercentage: number;
  createdAt: string;
  updatedAt: string;
}

interface RefundPolicyManagementProps {
  eventId: string;
  eventStatus: string;
  ticketTypes?: TicketType[];
  onSuccess?: () => void;
}

export const RefundPolicyManagement: React.FC<RefundPolicyManagementProps> = ({
  eventId,
  eventStatus,
  ticketTypes = [],
  onSuccess,
}) => {
  const [policies, setPolicies] = useState<RefundPolicy[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingPolicy, setEditingPolicy] = useState<RefundPolicy | null>(null);

  const [formData, setFormData] = useState({
    ticketTypeId: '',
    refundWindowDays: 7,
    refundPercentage: 100,
  });

  const isPublished = eventStatus === 'published';

  useEffect(() => {
    fetchPolicies();
  }, [eventId]);

  const fetchPolicies = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/v1/events/${eventId}/refund-policies`);
      if (!response.ok) throw new Error('Failed to fetch policies');
      const data = await response.json();
      setPolicies(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load policies');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (formData.refundWindowDays <= 0) {
      setError('Refund window must be a positive number of days');
      return;
    }
    if (formData.refundPercentage < 0 || formData.refundPercentage > 100) {
      setError('Refund percentage must be between 0% and 100%');
      return;
    }

    try {
      setLoading(true);
      const url = editingPolicy
        ? `/api/v1/refund-policies/${editingPolicy.id}`
        : `/api/v1/events/${eventId}/refund-policies`;

      const method = editingPolicy ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ticketTypeId: formData.ticketTypeId || null,
          refundWindowDays: formData.refundWindowDays,
          refundPercentage: formData.refundPercentage,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to save policy');
      }

      setSuccess(true);
      setShowForm(false);
      setEditingPolicy(null);
      setFormData({ ticketTypeId: '', refundWindowDays: 7, refundPercentage: 100 });
      fetchPolicies();
      onSuccess?.();

      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save policy');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (policy: RefundPolicy) => {
    setEditingPolicy(policy);
    setFormData({
      ticketTypeId: policy.ticketTypeId || '',
      refundWindowDays: policy.refundWindowDays,
      refundPercentage: policy.refundPercentage,
    });
    setShowForm(true);
  };

  const getTicketTypeName = (ticketTypeId?: string) => {
    if (!ticketTypeId) return 'Event-level policy';
    return ticketTypes.find((t) => t.id === ticketTypeId)?.name || 'Unknown ticket type';
  };

  if (loading && !showForm) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">Refund Policies</h2>
        {!showForm && !isPublished && (
          <button
            onClick={() => {
              setShowForm(true);
              setEditingPolicy(null);
              setFormData({ ticketTypeId: '', refundWindowDays: 7, refundPercentage: 100 });
            }}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition"
          >
            <Plus className="w-4 h-4" />
            Add Policy
          </button>
        )}
      </div>

      {isPublished && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
          <p className="text-sm text-yellow-800">
            ⚠️ Refund policies cannot be modified for published events.
          </p>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-start gap-2">
          <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-green-700">Policy saved successfully!</p>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-lg p-4 space-y-4">
          <h3 className="font-semibold text-gray-900">
            {editingPolicy ? 'Edit Refund Policy' : 'Create Refund Policy'}
          </h3>

          {/* Ticket Type Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Apply to Ticket Type (optional)
            </label>
            <select
              value={formData.ticketTypeId}
              onChange={(e) => setFormData({ ...formData, ticketTypeId: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Event-level policy (all tickets)</option>
              {ticketTypes.map((type) => (
                <option key={type.id} value={type.id}>
                  {type.name}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-600 mt-1">
              Leave empty to apply this policy to all tickets. Ticket-type specific policies take precedence.
            </p>
          </div>

          {/* Refund Window */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Refund Window (days before event) *
            </label>
            <input
              type="number"
              min="1"
              value={formData.refundWindowDays}
              onChange={(e) =>
                setFormData({ ...formData, refundWindowDays: parseInt(e.target.value) || 0 })
              }
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-600 mt-1">
              Attendees can request refunds up to this many days before the event starts.
            </p>
          </div>

          {/* Refund Percentage */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Refund Percentage *
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="0"
                max="100"
                step="5"
                value={formData.refundPercentage}
                onChange={(e) =>
                  setFormData({ ...formData, refundPercentage: parseInt(e.target.value) || 0 })
                }
                className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-gray-600 font-medium">%</span>
            </div>
            <p className="text-xs text-gray-600 mt-1">
              Percentage of ticket price to refund (0-100%).
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-lg transition flex items-center justify-center gap-2"
            >
              {loading && <Loader className="w-4 h-4 animate-spin" />}
              {loading ? 'Saving...' : editingPolicy ? 'Update Policy' : 'Create Policy'}
            </button>
            <button
              type="button"
              onClick={() => {
                setShowForm(false);
                setEditingPolicy(null);
                setFormData({ ticketTypeId: '', refundWindowDays: 7, refundPercentage: 100 });
              }}
              className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-900 font-medium py-2 px-4 rounded-lg transition"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Policies List */}
      {!showForm && policies.length > 0 && (
        <div className="space-y-2">
          {policies.map((policy) => (
            <div key={policy.id} className="bg-white border border-gray-200 rounded-lg p-4 flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">{getTicketTypeName(policy.ticketTypeId)}</p>
                <p className="text-sm text-gray-600">
                  {policy.refundPercentage}% refund • {policy.refundWindowDays} days before event
                </p>
              </div>
              {!isPublished && (
                <button
                  onClick={() => handleEdit(policy)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition"
                >
                  <Edit2 className="w-4 h-4 text-gray-600" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {!showForm && policies.length === 0 && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
          <p className="text-sm text-gray-600">No refund policies created yet.</p>
          {!isPublished && (
            <button
              onClick={() => setShowForm(true)}
              className="mt-2 text-blue-600 hover:text-blue-700 font-medium text-sm"
            >
              Create your first policy
            </button>
          )}
        </div>
      )}
    </div>
  );
};


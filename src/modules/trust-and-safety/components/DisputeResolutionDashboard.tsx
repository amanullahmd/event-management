import React, { useEffect, useState } from 'react';
import { AlertCircle, CheckCircle, Loader } from 'lucide-react';

interface Dispute {
  id: string;
  status: 'open' | 'resolved';
  explanation: string;
  decision?: 'favor_attendee' | 'favor_organizer';
  decisionExplanation?: string;
  createdAt: string;
}

interface DisputeResolutionDashboardProps {
  onRefresh?: () => void;
}

export const DisputeResolutionDashboard: React.FC<DisputeResolutionDashboardProps> = ({
  onRefresh,
}) => {
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [resolvingId, setResolvingId] = useState<string | null>(null);
  const [decision, setDecision] = useState<'favor_attendee' | 'favor_organizer'>('favor_attendee');
  const [explanation, setExplanation] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [filter, setFilter] = useState<'open' | 'resolved' | 'all'>('open');

  useEffect(() => {
    fetchDisputes();
  }, [filter]);

  const fetchDisputes = async () => {
    try {
      setLoading(true);
      const statusParam = filter === 'all' ? '' : `?status=${filter}`;
      const response = await fetch(`/api/v1/disputes${statusParam}`);
      if (!response.ok) throw new Error('Failed to fetch disputes');
      const data = await response.json();
      setDisputes(data.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load disputes');
    } finally {
      setLoading(false);
    }
  };

  const handleResolve = async (disputeId: string) => {
    if (!explanation.trim()) {
      setError('Please provide an explanation for your decision');
      return;
    }

    try {
      setActionLoading(true);
      const response = await fetch(`/api/v1/disputes/${disputeId}/resolve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          decision,
          explanation: explanation.trim(),
        }),
      });

      if (!response.ok) throw new Error('Failed to resolve dispute');

      setSuccess(true);
      setResolvingId(null);
      setDecision('favor_attendee');
      setExplanation('');
      fetchDisputes();
      onRefresh?.();
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to resolve dispute');
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
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">Dispute Resolution</h2>
        <div className="flex gap-2">
          {(['open', 'resolved', 'all'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition ${
                filter === f
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-900 hover:bg-gray-300'
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-start gap-2">
          <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-green-700">Dispute resolved successfully!</p>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {disputes.length === 0 ? (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
          <p className="text-sm text-gray-600">
            {filter === 'open' ? 'No open disputes.' : 'No disputes found.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {disputes.map((dispute) => (
            <div key={dispute.id} className="bg-white border border-gray-200 rounded-lg p-4">
              {resolvingId === dispute.id ? (
                <div className="space-y-3">
                  <div className="bg-blue-50 border border-blue-200 rounded p-3">
                    <p className="text-sm font-medium text-blue-900">Dispute Details</p>
                    <p className="text-sm text-blue-800 mt-2">{dispute.explanation}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Decision *
                    </label>
                    <select
                      value={decision}
                      onChange={(e) => setDecision(e.target.value as 'favor_attendee' | 'favor_organizer')}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="favor_attendee">Favor Attendee (Approve Refund)</option>
                      <option value="favor_organizer">Favor Organizer (Confirm Rejection)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Explanation *
                    </label>
                    <textarea
                      value={explanation}
                      onChange={(e) => setExplanation(e.target.value)}
                      placeholder="Explain your decision and reasoning..."
                      rows={4}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleResolve(dispute.id)}
                      disabled={actionLoading}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-lg transition flex items-center justify-center gap-2"
                    >
                      {actionLoading && <Loader className="w-4 h-4 animate-spin" />}
                      Resolve Dispute
                    </button>
                    <button
                      onClick={() => {
                        setResolvingId(null);
                        setDecision('favor_attendee');
                        setExplanation('');
                      }}
                      disabled={actionLoading}
                      className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-900 font-medium py-2 px-4 rounded-lg transition"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <p className="font-medium text-gray-900">Dispute #{dispute.id.slice(0, 8)}</p>
                      <span
                        className={`inline-block text-xs font-semibold px-2 py-1 rounded ${
                          dispute.status === 'open'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-green-100 text-green-800'
                        }`}
                      >
                        {dispute.status.charAt(0).toUpperCase() + dispute.status.slice(1)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{dispute.explanation}</p>
                    <p className="text-xs text-gray-500">
                      Created: {new Date(dispute.createdAt).toLocaleDateString()}
                    </p>
                    {dispute.decision && (
                      <div className="mt-2 pt-2 border-t border-gray-200">
                        <p className="text-sm font-medium text-gray-900">
                          Decision: {dispute.decision === 'favor_attendee' ? 'Favor Attendee' : 'Favor Organizer'}
                        </p>
                        <p className="text-sm text-gray-600 mt-1">{dispute.decisionExplanation}</p>
                      </div>
                    )}
                  </div>
                  {dispute.status === 'open' && (
                    <button
                      onClick={() => setResolvingId(dispute.id)}
                      className="ml-4 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition whitespace-nowrap"
                    >
                      Review
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};


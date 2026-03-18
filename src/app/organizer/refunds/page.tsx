'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '@/modules/authentication/context/AuthContext';
import {
  getMyEvents,
  getEventRefundRequests,
  approveRefundRequest,
  rejectRefundRequest,
  type RefundRequestItem,
} from '@/modules/shared-common/services/apiService';
import {
  RefreshCw,
  Calendar,
  DollarSign,
  CreditCard,
  CheckCircle,
  Clock,
  AlertCircle,
  Search,
  XCircle,
  MessageSquare,
} from 'lucide-react';

type StatusFilter = 'all' | 'PENDING_REVIEW' | 'APPROVED' | 'REJECTED';

interface EnrichedRefundRequest extends RefundRequestItem {
  eventName?: string;
}

export default function OrganizerRefundsPage() {
  const { user } = useAuth();
  const [requests, setRequests] = useState<EnrichedRefundRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState<Record<string, string>>({});
  const [rejectingId, setRejectingId] = useState<string | null>(null);

  const fetchRequests = useCallback(async () => {
    if (!user) return;
    try {
      setLoading(true);
      setError(null);

      // Get organizer's own events (all statuses, not just public ones)
      const organizerEvents = await getMyEvents();
      const eventMap = new Map(organizerEvents.map((e) => [e.id, e.title || e.name]));

      // Fetch refund requests for each event in parallel
      const results = await Promise.allSettled(
        organizerEvents.map((event) => getEventRefundRequests(event.id))
      );

      const allRequests: EnrichedRefundRequest[] = [];
      results.forEach((result, i) => {
        if (result.status === 'fulfilled' && Array.isArray(result.value)) {
          result.value.forEach((req) => {
            allRequests.push({
              ...req,
              eventName: eventMap.get(organizerEvents[i].id) || 'Unknown Event',
            });
          });
        }
      });

      // Sort by newest first
      allRequests.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      setRequests(allRequests);
    } catch (err) {
      console.error('Failed to fetch refund requests:', err);
      setError('Failed to load refund requests');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const handleApprove = async (requestId: string) => {
    try {
      setActionLoading(requestId);
      await approveRefundRequest(requestId);
      setRequests((prev) =>
        prev.map((r) =>
          r.id === requestId
            ? { ...r, status: 'APPROVED', approvedAt: new Date().toISOString() }
            : r
        )
      );
    } catch (err) {
      console.error('Failed to approve refund request:', err);
      alert('Failed to approve refund request. Please try again.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (requestId: string) => {
    try {
      setActionLoading(requestId);
      const reason = rejectReason[requestId] || '';
      await rejectRefundRequest(requestId, reason);
      setRequests((prev) =>
        prev.map((r) =>
          r.id === requestId
            ? {
                ...r,
                status: 'REJECTED',
                rejectedAt: new Date().toISOString(),
                rejectionReason: reason,
              }
            : r
        )
      );
      setRejectingId(null);
      setRejectReason((prev) => {
        const next = { ...prev };
        delete next[requestId];
        return next;
      });
    } catch (err) {
      console.error('Failed to reject refund request:', err);
      alert('Failed to reject refund request. Please try again.');
    } finally {
      setActionLoading(null);
    }
  };

  const formatCurrency = (value: number | undefined) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value || 0);

  const formatDate = (date: string | Date | undefined) =>
    date
      ? new Date(date).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        })
      : '—';

  const normalizeStatus = (s: string) => (s || '').toUpperCase();

  const filteredRequests = useMemo(() => {
    return requests.filter((req) => {
      const matchesSearch =
        !searchTerm ||
        (req.eventName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (req.reason || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.id.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus =
        statusFilter === 'all' || normalizeStatus(req.status) === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [requests, searchTerm, statusFilter]);

  const stats = useMemo(() => ({
    total: requests.length,
    pending: requests.filter((r) => normalizeStatus(r.status) === 'PENDING_REVIEW').length,
    approved: requests.filter((r) => normalizeStatus(r.status) === 'APPROVED').length,
    totalRefunded: requests
      .filter((r) => normalizeStatus(r.status) === 'APPROVED')
      .reduce((sum, r) => sum + (r.refundAmount || 0), 0),
  }), [requests]);

  const getStatusBadge = (status: string) => {
    const s = normalizeStatus(status);
    const configs: Record<string, { cls: string; icon: React.ReactNode; label: string }> = {
      PENDING_REVIEW: {
        cls: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
        icon: <Clock className="w-3.5 h-3.5" />,
        label: 'Pending Review',
      },
      APPROVED: {
        cls: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
        icon: <CheckCircle className="w-3.5 h-3.5" />,
        label: 'Approved',
      },
      REJECTED: {
        cls: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
        icon: <XCircle className="w-3.5 h-3.5" />,
        label: 'Rejected',
      },
      PROCESSING: {
        cls: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
        icon: <RefreshCw className="w-3.5 h-3.5 animate-spin" />,
        label: 'Processing',
      },
      COMPLETED: {
        cls: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400',
        icon: <CheckCircle className="w-3.5 h-3.5" />,
        label: 'Completed',
      },
    };
    const cfg = configs[s] || {
      cls: 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300',
      icon: <AlertCircle className="w-3.5 h-3.5" />,
      label: s,
    };
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-semibold rounded-full shrink-0 ${cfg.cls}`}>
        {cfg.icon}
        {cfg.label}
      </span>
    );
  };

  const statusTabs: { key: StatusFilter; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'PENDING_REVIEW', label: 'Pending Review' },
    { key: 'APPROVED', label: 'Approved' },
    { key: 'REJECTED', label: 'Rejected' },
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <div className="h-8 w-56 bg-slate-200 dark:bg-slate-700 rounded-lg animate-pulse" />
          <div className="h-5 w-72 bg-slate-200 dark:bg-slate-700 rounded-lg animate-pulse mt-2" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 animate-pulse"
            >
              <div className="h-4 w-24 bg-slate-200 dark:bg-slate-700 rounded" />
              <div className="h-8 w-16 bg-slate-200 dark:bg-slate-700 rounded mt-2" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center bg-red-50 dark:bg-red-900/10 p-8 rounded-2xl border border-red-200 dark:border-red-800 max-w-md">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-red-600 text-xl font-bold mb-2">Error</h2>
          <p className="text-red-500 mb-6">{error}</p>
          <button
            onClick={fetchRequests}
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-medium inline-flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" /> Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Refund Management</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Review and process refund requests from attendees
          </p>
        </div>
        <button
          onClick={fetchRequests}
          className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors text-sm text-slate-700 dark:text-slate-300"
        >
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400">Total Requests</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{stats.total}</p>
            </div>
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <CreditCard className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400">Pending Review</p>
              <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400 mt-1">{stats.pending}</p>
            </div>
            <div className="p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
              <Clock className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400">Approved</p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">{stats.approved}</p>
            </div>
            <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400">Total Refunded</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                {formatCurrency(stats.totalRefunded)}
              </p>
            </div>
            <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <DollarSign className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div className="flex flex-wrap gap-1">
          {statusTabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setStatusFilter(tab.key)}
              className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                statusFilter === tab.key
                  ? 'bg-violet-600 text-white'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {tab.label}
              {tab.key === 'PENDING_REVIEW' && stats.pending > 0 && (
                <span className="ml-1.5 bg-yellow-500 text-white text-xs rounded-full px-1.5 py-0.5">
                  {stats.pending}
                </span>
              )}
            </button>
          ))}
        </div>
        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search refunds..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
          />
        </div>
      </div>

      {/* Requests List */}
      {filteredRequests.length > 0 ? (
        <div className="space-y-4">
          {filteredRequests.map((req) => {
            const isPending = normalizeStatus(req.status) === 'PENDING_REVIEW';
            const isRejecting = rejectingId === req.id;

            return (
              <div
                key={req.id}
                className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden hover:shadow-md transition-shadow"
              >
                <div className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      {/* Event name + status */}
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-slate-900 dark:text-white truncate">
                          {req.eventName}
                        </h3>
                        {getStatusBadge(req.status)}
                      </div>

                      {/* Request ID */}
                      <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
                        Request #{req.id.slice(0, 12)}…
                      </p>

                      {/* Reason */}
                      {req.reason && (
                        <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                          <span className="font-medium text-slate-700 dark:text-slate-300">Reason:</span>{' '}
                          {req.reason}
                        </p>
                      )}

                      {/* Rejection reason if rejected */}
                      {req.rejectionReason && (
                        <p className="text-sm text-red-600 dark:text-red-400 mb-3">
                          <span className="font-medium">Rejection reason:</span> {req.rejectionReason}
                        </p>
                      )}

                      {/* Meta */}
                      <div className="flex flex-wrap gap-4 text-sm text-slate-600 dark:text-slate-400">
                        <span className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5" />
                          Submitted {formatDate(req.createdAt)}
                        </span>
                        {req.originalAmount != null && (
                          <span className="flex items-center gap-1.5">
                            <DollarSign className="w-3.5 h-3.5" />
                            Original: {formatCurrency(req.originalAmount)}
                          </span>
                        )}
                        {req.refundPercentage != null && (
                          <span className="text-slate-500 dark:text-slate-400">
                            {req.refundPercentage}% refund
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Right side: amount + actions */}
                    <div className="text-right shrink-0">
                      <p className="text-xl font-bold text-slate-900 dark:text-white mb-3">
                        {formatCurrency(req.refundAmount || req.originalAmount)}
                      </p>

                      {isPending && !isRejecting && (
                        <div className="flex gap-2 justify-end">
                          <button
                            onClick={() => handleApprove(req.id)}
                            disabled={actionLoading === req.id}
                            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium bg-green-600 hover:bg-green-700 text-white rounded-lg disabled:opacity-50 transition-colors"
                          >
                            <CheckCircle className="w-3.5 h-3.5" />
                            {actionLoading === req.id ? 'Processing...' : 'Approve'}
                          </button>
                          <button
                            onClick={() => setRejectingId(req.id)}
                            disabled={actionLoading === req.id}
                            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg disabled:opacity-50 transition-colors"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            Reject
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Rejection reason input */}
                  {isPending && isRejecting && (
                    <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                      <label className="flex items-center gap-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 mb-2">
                        <MessageSquare className="w-3.5 h-3.5" />
                        Rejection reason (optional)
                      </label>
                      <textarea
                        rows={2}
                        value={rejectReason[req.id] || ''}
                        onChange={(e) =>
                          setRejectReason((prev) => ({ ...prev, [req.id]: e.target.value }))
                        }
                        placeholder="Enter reason for rejection..."
                        className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
                      />
                      <div className="flex gap-2 mt-2 justify-end">
                        <button
                          onClick={() => {
                            setRejectingId(null);
                            setRejectReason((prev) => {
                              const next = { ...prev };
                              delete next[req.id];
                              return next;
                            });
                          }}
                          className="px-3 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleReject(req.id)}
                          disabled={actionLoading === req.id}
                          className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium bg-red-600 hover:bg-red-700 text-white rounded-lg disabled:opacity-50 transition-colors"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          {actionLoading === req.id ? 'Processing...' : 'Confirm Reject'}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
          <div className="w-20 h-20 bg-gradient-to-br from-violet-500 to-fuchsia-500 rounded-full flex items-center justify-center text-white mx-auto mb-4">
            <CreditCard className="w-10 h-10" />
          </div>
          <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
            {searchTerm || statusFilter !== 'all' ? 'No matching refund requests' : 'No refund requests yet'}
          </h3>
          <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto">
            {searchTerm || statusFilter !== 'all'
              ? 'Try adjusting your search or filter.'
              : 'Refund requests from attendees will appear here.'}
          </p>
        </div>
      )}
    </div>
  );
}

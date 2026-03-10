'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '@/modules/authentication/context/AuthContext';
import {
  getAllEvents,
  getAllRefunds,
  getRefundsByEventId,
  updateRefundStatus,
  type RefundRequest,
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
} from 'lucide-react';

type StatusFilter = 'all' | 'pending' | 'approved' | 'rejected';

interface EnrichedRefund extends RefundRequest {
  eventName?: string;
  customerName?: string;
}

export default function OrganizerRefundsPage() {
  const { user } = useAuth();
  const [refunds, setRefunds] = useState<EnrichedRefund[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchRefunds = useCallback(async () => {
    if (!user) return;
    try {
      setLoading(true);
      setError(null);

      // Get organizer's events
      const allEvents = await getAllEvents();
      const organizerEvents = allEvents.filter(e => e.organizerId === user.id);
      const eventMap = new Map(organizerEvents.map(e => [e.id, e.name]));

      // Fetch refunds for each of the organizer's events
      let allRefunds: RefundRequest[] = [];
      try {
        // Try fetching all refunds (admin endpoint), then filter by organizer events
        const refundsData = await getAllRefunds();
        const eventIds = new Set(organizerEvents.map(e => e.id));
        allRefunds = (refundsData || []).filter(r => eventIds.has(r.eventId));
      } catch {
        // Fallback: try per-event refund fetch
        const refundPromises = organizerEvents.map(async (event) => {
          try {
            return await getRefundsByEventId(event.id);
          } catch {
            return [];
          }
        });
        const results = await Promise.all(refundPromises);
        allRefunds = results.flat();
      }

      // Enrich with event names
      const enriched: EnrichedRefund[] = allRefunds.map(refund => ({
        ...refund,
        eventName: eventMap.get(refund.eventId) || 'Unknown Event',
      }));

      // Sort by creation date (most recent first)
      enriched.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setRefunds(enriched);
    } catch (err) {
      console.error('Failed to fetch refund requests:', err);
      setError('Failed to load refund requests');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchRefunds();
  }, [fetchRefunds]);

  const handleUpdateStatus = async (refundId: string, status: 'approved' | 'rejected') => {
    try {
      setActionLoading(refundId);
      await updateRefundStatus(refundId, status);
      // Update local state
      setRefunds(prev =>
        prev.map(r =>
          r.id === refundId
            ? { ...r, status, processedAt: new Date() } as EnrichedRefund
            : r
        )
      );
    } catch (err) {
      console.error(`Failed to ${status} refund:`, err);
      alert(`Failed to ${status} refund. Please try again.`);
    } finally {
      setActionLoading(null);
    }
  };

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);

  const formatDate = (date: string | Date) =>
    new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

  const normalizeStatus = (status: string) => (status || '').toLowerCase();

  const filteredRefunds = useMemo(() => {
    return refunds.filter(refund => {
      const matchesSearch =
        !searchTerm ||
        (refund.eventName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (refund.customerName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (refund.reason || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        refund.id.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || normalizeStatus(refund.status) === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [refunds, searchTerm, statusFilter]);

  const stats = useMemo(() => ({
    total: refunds.length,
    pending: refunds.filter(r => normalizeStatus(r.status) === 'pending').length,
    approved: refunds.filter(r => normalizeStatus(r.status) === 'approved').length,
    totalRefunded: refunds
      .filter(r => normalizeStatus(r.status) === 'approved')
      .reduce((sum, r) => sum + (r.amount || 0), 0),
  }), [refunds]);

  const getStatusColor = (status: string) => {
    const s = normalizeStatus(status);
    const styles: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
      approved: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
      rejected: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
    };
    return styles[s] || 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300';
  };

  const getStatusIcon = (status: string) => {
    const s = normalizeStatus(status);
    if (s === 'pending') return <Clock className="w-3.5 h-3.5" />;
    if (s === 'approved') return <CheckCircle className="w-3.5 h-3.5" />;
    if (s === 'rejected') return <XCircle className="w-3.5 h-3.5" />;
    return <AlertCircle className="w-3.5 h-3.5" />;
  };

  const statusTabs: { key: StatusFilter; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'pending', label: 'Pending' },
    { key: 'approved', label: 'Approved' },
    { key: 'rejected', label: 'Rejected' },
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
            <div key={i} className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 animate-pulse">
              <div className="h-4 w-24 bg-slate-200 dark:bg-slate-700 rounded" />
              <div className="h-8 w-16 bg-slate-200 dark:bg-slate-700 rounded mt-2" />
            </div>
          ))}
        </div>
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 animate-pulse">
            <div className="h-5 w-40 bg-slate-200 dark:bg-slate-700 rounded mb-3" />
            <div className="h-4 w-64 bg-slate-200 dark:bg-slate-700 rounded mb-2" />
            <div className="h-4 w-48 bg-slate-200 dark:bg-slate-700 rounded" />
          </div>
        ))}
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
            onClick={fetchRefunds}
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
            Process and manage refund requests for your events
          </p>
        </div>
        <button
          onClick={fetchRefunds}
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
              <p className="text-sm text-slate-600 dark:text-slate-400">Pending</p>
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
              <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{formatCurrency(stats.totalRefunded)}</p>
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

      {/* Refunds List */}
      {filteredRefunds.length > 0 ? (
        <div className="space-y-4">
          {filteredRefunds.map((refund) => (
            <div
              key={refund.id}
              className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden hover:shadow-md transition-shadow"
            >
              <div className="p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-slate-900 dark:text-white truncate">
                        {refund.eventName}
                      </h3>
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-semibold rounded-full shrink-0 ${getStatusColor(refund.status)}`}>
                        {getStatusIcon(refund.status)}
                        {normalizeStatus(refund.status).charAt(0).toUpperCase() + normalizeStatus(refund.status).slice(1)}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
                      Refund #{refund.id.length > 12 ? refund.id.slice(0, 12) + '...' : refund.id}
                    </p>

                    {refund.reason && (
                      <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                        Reason: {refund.reason}
                      </p>
                    )}

                    <div className="flex flex-wrap gap-4 text-sm text-slate-600 dark:text-slate-400">
                      {refund.customerName && (
                        <span className="flex items-center gap-1.5">
                          <span className="w-5 h-5 bg-slate-200 dark:bg-slate-700 rounded-full flex items-center justify-center text-xs font-bold text-slate-600 dark:text-slate-300">
                            {refund.customerName.charAt(0).toUpperCase()}
                          </span>
                          {refund.customerName}
                        </span>
                      )}
                      <span className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5" />
                        Requested {formatDate(refund.createdAt)}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <DollarSign className="w-3.5 h-3.5" />
                        {formatCurrency(refund.amount || 0)}
                      </span>
                    </div>

                    {refund.processedAt && (
                      <p className="text-xs text-slate-400 dark:text-slate-500 mt-2">
                        Processed on {formatDate(refund.processedAt)}
                      </p>
                    )}
                  </div>

                  <div className="text-right shrink-0">
                    <p className="text-xl font-bold text-slate-900 dark:text-white mb-3">
                      {formatCurrency(refund.amount || 0)}
                    </p>
                    {normalizeStatus(refund.status) === 'pending' && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleUpdateStatus(refund.id, 'approved')}
                          disabled={actionLoading === refund.id}
                          className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium bg-green-600 hover:bg-green-700 text-white rounded-lg disabled:opacity-50 transition-colors"
                        >
                          <CheckCircle className="w-3.5 h-3.5" />
                          {actionLoading === refund.id ? 'Processing...' : 'Approve'}
                        </button>
                        <button
                          onClick={() => handleUpdateStatus(refund.id, 'rejected')}
                          disabled={actionLoading === refund.id}
                          className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg disabled:opacity-50 transition-colors"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          Reject
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
          <div className="w-20 h-20 bg-gradient-to-br from-violet-500 to-fuchsia-500 rounded-full flex items-center justify-center text-white mx-auto mb-4">
            <CreditCard className="w-10 h-10" />
          </div>
          <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
            {searchTerm || statusFilter !== 'all' ? 'No matching refunds' : 'No refund requests'}
          </h3>
          <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto">
            {searchTerm || statusFilter !== 'all'
              ? 'Try adjusting your search or filter.'
              : 'No refund requests have been submitted for your events yet.'}
          </p>
        </div>
      )}
    </div>
  );
}

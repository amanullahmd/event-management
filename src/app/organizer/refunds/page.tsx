'use client';

import { useState, useMemo } from 'react';
import { useAuth } from '@/lib/hooks';
import {
  getEventsByOrganizerId,
  getAllRefunds,
  getRefundsByEventId,
  updateRefundStatus,
  getOrderById,
  getUserById,
  getEventById,
} from '@/lib/dummy-data';
import { Button } from '@/components/ui/button';
import type { RefundRequest } from '@/lib/types';

/**
 * Refund Management Page for Organizers
 * Displays pending refund requests and allows approval/rejection
 * Requirements: 11.1, 11.2, 11.3, 11.4
 */
export default function RefundsPage() {
  const { user } = useAuth();
  const [selectedEventId, setSelectedEventId] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('pending');
  const [processingId, setProcessingId] = useState<string | null>(null);

  // Get organizer's events
  const organizerEvents = useMemo(() => {
    if (!user) return [];
    return getEventsByOrganizerId(user.id);
  }, [user]);

  // Get refunds based on filters
  const refunds = useMemo(() => {
    let allRefunds: RefundRequest[];
    
    if (selectedEventId) {
      allRefunds = getRefundsByEventId(selectedEventId);
    } else {
      // Get refunds for all organizer's events
      const eventIds = organizerEvents.map((e) => e.id);
      allRefunds = getAllRefunds().filter((r) => {
        const order = getOrderById(r.orderId);
        return order && eventIds.includes(order.eventId);
      });
    }

    // Filter by status
    if (statusFilter && statusFilter !== 'all') {
      allRefunds = allRefunds.filter((r) => r.status === statusFilter);
    }

    return allRefunds;
  }, [selectedEventId, statusFilter, organizerEvents]);

  // Handle refund approval
  const handleApprove = async (refundId: string) => {
    setProcessingId(refundId);
    await new Promise((resolve) => setTimeout(resolve, 300));
    updateRefundStatus(refundId, 'approved');
    setProcessingId(null);
  };

  // Handle refund rejection
  const handleReject = async (refundId: string) => {
    setProcessingId(refundId);
    await new Promise((resolve) => setTimeout(resolve, 300));
    updateRefundStatus(refundId, 'rejected');
    setProcessingId(null);
  };

  // Get customer info for a refund
  const getCustomerInfo = (refund: RefundRequest) => {
    const customer = getUserById(refund.customerId);
    return customer?.name || 'Unknown Customer';
  };

  // Get event info for a refund
  const getEventInfo = (refund: RefundRequest) => {
    const order = getOrderById(refund.orderId);
    if (!order) return 'Unknown Event';
    const event = getEventById(order.eventId);
    return event?.name || 'Unknown Event';
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  // Format date
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Get status badge color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'approved':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'rejected':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      case 'completed':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      default:
        return 'bg-slate-100 text-slate-800 dark:bg-slate-900/30 dark:text-slate-400';
    }
  };

  if (!user) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-600 dark:text-slate-400">Please log in to access refunds.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
          Refund Requests
        </h1>
        <p className="text-slate-600 dark:text-slate-400 mt-2">
          Manage refund requests for your events
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-slate-900 rounded-lg shadow-md p-6 border border-slate-200 dark:border-slate-800">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Event Filter */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Event
            </label>
            <select
              value={selectedEventId}
              onChange={(e) => setSelectedEventId(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Filter by event"
            >
              <option value="">All Events</option>
              {organizerEvents.map((event) => (
                <option key={event.id} value={event.id}>
                  {event.name}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Filter by status"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        </div>
      </div>

      {/* Refunds List */}
      <div className="bg-white dark:bg-slate-900 rounded-lg shadow-md border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="p-6 border-b border-slate-200 dark:border-slate-800">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            Refund Requests ({refunds.length})
          </h2>
        </div>

        {refunds.length === 0 ? (
          <div className="p-12 text-center">
            <div className="text-6xl mb-4">💰</div>
            <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
              No refund requests
            </h3>
            <p className="text-slate-500 dark:text-slate-400">
              {statusFilter === 'pending'
                ? 'No pending refund requests at this time.'
                : 'No refund requests match your filters.'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-200 dark:divide-slate-700">
            {refunds.map((refund) => (
              <div
                key={refund.id}
                className="p-6 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
              >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-slate-900 dark:text-white">
                        {getCustomerInfo(refund)}
                      </h3>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                          refund.status
                        )}`}
                      >
                        {refund.status.charAt(0).toUpperCase() + refund.status.slice(1)}
                      </span>
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">
                      Event: {getEventInfo(refund)}
                    </p>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                      Requested: {formatDate(refund.requestedAt)}
                    </p>
                    <p className="text-sm text-slate-700 dark:text-slate-300">
                      <span className="font-medium">Reason:</span> {refund.reason}
                    </p>
                  </div>

                  <div className="flex flex-col items-end gap-3">
                    <p className="text-2xl font-bold text-slate-900 dark:text-white">
                      {formatCurrency(refund.amount)}
                    </p>

                    {refund.status === 'pending' && (
                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleApprove(refund.id)}
                          disabled={processingId === refund.id}
                          className="bg-green-600 hover:bg-green-700 text-white"
                        >
                          {processingId === refund.id ? 'Processing...' : 'Approve'}
                        </Button>
                        <Button
                          onClick={() => handleReject(refund.id)}
                          disabled={processingId === refund.id}
                          variant="outline"
                          className="text-red-600 border-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                        >
                          Reject
                        </Button>
                      </div>
                    )}

                    {refund.processedAt && (
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Processed: {formatDate(refund.processedAt)}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-slate-900 rounded-lg shadow-md p-6 border border-slate-200 dark:border-slate-800">
          <h3 className="text-sm font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wide">
            Pending
          </h3>
          <p className="text-3xl font-bold text-yellow-600 dark:text-yellow-400 mt-2">
            {refunds.filter((r) => r.status === 'pending').length}
          </p>
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-lg shadow-md p-6 border border-slate-200 dark:border-slate-800">
          <h3 className="text-sm font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wide">
            Approved
          </h3>
          <p className="text-3xl font-bold text-green-600 dark:text-green-400 mt-2">
            {refunds.filter((r) => r.status === 'approved').length}
          </p>
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-lg shadow-md p-6 border border-slate-200 dark:border-slate-800">
          <h3 className="text-sm font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wide">
            Rejected
          </h3>
          <p className="text-3xl font-bold text-red-600 dark:text-red-400 mt-2">
            {refunds.filter((r) => r.status === 'rejected').length}
          </p>
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-lg shadow-md p-6 border border-slate-200 dark:border-slate-800">
          <h3 className="text-sm font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wide">
            Total Amount
          </h3>
          <p className="text-3xl font-bold text-slate-900 dark:text-white mt-2">
            {formatCurrency(refunds.reduce((sum, r) => sum + r.amount, 0))}
          </p>
        </div>
      </div>
    </div>
  );
}

'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/modules/authentication/context/AuthContext';
import { getOrderById, getEventById, getTicketsByOrderId, refundOrder, getRefundEligibility, type RefundRequestItem, type RefundEligibility } from '@/modules/shared-common/services/apiService';
import { QRCodeSVG } from 'qrcode.react';

// Use types from apiService to match API responses
type Order = Awaited<ReturnType<typeof getOrderById>>;
type Event = Awaited<ReturnType<typeof getEventById>>;
type Ticket = Awaited<ReturnType<typeof getTicketsByOrderId>>[number];
type TicketType = NonNullable<Event>['ticketTypes'][number];

/**
 * Order Detail Page
 * Displays all tickets in order, payment method, order total
 * Provides download and refund options
 * Requirements: 14.3, 14.4, 14.5
 */
export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [isRequestingRefund, setIsRequestingRefund] = useState(false);
  const [refundRequested, setRefundRequested] = useState(false);
  const [existingRefundStatus, setExistingRefundStatus] = useState<string | null>(null);
  const [refundEligibility, setRefundEligibility] = useState<RefundEligibility | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [order, setOrder] = useState<Order | undefined>(undefined);
  const [event, setEvent] = useState<Event | undefined>(undefined);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const orderId = params.id as string;

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const orderData = await getOrderById(orderId);
        setOrder(orderData);
        
        if (orderData) {
          const [eventData, ticketsData] = await Promise.all([
            getEventById(orderData.eventId),
            getTicketsByOrderId(orderData.id)
          ]);
          setEvent(eventData);
          setTickets(ticketsData);

          // Check eligibility + existing refund requests in parallel
          const [, eligibility] = await Promise.all([
            (async () => {
              try {
                const { apiRequest } = await import('@/modules/shared-common/utils/api');
                const refundReqs = await apiRequest(`/v1/orders/${orderData.id}/refund-requests`) as RefundRequestItem[];
                if (Array.isArray(refundReqs) && refundReqs.length > 0) {
                  const statuses = refundReqs.map((r) => r.status.toUpperCase());
                  if (statuses.includes('APPROVED')) setExistingRefundStatus('Approved');
                  else if (statuses.includes('PENDING_REVIEW')) setExistingRefundStatus('Pending Review');
                  else if (statuses.includes('REJECTED')) setExistingRefundStatus('Rejected');
                  else if (statuses.includes('PROCESSING')) setExistingRefundStatus('Processing');
                }
              } catch { /* ignore */ }
            })(),
            getRefundEligibility(orderData.id).catch(() => null),
          ]);
          if (eligibility) setRefundEligibility(eligibility);
        }
      } catch (error) {
        console.error('Failed to fetch order data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [orderId]);

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-12 text-center">
        <div className="animate-spin h-12 w-12 border-4 border-indigo-600 border-t-transparent rounded-full mx-auto mb-4"></div>
        <p className="text-slate-500 dark:text-slate-400">Loading order details...</p>
      </div>
    );
  }
  
  // Verify order belongs to current user (backend returns userId, not customerId)
  const orderOwnerId = order?.customerId ?? order?.userId;
  if (!order || (user && orderOwnerId !== user.id)) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-12 text-center">
        <div className="text-6xl mb-4">🔍</div>
        <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
          Order Not Found
        </h3>
        <p className="text-slate-500 dark:text-slate-400 mb-6">
          The order you're looking for doesn't exist or you don't have permission to view it.
        </p>
        <Link
          href="/dashboard/orders"
          className="inline-flex items-center px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
        >
          ← Back to Orders
        </Link>
      </div>
    );
  }

  // Normalize totalAmount: backend returns totalAmountCents (integer cents)
  const totalAmount = order.totalAmountCents != null
    ? order.totalAmountCents / 100
    : (order.totalAmount || 0);

  const eventDate = event ? new Date(event.startDate || event.date) : new Date();
  const isPastEvent = eventDate < new Date();
  const orderStatusLower = order.status?.toLowerCase();
  const hasActiveRefund = existingRefundStatus === 'Pending Review' || existingRefundStatus === 'Approved' || existingRefundStatus === 'Processing';
  // Use API eligibility if available, fall back to local checks
  const isEligibleByApi = refundEligibility ? refundEligibility.eligible : true;
  const canRequestRefund = (orderStatusLower === 'completed' || orderStatusLower === 'confirmed')
    && !isPastEvent
    && !refundRequested
    && !hasActiveRefund
    && isEligibleByApi;

  // Get ticket type info from order items
  // ticket.ticketTypeId may be undefined (not in TicketResponse), so also match by name
  const getTicketTypeInfo = (ticketTypeId: string | undefined, ticketTypeName?: string) => {
    const item = order?.items?.find(
      (i) => (ticketTypeId && i.ticketTypeId === ticketTypeId) ||
              (ticketTypeName && i.ticketTypeName === ticketTypeName)
    );
    if (item) {
      return {
        name: item.ticketTypeName || ticketTypeName || 'Ticket',
        price: item.priceCents != null ? item.priceCents / 100 : (item.unitPrice || 0),
      };
    }
    return undefined;
  };

  // Handle refund request
  const handleRefundRequest = async () => {
    setIsRequestingRefund(true);
    try {
      await refundOrder(order.id, 'Customer refund request');
      setRefundRequested(true);
    } catch (error) {
      console.error('Failed to request refund:', error);
      alert('Unable to submit refund request. Please try again or contact support.');
    } finally {
      setIsRequestingRefund(false);
    }
  };

  // Handle download all tickets
  const handleDownloadAll = async () => {
    setIsDownloading(true);
    try {
      const { jsPDF } = await import('jspdf');
      
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });
      
      const pageWidth = pdf.internal.pageSize.getWidth();
      const margin = 20;
      
      // Title
      pdf.setFontSize(20);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(30, 41, 59);
      pdf.text('Order Confirmation', pageWidth / 2, 25, { align: 'center' });
      
      // Order info
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(71, 85, 105);
      pdf.text(`Order #${order.id.replace('order-', '')}`, margin, 40);
      pdf.text(`Date: ${new Date(order.createdAt).toLocaleDateString()}`, margin, 48);
      
      // Event info
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(30, 41, 59);
      pdf.text(event?.title || event?.name || 'Event', margin, 65);
      
      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(71, 85, 105);
      pdf.text(`📅 ${eventDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`, margin, 75);
      pdf.text(`📍 ${event?.location || 'Location'}`, margin, 83);
      
      // Tickets
      let yPos = 100;
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(30, 41, 59);
      pdf.text('Tickets', margin, yPos);
      
      yPos += 10;
      tickets.forEach((ticket, index) => {
        const ticketType = getTicketTypeInfo(ticket.ticketTypeId, ticket.ticketTypeName);
        
        pdf.setFontSize(11);
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(71, 85, 105);
        pdf.text(`${index + 1}. ${ticketType?.name || 'Ticket'} - $${ticketType?.price.toFixed(2) || '0.00'}`, margin, yPos);
        pdf.text(`   QR: ${ticket.qrCodeData || ticket.qrCode || ticket.id}`, margin, yPos + 6);
        yPos += 16;
        
        if (yPos > 250) {
          pdf.addPage();
          yPos = 30;
        }
      });
      
      // Order total
      yPos += 10;
      pdf.setDrawColor(226, 232, 240);
      pdf.line(margin, yPos, pageWidth - margin, yPos);
      yPos += 10;
      
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(30, 41, 59);
      pdf.text(`Total: $${totalAmount.toFixed(2)}`, pageWidth - margin, yPos, { align: 'right' });
      
      pdf.save(`order-${order.id}.pdf`);
    } catch (error) {
      console.error('Failed to download order:', error);
      alert('Failed to download order. Please try again.');
    } finally {
      setIsDownloading(false);
    }
  };

  // Format payment method
  const formatPaymentMethod = (method: string): string => {
    const methods: Record<string, string> = {
      credit_card: 'Credit Card',
      debit_card: 'Debit Card',
      paypal: 'PayPal',
      bank_transfer: 'Bank Transfer',
    };
    return methods[method] || method;
  };

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Link
        href="/dashboard/orders"
        className="inline-flex items-center text-sm text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300"
      >
        ← Back to Orders
      </Link>

      {/* Order Header */}
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                Order #{order.id.replace('order-', '')}
              </h1>
              <OrderStatusBadge status={order.status} />
            </div>
            <p className="text-slate-500 dark:text-slate-400">
              Placed on {new Date(order.createdAt).toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={handleDownloadAll}
              disabled={isDownloading}
              className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
            >
              {isDownloading ? (
                <>
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Downloading...
                </>
              ) : (
                <>
                  ⬇️ Download All
                </>
              )}
            </button>
            {canRequestRefund && (
              <button
                onClick={handleRefundRequest}
                disabled={isRequestingRefund}
                className="inline-flex items-center gap-2 px-4 py-2 bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
              >
                {isRequestingRefund ? (
                  <>
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Submitting...
                  </>
                ) : '💰 Request Refund'}
              </button>
            )}
          </div>
        </div>
        
        {refundRequested && (
          <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
            <p className="text-green-700 dark:text-green-400 text-sm font-medium">
              ✓ Refund request submitted successfully!
            </p>
            <p className="text-green-600 dark:text-green-500 text-xs mt-1">
              The organizer will review your request and you will be notified of the decision.
            </p>
          </div>
        )}
        {!refundRequested && existingRefundStatus && (
          <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg flex items-center gap-2">
            <span className="text-blue-700 dark:text-blue-400 text-sm">
              💰 Refund Request: <span className="font-semibold">{existingRefundStatus}</span>
            </span>
          </div>
        )}
        {/* Refund eligibility info */}
        {!refundRequested && !existingRefundStatus && refundEligibility && (
          <div className={`mt-4 p-4 rounded-lg border text-sm flex items-start gap-2 ${
            refundEligibility.eligible
              ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800'
              : 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800'
          }`}>
            <span className="text-lg leading-none">
              {refundEligibility.eligible ? '✅' : '⚠️'}
            </span>
            <div>
              {refundEligibility.eligible ? (
                <>
                  <span className="font-medium text-emerald-800 dark:text-emerald-300">
                    Refund available
                  </span>
                  {refundEligibility.deadlineDate && (
                    <span className="text-emerald-700 dark:text-emerald-400">
                      {' '}until{' '}
                      <span className="font-semibold">
                        {new Date(refundEligibility.deadlineDate).toLocaleDateString('en-US', {
                          month: 'long', day: 'numeric', year: 'numeric'
                        })}
                      </span>
                    </span>
                  )}
                  {refundEligibility.refundPercentage != null && (
                    <span className="text-emerald-700 dark:text-emerald-400">
                      {' '}· <span className="font-semibold">{refundEligibility.refundPercentage}% refund</span>
                    </span>
                  )}
                </>
              ) : (
                <span className="font-medium text-amber-800 dark:text-amber-300">
                  {refundEligibility.reason || 'Refund not available for this order'}
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Event Info */}
      {event && (
        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-6">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
            Event Details
          </h2>
          <div className="flex items-start gap-4">
            <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center text-white text-3xl flex-shrink-0">
              📅
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                {event.title || event.name}
              </h3>
              <div className="space-y-1 text-sm text-slate-600 dark:text-slate-400">
                <p>📅 {eventDate.toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}</p>
                <p>🕐 {eventDate.toLocaleTimeString('en-US', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}</p>
                <p>📍 {event.location}</p>
              </div>
            </div>
            {isPastEvent && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                Past Event
              </span>
            )}
          </div>
        </div>
      )}

      {/* Tickets */}
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-6">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
          Tickets ({tickets.length})
        </h2>
        <div className="space-y-4">
          {tickets.map((ticket, index) => {
            const ticketType = getTicketTypeInfo(ticket.ticketTypeId, ticket.ticketTypeName);
            return (
              <div
                key={ticket.id}
                className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg"
              >
                <div className="flex-shrink-0">
                  <div className="p-2 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700">
                    <QRCodeSVG value={ticket.qrCodeData || ticket.qrCode || ticket.id} size={60} level="M" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-medium text-slate-900 dark:text-white">
                      Ticket #{index + 1}
                    </span>
                    {ticket.checkedIn && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                        ✓ Checked In
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    {ticketType?.name || ticket.ticketTypeName || 'Standard Ticket'}
                  </p>
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                    ID: {ticket.id}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-semibold text-slate-900 dark:text-white">
                    ${ticketType?.price.toFixed(2) || '0.00'}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Payment Summary */}
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-6">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
          Payment Summary
        </h2>
        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-slate-600 dark:text-slate-400">Payment Method</span>
            <span className="text-slate-900 dark:text-white font-medium">
              {formatPaymentMethod(order.paymentMethod || '')}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-600 dark:text-slate-400">Subtotal</span>
            <span className="text-slate-900 dark:text-white">
              ${(totalAmount * 0.9).toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-600 dark:text-slate-400">Service Fee</span>
            <span className="text-slate-900 dark:text-white">
              ${(totalAmount * 0.1).toFixed(2)}
            </span>
          </div>
          <div className="border-t border-slate-200 dark:border-slate-800 pt-3 mt-3">
            <div className="flex justify-between">
              <span className="text-lg font-semibold text-slate-900 dark:text-white">Total</span>
              <span className="text-lg font-bold text-slate-900 dark:text-white">
                ${totalAmount.toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Need Help */}
      <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-6 text-center">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
          Need Help?
        </h3>
        <p className="text-slate-500 dark:text-slate-400 mb-4">
          If you have any questions about your order, please contact our support team.
        </p>
        <button className="inline-flex items-center px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-sm font-medium">
          📧 Contact Support
        </button>
      </div>
    </div>
  );
}

/**
 * Order status badge component
 */
function OrderStatusBadge({ status }: { status: string }) {
  const statusStyles: Record<string, string> = {
    completed: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    pending: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
    refunded: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    cancelled: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${statusStyles[status] || statusStyles.pending}`}
    >
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

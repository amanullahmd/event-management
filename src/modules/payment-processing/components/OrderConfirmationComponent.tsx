'use client';

import React from 'react';
import { ConfirmationResponse } from '../types/order';

interface OrderConfirmationComponentProps {
  order: ConfirmationResponse;
  onDownload?: () => void;
  onPrint?: () => void;
}

/**
 * OrderConfirmationComponent
 * Component for displaying order confirmation and next steps
 */
export function OrderConfirmationComponent({
  order,
  onDownload,
  onPrint,
}: OrderConfirmationComponentProps) {
  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'COMPLETED':
      case 'CONFIRMED':
        return 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-800 dark:text-green-200';
      case 'PENDING':
        return 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800 text-yellow-800 dark:text-yellow-200';
      case 'FAILED':
        return 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-800 dark:text-red-200';
      default:
        return 'bg-slate-50 dark:bg-slate-900/20 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200';
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Success Header */}
      <div className="text-center mb-8">
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
            <svg
              className="w-8 h-8 text-green-600 dark:text-green-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
        </div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
          Order Confirmed!
        </h1>
        <p className="text-slate-600 dark:text-slate-400">
          Thank you for your purchase. Your tickets have been confirmed.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Details */}
          <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
              Order Details
            </h2>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Order ID</p>
                <p className="text-lg font-semibold text-slate-900 dark:text-white font-mono">
                  {order.orderId}
                </p>
              </div>

              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Order Date</p>
                <p className="text-lg font-semibold text-slate-900 dark:text-white">
                  {formatDate(order.orderDate)}
                </p>
              </div>

              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Status</p>
                <div className={`inline-block px-3 py-1 rounded-full text-sm font-semibold border ${getStatusColor(order.orderStatus)}`}>
                  {order.orderStatus}
                </div>
              </div>

              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Event</p>
                <p className="text-lg font-semibold text-slate-900 dark:text-white">
                  {order.eventName}
                </p>
              </div>
            </div>
          </div>

          {/* Attendee Information */}
          <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
              Attendee Information
            </h2>

            <div className="space-y-3">
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Name</p>
                <p className="text-slate-900 dark:text-white">{order.attendeeName}</p>
              </div>

              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Email</p>
                <p className="text-slate-900 dark:text-white">{order.attendeeEmail}</p>
              </div>

              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Phone</p>
                <p className="text-slate-900 dark:text-white">{order.attendeePhone}</p>
              </div>
            </div>
          </div>

          {/* Tickets */}
          <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
              Tickets
            </h2>

            <div className="space-y-3">
              {order.items.map((item) => (
                <div
                  key={item.id}
                  className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg"
                >
                  <div>
                    <p className="font-medium text-slate-900 dark:text-white">
                      {item.ticketTypeName}
                    </p>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      Quantity: {item.quantity}
                    </p>
                  </div>
                  <p className="font-semibold text-slate-900 dark:text-white">
                    {formatPrice((item.priceCents * item.quantity) / 100)}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Instructions */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-blue-900 dark:text-blue-200 mb-2">
              Next Steps
            </h2>
            <p className="text-blue-800 dark:text-blue-300">
              {order.instructions}
            </p>
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          {/* Order Summary */}
          <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6 mb-6">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
              Order Summary
            </h3>

            <div className="space-y-3">
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Subtotal</span>
                <span>{formatPrice(order.subtotal)}</span>
              </div>

              {order.discountAmount > 0 && (
                <div className="flex justify-between text-green-600 dark:text-green-400">
                  <span>Discount {order.appliedPromoCode && `(${order.appliedPromoCode})`}</span>
                  <span>-{formatPrice(order.discountAmount)}</span>
                </div>
              )}

              <div className="border-t border-slate-200 dark:border-slate-700 pt-3 flex justify-between text-lg font-semibold text-slate-900 dark:text-white">
                <span>Total</span>
                <span>{formatPrice(order.total)}</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-3">
            {onDownload && (
              <button
                onClick={onDownload}
                className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                  />
                </svg>
                Download Confirmation
              </button>
            )}

            {onPrint && (
              <button
                onClick={onPrint}
                className="w-full px-4 py-3 bg-slate-600 hover:bg-slate-700 text-white rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4H9a2 2 0 00-2 2v2a2 2 0 002 2h6a2 2 0 002-2v-2a2 2 0 00-2-2zm-6-4h.01M7 20h10"
                  />
                </svg>
                Print Confirmation
              </button>
            )}

            <a
              href="/dashboard"
              className="w-full px-4 py-3 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-900 dark:text-white rounded-lg font-semibold transition-colors text-center"
            >
              Back to Dashboard
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}


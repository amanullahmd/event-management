'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';

interface AuditLog {
  id: string;
  ticketTypeId: string;
  eventId: string;
  organizerId: string;
  action: string;
  oldValues: string | null;
  newValues: string | null;
  timestamp: string;
}

interface TicketType {
  id: string;
  name: string;
  category: string;
  price: number;
  quantityLimit: number;
  quantitySold: number;
  availability: number;
  availabilityPercentage: number;
  lowAvailability: boolean;
  soldOut: boolean;
  saleStartDate: string;
  saleEndDate: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface TicketTypeDetailsProps {
  ticketType: TicketType;
  auditLogs?: AuditLog[];
  onEdit: () => void;
  onBack: () => void;
  isLoadingLogs?: boolean;
}

/**
 * Ticket Type Details Component
 * Displays detailed information about a ticket type including availability metrics and audit logs
 */
export function TicketTypeDetails({
  ticketType,
  auditLogs = [],
  onEdit,
  onBack,
  isLoadingLogs = false,
}: TicketTypeDetailsProps) {
  const [showAuditLogs, setShowAuditLogs] = useState(false);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  const getAvailabilityBadge = () => {
    if (ticketType.soldOut) {
      return (
        <span className="inline-block px-3 py-1 text-sm font-semibold text-white bg-red-600 rounded">
          Sold Out
        </span>
      );
    }
    if (ticketType.lowAvailability) {
      return (
        <span className="inline-block px-3 py-1 text-sm font-semibold text-white bg-orange-600 rounded">
          Low Availability
        </span>
      );
    }
    return (
      <span className="inline-block px-3 py-1 text-sm font-semibold text-white bg-green-600 rounded">
        Available
      </span>
    );
  };

  const parseJsonSafely = (jsonString: string | null) => {
    if (!jsonString) return null;
    try {
      return JSON.parse(jsonString);
    } catch {
      return null;
    }
  };

  const getActionLabel = (action: string) => {
    const labels: Record<string, string> = {
      TICKET_TYPE_CREATED: 'Created',
      TICKET_TYPE_UPDATED: 'Updated',
      TICKET_TYPE_DELETED: 'Deleted',
    };
    return labels[action] || action;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
            {ticketType.name}
          </h2>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            {ticketType.category}
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={onEdit} className="bg-blue-600 hover:bg-blue-700 text-white">
            Edit
          </Button>
          <Button onClick={onBack} variant="outline">
            Back
          </Button>
        </div>
      </div>

      {/* Main Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Pricing */}
        <div className="bg-slate-50 dark:bg-slate-900 p-6 rounded-lg">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
            Pricing
          </h3>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400">Price per Ticket</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">
                {formatPrice(ticketType.price)}
              </p>
            </div>
          </div>
        </div>

        {/* Availability */}
        <div className="bg-slate-50 dark:bg-slate-900 p-6 rounded-lg">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
            Availability
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm text-slate-600 dark:text-slate-400">Status</p>
              {getAvailabilityBadge()}
            </div>
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400">Available</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">
                {ticketType.availability} / {ticketType.quantityLimit}
              </p>
            </div>
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400">Availability</p>
              <div className="flex items-center gap-2 mt-1">
                <div className="flex-1 bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full"
                    style={{ width: `${ticketType.availabilityPercentage}%` }}
                  ></div>
                </div>
                <p className="text-sm font-semibold text-slate-900 dark:text-white">
                  {ticketType.availabilityPercentage.toFixed(1)}%
                </p>
              </div>
            </div>
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400">Sold</p>
              <p className="text-lg font-semibold text-slate-900 dark:text-white">
                {ticketType.quantitySold} tickets
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Sale Period */}
      <div className="bg-slate-50 dark:bg-slate-900 p-6 rounded-lg">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
          Sale Period
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p className="text-sm text-slate-600 dark:text-slate-400">Start Date</p>
            <p className="text-slate-900 dark:text-white font-medium">
              {formatDate(ticketType.saleStartDate)}
            </p>
          </div>
          <div>
            <p className="text-sm text-slate-600 dark:text-slate-400">End Date</p>
            <p className="text-slate-900 dark:text-white font-medium">
              {formatDate(ticketType.saleEndDate)}
            </p>
          </div>
        </div>
      </div>

      {/* Metadata */}
      <div className="bg-slate-50 dark:bg-slate-900 p-6 rounded-lg">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
          Metadata
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p className="text-sm text-slate-600 dark:text-slate-400">Created</p>
            <p className="text-slate-900 dark:text-white font-medium">
              {formatDate(ticketType.createdAt)}
            </p>
          </div>
          <div>
            <p className="text-sm text-slate-600 dark:text-slate-400">Last Updated</p>
            <p className="text-slate-900 dark:text-white font-medium">
              {formatDate(ticketType.updatedAt)}
            </p>
          </div>
          <div>
            <p className="text-sm text-slate-600 dark:text-slate-400">Status</p>
            <p className="text-slate-900 dark:text-white font-medium">
              {ticketType.isActive ? 'Active' : 'Inactive'}
            </p>
          </div>
        </div>
      </div>

      {/* Audit Logs */}
      <div className="bg-slate-50 dark:bg-slate-900 p-6 rounded-lg">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
            Audit Logs
          </h3>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setShowAuditLogs(!showAuditLogs)}
          >
            {showAuditLogs ? 'Hide' : 'Show'}
          </Button>
        </div>

        {showAuditLogs && (
          <div className="space-y-4">
            {isLoadingLogs ? (
              <div className="flex justify-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              </div>
            ) : auditLogs.length === 0 ? (
              <p className="text-slate-600 dark:text-slate-400 text-sm">No audit logs found</p>
            ) : (
              <div className="space-y-3">
                {auditLogs.map((log) => (
                  <div
                    key={log.id}
                    className="border border-slate-200 dark:border-slate-700 rounded p-3"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-slate-900 dark:text-white">
                        {getActionLabel(log.action)}
                      </span>
                      <span className="text-xs text-slate-600 dark:text-slate-400">
                        {formatDate(log.timestamp)}
                      </span>
                    </div>
                    {log.oldValues && (
                      <div className="text-xs text-slate-600 dark:text-slate-400 mb-1">
                        <p className="font-medium">Old Values:</p>
                        <pre className="bg-white dark:bg-slate-800 p-2 rounded overflow-auto max-h-32">
                          {JSON.stringify(parseJsonSafely(log.oldValues), null, 2)}
                        </pre>
                      </div>
                    )}
                    {log.newValues && (
                      <div className="text-xs text-slate-600 dark:text-slate-400">
                        <p className="font-medium">New Values:</p>
                        <pre className="bg-white dark:bg-slate-800 p-2 rounded overflow-auto max-h-32">
                          {JSON.stringify(parseJsonSafely(log.newValues), null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}


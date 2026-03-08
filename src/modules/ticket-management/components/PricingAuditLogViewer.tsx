'use client';

import React, { useState, useEffect } from 'react';
import { PricingAuditLog } from '@/modules/ticket-management/types/pricing';

interface PricingAuditLogViewerProps {
  eventId: string;
  ticketTypeId: string;
  isLoading?: boolean;
  error?: string;
}

/**
 * PricingAuditLogViewer Component
 * Displays pricing audit logs with formatted JSONB data
 */
export function PricingAuditLogViewer({
  eventId,
  ticketTypeId,
  isLoading: initialLoading = false,
  error: initialError,
}: PricingAuditLogViewerProps) {
  const [logs, setLogs] = useState<PricingAuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(initialLoading);
  const [error, setError] = useState<string | undefined>(initialError);

  useEffect(() => {
    const fetchAuditLogs = async () => {
      setIsLoading(true);
      setError(undefined);

      try {
        const response = await fetch(
          `/api/events/${eventId}/ticket-types/${ticketTypeId}/pricing-audit-logs`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error('Failed to fetch audit logs');
        }

        const data = await response.json();
        setLogs(Array.isArray(data) ? data : []);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'An error occurred';
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAuditLogs();
  }, [eventId, ticketTypeId]);

  const formatTimestamp = (timestamp: string): string => {
    return new Date(timestamp).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      timeZoneName: 'short',
    });
  };

  const formatAction = (action: string): string => {
    return action
      .split('_')
      .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
      .join(' ');
  };

  const formatJsonValue = (value: any): string => {
    if (value === null || value === undefined) {
      return 'N/A';
    }
    if (typeof value === 'object') {
      return JSON.stringify(value, null, 2);
    }
    if (typeof value === 'number' && value % 1 !== 0) {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
      }).format(value);
    }
    return String(value);
  };

  const renderValueChange = (oldValue: any, newValue: any, key: string) => {
    return (
      <div className="space-y-2">
        <div>
          <p className="text-xs font-semibold text-slate-600 dark:text-slate-400">Old Value:</p>
          <p className="text-sm text-slate-900 dark:text-white font-mono bg-slate-50 dark:bg-slate-900 p-2 rounded">
            {formatJsonValue(oldValue)}
          </p>
        </div>
        <div>
          <p className="text-xs font-semibold text-slate-600 dark:text-slate-400">New Value:</p>
          <p className="text-sm text-slate-900 dark:text-white font-mono bg-slate-50 dark:bg-slate-900 p-2 rounded">
            {formatJsonValue(newValue)}
          </p>
        </div>
      </div>
    );
  };

  if (error) {
    return (
      <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
        <p className="text-red-800 dark:text-red-200">{error}</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (logs.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-slate-600 dark:text-slate-400">No audit logs found</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Pricing Audit Logs</h3>

      <div className="space-y-3">
        {logs.map((log) => (
          <div
            key={log.id}
            className="p-4 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800"
          >
            {/* Header */}
            <div className="flex justify-between items-start mb-3">
              <div>
                <p className="font-semibold text-slate-900 dark:text-white">
                  {formatAction(log.action)}
                </p>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  {formatTimestamp(log.timestamp)}
                </p>
              </div>
              {log.organizerId && (
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  Organizer: {log.organizerId.substring(0, 8)}...
                </p>
              )}
            </div>

            {/* Content */}
            <div className="space-y-3">
              {/* Old and New Values */}
              {log.oldValues && log.newValues && (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Changes:</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {Object.keys(log.newValues).map((key) => (
                      <div key={key} className="space-y-1">
                        <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 capitalize">
                          {key.replace(/([A-Z])/g, ' $1').trim()}
                        </p>
                        {renderValueChange(log.oldValues?.[key], log.newValues?.[key], key)}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* New Values Only */}
              {log.newValues && !log.oldValues && (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Details:</p>
                  <div className="space-y-2">
                    {Object.entries(log.newValues).map(([key, value]) => (
                      <div key={key} className="text-sm">
                        <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 capitalize">
                          {key.replace(/([A-Z])/g, ' $1').trim()}
                        </p>
                        <p className="text-slate-900 dark:text-white font-mono bg-slate-50 dark:bg-slate-900 p-2 rounded">
                          {formatJsonValue(value)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Rejection Reason */}
              {log.rejectionReason && (
                <div className="p-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded">
                  <p className="text-xs font-semibold text-red-800 dark:text-red-200 mb-1">
                    Rejection Reason:
                  </p>
                  <p className="text-sm text-red-700 dark:text-red-300">{log.rejectionReason}</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}


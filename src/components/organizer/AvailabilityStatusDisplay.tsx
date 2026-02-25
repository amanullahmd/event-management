'use client';

import React from 'react';
import { AvailabilityStatus } from '@/lib/types/pricing';

interface AvailabilityStatusDisplayProps {
  status: AvailabilityStatus;
  availability: number;
  availabilityPercentage: number;
  lowStockWarning: boolean;
  quantityLimit: number;
}

/**
 * AvailabilityStatusDisplay Component
 * Displays ticket availability status with visual indicators
 */
export function AvailabilityStatusDisplay({
  status,
  availability,
  availabilityPercentage,
  lowStockWarning,
  quantityLimit,
}: AvailabilityStatusDisplayProps) {
  const getStatusBadgeStyles = () => {
    switch (status) {
      case 'SOLD_OUT':
        return 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200 border-red-300 dark:border-red-700';
      case 'LOW_STOCK':
        return 'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-200 border-orange-300 dark:border-orange-700';
      case 'AVAILABLE':
        return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 border-green-300 dark:border-green-700';
      default:
        return 'bg-slate-100 dark:bg-slate-900/30 text-slate-800 dark:text-slate-200 border-slate-300 dark:border-slate-700';
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'SOLD_OUT':
        return 'Sold Out';
      case 'LOW_STOCK':
        return 'Low Stock';
      case 'AVAILABLE':
        return 'Available';
      default:
        return 'Unknown';
    }
  };

  const getProgressBarColor = () => {
    switch (status) {
      case 'SOLD_OUT':
        return 'bg-red-500';
      case 'LOW_STOCK':
        return 'bg-orange-500';
      case 'AVAILABLE':
        return 'bg-green-500';
      default:
        return 'bg-slate-500';
    }
  };

  return (
    <div className="space-y-3">
      {/* Status Badge */}
      <div className={`inline-block px-3 py-1 rounded-full border text-sm font-semibold ${getStatusBadgeStyles()}`}>
        {getStatusText()}
      </div>

      {/* Availability Info */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
            Availability
          </span>
          <span className="text-sm font-semibold text-slate-900 dark:text-white">
            {availability} / {quantityLimit} ({availabilityPercentage.toFixed(1)}%)
          </span>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 overflow-hidden">
          <div
            className={`h-full ${getProgressBarColor()} transition-all duration-300`}
            style={{ width: `${Math.min(availabilityPercentage, 100)}%` }}
          />
        </div>
      </div>

      {/* Low Stock Warning */}
      {lowStockWarning && status !== 'SOLD_OUT' && (
        <div className="p-2 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded">
          <p className="text-xs text-orange-800 dark:text-orange-200 font-medium">
            ⚠️ Only {availability} ticket{availability !== 1 ? 's' : ''} remaining
          </p>
        </div>
      )}

      {/* Sold Out Message */}
      {status === 'SOLD_OUT' && (
        <div className="p-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded">
          <p className="text-xs text-red-800 dark:text-red-200 font-medium">
            This ticket type is sold out
          </p>
        </div>
      )}
    </div>
  );
}

'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';

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

interface TicketTypeListProps {
  ticketTypes: TicketType[];
  onEdit: (ticketType: TicketType) => void;
  onDelete: (ticketTypeId: string) => void;
  onViewAuditLogs: (ticketTypeId: string) => void;
  isLoading?: boolean;
  error?: string;
  sort?: string;
  onSortChange?: (sort: string) => void;
}

/**
 * Ticket Type List Component
 * Displays ticket types in a table with sorting and action buttons
 */
export function TicketTypeList({
  ticketTypes,
  onEdit,
  onDelete,
  onViewAuditLogs,
  isLoading = false,
  error,
  sort = 'created_at',
  onSortChange,
}: TicketTypeListProps) {
  const [sortBy, setSortBy] = useState(sort);

  const handleSortChange = (newSort: string) => {
    setSortBy(newSort);
    onSortChange?.(newSort);
  };

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

  const getAvailabilityColor = (percentage: number, soldOut: boolean) => {
    if (soldOut) return 'text-red-600 dark:text-red-400';
    if (percentage < 10) return 'text-orange-600 dark:text-orange-400';
    return 'text-green-600 dark:text-green-400';
  };

  const getAvailabilityBadge = (ticketType: TicketType) => {
    if (ticketType.soldOut) {
      return (
        <span className="inline-block px-2 py-1 text-xs font-semibold text-white bg-red-600 rounded">
          Sold Out
        </span>
      );
    }
    if (ticketType.lowAvailability) {
      return (
        <span className="inline-block px-2 py-1 text-xs font-semibold text-white bg-orange-600 rounded">
          Low Availability
        </span>
      );
    }
    return (
      <span className="inline-block px-2 py-1 text-xs font-semibold text-white bg-green-600 rounded">
        Available
      </span>
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

  if (ticketTypes.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-slate-600 dark:text-slate-400">No ticket types found</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Sort Controls */}
      <div className="flex justify-end gap-2">
        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
          Sort by:
        </label>
        <select
          value={sortBy}
          onChange={(e) => handleSortChange(e.target.value)}
          className="px-3 py-1 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="created_at">Creation Date</option>
          <option value="price">Price</option>
        </select>
      </div>

      {/* Table */}
      <div className="overflow-x-auto border border-slate-200 dark:border-slate-700 rounded-lg">
        <table className="w-full">
          <thead className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900 dark:text-white">
                Name
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900 dark:text-white">
                Category
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900 dark:text-white">
                Price
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900 dark:text-white">
                Availability
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900 dark:text-white">
                Sale Period
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900 dark:text-white">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
            {ticketTypes.map((ticketType) => (
              <tr
                key={ticketType.id}
                className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
              >
                <td className="px-6 py-4 text-sm text-slate-900 dark:text-white font-medium">
                  {ticketType.name}
                </td>
                <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">
                  {ticketType.category}
                </td>
                <td className="px-6 py-4 text-sm text-slate-900 dark:text-white font-medium">
                  {formatPrice(ticketType.price)}
                </td>
                <td className="px-6 py-4 text-sm">
                  <div className="space-y-1">
                    {getAvailabilityBadge(ticketType)}
                    <p
                      className={`text-xs font-semibold ${getAvailabilityColor(
                        ticketType.availabilityPercentage,
                        ticketType.soldOut
                      )}`}
                    >
                      {ticketType.availability} / {ticketType.quantityLimit} available
                      ({ticketType.availabilityPercentage.toFixed(1)}%)
                    </p>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">
                  <div className="space-y-1">
                    <p>{formatDate(ticketType.saleStartDate)}</p>
                    <p>to</p>
                    <p>{formatDate(ticketType.saleEndDate)}</p>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm">
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onEdit(ticketType)}
                      className="text-xs"
                    >
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onViewAuditLogs(ticketType.id)}
                      className="text-xs"
                    >
                      Logs
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onDelete(ticketType.id)}
                      className="text-xs text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                    >
                      Delete
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}


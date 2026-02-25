'use client';

import React from 'react';
import { AvailabilityStatusDisplay } from './AvailabilityStatusDisplay';
import { TicketTypeWithPricing } from '@/lib/types/pricing';

interface TicketSelectionComponentProps {
  ticketTypes: TicketTypeWithPricing[];
  selectedTicketTypeId?: string;
  onSelect: (ticketType: TicketTypeWithPricing) => void;
  isLoading?: boolean;
  error?: string;
}

/**
 * TicketSelectionComponent
 * Component for attendees to select ticket types with pricing and availability info
 */
export function TicketSelectionComponent({
  ticketTypes,
  selectedTicketTypeId,
  onSelect,
  isLoading = false,
  error,
}: TicketSelectionComponentProps) {
  const formatPrice = (ticketType: TicketTypeWithPricing): string => {
    switch (ticketType.pricingRuleType) {
      case 'FREE':
        return 'Free';
      case 'PAID':
        return ticketType.price
          ? new Intl.NumberFormat('en-US', {
              style: 'currency',
              currency: 'USD',
            }).format(ticketType.price)
          : 'Price TBD';
      case 'DONATION':
        return ticketType.minimumDonation
          ? `Minimum ${new Intl.NumberFormat('en-US', {
              style: 'currency',
              currency: 'USD',
            }).format(ticketType.minimumDonation)}`
          : 'Donation';
      default:
        return 'Price TBD';
    }
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
        <p className="text-slate-600 dark:text-slate-400">No ticket types available</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Select Ticket Type</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {ticketTypes.map((ticketType) => {
          const isSelected = selectedTicketTypeId === ticketType.id;
          const isSoldOut = ticketType.availabilityStatus === 'SOLD_OUT';
          const isDisabled = isSoldOut;

          return (
            <button
              key={ticketType.id}
              onClick={() => !isDisabled && onSelect(ticketType)}
              disabled={isDisabled}
              className={`p-4 rounded-lg border-2 transition-all text-left ${
                isSelected
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800'
              } ${
                isDisabled
                  ? 'opacity-50 cursor-not-allowed'
                  : 'cursor-pointer hover:border-blue-300 dark:hover:border-blue-600'
              }`}
            >
              {/* Ticket Type Header */}
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h4 className="font-semibold text-slate-900 dark:text-white">
                    {ticketType.name}
                  </h4>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    {ticketType.category}
                  </p>
                </div>
                {isSelected && (
                  <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center">
                    <svg
                      className="w-3 h-3 text-white"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                )}
              </div>

              {/* Price */}
              <div className="mb-3 pb-3 border-b border-slate-200 dark:border-slate-700">
                <p className="text-lg font-bold text-slate-900 dark:text-white">
                  {formatPrice(ticketType)}
                </p>
              </div>

              {/* Availability Status */}
              <AvailabilityStatusDisplay
                status={ticketType.availabilityStatus}
                availability={ticketType.availability}
                availabilityPercentage={ticketType.availabilityPercentage}
                lowStockWarning={ticketType.lowStockWarning}
                quantityLimit={ticketType.quantityLimit}
              />

              {/* Sale Period Info */}
              <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-400">
                <p>
                  Sales: {new Date(ticketType.saleStartDate).toLocaleDateString()} -{' '}
                  {new Date(ticketType.saleEndDate).toLocaleDateString()}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

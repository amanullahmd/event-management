'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { PricingRuleType, PricingRule, CreatePricingRuleRequest, UpdatePricingRuleRequest } from '@/lib/types/pricing';

interface PricingRuleFormProps {
  eventId: string;
  ticketTypeId: string;
  initialRule?: PricingRule;
  onSuccess: (rule: PricingRule) => void;
  onError: (error: string) => void;
  onCancel?: () => void;
}

interface FormErrors {
  pricingRuleType?: string;
  price?: string;
  minimumDonation?: string;
  general?: string;
}

/**
 * PricingRuleForm Component
 * Form for creating and updating pricing rules with conditional field visibility
 */
export function PricingRuleForm({
  eventId,
  ticketTypeId,
  initialRule,
  onSuccess,
  onError,
  onCancel,
}: PricingRuleFormProps) {
  const [pricingRuleType, setPricingRuleType] = useState<PricingRuleType>(
    initialRule?.pricingRuleType || 'FREE'
  );
  const [price, setPrice] = useState<string>(initialRule?.price?.toString() || '');
  const [minimumDonation, setMinimumDonation] = useState<string>(
    initialRule?.minimumDonation?.toString() || ''
  );
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);

  // Validate form inputs
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!pricingRuleType) {
      newErrors.pricingRuleType = 'Pricing rule type is required';
    }

    if (pricingRuleType === 'PAID') {
      const priceNum = parseFloat(price);
      if (!price || isNaN(priceNum)) {
        newErrors.price = 'Price is required for paid tickets';
      } else if (priceNum <= 0) {
        newErrors.price = 'Price must be greater than 0';
      } else if (!/^\d+(\.\d{1,2})?$/.test(price)) {
        newErrors.price = 'Price must have at most 2 decimal places';
      }
    }

    if (pricingRuleType === 'DONATION') {
      const minDonationNum = parseFloat(minimumDonation);
      if (minimumDonation && !isNaN(minDonationNum)) {
        if (minDonationNum < 0) {
          newErrors.minimumDonation = 'Minimum donation cannot be negative';
        } else if (!/^\d+(\.\d{1,2})?$/.test(minimumDonation)) {
          newErrors.minimumDonation = 'Minimum donation must have at most 2 decimal places';
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      const payload: CreatePricingRuleRequest | UpdatePricingRuleRequest = {
        pricingRuleType,
        price: pricingRuleType === 'PAID' ? parseFloat(price) : undefined,
        minimumDonation: pricingRuleType === 'DONATION' ? parseFloat(minimumDonation) || 0 : undefined,
      };

      const endpoint = `/api/events/${eventId}/ticket-types/${ticketTypeId}/pricing-rules`;
      const method = initialRule ? 'PATCH' : 'POST';

      const response = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to save pricing rule');
      }

      const result = await response.json();
      onSuccess(result);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An error occurred';
      setErrors({ general: errorMessage });
      onError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 p-6 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
      <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
        {initialRule ? 'Update Pricing Rule' : 'Create Pricing Rule'}
      </h3>

      {errors.general && (
        <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-sm text-red-800 dark:text-red-200">{errors.general}</p>
        </div>
      )}

      {/* Pricing Rule Type */}
      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
          Pricing Rule Type *
        </label>
        <select
          value={pricingRuleType}
          onChange={(e) => {
            setPricingRuleType(e.target.value as PricingRuleType);
            setErrors({ ...errors, pricingRuleType: undefined });
          }}
          className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="FREE">Free</option>
          <option value="PAID">Paid</option>
          <option value="DONATION">Donation</option>
        </select>
        {errors.pricingRuleType && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.pricingRuleType}</p>
        )}
      </div>

      {/* Price Field - Visible for PAID */}
      {pricingRuleType === 'PAID' && (
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Price (USD) *
          </label>
          <input
            type="number"
            step="0.01"
            min="0.01"
            value={price}
            onChange={(e) => {
              setPrice(e.target.value);
              setErrors({ ...errors, price: undefined });
            }}
            placeholder="0.00"
            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {errors.price && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.price}</p>
          )}
        </div>
      )}

      {/* Minimum Donation Field - Visible for DONATION */}
      {pricingRuleType === 'DONATION' && (
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Minimum Donation (USD)
          </label>
          <input
            type="number"
            step="0.01"
            min="0"
            value={minimumDonation}
            onChange={(e) => {
              setMinimumDonation(e.target.value);
              setErrors({ ...errors, minimumDonation: undefined });
            }}
            placeholder="0.00"
            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {errors.minimumDonation && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.minimumDonation}</p>
          )}
        </div>
      )}

      {/* Info Text for FREE */}
      {pricingRuleType === 'FREE' && (
        <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <p className="text-sm text-blue-800 dark:text-blue-200">
            Free tickets require no payment from attendees.
          </p>
        </div>
      )}

      {/* Form Actions */}
      <div className="flex gap-3 justify-end">
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={loading}
          >
            Cancel
          </Button>
        )}
        <Button
          type="submit"
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          {loading ? 'Saving...' : initialRule ? 'Update Pricing Rule' : 'Create Pricing Rule'}
        </Button>
      </div>
    </form>
  );
}

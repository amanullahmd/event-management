'use client';

import React, { useState } from 'react';
import { Button } from '@/modules/shared-common/components/ui/button';
import { PricingRuleForm } from './PricingRuleForm';
import { PricingAuditLogViewer } from './PricingAuditLogViewer';
import { PricingRule } from '@/modules/ticket-management/types/pricing';

interface PricingManagementSectionProps {
  eventId: string;
  ticketTypeId: string;
  ticketTypeName: string;
  initialRule?: PricingRule;
}

type ViewMode = 'view' | 'edit' | 'logs';

/**
 * PricingManagementSection Component
 * Integrates pricing rule management and audit logs for a ticket type
 */
export function PricingManagementSection({
  eventId,
  ticketTypeId,
  ticketTypeName,
  initialRule,
}: PricingManagementSectionProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('view');
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');

  const handleFormSuccess = (rule: PricingRule) => {
    setSuccessMessage(
      initialRule ? 'Pricing rule updated successfully' : 'Pricing rule created successfully'
    );
    setViewMode('view');
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const handleFormError = (error: string) => {
    setErrorMessage(error);
    setTimeout(() => setErrorMessage(''), 5000);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
          Pricing Management: {ticketTypeName}
        </h3>
        <div className="flex gap-2">
          <Button
            variant={viewMode === 'view' ? 'default' : 'outline'}
            onClick={() => setViewMode('view')}
            size="sm"
          >
            View
          </Button>
          <Button
            variant={viewMode === 'edit' ? 'default' : 'outline'}
            onClick={() => setViewMode('edit')}
            size="sm"
          >
            {initialRule ? 'Edit' : 'Create'}
          </Button>
          <Button
            variant={viewMode === 'logs' ? 'default' : 'outline'}
            onClick={() => setViewMode('logs')}
            size="sm"
          >
            Audit Logs
          </Button>
        </div>
      </div>

      {/* Messages */}
      {successMessage && (
        <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
          <p className="text-sm text-green-800 dark:text-green-200">{successMessage}</p>
        </div>
      )}

      {errorMessage && (
        <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-sm text-red-800 dark:text-red-200">{errorMessage}</p>
        </div>
      )}

      {/* Content */}
      {viewMode === 'view' && initialRule && (
        <div className="p-6 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
          <dl className="space-y-4">
            <div className="flex justify-between">
              <dt className="text-sm font-medium text-slate-600 dark:text-slate-400">
                Pricing Type:
              </dt>
              <dd className="text-sm font-semibold text-slate-900 dark:text-white">
                {initialRule.pricingRuleType}
              </dd>
            </div>
            {initialRule.pricingRuleType === 'PAID' && initialRule.price !== undefined && (
              <div className="flex justify-between">
                <dt className="text-sm font-medium text-slate-600 dark:text-slate-400">
                  Price:
                </dt>
                <dd className="text-sm font-semibold text-slate-900 dark:text-white">
                  {new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: 'USD',
                  }).format(initialRule.price)}
                </dd>
              </div>
            )}
            {initialRule.pricingRuleType === 'DONATION' && initialRule.minimumDonation !== undefined && (
              <div className="flex justify-between">
                <dt className="text-sm font-medium text-slate-600 dark:text-slate-400">
                  Minimum Donation:
                </dt>
                <dd className="text-sm font-semibold text-slate-900 dark:text-white">
                  {new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: 'USD',
                  }).format(initialRule.minimumDonation)}
                </dd>
              </div>
            )}
            <div className="flex justify-between">
              <dt className="text-sm font-medium text-slate-600 dark:text-slate-400">
                Created:
              </dt>
              <dd className="text-sm font-semibold text-slate-900 dark:text-white">
                {new Date(initialRule.createdAt).toLocaleString()}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-sm font-medium text-slate-600 dark:text-slate-400">
                Last Updated:
              </dt>
              <dd className="text-sm font-semibold text-slate-900 dark:text-white">
                {new Date(initialRule.updatedAt).toLocaleString()}
              </dd>
            </div>
          </dl>
        </div>
      )}

      {viewMode === 'view' && !initialRule && (
        <div className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700 text-center">
          <p className="text-slate-600 dark:text-slate-400 mb-4">
            No pricing rule configured yet. Create one to start managing ticket pricing.
          </p>
          <Button
            onClick={() => setViewMode('edit')}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            Create Pricing Rule
          </Button>
        </div>
      )}

      {viewMode === 'edit' && (
        <PricingRuleForm
          eventId={eventId}
          ticketTypeId={ticketTypeId}
          initialRule={initialRule}
          onSuccess={handleFormSuccess}
          onError={handleFormError}
          onCancel={() => setViewMode('view')}
        />
      )}

      {viewMode === 'logs' && (
        <PricingAuditLogViewer
          eventId={eventId}
          ticketTypeId={ticketTypeId}
        />
      )}
    </div>
  );
}


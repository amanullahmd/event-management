'use client';

import React from 'react';
import { RetentionPolicyManagement } from '@/components/data-governance/RetentionPolicyManagement';
import { RetentionExecutionLogViewer } from '@/components/data-governance/RetentionExecutionLog';
import { RegionalStorageDashboard } from '@/components/data-governance/RegionalStorageDashboard';

export default function DataResidencyPage() {
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || '';

  return (
    <div className="container mx-auto py-8 px-4 space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Data Residency & Retention</h1>
        <p className="text-gray-500 mt-1">
          Manage data retention policies and regional data storage compliance.
        </p>
      </div>

      <RetentionPolicyManagement apiBaseUrl={apiBaseUrl} />
      <RetentionExecutionLogViewer apiBaseUrl={apiBaseUrl} />
      <RegionalStorageDashboard apiBaseUrl={apiBaseUrl} />
    </div>
  );
}


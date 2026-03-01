'use client';

import React from 'react';
import { ConsentManagement } from '@/components/gdpr/ConsentManagement';
import { ConsentAuditTrailViewer } from '@/components/gdpr/ConsentAuditTrailViewer';
import { DataMinimizationDashboard } from '@/components/gdpr/DataMinimizationDashboard';

/**
 * Privacy & GDPR settings page.
 * Allows users to manage consent preferences, view audit trail,
 * and see data minimization policies.
 */
export default function PrivacySettingsPage() {
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Privacy Settings</h1>
        <p className="text-gray-600 mt-1">
          Control how your personal data is collected, used, and shared.
        </p>
      </div>

      <ConsentManagement apiBaseUrl={apiBaseUrl} />

      <ConsentAuditTrailViewer apiBaseUrl={apiBaseUrl} />

      <DataMinimizationDashboard apiBaseUrl={apiBaseUrl} />
    </div>
  );
}

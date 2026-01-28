'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

interface Settings {
  commissionRate: number;
  platformFee: number;
  paymentGateway: string;
  emailNotifications: boolean;
  maintenanceMode: boolean;
}

/**
 * Admin Settings Page
 * Displays platform configuration options
 * Allows admin to update settings
 */
export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings>({
    commissionRate: 0.1,
    platformFee: 2.5,
    paymentGateway: 'stripe',
    emailNotifications: true,
    maintenanceMode: false,
  });

  const [editingField, setEditingField] = useState<string | null>(null);
  const [tempValue, setTempValue] = useState<any>(null);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  // Handle field edit
  const handleEditField = (field: string, value: any) => {
    setEditingField(field);
    setTempValue(value);
  };

  // Handle save
  const handleSave = (field: string) => {
    if (tempValue === null) return;

    setSettings({
      ...settings,
      [field]: tempValue,
    });

    setSaveMessage(`${field} updated successfully`);
    setEditingField(null);
    setTempValue(null);

    setTimeout(() => setSaveMessage(null), 3000);
  };

  // Handle cancel
  const handleCancel = () => {
    setEditingField(null);
    setTempValue(null);
  };

  return (
    <div className="space-y-8">
      {/* Page header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
          Platform Settings
        </h1>
        <p className="text-slate-600 dark:text-slate-400 mt-2">
          Configure platform settings and preferences
        </p>
      </div>

      {/* Success message */}
      {saveMessage && (
        <div className="p-4 bg-green-100 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-lg">
          <p className="text-green-800 dark:text-green-400 font-medium">{saveMessage}</p>
        </div>
      )}

      {/* Commission Settings */}
      <div className="bg-white dark:bg-slate-900 rounded-lg shadow-md border border-slate-200 dark:border-slate-800 p-6">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">
          Commission Settings
        </h2>

        <div className="space-y-6">
          {/* Commission Rate */}
          <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
            <div>
              <label className="font-medium text-slate-900 dark:text-white">
                Commission Rate
              </label>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                Percentage of each ticket sale taken as commission
              </p>
            </div>
            <div className="flex items-center gap-3">
              {editingField === 'commissionRate' ? (
                <div className="flex gap-2">
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    max="1"
                    value={tempValue}
                    onChange={(e) => setTempValue(parseFloat(e.target.value))}
                    className="w-24"
                  />
                  <Button
                    size="sm"
                    onClick={() => handleSave('commissionRate')}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    Save
                  </Button>
                  <Button size="sm" variant="outline" onClick={handleCancel}>
                    Cancel
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <span className="text-2xl font-bold text-slate-900 dark:text-white">
                    {(settings.commissionRate * 100).toFixed(1)}%
                  </span>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEditField('commissionRate', settings.commissionRate)}
                  >
                    Edit
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Platform Fee */}
          <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
            <div>
              <label className="font-medium text-slate-900 dark:text-white">
                Platform Fee
              </label>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                Fixed fee added to each order
              </p>
            </div>
            <div className="flex items-center gap-3">
              {editingField === 'platformFee' ? (
                <div className="flex gap-2">
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    value={tempValue}
                    onChange={(e) => setTempValue(parseFloat(e.target.value))}
                    className="w-24"
                  />
                  <Button
                    size="sm"
                    onClick={() => handleSave('platformFee')}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    Save
                  </Button>
                  <Button size="sm" variant="outline" onClick={handleCancel}>
                    Cancel
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <span className="text-2xl font-bold text-slate-900 dark:text-white">
                    ${settings.platformFee.toFixed(2)}
                  </span>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEditField('platformFee', settings.platformFee)}
                  >
                    Edit
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Payment Settings */}
      <div className="bg-white dark:bg-slate-900 rounded-lg shadow-md border border-slate-200 dark:border-slate-800 p-6">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">
          Payment Settings
        </h2>

        <div className="space-y-6">
          {/* Payment Gateway */}
          <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
            <div>
              <label className="font-medium text-slate-900 dark:text-white">
                Payment Gateway
              </label>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                Primary payment processor
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                {settings.paymentGateway}
              </Badge>
              <Button size="sm" variant="outline" disabled>
                Configured
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Email Settings */}
      <div className="bg-white dark:bg-slate-900 rounded-lg shadow-md border border-slate-200 dark:border-slate-800 p-6">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">
          Email Settings
        </h2>

        <div className="space-y-6">
          {/* Email Notifications */}
          <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
            <div>
              <label className="font-medium text-slate-900 dark:text-white">
                Email Notifications
              </label>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                Send email notifications for important events
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Badge
                className={
                  settings.emailNotifications
                    ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                    : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                }
              >
                {settings.emailNotifications ? 'Enabled' : 'Disabled'}
              </Badge>
              <Button
                size="sm"
                variant="outline"
                onClick={() =>
                  setSettings({
                    ...settings,
                    emailNotifications: !settings.emailNotifications,
                  })
                }
              >
                Toggle
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* System Settings */}
      <div className="bg-white dark:bg-slate-900 rounded-lg shadow-md border border-slate-200 dark:border-slate-800 p-6">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">
          System Settings
        </h2>

        <div className="space-y-6">
          {/* Maintenance Mode */}
          <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
            <div>
              <label className="font-medium text-slate-900 dark:text-white">
                Maintenance Mode
              </label>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                Temporarily disable the platform for maintenance
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Badge
                className={
                  settings.maintenanceMode
                    ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                    : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                }
              >
                {settings.maintenanceMode ? 'Active' : 'Inactive'}
              </Badge>
              <Button
                size="sm"
                variant="outline"
                onClick={() =>
                  setSettings({
                    ...settings,
                    maintenanceMode: !settings.maintenanceMode,
                  })
                }
              >
                Toggle
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Info Section */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
        <h3 className="font-semibold text-blue-900 dark:text-blue-400 mb-2">
          Settings Information
        </h3>
        <ul className="text-sm text-blue-800 dark:text-blue-300 space-y-1">
          <li>• Commission rate is applied to all ticket sales</li>
          <li>• Platform fee is added to each order total</li>
          <li>• Payment gateway configuration requires admin access</li>
          <li>• Email notifications can be toggled on/off</li>
          <li>• Maintenance mode will display a message to all users</li>
        </ul>
      </div>
    </div>
  );
}

'use client';

import React, { useState, useEffect } from 'react';
import { apiGet, apiPut } from '@/modules/shared-common/utils/api';
import type {
  VisibilitySettings,
  UpdateVisibilitySettingsRequest,
} from '@/lib/types/organizer-trust-profiles';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface ProfileSettingsComponentProps {
  organizerId: string;
  isVerified?: boolean;
  onSuccess?: () => void;
}

export const ProfileSettingsComponent: React.FC<ProfileSettingsComponentProps> = ({
  organizerId,
  isVerified = false,
  onSuccess,
}) => {
  const [settings, setSettings] = useState<VisibilitySettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setLoading(true);
        const data = await apiGet<VisibilitySettings>('/profile-settings');
        setSettings(data);
      } catch (err) {
        console.error('Error fetching visibility settings:', err);
        // Initialize with default settings if fetch fails
        setSettings({
          id: '',
          organizerId,
          eventHistoryVisible: true,
          performanceMetricsVisible: true,
          reviewsVisible: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, [organizerId]);

  const handleToggle = (field: keyof VisibilitySettings) => {
    if (!settings) return;

    setSettings({
      ...settings,
      [field]: !settings[field],
    });
    setErrorMessage('');
  };

  const handleSave = async () => {
    if (!settings) return;

    try {
      setIsSaving(true);
      setErrorMessage('');
      setSuccessMessage('');

      const updateData: UpdateVisibilitySettingsRequest = {
        eventHistoryVisible: settings.eventHistoryVisible,
        performanceMetricsVisible: settings.performanceMetricsVisible,
        reviewsVisible: settings.reviewsVisible,
      };

      await apiPut('/profile-settings', updateData);

      setSuccessMessage('Settings updated successfully!');
      setTimeout(() => {
        setSuccessMessage('');
        onSuccess?.();
      }, 2000);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to update settings';
      setErrorMessage(errorMsg);
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!settings) {
    return (
      <Card className="p-6 bg-red-50 border-red-200">
        <p className="text-red-600">Failed to load settings</p>
      </Card>
    );
  }

  const SettingToggle = ({
    label,
    description,
    value,
    onChange,
    disabled = false,
  }: {
    label: string;
    description: string;
    value: boolean;
    onChange: () => void;
    disabled?: boolean;
  }) => (
    <div className="flex items-center justify-between p-4 border-b last:border-b-0">
      <div className="flex-1">
        <p className="font-medium text-gray-900">{label}</p>
        <p className="text-sm text-gray-600">{description}</p>
      </div>
      <button
        onClick={onChange}
        disabled={disabled}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
          value ? 'bg-blue-600' : 'bg-gray-300'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            value ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  );

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Profile Visibility Settings</h3>
      <p className="text-gray-600 text-sm mb-6">
        Control what information is displayed on your public organizer profile.
      </p>

      <div className="border rounded-lg divide-y">
        <SettingToggle
          label="Event History"
          description="Show your past events on your profile"
          value={settings.eventHistoryVisible}
          onChange={() => handleToggle('eventHistoryVisible')}
        />

        <SettingToggle
          label="Performance Metrics"
          description="Display your event completion rate and attendance statistics"
          value={settings.performanceMetricsVisible}
          onChange={() => handleToggle('performanceMetricsVisible')}
        />

        <SettingToggle
          label="Reviews"
          description="Show attendee reviews and ratings on your profile"
          value={settings.reviewsVisible}
          onChange={() => handleToggle('reviewsVisible')}
        />

        {isVerified && (
          <div className="flex items-center justify-between p-4">
            <div className="flex-1">
              <p className="font-medium text-gray-900">Verification Badge</p>
              <p className="text-sm text-gray-600">Your verification badge is always visible</p>
            </div>
            <Badge className="bg-blue-500 text-white">Always Visible</Badge>
          </div>
        )}
      </div>

      {/* Error Message */}
      {errorMessage && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded">
          <p className="text-red-600 text-sm">{errorMessage}</p>
        </div>
      )}

      {/* Success Message */}
      {successMessage && (
        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded">
          <p className="text-green-600 text-sm">{successMessage}</p>
        </div>
      )}

      {/* Save Button */}
      <Button
        onClick={handleSave}
        disabled={isSaving}
        className="w-full mt-6"
      >
        {isSaving ? 'Saving...' : 'Save Settings'}
      </Button>
    </Card>
  );
};


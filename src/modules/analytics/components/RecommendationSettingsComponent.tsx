'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, CheckCircle } from 'lucide-react';

interface RecommendationSettings {
  strictLocationFiltering: boolean;
  recentEventsOnly: boolean;
  recommendationsEnabled: boolean;
}

interface RecommendationSettingsComponentProps {
  onSave?: (settings: RecommendationSettings) => void;
  initialSettings?: RecommendationSettings;
}

export const RecommendationSettingsComponent: React.FC<RecommendationSettingsComponentProps> = ({
  onSave,
  initialSettings = {
    strictLocationFiltering: false,
    recentEventsOnly: false,
    recommendationsEnabled: true,
  },
}) => {
  const [settings, setSettings] = useState<RecommendationSettings>(initialSettings);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const handleToggle = (key: keyof RecommendationSettings) => {
    setSettings((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/user-profile/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(settings),
      });

      if (!response.ok) {
        throw new Error('Failed to save settings');
      }

      setMessage({
        type: 'success',
        text: 'Settings saved successfully!',
      });
      onSave?.(settings);

      setTimeout(() => setMessage(null), 3000);
    } catch (err) {
      setMessage({
        type: 'error',
        text: err instanceof Error ? err.message : 'An error occurred',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/user-profile/settings/reset', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to reset settings');
      }

      const defaultSettings: RecommendationSettings = {
        strictLocationFiltering: false,
        recentEventsOnly: false,
        recommendationsEnabled: true,
      };

      setSettings(defaultSettings);
      setMessage({
        type: 'success',
        text: 'Settings reset to defaults!',
      });
      onSave?.(defaultSettings);
      setShowResetConfirm(false);

      setTimeout(() => setMessage(null), 3000);
    } catch (err) {
      setMessage({
        type: 'error',
        text: err instanceof Error ? err.message : 'An error occurred',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-6">
      <h2 className="text-2xl font-bold mb-4">Recommendation Settings</h2>

      {message && (
        <div
          className={`mb-4 p-4 rounded-lg flex items-center gap-3 ${
            message.type === 'success'
              ? 'bg-green-50 text-green-900 border border-green-200'
              : 'bg-red-50 text-red-900 border border-red-200'
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircle className="h-5 w-5" />
          ) : (
            <AlertCircle className="h-5 w-5" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      <div className="space-y-4 mb-6">
        {/* Strict Location Filtering */}
        <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
          <div>
            <h3 className="font-semibold">Strict Location Filtering</h3>
            <p className="text-sm text-gray-600">
              Only show events within your specified location radius
            </p>
          </div>
          <label className="flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.strictLocationFiltering}
              onChange={() => handleToggle('strictLocationFiltering')}
              className="w-5 h-5 rounded"
            />
          </label>
        </div>

        {/* Recent Events Only */}
        <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
          <div>
            <h3 className="font-semibold">Recent Events Only</h3>
            <p className="text-sm text-gray-600">Only show events happening within 30 days</p>
          </div>
          <label className="flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.recentEventsOnly}
              onChange={() => handleToggle('recentEventsOnly')}
              className="w-5 h-5 rounded"
            />
          </label>
        </div>

        {/* Enable/Disable Recommendations */}
        <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
          <div>
            <h3 className="font-semibold">Enable Recommendations</h3>
            <p className="text-sm text-gray-600">
              {settings.recommendationsEnabled
                ? 'You are receiving personalized recommendations'
                : 'Recommendations are disabled'}
            </p>
          </div>
          <label className="flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.recommendationsEnabled}
              onChange={() => handleToggle('recommendationsEnabled')}
              className="w-5 h-5 rounded"
            />
          </label>
        </div>
      </div>

      <div className="flex gap-3">
        <Button onClick={handleSave} disabled={loading} className="flex-1">
          {loading ? 'Saving...' : 'Save Settings'}
        </Button>

        {!showResetConfirm ? (
          <Button
            onClick={() => setShowResetConfirm(true)}
            variant="outline"
            disabled={loading}
            className="flex-1"
          >
            Reset to Defaults
          </Button>
        ) : (
          <div className="flex-1 flex gap-2">
            <Button
              onClick={handleReset}
              disabled={loading}
              variant="destructive"
              className="flex-1"
            >
              Confirm Reset
            </Button>
            <Button
              onClick={() => setShowResetConfirm(false)}
              variant="outline"
              disabled={loading}
              className="flex-1"
            >
              Cancel
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
};

export default RecommendationSettingsComponent;


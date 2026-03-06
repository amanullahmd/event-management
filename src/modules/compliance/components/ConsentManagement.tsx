'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, CheckCircle, XCircle, Clock } from 'lucide-react';
import type { ConsentPreference, ConsentStatusResponse } from '@/lib/types/gdpr';

interface ConsentManagementProps {
  apiBaseUrl?: string;
}

const CONSENT_LABELS: Record<string, { title: string; icon: React.ReactNode }> = {
  MARKETING_EMAILS: { title: 'Marketing Emails', icon: <span aria-hidden="true">📧</span> },
  ANALYTICS: { title: 'Usage Analytics', icon: <span aria-hidden="true">📊</span> },
  PROFILING: { title: 'Personalized Recommendations', icon: <span aria-hidden="true">🎯</span> },
  THIRD_PARTY_SHARING: { title: 'Third-Party Data Sharing', icon: <span aria-hidden="true">🤝</span> },
  LOCATION_TRACKING: { title: 'Location-Based Features', icon: <span aria-hidden="true">📍</span> },
};

export const ConsentManagement: React.FC<ConsentManagementProps> = ({ apiBaseUrl = '' }) => {
  const [preferences, setPreferences] = useState<ConsentPreference[]>([]);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const fetchConsentStatus = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`${apiBaseUrl}/gdpr/consent-status`, {
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!response.ok) throw new Error('Failed to fetch consent status');
      const data: ConsentStatusResponse = await response.json();
      setPreferences(data.preferences);
      setLastUpdated(data.lastUpdated);
    } catch (err) {
      setError('Unable to load consent preferences. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [apiBaseUrl]);

  useEffect(() => {
    fetchConsentStatus();
  }, [fetchConsentStatus]);

  const handleToggle = async (consentType: string, currentGranted: boolean) => {
    setUpdating(consentType);
    setError(null);
    setSuccessMessage(null);

    const endpoint = currentGranted ? 'revoke' : 'grant';
    try {
      const response = await fetch(`${apiBaseUrl}/gdpr/consent/${endpoint}`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ consentType, granted: !currentGranted }),
      });
      if (!response.ok) throw new Error(`Failed to ${endpoint} consent`);

      setPreferences((prev) =>
        prev.map((p) =>
          p.consentType === consentType ? { ...p, granted: !currentGranted } : p
        )
      );
      setSuccessMessage(
        `${CONSENT_LABELS[consentType]?.title || consentType} ${!currentGranted ? 'enabled' : 'disabled'} successfully.`
      );
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setError(`Failed to update consent. Please try again.`);
    } finally {
      setUpdating(null);
    }
  };

  const grantedCount = preferences.filter((p) => p.granted).length;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-blue-600" aria-hidden="true" />
            <div>
              <CardTitle>Privacy & Consent Settings</CardTitle>
              <CardDescription>
                Manage how your data is used. You can change these settings at any time.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <Badge variant="outline">{grantedCount} of {preferences.length} enabled</Badge>
            {lastUpdated && (
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" aria-hidden="true" />
                Last updated: {new Date(lastUpdated).toLocaleDateString()}
              </span>
            )}
          </div>
        </CardContent>
      </Card>

      {error && (
        <Alert variant="destructive">
          <XCircle className="h-4 w-4" aria-hidden="true" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {successMessage && (
        <Alert>
          <CheckCircle className="h-4 w-4 text-green-600" aria-hidden="true" />
          <AlertDescription className="text-green-700">{successMessage}</AlertDescription>
        </Alert>
      )}

      {loading ? (
        <Card>
          <CardContent className="py-8 text-center text-gray-500">
            Loading consent preferences...
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {preferences.map((pref) => {
            const label = CONSENT_LABELS[pref.consentType];
            const isUpdating = updating === pref.consentType;

            return (
              <Card key={pref.consentType} className={isUpdating ? 'opacity-70' : ''}>
                <CardContent className="flex items-center justify-between py-4">
                  <div className="flex items-center gap-3">
                    {label?.icon}
                    <div>
                      <Label htmlFor={`consent-${pref.consentType}`} className="font-medium cursor-pointer">
                        {label?.title || pref.consentType}
                      </Label>
                      <p className="text-sm text-gray-500">{pref.description}</p>
                      {pref.granted && pref.grantedAt && (
                        <p className="text-xs text-gray-400 mt-1">
                          Granted on {new Date(pref.grantedAt).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>
                  <Button
                    variant={pref.granted ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleToggle(pref.consentType, pref.granted)}
                    disabled={isUpdating}
                    aria-label={`Toggle ${label?.title || pref.consentType}`}
                  >
                    {pref.granted ? 'Enabled' : 'Disabled'}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};


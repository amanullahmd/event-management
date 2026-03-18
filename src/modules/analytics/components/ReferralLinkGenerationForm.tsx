'use client';

import React, { useState } from 'react';
import { Button } from '@/modules/shared-common/components/ui/button';
import { Input } from '@/modules/shared-common/components/ui/input';
import { Label } from '@/modules/shared-common/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/modules/shared-common/components/ui/card';
import { AlertCircle, CheckCircle } from 'lucide-react';

interface ReferralLinkGenerationFormProps {
  eventId: string;
  onLinkGenerated: (link: ReferralLinkResponse) => void;
}

interface ReferralLinkResponse {
  referralCode: string;
  fullUrl: string;
  createdAt: string;
  label?: string;
  expirationDate?: string;
}

export const ReferralLinkGenerationForm: React.FC<ReferralLinkGenerationFormProps> = ({
  eventId,
  onLinkGenerated,
}) => {
  const [label, setLabel] = useState('');
  const [expirationDate, setExpirationDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8080';
      const token = localStorage.getItem('auth_token') || localStorage.getItem('token');
      const response = await fetch(`${backendUrl}/api/events/${eventId}/referral-links`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          label: label || undefined,
          expirationDate: expirationDate || undefined,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate referral link');
      }

      const data = await response.json();
      setSuccess('Referral link generated successfully!');
      setLabel('');
      setExpirationDate('');
      onLinkGenerated(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Generate Referral Link</CardTitle>
        <CardDescription>Create a new referral link for your event</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="label">Label (Optional)</Label>
            <Input
              id="label"
              placeholder="e.g., Facebook Campaign"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              disabled={loading}
            />
          </div>

          <div>
            <Label htmlFor="expirationDate">Expiration Date (Optional)</Label>
            <Input
              id="expirationDate"
              type="datetime-local"
              value={expirationDate}
              onChange={(e) => setExpirationDate(e.target.value)}
              disabled={loading}
            />
          </div>

          {error && (
            <div className="flex items-center gap-2 text-red-600 text-sm">
              <AlertCircle className="w-4 h-4" />
              {error}
            </div>
          )}

          {success && (
            <div className="flex items-center gap-2 text-green-600 text-sm">
              <CheckCircle className="w-4 h-4" />
              {success}
            </div>
          )}

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? 'Generating...' : 'Generate Link'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};


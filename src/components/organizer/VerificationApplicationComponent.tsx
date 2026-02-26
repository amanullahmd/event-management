'use client';

import React, { useState, useEffect } from 'react';
import { apiGet, apiPost } from '@/lib/utils/api';
import type {
  VerificationApplication,
  CreateVerificationApplicationRequest,
  PerformanceMetrics,
} from '@/lib/types/organizer-trust-profiles';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface VerificationApplicationComponentProps {
  organizerId: string;
  onSuccess?: () => void;
}

export const VerificationApplicationComponent: React.FC<VerificationApplicationComponentProps> = ({
  organizerId,
  onSuccess,
}) => {
  const [application, setApplication] = useState<VerificationApplication | null>(null);
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  const [identityProofFile, setIdentityProofFile] = useState<File | null>(null);
  const [businessRegFile, setBusinessRegFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch current verification status
        const statusData = await apiGet<VerificationApplication>(
          `/verification/status?organizerId=${organizerId}`
        ).catch(() => null);

        if (statusData) {
          setApplication(statusData);
        }

        // Fetch metrics to check eligibility
        const metricsData = await apiGet<PerformanceMetrics>(
          `/organizers/${organizerId}/metrics`
        );
        setMetrics(metricsData);
      } catch (err) {
        console.error('Error fetching verification data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [organizerId]);

  const isEligible = metrics && metrics.completedEvents >= 3;
  const isPending = application?.status === 'pending';
  const isVerified = application?.status === 'approved';

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    setFile: (file: File | null) => void
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setErrorMessage('File size must not exceed 5MB');
        return;
      }
      setFile(file);
      setErrorMessage('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!identityProofFile || !businessRegFile) {
      setErrorMessage('Both identity proof and business registration documents are required');
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMessage('');
      setSuccessMessage('');

      // In a real implementation, you would upload files to a storage service
      // and get URLs back. For now, we'll use placeholder URLs.
      const applicationData: CreateVerificationApplicationRequest = {
        identityProofUrl: `file://${identityProofFile.name}`,
        businessRegistrationUrl: `file://${businessRegFile.name}`,
      };

      await apiPost('/verification/apply', applicationData);

      setSuccessMessage('Verification application submitted successfully!');
      setIdentityProofFile(null);
      setBusinessRegFile(null);

      setTimeout(() => {
        setSuccessMessage('');
        onSuccess?.();
      }, 2000);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to submit application';
      setErrorMessage(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (isVerified) {
    return (
      <Card className="p-6 bg-green-50 border-green-200">
        <div className="text-center">
          <div className="text-4xl mb-2">✓</div>
          <h3 className="text-lg font-semibold text-green-800 mb-2">Verified Organizer</h3>
          <p className="text-green-700">
            Your organizer account has been verified. Your verification badge is now displayed on
            your profile.
          </p>
        </div>
      </Card>
    );
  }

  if (isPending) {
    return (
      <Card className="p-6 bg-blue-50 border-blue-200">
        <div className="text-center">
          <Badge className="mb-3">Pending Review</Badge>
          <h3 className="text-lg font-semibold text-blue-800 mb-2">Application Under Review</h3>
          <p className="text-blue-700">
            Your verification application is being reviewed by our team. You'll receive an email
            notification once a decision has been made.
          </p>
          {application?.submissionDate && (
            <p className="text-sm text-blue-600 mt-3">
              Submitted on {new Date(application.submissionDate).toLocaleDateString()}
            </p>
          )}
        </div>
      </Card>
    );
  }

  if (!isEligible) {
    return (
      <Card className="p-6 bg-yellow-50 border-yellow-200">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-yellow-800 mb-2">Not Eligible Yet</h3>
          <p className="text-yellow-700 mb-3">
            You need at least 3 completed events to apply for verification.
          </p>
          <p className="text-sm text-yellow-600">
            Current completed events: {metrics?.completedEvents || 0} / 3
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Apply for Verification</h3>
      <p className="text-gray-600 mb-6">
        Boost your credibility by getting verified. Upload your identity proof and business
        registration documents.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Identity Proof */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Identity Proof (Government-Issued ID)
          </label>
          <input
            type="file"
            onChange={(e) => handleFileChange(e, setIdentityProofFile)}
            accept=".pdf,.jpg,.jpeg,.png"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
          />
          {identityProofFile && (
            <p className="text-sm text-green-600 mt-1">✓ {identityProofFile.name}</p>
          )}
          <p className="text-xs text-gray-500 mt-1">Max 5MB. Accepted formats: PDF, JPG, PNG</p>
        </div>

        {/* Business Registration */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Business Registration Document
          </label>
          <input
            type="file"
            onChange={(e) => handleFileChange(e, setBusinessRegFile)}
            accept=".pdf,.jpg,.jpeg,.png"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
          />
          {businessRegFile && (
            <p className="text-sm text-green-600 mt-1">✓ {businessRegFile.name}</p>
          )}
          <p className="text-xs text-gray-500 mt-1">Max 5MB. Accepted formats: PDF, JPG, PNG</p>
        </div>

        {/* Error Message */}
        {errorMessage && (
          <div className="p-3 bg-red-50 border border-red-200 rounded">
            <p className="text-red-600 text-sm">{errorMessage}</p>
          </div>
        )}

        {/* Success Message */}
        {successMessage && (
          <div className="p-3 bg-green-50 border border-green-200 rounded">
            <p className="text-green-600 text-sm">{successMessage}</p>
          </div>
        )}

        {/* Submit Button */}
        <Button
          type="submit"
          disabled={!identityProofFile || !businessRegFile || isSubmitting}
          className="w-full"
        >
          {isSubmitting ? 'Submitting...' : 'Submit Application'}
        </Button>
      </form>
    </Card>
  );
};

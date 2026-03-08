'use client';

import React, { useState, useEffect } from 'react';
import { apiGet, apiPost } from '@/modules/shared-common/utils/api';
import type {
  Review,
  VerificationApplication,
} from '@/lib/types/organizer-trust-profiles';
import type { PaginatedResponse } from '@/modules/shared-common/types/api';
import { Card } from '@/modules/shared-common/components/ui/card';
import { Button } from '@/modules/shared-common/components/ui/button';
import { Badge } from '@/modules/shared-common/components/ui/badge';

export const ModerationDashboardComponent: React.FC = () => {
  const [pendingReviews, setPendingReviews] = useState<Review[]>([]);
  const [pendingApplications, setPendingApplications] = useState<VerificationApplication[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(true);
  const [loadingApplications, setLoadingApplications] = useState(true);
  const [actionInProgress, setActionInProgress] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [activeTab, setActiveTab] = useState<'reviews' | 'applications'>('reviews');

  useEffect(() => {
    fetchPendingReviews();
    fetchPendingApplications();
  }, []);

  const fetchPendingReviews = async () => {
    try {
      setLoadingReviews(true);
      const response = await apiGet<PaginatedResponse<Review>>('/moderation/reviews?page=0&size=50');
      setPendingReviews(response.items);
    } catch (err) {
      console.error('Error fetching pending reviews:', err);
    } finally {
      setLoadingReviews(false);
    }
  };

  const fetchPendingApplications = async () => {
    try {
      setLoadingApplications(true);
      const response = await apiGet<PaginatedResponse<VerificationApplication>>(
        '/verification/applications?page=0&size=50'
      );
      setPendingApplications(response.items);
    } catch (err) {
      console.error('Error fetching pending applications:', err);
    } finally {
      setLoadingApplications(false);
    }
  };

  const handleApproveReview = async (reviewId: string) => {
    try {
      setActionInProgress(reviewId);
      setErrorMessage('');
      setSuccessMessage('');

      await apiPost(`/moderation/reviews/${reviewId}/approve`, {});

      setSuccessMessage('Review approved successfully');
      setPendingReviews(pendingReviews.filter((r) => r.id !== reviewId));

      setTimeout(() => setSuccessMessage(''), 2000);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to approve review';
      setErrorMessage(errorMsg);
    } finally {
      setActionInProgress(null);
    }
  };

  const handleRejectReview = async (reviewId: string) => {
    try {
      setActionInProgress(reviewId);
      setErrorMessage('');
      setSuccessMessage('');

      await apiPost(`/moderation/reviews/${reviewId}/reject`, {});

      setSuccessMessage('Review rejected successfully');
      setPendingReviews(pendingReviews.filter((r) => r.id !== reviewId));

      setTimeout(() => setSuccessMessage(''), 2000);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to reject review';
      setErrorMessage(errorMsg);
    } finally {
      setActionInProgress(null);
    }
  };

  const handleApproveApplication = async (applicationId: string) => {
    try {
      setActionInProgress(applicationId);
      setErrorMessage('');
      setSuccessMessage('');

      await apiPost(`/verification/approve/${applicationId}`, {});

      setSuccessMessage('Application approved successfully');
      setPendingApplications(pendingApplications.filter((a) => a.id !== applicationId));

      setTimeout(() => setSuccessMessage(''), 2000);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to approve application';
      setErrorMessage(errorMsg);
    } finally {
      setActionInProgress(null);
    }
  };

  const handleRejectApplication = async (applicationId: string) => {
    try {
      setActionInProgress(applicationId);
      setErrorMessage('');
      setSuccessMessage('');

      const reason = prompt('Enter rejection reason:');
      if (!reason) return;

      await apiPost(`/verification/reject/${applicationId}`, { reason });

      setSuccessMessage('Application rejected successfully');
      setPendingApplications(pendingApplications.filter((a) => a.id !== applicationId));

      setTimeout(() => setSuccessMessage(''), 2000);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to reject application';
      setErrorMessage(errorMsg);
    } finally {
      setActionInProgress(null);
    }
  };

  const renderStars = (rating: number) => (
    <div className="flex gap-1">
      {Array.from({ length: 5 }, (_, i) => (
        <span key={i} className={i < rating ? 'text-yellow-500' : 'text-gray-300'}>
          ★
        </span>
      ))}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Messages */}
      {successMessage && (
        <div className="p-4 bg-green-50 border border-green-200 rounded">
          <p className="text-green-600">{successMessage}</p>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 bg-red-50 border border-red-200 rounded">
          <p className="text-red-600">{errorMessage}</p>
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <div className="flex gap-4">
          <button
            onClick={() => setActiveTab('reviews')}
            className={`px-4 py-2 font-medium border-b-2 transition ${
              activeTab === 'reviews'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            Pending Reviews ({pendingReviews.length})
          </button>
          <button
            onClick={() => setActiveTab('applications')}
            className={`px-4 py-2 font-medium border-b-2 transition ${
              activeTab === 'applications'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            Pending Applications ({pendingApplications.length})
          </button>
        </div>
      </div>

      {/* Reviews Tab */}
      {activeTab === 'reviews' && (
        <div className="space-y-4">
          {loadingReviews ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : pendingReviews.length === 0 ? (
            <Card className="p-6 text-center">
              <p className="text-gray-500">No pending reviews</p>
            </Card>
          ) : (
            pendingReviews.map((review) => (
              <Card key={review.id} className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className="font-semibold">{review.attendeeName}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(review.submissionDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    {renderStars(review.rating)}
                  </div>
                </div>

                {review.content && (
                  <p className="text-gray-700 mb-3">{review.content}</p>
                )}

                {review.moderationReason && (
                  <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
                    <p className="text-yellow-800 text-sm">
                      <span className="font-medium">Flagged reason:</span> {review.moderationReason}
                    </p>
                  </div>
                )}

                <div className="flex gap-2">
                  <Button
                    onClick={() => handleApproveReview(review.id)}
                    disabled={actionInProgress === review.id}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    Approve
                  </Button>
                  <Button
                    onClick={() => handleRejectReview(review.id)}
                    disabled={actionInProgress === review.id}
                    variant="destructive"
                  >
                    Reject
                  </Button>
                </div>
              </Card>
            ))
          )}
        </div>
      )}

      {/* Applications Tab */}
      {activeTab === 'applications' && (
        <div className="space-y-4">
          {loadingApplications ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : pendingApplications.length === 0 ? (
            <Card className="p-6 text-center">
              <p className="text-gray-500">No pending applications</p>
            </Card>
          ) : (
            pendingApplications.map((application) => (
              <Card key={application.id} className="p-6">
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold">Verification Application</h3>
                    <Badge variant="outline">Pending</Badge>
                  </div>
                  <p className="text-sm text-gray-600">
                    Submitted: {new Date(application.submissionDate).toLocaleDateString()}
                  </p>
                </div>

                <div className="space-y-2 mb-4 p-3 bg-gray-50 rounded">
                  <p className="text-sm">
                    <span className="font-medium">Identity Proof:</span>{' '}
                    <a
                      href={application.identityProofUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      View Document
                    </a>
                  </p>
                  <p className="text-sm">
                    <span className="font-medium">Business Registration:</span>{' '}
                    <a
                      href={application.businessRegistrationUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      View Document
                    </a>
                  </p>
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={() => handleApproveApplication(application.id)}
                    disabled={actionInProgress === application.id}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    Approve
                  </Button>
                  <Button
                    onClick={() => handleRejectApplication(application.id)}
                    disabled={actionInProgress === application.id}
                    variant="destructive"
                  >
                    Reject
                  </Button>
                </div>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  );
};


'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { apiGet } from '@/lib/utils/api';
import type {
  OrganizerTrustProfile,
  EventHistoryItem,
  PerformanceMetrics,
  Review,
  VisibilitySettings,
} from '@/lib/types/organizer-trust-profiles';
import type { PaginatedResponse } from '@/lib/types/api';
import { EventHistoryComponent } from './EventHistoryComponent';
import { PerformanceMetricsComponent } from './PerformanceMetricsComponent';
import { ReviewsDisplayComponent } from './ReviewsDisplayComponent';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';

interface OrganizerProfilePageProps {
  organizerId?: string;
}

export const OrganizerProfilePage: React.FC<OrganizerProfilePageProps> = ({
  organizerId: propOrganizerId,
}) => {
  const params = useParams();
  const organizerId = propOrganizerId || (params?.organizerId as string);

  const [profile, setProfile] = useState<OrganizerTrustProfile | null>(null);
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  const [visibilitySettings, setVisibilitySettings] = useState<VisibilitySettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch organizer profile
        const profileData = await apiGet<OrganizerTrustProfile>(
          `/organizers/${organizerId}/profile`
        );
        setProfile(profileData);

        // Fetch performance metrics
        const metricsData = await apiGet<PerformanceMetrics>(
          `/organizers/${organizerId}/metrics`
        );
        setMetrics(metricsData);

        // Fetch visibility settings
        const settingsData = await apiGet<VisibilitySettings>(
          `/organizers/${organizerId}/visibility-settings`
        );
        setVisibilitySettings(settingsData);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load organizer profile';
        setError(errorMessage);
        console.error('Error fetching organizer profile:', err);
      } finally {
        setLoading(false);
      }
    };

    if (organizerId) {
      fetchProfileData();
    }
  }, [organizerId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading organizer profile...</p>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="p-8 max-w-md">
          <h2 className="text-xl font-semibold text-red-600 mb-2">Error</h2>
          <p className="text-gray-600">{error || 'Organizer profile not found'}</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Profile Header */}
        <Card className="mb-8 p-8">
          <div className="flex items-start gap-6">
            {profile.profilePictureUrl && (
              <img
                src={profile.profilePictureUrl}
                alt={profile.name}
                className="w-24 h-24 rounded-full object-cover"
              />
            )}
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold">{profile.name}</h1>
                {profile.verificationBadgeDisplayed && (
                  <Badge className="bg-blue-500 text-white">Verified</Badge>
                )}
              </div>
              {profile.bio && <p className="text-gray-600 mb-4">{profile.bio}</p>}
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <span>Member since {new Date(profile.memberSinceDate).toLocaleDateString()}</span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <span className="text-yellow-500">★</span>
                  {profile.trustScore.toFixed(1)} ({profile.totalReviews} reviews)
                </span>
              </div>
            </div>
          </div>
        </Card>

        {/* Performance Metrics */}
        {visibilitySettings?.performanceMetricsVisible && metrics && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4">Performance Metrics</h2>
            <PerformanceMetricsComponent metrics={metrics} />
          </div>
        )}

        {/* Event History */}
        {visibilitySettings?.eventHistoryVisible && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4">Event History</h2>
            <EventHistoryComponent organizerId={organizerId} />
          </div>
        )}

        {/* Reviews */}
        {visibilitySettings?.reviewsVisible && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4">Reviews</h2>
            <ReviewsDisplayComponent organizerId={organizerId} trustScore={profile.trustScore} />
          </div>
        )}

        {/* Trust Score (always visible) */}
        {!visibilitySettings?.reviewsVisible && (
          <Card className="p-6 bg-blue-50 border-blue-200">
            <div className="text-center">
              <p className="text-gray-600 mb-2">Trust Score</p>
              <div className="text-4xl font-bold text-blue-600">
                {profile.trustScore.toFixed(1)}
              </div>
              <p className="text-sm text-gray-500 mt-2">Based on {profile.totalReviews} reviews</p>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

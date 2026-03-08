'use client';

import React, { useState, useEffect } from 'react';
import { apiGet } from '@/modules/shared-common/utils/api';
import type { Review } from '@/lib/types/organizer-trust-profiles';
import type { PaginatedResponse } from '@/modules/shared-common/types/api';
import { Card } from '@/modules/shared-common/components/ui/card';
import { Button } from '@/modules/shared-common/components/ui/button';
import { Badge } from '@/modules/shared-common/components/ui/badge';

interface ReviewsDisplayComponentProps {
  organizerId: string;
  trustScore: number;
}

const REVIEWS_PER_PAGE = 5;

export const ReviewsDisplayComponent: React.FC<ReviewsDisplayComponentProps> = ({
  organizerId,
  trustScore,
}) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await apiGet<PaginatedResponse<Review>>(
          `/organizers/${organizerId}/reviews?page=${currentPage}&size=${REVIEWS_PER_PAGE}`
        );

        setReviews(response.items);
        setTotalPages(response.totalPages);
        setTotalReviews(response.total);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load reviews';
        setError(errorMessage);
        console.error('Error fetching reviews:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, [organizerId, currentPage]);

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-1">
        {Array.from({ length: 5 }, (_, i) => (
          <span key={i} className={i < rating ? 'text-yellow-500' : 'text-gray-300'}>
            ★
          </span>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="p-6 bg-red-50 border-red-200">
        <p className="text-red-600">{error}</p>
      </Card>
    );
  }

  return (
    <div>
      {/* Trust Score Summary */}
      <Card className="p-6 mb-6 bg-blue-50 border-blue-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-600 text-sm font-medium mb-1">Average Rating</p>
            <div className="flex items-center gap-3">
              <div className="text-4xl font-bold text-blue-600">{trustScore.toFixed(1)}</div>
              <div className="flex flex-col">
                {renderStars(Math.round(trustScore))}
                <p className="text-sm text-gray-600 mt-1">{totalReviews} reviews</p>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Reviews List */}
      {reviews.length === 0 ? (
        <Card className="p-6 text-center">
          <p className="text-gray-500">No reviews yet</p>
        </Card>
      ) : (
        <div className="space-y-4 mb-6">
          {reviews.map((review) => (
            <Card key={review.id} className="p-6">
              {review.status === 'pending_moderation' && (
                <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
                  <p className="text-yellow-800 text-sm">This review is pending moderation</p>
                </div>
              )}

              <div className="flex items-start justify-between mb-3">
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
                <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded">
                  <p className="text-red-800 text-sm">
                    <span className="font-medium">Moderation reason:</span> {review.moderationReason}
                  </p>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            disabled={currentPage === 0}
            onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
          >
            Previous
          </Button>
          <div className="flex items-center gap-2">
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
              const pageNum = i;
              return (
                <Button
                  key={pageNum}
                  variant={currentPage === pageNum ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setCurrentPage(pageNum)}
                >
                  {pageNum + 1}
                </Button>
              );
            })}
            {totalPages > 5 && <span className="text-gray-500">...</span>}
          </div>
          <Button
            variant="outline"
            disabled={currentPage === totalPages - 1}
            onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
};


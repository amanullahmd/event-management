'use client';

import React, { useState } from 'react';
import { apiPost } from '@/lib/utils/api';
import type { CreateReviewRequest } from '@/lib/types/organizer-trust-profiles';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

interface ReviewSubmissionComponentProps {
  organizerId: string;
  eventId: string;
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

const MAX_CONTENT_LENGTH = 500;

export const ReviewSubmissionComponent: React.FC<ReviewSubmissionComponentProps> = ({
  organizerId,
  eventId,
  onSuccess,
  onError,
}) => {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const contentLength = content.length;
  const isValid = rating > 0 && contentLength <= MAX_CONTENT_LENGTH;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isValid) {
      setErrorMessage('Please provide a rating and valid review content');
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMessage('');
      setSuccessMessage('');

      const reviewData: CreateReviewRequest = {
        organizerId,
        eventId,
        rating,
        content: content.trim() || undefined,
      };

      await apiPost('/reviews', reviewData);

      setSuccessMessage('Review submitted successfully!');
      setRating(0);
      setContent('');

      setTimeout(() => {
        setSuccessMessage('');
        onSuccess?.();
      }, 2000);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to submit review';
      setErrorMessage(errorMsg);
      onError?.(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Share Your Experience</h3>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Rating Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
          <div className="flex gap-2">
            {Array.from({ length: 5 }, (_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setRating(i + 1)}
                onMouseEnter={() => setHoverRating(i + 1)}
                onMouseLeave={() => setHoverRating(0)}
                className="text-3xl transition-colors"
              >
                <span className={hoverRating > i || rating > i ? 'text-yellow-500' : 'text-gray-300'}>
                  ★
                </span>
              </button>
            ))}
          </div>
          {rating > 0 && (
            <p className="text-sm text-gray-600 mt-2">
              {rating === 1 && 'Poor'}
              {rating === 2 && 'Fair'}
              {rating === 3 && 'Good'}
              {rating === 4 && 'Very Good'}
              {rating === 5 && 'Excellent'}
            </p>
          )}
        </div>

        {/* Review Content */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Your Review (Optional)
          </label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value.slice(0, MAX_CONTENT_LENGTH))}
            placeholder="Share your experience with this organizer..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            rows={4}
          />
          <div className="flex items-center justify-between mt-2">
            <p className="text-xs text-gray-500">
              {contentLength} / {MAX_CONTENT_LENGTH} characters
            </p>
            {contentLength > MAX_CONTENT_LENGTH * 0.9 && (
              <Badge variant="outline" className="text-orange-600">
                Approaching limit
              </Badge>
            )}
          </div>
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
          disabled={!isValid || isSubmitting}
          className="w-full"
        >
          {isSubmitting ? 'Submitting...' : 'Submit Review'}
        </Button>
      </form>
    </Card>
  );
};

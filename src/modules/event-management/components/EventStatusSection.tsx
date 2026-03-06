'use client';

import React, { useState } from 'react';
import { StatusBadge } from '../../../components/organizer/StatusBadge';
import { PublishUnpublishButton } from './PublishUnpublishButton';
import { isConflictError } from '@/modules/shared-common/utils/error-formatter';
import type { Event } from '@/lib/types';

interface EventStatusSectionProps {
  event: Event;
  onStatusChange: (updatedEvent: Event) => void;
  onError: (error: string) => void;
}

const formatDate = (date: Date | string | undefined): string => {
  if (!date) return '';
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const EventStatusSection: React.FC<EventStatusSectionProps> = ({
  event,
  onStatusChange,
  onError,
}) => {
  const [error, setError] = useState<string | null>(null);
  const [isConflict, setIsConflict] = useState(false);

  const handleSuccess = (updatedEvent: Event) => {
    setError(null);
    setIsConflict(false);
    onStatusChange(updatedEvent);
  };

  const handleError = (errorMessage: string) => {
    setError(errorMessage);
    setIsConflict(errorMessage.includes('modified by another user'));
    onError(errorMessage);
  };

  const handleRefresh = () => {
    window.location.reload();
  };

  const getPublishStatus = (): 'draft' | 'published' | 'unpublished' => {
    if (event.status === 'published') return 'published';
    if (event.status === 'unpublished') return 'unpublished';
    return 'draft';
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-lg shadow-md p-6 mb-6 border border-slate-200 dark:border-slate-800">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
            Event Status
          </h3>
          <StatusBadge
            status={getPublishStatus()}
            publishedAt={event.publishedAt}
            unpublishedAt={event.unpublishedAt}
          />
          {event.publishedAt && (
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
              Published on {formatDate(event.publishedAt)}
            </p>
          )}
          {event.unpublishedAt && (
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
              Unpublished on {formatDate(event.unpublishedAt)}
            </p>
          )}
        </div>
        <PublishUnpublishButton
          eventId={event.id}
          status={getPublishStatus()}
          onSuccess={handleSuccess}
          onError={handleError}
        />
      </div>
      {error && (
        <div className="mt-4 p-3 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400 rounded flex items-center justify-between">
          <span>{error}</span>
          {isConflict && (
            <button
              onClick={handleRefresh}
              className="ml-4 px-3 py-1 bg-red-200 dark:bg-red-800 text-red-900 dark:text-red-100 rounded text-sm font-medium hover:bg-red-300 dark:hover:bg-red-700"
            >
              Refresh
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default EventStatusSection;


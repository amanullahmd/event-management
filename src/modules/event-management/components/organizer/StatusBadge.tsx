'use client';

import React from 'react';

interface StatusBadgeProps {
  status: 'draft' | 'published' | 'unpublished';
  publishedAt?: Date | string;
  unpublishedAt?: Date | string;
  lastChangedBy?: string;
}

const formatDate = (date: Date | string | undefined): string => {
  if (!date) return '';
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  publishedAt,
  unpublishedAt,
  lastChangedBy,
}) => {
  const getStatusColor = () => {
    switch (status) {
      case 'published':
        return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400';
      case 'unpublished':
        return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400';
      case 'draft':
        return 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-400';
      default:
        return 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-400';
    }
  };

  const getStatusLabel = () => {
    switch (status) {
      case 'published':
        return 'Published';
      case 'unpublished':
        return 'Unpublished';
      case 'draft':
        return 'Draft';
      default:
        return status;
    }
  };

  const getTimestamp = () => {
    if (status === 'published' && publishedAt) {
      return formatDate(publishedAt);
    }
    if (status === 'unpublished' && unpublishedAt) {
      return formatDate(unpublishedAt);
    }
    return null;
  };

  const timestamp = getTimestamp();

  return (
    <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor()}`}>
      <span>{getStatusLabel()}</span>
      {timestamp && (
        <span className="ml-2 text-xs opacity-75">
          {status === 'published' ? 'Published' : 'Unpublished'} {timestamp}
        </span>
      )}
    </div>
  );
};

export default StatusBadge;


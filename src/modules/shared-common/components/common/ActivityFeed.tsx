'use client';

import React from 'react';
import Link from 'next/link';
import { Card } from '@/modules/shared-common/components/ui/card';
import { cn } from '@/modules/shared-common/utils/cn';

export interface ActivityItem {
  id: string;
  icon: React.ReactNode;
  description: string;
  timestamp: Date;
  link?: {
    label: string;
    href: string;
  };
}

export interface ActivityFeedProps {
  /** Array of activity items */
  activities: ActivityItem[];
  /** Link to view all activities */
  viewAllHref?: string;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Format relative time (e.g., "2 hours ago")
 */
function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString();
}

/**
 * ActivityFeed component
 * Displays recent activity list with timestamps
 */
export function ActivityFeed({
  activities,
  viewAllHref,
  className,
}: ActivityFeedProps) {
  if (activities.length === 0) {
    return (
      <Card className={cn('p-6', className)}>
        <p className="text-center text-gray-500 dark:text-gray-400">
          No recent activity
        </p>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <div className="divide-y divide-gray-200 dark:divide-slate-800">
        {activities.map((activity) => (
          <div key={activity.id} className="p-4 hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors">
            <div className="flex items-start gap-3">
              {/* Icon */}
              <div className="flex-shrink-0 mt-1 text-gray-400 dark:text-gray-600">
                {activity.icon}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-900 dark:text-white">
                  {activity.description}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {formatRelativeTime(activity.timestamp)}
                </p>
              </div>

              {/* Link */}
              {activity.link && (
                <Link
                  href={activity.link.href}
                  className="flex-shrink-0 text-xs font-medium text-violet-600 dark:text-violet-400 hover:text-violet-700 dark:hover:text-violet-300"
                >
                  {activity.link.label}
                </Link>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* View all link */}
      {viewAllHref && (
        <div className="border-t border-gray-200 dark:border-slate-800 p-4">
          <Link
            href={viewAllHref}
            className="text-sm font-medium text-violet-600 dark:text-violet-400 hover:text-violet-700 dark:hover:text-violet-300"
          >
            View all activity →
          </Link>
        </div>
      )}
    </Card>
  );
}

export default ActivityFeed;

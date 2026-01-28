'use client';

import React, { useMemo } from 'react';
import { getRecentActivities } from '@/lib/dummy-data';

interface Activity {
  id: string;
  type: 'user_registration' | 'event_creation' | 'order_creation';
  description: string;
  timestamp: Date;
  user: string;
}

interface ActivityFeedProps {
  limit?: number;
}

/**
 * Activity feed component
 * Displays recent activities sorted by timestamp (most recent first)
 */
export function ActivityFeed({ limit = 10 }: ActivityFeedProps) {
  const activities = useMemo(() => {
    const rawActivities = getRecentActivities(limit);
    // Ensure activities are sorted by timestamp descending (most recent first)
    return rawActivities.sort((a, b) => {
      const timeA = new Date(a.timestamp).getTime();
      const timeB = new Date(b.timestamp).getTime();
      return timeB - timeA;
    });
  }, [limit]);

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'user_registration':
        return (
          <svg
            className="w-5 h-5 text-blue-600 dark:text-blue-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
            />
          </svg>
        );
      case 'event_creation':
        return (
          <svg
            className="w-5 h-5 text-green-600 dark:text-green-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
        );
      case 'order_creation':
        return (
          <svg
            className="w-5 h-5 text-purple-600 dark:text-purple-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
            />
          </svg>
        );
      default:
        return (
          <svg
            className="w-5 h-5 text-slate-600 dark:text-slate-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 10V3L4 14h7v7l9-11h-7z"
            />
          </svg>
        );
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'user_registration':
        return 'bg-blue-100 dark:bg-blue-900/30';
      case 'event_creation':
        return 'bg-green-100 dark:bg-green-900/30';
      case 'order_creation':
        return 'bg-purple-100 dark:bg-purple-900/30';
      default:
        return 'bg-slate-100 dark:bg-slate-800';
    }
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - new Date(date).getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    return new Date(date).toLocaleDateString();
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-lg shadow-md border border-slate-200 dark:border-slate-800 overflow-hidden">
      <div className="p-6 border-b border-slate-200 dark:border-slate-800">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">
          Recent Activities
        </h2>
        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
          Latest platform activities sorted by recency
        </p>
      </div>

      <div className="divide-y divide-slate-200 dark:divide-slate-800">
        {activities.length === 0 ? (
          <div className="p-6 text-center text-slate-500 dark:text-slate-400">
            No activities yet
          </div>
        ) : (
          activities.map((activity) => (
            <div
              key={activity.id}
              className="p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
            >
              <div className="flex items-start gap-4">
                {/* Activity icon */}
                <div
                  className={`p-2 rounded-lg flex-shrink-0 ${getActivityColor(activity.type)}`}
                >
                  {getActivityIcon(activity.type)}
                </div>

                {/* Activity content */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 dark:text-white">
                    {activity.description}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    {formatTime(activity.timestamp)}
                  </p>
                </div>

                {/* Activity type badge */}
                <div className="flex-shrink-0">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 capitalize">
                    {activity.type.replace('_', ' ')}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {activities.length > 0 && (
        <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-800 text-center">
          <button className="text-sm font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors">
            View all activities
          </button>
        </div>
      )}
    </div>
  );
}

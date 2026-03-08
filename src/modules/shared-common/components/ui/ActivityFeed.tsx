import React from 'react';
import { cn } from '@/modules/shared-common/utils/cn';
import { 
  UserCheck, 
  UserX, 
  Calendar, 
  DollarSign, 
  AlertCircle, 
  CheckCircle, 
  Clock,
  Users,
  MapPin,
  CreditCard,
  Star,
  Heart,
  MessageSquare,
  Share2,
  TrendingUp
} from 'lucide-react';

interface ActivityItem {
  id: string;
  type: 'user_registration' | 'user_verification' | 'event_created' | 'event_updated' | 'order_completed' | 'order_cancelled' | 'review_posted' | 'ticket_checked_in' | 'payment_received' | 'system_alert';
  message: string;
  description?: string;
  timestamp: Date;
  user?: {
    name: string;
    avatar?: string;
    id: string;
  };
  metadata?: {
    eventId?: string;
    eventName?: string;
    orderId?: string;
    amount?: number;
    location?: string;
  };
}

interface ActivityFeedProps {
  activities: ActivityItem[];
  limit?: number;
  showTimestamp?: boolean;
  showUser?: boolean;
  compact?: boolean;
  className?: string;
}

const getActivityIcon = (type: ActivityItem['type']) => {
  switch (type) {
    case 'user_registration':
      return UserCheck;
    case 'user_verification':
      return UserX;
    case 'event_created':
      return Calendar;
    case 'event_updated':
      return Calendar;
    case 'order_completed':
      return CheckCircle;
    case 'order_cancelled':
      return AlertCircle;
    case 'review_posted':
      return Star;
    case 'ticket_checked_in':
      return MapPin;
    case 'payment_received':
      return DollarSign;
    case 'system_alert':
      return AlertCircle;
    default:
      return MessageSquare;
  }
};

const getActivityColor = (type: ActivityItem['type']) => {
  switch (type) {
    case 'user_registration':
      return 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400';
    case 'user_verification':
      return 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400';
    case 'event_created':
      return 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400';
    case 'event_updated':
      return 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400';
    case 'order_completed':
      return 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400';
    case 'order_cancelled':
      return 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400';
    case 'review_posted':
      return 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400';
    case 'ticket_checked_in':
      return 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400';
    case 'payment_received':
      return 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400';
    case 'system_alert':
      return 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400';
    default:
      return 'bg-gray-100 text-gray-600 dark:bg-gray-900/30 dark:text-gray-400';
  }
};

const formatTimestamp = (date: Date) => {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString();
};

/**
 * Modern Activity Feed Component
 * Displays real-time activity with beautiful icons and formatting
 */
export function ActivityFeed({
  activities,
  limit = 10,
  showTimestamp = true,
  showUser = true,
  compact = false,
  className
}: ActivityFeedProps) {
  const displayActivities = activities.slice(0, limit);

  if (displayActivities.length === 0) {
    return (
      <div className={cn('text-center py-8', className)}>
        <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-3">
          <Clock className="w-6 h-6 text-gray-400" />
        </div>
        <p className="text-gray-500 dark:text-gray-400">No recent activity</p>
      </div>
    );
  }

  return (
    <div className={cn('space-y-4', className)}>
      {displayActivities.map((activity) => {
        const Icon = getActivityIcon(activity.type);
        const iconColor = getActivityColor(activity.type);

        return (
          <div
            key={activity.id}
            className={cn(
              'flex items-start gap-3 p-3 rounded-lg transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/50',
              compact && 'p-2'
            )}
          >
            {/* Activity Icon */}
            <div className={cn('p-2 rounded-lg flex-shrink-0', iconColor)}>
              <Icon className={cn('w-4 h-4', compact && 'w-3 h-3')} />
            </div>

            {/* Activity Content */}
            <div className='flex-1 min-w-0'>
              <div className='flex items-start justify-between gap-2'>
                <div className='flex-1 min-w-0'>
                  {/* User Avatar */}
                  {showUser && activity.user && (
                    <div className='flex items-center gap-2 mb-1'>
                      <div className='w-6 h-6 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white text-xs font-medium flex-shrink-0'>
                        {activity.user.name.charAt(0).toUpperCase()}
                      </div>
                      <span className='text-sm font-medium text-gray-900 dark:text-white truncate'>
                        {activity.user.name}
                      </span>
                    </div>
                  )}

                  {/* Message */}
                  <p className={cn(
                    'text-sm text-gray-900 dark:text-white',
                    compact && 'text-xs'
                  )}>
                    {activity.message}
                  </p>

                  {/* Description */}
                  {activity.description && !compact && (
                    <p className='text-xs text-gray-500 dark:text-gray-400 mt-1'>
                      {activity.description}
                    </p>
                  )}

                  {/* Metadata */}
                  {activity.metadata && !compact && (
                    <div className='flex flex-wrap gap-2 mt-2'>
                      {activity.metadata.eventName && (
                        <span className='inline-flex items-center px-2 py-1 bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 text-xs rounded-full'>
                          <Calendar className='w-3 h-3 mr-1' />
                          {activity.metadata.eventName}
                        </span>
                      )}
                      {activity.metadata.amount && (
                        <span className='inline-flex items-center px-2 py-1 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 text-xs rounded-full'>
                          <DollarSign className='w-3 h-3 mr-1' />
                          ${activity.metadata.amount.toFixed(2)}
                        </span>
                      )}
                      {activity.metadata.location && (
                        <span className='inline-flex items-center px-2 py-1 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 text-xs rounded-full'>
                          <MapPin className='w-3 h-3 mr-1' />
                          {activity.metadata.location}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Timestamp */}
                {showTimestamp && (
                  <div className='flex-shrink-0'>
                    <span className={cn(
                      'text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap',
                      compact && 'text-xs'
                    )}>
                      {formatTimestamp(activity.timestamp)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}

      {activities.length > limit && (
        <div className='text-center pt-2 border-t border-gray-200 dark:border-gray-700'>
          <button className='text-sm text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 font-medium'>
            View all activity ({activities.length})
          </button>
        </div>
      )}
    </div>
  );
}

export default ActivityFeed;

/**
 * FeaturedCalendarCard Component
 * 
 * A card component for displaying featured event calendars or communities.
 * Shows calendar image, name, description, follower count, and a follow button.
 * 
 * @example
 * ```tsx
 * <FeaturedCalendarCard 
 *   calendar={calendar}
 *   onFollow={handleFollow}
 * />
 * ```
 * 
 * Requirements: 6.3, 6.5
 */
'use client';

import React, { useState, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Users, Heart } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

export interface FeaturedCalendar {
  id: string;
  name: string;
  description: string;
  image: string;
  followerCount: number;
  eventCount: number;
}

export interface FeaturedCalendarCardProps {
  /** Calendar data to display */
  calendar: FeaturedCalendar;
  /** Callback when follow button is clicked */
  onFollow?: (calendarId: string) => void;
  /** Whether the calendar is already followed */
  isFollowed?: boolean;
  /** Additional CSS classes */
  className?: string;
}

/**
 * FeaturedCalendarCard component for displaying featured calendars
 * 
 * @param props - FeaturedCalendarCard configuration props
 * @returns JSX element containing the calendar card
 * 
 * Validates: Requirements 6.3 (Display calendar image, name, description, follower count)
 * Validates: Requirements 6.5 (Include Follow button)
 */
export function FeaturedCalendarCard({
  calendar,
  onFollow,
  isFollowed = false,
  className,
}: FeaturedCalendarCardProps) {
  const [followed, setFollowed] = useState(isFollowed);

  const handleFollowClick = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setFollowed(!followed);
      onFollow?.(calendar.id);
    },
    [followed, onFollow, calendar.id]
  );

  return (
    <Link
      href={`/events?calendar=${calendar.id}`}
      className={cn(
        'group relative block rounded-xl overflow-hidden',
        'bg-white dark:bg-slate-800',
        'border border-slate-200 dark:border-slate-700',
        'hover:shadow-xl hover:-translate-y-1',
        'transition-all duration-300 ease-out',
        className
      )}
    >
      {/* Calendar image */}
      <div className="relative aspect-[16/10] overflow-hidden">
        <Image
          src={calendar.image}
          alt={calendar.name}
          fill
          className="object-cover group-hover:scale-110 transition-transform duration-500"
        />

        {/* Follow button overlay */}
        <button
          onClick={handleFollowClick}
          className={cn(
            'absolute top-2 right-2 z-10',
            'w-9 h-9 rounded-full',
            'flex items-center justify-center',
            'bg-white/90 dark:bg-slate-800/90',
            'hover:bg-white dark:hover:bg-slate-800',
            'shadow-md',
            'transition-all duration-200',
            'focus:outline-none focus:ring-2 focus:ring-violet-500'
          )}
          aria-label={followed ? 'Unfollow calendar' : 'Follow calendar'}
          type="button"
        >
          <Heart
            className={cn(
              'w-5 h-5 transition-colors',
              followed
                ? 'fill-red-500 text-red-500'
                : 'text-slate-600 dark:text-slate-300'
            )}
          />
        </button>
      </div>

      {/* Card content */}
      <div className="p-4">
        {/* Calendar name */}
        <h3 className="font-semibold text-slate-900 dark:text-slate-50 line-clamp-2 mb-1">
          {calendar.name}
        </h3>

        {/* Description snippet */}
        <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2 mb-3">
          {calendar.description}
        </p>

        {/* Follower count and event count */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-700">
          <div className="flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400">
            <Users className="w-4 h-4" />
            <span className="font-medium">{calendar.followerCount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')}</span>
            <span>followers</span>
          </div>

          <span className="text-xs text-slate-500 dark:text-slate-400">
            {calendar.eventCount} events
          </span>
        </div>
      </div>
    </Link>
  );
}

export default FeaturedCalendarCard;


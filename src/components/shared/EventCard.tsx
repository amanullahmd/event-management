/**
 * EventCard Component
 * 
 * A versatile card component for displaying event information with
 * multiple variants, status badges, social proof, and interactive elements.
 * 
 * Features:
 * - Event image with hover zoom effect
 * - Title, date/time, price (formatted as "From $X"), and organizer name
 * - Heart/save button for bookmarking events
 * - Smooth hover animations (shadow elevation, slight scale)
 * - Multiple variants: default, compact, trending
 * - Links to event detail page
 * 
 * Variants:
 * - default: Full card with image, all details, and social proof
 * - compact: Smaller card for list views
 * - trending: Card with large rank number overlay
 * 
 * @example
 * ```tsx
 * // Default variant
 * <EventCard event={event} showSaveButton onSave={handleSave} />
 * 
 * // Trending variant with rank
 * <EventCard event={event} variant="trending" rank={1} />
 * 
 * // Compact variant
 * <EventCard event={event} variant="compact" />
 * ```
 * 
 * Requirements: 5.4, 5.7, 5.8
 */
'use client';

import React, { useState, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Heart, Calendar, MapPin, User } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { StatusBadge, StatusBadgeProps } from './StatusBadge';
import { SocialProofBadge } from './SocialProofBadge';
import type { Event } from '@/lib/types/event';

/**
 * Extended Event interface with additional fields for the landing page
 * Extends the base Event type with social proof and status indicators
 */
export interface ExtendedEvent extends Event {
  /** Number of users who have marked interest in the event */
  interestedCount?: number;
  /** Number of users who are confirmed going to the event */
  goingCount?: number;
  /** Whether the event is featured/promoted */
  isFeatured?: boolean;
  /** Whether the event is trending */
  isTrending?: boolean;
  /** Trending rank position (1-10) */
  trendingRank?: number;
  /** Organizer details */
  organizer?: {
    id: string;
    name: string;
    followerCount?: number;
    avatar?: string;
  };
  /** Percentage of tickets still available (0-100) */
  ticketAvailabilityPercent?: number;
  /** When ticket sales end */
  saleEndsAt?: Date;
}

export interface EventCardProps {
  /** Event data to display */
  event: ExtendedEvent;
  /** Card display variant */
  variant?: 'default' | 'compact' | 'trending';
  /** Rank number for trending variant */
  rank?: number;
  /** Whether to show social proof badge */
  showSocialProof?: boolean;
  /** Whether to show the save/bookmark button */
  showSaveButton?: boolean;
  /** Callback when save button is clicked */
  onSave?: (eventId: string) => void;
  /** Whether the event is already saved */
  isSaved?: boolean;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Format a date for display
 */
function formatEventDate(date: Date): string {
  const eventDate = new Date(date);
  const options: Intl.DateTimeFormatOptions = {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  };
  return eventDate.toLocaleDateString('en-US', options);
}

/**
 * Format price for display as "From $X" or "Free"
 */
function formatPrice(ticketTypes: Event['ticketTypes']): string {
  if (!ticketTypes || ticketTypes.length === 0) {
    return 'Free';
  }
  
  const minPrice = Math.min(...ticketTypes.map(t => t.price));
  
  if (minPrice === 0) {
    return 'Free';
  }
  
  return `From $${minPrice.toFixed(0)}`;
}

/**
 * Determine which status badge to show based on event state
 */
function getStatusBadgeType(event: ExtendedEvent): StatusBadgeProps['type'] | null {
  // Check for "Almost Full" - less than 10% tickets remaining
  if (event.ticketAvailabilityPercent !== undefined && event.ticketAvailabilityPercent < 10) {
    return 'almost-full';
  }
  
  // Check for "Sale Ends Soon" - within 24 hours
  if (event.saleEndsAt) {
    const now = new Date();
    const saleEnds = new Date(event.saleEndsAt);
    const hoursUntilEnd = (saleEnds.getTime() - now.getTime()) / (1000 * 60 * 60);
    if (hoursUntilEnd > 0 && hoursUntilEnd <= 24) {
      return 'sale-ends-soon';
    }
  }
  
  // Check for "Featured"
  if (event.isFeatured) {
    return 'featured';
  }
  
  // Check for "Free"
  const minPrice = event.ticketTypes?.length 
    ? Math.min(...event.ticketTypes.map(t => t.price))
    : 0;
  if (minPrice === 0) {
    return 'free';
  }
  
  return null;
}

/**
 * Get organizer name from event data
 */
function getOrganizerName(event: ExtendedEvent): string {
  if (event.organizer?.name) {
    return event.organizer.name;
  }
  return 'Event Organizer';
}

/**
 * EventCard component for displaying event information
 * 
 * @param props - EventCard configuration props
 * @returns JSX element containing the event card
 * 
 * Validates: Requirements 5.4 (Display event image, title, date/time, price, organizer)
 * Validates: Requirements 5.7 (Include heart/save button)
 * Validates: Requirements 5.8 (Smooth hover animations)
 */
export function EventCard({
  event,
  variant = 'default',
  rank,
  showSocialProof = true,
  showSaveButton = true,
  onSave,
  isSaved = false,
  className,
}: EventCardProps) {
  const [saved, setSaved] = useState(isSaved);
  
  const handleSaveClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setSaved(!saved);
    onSave?.(event.id);
  }, [saved, onSave, event.id]);

  const statusBadgeType = getStatusBadgeType(event);
  const organizerName = getOrganizerName(event);
  const formattedDate = formatEventDate(event.date);
  const formattedPrice = formatPrice(event.ticketTypes);
  const hasSocialProof = (event.interestedCount && event.interestedCount > 0) || 
                         (event.goingCount && event.goingCount > 0);

  // Render compact variant
  if (variant === 'compact') {
    return (
      <Link
        href={`/events/${event.id}`}
        className={cn(
          'group flex gap-4 p-3 rounded-lg',
          'bg-white dark:bg-slate-800',
          'border border-slate-200 dark:border-slate-700',
          'hover:shadow-md hover:border-slate-300 dark:hover:border-slate-600',
          'transition-all duration-200',
          className
        )}
      >
        {/* Compact image */}
        <div className="relative w-20 h-20 flex-shrink-0 rounded-md overflow-hidden">
          <Image
            src={event.image || '/placeholder-event.jpg'}
            alt={event.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
        
        {/* Compact details */}
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-slate-900 dark:text-slate-50 truncate">
            {event.name}
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-0.5">
            {formattedDate}
          </p>
          <p className="text-sm font-medium text-violet-600 dark:text-violet-400 mt-1">
            {formattedPrice}
          </p>
        </div>
      </Link>
    );
  }

  // Render trending variant
  if (variant === 'trending') {
    return (
      <Link
        href={`/events/${event.id}`}
        className={cn(
          'group relative block rounded-xl overflow-hidden',
          'bg-white dark:bg-slate-800',
          'border border-slate-200 dark:border-slate-700',
          // Hover animations - Validates: Requirements 5.8
          'hover:shadow-xl hover:-translate-y-1',
          'transition-all duration-300 ease-out',
          className
        )}
      >
        {/* Rank number overlay for trending variant */}
        {rank !== undefined && (
          <div 
            className="absolute top-2 left-2 z-20 flex items-center justify-center w-10 h-10 rounded-full bg-black/70 text-white font-bold text-lg"
            aria-label={`Trending rank ${rank}`}
          >
            {rank}
          </div>
        )}

        {/* Image container with hover zoom - Validates: Requirements 5.4 */}
        <div className="relative aspect-[4/3] overflow-hidden">
          <Image
            src={event.image || '/placeholder-event.jpg'}
            alt={event.name}
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-500"
          />
          
          {/* Status badge overlay */}
          {statusBadgeType && (
            <div className="absolute top-2 right-2 z-10">
              <StatusBadge type={statusBadgeType} />
            </div>
          )}
          
          {/* Save button - Validates: Requirements 5.7 */}
          {showSaveButton && (
            <button
              onClick={handleSaveClick}
              className={cn(
                'absolute bottom-2 right-2 z-10',
                'w-9 h-9 rounded-full',
                'flex items-center justify-center',
                'bg-white/90 dark:bg-slate-800/90',
                'hover:bg-white dark:hover:bg-slate-800',
                'shadow-md',
                'transition-all duration-200',
                'focus:outline-none focus:ring-2 focus:ring-violet-500'
              )}
              aria-label={saved ? 'Remove from saved events' : 'Save event'}
              type="button"
            >
              <Heart
                className={cn(
                  'w-5 h-5 transition-colors',
                  saved 
                    ? 'fill-red-500 text-red-500' 
                    : 'text-slate-600 dark:text-slate-300'
                )}
              />
            </button>
          )}
        </div>

        {/* Card content */}
        <div className="p-4">
          {/* Title - Validates: Requirements 5.4 */}
          <h3 className="font-semibold text-slate-900 dark:text-slate-50 line-clamp-2 mb-2">
            {event.name}
          </h3>
          
          {/* Date/Time - Validates: Requirements 5.4 */}
          <div className="flex items-center gap-1.5 text-sm text-slate-600 dark:text-slate-400 mb-1">
            <Calendar className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
            <span>{formattedDate}</span>
          </div>
          
          {/* Location */}
          <div className="flex items-center gap-1.5 text-sm text-slate-600 dark:text-slate-400 mb-2">
            <MapPin className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
            <span className="truncate">{event.location}</span>
          </div>
          
          {/* Price and Organizer row - Validates: Requirements 5.4 */}
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100 dark:border-slate-700">
            <span className="font-semibold text-violet-600 dark:text-violet-400">
              {formattedPrice}
            </span>
            <div className="flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400">
              <User className="w-4 h-4" aria-hidden="true" />
              <span className="truncate max-w-[120px]">{organizerName}</span>
            </div>
          </div>
          
          {/* Social proof badge */}
          {showSocialProof && hasSocialProof && (
            <div className="mt-3">
              <SocialProofBadge
                interestedCount={event.interestedCount || 0}
                goingCount={event.goingCount}
              />
            </div>
          )}
        </div>
      </Link>
    );
  }

  // Render default variant
  return (
    <Link
      href={`/events/${event.id}`}
      className={cn(
        'group relative block rounded-xl overflow-hidden',
        'bg-white dark:bg-slate-800',
        'border border-slate-200 dark:border-slate-700',
        // Hover animations - Validates: Requirements 5.8
        'hover:shadow-xl hover:-translate-y-1',
        'transition-all duration-300 ease-out',
        className
      )}
    >
      {/* Image container with hover zoom - Validates: Requirements 5.4 */}
      <div className="relative aspect-[16/10] overflow-hidden">
        <Image
          src={event.image || '/placeholder-event.jpg'}
          alt={event.name}
          fill
          className="object-cover group-hover:scale-110 transition-transform duration-500"
        />
        
        {/* Status badge overlay */}
        {statusBadgeType && (
          <div className="absolute top-2 left-2 z-10">
            <StatusBadge type={statusBadgeType} />
          </div>
        )}
        
        {/* Save button - Validates: Requirements 5.7 */}
        {showSaveButton && (
          <button
            onClick={handleSaveClick}
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
            aria-label={saved ? 'Remove from saved events' : 'Save event'}
            type="button"
          >
            <Heart
              className={cn(
                'w-5 h-5 transition-colors',
                saved 
                  ? 'fill-red-500 text-red-500' 
                  : 'text-slate-600 dark:text-slate-300'
              )}
            />
          </button>
        )}
      </div>

      {/* Card content */}
      <div className="p-4">
        {/* Title - Validates: Requirements 5.4 */}
        <h3 className="font-semibold text-slate-900 dark:text-slate-50 line-clamp-2 mb-2">
          {event.name}
        </h3>
        
        {/* Date/Time - Validates: Requirements 5.4 */}
        <div className="flex items-center gap-1.5 text-sm text-slate-600 dark:text-slate-400 mb-1">
          <Calendar className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
          <span>{formattedDate}</span>
        </div>
        
        {/* Location */}
        <div className="flex items-center gap-1.5 text-sm text-slate-600 dark:text-slate-400 mb-2">
          <MapPin className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
          <span className="truncate">{event.location}</span>
        </div>
        
        {/* Price and Organizer row - Validates: Requirements 5.4 */}
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100 dark:border-slate-700">
          <span className="font-semibold text-violet-600 dark:text-violet-400">
            {formattedPrice}
          </span>
          <div className="flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400">
            <User className="w-4 h-4" aria-hidden="true" />
            <span className="truncate max-w-[120px]">{organizerName}</span>
          </div>
        </div>
        
        {/* Social proof badge */}
        {showSocialProof && hasSocialProof && (
          <div className="mt-3">
            <SocialProofBadge
              interestedCount={event.interestedCount || 0}
              goingCount={event.goingCount}
            />
          </div>
        )}
      </div>
    </Link>
  );
}

export default EventCard;

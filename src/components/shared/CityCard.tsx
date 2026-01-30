/**
 * CityCard Component
 * 
 * A card component for displaying a city with image, gradient overlay, and event count.
 * Used in the PopularCities section for destination browsing.
 * 
 * Features:
 * - City image with gradient overlay
 * - City name and event count display
 * - Hover effects with image zoom and text reveal
 * - Navigation to filtered events for the city
 * 
 * @example
 * ```tsx
 * <CityCard 
 *   city={{ id: 'ny', name: 'New York', image: '/ny.jpg', eventCount: 150 }}
 *   onClick={handleClick}
 * />
 * ```
 * 
 * Requirements: 10.3, 10.6
 */
'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { MapPin } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

export interface City {
  id: string;
  name: string;
  image: string;
  eventCount: number;
}

export interface CityCardProps {
  /** City data to display */
  city: City;
  /** Optional click handler */
  onClick?: () => void;
  /** Additional CSS classes */
  className?: string;
}

/**
 * CityCard component for displaying city destinations
 * 
 * @param props - CityCard configuration props
 * @returns JSX element containing the city card
 * 
 * Validates: Requirements 10.3 (Display city image, name, and event count)
 * Validates: Requirements 10.6 (Have hover effects with image zoom and text reveal)
 */
export function CityCard({
  city,
  onClick,
  className,
}: CityCardProps) {
  const handleClick = () => {
    onClick?.();
  };

  return (
    <Link
      href={`/events?location=${encodeURIComponent(city.name)}`}
      onClick={handleClick}
      className={cn(
        'group relative block rounded-xl overflow-hidden',
        'aspect-[4/3]',
        'focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2',
        className
      )}
    >
      {/* City image with hover zoom - Validates: Requirements 10.6 */}
      <Image
        src={city.image}
        alt={city.name}
        fill
        className="object-cover group-hover:scale-110 transition-transform duration-500"
      />

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

      {/* Content overlay with text reveal animation - Validates: Requirements 10.6 */}
      <div
        className={cn(
          'absolute inset-0',
          'flex flex-col items-start justify-end',
          'p-4',
          'transition-all duration-300'
        )}
      >
        {/* City name - Validates: Requirements 10.3 */}
        <h3 className="text-xl font-bold text-white mb-1">
          {city.name}
        </h3>

        {/* Event count - Validates: Requirements 10.3 */}
        <div className="flex items-center gap-1.5 text-sm text-white/90">
          <MapPin className="w-4 h-4" />
          <span>{city.eventCount.toLocaleString()} events</span>
        </div>
      </div>
    </Link>
  );
}

export default CityCard;


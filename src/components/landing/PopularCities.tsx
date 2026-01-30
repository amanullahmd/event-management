/**
 * PopularCities Component
 * 
 * Displays popular event destinations in a horizontal carousel.
 * Allows users to explore events in different cities.
 * 
 * Features:
 * - Horizontal carousel of city cards
 * - City images with gradient overlays
 * - Event count for each city
 * - Hover effects with image zoom
 * - Navigation to filtered events for each city
 * - Responsive design
 * 
 * @example
 * ```tsx
 * <PopularCities cities={popularCities} />
 * ```
 * 
 * Requirements: 10.1, 10.2, 10.5
 */
'use client';

import React from 'react';
import { Globe } from 'lucide-react';
import { Carousel } from '@/components/shared/Carousel';
import { CityCard, City } from '@/components/shared/CityCard';
import { cn } from '@/lib/utils/cn';

export interface PopularCitiesProps {
  /** Array of popular cities to display */
  cities: City[];
  /** Additional CSS classes */
  className?: string;
}

/**
 * PopularCities component for displaying popular event destinations
 * 
 * @param props - PopularCities configuration props
 * @returns JSX element containing the popular cities section
 * 
 * Validates: Requirements 10.1 (Display destinations section with title)
 * Validates: Requirements 10.2 (Display City_Cards in horizontal Carousel)
 * Validates: Requirements 10.5 (Show at least 6 popular cities)
 */
export function PopularCities({
  cities,
  className,
}: PopularCitiesProps) {
  if (cities.length === 0) {
    return null;
  }

  return (
    <section className={cn('w-full', className)}>
      <Carousel
        title="Popular Cities"
        titleIcon={<Globe className="w-5 h-5 text-blue-600" />}
        viewAllHref="/cities"
        itemWidth={300}
        gap={16}
      >
        {cities.map((city) => (
          <CityCard
            key={city.id}
            city={city}
          />
        ))}
      </Carousel>
    </section>
  );
}

export default PopularCities;


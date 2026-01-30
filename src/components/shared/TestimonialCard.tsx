/**
 * TestimonialCard Component
 * 
 * A card component for displaying user testimonials and social proof.
 * Shows quote text, user name, and source information.
 * 
 * @example
 * ```tsx
 * <TestimonialCard 
 *   testimonial={{
 *     quote: "Amazing events!",
 *     author: "John Doe",
 *     source: "App Store Review"
 *   }}
 * />
 * ```
 * 
 * Requirements: 11.3
 */
'use client';

import React from 'react';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

export interface Testimonial {
  id: string;
  quote: string;
  author: string;
  source: string;
  rating?: number;
}

export interface TestimonialCardProps {
  /** Testimonial data to display */
  testimonial: Testimonial;
  /** Additional CSS classes */
  className?: string;
}

/**
 * TestimonialCard component for displaying user testimonials
 * 
 * @param props - TestimonialCard configuration props
 * @returns JSX element containing the testimonial card
 * 
 * Validates: Requirements 11.3 (Display quote text, user name, and source)
 */
export function TestimonialCard({
  testimonial,
  className,
}: TestimonialCardProps) {
  return (
    <div
      className={cn(
        'flex-shrink-0 w-80',
        'p-6 rounded-xl',
        'bg-white dark:bg-slate-800',
        'border border-slate-200 dark:border-slate-700',
        'shadow-md hover:shadow-lg',
        'transition-shadow duration-200',
        className
      )}
    >
      {/* Star rating */}
      {testimonial.rating && (
        <div className="flex gap-1 mb-3">
          {Array.from({ length: testimonial.rating }).map((_, i) => (
            <Star
              key={i}
              className="w-4 h-4 fill-yellow-400 text-yellow-400"
            />
          ))}
        </div>
      )}

      {/* Quote text - Validates: Requirements 11.3 */}
      <p className="text-slate-700 dark:text-slate-300 mb-4 italic">
        "{testimonial.quote}"
      </p>

      {/* Author and source - Validates: Requirements 11.3 */}
      <div className="border-t border-slate-100 dark:border-slate-700 pt-4">
        <p className="font-semibold text-slate-900 dark:text-slate-50">
          {testimonial.author}
        </p>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          {testimonial.source}
        </p>
      </div>
    </div>
  );
}

export default TestimonialCard;


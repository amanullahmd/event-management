/**
 * SocialProofSection Component
 * 
 * Displays user testimonials and social proof to build trust with new visitors.
 * Features an auto-scrolling carousel of testimonials with pause on hover.
 * 
 * Features:
 * - Auto-scrolling testimonial carousel
 * - Pause on hover functionality
 * - Trust indicators (organizers, events hosted)
 * - Modern card design with shadows
 * - Responsive design
 * 
 * @example
 * ```tsx
 * <SocialProofSection 
 *   testimonials={testimonials}
 *   trustMetrics={{ organizers: 5000, eventsHosted: 50000 }}
 * />
 * ```
 * 
 * Requirements: 11.1, 11.2, 11.4
 */
'use client';

import React from 'react';
import { Award } from 'lucide-react';
import { Carousel } from '@/components/shared/Carousel';
import { TestimonialCard, Testimonial } from '@/components/shared/TestimonialCard';
import { cn } from '@/lib/utils/cn';

export interface TrustMetrics {
  organizers?: number;
  eventsHosted?: number;
}

export interface SocialProofSectionProps {
  /** Array of testimonials to display */
  testimonials: Testimonial[];
  /** Trust metrics to display */
  trustMetrics?: TrustMetrics;
  /** Additional CSS classes */
  className?: string;
}

/**
 * SocialProofSection component for displaying testimonials and trust indicators
 * 
 * @param props - SocialProofSection configuration props
 * @returns JSX element containing the social proof section
 * 
 * Validates: Requirements 11.1 (Display Testimonial_Carousel section)
 * Validates: Requirements 11.2 (Auto-scroll horizontally with pause on hover)
 * Validates: Requirements 11.4 (Include trust indicators)
 */
export function SocialProofSection({
  testimonials,
  trustMetrics,
  className,
}: SocialProofSectionProps) {
  if (testimonials.length === 0) {
    return null;
  }

  return (
    <section className={cn('w-full', className)}>
      {/* Trust indicators - Validates: Requirements 11.4 */}
      {trustMetrics && (
        <div className="mb-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {trustMetrics.organizers && (
            <div className="p-4 rounded-lg bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-900/20 dark:to-purple-900/20 border border-violet-200 dark:border-violet-800">
              <div className="flex items-center gap-2 mb-1">
                <Award className="w-5 h-5 text-violet-600 dark:text-violet-400" />
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                  Trusted by
                </p>
              </div>
              <p className="text-2xl font-bold text-slate-900 dark:text-slate-50">
                {trustMetrics.organizers.toLocaleString()}+
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                event organizers
              </p>
            </div>
          )}

          {trustMetrics.eventsHosted && (
            <div className="p-4 rounded-lg bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border border-blue-200 dark:border-blue-800">
              <div className="flex items-center gap-2 mb-1">
                <Award className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                  Events hosted
                </p>
              </div>
              <p className="text-2xl font-bold text-slate-900 dark:text-slate-50">
                {trustMetrics.eventsHosted.toLocaleString()}+
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                on our platform
              </p>
            </div>
          )}
        </div>
      )}

      {/* Testimonials carousel - Validates: Requirements 11.1, 11.2 */}
      <Carousel
        title="What People Say"
        titleIcon={<Award className="w-5 h-5 text-amber-600" />}
        itemWidth={320}
        gap={16}
        autoScroll={true}
        autoScrollInterval={5000}
      >
        {testimonials.map((testimonial) => (
          <TestimonialCard
            key={testimonial.id}
            testimonial={testimonial}
          />
        ))}
      </Carousel>
    </section>
  );
}

export default SocialProofSection;


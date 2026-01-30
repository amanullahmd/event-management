/**
 * Carousel Component
 * 
 * A reusable horizontal carousel component with smooth scrolling,
 * navigation arrows, and touch gesture support.
 * 
 * Features:
 * - Smooth horizontal scrolling with CSS scroll-snap
 * - Navigation arrows that hide at boundaries
 * - Touch/swipe support on mobile with momentum scrolling
 * - Optional auto-scroll functionality
 * - Responsive item sizing
 * - Section header with optional icon and "View All" link
 * 
 * @example
 * ```tsx
 * <Carousel 
 *   title="Trending Events" 
 *   titleIcon={<Flame className="w-5 h-5" />}
 *   viewAllHref="/events"
 * >
 *   {events.map(event => <EventCard key={event.id} event={event} />)}
 * </Carousel>
 * ```
 * 
 * Requirements: 12.1, 12.2, 12.3, 12.4, 12.5, 12.6, 12.7, 12.8, 12.9
 */
'use client';

import React, { useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { useCarousel } from '@/lib/hooks/useCarousel';

export interface CarouselProps {
  /** Section title displayed in the header */
  title: string;
  /** Optional icon/emoji to display next to the title */
  titleIcon?: React.ReactNode;
  /** Optional "View All" link URL */
  viewAllHref?: string;
  /** Carousel items to render */
  children: React.ReactNode;
  /** Width of each item in pixels (default: 300) */
  itemWidth?: number;
  /** Gap between items in pixels (default: 16) */
  gap?: number;
  /** Whether to show navigation arrows (default: true) */
  showArrows?: boolean;
  /** Enable auto-scroll functionality (default: false) */
  autoScroll?: boolean;
  /** Auto-scroll interval in milliseconds (default: 5000) */
  autoScrollInterval?: number;
  /** Additional CSS classes for the container */
  className?: string;
}

/**
 * Carousel component for horizontally scrollable content
 * 
 * @param props - Carousel configuration props
 * @returns JSX element containing the carousel
 */
export function Carousel({
  title,
  titleIcon,
  viewAllHref,
  children,
  itemWidth = 300,
  gap = 16,
  showArrows = true,
  autoScroll = false,
  autoScrollInterval = 5000,
  className
}: CarouselProps) {
  const {
    containerRef,
    canScrollLeft,
    canScrollRight,
    scrollLeft,
    scrollRight
  } = useCarousel({ itemWidth, gap });

  const autoScrollRef = useRef<NodeJS.Timeout | null>(null);
  const isPausedRef = useRef(false);

  /**
   * Handle auto-scroll functionality
   * Pauses on hover and resumes when mouse leaves
   */
  const startAutoScroll = useCallback(() => {
    if (!autoScroll) return;

    autoScrollRef.current = setInterval(() => {
      if (isPausedRef.current) return;
      
      const container = containerRef.current;
      if (!container) return;

      // If at the end, scroll back to start
      if (!canScrollRight) {
        container.scrollTo({ left: 0, behavior: 'smooth' });
      } else {
        scrollRight();
      }
    }, autoScrollInterval);
  }, [autoScroll, autoScrollInterval, canScrollRight, scrollRight, containerRef]);

  const stopAutoScroll = useCallback(() => {
    if (autoScrollRef.current) {
      clearInterval(autoScrollRef.current);
      autoScrollRef.current = null;
    }
  }, []);

  const pauseAutoScroll = useCallback(() => {
    isPausedRef.current = true;
  }, []);

  const resumeAutoScroll = useCallback(() => {
    isPausedRef.current = false;
  }, []);

  useEffect(() => {
    startAutoScroll();
    return () => stopAutoScroll();
  }, [startAutoScroll, stopAutoScroll]);

  return (
    <section className={cn('relative', className)}>
      {/* Header with title, icon, and optional "View All" link */}
      <div className="flex items-center justify-between mb-4 px-1">
        <div className="flex items-center gap-2">
          {titleIcon && (
            <span className="flex-shrink-0" aria-hidden="true">
              {titleIcon}
            </span>
          )}
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-50">
            {title}
          </h2>
        </div>
        
        {/* View All link - Validates: Requirements 12.9 */}
        {viewAllHref && (
          <Link
            href={viewAllHref}
            className="text-sm font-medium text-violet-600 hover:text-violet-700 dark:text-violet-400 dark:hover:text-violet-300 transition-colors"
          >
            View All
          </Link>
        )}
      </div>

      {/* Carousel container with navigation */}
      <div 
        className="relative group"
        onMouseEnter={pauseAutoScroll}
        onMouseLeave={resumeAutoScroll}
      >
        {/* Left navigation arrow - Validates: Requirements 12.2, 12.5 */}
        {showArrows && canScrollLeft && (
          <button
            onClick={scrollLeft}
            className={cn(
              'absolute left-0 top-1/2 -translate-y-1/2 z-10',
              'w-10 h-10 rounded-full',
              'bg-white dark:bg-slate-800',
              'border border-slate-200 dark:border-slate-700',
              'shadow-lg',
              'flex items-center justify-center',
              'text-slate-700 dark:text-slate-200',
              'hover:bg-slate-50 dark:hover:bg-slate-700',
              'transition-all duration-200',
              'opacity-0 group-hover:opacity-100',
              '-translate-x-1/2',
              'focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2'
            )}
            aria-label="Scroll left"
            type="button"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        )}

        {/* Right navigation arrow - Validates: Requirements 12.2, 12.6 */}
        {showArrows && canScrollRight && (
          <button
            onClick={scrollRight}
            className={cn(
              'absolute right-0 top-1/2 -translate-y-1/2 z-10',
              'w-10 h-10 rounded-full',
              'bg-white dark:bg-slate-800',
              'border border-slate-200 dark:border-slate-700',
              'shadow-lg',
              'flex items-center justify-center',
              'text-slate-700 dark:text-slate-200',
              'hover:bg-slate-50 dark:hover:bg-slate-700',
              'transition-all duration-200',
              'opacity-0 group-hover:opacity-100',
              'translate-x-1/2',
              'focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2'
            )}
            aria-label="Scroll right"
            type="button"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        )}

        {/* Scrollable container - Validates: Requirements 12.3, 12.4, 12.7 */}
        <div
          ref={containerRef}
          className={cn(
            'flex overflow-x-auto scrollbar-hide',
            'scroll-smooth snap-x snap-mandatory',
            'touch-pan-x',
            '-mx-1 px-1 py-2'
          )}
          style={{ 
            gap: `${gap}px`,
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
            WebkitOverflowScrolling: 'touch'
          }}
          role="region"
          aria-label={`${title} carousel`}
          tabIndex={0}
        >
          {React.Children.map(children, (child, index) => (
            <div
              key={index}
              className="flex-shrink-0 snap-start"
              style={{ width: itemWidth > 0 ? `${itemWidth}px` : 'auto' }}
            >
              {child}
            </div>
          ))}
        </div>
      </div>

      {/* Custom CSS for hiding scrollbar */}
      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </section>
  );
}

export default Carousel;

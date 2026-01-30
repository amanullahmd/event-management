/**
 * TabFilter Component
 * 
 * A horizontal row of filter tabs with pill-style design for quick event filtering.
 * Allows users to filter events by time range, event type, and price without
 * navigating away from the page.
 * 
 * Features:
 * - Pill-style tab buttons with active state styling
 * - Horizontally scrollable on mobile
 * - Quick filter options: All, For You, Online, Today, This Weekend, Music, Food & Drink, Free
 * - Smooth transitions between filter states
 * - Responsive design
 * 
 * @example
 * ```tsx
 * <TabFilter 
 *   activeTab="today"
 *   onTabChange={handleTabChange}
 * />
 * ```
 * 
 * Requirements: 3.1, 3.2, 3.3
 */
'use client';

import React, { useRef, useCallback } from 'react';
import { cn } from '@/lib/utils/cn';
import { Calendar, Users, Music, UtensilsCrossed, Zap } from 'lucide-react';

/**
 * Tab filter definition
 */
export interface FilterTab {
  id: string;
  label: string;
  icon?: React.ReactNode;
  description?: string;
}

export interface TabFilterProps {
  /** Currently active tab ID */
  activeTab: string;
  /** Callback when tab is changed */
  onTabChange: (tabId: string) => void;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Available filter tabs
 * Validates: Requirements 3.1 (Display Tab_Filter row with pill-style options)
 */
const filterTabs: FilterTab[] = [
  { id: 'all', label: 'All', description: 'All events' },
  { id: 'for-you', label: 'For You', icon: <Users className="w-4 h-4" />, description: 'Personalized picks' },
  { id: 'online', label: 'Online', description: 'Virtual events' },
  { id: 'today', label: 'Today', icon: <Calendar className="w-4 h-4" />, description: 'Happening today' },
  { id: 'this-weekend', label: 'This Weekend', description: 'Sat & Sun' },
  { id: 'music', label: 'Music', icon: <Music className="w-4 h-4" />, description: 'Music events' },
  { id: 'food-drink', label: 'Food & Drink', icon: <UtensilsCrossed className="w-4 h-4" />, description: 'Food events' },
  { id: 'free', label: 'Free', icon: <Zap className="w-4 h-4" />, description: 'Free events' },
];

/**
 * TabFilter component for quick event filtering
 * 
 * @param props - TabFilter configuration props
 * @returns JSX element containing the tab filter
 * 
 * Validates: Requirements 3.1 (Display Tab_Filter row with pill-style options)
 * Validates: Requirements 3.2 (Update displayed events when tab is clicked)
 * Validates: Requirements 3.3 (Visually indicate currently active filter)
 */
export function TabFilter({
  activeTab,
  onTabChange,
  className,
}: TabFilterProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  /**
   * Handle tab click
   * Validates: Requirements 3.2 (Update displayed events with smooth transition)
   */
  const handleTabClick = useCallback(
    (tabId: string) => {
      onTabChange(tabId);
    },
    [onTabChange]
  );

  /**
   * Scroll the container left
   */
  const scrollLeft = useCallback(() => {
    if (containerRef.current) {
      containerRef.current.scrollBy({ left: -200, behavior: 'smooth' });
    }
  }, []);

  /**
   * Scroll the container right
   */
  const scrollRight = useCallback(() => {
    if (containerRef.current) {
      containerRef.current.scrollBy({ left: 200, behavior: 'smooth' });
    }
  }, []);

  return (
    <div className={cn('w-full', className)}>
      {/* Scrollable tab container */}
      <div
        ref={containerRef}
        className={cn(
          'flex gap-2 overflow-x-auto scrollbar-hide',
          'scroll-smooth snap-x snap-mandatory',
          'touch-pan-x',
          'pb-2'
        )}
        style={{
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
          WebkitOverflowScrolling: 'touch',
        }}
        role="tablist"
        aria-label="Event filters"
      >
        {filterTabs.map((tab) => {
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab.id)}
              className={cn(
                'flex-shrink-0 snap-start',
                'px-4 py-2.5 rounded-full',
                'font-medium text-sm',
                'flex items-center gap-2',
                'transition-all duration-200',
                'focus:outline-none focus:ring-2 focus:ring-offset-2',
                'group',
                // Active state styling - Validates: Requirements 3.3
                isActive
                  ? cn(
                      'bg-gradient-to-r from-violet-600 to-purple-600',
                      'text-white',
                      'shadow-lg',
                      'focus:ring-violet-400'
                    )
                  : cn(
                      'bg-white/10 hover:bg-white/20',
                      'border border-white/20 hover:border-white/40',
                      'text-white/80 hover:text-white',
                      'focus:ring-white/50'
                    )
              )}
              role="tab"
              aria-selected={isActive}
              aria-label={tab.description || tab.label}
              type="button"
            >
              {tab.icon && (
                <span className="transition-transform group-hover:scale-110">
                  {tab.icon}
                </span>
              )}
              <span className="whitespace-nowrap">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Custom CSS for hiding scrollbar */}
      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}

export default TabFilter;


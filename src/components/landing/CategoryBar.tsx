/**
 * CategoryBar Component
 * 
 * A horizontally scrollable bar of category icons with modern pill-style design.
 * Allows quick filtering by event type and navigates to the events page with
 * the selected category applied.
 * 
 * Features:
 * - Horizontally scrollable category icons
 * - Modern pill-style button design
 * - Touch/swipe support on mobile
 * - Navigation to events page with category filter
 * - Responsive design
 * 
 * @example
 * ```tsx
 * <CategoryBar />
 * ```
 * 
 * Requirements: 1.5, 1.6
 */
'use client';

import React, { useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Music,
  Laugh,
  UtensilsCrossed,
  BookOpen,
  Code,
  Palette,
  Heart,
  Trophy,
  Users,
  Palette as Art,
  Zap,
  Baby,
} from 'lucide-react';
import { cn } from '@/lib/utils/cn';

/**
 * Category definition with icon and label
 */
interface Category {
  id: string;
  label: string;
  icon: React.ReactNode;
  color: string;
}

/**
 * Available event categories
 */
const categories: Category[] = [
  { id: 'music', label: 'Music', icon: <Music className="w-5 h-5" />, color: 'from-pink-500 to-rose-500' },
  { id: 'comedy', label: 'Comedy', icon: <Laugh className="w-5 h-5" />, color: 'from-yellow-500 to-orange-500' },
  { id: 'food-drink', label: 'Food & Drink', icon: <UtensilsCrossed className="w-5 h-5" />, color: 'from-orange-500 to-red-500' },
  { id: 'education', label: 'Education', icon: <BookOpen className="w-5 h-5" />, color: 'from-blue-500 to-cyan-500' },
  { id: 'tech', label: 'Tech', icon: <Code className="w-5 h-5" />, color: 'from-purple-500 to-indigo-500' },
  { id: 'design', label: 'Design', icon: <Palette className="w-5 h-5" />, color: 'from-indigo-500 to-purple-500' },
  { id: 'health-wellness', label: 'Health & Wellness', icon: <Heart className="w-5 h-5" />, color: 'from-green-500 to-emerald-500' },
  { id: 'sports', label: 'Sports', icon: <Trophy className="w-5 h-5" />, color: 'from-red-500 to-pink-500' },
  { id: 'networking', label: 'Networking', icon: <Users className="w-5 h-5" />, color: 'from-cyan-500 to-blue-500' },
  { id: 'art', label: 'Art', icon: <Art className="w-5 h-5" />, color: 'from-violet-500 to-purple-500' },
  { id: 'nightlife', label: 'Nightlife', icon: <Zap className="w-5 h-5" />, color: 'from-fuchsia-500 to-pink-500' },
  { id: 'family', label: 'Family', icon: <Baby className="w-5 h-5" />, color: 'from-sky-500 to-blue-500' },
];

export interface CategoryBarProps {
  /** Additional CSS classes */
  className?: string;
}

/**
 * CategoryBar component for quick category filtering
 * 
 * @param props - CategoryBar configuration props
 * @returns JSX element containing the category bar
 * 
 * Validates: Requirements 1.5 (Display Category_Bar with horizontally scrollable category icons)
 * Validates: Requirements 1.6 (Navigate to events page filtered by category on click)
 */
export function CategoryBar({ className }: CategoryBarProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  /**
   * Handle category click
   * Validates: Requirements 1.6 (Navigate to events page filtered by category)
   */
  const handleCategoryClick = useCallback(
    (categoryId: string) => {
      const encodedCategory = encodeURIComponent(categoryId);
      router.push(`/events?category=${encodedCategory}`);
    },
    [router]
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
      <p className="text-sm font-medium text-white/70 mb-3 px-2">
        Browse by category
      </p>

      {/* Scrollable container */}
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
      >
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => handleCategoryClick(category.id)}
            className={cn(
              'flex-shrink-0 snap-start',
              'px-4 py-2.5 rounded-full',
              'bg-white/10 hover:bg-white/20',
              'border border-white/20 hover:border-white/40',
              'text-white font-medium text-sm',
              'flex items-center gap-2',
              'transition-all duration-200',
              'focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-transparent',
              'group'
            )}
            type="button"
            aria-label={`Filter by ${category.label}`}
          >
            <span className="transition-transform group-hover:scale-110">
              {category.icon}
            </span>
            <span className="whitespace-nowrap">{category.label}</span>
          </button>
        ))}
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

export default CategoryBar;


/**
 * CategoryInterests Component
 * 
 * Displays personalized category recommendations in a flowing wrap layout.
 * Allows users to explore events by their interests.
 * 
 * Features:
 * - Flowing wrap layout for category pills
 * - Multiple event categories
 * - Hover effects with color transitions
 * - Navigation to filtered events on click
 * - Responsive design
 * 
 * @example
 * ```tsx
 * <CategoryInterests />
 * ```
 * 
 * Requirements: 9.1, 9.2, 9.5
 */
'use client';

import React from 'react';
import { Sparkles } from 'lucide-react';
import { CategoryPill } from '@/components/shared/CategoryPill';
import { cn } from '@/lib/utils/cn';

/**
 * Category definition with color
 */
interface Category {
  name: string;
  color: string;
}

/**
 * Available categories for personalization
 */
const categories: Category[] = [
  { name: 'Music', color: 'from-pink-500 to-rose-500' },
  { name: 'Comedy', color: 'from-yellow-500 to-orange-500' },
  { name: 'Food & Drink', color: 'from-orange-500 to-red-500' },
  { name: 'Education', color: 'from-blue-500 to-cyan-500' },
  { name: 'Tech', color: 'from-purple-500 to-indigo-500' },
  { name: 'Design', color: 'from-indigo-500 to-purple-500' },
  { name: 'Health & Wellness', color: 'from-green-500 to-emerald-500' },
  { name: 'Sports', color: 'from-red-500 to-pink-500' },
  { name: 'Networking', color: 'from-cyan-500 to-blue-500' },
  { name: 'Art', color: 'from-violet-500 to-purple-500' },
  { name: 'Nightlife', color: 'from-fuchsia-500 to-pink-500' },
  { name: 'Family', color: 'from-sky-500 to-blue-500' },
];

export interface CategoryInterestsProps {
  /** Additional CSS classes */
  className?: string;
}

/**
 * CategoryInterests component for personalized category recommendations
 * 
 * @param props - CategoryInterests configuration props
 * @returns JSX element containing the category interests section
 * 
 * Validates: Requirements 9.1 (Display personalization section with title)
 * Validates: Requirements 9.2 (Display Category_Pills in flowing wrap layout)
 * Validates: Requirements 9.5 (Navigate to events page filtered by category on click)
 */
export function CategoryInterests({ className }: CategoryInterestsProps) {
  return (
    <section className={cn('w-full', className)}>
      {/* Section header */}
      <div className="flex items-center gap-2 mb-6 px-1">
        <Sparkles className="w-5 h-5 text-violet-600 dark:text-violet-400" />
        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-50">
          Explore by Interest
        </h2>
      </div>

      {/* Flowing wrap layout for category pills - Validates: Requirements 9.2 */}
      <div className="flex flex-wrap gap-2">
        {categories.map((category) => (
          <CategoryPill
            key={category.name}
            category={category.name}
            color={category.color}
          />
        ))}
      </div>
    </section>
  );
}

export default CategoryInterests;


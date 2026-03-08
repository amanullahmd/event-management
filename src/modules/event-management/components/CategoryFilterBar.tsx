'use client';

import React from 'react';
import { cn } from '@/modules/shared-common/utils/cn';
import type { Category } from './CategorySelector';

export interface CategoryFilterBarProps {
  categories: Category[];
  selectedCategoryId: string | null;
  onSelect: (categoryId: string | null) => void;
}

/**
 * Horizontal category filter bar for the landing page.
 * Renders an "All" option plus one button per active category,
 * each displaying the category name and icon.
 *
 * Validates: Requirements 6.1, 6.2
 */
export const CategoryFilterBar: React.FC<CategoryFilterBarProps> = ({
  categories,
  selectedCategoryId,
  onSelect,
}) => {
  return (
    <nav aria-label="Category filter" className="w-full">
      <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by category">
        {/* "All" option */}
        <button
          type="button"
          onClick={() => onSelect(null)}
          className={cn(
            'inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-colors',
            selectedCategoryId === null
              ? 'bg-violet-600 text-white shadow-md shadow-violet-500/20'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
          )}
          aria-pressed={selectedCategoryId === null}
          data-testid="category-filter-all"
        >
          All
        </button>

        {/* Per-category buttons */}
        {categories.map((category) => (
          <button
            key={category.id}
            type="button"
            onClick={() => onSelect(category.id)}
            className={cn(
              'inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-colors',
              selectedCategoryId === category.id
                ? 'bg-violet-600 text-white shadow-md shadow-violet-500/20'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            )}
            aria-pressed={selectedCategoryId === category.id}
            data-testid={`category-filter-${category.slug}`}
          >
            {category.iconName && (
              <span aria-hidden="true">{category.iconName}</span>
            )}
            {category.name}
          </button>
        ))}
      </div>
    </nav>
  );
};

export default CategoryFilterBar;

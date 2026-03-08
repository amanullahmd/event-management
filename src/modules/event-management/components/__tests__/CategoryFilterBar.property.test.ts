/**
 * CategoryFilterBar Property-Based Tests
 *
 * Feature: event-category, Property 12: Category filter bar renders all active categories
 *
 * For any set of active categories, the landing page filter bar SHALL render
 * an "All" option plus one option per active category, each displaying the
 * category name and icon.
 *
 * **Validates: Requirements 6.2**
 */

import fc from 'fast-check';
import React from 'react';
import { render, screen, cleanup } from '@testing-library/react';
import { CategoryFilterBar, type CategoryFilterBarProps } from '../CategoryFilterBar';
import type { Category } from '../CategorySelector';

// --- Arbitraries ---

const categoryNameArb = fc.constantFrom(
  'Music', 'Technology', 'Sports', 'Art', 'Food', 'Conference',
  'Workshop', 'Networking', 'Health', 'Education', 'Entertainment',
  'Charity', 'Business', 'Science', 'Travel', 'Gaming', 'Fashion',
  'Photography', 'Film', 'Dance'
);

const categoryArb: fc.Arbitrary<Category> = fc.record({
  id: fc.uuid(),
  name: categoryNameArb,
  slug: fc.stringMatching(/^[a-z][a-z0-9-]{0,30}$/).filter((s) => s.length > 0),
  description: fc.option(fc.string({ maxLength: 50 }), { nil: undefined }),
  iconName: fc.option(fc.constantFrom('🎵', '💻', '⚽', '🎨', '🍔', '🎤', '🏃'), { nil: undefined }),
  displayOrder: fc.integer({ min: 0, max: 100 }),
  active: fc.constant(true),
});

/** Generate a non-empty list of categories with unique ids, names, and slugs */
const categoriesArb = fc
  .array(categoryArb, { minLength: 1, maxLength: 8 })
  .map((cats) => {
    const seenIds = new Set<string>();
    const seenNames = new Set<string>();
    const seenSlugs = new Set<string>();
    return cats.filter((c) => {
      const lowerName = c.name.toLowerCase().trim();
      if (seenIds.has(c.id) || seenNames.has(lowerName) || seenSlugs.has(c.slug)) return false;
      seenIds.add(c.id);
      seenNames.add(lowerName);
      seenSlugs.add(c.slug);
      return true;
    });
  })
  .filter((cats) => cats.length > 0);

// --- Tests ---

describe('Feature: event-category, Property 12: Category filter bar renders all active categories', () => {
  afterEach(() => {
    cleanup();
  });

  /**
   * Property: For any set of active categories, the filter bar SHALL render
   * an "All" button plus one button per active category.
   *
   * **Validates: Requirements 6.2**
   */
  it('renders "All" option plus one button per active category', () => {
    fc.assert(
      fc.property(categoriesArb, (categories) => {
        cleanup();
        const onSelect = jest.fn();

        render(
          React.createElement(CategoryFilterBar, {
            categories,
            selectedCategoryId: null,
            onSelect,
          } as CategoryFilterBarProps)
        );

        // "All" button should always be present
        const allButton = screen.getByTestId('category-filter-all');
        expect(allButton).toBeInTheDocument();
        expect(allButton).toHaveTextContent('All');

        // One button per category, each displaying the category name
        const buttons = screen.getAllByRole('button');
        // Total buttons = 1 (All) + categories.length
        expect(buttons.length).toBe(1 + categories.length);

        for (const cat of categories) {
          const btn = screen.getByTestId(`category-filter-${cat.slug}`);
          expect(btn).toBeInTheDocument();
          expect(btn).toHaveTextContent(cat.name);
        }

        cleanup();
      }),
      { numRuns: 20 }
    );
  });

  /**
   * Property: For any set of active categories with icons, each filter button
   * SHALL display the category icon alongside the name.
   *
   * **Validates: Requirements 6.2**
   */
  it('displays category icon when present', () => {
    fc.assert(
      fc.property(categoriesArb, (categories) => {
        cleanup();
        const onSelect = jest.fn();

        render(
          React.createElement(CategoryFilterBar, {
            categories,
            selectedCategoryId: null,
            onSelect,
          } as CategoryFilterBarProps)
        );

        for (const cat of categories) {
          const btn = screen.getByTestId(`category-filter-${cat.slug}`);
          if (cat.iconName) {
            expect(btn).toHaveTextContent(cat.iconName);
          }
          expect(btn).toHaveTextContent(cat.name);
        }

        cleanup();
      }),
      { numRuns: 20 }
    );
  });
});

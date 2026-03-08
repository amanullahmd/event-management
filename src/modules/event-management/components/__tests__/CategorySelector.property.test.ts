/**
 * CategorySelector Property-Based Tests
 *
 * Feature: event-category, Property 14: CategorySelector renders and emits correctly
 *
 * For any list of active categories, the CategorySelector component SHALL render
 * each category as a selectable option, and selecting any category SHALL emit
 * its categoryId to the parent form.
 *
 * **Validates: Requirements 5.2, 5.3**
 */

import fc from 'fast-check';
import React from 'react';
import { render, screen, fireEvent, waitFor, act, cleanup } from '@testing-library/react';
import { CategorySelector, type Category } from '../CategorySelector';

// --- Arbitraries ---

/** Generate realistic category names (alphanumeric, single spaces only) */
const categoryNameArb = fc
  .constantFrom(
    'Music', 'Technology', 'Sports', 'Art', 'Food', 'Conference',
    'Workshop', 'Networking', 'Health', 'Education', 'Entertainment',
    'Charity', 'Business', 'Science', 'Travel', 'Gaming', 'Fashion',
    'Photography', 'Film', 'Dance', 'Comedy', 'Theater', 'Cooking',
    'Fitness', 'Yoga', 'Running', 'Cycling', 'Swimming', 'Hiking',
    'Camping'
  );

const categoryArb: fc.Arbitrary<Category> = fc.record({
  id: fc.uuid(),
  name: categoryNameArb,
  slug: fc.stringMatching(/^[a-z][a-z0-9-]{0,30}$/).filter((s) => s.length > 0),
  description: fc.option(fc.string({ maxLength: 50 }), { nil: undefined }),
  iconName: fc.option(fc.constantFrom('🎵', '💻', '⚽', '🎨', '🍔'), { nil: undefined }),
  displayOrder: fc.integer({ min: 0, max: 100 }),
  active: fc.constant(true),
});

/** Generate a non-empty list of categories with unique ids and names */
const categoriesArb = fc
  .array(categoryArb, { minLength: 1, maxLength: 5 })
  .map((cats) => {
    const seenIds = new Set<string>();
    const seenNames = new Set<string>();
    return cats.filter((c) => {
      const lowerName = c.name.toLowerCase().trim();
      if (seenIds.has(c.id) || seenNames.has(lowerName)) return false;
      seenIds.add(c.id);
      seenNames.add(lowerName);
      return true;
    });
  })
  .filter((cats) => cats.length > 0);

function mockFetchSuccess(data: Category[]) {
  global.fetch = jest.fn().mockResolvedValue({
    ok: true,
    json: () => Promise.resolve(data),
  });
}

// --- Tests ---

describe('Feature: event-category, Property 14: CategorySelector renders and emits correctly', () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
    cleanup();
    jest.restoreAllMocks();
  });

  /**
   * Property: For any list of active categories, the CategorySelector SHALL
   * render each category as a selectable option showing the category name.
   *
   * **Validates: Requirements 5.2**
   */
  it('renders every active category as a selectable option', async () => {
    await fc.assert(
      fc.asyncProperty(categoriesArb, async (categories) => {
        cleanup();
        mockFetchSuccess(categories);

        const onChange = jest.fn();

        await act(async () => {
          render(React.createElement(CategorySelector, { onChange }));
        });

        // Wait for first category to appear
        await waitFor(() => {
          expect(screen.getByLabelText(categories[0].name)).toBeInTheDocument();
        });

        // Each category should have a radio input with the correct aria-label
        for (const cat of categories) {
          expect(screen.getByLabelText(cat.name)).toBeInTheDocument();
        }

        const radios = screen.getAllByRole('radio');
        expect(radios.length).toBe(categories.length);

        cleanup();
      }),
      { numRuns: 20 }
    );
  }, 30000);

  /**
   * Property: For any list of active categories and any selected category index,
   * clicking that category SHALL emit its categoryId via onChange.
   *
   * **Validates: Requirements 5.3**
   */
  it('emits the correct categoryId when a category is selected', async () => {
    await fc.assert(
      fc.asyncProperty(
        categoriesArb.chain((cats) =>
          fc.tuple(fc.constant(cats), fc.integer({ min: 0, max: cats.length - 1 }))
        ),
        async ([categories, selectedIndex]) => {
          cleanup();
          mockFetchSuccess(categories);

          const onChange = jest.fn();

          await act(async () => {
            render(React.createElement(CategorySelector, { onChange }));
          });

          await waitFor(() => {
            expect(screen.getByLabelText(categories[0].name)).toBeInTheDocument();
          });

          const targetCategory = categories[selectedIndex];

          // Click the radio input for the target category
          await act(async () => {
            fireEvent.click(screen.getByLabelText(targetCategory.name));
          });

          expect(onChange).toHaveBeenCalledWith(targetCategory.id);

          cleanup();
        }
      ),
      { numRuns: 20 }
    );
  }, 30000);
});

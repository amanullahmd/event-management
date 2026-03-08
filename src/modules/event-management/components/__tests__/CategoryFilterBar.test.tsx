/**
 * CategoryFilterBar Unit Tests
 *
 * Tests for "All" filter reset behavior and filter bar layout.
 *
 * Validates: Requirements 6.1, 6.2, 6.4
 */

import React from 'react';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { CategoryFilterBar } from '../CategoryFilterBar';
import type { Category } from '../CategorySelector';

const mockCategories: Category[] = [
  { id: 'cat-1', name: 'Music', slug: 'music', iconName: '🎵', displayOrder: 1, active: true },
  { id: 'cat-2', name: 'Technology', slug: 'technology', iconName: '💻', displayOrder: 2, active: true },
  { id: 'cat-3', name: 'Sports', slug: 'sports', iconName: '⚽', displayOrder: 3, active: true },
];

describe('CategoryFilterBar', () => {
  afterEach(() => {
    cleanup();
  });

  /**
   * Validates: Requirements 6.1 - horizontal category filter bar above event listing
   */
  it('renders a navigation element with category filter role', () => {
    const onSelect = jest.fn();
    render(
      <CategoryFilterBar
        categories={mockCategories}
        selectedCategoryId={null}
        onSelect={onSelect}
      />
    );

    expect(screen.getByRole('navigation', { name: /category filter/i })).toBeInTheDocument();
    expect(screen.getByRole('group', { name: /filter by category/i })).toBeInTheDocument();
  });

  /**
   * Validates: Requirements 6.2 - "All" option and one option per active category
   */
  it('renders "All" button and one button per category', () => {
    const onSelect = jest.fn();
    render(
      <CategoryFilterBar
        categories={mockCategories}
        selectedCategoryId={null}
        onSelect={onSelect}
      />
    );

    const buttons = screen.getAllByRole('button');
    expect(buttons).toHaveLength(4); // All + 3 categories

    expect(screen.getByTestId('category-filter-all')).toHaveTextContent('All');
    expect(screen.getByTestId('category-filter-music')).toHaveTextContent('🎵');
    expect(screen.getByTestId('category-filter-music')).toHaveTextContent('Music');
    expect(screen.getByTestId('category-filter-technology')).toHaveTextContent('Technology');
    expect(screen.getByTestId('category-filter-sports')).toHaveTextContent('Sports');
  });

  /**
   * Validates: Requirements 6.4 - "All" filter resets to show all events
   */
  it('calls onSelect with null when "All" is clicked', () => {
    const onSelect = jest.fn();
    render(
      <CategoryFilterBar
        categories={mockCategories}
        selectedCategoryId="cat-1"
        onSelect={onSelect}
      />
    );

    fireEvent.click(screen.getByTestId('category-filter-all'));
    expect(onSelect).toHaveBeenCalledWith(null);
  });

  /**
   * Validates: Requirements 6.3 - selecting a category triggers filtering
   */
  it('calls onSelect with categoryId when a category button is clicked', () => {
    const onSelect = jest.fn();
    render(
      <CategoryFilterBar
        categories={mockCategories}
        selectedCategoryId={null}
        onSelect={onSelect}
      />
    );

    fireEvent.click(screen.getByTestId('category-filter-technology'));
    expect(onSelect).toHaveBeenCalledWith('cat-2');
  });

  /**
   * Validates: Requirements 6.2 - selected category is visually highlighted
   */
  it('marks the selected category button as pressed', () => {
    const onSelect = jest.fn();
    render(
      <CategoryFilterBar
        categories={mockCategories}
        selectedCategoryId="cat-2"
        onSelect={onSelect}
      />
    );

    expect(screen.getByTestId('category-filter-all')).toHaveAttribute('aria-pressed', 'false');
    expect(screen.getByTestId('category-filter-technology')).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByTestId('category-filter-music')).toHaveAttribute('aria-pressed', 'false');
  });

  /**
   * Validates: Requirements 6.2 - "All" is highlighted when no category is selected
   */
  it('marks "All" as pressed when selectedCategoryId is null', () => {
    const onSelect = jest.fn();
    render(
      <CategoryFilterBar
        categories={mockCategories}
        selectedCategoryId={null}
        onSelect={onSelect}
      />
    );

    expect(screen.getByTestId('category-filter-all')).toHaveAttribute('aria-pressed', 'true');
  });

  /**
   * Edge case: empty categories list
   */
  it('renders only "All" button when categories list is empty', () => {
    const onSelect = jest.fn();
    render(
      <CategoryFilterBar
        categories={[]}
        selectedCategoryId={null}
        onSelect={onSelect}
      />
    );

    const buttons = screen.getAllByRole('button');
    expect(buttons).toHaveLength(1);
    expect(screen.getByTestId('category-filter-all')).toBeInTheDocument();
  });
});

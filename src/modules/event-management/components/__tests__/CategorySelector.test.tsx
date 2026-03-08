/**
 * CategorySelector Unit Tests
 *
 * Tests for loading state, error state with retry, and pre-selected value.
 *
 * **Validates: Requirements 5.4, 5.5, 5.6**
 */

import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { CategorySelector, type Category } from '../CategorySelector';

const mockCategories: Category[] = [
  {
    id: '11111111-1111-1111-1111-111111111111',
    name: 'Music',
    slug: 'music',
    iconName: '🎵',
    displayOrder: 1,
    active: true,
  },
  {
    id: '22222222-2222-2222-2222-222222222222',
    name: 'Technology',
    slug: 'technology',
    iconName: '💻',
    displayOrder: 2,
    active: true,
  },
  {
    id: '33333333-3333-3333-3333-333333333333',
    name: 'Sports',
    slug: 'sports',
    iconName: '⚽',
    displayOrder: 3,
    active: true,
  },
];

function mockFetchSuccess(data: Category[]) {
  global.fetch = jest.fn().mockResolvedValue({
    ok: true,
    json: () => Promise.resolve(data),
  });
}

function mockFetchFailure() {
  global.fetch = jest.fn().mockResolvedValue({
    ok: false,
    status: 500,
  });
}

describe('CategorySelector', () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
    jest.restoreAllMocks();
  });

  /**
   * Validates: Requirement 5.5 - loading state while fetching
   */
  it('displays a loading state while fetching categories', async () => {
    // Never resolve the promise to keep loading state
    global.fetch = jest.fn().mockReturnValue(new Promise(() => {}));

    await act(async () => {
      render(<CategorySelector onChange={jest.fn()} />);
    });

    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(screen.getByText('Loading categories...')).toBeInTheDocument();
  });

  /**
   * Validates: Requirement 5.6 - error state with retry button
   */
  it('displays an error message and retry button on fetch failure', async () => {
    mockFetchFailure();

    await act(async () => {
      render(<CategorySelector onChange={jest.fn()} />);
    });

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });

    expect(screen.getByText('Failed to load categories')).toBeInTheDocument();
    expect(screen.getByText('Retry')).toBeInTheDocument();
  });

  /**
   * Validates: Requirement 5.6 - retry button re-fetches categories
   */
  it('retries fetching categories when retry button is clicked', async () => {
    mockFetchFailure();

    await act(async () => {
      render(<CategorySelector onChange={jest.fn()} />);
    });

    await waitFor(() => {
      expect(screen.getByText('Retry')).toBeInTheDocument();
    });

    // Now mock success for retry
    mockFetchSuccess(mockCategories);

    await act(async () => {
      fireEvent.click(screen.getByText('Retry'));
    });

    await waitFor(() => {
      expect(screen.getByText('Music')).toBeInTheDocument();
    });

    expect(screen.getByText('Technology')).toBeInTheDocument();
    expect(screen.getByText('Sports')).toBeInTheDocument();
  });

  /**
   * Validates: Requirement 5.4 - pre-selected value for edit form
   */
  it('highlights the pre-selected category value', async () => {
    mockFetchSuccess(mockCategories);

    const preSelectedId = '22222222-2222-2222-2222-222222222222';

    await act(async () => {
      render(<CategorySelector value={preSelectedId} onChange={jest.fn()} />);
    });

    await waitFor(() => {
      expect(screen.getByText('Technology')).toBeInTheDocument();
    });

    const radios = screen.getAllByRole('radio') as HTMLInputElement[];
    const techRadio = radios.find((r) => r.getAttribute('aria-label') === 'Technology');
    expect(techRadio).toBeDefined();
    expect(techRadio!.checked).toBe(true);

    const musicRadio = radios.find((r) => r.getAttribute('aria-label') === 'Music');
    expect(musicRadio!.checked).toBe(false);
  });

  /**
   * Validates: Requirement 5.3 - emits categoryId on selection
   */
  it('calls onChange with the selected categoryId', async () => {
    mockFetchSuccess(mockCategories);

    const onChange = jest.fn();

    await act(async () => {
      render(<CategorySelector onChange={onChange} />);
    });

    await waitFor(() => {
      expect(screen.getByText('Music')).toBeInTheDocument();
    });

    await act(async () => {
      fireEvent.click(screen.getByText('Music'));
    });

    expect(onChange).toHaveBeenCalledWith('11111111-1111-1111-1111-111111111111');
  });

  /**
   * Validates: Clear selection emits null
   */
  it('calls onChange with null when clear selection is clicked', async () => {
    mockFetchSuccess(mockCategories);

    const onChange = jest.fn();

    await act(async () => {
      render(<CategorySelector value="11111111-1111-1111-1111-111111111111" onChange={onChange} />);
    });

    await waitFor(() => {
      expect(screen.getByText('Music')).toBeInTheDocument();
    });

    await act(async () => {
      fireEvent.click(screen.getByText('Clear selection'));
    });

    expect(onChange).toHaveBeenCalledWith(null);
  });
});

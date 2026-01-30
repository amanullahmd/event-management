/**
 * Tests for useEventFilters hook
 */
import { renderHook, act } from '@testing-library/react';
import { useEventFilters } from '../useEventFilters';
import { Event } from '../../types/event';

// Mock event data
const mockEvents: Event[] = [
  {
    id: '1',
    name: 'Jazz Concert',
    description: 'Live jazz performance',
    date: new Date('2024-12-15'),
    location: 'New York',
    category: 'Music',
    image: '/jazz.jpg',
    organizer: { id: 'org1', name: 'Jazz Club' },
    ticketTypes: [{ id: 't1', name: 'General', price: 50, quantity: 100 }],
    capacity: 500,
    status: 'active',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '2',
    name: 'Free Yoga Class',
    description: 'Morning yoga session',
    date: new Date('2024-12-16'),
    location: 'Los Angeles',
    category: 'Health & Wellness',
    image: '/yoga.jpg',
    organizer: { id: 'org2', name: 'Yoga Studio' },
    ticketTypes: [{ id: 't2', name: 'Free', price: 0, quantity: 50 }],
    capacity: 50,
    status: 'active',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '3',
    name: 'Tech Conference',
    description: 'Annual tech conference',
    date: new Date('2024-12-17'),
    location: 'San Francisco',
    category: 'Tech',
    image: '/tech.jpg',
    organizer: { id: 'org3', name: 'Tech Events' },
    ticketTypes: [{ id: 't3', name: 'Standard', price: 100, quantity: 200 }],
    capacity: 1000,
    status: 'active',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '4',
    name: 'Food Festival',
    description: 'International food festival',
    date: new Date('2024-12-18'),
    location: 'New York',
    category: 'Food & Drink',
    image: '/food.jpg',
    organizer: { id: 'org4', name: 'Food Events' },
    ticketTypes: [{ id: 't4', name: 'Entry', price: 25, quantity: 300 }],
    capacity: 2000,
    status: 'active',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

describe('useEventFilters', () => {
  describe('initialization', () => {
    it('should initialize with default filters', () => {
      const { result } = renderHook(() => useEventFilters(mockEvents));

      expect(result.current.filters.search).toBe('');
      expect(result.current.filters.category).toBeNull();
      expect(result.current.filters.dateRange).toBeNull();
      expect(result.current.filters.priceMax).toBeNull();
      expect(result.current.filters.location).toBeNull();
      expect(result.current.filters.isFree).toBe(false);
      expect(result.current.filters.isOnline).toBe(false);
    });

    it('should initialize with provided initial filters', () => {
      const { result } = renderHook(() =>
        useEventFilters(mockEvents, { category: 'Music', isFree: false })
      );

      expect(result.current.filters.category).toBe('Music');
      expect(result.current.filters.isFree).toBe(false);
    });

    it('should return all events when no filters are applied', () => {
      const { result } = renderHook(() => useEventFilters(mockEvents));

      expect(result.current.filteredEvents).toHaveLength(mockEvents.length);
    });
  });

  describe('setFilter', () => {
    it('should update a single filter', () => {
      const { result } = renderHook(() => useEventFilters(mockEvents));

      act(() => {
        result.current.setFilter('category', 'Music');
      });

      expect(result.current.filters.category).toBe('Music');
    });

    it('should filter events by category', () => {
      const { result } = renderHook(() => useEventFilters(mockEvents));

      act(() => {
        result.current.setFilter('category', 'Music');
      });

      expect(result.current.filteredEvents).toHaveLength(1);
      expect(result.current.filteredEvents[0].category).toBe('Music');
    });

    it('should filter events by free status', () => {
      const { result } = renderHook(() => useEventFilters(mockEvents));

      act(() => {
        result.current.setFilter('isFree', true);
      });

      expect(result.current.filteredEvents).toHaveLength(1);
      expect(result.current.filteredEvents[0].id).toBe('2');
    });

    it('should filter events by price max', () => {
      const { result } = renderHook(() => useEventFilters(mockEvents));

      act(() => {
        result.current.setFilter('priceMax', 50);
      });

      // Should include free event and events with price <= 50
      expect(result.current.filteredEvents).toHaveLength(2);
    });

    it('should filter events by location', () => {
      const { result } = renderHook(() => useEventFilters(mockEvents));

      act(() => {
        result.current.setFilter('location', 'New York');
      });

      expect(result.current.filteredEvents).toHaveLength(2);
      expect(result.current.filteredEvents.every(e => e.location === 'New York')).toBe(true);
    });

    it('should filter events by search query', () => {
      const { result } = renderHook(() => useEventFilters(mockEvents));

      act(() => {
        result.current.setFilter('search', 'jazz');
      });

      expect(result.current.filteredEvents).toHaveLength(1);
      expect(result.current.filteredEvents[0].name).toContain('Jazz');
    });
  });

  describe('setFilters', () => {
    it('should update multiple filters at once', () => {
      const { result } = renderHook(() => useEventFilters(mockEvents));

      act(() => {
        result.current.setFilters({
          category: 'Music',
          location: 'New York',
        });
      });

      expect(result.current.filters.category).toBe('Music');
      expect(result.current.filters.location).toBe('New York');
    });

    it('should apply multiple filters with AND logic', () => {
      const { result } = renderHook(() => useEventFilters(mockEvents));

      act(() => {
        result.current.setFilters({
          category: 'Music',
          location: 'New York',
        });
      });

      // Only Jazz Concert matches both criteria
      expect(result.current.filteredEvents).toHaveLength(1);
      expect(result.current.filteredEvents[0].id).toBe('1');
    });
  });

  describe('clearFilters', () => {
    it('should reset all filters to default state', () => {
      const { result } = renderHook(() => useEventFilters(mockEvents));

      act(() => {
        result.current.setFilter('category', 'Music');
        result.current.setFilter('location', 'New York');
      });

      expect(result.current.filters.category).toBe('Music');
      expect(result.current.filters.location).toBe('New York');

      act(() => {
        result.current.clearFilters();
      });

      expect(result.current.filters.category).toBeNull();
      expect(result.current.filters.location).toBeNull();
      expect(result.current.filteredEvents).toHaveLength(mockEvents.length);
    });
  });

  describe('activeFilterCount', () => {
    it('should return 0 when no filters are applied', () => {
      const { result } = renderHook(() => useEventFilters(mockEvents));

      expect(result.current.activeFilterCount).toBe(0);
    });

    it('should count active filters correctly', () => {
      const { result } = renderHook(() => useEventFilters(mockEvents));

      act(() => {
        result.current.setFilter('category', 'Music');
        result.current.setFilter('location', 'New York');
      });

      expect(result.current.activeFilterCount).toBe(2);
    });

    it('should not count empty search as active filter', () => {
      const { result } = renderHook(() => useEventFilters(mockEvents));

      act(() => {
        result.current.setFilter('search', '');
      });

      expect(result.current.activeFilterCount).toBe(0);
    });
  });

  describe('hasActiveFilters', () => {
    it('should return false when no filters are applied', () => {
      const { result } = renderHook(() => useEventFilters(mockEvents));

      expect(result.current.hasActiveFilters).toBe(false);
    });

    it('should return true when any filter is applied', () => {
      const { result } = renderHook(() => useEventFilters(mockEvents));

      act(() => {
        result.current.setFilter('category', 'Music');
      });

      expect(result.current.hasActiveFilters).toBe(true);
    });
  });

  describe('combined filters', () => {
    it('should apply multiple filters with AND logic', () => {
      const { result } = renderHook(() => useEventFilters(mockEvents));

      act(() => {
        result.current.setFilters({
          category: 'Music',
          priceMax: 75,
          location: 'New York',
        });
      });

      // Jazz Concert: Music category, $50 price, New York location - matches all
      expect(result.current.filteredEvents).toHaveLength(1);
      expect(result.current.filteredEvents[0].id).toBe('1');
    });

    it('should return empty array when no events match all filters', () => {
      const { result } = renderHook(() => useEventFilters(mockEvents));

      act(() => {
        result.current.setFilters({
          category: 'Music',
          location: 'Los Angeles',
        });
      });

      expect(result.current.filteredEvents).toHaveLength(0);
    });
  });

  describe('edge cases', () => {
    it('should handle empty events array', () => {
      const { result } = renderHook(() => useEventFilters([]));

      expect(result.current.filteredEvents).toHaveLength(0);
      expect(result.current.activeFilterCount).toBe(0);
    });

    it('should handle null location filter', () => {
      const { result } = renderHook(() => useEventFilters(mockEvents));

      act(() => {
        result.current.setFilter('location', null);
      });

      expect(result.current.filteredEvents).toHaveLength(mockEvents.length);
    });

    it('should handle case-insensitive search', () => {
      const { result } = renderHook(() => useEventFilters(mockEvents));

      act(() => {
        result.current.setFilter('search', 'JAZZ');
      });

      expect(result.current.filteredEvents).toHaveLength(1);
      expect(result.current.filteredEvents[0].name).toContain('Jazz');
    });
  });
});


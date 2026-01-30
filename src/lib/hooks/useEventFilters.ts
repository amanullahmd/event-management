/**
 * useEventFilters Hook
 * 
 * A custom hook for managing event filtering state and applying filters to events.
 * Combines filter state management with filter utility functions for a complete
 * filtering solution.
 * 
 * @example
 * ```tsx
 * const { filters, setFilter, clearFilters, filteredEvents } = useEventFilters(events);
 * 
 * // Update a single filter
 * setFilter('category', 'Music');
 * 
 * // Clear all filters
 * clearFilters();
 * ```
 * 
 * Requirements: 3.2
 */
import { useState, useCallback, useMemo } from 'react';
import { Event } from '../types/event';
import { 
  EventFilters, 
  defaultFilters, 
  filterEvents,
  countActiveFilters 
} from '../utils/eventFilters';

export interface UseEventFiltersReturn {
  /** Current filter state */
  filters: EventFilters;
  /** Update a single filter value */
  setFilter: (key: keyof EventFilters, value: any) => void;
  /** Update multiple filters at once */
  setFilters: (newFilters: Partial<EventFilters>) => void;
  /** Clear all filters to default state */
  clearFilters: () => void;
  /** Events filtered according to current filter state */
  filteredEvents: Event[];
  /** Number of active filters */
  activeFilterCount: number;
  /** Whether any filters are currently applied */
  hasActiveFilters: boolean;
}

/**
 * Custom hook for managing event filters
 * 
 * Provides a complete filtering solution with state management and memoized
 * filtered results. Automatically recalculates filtered events when filters
 * or source events change.
 * 
 * @param events - Array of events to filter
 * @param initialFilters - Optional initial filter state (defaults to defaultFilters)
 * @param referenceDate - Optional reference date for date calculations (useful for testing)
 * @returns Object containing filter state, setters, and filtered events
 * 
 * Validates: Requirements 3.2 (Combine filter state with filter utilities)
 */
export function useEventFilters(
  events: Event[],
  initialFilters: Partial<EventFilters> = {},
  referenceDate?: Date
): UseEventFiltersReturn {
  const [filters, setFiltersState] = useState<EventFilters>({
    ...defaultFilters,
    ...initialFilters,
  });

  /**
   * Update a single filter value
   */
  const setFilter = useCallback((key: keyof EventFilters, value: any) => {
    setFiltersState((prev) => ({
      ...prev,
      [key]: value,
    }));
  }, []);

  /**
   * Update multiple filters at once
   */
  const setFilters = useCallback((newFilters: Partial<EventFilters>) => {
    setFiltersState((prev) => ({
      ...prev,
      ...newFilters,
    }));
  }, []);

  /**
   * Clear all filters to default state
   */
  const clearFilters = useCallback(() => {
    setFiltersState(defaultFilters);
  }, []);

  /**
   * Memoized filtered events
   * Recalculates only when events or filters change
   */
  const filteredEvents = useMemo(() => {
    return filterEvents(events, filters, referenceDate);
  }, [events, filters, referenceDate]);

  /**
   * Count of active filters
   */
  const activeFilterCount = useMemo(() => {
    return countActiveFilters(filters);
  }, [filters]);

  /**
   * Whether any filters are currently applied
   */
  const hasActiveFilters = activeFilterCount > 0;

  return {
    filters,
    setFilter,
    setFilters,
    clearFilters,
    filteredEvents,
    activeFilterCount,
    hasActiveFilters,
  };
}

export default useEventFilters;


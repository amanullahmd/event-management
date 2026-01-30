/**
 * Event filter utility functions
 * 
 * Provides filtering capabilities for events based on various criteria:
 * - Date range (today, tomorrow, this-week, this-weekend, this-month)
 * - Price (max price threshold, free events)
 * - Category
 * - Location
 * - Search text
 * 
 * Requirements: 3.4, 3.5, 3.6, 7.4
 */

import { Event } from '../types/event';

/**
 * Filter options for events
 */
export interface EventFilters {
  search: string;
  category: string | null;
  dateRange: 'today' | 'tomorrow' | 'this-week' | 'this-weekend' | 'this-month' | null;
  priceMax: number | null;
  location: string | null;
  isFree: boolean;
  isOnline: boolean;
}

/**
 * Default filter values
 */
export const defaultFilters: EventFilters = {
  search: '',
  category: null,
  dateRange: null,
  priceMax: null,
  location: null,
  isFree: false,
  isOnline: false,
};

/**
 * Get the minimum ticket price for an event
 * Returns 0 if no ticket types exist
 */
export function getMinTicketPrice(event: Event): number {
  if (!event.ticketTypes || event.ticketTypes.length === 0) {
    return 0;
  }
  return Math.min(...event.ticketTypes.map(t => t.price));
}

/**
 * Check if an event is free (minimum ticket price is $0)
 * Validates: Requirement 3.6
 */
export function isEventFree(event: Event): boolean {
  return getMinTicketPrice(event) === 0;
}

/**
 * Get the start of today (midnight)
 */
export function getStartOfDay(date: Date = new Date()): Date {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  return start;
}

/**
 * Get the end of today (23:59:59.999)
 */
export function getEndOfDay(date: Date = new Date()): Date {
  const end = new Date(date);
  end.setHours(23, 59, 59, 999);
  return end;
}

/**
 * Get the start of the current week (Sunday)
 */
export function getStartOfWeek(date: Date = new Date()): Date {
  const start = new Date(date);
  const day = start.getDay();
  start.setDate(start.getDate() - day);
  start.setHours(0, 0, 0, 0);
  return start;
}

/**
 * Get the end of the current week (Saturday 23:59:59.999)
 */
export function getEndOfWeek(date: Date = new Date()): Date {
  const end = new Date(date);
  const day = end.getDay();
  end.setDate(end.getDate() + (6 - day));
  end.setHours(23, 59, 59, 999);
  return end;
}

/**
 * Get the Saturday of the current week
 */
export function getSaturdayOfWeek(date: Date = new Date()): Date {
  const saturday = new Date(date);
  const day = saturday.getDay();
  saturday.setDate(saturday.getDate() + (6 - day));
  saturday.setHours(0, 0, 0, 0);
  return saturday;
}

/**
 * Get the Sunday of the current week
 */
export function getSundayOfWeek(date: Date = new Date()): Date {
  const sunday = new Date(date);
  const day = sunday.getDay();
  sunday.setDate(sunday.getDate() - day);
  sunday.setHours(0, 0, 0, 0);
  return sunday;
}

/**
 * Get the start of the current month
 */
export function getStartOfMonth(date: Date = new Date()): Date {
  const start = new Date(date);
  start.setDate(1);
  start.setHours(0, 0, 0, 0);
  return start;
}

/**
 * Get the end of the current month
 */
export function getEndOfMonth(date: Date = new Date()): Date {
  const end = new Date(date);
  end.setMonth(end.getMonth() + 1);
  end.setDate(0);
  end.setHours(23, 59, 59, 999);
  return end;
}

/**
 * Check if a date falls on a weekend (Saturday or Sunday)
 * Validates: Requirement 3.5
 */
export function isWeekend(date: Date): boolean {
  const day = date.getDay();
  return day === 0 || day === 6; // Sunday = 0, Saturday = 6
}

/**
 * Check if two dates are on the same day
 */
export function isSameDay(date1: Date, date2: Date): boolean {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
}

/**
 * Check if a date is within a range (inclusive)
 */
export function isDateInRange(date: Date, start: Date, end: Date): boolean {
  const timestamp = date.getTime();
  return timestamp >= start.getTime() && timestamp <= end.getTime();
}

/**
 * Filter events by date range
 * Validates: Requirements 3.4, 3.5
 * 
 * @param events - Array of events to filter
 * @param dateRange - Date range filter option
 * @param referenceDate - Reference date for calculations (defaults to now, useful for testing)
 * @returns Filtered array of events
 */
export function filterEventsByDate(
  events: Event[],
  dateRange: EventFilters['dateRange'],
  referenceDate: Date = new Date()
): Event[] {
  if (!dateRange) {
    return events;
  }

  return events.filter(event => {
    const eventDate = new Date(event.date);

    switch (dateRange) {
      case 'today':
        // Requirement 3.4: Show only events occurring on the current date
        return isSameDay(eventDate, referenceDate);

      case 'tomorrow': {
        const tomorrow = new Date(referenceDate);
        tomorrow.setDate(tomorrow.getDate() + 1);
        return isSameDay(eventDate, tomorrow);
      }

      case 'this-week': {
        const startOfWeek = getStartOfWeek(referenceDate);
        const endOfWeek = getEndOfWeek(referenceDate);
        return isDateInRange(eventDate, startOfWeek, endOfWeek);
      }

      case 'this-weekend': {
        // Requirement 3.5: Show only events occurring on Saturday or Sunday of the current week
        const saturday = getSaturdayOfWeek(referenceDate);
        const sundayEnd = new Date(getSundayOfWeek(referenceDate));
        
        // If today is after Sunday, get next weekend
        // Otherwise, get this weekend's Saturday and Sunday
        const weekStart = getStartOfWeek(referenceDate);
        const weekEnd = getEndOfWeek(referenceDate);
        
        // Check if event is on Saturday or Sunday of the current week
        if (!isDateInRange(eventDate, weekStart, weekEnd)) {
          return false;
        }
        
        return isWeekend(eventDate);
      }

      case 'this-month': {
        const startOfMonth = getStartOfMonth(referenceDate);
        const endOfMonth = getEndOfMonth(referenceDate);
        return isDateInRange(eventDate, startOfMonth, endOfMonth);
      }

      default:
        return true;
    }
  });
}

/**
 * Filter events by maximum price
 * Validates: Requirement 7.4
 * 
 * @param events - Array of events to filter
 * @param maxPrice - Maximum price threshold (null means no filter)
 * @returns Filtered array of events with minimum ticket price at or below threshold
 */
export function filterEventsByPrice(
  events: Event[],
  maxPrice: number | null
): Event[] {
  if (maxPrice === null) {
    return events;
  }

  // Requirement 7.4: Include only events with minimum ticket price at or below the threshold
  return events.filter(event => getMinTicketPrice(event) <= maxPrice);
}

/**
 * Filter events to show only free events
 * Validates: Requirement 3.6
 * 
 * @param events - Array of events to filter
 * @param isFree - Whether to filter for free events only
 * @returns Filtered array of events
 */
export function filterEventsByFree(
  events: Event[],
  isFree: boolean
): Event[] {
  if (!isFree) {
    return events;
  }

  // Requirement 3.6: Show only events with $0 minimum ticket price
  return events.filter(event => isEventFree(event));
}

/**
 * Filter events by category
 * 
 * @param events - Array of events to filter
 * @param category - Category to filter by (null means no filter)
 * @returns Filtered array of events matching the category
 */
export function filterEventsByCategory(
  events: Event[],
  category: string | null
): Event[] {
  if (!category) {
    return events;
  }

  return events.filter(event => 
    event.category.toLowerCase() === category.toLowerCase()
  );
}

/**
 * Filter events by location
 * 
 * @param events - Array of events to filter
 * @param location - Location to filter by (null means no filter)
 * @returns Filtered array of events matching the location
 */
export function filterEventsByLocation(
  events: Event[],
  location: string | null
): Event[] {
  if (!location) {
    return events;
  }

  return events.filter(event => 
    event.location.toLowerCase().includes(location.toLowerCase())
  );
}

/**
 * Filter events by online status
 * 
 * @param events - Array of events to filter
 * @param isOnline - Whether to filter for online events only
 * @returns Filtered array of events
 */
export function filterEventsByOnline(
  events: Event[],
  isOnline: boolean
): Event[] {
  if (!isOnline) {
    return events;
  }

  return events.filter(event => 
    event.location.toLowerCase().includes('online') ||
    event.location.toLowerCase().includes('virtual')
  );
}

/**
 * Filter events by search query
 * Searches in event name, description, location, and category
 * 
 * @param events - Array of events to filter
 * @param searchQuery - Search query string
 * @returns Filtered array of events matching the search query
 */
export function filterEventsBySearch(
  events: Event[],
  searchQuery: string
): Event[] {
  if (!searchQuery || searchQuery.trim() === '') {
    return events;
  }

  const query = searchQuery.toLowerCase().trim();

  return events.filter(event => {
    const searchableFields = [
      event.name,
      event.description,
      event.location,
      event.category,
    ].map(field => field.toLowerCase());

    return searchableFields.some(field => field.includes(query));
  });
}

/**
 * Apply all filters to events
 * Combines multiple filter criteria with AND logic
 * Validates: Requirements 3.2, 3.4, 3.5, 3.6, 7.4
 * 
 * @param events - Array of events to filter
 * @param filters - Filter criteria to apply
 * @param referenceDate - Reference date for date calculations (useful for testing)
 * @returns Filtered array of events matching ALL active filter conditions
 */
export function filterEvents(
  events: Event[],
  filters: Partial<EventFilters>,
  referenceDate: Date = new Date()
): Event[] {
  let result = [...events];

  // Apply search filter
  if (filters.search) {
    result = filterEventsBySearch(result, filters.search);
  }

  // Apply category filter
  if (filters.category) {
    result = filterEventsByCategory(result, filters.category);
  }

  // Apply date range filter
  if (filters.dateRange) {
    result = filterEventsByDate(result, filters.dateRange, referenceDate);
  }

  // Apply price max filter
  if (filters.priceMax !== undefined && filters.priceMax !== null) {
    result = filterEventsByPrice(result, filters.priceMax);
  }

  // Apply location filter
  if (filters.location) {
    result = filterEventsByLocation(result, filters.location);
  }

  // Apply free filter
  if (filters.isFree) {
    result = filterEventsByFree(result, filters.isFree);
  }

  // Apply online filter
  if (filters.isOnline) {
    result = filterEventsByOnline(result, filters.isOnline);
  }

  return result;
}

/**
 * Count active filters
 * 
 * @param filters - Current filter state
 * @returns Number of active filters
 */
export function countActiveFilters(filters: Partial<EventFilters>): number {
  let count = 0;

  if (filters.search && filters.search.trim() !== '') count++;
  if (filters.category) count++;
  if (filters.dateRange) count++;
  if (filters.priceMax !== undefined && filters.priceMax !== null) count++;
  if (filters.location) count++;
  if (filters.isFree) count++;
  if (filters.isOnline) count++;

  return count;
}

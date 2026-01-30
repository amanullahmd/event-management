/**
 * Unit tests for event filter utility functions
 * 
 * Tests filtering capabilities for events based on:
 * - Date range (today, tomorrow, this-week, this-weekend, this-month)
 * - Price (max price threshold, free events)
 * - Category
 * - Location
 * - Search text
 * - Combined filters
 * 
 * Validates: Requirements 3.4, 3.5, 3.6, 7.4
 */

import { Event, TicketType } from '../../types/event';
import {
  EventFilters,
  defaultFilters,
  getMinTicketPrice,
  isEventFree,
  getStartOfDay,
  getEndOfDay,
  getStartOfWeek,
  getEndOfWeek,
  getSaturdayOfWeek,
  getSundayOfWeek,
  getStartOfMonth,
  getEndOfMonth,
  isWeekend,
  isSameDay,
  isDateInRange,
  filterEventsByDate,
  filterEventsByPrice,
  filterEventsByFree,
  filterEventsByCategory,
  filterEventsByLocation,
  filterEventsByOnline,
  filterEventsBySearch,
  filterEvents,
  countActiveFilters,
} from '../eventFilters';

// Helper function to create a mock event
function createMockEvent(overrides: Partial<Event> = {}): Event {
  return {
    id: 'event-1',
    name: 'Test Event',
    description: 'A test event description',
    organizerId: 'org-1',
    date: new Date('2024-06-15T18:00:00'),
    location: 'New York, NY',
    category: 'Music',
    image: '/images/event.jpg',
    status: 'active',
    ticketTypes: [
      {
        id: 'ticket-1',
        eventId: 'event-1',
        name: 'General Admission',
        price: 25,
        quantity: 100,
        sold: 50,
        type: 'regular',
      },
    ],
    totalAttendees: 50,
    createdAt: new Date('2024-01-01'),
    ...overrides,
  };
}

// Helper function to create a mock ticket type
function createMockTicketType(overrides: Partial<TicketType> = {}): TicketType {
  return {
    id: 'ticket-1',
    eventId: 'event-1',
    name: 'General Admission',
    price: 25,
    quantity: 100,
    sold: 50,
    type: 'regular',
    ...overrides,
  };
}

describe('Event Filter Utilities', () => {
  describe('getMinTicketPrice', () => {
    test('returns minimum price from multiple ticket types', () => {
      const event = createMockEvent({
        ticketTypes: [
          createMockTicketType({ price: 50 }),
          createMockTicketType({ price: 25 }),
          createMockTicketType({ price: 100 }),
        ],
      });
      expect(getMinTicketPrice(event)).toBe(25);
    });

    test('returns 0 for event with no ticket types', () => {
      const event = createMockEvent({ ticketTypes: [] });
      expect(getMinTicketPrice(event)).toBe(0);
    });

    test('returns single ticket price when only one type exists', () => {
      const event = createMockEvent({
        ticketTypes: [createMockTicketType({ price: 75 })],
      });
      expect(getMinTicketPrice(event)).toBe(75);
    });

    test('returns 0 when ticket type has price 0', () => {
      const event = createMockEvent({
        ticketTypes: [
          createMockTicketType({ price: 0 }),
          createMockTicketType({ price: 50 }),
        ],
      });
      expect(getMinTicketPrice(event)).toBe(0);
    });
  });

  describe('isEventFree', () => {
    test('returns true for event with $0 minimum ticket price', () => {
      const event = createMockEvent({
        ticketTypes: [createMockTicketType({ price: 0 })],
      });
      expect(isEventFree(event)).toBe(true);
    });

    test('returns false for event with non-zero minimum ticket price', () => {
      const event = createMockEvent({
        ticketTypes: [createMockTicketType({ price: 25 })],
      });
      expect(isEventFree(event)).toBe(false);
    });

    test('returns true for event with no ticket types', () => {
      const event = createMockEvent({ ticketTypes: [] });
      expect(isEventFree(event)).toBe(true);
    });
  });

  describe('Date Helper Functions', () => {
    const referenceDate = new Date('2024-06-15T14:30:00'); // Saturday

    describe('getStartOfDay', () => {
      test('returns midnight of the given date', () => {
        const result = getStartOfDay(referenceDate);
        expect(result.getHours()).toBe(0);
        expect(result.getMinutes()).toBe(0);
        expect(result.getSeconds()).toBe(0);
        expect(result.getMilliseconds()).toBe(0);
        expect(result.getDate()).toBe(15);
      });
    });

    describe('getEndOfDay', () => {
      test('returns end of day (23:59:59.999)', () => {
        const result = getEndOfDay(referenceDate);
        expect(result.getHours()).toBe(23);
        expect(result.getMinutes()).toBe(59);
        expect(result.getSeconds()).toBe(59);
        expect(result.getMilliseconds()).toBe(999);
        expect(result.getDate()).toBe(15);
      });
    });

    describe('getStartOfWeek', () => {
      test('returns Sunday of the current week', () => {
        const result = getStartOfWeek(referenceDate);
        expect(result.getDay()).toBe(0); // Sunday
        expect(result.getDate()).toBe(9); // June 9, 2024
      });
    });

    describe('getEndOfWeek', () => {
      test('returns Saturday end of the current week', () => {
        const result = getEndOfWeek(referenceDate);
        expect(result.getDay()).toBe(6); // Saturday
        expect(result.getDate()).toBe(15); // June 15, 2024
      });
    });

    describe('getSaturdayOfWeek', () => {
      test('returns Saturday of the current week', () => {
        const result = getSaturdayOfWeek(referenceDate);
        expect(result.getDay()).toBe(6);
        expect(result.getDate()).toBe(15);
      });
    });

    describe('getSundayOfWeek', () => {
      test('returns Sunday of the current week', () => {
        const result = getSundayOfWeek(referenceDate);
        expect(result.getDay()).toBe(0);
        expect(result.getDate()).toBe(9);
      });
    });

    describe('getStartOfMonth', () => {
      test('returns first day of the month', () => {
        const result = getStartOfMonth(referenceDate);
        expect(result.getDate()).toBe(1);
        expect(result.getMonth()).toBe(5); // June
      });
    });

    describe('getEndOfMonth', () => {
      test('returns last day of the month', () => {
        const result = getEndOfMonth(referenceDate);
        expect(result.getDate()).toBe(30); // June has 30 days
        expect(result.getMonth()).toBe(5); // June
      });
    });

    describe('isWeekend', () => {
      test('returns true for Saturday', () => {
        const saturday = new Date('2024-06-15'); // Saturday
        expect(isWeekend(saturday)).toBe(true);
      });

      test('returns true for Sunday', () => {
        const sunday = new Date('2024-06-16'); // Sunday
        expect(isWeekend(sunday)).toBe(true);
      });

      test('returns false for weekdays', () => {
        const monday = new Date('2024-06-10'); // Monday
        const wednesday = new Date('2024-06-12'); // Wednesday
        const friday = new Date('2024-06-14'); // Friday
        expect(isWeekend(monday)).toBe(false);
        expect(isWeekend(wednesday)).toBe(false);
        expect(isWeekend(friday)).toBe(false);
      });
    });

    describe('isSameDay', () => {
      test('returns true for same day', () => {
        const date1 = new Date('2024-06-15T10:00:00');
        const date2 = new Date('2024-06-15T20:00:00');
        expect(isSameDay(date1, date2)).toBe(true);
      });

      test('returns false for different days', () => {
        const date1 = new Date('2024-06-15');
        const date2 = new Date('2024-06-16');
        expect(isSameDay(date1, date2)).toBe(false);
      });
    });

    describe('isDateInRange', () => {
      test('returns true for date within range', () => {
        const date = new Date('2024-06-15');
        const start = new Date('2024-06-10');
        const end = new Date('2024-06-20');
        expect(isDateInRange(date, start, end)).toBe(true);
      });

      test('returns true for date at start of range', () => {
        const date = new Date('2024-06-10T00:00:00');
        const start = new Date('2024-06-10T00:00:00');
        const end = new Date('2024-06-20');
        expect(isDateInRange(date, start, end)).toBe(true);
      });

      test('returns true for date at end of range', () => {
        const date = new Date('2024-06-20T23:59:59');
        const start = new Date('2024-06-10');
        const end = new Date('2024-06-20T23:59:59');
        expect(isDateInRange(date, start, end)).toBe(true);
      });

      test('returns false for date outside range', () => {
        const date = new Date('2024-06-25');
        const start = new Date('2024-06-10');
        const end = new Date('2024-06-20');
        expect(isDateInRange(date, start, end)).toBe(false);
      });
    });
  });

  describe('filterEventsByDate', () => {
    const referenceDate = new Date('2024-06-12T12:00:00'); // Wednesday, June 12, 2024

    const events: Event[] = [
      createMockEvent({ id: '1', date: new Date('2024-06-12T18:00:00') }), // Today (Wednesday)
      createMockEvent({ id: '2', date: new Date('2024-06-13T18:00:00') }), // Tomorrow (Thursday)
      createMockEvent({ id: '3', date: new Date('2024-06-15T18:00:00') }), // Saturday
      createMockEvent({ id: '4', date: new Date('2024-06-16T18:00:00') }), // Sunday
      createMockEvent({ id: '5', date: new Date('2024-06-20T18:00:00') }), // Next week
      createMockEvent({ id: '6', date: new Date('2024-06-25T18:00:00') }), // Later this month
      createMockEvent({ id: '7', date: new Date('2024-07-05T18:00:00') }), // Next month
    ];

    test('returns all events when dateRange is null', () => {
      const result = filterEventsByDate(events, null, referenceDate);
      expect(result).toHaveLength(7);
    });

    test('filters events for "today" - Requirement 3.4', () => {
      const result = filterEventsByDate(events, 'today', referenceDate);
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('1');
    });

    test('filters events for "tomorrow"', () => {
      const result = filterEventsByDate(events, 'tomorrow', referenceDate);
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('2');
    });

    test('filters events for "this-week"', () => {
      // Week of June 9-15, 2024 (Sunday to Saturday)
      const result = filterEventsByDate(events, 'this-week', referenceDate);
      expect(result).toHaveLength(3); // June 12, 13, 15
      expect(result.map(e => e.id)).toEqual(['1', '2', '3']);
    });

    test('filters events for "this-weekend" - Requirement 3.5', () => {
      // Saturday June 15 and Sunday June 16
      const result = filterEventsByDate(events, 'this-weekend', referenceDate);
      expect(result).toHaveLength(1); // Only Saturday June 15 is in this week
      expect(result[0].id).toBe('3');
    });

    test('filters events for "this-month"', () => {
      const result = filterEventsByDate(events, 'this-month', referenceDate);
      expect(result).toHaveLength(6); // All June events
      expect(result.map(e => e.id)).toEqual(['1', '2', '3', '4', '5', '6']);
    });

    test('returns empty array when no events match', () => {
      const futureEvents = [
        createMockEvent({ id: '1', date: new Date('2025-01-01') }),
      ];
      const result = filterEventsByDate(futureEvents, 'today', referenceDate);
      expect(result).toHaveLength(0);
    });
  });

  describe('filterEventsByPrice', () => {
    const events: Event[] = [
      createMockEvent({
        id: '1',
        ticketTypes: [createMockTicketType({ price: 0 })],
      }),
      createMockEvent({
        id: '2',
        ticketTypes: [createMockTicketType({ price: 15 })],
      }),
      createMockEvent({
        id: '3',
        ticketTypes: [createMockTicketType({ price: 25 })],
      }),
      createMockEvent({
        id: '4',
        ticketTypes: [createMockTicketType({ price: 50 })],
      }),
      createMockEvent({
        id: '5',
        ticketTypes: [createMockTicketType({ price: 100 })],
      }),
    ];

    test('returns all events when maxPrice is null', () => {
      const result = filterEventsByPrice(events, null);
      expect(result).toHaveLength(5);
    });

    test('filters events at or below max price - Requirement 7.4', () => {
      const result = filterEventsByPrice(events, 25);
      expect(result).toHaveLength(3);
      expect(result.map(e => e.id)).toEqual(['1', '2', '3']);
    });

    test('includes events with exact max price', () => {
      const result = filterEventsByPrice(events, 50);
      expect(result).toHaveLength(4);
      expect(result.map(e => e.id)).toEqual(['1', '2', '3', '4']);
    });

    test('returns only free events when maxPrice is 0', () => {
      const result = filterEventsByPrice(events, 0);
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('1');
    });

    test('returns all events when maxPrice is very high', () => {
      const result = filterEventsByPrice(events, 1000);
      expect(result).toHaveLength(5);
    });
  });

  describe('filterEventsByFree', () => {
    const events: Event[] = [
      createMockEvent({
        id: '1',
        ticketTypes: [createMockTicketType({ price: 0 })],
      }),
      createMockEvent({
        id: '2',
        ticketTypes: [createMockTicketType({ price: 25 })],
      }),
      createMockEvent({
        id: '3',
        ticketTypes: [
          createMockTicketType({ price: 0 }),
          createMockTicketType({ price: 50 }),
        ],
      }),
    ];

    test('returns all events when isFree is false', () => {
      const result = filterEventsByFree(events, false);
      expect(result).toHaveLength(3);
    });

    test('filters only free events when isFree is true - Requirement 3.6', () => {
      const result = filterEventsByFree(events, true);
      expect(result).toHaveLength(2);
      expect(result.map(e => e.id)).toEqual(['1', '3']);
    });
  });

  describe('filterEventsByCategory', () => {
    const events: Event[] = [
      createMockEvent({ id: '1', category: 'Music' }),
      createMockEvent({ id: '2', category: 'Food & Drink' }),
      createMockEvent({ id: '3', category: 'Tech' }),
      createMockEvent({ id: '4', category: 'Music' }),
    ];

    test('returns all events when category is null', () => {
      const result = filterEventsByCategory(events, null);
      expect(result).toHaveLength(4);
    });

    test('filters events by category (case-insensitive)', () => {
      const result = filterEventsByCategory(events, 'music');
      expect(result).toHaveLength(2);
      expect(result.map(e => e.id)).toEqual(['1', '4']);
    });

    test('filters events by category with exact match', () => {
      const result = filterEventsByCategory(events, 'Food & Drink');
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('2');
    });

    test('returns empty array when no events match category', () => {
      const result = filterEventsByCategory(events, 'Sports');
      expect(result).toHaveLength(0);
    });
  });

  describe('filterEventsByLocation', () => {
    const events: Event[] = [
      createMockEvent({ id: '1', location: 'New York, NY' }),
      createMockEvent({ id: '2', location: 'Los Angeles, CA' }),
      createMockEvent({ id: '3', location: 'New York City' }),
      createMockEvent({ id: '4', location: 'Online' }),
    ];

    test('returns all events when location is null', () => {
      const result = filterEventsByLocation(events, null);
      expect(result).toHaveLength(4);
    });

    test('filters events by location (partial match, case-insensitive)', () => {
      const result = filterEventsByLocation(events, 'new york');
      expect(result).toHaveLength(2);
      expect(result.map(e => e.id)).toEqual(['1', '3']);
    });

    test('filters events by exact location', () => {
      const result = filterEventsByLocation(events, 'Los Angeles');
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('2');
    });

    test('returns empty array when no events match location', () => {
      const result = filterEventsByLocation(events, 'Chicago');
      expect(result).toHaveLength(0);
    });
  });

  describe('filterEventsByOnline', () => {
    const events: Event[] = [
      createMockEvent({ id: '1', location: 'New York, NY' }),
      createMockEvent({ id: '2', location: 'Online' }),
      createMockEvent({ id: '3', location: 'Virtual Event' }),
      createMockEvent({ id: '4', location: 'Online Webinar' }),
    ];

    test('returns all events when isOnline is false', () => {
      const result = filterEventsByOnline(events, false);
      expect(result).toHaveLength(4);
    });

    test('filters only online/virtual events when isOnline is true', () => {
      const result = filterEventsByOnline(events, true);
      expect(result).toHaveLength(3);
      expect(result.map(e => e.id)).toEqual(['2', '3', '4']);
    });
  });

  describe('filterEventsBySearch', () => {
    const events: Event[] = [
      createMockEvent({
        id: '1',
        name: 'Summer Music Festival',
        description: 'A great outdoor concert',
        category: 'Music',
        location: 'Central Park, NY',
      }),
      createMockEvent({
        id: '2',
        name: 'Tech Conference 2024',
        description: 'Learn about AI and machine learning',
        category: 'Tech',
        location: 'San Francisco, CA',
      }),
      createMockEvent({
        id: '3',
        name: 'Food & Wine Tasting',
        description: 'Sample local wines and cuisine',
        category: 'Food & Drink',
        location: 'Napa Valley, CA',
      }),
    ];

    test('returns all events when search query is empty', () => {
      const result = filterEventsBySearch(events, '');
      expect(result).toHaveLength(3);
    });

    test('returns all events when search query is whitespace', () => {
      const result = filterEventsBySearch(events, '   ');
      expect(result).toHaveLength(3);
    });

    test('searches in event name', () => {
      const result = filterEventsBySearch(events, 'music');
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('1');
    });

    test('searches in event description', () => {
      const result = filterEventsBySearch(events, 'machine learning');
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('2');
    });

    test('searches in event location', () => {
      const result = filterEventsBySearch(events, 'San Francisco');
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('2');
    });

    test('searches in event category', () => {
      const result = filterEventsBySearch(events, 'tech');
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('2');
    });

    test('search is case-insensitive', () => {
      const result = filterEventsBySearch(events, 'SUMMER');
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('1');
    });

    test('returns multiple matches', () => {
      const result = filterEventsBySearch(events, 'CA');
      expect(result).toHaveLength(2);
      expect(result.map(e => e.id)).toEqual(['2', '3']);
    });
  });

  describe('filterEvents (combined filters)', () => {
    const referenceDate = new Date('2024-06-12T12:00:00'); // Wednesday

    const events: Event[] = [
      createMockEvent({
        id: '1',
        name: 'Free Music Festival',
        date: new Date('2024-06-12T18:00:00'), // Today
        location: 'New York, NY',
        category: 'Music',
        ticketTypes: [createMockTicketType({ price: 0 })],
      }),
      createMockEvent({
        id: '2',
        name: 'Tech Conference',
        date: new Date('2024-06-15T18:00:00'), // Saturday
        location: 'New York, NY',
        category: 'Tech',
        ticketTypes: [createMockTicketType({ price: 50 })],
      }),
      createMockEvent({
        id: '3',
        name: 'Wine Tasting',
        date: new Date('2024-06-12T18:00:00'), // Today
        location: 'Los Angeles, CA',
        category: 'Food & Drink',
        ticketTypes: [createMockTicketType({ price: 25 })],
      }),
      createMockEvent({
        id: '4',
        name: 'Online Webinar',
        date: new Date('2024-06-12T18:00:00'), // Today
        location: 'Online',
        category: 'Tech',
        ticketTypes: [createMockTicketType({ price: 0 })],
      }),
    ];

    test('returns all events with empty filters', () => {
      const result = filterEvents(events, {}, referenceDate);
      expect(result).toHaveLength(4);
    });

    test('applies single filter', () => {
      const result = filterEvents(events, { category: 'Music' }, referenceDate);
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('1');
    });

    test('combines multiple filters with AND logic', () => {
      const result = filterEvents(
        events,
        {
          dateRange: 'today',
          location: 'New York',
        },
        referenceDate
      );
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('1');
    });

    test('combines search with other filters', () => {
      const result = filterEvents(
        events,
        {
          search: 'tech',
          isFree: true,
        },
        referenceDate
      );
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('4');
    });

    test('combines price and date filters', () => {
      const result = filterEvents(
        events,
        {
          dateRange: 'today',
          priceMax: 25,
        },
        referenceDate
      );
      expect(result).toHaveLength(3);
      expect(result.map(e => e.id)).toEqual(['1', '3', '4']);
    });

    test('returns empty array when no events match all filters', () => {
      const result = filterEvents(
        events,
        {
          category: 'Music',
          location: 'Los Angeles',
        },
        referenceDate
      );
      expect(result).toHaveLength(0);
    });

    test('applies all filters together', () => {
      const result = filterEvents(
        events,
        {
          search: 'webinar',
          category: 'Tech',
          dateRange: 'today',
          isFree: true,
          isOnline: true,
        },
        referenceDate
      );
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('4');
    });
  });

  describe('countActiveFilters', () => {
    test('returns 0 for default filters', () => {
      expect(countActiveFilters(defaultFilters)).toBe(0);
    });

    test('counts search filter', () => {
      expect(countActiveFilters({ search: 'test' })).toBe(1);
    });

    test('ignores empty search', () => {
      expect(countActiveFilters({ search: '' })).toBe(0);
      expect(countActiveFilters({ search: '   ' })).toBe(0);
    });

    test('counts category filter', () => {
      expect(countActiveFilters({ category: 'Music' })).toBe(1);
    });

    test('counts dateRange filter', () => {
      expect(countActiveFilters({ dateRange: 'today' })).toBe(1);
    });

    test('counts priceMax filter', () => {
      expect(countActiveFilters({ priceMax: 25 })).toBe(1);
    });

    test('counts location filter', () => {
      expect(countActiveFilters({ location: 'New York' })).toBe(1);
    });

    test('counts isFree filter', () => {
      expect(countActiveFilters({ isFree: true })).toBe(1);
    });

    test('counts isOnline filter', () => {
      expect(countActiveFilters({ isOnline: true })).toBe(1);
    });

    test('counts multiple active filters', () => {
      expect(
        countActiveFilters({
          search: 'test',
          category: 'Music',
          dateRange: 'today',
          priceMax: 25,
          location: 'New York',
          isFree: true,
          isOnline: true,
        })
      ).toBe(7);
    });
  });

  describe('defaultFilters', () => {
    test('has correct default values', () => {
      expect(defaultFilters.search).toBe('');
      expect(defaultFilters.category).toBeNull();
      expect(defaultFilters.dateRange).toBeNull();
      expect(defaultFilters.priceMax).toBeNull();
      expect(defaultFilters.location).toBeNull();
      expect(defaultFilters.isFree).toBe(false);
      expect(defaultFilters.isOnline).toBe(false);
    });
  });
});

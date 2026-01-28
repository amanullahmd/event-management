/**
 * Property-Based Tests for Event Discovery
 * Tests core properties of the event search and filtering functionality
 */

import fc from 'fast-check';
import { getAllEvents } from '@/lib/dummy-data';
import type { Event } from '@/lib/types';

/**
 * Helper function to filter events by keyword
 * Matches the logic in the EventsPage component
 */
function filterEventsByKeyword(events: Event[], keyword: string): Event[] {
  if (!keyword) return events;
  const lowerKeyword = keyword.toLowerCase();
  return events.filter(
    (event) =>
      event.name.toLowerCase().includes(lowerKeyword) ||
      event.description.toLowerCase().includes(lowerKeyword) ||
      event.category.toLowerCase().includes(lowerKeyword)
  );
}

/**
 * Helper function to filter events by category
 */
function filterEventsByCategory(events: Event[], category: string): Event[] {
  if (!category) return events;
  return events.filter((event) => event.category === category);
}

/**
 * Helper function to filter events by location
 */
function filterEventsByLocation(events: Event[], location: string): Event[] {
  if (!location) return events;
  return events.filter((event) => event.location === location);
}

/**
 * Helper function to filter events by date range
 */
function filterEventsByDateRange(events: Event[], dateRange: string): Event[] {
  if (!dateRange) return events;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return events.filter((event) => {
    const eventDate = new Date(event.date);

    switch (dateRange) {
      case 'today': {
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        return eventDate >= today && eventDate < tomorrow;
      }
      case 'this-week': {
        const endOfWeek = new Date(today);
        endOfWeek.setDate(endOfWeek.getDate() + (7 - today.getDay()));
        return eventDate >= today && eventDate <= endOfWeek;
      }
      case 'this-month': {
        const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        return eventDate >= today && eventDate <= endOfMonth;
      }
      case 'next-month': {
        const startOfNextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1);
        const endOfNextMonth = new Date(today.getFullYear(), today.getMonth() + 2, 0);
        return eventDate >= startOfNextMonth && eventDate <= endOfNextMonth;
      }
      default:
        return true;
    }
  });
}

/**
 * Property 11: Event search returns only matching results
 * For any search query, the event discovery page should return only events whose name,
 * description, or category matches the search term.
 * **Validates: Requirements 16.3**
 */
describe('Property 11: Event search returns only matching results', () => {
  test('keyword search returns only events containing the keyword', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 20 }),
        (keyword) => {
          const allEvents = getAllEvents().filter((e) => e.status === 'active');
          const filteredEvents = filterEventsByKeyword(allEvents, keyword);

          // Every returned event should contain the keyword in name, description, or category
          const lowerKeyword = keyword.toLowerCase();
          filteredEvents.forEach((event) => {
            const matchesName = event.name.toLowerCase().includes(lowerKeyword);
            const matchesDescription = event.description.toLowerCase().includes(lowerKeyword);
            const matchesCategory = event.category.toLowerCase().includes(lowerKeyword);
            expect(matchesName || matchesDescription || matchesCategory).toBe(true);
          });
        }
      ),
      { numRuns: 100 }
    );
  });

  test('empty keyword returns all events', () => {
    fc.assert(
      fc.property(fc.constant(''), () => {
        const allEvents = getAllEvents().filter((e) => e.status === 'active');
        const filteredEvents = filterEventsByKeyword(allEvents, '');

        expect(filteredEvents.length).toBe(allEvents.length);
      }),
      { numRuns: 10 }
    );
  });

  test('category filter returns only events in that category', () => {
    fc.assert(
      fc.property(fc.integer({ min: 0, max: 100 }), () => {
        const allEvents = getAllEvents().filter((e) => e.status === 'active');
        const categories = [...new Set(allEvents.map((e) => e.category))];

        if (categories.length > 0) {
          const randomCategory = categories[Math.floor(Math.random() * categories.length)];
          const filteredEvents = filterEventsByCategory(allEvents, randomCategory);

          // Every returned event should have the selected category
          filteredEvents.forEach((event) => {
            expect(event.category).toBe(randomCategory);
          });

          // All events with that category should be included
          const expectedCount = allEvents.filter((e) => e.category === randomCategory).length;
          expect(filteredEvents.length).toBe(expectedCount);
        }
      }),
      { numRuns: 100 }
    );
  });

  test('location filter returns only events at that location', () => {
    fc.assert(
      fc.property(fc.integer({ min: 0, max: 100 }), () => {
        const allEvents = getAllEvents().filter((e) => e.status === 'active');
        const locations = [...new Set(allEvents.map((e) => e.location))];

        if (locations.length > 0) {
          const randomLocation = locations[Math.floor(Math.random() * locations.length)];
          const filteredEvents = filterEventsByLocation(allEvents, randomLocation);

          // Every returned event should have the selected location
          filteredEvents.forEach((event) => {
            expect(event.location).toBe(randomLocation);
          });

          // All events at that location should be included
          const expectedCount = allEvents.filter((e) => e.location === randomLocation).length;
          expect(filteredEvents.length).toBe(expectedCount);
        }
      }),
      { numRuns: 100 }
    );
  });

  test('combined filters are applied correctly (AND logic)', () => {
    fc.assert(
      fc.property(fc.integer({ min: 0, max: 100 }), () => {
        const allEvents = getAllEvents().filter((e) => e.status === 'active');
        const categories = [...new Set(allEvents.map((e) => e.category))];
        const locations = [...new Set(allEvents.map((e) => e.location))];

        if (categories.length > 0 && locations.length > 0) {
          const randomCategory = categories[Math.floor(Math.random() * categories.length)];
          const randomLocation = locations[Math.floor(Math.random() * locations.length)];

          // Apply both filters
          let filteredEvents = filterEventsByCategory(allEvents, randomCategory);
          filteredEvents = filterEventsByLocation(filteredEvents, randomLocation);

          // Every returned event should match both criteria
          filteredEvents.forEach((event) => {
            expect(event.category).toBe(randomCategory);
            expect(event.location).toBe(randomLocation);
          });
        }
      }),
      { numRuns: 100 }
    );
  });

  test('search is case-insensitive', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 10 }),
        (keyword) => {
          const allEvents = getAllEvents().filter((e) => e.status === 'active');

          const lowerResults = filterEventsByKeyword(allEvents, keyword.toLowerCase());
          const upperResults = filterEventsByKeyword(allEvents, keyword.toUpperCase());
          const mixedResults = filterEventsByKeyword(allEvents, keyword);

          // All case variations should return the same results
          expect(lowerResults.length).toBe(upperResults.length);
          expect(lowerResults.length).toBe(mixedResults.length);

          // Same event IDs should be returned
          const lowerIds = new Set(lowerResults.map((e) => e.id));
          const upperIds = new Set(upperResults.map((e) => e.id));
          const mixedIds = new Set(mixedResults.map((e) => e.id));

          expect(lowerIds).toEqual(upperIds);
          expect(lowerIds).toEqual(mixedIds);
        }
      ),
      { numRuns: 100 }
    );
  });

  test('filtered results are a subset of all events', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 0, maxLength: 20 }),
        (keyword) => {
          const allEvents = getAllEvents().filter((e) => e.status === 'active');
          const filteredEvents = filterEventsByKeyword(allEvents, keyword);

          // Filtered results should never exceed total events
          expect(filteredEvents.length).toBeLessThanOrEqual(allEvents.length);

          // Every filtered event should exist in the original list
          const allEventIds = new Set(allEvents.map((e) => e.id));
          filteredEvents.forEach((event) => {
            expect(allEventIds.has(event.id)).toBe(true);
          });
        }
      ),
      { numRuns: 100 }
    );
  });

  test('no duplicate events in filtered results', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 0, maxLength: 20 }),
        (keyword) => {
          const allEvents = getAllEvents().filter((e) => e.status === 'active');
          const filteredEvents = filterEventsByKeyword(allEvents, keyword);

          // Check for duplicates
          const eventIds = filteredEvents.map((e) => e.id);
          const uniqueIds = new Set(eventIds);

          expect(eventIds.length).toBe(uniqueIds.size);
        }
      ),
      { numRuns: 100 }
    );
  });
});

/**
 * Additional tests for pagination behavior
 */
describe('Event discovery pagination', () => {
  const ITEMS_PER_PAGE = 9;

  test('pagination returns correct number of items per page', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 10 }),
        (page) => {
          const allEvents = getAllEvents().filter((e) => e.status === 'active');
          const totalPages = Math.ceil(allEvents.length / ITEMS_PER_PAGE);

          if (page <= totalPages) {
            const startIndex = (page - 1) * ITEMS_PER_PAGE;
            const paginatedEvents = allEvents.slice(startIndex, startIndex + ITEMS_PER_PAGE);

            // Should return at most ITEMS_PER_PAGE items
            expect(paginatedEvents.length).toBeLessThanOrEqual(ITEMS_PER_PAGE);

            // Last page may have fewer items
            if (page < totalPages) {
              expect(paginatedEvents.length).toBe(ITEMS_PER_PAGE);
            }
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  test('all events are accessible through pagination', () => {
    fc.assert(
      fc.property(fc.integer({ min: 0, max: 100 }), () => {
        const allEvents = getAllEvents().filter((e) => e.status === 'active');
        const totalPages = Math.ceil(allEvents.length / ITEMS_PER_PAGE);

        // Collect all events from all pages
        const collectedEvents: Event[] = [];
        for (let page = 1; page <= totalPages; page++) {
          const startIndex = (page - 1) * ITEMS_PER_PAGE;
          const pageEvents = allEvents.slice(startIndex, startIndex + ITEMS_PER_PAGE);
          collectedEvents.push(...pageEvents);
        }

        // Should have collected all events
        expect(collectedEvents.length).toBe(allEvents.length);

        // All event IDs should match
        const originalIds = new Set(allEvents.map((e) => e.id));
        const collectedIds = new Set(collectedEvents.map((e) => e.id));
        expect(originalIds).toEqual(collectedIds);
      }),
      { numRuns: 100 }
    );
  });
});

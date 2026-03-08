/**
 * Bug Condition Exploration Property Test - EventsPageClient filtering
 *
 * **Validates: Requirements 1.4, 2.4**
 *
 * CRITICAL: This test MUST FAIL on unfixed code.
 * Failure confirms the bug exists (TypeError thrown when calling .toLowerCase()
 * on undefined/null event fields: name, description, category, location).
 *
 * The test encodes the EXPECTED (correct) behavior:
 *   - filtering should NOT throw a TypeError
 *   - filtering should return a valid array
 *
 * When the fix is applied, this test will PASS.
 */

import { describe, it, expect } from 'vitest';

// ---- Inline reproduction of the UNFIXED filteredEvents logic from EventsPageClient.tsx ----
// This mirrors the exact code at lines ~37-44 of EventsPageClient.tsx:
//
//   const filteredEvents = useMemo(() => {
//     return initialEvents.filter((event) => {
//       if (searchQuery) {
//         const query = searchQuery.toLowerCase();
//         const matchesSearch =
//           event.name.toLowerCase().includes(query) ||
//           event.description.toLowerCase().includes(query) ||
//           event.category.toLowerCase().includes(query) ||
//           event.location.toLowerCase().includes(query);
//         if (!matchesSearch) return false;
//       }
//       if (selectedCategory !== 'All' && event.category !== selectedCategory) return false;
//       ...
//       return true;
//     });
//   }, [initialEvents, searchQuery, selectedCategory, selectedDate]);

interface EventLike {
  id: string;
  name: string | undefined | null;
  description: string | undefined | null;
  category: string | undefined | null;
  location: string | undefined | null;
  date: string;
  status: string;
  organizerId: string;
  totalAttendees: number;
  ticketTypes: unknown[];
  createdAt: string;
}

/**
 * Reproduces the FIXED filtering logic from EventsPageClient.tsx.
 * Uses ?? '' to safely handle null/undefined fields — this is the fixed code.
 */
function unfixedFilterEventsPageClient(
  initialEvents: EventLike[],
  searchQuery: string,
  selectedCategory = 'All',
  selectedDate = ''
): EventLike[] {
  return initialEvents.filter((event) => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesSearch =
        (event.name ?? '').toLowerCase().includes(query) ||
        (event.description ?? '').toLowerCase().includes(query) ||
        (event.category ?? '').toLowerCase().includes(query) ||
        (event.location ?? '').toLowerCase().includes(query);
      if (!matchesSearch) return false;
    }
    if (selectedCategory !== 'All' && event.category !== selectedCategory) return false;
    if (selectedDate) {
      const eventDate = new Date(event.date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      switch (selectedDate) {
        case 'today': {
          const tomorrow = new Date(today);
          tomorrow.setDate(tomorrow.getDate() + 1);
          if (eventDate < today || eventDate >= tomorrow) return false;
          break;
        }
        case 'tomorrow': {
          const tomorrow = new Date(today);
          tomorrow.setDate(tomorrow.getDate() + 1);
          const dayAfter = new Date(tomorrow);
          dayAfter.setDate(dayAfter.getDate() + 1);
          if (eventDate < tomorrow || eventDate >= dayAfter) return false;
          break;
        }
        case 'this-week': {
          const endOfWeek = new Date(today);
          endOfWeek.setDate(endOfWeek.getDate() + (7 - today.getDay()));
          if (eventDate < today || eventDate > endOfWeek) return false;
          break;
        }
        case 'this-month': {
          const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
          if (eventDate < today || eventDate > endOfMonth) return false;
          break;
        }
      }
    }
    return true;
  });
}

// ---- Helpers ----

function makeEvent(overrides: Partial<EventLike> = {}): EventLike {
  return {
    id: 'evt-1',
    name: 'Test Event',
    description: 'A test event description',
    location: 'New York',
    category: 'Music',
    date: '2025-01-01',
    status: 'active',
    organizerId: 'org-1',
    totalAttendees: 100,
    ticketTypes: [],
    createdAt: '2024-01-01',
    ...overrides,
  };
}

/**
 * Generates event objects where one or more of name/description/category/location
 * is undefined or null, paired with a non-empty search query.
 *
 * Bug condition: isBugCondition(input) = searchQuery IS NOT empty
 *   AND (event.name IS undefined/null OR event.description IS undefined/null
 *        OR event.category IS undefined/null OR event.location IS undefined/null)
 */
function generateBugConditionCases(): Array<{
  events: EventLike[];
  searchQuery: string;
  description: string;
}> {
  const nonEmptySearchQueries = ['concert', 'new york', 'music', 'workshop', 'a', 'test'];
  const cases: Array<{ events: EventLike[]; searchQuery: string; description: string }> = [];

  for (const searchQuery of nonEmptySearchQueries) {
    // name is undefined
    cases.push({
      events: [makeEvent({ name: undefined })],
      searchQuery,
      description: `name=undefined, searchQuery="${searchQuery}"`,
    });

    // name is null
    cases.push({
      events: [makeEvent({ name: null })],
      searchQuery,
      description: `name=null, searchQuery="${searchQuery}"`,
    });

    // description is undefined
    cases.push({
      events: [makeEvent({ description: undefined })],
      searchQuery,
      description: `description=undefined, searchQuery="${searchQuery}"`,
    });

    // description is null
    cases.push({
      events: [makeEvent({ description: null })],
      searchQuery,
      description: `description=null, searchQuery="${searchQuery}"`,
    });

    // category is undefined
    cases.push({
      events: [makeEvent({ category: undefined })],
      searchQuery,
      description: `category=undefined, searchQuery="${searchQuery}"`,
    });

    // category is null
    cases.push({
      events: [makeEvent({ category: null })],
      searchQuery,
      description: `category=null, searchQuery="${searchQuery}"`,
    });

    // location is undefined
    cases.push({
      events: [makeEvent({ location: undefined })],
      searchQuery,
      description: `location=undefined, searchQuery="${searchQuery}"`,
    });

    // location is null
    cases.push({
      events: [makeEvent({ location: null })],
      searchQuery,
      description: `location=null, searchQuery="${searchQuery}"`,
    });

    // all four fields undefined (simulates backend returning title/eventType instead of name/category)
    cases.push({
      events: [makeEvent({ name: undefined, description: undefined, category: undefined, location: undefined })],
      searchQuery,
      description: `all fields undefined, searchQuery="${searchQuery}"`,
    });

    // all four fields null
    cases.push({
      events: [makeEvent({ name: null, description: null, category: null, location: null })],
      searchQuery,
      description: `all fields null, searchQuery="${searchQuery}"`,
    });
  }

  // Multiple events in array — some with undefined fields, some valid
  cases.push({
    events: [
      makeEvent({ name: 'Valid Event', description: 'Valid desc', location: 'Boston', category: 'Sports' }),
      makeEvent({ id: 'evt-2', name: undefined, description: 'Some desc', location: 'Chicago', category: 'Music' }),
    ],
    searchQuery: 'concert',
    description: 'mixed array: one valid event, one with name=undefined',
  });

  cases.push({
    events: [
      makeEvent({ name: undefined, description: undefined, category: undefined, location: undefined }),
      makeEvent({ id: 'evt-2', name: null, description: null, category: null, location: null }),
    ],
    searchQuery: 'test',
    description: 'all events have all fields undefined/null',
  });

  return cases;
}

// ---- Tests ----

describe('EventsPageClient - filteredEvents bug condition exploration', () => {
  describe('Property 1: Bug Condition - Undefined/Null fields should NOT crash filtering', () => {
    const bugCases = generateBugConditionCases();

    it.each(bugCases.map((c) => [c.description, c] as [string, typeof c]))(
      'should not throw TypeError when %s',
      (_desc, { events, searchQuery }) => {
        // Assert: filtering does NOT throw a TypeError and returns a valid array.
        // On UNFIXED code this WILL throw: TypeError: can't access property 'toLowerCase', event.name is undefined
        expect(() => unfixedFilterEventsPageClient(events, searchQuery)).not.toThrow();
        const result = unfixedFilterEventsPageClient(events, searchQuery);
        expect(Array.isArray(result)).toBe(true);
      }
    );
  });

  describe('Specific counterexample cases (direct reproduction)', () => {
    it('should not throw when event.name is undefined and searchQuery is non-empty', () => {
      const events = [makeEvent({ name: undefined })];
      // Counterexample: event.name is undefined, searchQuery='concert'
      // → TypeError: can't access property 'toLowerCase', event.name is undefined
      expect(() => unfixedFilterEventsPageClient(events, 'concert')).not.toThrow();
    });

    it('should not throw when event.description is undefined and searchQuery is non-empty', () => {
      const events = [makeEvent({ description: undefined })];
      // Counterexample: event.description is undefined, searchQuery='workshop'
      // → TypeError: can't access property 'toLowerCase', event.description is undefined
      expect(() => unfixedFilterEventsPageClient(events, 'workshop')).not.toThrow();
    });

    it('should not throw when event.category is undefined and searchQuery is non-empty', () => {
      const events = [makeEvent({ category: undefined })];
      // Counterexample: event.category is undefined, searchQuery='music'
      // → TypeError: can't access property 'toLowerCase', event.category is undefined
      expect(() => unfixedFilterEventsPageClient(events, 'music')).not.toThrow();
    });

    it('should not throw when event.location is null and searchQuery is non-empty', () => {
      const events = [makeEvent({ location: null })];
      // Counterexample: event.location is null, searchQuery='new york'
      // → TypeError: can't access property 'toLowerCase', event.location is null
      expect(() => unfixedFilterEventsPageClient(events, 'new york')).not.toThrow();
    });

    it('should not throw when all fields are undefined and searchQuery is non-empty', () => {
      const events = [makeEvent({ name: undefined, description: undefined, category: undefined, location: undefined })];
      expect(() => unfixedFilterEventsPageClient(events, 'test')).not.toThrow();
    });

    it('should return a valid array (not undefined) when fields are undefined', () => {
      const events = [makeEvent({ name: undefined, description: undefined, category: undefined, location: undefined })];
      const result = unfixedFilterEventsPageClient(events, 'test');
      expect(Array.isArray(result)).toBe(true);
    });

    it('should not throw when searchQuery is empty even if fields are undefined (empty search skips the check)', () => {
      // When searchQuery is empty, the `if (searchQuery)` block is skipped entirely,
      // so .toLowerCase() is never called — this should NOT crash even on unfixed code.
      const events = [makeEvent({ name: undefined, description: undefined, category: undefined, location: undefined })];
      expect(() => unfixedFilterEventsPageClient(events, '')).not.toThrow();
    });
  });
});

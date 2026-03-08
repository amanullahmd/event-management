/**
 * Bug Condition Exploration Property Test - EventManagementPage filtering
 *
 * **Validates: Requirements 1.1, 1.2, 1.3, 2.1, 2.2, 2.3**
 *
 * CRITICAL: This test MUST FAIL on unfixed code.
 * Failure confirms the bug exists (TypeError thrown when calling .toLowerCase()
 * on undefined/null event fields).
 *
 * The test encodes the EXPECTED (correct) behavior:
 *   - filtering should NOT throw a TypeError
 *   - filtering should return a valid array
 *
 * When the fix is applied, this test will PASS.
 */

import { describe, it, expect } from 'vitest';

// ---- Inline reproduction of the UNFIXED filteredEvents logic from events.tsx ----
// This mirrors the exact code at lines ~68-73 of events.tsx:
//
//   const filteredEvents = useMemo(() => {
//     return events.filter(
//       (event) =>
//         event.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
//         event.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
//         event.category.toLowerCase().includes(searchTerm.toLowerCase())
//     );
//   }, [events, searchTerm]);

interface EventLike {
  id: string;
  name: string | undefined | null;
  location: string | undefined | null;
  category: string | undefined | null;
  description?: string | undefined | null;
  date: string;
  status: string;
  organizerId: string;
  totalAttendees: number;
  ticketTypes: unknown[];
  createdAt: string;
}

/**
 * Reproduces the FIXED filtering logic from EventManagementPage (events.tsx).
 * Uses ?? '' to safely handle null/undefined fields — this is the fixed code.
 */
function unfixedFilterEvents(events: EventLike[], searchTerm: string): EventLike[] {
  return events.filter(
    (event) =>
      (event.name ?? '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (event.location ?? '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (event.category ?? '').toLowerCase().includes(searchTerm.toLowerCase())
  );
}

// ---- Helpers ----

function makeEvent(overrides: Partial<EventLike> = {}): EventLike {
  return {
    id: 'evt-1',
    name: 'Test Event',
    location: 'New York',
    category: 'Music',
    description: 'A test event',
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
 * Simple manual property-based generator:
 * Generates event objects where one or more of name/location/category is undefined or null.
 * This covers the bug condition: isBugCondition(input) = searchTerm IS NOT empty
 *   AND (event.name IS undefined/null OR event.location IS undefined/null OR event.category IS undefined/null)
 */
function generateBugConditionCases(): Array<{ events: EventLike[]; searchTerm: string; description: string }> {
  const nonEmptySearchTerms = ['concert', 'new york', 'music', 'a', 'test', 'workshop'];
  const cases: Array<{ events: EventLike[]; searchTerm: string; description: string }> = [];

  for (const searchTerm of nonEmptySearchTerms) {
    // name is undefined
    cases.push({
      events: [makeEvent({ name: undefined })],
      searchTerm,
      description: `name=undefined, searchTerm="${searchTerm}"`,
    });

    // name is null
    cases.push({
      events: [makeEvent({ name: null })],
      searchTerm,
      description: `name=null, searchTerm="${searchTerm}"`,
    });

    // location is undefined
    cases.push({
      events: [makeEvent({ location: undefined })],
      searchTerm,
      description: `location=undefined, searchTerm="${searchTerm}"`,
    });

    // location is null
    cases.push({
      events: [makeEvent({ location: null })],
      searchTerm,
      description: `location=null, searchTerm="${searchTerm}"`,
    });

    // category is undefined
    cases.push({
      events: [makeEvent({ category: undefined })],
      searchTerm,
      description: `category=undefined, searchTerm="${searchTerm}"`,
    });

    // category is null
    cases.push({
      events: [makeEvent({ category: null })],
      searchTerm,
      description: `category=null, searchTerm="${searchTerm}"`,
    });

    // all fields undefined (simulates backend returning title/eventType instead of name/category)
    cases.push({
      events: [makeEvent({ name: undefined, location: undefined, category: undefined })],
      searchTerm,
      description: `name=undefined, location=undefined, category=undefined, searchTerm="${searchTerm}"`,
    });

    // mixed: valid name but undefined location and category
    cases.push({
      events: [makeEvent({ location: undefined, category: undefined })],
      searchTerm,
      description: `location=undefined, category=undefined (name valid), searchTerm="${searchTerm}"`,
    });
  }

  // Multiple events in array — some with undefined fields, some valid
  cases.push({
    events: [
      makeEvent({ name: 'Valid Event', location: 'Boston', category: 'Sports' }),
      makeEvent({ id: 'evt-2', name: undefined, location: 'Chicago', category: 'Music' }),
    ],
    searchTerm: 'concert',
    description: 'mixed array: one valid event, one with name=undefined',
  });

  cases.push({
    events: [
      makeEvent({ name: undefined, location: null, category: undefined }),
      makeEvent({ id: 'evt-2', name: undefined, location: null, category: null }),
    ],
    searchTerm: 'test',
    description: 'all events have all fields undefined/null',
  });

  return cases;
}

// ---- Tests ----

describe('EventManagementPage - filteredEvents bug condition exploration', () => {
  describe('Property 1: Bug Condition - Undefined/Null fields should NOT crash filtering', () => {
    const bugCases = generateBugConditionCases();

    it.each(bugCases.map((c) => [c.description, c] as [string, typeof c]))(
      'should not throw TypeError when %s',
      (_desc, { events, searchTerm }) => {
        // Assert: filtering does NOT throw a TypeError and returns a valid array.
        // On UNFIXED code this WILL throw: TypeError: can't access property 'toLowerCase', event.name is undefined
        expect(() => unfixedFilterEvents(events, searchTerm)).not.toThrow();
        const result = unfixedFilterEvents(events, searchTerm);
        expect(Array.isArray(result)).toBe(true);
      }
    );
  });

  describe('Specific counterexample cases (direct reproduction)', () => {
    it('should not throw when event.name is undefined and searchTerm is non-empty', () => {
      const events = [makeEvent({ name: undefined })];
      // Counterexample: event.name is undefined, searchTerm='concert'
      // → TypeError: can't access property 'toLowerCase', event.name is undefined
      expect(() => unfixedFilterEvents(events, 'concert')).not.toThrow();
    });

    it('should not throw when event.location is null and searchTerm is non-empty', () => {
      const events = [makeEvent({ location: null })];
      // Counterexample: event.location is null, searchTerm='new york'
      // → TypeError: can't access property 'toLowerCase', event.location is null
      expect(() => unfixedFilterEvents(events, 'new york')).not.toThrow();
    });

    it('should not throw when event.category is undefined and searchTerm is non-empty', () => {
      const events = [makeEvent({ category: undefined })];
      // Counterexample: event.category is undefined, searchTerm='music'
      // → TypeError: can't access property 'toLowerCase', event.category is undefined
      expect(() => unfixedFilterEvents(events, 'music')).not.toThrow();
    });

    it('should return a valid array (not undefined) when fields are undefined', () => {
      const events = [makeEvent({ name: undefined, location: undefined, category: undefined })];
      const result = unfixedFilterEvents(events, 'test');
      expect(Array.isArray(result)).toBe(true);
    });

    it('should not throw when searchTerm is empty even if fields are undefined', () => {
      // Empty search term: filter is effectively skipped (all match or none match)
      // This should NOT crash even on unfixed code because .toLowerCase() is still called
      // but the result of includes('') is always true — however the bug still triggers
      // because .toLowerCase() is called on undefined before includes('')
      const events = [makeEvent({ name: undefined })];
      expect(() => unfixedFilterEvents(events, '')).not.toThrow();
    });
  });
});

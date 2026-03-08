/**
 * Preservation Property Test - EventManagementPage filtering
 *
 * **Validates: Requirements 3.1, 3.2, 3.3, 3.4**
 *
 * Property 2: Preservation — Valid String Filtering Unchanged
 *
 * These tests verify that when all event fields are valid non-null strings,
 * the filtering behavior is correct and unchanged. They MUST PASS on UNFIXED code.
 *
 * Observation-first methodology:
 *   - On UNFIXED code, when all event fields are valid non-null strings,
 *     filteredEvents in EventManagementPage correctly matches search term against
 *     event.name, event.location, event.category case-insensitively.
 *   - When search term is empty, all events are returned without filtering.
 *   - Pagination count is consistent with filtered results length.
 */

import { describe, it, expect } from 'vitest';

// ---- Inline reproduction of the filtering logic from events.tsx ----
// Mirrors the exact filteredEvents useMemo at lines ~68-73 of events.tsx:
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
  name: string;
  location: string;
  category: string;
  description?: string;
  date: string;
  status: string;
  organizerId: string;
  totalAttendees: number;
  ticketTypes: unknown[];
  createdAt: string;
}

/**
 * Reproduces the filtering logic from EventManagementPage (events.tsx).
 * All fields are valid strings — this is the preservation domain.
 */
function filterEvents(events: EventLike[], searchTerm: string): EventLike[] {
  return events.filter(
    (event) =>
      event.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.category.toLowerCase().includes(searchTerm.toLowerCase())
  );
}

// ---- Pagination logic (mirrors paginatedEvents useMemo) ----
const ITEMS_PER_PAGE = 10;

function paginateEvents(filteredEvents: EventLike[], currentPage: number): EventLike[] {
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  return filteredEvents.slice(startIndex, startIndex + ITEMS_PER_PAGE);
}

function totalPages(filteredCount: number): number {
  return Math.ceil(filteredCount / ITEMS_PER_PAGE);
}

// ---- Helpers ----

let eventIdCounter = 0;

function makeValidEvent(overrides: Partial<EventLike> = {}): EventLike {
  eventIdCounter++;
  return {
    id: `evt-${eventIdCounter}`,
    name: 'Test Event',
    location: 'New York',
    category: 'Music',
    description: 'A test event',
    date: '2025-06-01',
    status: 'active',
    organizerId: 'org-1',
    totalAttendees: 100,
    ticketTypes: [],
    createdAt: '2024-01-01',
    ...overrides,
  };
}

/**
 * Generates a variety of valid-string event arrays and search terms
 * to test preservation of filtering behavior.
 */
function generatePreservationCases(): Array<{
  events: EventLike[];
  searchTerm: string;
  description: string;
}> {
  const cases: Array<{ events: EventLike[]; searchTerm: string; description: string }> = [];

  // Case: search term matches event.name (case-insensitive)
  cases.push({
    events: [
      makeValidEvent({ name: 'Summer Concert', location: 'Boston', category: 'Music' }),
      makeValidEvent({ name: 'Tech Workshop', location: 'San Francisco', category: 'Technology' }),
      makeValidEvent({ name: 'Art Exhibition', location: 'Chicago', category: 'Arts' }),
    ],
    searchTerm: 'concert',
    description: 'searchTerm matches event.name (lowercase)',
  });

  cases.push({
    events: [
      makeValidEvent({ name: 'Summer Concert', location: 'Boston', category: 'Music' }),
      makeValidEvent({ name: 'Tech Workshop', location: 'San Francisco', category: 'Technology' }),
    ],
    searchTerm: 'CONCERT',
    description: 'searchTerm matches event.name (uppercase)',
  });

  cases.push({
    events: [
      makeValidEvent({ name: 'Summer Concert', location: 'Boston', category: 'Music' }),
      makeValidEvent({ name: 'Tech Workshop', location: 'San Francisco', category: 'Technology' }),
    ],
    searchTerm: 'CoNcErT',
    description: 'searchTerm matches event.name (mixed case)',
  });

  // Case: search term matches event.location
  cases.push({
    events: [
      makeValidEvent({ name: 'Event A', location: 'New York City', category: 'Music' }),
      makeValidEvent({ name: 'Event B', location: 'Los Angeles', category: 'Sports' }),
      makeValidEvent({ name: 'Event C', location: 'Chicago', category: 'Arts' }),
    ],
    searchTerm: 'new york',
    description: 'searchTerm matches event.location',
  });

  cases.push({
    events: [
      makeValidEvent({ name: 'Event A', location: 'New York City', category: 'Music' }),
      makeValidEvent({ name: 'Event B', location: 'Los Angeles', category: 'Sports' }),
    ],
    searchTerm: 'LOS ANGELES',
    description: 'searchTerm matches event.location (uppercase)',
  });

  // Case: search term matches event.category
  cases.push({
    events: [
      makeValidEvent({ name: 'Event A', location: 'Boston', category: 'Technology' }),
      makeValidEvent({ name: 'Event B', location: 'Chicago', category: 'Music' }),
      makeValidEvent({ name: 'Event C', location: 'Denver', category: 'Sports' }),
    ],
    searchTerm: 'technology',
    description: 'searchTerm matches event.category',
  });

  cases.push({
    events: [
      makeValidEvent({ name: 'Event A', location: 'Boston', category: 'Technology' }),
      makeValidEvent({ name: 'Event B', location: 'Chicago', category: 'Music' }),
    ],
    searchTerm: 'MUSIC',
    description: 'searchTerm matches event.category (uppercase)',
  });

  // Case: search term matches multiple fields across different events
  cases.push({
    events: [
      makeValidEvent({ name: 'Music Festival', location: 'Austin', category: 'Entertainment' }),
      makeValidEvent({ name: 'Art Show', location: 'Music Hall', category: 'Arts' }),
      makeValidEvent({ name: 'Tech Talk', location: 'Denver', category: 'Music' }),
    ],
    searchTerm: 'music',
    description: 'searchTerm matches name in one event, location in another, category in third',
  });

  // Case: search term matches no events
  cases.push({
    events: [
      makeValidEvent({ name: 'Summer Concert', location: 'Boston', category: 'Music' }),
      makeValidEvent({ name: 'Tech Workshop', location: 'San Francisco', category: 'Technology' }),
    ],
    searchTerm: 'zzznomatch',
    description: 'searchTerm matches no events',
  });

  // Case: single character search term
  cases.push({
    events: [
      makeValidEvent({ name: 'Alpha Event', location: 'Atlanta', category: 'Arts' }),
      makeValidEvent({ name: 'Beta Event', location: 'Boston', category: 'Business' }),
      makeValidEvent({ name: 'Gamma Event', location: 'Chicago', category: 'Comedy' }),
    ],
    searchTerm: 'a',
    description: 'single character searchTerm',
  });

  // Case: search term is a substring of multiple fields
  cases.push({
    events: [
      makeValidEvent({ name: 'Annual Gala', location: 'Annual Park', category: 'Annual Festival' }),
      makeValidEvent({ name: 'Other Event', location: 'Other City', category: 'Other' }),
    ],
    searchTerm: 'annual',
    description: 'searchTerm is substring of name, location, and category',
  });

  // Case: empty events array
  cases.push({
    events: [],
    searchTerm: 'concert',
    description: 'empty events array with non-empty searchTerm',
  });

  // Case: single event that matches
  cases.push({
    events: [makeValidEvent({ name: 'Jazz Night', location: 'New Orleans', category: 'Music' })],
    searchTerm: 'jazz',
    description: 'single event that matches searchTerm',
  });

  // Case: single event that does not match
  cases.push({
    events: [makeValidEvent({ name: 'Jazz Night', location: 'New Orleans', category: 'Music' })],
    searchTerm: 'sports',
    description: 'single event that does not match searchTerm',
  });

  return cases;
}

// ---- Tests ----

describe('EventManagementPage - filteredEvents preservation property', () => {
  describe('Property 2: Preservation — Valid String Filtering Unchanged', () => {
    describe('Non-empty searchTerm: correct case-insensitive substring matching', () => {
      const cases = generatePreservationCases();

      it.each(cases.map((c) => [c.description, c] as [string, typeof c]))(
        'filtering is correct for: %s',
        (_desc: string, { events, searchTerm }: { events: EventLike[]; searchTerm: string }) => {
          const result = filterEvents(events, searchTerm);

          // Result must be an array
          expect(Array.isArray(result)).toBe(true);

          // Every event in result must match the searchTerm in at least one field
          for (const event of result) {
            const term = searchTerm.toLowerCase();
            const matchesName = event.name.toLowerCase().includes(term);
            const matchesLocation = event.location.toLowerCase().includes(term);
            const matchesCategory = event.category.toLowerCase().includes(term);
            expect(matchesName || matchesLocation || matchesCategory).toBe(true);
          }

          // Every event NOT in result must NOT match the searchTerm in any field
          const resultIds = new Set(result.map((e) => e.id));
          for (const event of events) {
            if (!resultIds.has(event.id)) {
              const term = searchTerm.toLowerCase();
              const matchesName = event.name.toLowerCase().includes(term);
              const matchesLocation = event.location.toLowerCase().includes(term);
              const matchesCategory = event.category.toLowerCase().includes(term);
              expect(matchesName || matchesLocation || matchesCategory).toBe(false);
            }
          }
        }
      );
    });

    describe('Empty searchTerm: all events are returned', () => {
      it('returns all events when searchTerm is empty string', () => {
        const events = [
          makeValidEvent({ name: 'Event A', location: 'Boston', category: 'Music' }),
          makeValidEvent({ name: 'Event B', location: 'Chicago', category: 'Sports' }),
          makeValidEvent({ name: 'Event C', location: 'Denver', category: 'Arts' }),
        ];
        const result = filterEvents(events, '');
        expect(result).toHaveLength(events.length);
        expect(result.map((e) => e.id)).toEqual(events.map((e) => e.id));
      });

      it('returns empty array when events array is empty and searchTerm is empty', () => {
        const result = filterEvents([], '');
        expect(result).toHaveLength(0);
      });

      it('returns all events for various event arrays when searchTerm is empty', () => {
        const testCases = [
          [makeValidEvent({ name: 'Solo Event', location: 'NYC', category: 'Music' })],
          [
            makeValidEvent({ name: 'Event 1', location: 'LA', category: 'Sports' }),
            makeValidEvent({ name: 'Event 2', location: 'SF', category: 'Tech' }),
            makeValidEvent({ name: 'Event 3', location: 'Chicago', category: 'Arts' }),
          ],
        ];

        for (const events of testCases) {
          const result = filterEvents(events, '');
          expect(result).toHaveLength(events.length);
        }
      });
    });

    describe('Case-insensitive matching', () => {
      it('matches event.name case-insensitively', () => {
        const events = [
          makeValidEvent({ name: 'Summer Concert', location: 'Boston', category: 'Music' }),
          makeValidEvent({ name: 'Winter Gala', location: 'Chicago', category: 'Arts' }),
        ];

        // All case variants should produce the same result
        const resultLower = filterEvents(events, 'summer');
        const resultUpper = filterEvents(events, 'SUMMER');
        const resultMixed = filterEvents(events, 'SuMmEr');

        expect(resultLower).toHaveLength(1);
        expect(resultUpper).toHaveLength(1);
        expect(resultMixed).toHaveLength(1);
        expect(resultLower[0].name).toBe('Summer Concert');
        expect(resultUpper[0].name).toBe('Summer Concert');
        expect(resultMixed[0].name).toBe('Summer Concert');
      });

      it('matches event.location case-insensitively', () => {
        const events = [
          makeValidEvent({ name: 'Event A', location: 'New York', category: 'Music' }),
          makeValidEvent({ name: 'Event B', location: 'Los Angeles', category: 'Sports' }),
        ];

        const resultLower = filterEvents(events, 'new york');
        const resultUpper = filterEvents(events, 'NEW YORK');
        const resultMixed = filterEvents(events, 'New York');

        expect(resultLower).toHaveLength(1);
        expect(resultUpper).toHaveLength(1);
        expect(resultMixed).toHaveLength(1);
        expect(resultLower[0].location).toBe('New York');
      });

      it('matches event.category case-insensitively', () => {
        const events = [
          makeValidEvent({ name: 'Event A', location: 'Boston', category: 'Technology' }),
          makeValidEvent({ name: 'Event B', location: 'Chicago', category: 'Music' }),
        ];

        const resultLower = filterEvents(events, 'technology');
        const resultUpper = filterEvents(events, 'TECHNOLOGY');

        expect(resultLower).toHaveLength(1);
        expect(resultUpper).toHaveLength(1);
        expect(resultLower[0].category).toBe('Technology');
      });
    });

    describe('Substring matching', () => {
      it('matches partial name substring', () => {
        const events = [
          makeValidEvent({ name: 'International Music Festival', location: 'Austin', category: 'Entertainment' }),
          makeValidEvent({ name: 'Tech Conference', location: 'SF', category: 'Technology' }),
        ];
        const result = filterEvents(events, 'festival');
        expect(result).toHaveLength(1);
        expect(result[0].name).toBe('International Music Festival');
      });

      it('matches partial location substring', () => {
        const events = [
          makeValidEvent({ name: 'Event A', location: 'San Francisco, CA', category: 'Music' }),
          makeValidEvent({ name: 'Event B', location: 'New York, NY', category: 'Arts' }),
        ];
        const result = filterEvents(events, 'francisco');
        expect(result).toHaveLength(1);
        expect(result[0].location).toBe('San Francisco, CA');
      });
    });

    describe('OR logic: event matches if ANY field contains the search term', () => {
      it('includes event matching by name even if location and category do not match', () => {
        const event = makeValidEvent({ name: 'Jazz Night', location: 'Denver', category: 'Entertainment' });
        const result = filterEvents([event], 'jazz');
        expect(result).toHaveLength(1);
      });

      it('includes event matching by location even if name and category do not match', () => {
        const event = makeValidEvent({ name: 'Annual Gala', location: 'Jazz Quarter', category: 'Entertainment' });
        const result = filterEvents([event], 'jazz');
        expect(result).toHaveLength(1);
      });

      it('includes event matching by category even if name and location do not match', () => {
        const event = makeValidEvent({ name: 'Annual Gala', location: 'Denver', category: 'Jazz Music' });
        const result = filterEvents([event], 'jazz');
        expect(result).toHaveLength(1);
      });

      it('excludes event when no field matches', () => {
        const event = makeValidEvent({ name: 'Annual Gala', location: 'Denver', category: 'Entertainment' });
        const result = filterEvents([event], 'jazz');
        expect(result).toHaveLength(0);
      });
    });
  });

  describe('Property 2: Preservation — Pagination count consistent with filtered results', () => {
    it('pagination count equals filtered results length', () => {
      const events = Array.from({ length: 25 }, (_, i) =>
        makeValidEvent({
          id: `evt-page-${i}`,
          name: i < 15 ? `Concert ${i}` : `Workshop ${i}`,
          location: 'Boston',
          category: 'Music',
        })
      );

      const filtered = filterEvents(events, 'concert');
      expect(filtered).toHaveLength(15);

      const pages = totalPages(filtered.length);
      expect(pages).toBe(2); // 15 items / 10 per page = 2 pages

      const page1 = paginateEvents(filtered, 1);
      const page2 = paginateEvents(filtered, 2);

      expect(page1).toHaveLength(10);
      expect(page2).toHaveLength(5);
      expect(page1.length + page2.length).toBe(filtered.length);
    });

    it('pagination of all events when searchTerm is empty', () => {
      const events = Array.from({ length: 23 }, (_, i) =>
        makeValidEvent({ id: `evt-all-${i}`, name: `Event ${i}`, location: 'NYC', category: 'Music' })
      );

      const filtered = filterEvents(events, '');
      expect(filtered).toHaveLength(23);

      const pages = totalPages(filtered.length);
      expect(pages).toBe(3); // ceil(23/10) = 3

      const page1 = paginateEvents(filtered, 1);
      const page2 = paginateEvents(filtered, 2);
      const page3 = paginateEvents(filtered, 3);

      expect(page1).toHaveLength(10);
      expect(page2).toHaveLength(10);
      expect(page3).toHaveLength(3);
      expect(page1.length + page2.length + page3.length).toBe(filtered.length);
    });

    it('single page when filtered results fit within one page', () => {
      const events = Array.from({ length: 5 }, (_, i) =>
        makeValidEvent({ id: `evt-small-${i}`, name: `Concert ${i}`, location: 'NYC', category: 'Music' })
      );

      const filtered = filterEvents(events, 'concert');
      expect(filtered).toHaveLength(5);

      const pages = totalPages(filtered.length);
      expect(pages).toBe(1);

      const page1 = paginateEvents(filtered, 1);
      expect(page1).toHaveLength(5);
    });

    it('zero pages when no events match', () => {
      const events = [
        makeValidEvent({ name: 'Tech Talk', location: 'SF', category: 'Technology' }),
      ];

      const filtered = filterEvents(events, 'zzznomatch');
      expect(filtered).toHaveLength(0);

      const pages = totalPages(filtered.length);
      expect(pages).toBe(0);
    });

    it('paginated items are a subset of filtered items in correct order', () => {
      const events = Array.from({ length: 12 }, (_, i) =>
        makeValidEvent({ id: `evt-order-${i}`, name: `Music Event ${i}`, location: 'NYC', category: 'Music' })
      );

      const filtered = filterEvents(events, 'music');
      expect(filtered).toHaveLength(12);

      const page1 = paginateEvents(filtered, 1);
      const page2 = paginateEvents(filtered, 2);

      // Page 1 should be first 10 items
      expect(page1.map((e) => e.id)).toEqual(filtered.slice(0, 10).map((e) => e.id));
      // Page 2 should be last 2 items
      expect(page2.map((e) => e.id)).toEqual(filtered.slice(10, 12).map((e) => e.id));
    });
  });

  describe('Property 2: Preservation — Multiple random-like test cases', () => {
    /**
     * Generates many test cases with valid string fields to verify
     * the filtering logic is correct across a wide range of inputs.
     */
    const multiCases = [
      {
        events: [
          makeValidEvent({ name: 'Rock Concert', location: 'Madison Square Garden', category: 'Music' }),
          makeValidEvent({ name: 'Jazz Festival', location: 'New Orleans', category: 'Music' }),
          makeValidEvent({ name: 'Tech Summit', location: 'Silicon Valley', category: 'Technology' }),
          makeValidEvent({ name: 'Food Fair', location: 'Chicago', category: 'Food' }),
          makeValidEvent({ name: 'Art Expo', location: 'New York', category: 'Arts' }),
        ],
        searchTerm: 'new',
        expectedCount: 2, // matches location 'New Orleans' and 'New York'
        description: 'searchTerm "new" matches location of 2 events',
      },
      {
        events: [
          makeValidEvent({ name: 'Rock Concert', location: 'Madison Square Garden', category: 'Music' }),
          makeValidEvent({ name: 'Jazz Festival', location: 'New Orleans', category: 'Music' }),
          makeValidEvent({ name: 'Tech Summit', location: 'Silicon Valley', category: 'Technology' }),
        ],
        searchTerm: 'music',
        expectedCount: 2, // category 'Music' matches first two
        description: 'searchTerm "music" matches category of 2 events',
      },
      {
        events: [
          makeValidEvent({ name: 'Annual Gala', location: 'Boston', category: 'Entertainment' }),
          makeValidEvent({ name: 'Annual Conference', location: 'Chicago', category: 'Business' }),
          makeValidEvent({ name: 'Summer Party', location: 'Annual Park', category: 'Social' }),
          makeValidEvent({ name: 'Tech Talk', location: 'Denver', category: 'Annual Tech' }),
        ],
        searchTerm: 'annual',
        expectedCount: 4, // all 4 match (name, name, location, category)
        description: 'searchTerm "annual" matches all 4 events across different fields',
      },
    ];

    it.each(multiCases.map((c) => [c.description, c] as [string, typeof c]))(
      '%s',
      (_desc: string, { events, searchTerm, expectedCount }: { events: EventLike[]; searchTerm: string; expectedCount: number }) => {
        const result = filterEvents(events, searchTerm);
        expect(result).toHaveLength(expectedCount);

        // All results must match
        for (const event of result) {
          const term = searchTerm.toLowerCase();
          const matches =
            event.name.toLowerCase().includes(term) ||
            event.location.toLowerCase().includes(term) ||
            event.category.toLowerCase().includes(term);
          expect(matches).toBe(true);
        }
      }
    );
  });
});

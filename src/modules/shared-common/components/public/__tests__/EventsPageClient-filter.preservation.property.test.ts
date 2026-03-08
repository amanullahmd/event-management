/**
 * Preservation Property Test - EventsPageClient filtering
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
 *     filteredEvents in EventsPageClient correctly matches search query against
 *     event.name, event.description, event.category, event.location case-insensitively.
 *   - When searchQuery is empty, all events are returned without filtering.
 *   - Category filtering works correctly (selectedCategory !== 'All' filters by category).
 *   - Pagination count is consistent with filtered results length.
 */

import { describe, it, expect } from 'vitest';

// ---- Inline reproduction of the filtering logic from EventsPageClient.tsx ----
// Mirrors the exact filteredEvents useMemo from EventsPageClient.tsx:
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
//       if (selectedDate) { ... date filtering ... }
//       return true;
//     });
//   }, [initialEvents, searchQuery, selectedCategory, selectedDate]);

interface EventLike {
  id: string;
  name: string;
  description: string;
  category: string;
  location: string;
  date: string;
  status: string;
  organizerId: string;
  totalAttendees: number;
  ticketTypes: unknown[];
  createdAt: string;
}

/**
 * Reproduces the filtering logic from EventsPageClient.tsx.
 * All fields are valid strings — this is the preservation domain.
 */
function filterEventsPageClient(
  initialEvents: EventLike[],
  searchQuery: string,
  selectedCategory = 'All',
  selectedDate = ''
): EventLike[] {
  return initialEvents.filter((event) => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesSearch =
        event.name.toLowerCase().includes(query) ||
        event.description.toLowerCase().includes(query) ||
        event.category.toLowerCase().includes(query) ||
        event.location.toLowerCase().includes(query);
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

// ---- Pagination logic (mirrors EventsPageClient) ----
const ITEMS_PER_PAGE = 12;

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
    description: 'A test event description',
    location: 'New York',
    category: 'Music',
    date: '2025-06-01',
    status: 'active',
    organizerId: 'org-1',
    totalAttendees: 100,
    ticketTypes: [],
    createdAt: '2024-01-01',
    ...overrides,
  };
}

// ---- Tests ----

describe('EventsPageClient - filteredEvents preservation property', () => {
  describe('Property 2: Preservation — Valid String Filtering Unchanged', () => {
    describe('Non-empty searchQuery: correct case-insensitive substring matching', () => {
      it('matches event.name case-insensitively', () => {
        const events = [
          makeValidEvent({ name: 'Summer Concert', description: 'A great show', location: 'Boston', category: 'Music' }),
          makeValidEvent({ name: 'Tech Workshop', description: 'Learn coding', location: 'SF', category: 'Technology' }),
          makeValidEvent({ name: 'Art Exhibition', description: 'Modern art', location: 'Chicago', category: 'Arts' }),
        ];

        const resultLower = filterEventsPageClient(events, 'concert');
        const resultUpper = filterEventsPageClient(events, 'CONCERT');
        const resultMixed = filterEventsPageClient(events, 'CoNcErT');

        expect(resultLower).toHaveLength(1);
        expect(resultUpper).toHaveLength(1);
        expect(resultMixed).toHaveLength(1);
        expect(resultLower[0].name).toBe('Summer Concert');
      });

      it('matches event.description case-insensitively', () => {
        const events = [
          makeValidEvent({ name: 'Event A', description: 'Learn advanced JavaScript techniques', location: 'Boston', category: 'Technology' }),
          makeValidEvent({ name: 'Event B', description: 'Enjoy live music performances', location: 'Chicago', category: 'Music' }),
        ];

        const resultLower = filterEventsPageClient(events, 'javascript');
        const resultUpper = filterEventsPageClient(events, 'JAVASCRIPT');

        expect(resultLower).toHaveLength(1);
        expect(resultUpper).toHaveLength(1);
        expect(resultLower[0].description).toContain('JavaScript');
      });

      it('matches event.category case-insensitively', () => {
        const events = [
          makeValidEvent({ name: 'Event A', description: 'Desc A', location: 'Boston', category: 'Technology' }),
          makeValidEvent({ name: 'Event B', description: 'Desc B', location: 'Chicago', category: 'Music' }),
          makeValidEvent({ name: 'Event C', description: 'Desc C', location: 'Denver', category: 'Sports' }),
        ];

        const resultLower = filterEventsPageClient(events, 'technology');
        const resultUpper = filterEventsPageClient(events, 'TECHNOLOGY');

        expect(resultLower).toHaveLength(1);
        expect(resultUpper).toHaveLength(1);
        expect(resultLower[0].category).toBe('Technology');
      });

      it('matches event.location case-insensitively', () => {
        const events = [
          makeValidEvent({ name: 'Event A', description: 'Desc A', location: 'New York City', category: 'Music' }),
          makeValidEvent({ name: 'Event B', description: 'Desc B', location: 'Los Angeles', category: 'Sports' }),
        ];

        const resultLower = filterEventsPageClient(events, 'new york');
        const resultUpper = filterEventsPageClient(events, 'NEW YORK');

        expect(resultLower).toHaveLength(1);
        expect(resultUpper).toHaveLength(1);
        expect(resultLower[0].location).toBe('New York City');
      });

      it('matches event.description as a unique field (not in events.tsx)', () => {
        // EventsPageClient also searches description — this is unique to this component
        const events = [
          makeValidEvent({ name: 'Event A', description: 'Featuring keynote speakers', location: 'Boston', category: 'Business' }),
          makeValidEvent({ name: 'Event B', description: 'Live music and dancing', location: 'Chicago', category: 'Music' }),
        ];

        const result = filterEventsPageClient(events, 'keynote');
        expect(result).toHaveLength(1);
        expect(result[0].description).toContain('keynote');
      });

      it('returns no events when searchQuery matches nothing', () => {
        const events = [
          makeValidEvent({ name: 'Summer Concert', description: 'Great music', location: 'Boston', category: 'Music' }),
          makeValidEvent({ name: 'Tech Workshop', description: 'Learn coding', location: 'SF', category: 'Technology' }),
        ];

        const result = filterEventsPageClient(events, 'zzznomatch');
        expect(result).toHaveLength(0);
      });

      it('OR logic: event matches if ANY of name/description/category/location contains query', () => {
        // Event matches via name
        const eventByName = makeValidEvent({ name: 'Jazz Night', description: 'Evening event', location: 'Denver', category: 'Entertainment' });
        expect(filterEventsPageClient([eventByName], 'jazz')).toHaveLength(1);

        // Event matches via description
        const eventByDesc = makeValidEvent({ name: 'Evening Event', description: 'Jazz performances all night', location: 'Denver', category: 'Entertainment' });
        expect(filterEventsPageClient([eventByDesc], 'jazz')).toHaveLength(1);

        // Event matches via category
        const eventByCat = makeValidEvent({ name: 'Evening Event', description: 'Great show', location: 'Denver', category: 'Jazz Music' });
        expect(filterEventsPageClient([eventByCat], 'jazz')).toHaveLength(1);

        // Event matches via location
        const eventByLoc = makeValidEvent({ name: 'Evening Event', description: 'Great show', location: 'Jazz Quarter', category: 'Entertainment' });
        expect(filterEventsPageClient([eventByLoc], 'jazz')).toHaveLength(1);

        // Event does NOT match when no field contains query
        const eventNoMatch = makeValidEvent({ name: 'Evening Event', description: 'Great show', location: 'Denver', category: 'Entertainment' });
        expect(filterEventsPageClient([eventNoMatch], 'jazz')).toHaveLength(0);
      });

      it('all matching events are included in result', () => {
        const events = [
          makeValidEvent({ name: 'Music Festival', description: 'Great music', location: 'Austin', category: 'Entertainment' }),
          makeValidEvent({ name: 'Art Show', description: 'Modern art', location: 'Music Hall', category: 'Arts' }),
          makeValidEvent({ name: 'Tech Talk', description: 'Coding workshop', location: 'Denver', category: 'Music' }),
          makeValidEvent({ name: 'Food Fair', description: 'Delicious food', location: 'Chicago', category: 'Food' }),
        ];

        const result = filterEventsPageClient(events, 'music');
        // Matches: 'Music Festival' (name), 'Art Show' (location 'Music Hall'), 'Tech Talk' (category 'Music')
        expect(result).toHaveLength(3);

        const resultIds = new Set(result.map((e) => e.id));
        expect(resultIds.has(events[0].id)).toBe(true); // Music Festival
        expect(resultIds.has(events[1].id)).toBe(true); // Art Show (Music Hall)
        expect(resultIds.has(events[2].id)).toBe(true); // Tech Talk (Music category)
        expect(resultIds.has(events[3].id)).toBe(false); // Food Fair - no match
      });
    });

    describe('Empty searchQuery: all events are returned', () => {
      it('returns all events when searchQuery is empty string', () => {
        const events = [
          makeValidEvent({ name: 'Event A', description: 'Desc A', location: 'Boston', category: 'Music' }),
          makeValidEvent({ name: 'Event B', description: 'Desc B', location: 'Chicago', category: 'Sports' }),
          makeValidEvent({ name: 'Event C', description: 'Desc C', location: 'Denver', category: 'Arts' }),
        ];
        const result = filterEventsPageClient(events, '');
        expect(result).toHaveLength(events.length);
        expect(result.map((e) => e.id)).toEqual(events.map((e) => e.id));
      });

      it('returns empty array when events array is empty and searchQuery is empty', () => {
        const result = filterEventsPageClient([], '');
        expect(result).toHaveLength(0);
      });

      it('returns all events for various event arrays when searchQuery is empty', () => {
        const testCases = [
          [makeValidEvent({ name: 'Solo Event', description: 'Solo desc', location: 'NYC', category: 'Music' })],
          [
            makeValidEvent({ name: 'Event 1', description: 'Desc 1', location: 'LA', category: 'Sports' }),
            makeValidEvent({ name: 'Event 2', description: 'Desc 2', location: 'SF', category: 'Tech' }),
            makeValidEvent({ name: 'Event 3', description: 'Desc 3', location: 'Chicago', category: 'Arts' }),
          ],
        ];

        for (const events of testCases) {
          const result = filterEventsPageClient(events, '');
          expect(result).toHaveLength(events.length);
        }
      });
    });

    describe('Category filtering: selectedCategory !== "All" filters by exact category match', () => {
      it('returns only events matching selectedCategory when category is not "All"', () => {
        const events = [
          makeValidEvent({ name: 'Event A', description: 'Desc A', location: 'Boston', category: 'Music' }),
          makeValidEvent({ name: 'Event B', description: 'Desc B', location: 'Chicago', category: 'Sports' }),
          makeValidEvent({ name: 'Event C', description: 'Desc C', location: 'Denver', category: 'Music' }),
          makeValidEvent({ name: 'Event D', description: 'Desc D', location: 'NYC', category: 'Arts' }),
        ];

        const result = filterEventsPageClient(events, '', 'Music');
        expect(result).toHaveLength(2);
        for (const event of result) {
          expect(event.category).toBe('Music');
        }
      });

      it('returns all events when selectedCategory is "All"', () => {
        const events = [
          makeValidEvent({ name: 'Event A', description: 'Desc A', location: 'Boston', category: 'Music' }),
          makeValidEvent({ name: 'Event B', description: 'Desc B', location: 'Chicago', category: 'Sports' }),
          makeValidEvent({ name: 'Event C', description: 'Desc C', location: 'Denver', category: 'Arts' }),
        ];

        const result = filterEventsPageClient(events, '', 'All');
        expect(result).toHaveLength(3);
      });

      it('returns empty array when no events match selectedCategory', () => {
        const events = [
          makeValidEvent({ name: 'Event A', description: 'Desc A', location: 'Boston', category: 'Music' }),
          makeValidEvent({ name: 'Event B', description: 'Desc B', location: 'Chicago', category: 'Sports' }),
        ];

        const result = filterEventsPageClient(events, '', 'Technology');
        expect(result).toHaveLength(0);
      });

      it('combines searchQuery and selectedCategory filtering (AND logic)', () => {
        const events = [
          makeValidEvent({ name: 'Music Concert', description: 'Great show', location: 'Boston', category: 'Music' }),
          makeValidEvent({ name: 'Music Workshop', description: 'Learn music', location: 'Chicago', category: 'Education' }),
          makeValidEvent({ name: 'Tech Talk', description: 'Coding', location: 'Denver', category: 'Technology' }),
        ];

        // searchQuery 'music' matches first two events, but selectedCategory 'Music' only keeps first
        const result = filterEventsPageClient(events, 'music', 'Music');
        expect(result).toHaveLength(1);
        expect(result[0].name).toBe('Music Concert');
        expect(result[0].category).toBe('Music');
      });

      it('category filter is exact match (not substring)', () => {
        const events = [
          makeValidEvent({ name: 'Event A', description: 'Desc A', location: 'Boston', category: 'Music' }),
          makeValidEvent({ name: 'Event B', description: 'Desc B', location: 'Chicago', category: 'Music Festival' }),
        ];

        // selectedCategory 'Music' should only match exact 'Music', not 'Music Festival'
        const result = filterEventsPageClient(events, '', 'Music');
        expect(result).toHaveLength(1);
        expect(result[0].category).toBe('Music');
      });
    });

    describe('Property 2: Preservation — Pagination count consistent with filtered results', () => {
      it('pagination count equals filtered results length', () => {
        const events = Array.from({ length: 30 }, (_, i) =>
          makeValidEvent({
            id: `evt-page-${i}`,
            name: i < 20 ? `Concert ${i}` : `Workshop ${i}`,
            description: 'Event description',
            location: 'Boston',
            category: 'Music',
          })
        );

        const filtered = filterEventsPageClient(events, 'concert');
        expect(filtered).toHaveLength(20);

        const pages = totalPages(filtered.length);
        expect(pages).toBe(2); // ceil(20/12) = 2

        const page1 = paginateEvents(filtered, 1);
        const page2 = paginateEvents(filtered, 2);

        expect(page1).toHaveLength(12);
        expect(page2).toHaveLength(8);
        expect(page1.length + page2.length).toBe(filtered.length);
      });

      it('pagination of all events when searchQuery is empty', () => {
        const events = Array.from({ length: 25 }, (_, i) =>
          makeValidEvent({
            id: `evt-all-${i}`,
            name: `Event ${i}`,
            description: 'Desc',
            location: 'NYC',
            category: 'Music',
          })
        );

        const filtered = filterEventsPageClient(events, '');
        expect(filtered).toHaveLength(25);

        const pages = totalPages(filtered.length);
        expect(pages).toBe(3); // ceil(25/12) = 3

        const page1 = paginateEvents(filtered, 1);
        const page2 = paginateEvents(filtered, 2);
        const page3 = paginateEvents(filtered, 3);

        expect(page1).toHaveLength(12);
        expect(page2).toHaveLength(12);
        expect(page3).toHaveLength(1);
        expect(page1.length + page2.length + page3.length).toBe(filtered.length);
      });

      it('single page when filtered results fit within one page', () => {
        const events = Array.from({ length: 5 }, (_, i) =>
          makeValidEvent({
            id: `evt-small-${i}`,
            name: `Concert ${i}`,
            description: 'Desc',
            location: 'NYC',
            category: 'Music',
          })
        );

        const filtered = filterEventsPageClient(events, 'concert');
        expect(filtered).toHaveLength(5);

        const pages = totalPages(filtered.length);
        expect(pages).toBe(1);

        const page1 = paginateEvents(filtered, 1);
        expect(page1).toHaveLength(5);
      });

      it('zero pages when no events match', () => {
        const events = [
          makeValidEvent({ name: 'Tech Talk', description: 'Coding', location: 'SF', category: 'Technology' }),
        ];

        const filtered = filterEventsPageClient(events, 'zzznomatch');
        expect(filtered).toHaveLength(0);

        const pages = totalPages(filtered.length);
        expect(pages).toBe(0);
      });

      it('paginated items are a subset of filtered items in correct order', () => {
        const events = Array.from({ length: 15 }, (_, i) =>
          makeValidEvent({
            id: `evt-order-${i}`,
            name: `Music Event ${i}`,
            description: 'Desc',
            location: 'NYC',
            category: 'Music',
          })
        );

        const filtered = filterEventsPageClient(events, 'music');
        expect(filtered).toHaveLength(15);

        const page1 = paginateEvents(filtered, 1);
        const page2 = paginateEvents(filtered, 2);

        // Page 1 should be first 12 items
        expect(page1.map((e) => e.id)).toEqual(filtered.slice(0, 12).map((e) => e.id));
        // Page 2 should be last 3 items
        expect(page2.map((e) => e.id)).toEqual(filtered.slice(12, 15).map((e) => e.id));
      });
    });

    describe('Property 2: Preservation — Multiple random-like test cases', () => {
      const multiCases = [
        {
          events: [
            makeValidEvent({ name: 'Rock Concert', description: 'Live rock music', location: 'Madison Square Garden', category: 'Music' }),
            makeValidEvent({ name: 'Jazz Festival', description: 'Jazz performances', location: 'New Orleans', category: 'Music' }),
            makeValidEvent({ name: 'Tech Summit', description: 'Technology conference', location: 'Silicon Valley', category: 'Technology' }),
            makeValidEvent({ name: 'Food Fair', description: 'Culinary delights', location: 'Chicago', category: 'Food' }),
            makeValidEvent({ name: 'Art Expo', description: 'Modern art exhibition', location: 'New York', category: 'Arts' }),
          ],
          searchQuery: 'music',
          selectedCategory: 'All',
          expectedCount: 2, // 'Rock Concert' (desc 'Live rock music' yes), 'Jazz Festival' (category 'Music' yes); Tech/Food/Art no
          description: 'searchQuery "music" matches desc of Rock Concert and category of Jazz Festival',
        },
        {
          events: [
            makeValidEvent({ name: 'Rock Concert', description: 'Live rock music', location: 'Madison Square Garden', category: 'Music' }),
            makeValidEvent({ name: 'Jazz Festival', description: 'Jazz performances', location: 'New Orleans', category: 'Music' }),
            makeValidEvent({ name: 'Tech Summit', description: 'Technology conference', location: 'Silicon Valley', category: 'Technology' }),
          ],
          searchQuery: '',
          selectedCategory: 'Music',
          expectedCount: 2, // category filter: only Music events
          description: 'empty searchQuery with selectedCategory "Music" returns 2 events',
        },
        {
          events: [
            makeValidEvent({ name: 'Annual Gala', description: 'Annual charity event', location: 'Boston', category: 'Entertainment' }),
            makeValidEvent({ name: 'Annual Conference', description: 'Business conference', location: 'Chicago', category: 'Business' }),
            makeValidEvent({ name: 'Summer Party', description: 'Fun summer event', location: 'Annual Park', category: 'Social' }),
            makeValidEvent({ name: 'Tech Talk', description: 'Coding workshop', location: 'Denver', category: 'Annual Tech' }),
          ],
          searchQuery: 'annual',
          selectedCategory: 'All',
          expectedCount: 4, // all 4 match (name, desc, location, category)
          description: 'searchQuery "annual" matches all 4 events across different fields',
        },
      ];

      it.each(multiCases.map((c) => [c.description, c] as [string, typeof c]))(
        '%s',
        (_desc: string, { events, searchQuery, selectedCategory, expectedCount }: { events: EventLike[]; searchQuery: string; selectedCategory: string; expectedCount: number }) => {
          const result = filterEventsPageClient(events, searchQuery, selectedCategory);
          expect(result).toHaveLength(expectedCount);

          // All results must match the search query (if non-empty)
          if (searchQuery) {
            for (const event of result) {
              const query = searchQuery.toLowerCase();
              const matches =
                event.name.toLowerCase().includes(query) ||
                event.description.toLowerCase().includes(query) ||
                event.category.toLowerCase().includes(query) ||
                event.location.toLowerCase().includes(query);
              expect(matches).toBe(true);
            }
          }

          // All results must match the category filter (if not 'All')
          if (selectedCategory !== 'All') {
            for (const event of result) {
              expect(event.category).toBe(selectedCategory);
            }
          }
        }
      );
    });
  });
});

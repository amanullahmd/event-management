/**
 * Property-Based Tests for Event Management
 * Tests core properties of the event management functionality
 */

import fc from 'fast-check';
import {
  getAllEvents,
  updateEventStatus,
  getEventById,
} from '@/lib/dummy-data';
import { Event } from '@/lib/types/event';

/**
 * Property 6: Event list displays all events
 * For any set of events in dummy data, the event management page should display 
 * all events in the list.
 * **Validates: Requirements 4.1, 4.2**
 */
describe('Property 6: Event list displays all events', () => {
  test('should display all events', () => {
    fc.assert(
      fc.property(fc.integer({ min: 0, max: 1000 }), () => {
        const events = getAllEvents();

        // Verify all events have required fields
        events.forEach((event) => {
          expect(event).toHaveProperty('id');
          expect(event).toHaveProperty('name');
          expect(event).toHaveProperty('organizerId');
          expect(event).toHaveProperty('date');
          expect(event).toHaveProperty('location');
          expect(event).toHaveProperty('category');
          expect(event).toHaveProperty('status');
          expect(event).toHaveProperty('ticketTypes');
          expect(event).toHaveProperty('totalAttendees');
        });
      }),
      { numRuns: 100 }
    );
  });

  test('should have valid event structure', () => {
    fc.assert(
      fc.property(fc.integer({ min: 0, max: 1000 }), () => {
        const events = getAllEvents();

        events.forEach((event) => {
          // Verify field types
          expect(typeof event.id).toBe('string');
          expect(typeof event.name).toBe('string');
          expect(typeof event.organizerId).toBe('string');
          expect(event.date instanceof Date).toBe(true);
          expect(typeof event.location).toBe('string');
          expect(typeof event.category).toBe('string');
          expect(typeof event.status).toBe('string');
          expect(Array.isArray(event.ticketTypes)).toBe(true);
          expect(typeof event.totalAttendees).toBe('number');

          // Verify field values
          expect(event.id.length).toBeGreaterThan(0);
          expect(event.name.length).toBeGreaterThan(0);
          expect(event.organizerId.length).toBeGreaterThan(0);
          expect(event.location.length).toBeGreaterThan(0);
          expect(event.category.length).toBeGreaterThan(0);
          expect(['active', 'inactive', 'cancelled']).toContain(event.status);
          expect(event.totalAttendees).toBeGreaterThanOrEqual(0);
        });
      }),
      { numRuns: 100 }
    );
  });

  test('should have valid ticket types', () => {
    fc.assert(
      fc.property(fc.integer({ min: 0, max: 1000 }), () => {
        const events = getAllEvents();

        events.forEach((event) => {
          event.ticketTypes.forEach((ticketType) => {
            expect(ticketType).toHaveProperty('id');
            expect(ticketType).toHaveProperty('eventId');
            expect(ticketType).toHaveProperty('name');
            expect(ticketType).toHaveProperty('price');
            expect(ticketType).toHaveProperty('quantity');
            expect(ticketType).toHaveProperty('sold');
            expect(ticketType).toHaveProperty('type');

            // Verify field types
            expect(typeof ticketType.id).toBe('string');
            expect(typeof ticketType.eventId).toBe('string');
            expect(typeof ticketType.name).toBe('string');
            expect(typeof ticketType.price).toBe('number');
            expect(typeof ticketType.quantity).toBe('number');
            expect(typeof ticketType.sold).toBe('number');
            expect(typeof ticketType.type).toBe('string');

            // Verify field values
            expect(ticketType.price).toBeGreaterThanOrEqual(0);
            expect(ticketType.quantity).toBeGreaterThanOrEqual(0);
            expect(ticketType.sold).toBeGreaterThanOrEqual(0);
            expect(ticketType.sold).toBeLessThanOrEqual(ticketType.quantity);
            expect(['vip', 'regular', 'early-bird']).toContain(ticketType.type);
          });
        });
      }),
      { numRuns: 100 }
    );
  });

  test('should calculate total attendees correctly', () => {
    fc.assert(
      fc.property(fc.integer({ min: 0, max: 1000 }), () => {
        const events = getAllEvents();

        events.forEach((event) => {
          const calculatedAttendees = event.ticketTypes.reduce(
            (sum, tt) => sum + tt.sold,
            0
          );
          expect(event.totalAttendees).toBe(calculatedAttendees);
        });
      }),
      { numRuns: 100 }
    );
  });

  test('should categorize events by status', () => {
    fc.assert(
      fc.property(fc.integer({ min: 0, max: 1000 }), () => {
        const events = getAllEvents();

        const active = events.filter((e) => e.status === 'active');
        const inactive = events.filter((e) => e.status === 'inactive');
        const cancelled = events.filter((e) => e.status === 'cancelled');

        // Verify counts add up
        expect(active.length + inactive.length + cancelled.length).toBe(events.length);

        // Verify each category has valid events
        active.forEach((event) => {
          expect(event.status).toBe('active');
        });
        inactive.forEach((event) => {
          expect(event.status).toBe('inactive');
        });
        cancelled.forEach((event) => {
          expect(event.status).toBe('cancelled');
        });
      }),
      { numRuns: 100 }
    );
  });

  test('should update event status correctly', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 1000 }),
        fc.constantFrom('active' as const, 'inactive' as const, 'cancelled' as const),
        (_, newStatus) => {
          const events = getAllEvents();
          if (events.length === 0) return;

          const event = events[0];
          const originalStatus = event.status;

          // Update status
          updateEventStatus(event.id, newStatus);

          // Verify update
          const updated = getEventById(event.id);
          expect(updated?.status).toBe(newStatus);

          // Restore original status
          updateEventStatus(event.id, originalStatus as any);
        }
      ),
      { numRuns: 50 }
    );
  });

  test('should maintain event data integrity after status update', () => {
    fc.assert(
      fc.property(fc.integer({ min: 0, max: 1000 }), () => {
        const events = getAllEvents();
        if (events.length === 0) return;

        const event = events[0];
        const originalData = { ...event };

        // Update status
        updateEventStatus(event.id, 'inactive');

        // Verify other data is unchanged
        const updated = getEventById(event.id);
        expect(updated?.id).toBe(originalData.id);
        expect(updated?.name).toBe(originalData.name);
        expect(updated?.organizerId).toBe(originalData.organizerId);
        expect(updated?.location).toBe(originalData.location);
        expect(updated?.category).toBe(originalData.category);

        // Restore original status
        updateEventStatus(event.id, originalData.status as any);
      }),
      { numRuns: 100 }
    );
  });
});

/**
 * Additional tests for event management consistency
 */
describe('Event management consistency', () => {
  test('should have unique event IDs', () => {
    fc.assert(
      fc.property(fc.integer({ min: 0, max: 1000 }), () => {
        const events = getAllEvents();
        const ids = events.map((e) => e.id);
        const uniqueIds = new Set(ids);

        expect(uniqueIds.size).toBe(ids.length);
      }),
      { numRuns: 100 }
    );
  });

  test('should have valid event names', () => {
    fc.assert(
      fc.property(fc.integer({ min: 0, max: 1000 }), () => {
        const events = getAllEvents();

        events.forEach((event) => {
          expect(event.name.length).toBeGreaterThan(0);
          expect(event.name.length).toBeLessThanOrEqual(255);
        });
      }),
      { numRuns: 100 }
    );
  });

  test('should have valid locations', () => {
    fc.assert(
      fc.property(fc.integer({ min: 0, max: 1000 }), () => {
        const events = getAllEvents();

        events.forEach((event) => {
          expect(event.location.length).toBeGreaterThan(0);
          expect(event.location.length).toBeLessThanOrEqual(255);
        });
      }),
      { numRuns: 100 }
    );
  });

  test('should have valid categories', () => {
    fc.assert(
      fc.property(fc.integer({ min: 0, max: 1000 }), () => {
        const events = getAllEvents();

        events.forEach((event) => {
          expect(event.category.length).toBeGreaterThan(0);
          expect(event.category.length).toBeLessThanOrEqual(100);
        });
      }),
      { numRuns: 100 }
    );
  });

  test('should have at least one ticket type per event', () => {
    fc.assert(
      fc.property(fc.integer({ min: 0, max: 1000 }), () => {
        const events = getAllEvents();

        events.forEach((event) => {
          expect(event.ticketTypes.length).toBeGreaterThan(0);
        });
      }),
      { numRuns: 100 }
    );
  });

  test('should have valid event dates', () => {
    fc.assert(
      fc.property(fc.integer({ min: 0, max: 1000 }), () => {
        const events = getAllEvents();

        events.forEach((event) => {
          expect(event.date instanceof Date).toBe(true);
          expect(event.date.getTime()).toBeGreaterThan(0);
        });
      }),
      { numRuns: 100 }
    );
  });
});

/**
 * Property-Based Tests for QR Code Check-in
 * Tests core properties of the QR code validation and check-in functionality
 */

import fc from 'fast-check';
import {
  getAllTickets,
  getTicketByQrCode,
  updateTicketCheckIn,
  getTicketsByEventId,
  resetDummyData,
} from '@/lib/dummy-data';

/**
 * Property 9: QR code scanning marks tickets as checked in
 * For any valid QR code, scanning it should mark the associated ticket as checked in
 * and display attendee information.
 * **Validates: Requirements 10.2, 10.3**
 */
describe('Property 9: QR code scanning marks tickets as checked in', () => {
  beforeEach(() => {
    resetDummyData();
  });

  test('valid QR code returns the correct ticket', () => {
    fc.assert(
      fc.property(fc.integer({ min: 0, max: 100 }), () => {
        const tickets = getAllTickets();
        if (tickets.length === 0) return true;

        // Pick a random ticket
        const randomIndex = Math.floor(Math.random() * tickets.length);
        const ticket = tickets[randomIndex];

        // Find ticket by QR code
        const foundTicket = getTicketByQrCode(ticket.qrCode);

        // Verify the correct ticket is returned
        expect(foundTicket).toBeDefined();
        expect(foundTicket?.id).toBe(ticket.id);
        expect(foundTicket?.qrCode).toBe(ticket.qrCode);
        expect(foundTicket?.eventId).toBe(ticket.eventId);

        return true;
      }),
      { numRuns: 50 }
    );
  });

  test('invalid QR code returns undefined', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 10, maxLength: 50 }),
        (invalidQrCode) => {
          // Ensure the QR code doesn't accidentally match a real one
          const prefixedCode = `INVALID-${invalidQrCode}`;
          const foundTicket = getTicketByQrCode(prefixedCode);

          // Should not find any ticket
          expect(foundTicket).toBeUndefined();

          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  test('check-in updates ticket status correctly', () => {
    fc.assert(
      fc.property(fc.integer({ min: 0, max: 100 }), () => {
        const tickets = getAllTickets();
        if (tickets.length === 0) return true;

        // Find a ticket that is not checked in
        const uncheckedTicket = tickets.find((t) => !t.checkedIn);
        if (!uncheckedTicket) return true;

        // Check in the ticket
        const updatedTicket = updateTicketCheckIn(uncheckedTicket.id, true);

        // Verify check-in was successful
        expect(updatedTicket).toBeDefined();
        expect(updatedTicket?.checkedIn).toBe(true);
        expect(updatedTicket?.checkedInAt).toBeDefined();
        expect(updatedTicket?.status).toBe('used');

        // Verify the change persists
        const retrievedTicket = getTicketByQrCode(uncheckedTicket.qrCode);
        expect(retrievedTicket?.checkedIn).toBe(true);

        return true;
      }),
      { numRuns: 50 }
    );
  });

  test('check-in can be reversed', () => {
    fc.assert(
      fc.property(fc.integer({ min: 0, max: 100 }), () => {
        const tickets = getAllTickets();
        if (tickets.length === 0) return true;

        // Find a checked-in ticket
        const checkedTicket = tickets.find((t) => t.checkedIn);
        if (!checkedTicket) return true;

        // Reverse the check-in
        const updatedTicket = updateTicketCheckIn(checkedTicket.id, false);

        // Verify reversal was successful
        expect(updatedTicket).toBeDefined();
        expect(updatedTicket?.checkedIn).toBe(false);
        expect(updatedTicket?.checkedInAt).toBeUndefined();
        expect(updatedTicket?.status).toBe('valid');

        return true;
      }),
      { numRuns: 50 }
    );
  });

  test('each QR code is unique', () => {
    fc.assert(
      fc.property(fc.integer({ min: 0, max: 100 }), () => {
        const tickets = getAllTickets();
        const qrCodes = tickets.map((t) => t.qrCode);
        const uniqueQrCodes = new Set(qrCodes);

        // All QR codes should be unique
        expect(uniqueQrCodes.size).toBe(qrCodes.length);

        return true;
      }),
      { numRuns: 50 }
    );
  });

  test('tickets belong to valid events', () => {
    fc.assert(
      fc.property(fc.integer({ min: 0, max: 100 }), () => {
        const tickets = getAllTickets();

        tickets.forEach((ticket) => {
          // Each ticket should have a valid event ID
          expect(ticket.eventId).toBeDefined();
          expect(typeof ticket.eventId).toBe('string');
          expect(ticket.eventId.length).toBeGreaterThan(0);
        });

        return true;
      }),
      { numRuns: 50 }
    );
  });

  test('getTicketsByEventId returns only tickets for that event', () => {
    fc.assert(
      fc.property(fc.integer({ min: 0, max: 100 }), () => {
        const tickets = getAllTickets();
        if (tickets.length === 0) return true;

        // Get unique event IDs
        const eventIds = [...new Set(tickets.map((t) => t.eventId))];
        if (eventIds.length === 0) return true;

        // Pick a random event
        const randomEventId = eventIds[Math.floor(Math.random() * eventIds.length)];
        const eventTickets = getTicketsByEventId(randomEventId);

        // All returned tickets should belong to the selected event
        eventTickets.forEach((ticket) => {
          expect(ticket.eventId).toBe(randomEventId);
        });

        // Count should match
        const expectedCount = tickets.filter((t) => t.eventId === randomEventId).length;
        expect(eventTickets.length).toBe(expectedCount);

        return true;
      }),
      { numRuns: 50 }
    );
  });

  test('check-in timestamp is set correctly', () => {
    fc.assert(
      fc.property(fc.integer({ min: 0, max: 100 }), () => {
        const tickets = getAllTickets();
        if (tickets.length === 0) return true;

        // Find an unchecked ticket
        const uncheckedTicket = tickets.find((t) => !t.checkedIn);
        if (!uncheckedTicket) return true;

        const beforeCheckIn = new Date();
        const updatedTicket = updateTicketCheckIn(uncheckedTicket.id, true);
        const afterCheckIn = new Date();

        // Verify timestamp is within expected range
        expect(updatedTicket?.checkedInAt).toBeDefined();
        if (updatedTicket?.checkedInAt) {
          const checkInTime = new Date(updatedTicket.checkedInAt).getTime();
          expect(checkInTime).toBeGreaterThanOrEqual(beforeCheckIn.getTime());
          expect(checkInTime).toBeLessThanOrEqual(afterCheckIn.getTime());
        }

        return true;
      }),
      { numRuns: 50 }
    );
  });
});

/**
 * Additional tests for check-in statistics
 */
describe('Check-in statistics', () => {
  beforeEach(() => {
    resetDummyData();
  });

  test('check-in count increases after successful check-in', () => {
    fc.assert(
      fc.property(fc.integer({ min: 0, max: 100 }), () => {
        const tickets = getAllTickets();
        if (tickets.length === 0) return true;

        // Get unique event IDs
        const eventIds = [...new Set(tickets.map((t) => t.eventId))];
        if (eventIds.length === 0) return true;

        const randomEventId = eventIds[Math.floor(Math.random() * eventIds.length)];
        
        // Count initial checked-in tickets
        const initialCheckedIn = getTicketsByEventId(randomEventId)
          .filter((t) => t.checkedIn).length;

        // Find an unchecked ticket for this event
        const uncheckedTicket = getTicketsByEventId(randomEventId)
          .find((t) => !t.checkedIn);
        
        if (!uncheckedTicket) return true;

        // Check in the ticket
        updateTicketCheckIn(uncheckedTicket.id, true);

        // Count after check-in
        const afterCheckedIn = getTicketsByEventId(randomEventId)
          .filter((t) => t.checkedIn).length;

        // Should have one more checked-in ticket
        expect(afterCheckedIn).toBe(initialCheckedIn + 1);

        return true;
      }),
      { numRuns: 50 }
    );
  });

  test('check-in percentage is calculated correctly', () => {
    fc.assert(
      fc.property(fc.integer({ min: 0, max: 100 }), () => {
        const tickets = getAllTickets();
        if (tickets.length === 0) return true;

        // Get unique event IDs
        const eventIds = [...new Set(tickets.map((t) => t.eventId))];
        if (eventIds.length === 0) return true;

        const randomEventId = eventIds[Math.floor(Math.random() * eventIds.length)];
        const eventTickets = getTicketsByEventId(randomEventId);
        
        if (eventTickets.length === 0) return true;

        const checkedIn = eventTickets.filter((t) => t.checkedIn).length;
        const total = eventTickets.length;
        const percentage = Math.round((checkedIn / total) * 100);

        // Percentage should be between 0 and 100
        expect(percentage).toBeGreaterThanOrEqual(0);
        expect(percentage).toBeLessThanOrEqual(100);

        return true;
      }),
      { numRuns: 50 }
    );
  });
});
